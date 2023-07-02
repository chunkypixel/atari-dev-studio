// Provided under the GPL v2 license. See the included LICENSE.txt for details.

// 7800rmtfix - reads in either a SAP wrapped RMT file, or an RMT file, and 
// strips the RMT out and relocates it to an address (default $4000) for easier
// playing out of cart RAM.

// The program does what it says, but could use some source clean-up and 
// options.

// Format info: https://github.com/VinsCool/RASTER-Music-Tracker/blob/main/asm_src/Patch-16/rmtformat.txt

#define HEADER_VERSION_INFO "7800rmtfix 0.1"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

long int DESTADDR =  0x4000;

#pragma pack(push, 1)
struct rmtheader
{
    uint16_t vect1;
    uint16_t vect2_start;
    uint16_t vect3;

    unsigned char magic[4];	//RMT4 
    uint8_t track_len;
    uint8_t song_speed;
    uint8_t player_freq;
    uint8_t format_version_number;
    uint16_t pointer_to_instrument_pointers;
    uint16_t pointer_to_track_pointers_lo;
    uint16_t pointer_to_track_pointers_hi;
    uint16_t pointer_to_song;
};

struct upoint
{
    uint16_t pointer;
};

#pragma pack(pop)


int main (int argc, char **argv)
{
    long t, rmtstart, size;
    FILE *in, *out;
    char outname[1024];
    unsigned char *buffer;

    struct rmtheader *rmthead;
    struct upoint *myupoint;

    fprintf (stderr, "%s %s %s\n", HEADER_VERSION_INFO, __DATE__, __TIME__);

    if (argc == 1)
    {
	fprintf (stderr, "Usage:\n%s [RMT or SAP filename] [0xNNNN]\n", argv[0]);
	return (1);
    }
    strncpy (outname, argv[1], 1024);
    int len = strlen (outname);
    if ((len > 4) && (outname[len - 4] == '.'))
	outname[len - 4] = 0;
    strcat (outname, "_rmtfix.rmt");

    in = fopen (argv[1], "rb");
    if (in == NULL)
    {
	fprintf (stderr, "ERR: couldn't open file '%s' for reading.\n", argv[1]);
	return (2);
    }
    fseek (in, 0, SEEK_END);
    size = ftell (in);
    fseek (in, 0, SEEK_SET);
    if (size < 16)
    {
	fprintf (stderr, "ERR: file size of '%s' is %ld bytes.\n", argv[1], size);
	return (3);
    }
    buffer = malloc (size+6) + 6;
    if (fread (buffer, 1, size, in) == 0)
    {
	fprintf (stderr, "ERR: couldn't read from '%s'.\n", argv[1]);
	return (4);
    }
    fclose (in);

    if (argc==3)
        DESTADDR=strtol(argv[2],NULL,0); 

    // Search for our RMT4 header...
    for (t = 0; t < size - 10; t++)
    {
	if ((buffer[t] == 'R') && (buffer[t + 1] == 'M') && (buffer[t + 2] == 'T') && (buffer[t + 3] == '4'))
	    break;
    }
    if (t == size - 10)
    {
	fprintf (stderr, "ERR: no RMT4 header was found in '%s'.\n", argv[1]);
	return (5);
    }


    // Try to create our output file...
    out = fopen (outname, "wb");
    if (out == NULL)
    {
	fprintf (stderr, "ERR: couldn't open '%s' for writing.\n", outname);
	return (4);
    }

    fprintf (stderr, "locating RMT file to 0x%04lx\n",DESTADDR);

    rmtstart = t;

    rmthead = (void *) buffer + rmtstart - 6;

    // if we're here, the RMT was found. Now we can start relocating it's internal pointers...

    uint16_t memstart;
    uint16_t startfix, endfix;
    uint8_t *lo, *hi;
    uint16_t val;

    memstart = rmthead->vect2_start;

    // Relocate the instrument pointers, which are consecutive words...
    startfix = (rmthead->pointer_to_instrument_pointers) - memstart;
    endfix = (rmthead->pointer_to_track_pointers_lo) - memstart;
    for (t = startfix; t < endfix; t = t + 2)
    {
	myupoint = (void *) (rmthead->magic) + t;
	if ((myupoint->pointer)!=0)
	    myupoint->pointer = (myupoint->pointer) - memstart + DESTADDR;
    }

    // Relocate any GOTO commands in the song data...
    startfix = (rmthead->pointer_to_song) - memstart + rmtstart;
    endfix = size - 3;
    for (t = startfix; t < endfix; t = t + 1)
    {
        if ((buffer[t]==0xFE)&&(!((t-startfix)&3)))
        {
	    lo = buffer + t + 2;
	    hi = buffer + t + 3;
	    val = *lo + (*hi << 8);
	    val = val - memstart + DESTADDR;
	    *lo = val & 255;
	    *hi = (val >> 8) & 255;
        }
    }

    // Relocate the track pointers, which are split into 2 separate LO and HI byte tables
    startfix = (rmthead->pointer_to_track_pointers_lo) - memstart;
    endfix = (rmthead->pointer_to_track_pointers_hi) - memstart;
    for (t = startfix; t < endfix; t++)
    {
	lo = buffer + rmtstart + t;
	hi = buffer + rmtstart + t + endfix - startfix;

	if ((*lo == 0) && (*hi == 0))	// don't relocate 0x0000 flag
	    continue;

	val = *lo + (*hi << 8);
	val = val - memstart + DESTADDR;
	*lo = val & 255;
	*hi = (val >> 8) & 255;
    }

    // Relocate the pointers to the tables who's contents we just relocated earlier...
    rmthead->pointer_to_instrument_pointers = (rmthead->pointer_to_instrument_pointers) - memstart + DESTADDR;
    rmthead->pointer_to_track_pointers_lo = (rmthead->pointer_to_track_pointers_lo) - memstart + DESTADDR;
    rmthead->pointer_to_track_pointers_hi = (rmthead->pointer_to_track_pointers_hi) - memstart + DESTADDR;
    rmthead->pointer_to_song = (rmthead->pointer_to_song) - memstart + DESTADDR;

    // Relocate the pointers at the start of the RMT. We save this for last
    // because we used the old vector values in code earlier.
    rmthead->vect3 = rmthead->vect3 - rmthead->vect2_start + DESTADDR;
    rmthead->vect2_start = DESTADDR;
    rmthead->vect1 = 0xffff;

    fwrite (buffer + rmtstart - 6, 1, size - rmtstart + 6, out);
    fclose (out);
}
