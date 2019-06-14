#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>

//	7800makecc2 - a simple app to convert a 144k bin or a78 file to  a cc2 bin
//			by Michael Saarna (aka RevEng@AtariAge)
//
//      A78 and plain 144k ROMs have 16k banks in this order: 1 2 3 4 5 6 7 8 9
//      CC2 144k ROMs have 16k banks in this order:           2 3 4 5 6 7 8 9 1

void usage(char *binaryname);
void prerror(char *format, ...);

int main(int argc, char **argv)
{
	char filenamein[1024];
	char filenameout[1028];
	FILE *in, *out;
	int bank;
 	char bankbuffer[16384];
	long gamesize;

	fprintf(stderr,"7800makecc2 v0.1\n");

	if ((argc<2) || (argv[argc-1][0]=='-')) 
		usage(argv[0]);
	strncpy(filenamein,argv[argc-1],1024);
	strncpy(filenameout,argv[argc-1],1024);
	strcat(filenameout,".CC2");

	in=fopen(filenamein,"rb");
	if(in==NULL)
		prerror("Couldn't open '%s' for reading.\n",filenamein); 

	//open the input file and get the size...
	fseek(in, 0, SEEK_END);
        gamesize = ftell(in);

	if( gamesize==0 )
		prerror("The file size of %s is 0 bytes.\n",filenamein); 
	if (gamesize==(144*1024)+128) // looks like this file has an A78 header
		fseek(in, 128+16384, SEEK_SET); //rewind to bank1
	else if (gamesize==144*1024)
        	fseek(in, 0+16384, SEEK_SET);   //rewind to bank1
	else
	{
		printf("  The ROM '%s' is compatible with CC2.\n",filenamein); 
		exit(0);
	}

	out=fopen(filenameout,"wb");
	if(out==NULL)
		prerror("Couldn't open '%s' for writing.\n",filenameout); 

	for(bank=0;bank<9;bank++)
	{
		if(bank==8)
		{
			if (gamesize==(144*1024)+128)
				fseek(in, 128, SEEK_SET); //rewind to start
			else if (gamesize==144*1024)
        			fseek(in, 0, SEEK_SET);   //rewind to start
		}
		if(fread(bankbuffer,16384,1,in)<1)
			prerror("Problem reading from '%s'.\n",filenamein); 
		if(fwrite(bankbuffer,16384,1,out)<1)
			prerror("Problem writing to '%s'.\n",filenameout); 
	}

	fclose(in);
	fclose(out);
	
	printf("  Created ROM '%s' for CC2 compatibility.\n",filenameout); 

}

void usage(char *binaryname)
{
        fprintf(stderr,"Usage:\n\n");
        fprintf(stderr,"\"%s FILENAME\", with no options.\n\n",binaryname);
        exit(0);
}

void prerror(char *format, ...)
{
        char buffer[1024];
        va_list args;
        va_start (args, format);
        vsnprintf (buffer, 1023, format, args);
        fprintf(stderr, "  *** ERROR: %s\n", buffer);
        va_end(args);
        exit(1);
}

