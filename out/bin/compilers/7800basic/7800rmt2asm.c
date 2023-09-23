// Provided under the GPL v2 license. See the included LICENSE.txt for details.
// 7800rmt2asm - Reads in either a SAP wrapped RMT file, or an RMT file, and
// creates relocatable assembly code from it.

// The program does what it says, but could use some source clean-up and 
// options.

// Format info: https://github.com/VinsCool/RASTER-Music-Tracker/blob/main/asm_src/Patch-16/rmtformat.txt

#define HEADER_VERSION_INFO "7800rmt2asm 0.1"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

#pragma pack(push, 1)
struct rmtheader {
	uint16_t vect1;
	uint16_t vect2_start;
	uint16_t vect3;

	unsigned char magic[4]; //RMT4 
	uint8_t  track_len;
	uint8_t  song_speed;
	uint8_t  player_freq;
	uint8_t  format_version_number;
	uint16_t pointer_to_instrument_pointers;
	uint16_t pointer_to_track_pointers_lo;
	uint16_t pointer_to_track_pointers_hi;
	uint16_t pointer_to_song;
};

struct upoint {
	uint16_t pointer;
};

#pragma pack(pop)


int main (int argc, char **argv)
{
	long t,rmtstart,size;
	FILE *in,*out;
	char outname[1024];
	unsigned char *buffer;

	struct rmtheader *rmthead;
	struct upoint *myupoint;

	uint8_t *lo,*hi;
	uint16_t val;

	fprintf(stderr, "%s %s %s\n", HEADER_VERSION_INFO, __DATE__, __TIME__);

	if(argc==1)
	{
		fprintf(stderr,"Usage:\n%s [RMT or SAP filename]\n",argv[0]);
		return(1);
	}
	strncpy(outname,argv[1],1024);
	int len=strlen(outname);
	// strip the first extension found in the original filename
	for(t=len;t>0;t--)
	{
		if(outname[t]=='.')
		{	
			outname[t]=0; 
			break;
		}
		if((outname[t]=='/')||(outname[t]=='/'))
			break;
	}
	strcat(outname,".rmta");

	in=fopen(argv[1],"rb");
	if(in==NULL)
	{
		fprintf(stderr,"ERR: couldn't open file '%s' for reading.\n",argv[1]);
		return(2);
	}
	fseek(in,0,SEEK_END);
	size=ftell(in);
	fseek(in,0,SEEK_SET);
	if(size<16)
	{
		fprintf(stderr,"ERR: file size of '%s' is %ld bytes.\n",argv[1],size);
		return(3);
	}
	buffer=malloc(size+6);
	if(fread(buffer+6,1,size,in) == 0)
	{
		fprintf(stderr,"ERR: couldn't read from '%s'.\n",argv[1]);
		return(4);
	}
	fclose(in);

	// Search for our RMT4 header...
	for(t=0;t<size-10;t++)
	{
		if ( (buffer[t]=='R') && (buffer[t+1]=='M') && (buffer[t+2]=='T') && (buffer[t+3]=='4'))
			break;
	}
	if(t==size-10)
	{
		fprintf(stderr,"ERR: no RMT4 header was found in '%s'.\n",argv[1]);
		return(5);
	}

	// Try to create our output file...
	out=fopen(outname,"wb");
	if(out==NULL)
	{
		fprintf(stderr,"ERR: couldn't open '%s' for writing.\n",outname);
		return(4);
	}

	rmtstart=t;
	rmthead=(void *)buffer+rmtstart-6;

	uint16_t memstart;
	uint16_t startrange,endrange;

	// If the RMT4 file doesn't have the load vector, than calculate the RMT load location.
	// This isn't normally a problem, but rmt files prepped for 7800 may have the vectors
	// stripped, since it doesn't use them.
	if((unsigned char *)rmthead<buffer)
		memstart = rmthead->pointer_to_instrument_pointers - 0x10;
	else
		memstart = rmthead->vect2_start;
	int i;

	// The header...
	fprintf(out,";RMTA - This line is required for 7800basic autodetection. Don't remove.\n");
	fprintf(out,";#### %s - converted by %s %s %s\n\n", outname, HEADER_VERSION_INFO, __DATE__, __TIME__);
	fprintf(out,".RMTSTART SET .\n");
	fprintf(out,"\n");
	fprintf(out,"\n");
	fprintf(out," ; #### RMT header...\n");
	fprintf(out,"   .byte \"RMT4\"              ; magic\n");
	fprintf(out,"   .byte $%02x                 ; tracklen\n",rmthead->track_len);
	fprintf(out,"   .byte $%02x                 ; song speed\n",rmthead->song_speed);
	fprintf(out,"   .byte $%02x                 ; player freq\n",rmthead->player_freq);
	fprintf(out,"   .byte $%02x                 ; format version number\n",rmthead->format_version_number);
	fprintf(out,"   .word (.RMTSTART+$%04x)   ; pointer to instrument pointers\n",(rmthead->pointer_to_instrument_pointers)-memstart);
	fprintf(out,"   .word (.RMTSTART+$%04x)   ; pointer to track pointers, lo\n",(rmthead->pointer_to_track_pointers_lo)-memstart);
	fprintf(out,"   .word (.RMTSTART+$%04x)   ; pointer to track pointers, hi\n",(rmthead->pointer_to_track_pointers_hi)-memstart);
	fprintf(out,"   .word (.RMTSTART+$%04x)   ; pointer to song\n",(rmthead->pointer_to_song)-memstart);
	fprintf(out,"\n");

	fprintf(out," ; #### Instrument Pointer Table...\n");


	// output the instrument pointers, which are consecutive words...
	startrange=(rmthead->pointer_to_instrument_pointers)-memstart;
	endrange=(rmthead->pointer_to_track_pointers_lo)-memstart;
	for(t=startrange;t<endrange;t=t+2)
	{
		myupoint=(void *)(rmthead->magic)+t;
		if((myupoint->pointer)!=0)
			fprintf(out,"   .word (.RMTSTART+$%04x)\n",(myupoint->pointer) - memstart);
		else
			fprintf(out,"   .word (     $0000     )\n");
	}
	fprintf(out,"\n\n");

	// output the track pointers, which are split into 2 separate LO and HI byte tables
	fprintf(out," ; #### Track Pointer Table, Lo...\n");
	startrange=(rmthead->pointer_to_track_pointers_lo)-memstart;
	endrange=(rmthead->pointer_to_track_pointers_hi)-memstart;
	for(t=startrange;t<endrange;t++)
	{
		lo = buffer+rmtstart+t;
		hi = buffer+rmtstart+t+endrange-startrange;

		if ((*lo == 0) && (*hi == 0)) // don't relocate 0x0000 flag
		{
			fprintf(out," .byte $00\n");
			continue;
		}

		val = *lo + (*hi << 8) - memstart;
		fprintf(out," .byte <(.RMTSTART+$%04x)\n",val);
	}

	fprintf(out,"\n");

	fprintf(out," ; #### Track Pointer Table, Hi...\n");
	startrange=(rmthead->pointer_to_track_pointers_lo)-memstart;
	endrange=(rmthead->pointer_to_track_pointers_hi)-memstart;
	for(t=startrange;t<endrange;t++)
	{
		uint8_t *lo,*hi;
		uint16_t val;
		lo = buffer+rmtstart+t;
		hi = buffer+rmtstart+t+endrange-startrange;

		if ((*lo == 0) && (*hi == 0)) // don't relocate 0x0000 flag
		{
			fprintf(out," .byte $00\n");
			continue;
		}

		val = *lo + (*hi << 8) - memstart;
		fprintf(out," .byte >(.RMTSTART+$%04x)\n",val);
	}

	fprintf(out,"\n");

	fprintf(out," ; #### Track+Instrument Data...\n");
	startrange=endrange+(endrange-startrange); // past the end of the trackpointer table
	endrange=(rmthead->pointer_to_song)-memstart;
	fprintf(out,"   .byte ");
        i=0;
	for(t=startrange;t<endrange;t++)
	{
                if(i>0)
			fprintf(out,",");
		fprintf(out,"$%02x",buffer[t+rmtstart]);
		i++;
		if((i==16)&&((t+2)<endrange))
		{
			fprintf(out,"\n   .byte ");
			i=0;
		}
	}
	fprintf(out,"\n\n");

	fprintf(out," ; #### Song Data...\n");
	// ...
	startrange=(rmthead->pointer_to_song)-memstart+rmtstart;
	endrange=size-2;

	fprintf(out,"   .byte ");
        i=0;
	for(t=startrange;t<endrange;t++)
	{
		// if the 4 byte command starts with 0xFE it's a GOTO
		if( (buffer[t]==0xFE) && (!((t-startrange)&3)))
		{
			val = buffer[t+2] + (buffer[t+3] << 8) - memstart;
			fprintf(out,"\n");
			fprintf(out,"   .word $%02XFE,(.RMTSTART+$%04x) ; GOTO",buffer[t+1],val);
			t += 3;
			i = 16;
			continue;
		}
		if((i==16)&&((t+1)<endrange))
		{
			fprintf(out,"\n   .byte ");
			i=0;
		}
                if(i>0)
			fprintf(out,",");
		fprintf(out,"$%02x",buffer[t]);
		i++;
	}
	fprintf(out,"\n\n");

	fclose(out);
}
