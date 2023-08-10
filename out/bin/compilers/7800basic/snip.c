#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>

#define SNIP_VERSION_INFO "snip 0.1"

// snip - a simple utility that snips sections out of binary files, based
// on magic strings it finds. The magic strings determine the start, end,
// filename the snip should be given.
//
// The magic strings are formatted in DASM thusly...
//
// .byte "SNIPStart",0,"snipfilename",0 ; *** start of snip
// .byte "SNIPEnd",0                    ; *** end of snip
//


void usage (char *binaryname);
void prerror (char *format, ...);
void prwarn (char *format, ...);

char filename[1024];
char snipfilename[1024];
long binsize;
unsigned char *binbuffer;

int main (int argc, char **argv)
{
    FILE *in, *out;
    int snipcount = 0;
    long t, s;

    fprintf (stderr, "%s %s %s\n\n", SNIP_VERSION_INFO, __DATE__, __TIME__);

    if ((argc < 2) || (argv[argc - 1][0] == '-'))
	usage (argv[0]);

    strncpy (filename, argv[argc - 1], 1024);

    in = fopen (filename, "rb");
    if (in == NULL)
	prerror ("Couldn't open '%s' for reading.\n", filename);

    //open the file and get the size...
    fseek (in, 0, SEEK_END);
    binsize = ftell (in);
    fseek (in, 0, SEEK_SET);	//rewind

    if (binsize == 0)
	prerror ("The file size of %s is 0 bytes.\n", filename);

    binbuffer = malloc (binsize);
    if (binbuffer == NULL)
	prerror ("Couldn't allocate %d bytes to hold bin\n", binsize);

    if (fread (binbuffer, 1, binsize, in) == 0)
	prerror ("Couldn't read from %s\n", filename);

    fprintf (stderr, "...reading  '%s'\n", filename);

    for (t = 0; t < (binsize - 13); t++)
    {
	if (memcmp ("SNIPStart", (char *)binbuffer + t, 10) == 0)
	{
	    t = t + 10;
	    strncpy (snipfilename, binbuffer + t, 1023);
	    out = fopen (snipfilename, "wb");
	    if (out == NULL)
		prerror ("Couldn't open '%s' for writing.\n", snipfilename);
	    fprintf (stderr, "...snipping '%s'\n", snipfilename);
	    t = t + strlen (binbuffer + t) + 1;
	    for (s = t; s < (binsize - 13); s++)
		if (memcmp ("SNIPEnd", binbuffer + s, 7) == 0)
		    break;
	    fwrite (binbuffer + t, s - t, 1, out);
	    fclose (out);
	    t = s;
	}
    }
    fprintf (stderr, "...done\n");
}

void prerror (char *format, ...)
{
    char buffer[1024];
    va_list args;
    va_start (args, format);
    vsnprintf (buffer, 1023, format, args);
    fprintf (stderr, "*** ERROR: %s\n", buffer);
    va_end (args);
    exit (1);
}

void prwarn (char *format, ...)
{
    char buffer[1024];
    va_list args;
    va_start (args, format);
    vsnprintf (buffer, 1023, format, args);
    fprintf (stderr, "*** WARNING: %s\n", buffer);
    va_end (args);
}

void usage (char *binaryname)
{
    fprintf (stderr, "Usage:\n");
    fprintf (stderr, "    %s FILENAME\n    where FILENAME is a binary input file containing SNIP marks\n", binaryname);
    fprintf (stderr, "\n");
    fprintf (stderr, "Sample SNIP marks in dasm format:\n");
    fprintf (stderr, "    .byte \"SNIPStart\",0,\"snipfilename\",0\n");
    fprintf (stderr, "    [binary here data]\n");
    fprintf (stderr, "    .byte \"SNIPEnd\n");
    exit (0);
}
