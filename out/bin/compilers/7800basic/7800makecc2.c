// Provided under the GPL v2 license. See the included LICENSE.txt for details.

#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>

//      7800makecc2 - a simple app to convert a 144k bin or a78 file to a 
//                    Cuttle Cart 3 format 144k bin.
//                    by Michael Saarna (aka RevEng@AtariAge)
//
//      A78 and plain 144k ROMs have 16k banks in this order: 1 2 3 4 5 6 7 8 9
//      CC2 144k ROMs have 16k banks in this order:           2 3 4 5 6 7 8 9 1

void usage (char *binaryname);
void prerror (char *format, ...);

int main (int argc, char **argv)
{
    char filenamein[1024];
    char filenameout1[1028];
    char filenameout2[1028];
    FILE *in, *out1, *out2;
    int bank, t;
    char bankbuffer[16384];
    long gamesize;

    fprintf (stderr, "7800makecc2 v0.1\n");

    if ((argc < 2) || (argv[argc - 1][0] == '-'))
	usage (argv[0]);
    strncpy (filenamein, argv[argc - 1], 1024);
    strncpy (filenameout1, argv[argc - 1], 1024);
    strncpy (filenameout2, argv[argc - 1], 1024);
    strcat (filenameout1, ".CC2");
    strcat (filenameout2, ".versa");

    in = fopen (filenamein, "rb");
    if (in == NULL)
	prerror ("Couldn't open '%s' for reading.\n", filenamein);

    //open the input file and get the size...
    fseek (in, 0, SEEK_END);
    gamesize = ftell (in);

    if (gamesize == 0)
	prerror ("The file size of %s is 0 bytes.\n", filenamein);
    if (gamesize == (144 * 1024) + 128)	// looks like this file has an A78 header
	fseek (in, 128 + 16384, SEEK_SET);	//rewind to bank1
    else if (gamesize == 144 * 1024)
	fseek (in, 0 + 16384, SEEK_SET);	//rewind to bank1
    else
    {
	printf ("  The ROM '%s' is compatible with CC2.\n", filenamein);
	exit (0);
    }

    out1 = fopen (filenameout1, "wb");
    if (out1 == NULL)
	prerror ("Couldn't open '%s' for writing.\n", filenameout1);
    out2 = fopen (filenameout2, "wb");
    if (out2 == NULL)
	prerror ("Couldn't open '%s' for writing.\n", filenameout2);

    for (bank = 0; bank < 9; bank++)
    {
	if (bank == 8)
	{
	    if (gamesize == (144 * 1024) + 128)
		fseek (in, 128, SEEK_SET);	//rewind to start
	    else if (gamesize == 144 * 1024)
		fseek (in, 0, SEEK_SET);	//rewind to start
	}
	if (fread (bankbuffer, 16384, 1, in) < 1)
	    prerror ("Problem reading from '%s'.\n", filenamein);
	if (fwrite (bankbuffer, 16384, 1, out1) < 1)
	    prerror ("Problem writing to '%s'.\n", filenameout1);
	if (fwrite (bankbuffer, 16384, 1, out2) < 1)
	    prerror ("Problem writing to '%s'.\n", filenameout2);
    }

    //versa is identical to cc2, but needs the first bank duped for padding
    for (t = 0; t < 7; t++)
	if (fwrite (bankbuffer, 16384, 1, out2) < 1)
	    prerror ("Problem writing to '%s'.\n", filenameout2);

    fclose (in);
    fclose (out1);
    fclose (out2);

    printf ("  Created ROM '%s' for CC2 compatibility.\n", filenameout1);
    printf ("  Created ROM '%s' for versa compatibility.\n", filenameout2);

}

void usage (char *binaryname)
{
    fprintf (stderr, "Usage:\n\n");
    fprintf (stderr, "\"%s FILENAME\", with no options.\n\n", binaryname);
    exit (0);
}

void prerror (char *format, ...)
{
    char buffer[1024];
    va_list args;
    va_start (args, format);
    vsnprintf (buffer, 1023, format, args);
    fprintf (stderr, "  *** ERROR: %s\n", buffer);
    va_end (args);
    exit (1);
}
