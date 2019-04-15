// BMP7800 - a utility for converting BMP graphics to Assembly source code
// orginal C# code (c)2016 by Bob DeCrescenzo
// translation to C and added bugs by Mike Saarna

#ifndef TRUE
#define TRUE (1==1)
#endif
#ifndef FALSE
#define FALSE (1==0)
#endif

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <assert.h>
#include <stdint.h>
#include <stdarg.h>
#include <ctype.h>

#define VERSION_INFO "BMP7800 1.0"

void DisplayUsage();

char* ProgramName;

int main(int argc, char **argv)
{
	int t;

	ProgramName = argv[0];

	//7800 Display Variables
	int iZoneScanlines = 16;
	char *sStartAddress = NULL;
	char *sEndAddress = NULL;
	char *sDisplayMode = NULL;
	char *sColorOrder = NULL;

	//Input and Output file Variables
	char *sInputFile = NULL;
	char *sOutputFile = NULL;
	FILE *ifs = NULL;
	int bAppendFile = FALSE;
	int bWriteHeader = TRUE;
	int iCurrentLine = -1;
	int bFinal = FALSE;

#pragma pack(push, 1)
	//Bitmap Variables
	struct BMPHeader
	{
		uint16_t BMPIdent;
		uint32_t BMPFileSize;
		uint16_t BMPReserved1;
		uint16_t BMPReserved2;
		uint32_t BMPImageOffset;
		uint32_t BMPInfoHeaderSize;
		uint32_t BMPWidthInPixels;
		uint32_t BMPHeightInPixels;
		uint16_t BMPColorPlanes;
		uint16_t BMPBitsPerPixel;
		uint32_t BMPCompressionMethod;
		uint32_t BMPImageSize;
		uint32_t BMPHorizontalResolution;
		uint32_t BMPVerticalResolution;
		uint32_t BMPNumberOfColors;
		uint32_t BMPNumberOfImportantColors;
	};
#pragma pack(pop)

	unsigned char *BMPPaletteData = NULL;
	unsigned char *BMPImageData = NULL;

	


	fprintf(stderr,"\n%s %s %s\n",VERSION_INFO,__DATE__,__TIME__);

	for(t=1;t<argc;t++)
	{
		if(	(argv[t]==NULL) ||
			(argv[t][0]==0) ||
			(argv[t][1]==0) ||
			((argv[t][0]!='-')&&(argv[t][0]!='/')) )
		{
			fprintf(stderr," Error: illegal argument \"%s\"",argv[t]);
			DisplayUsage();
		}
		switch(toupper(argv[t][1]))
		{
			case 'A':
				bAppendFile = TRUE; // We are appending to an existing file
				bWriteHeader = FALSE; // This will get changed if the file does not already exist
				break;
			case 'C':
				sColorOrder = argv[t]+2;    // Color order (i.e. -c2,3,1 to force color palette index '2' to be the first color, etc.)
				break;
			case 'F':
				bFinal = TRUE;
				break;
			case 'M':
				sInputFile = argv[t]+3; // Absolute Path and Name of Input File (skipping the ":" after the "-I")
				break;
			case 'O':
				sOutputFile = argv[t]+3; // Absolute Path and Name of Output File (skipping the ":" after the "-O")
				break;
			case 'S':
				sStartAddress = argv[t]+2; // Starting Bitmap X,Y location (for multi-resolution bitmaps)
				break;
			case 'E':
				sEndAddress = argv[t]+2;   // Ending Bitmap X,Y location (for multi-resolution bitmaps)
				break;
			case 'Z':
				iZoneScanlines = atoi(argv[t]+2);
				break;

		}
	}

	// Do some sanity checking...
	// See if the user sepcified the input bitmap file
	if ((sInputFile==NULL)||(sInputFile[0]==0))
	{
		fprintf(stderr,"Error: no Input File given\n");
		DisplayUsage();
	}

	// See if the user specified the output include file
	if ((sOutputFile==NULL)||(sOutputFile[0]==0))
	{
		fprintf(stderr,"Error: no Output File given\n");
                DisplayUsage();
	}

	// Make sure the 7800 Mode selected is a valid one
	if ( 	(strstr(sDisplayMode,"160A")==NULL) && 
		(strstr(sDisplayMode,"160B")==NULL) &&
		(strstr(sDisplayMode,"320A")==NULL) &&
		(strstr(sDisplayMode,"320B")==NULL) &&
		(strstr(sDisplayMode,"320C")==NULL) &&
		(strstr(sDisplayMode,"320D")==NULL) )
	{
		fprintf(stderr,"Error: Invalid screen resolution given\n");
                DisplayUsage();
	}

	// Do a sanity check for the number of zone lines
	if ( 	(iZoneScanlines != 32) && // 32 is a special case :)
		((iZoneScanlines < 1) || (iZoneScanlines > 16)) )
	{
		fprintf(stderr,"Error: invalid number of scanlines per zone; only 1-16 are allowed\n");
                DisplayUsage();
	}

	// If we are appending, see if the Output file exists already
	if (bAppendFile)
	{
		FILE *ASMin;
		ASMin=fopen(sOutputFile,"r");
		if (ASMin==NULL)
		{
			fprintf(stderr,"Warning: Append mode chosen but file does not exist.  Creating file.\n");
			bWriteHeader = TRUE;
		}
		else
		{
			
		}
	}
		
}

void DisplayUsage()
{
	fprintf(stderr,"Usage: %s -I:<Input File> -O:<Output File>\n",ProgramName);
	fprintf(stderr,"  [-S Starting X,Y Location (Default start of bitmap)]\n");
	fprintf(stderr,"  [-E Ending X,Y Location (Default end of bitmap)]\n");
	fprintf(stderr,"  [-Z Number of scan lines in Zone (Default 16)]\n");
	fprintf(stderr,"  [-M:Mode (Default 160A-Can use '160A','160B','320A','320B','320C','320D')\n");
	fprintf(stderr,"  [-C Force Color Palette Index order (separated by commas)]\n");
	fprintf(stderr,"  [-A Append Mode (used with multi-mode bitmaps)]\n");
	fprintf(stderr,"  [-F Final Mode (used in conjunction with '-A' for final append)]\n\n");
	exit(1);
}
