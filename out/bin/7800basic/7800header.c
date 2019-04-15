#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <assert.h>
#include <stdint.h>
#include <stdarg.h>
#include <ctype.h>

//	7800header - a simple app to generate/interrogate a a78 header.
//			Michael Saarna (aka RevEng@AtariAge)

#define HEADER_VERSION_INFO "7800header 0.7"

void usage(char *binaryname);
uint32_t phtole32(uint32_t value);
void loadfile(char *filename);
void report(void);
void setupheaderdefaults(void);
void setunset(char *command);
void writea78(char *filename);
void prerror(char *format, ...);
void prwarn(char *format, ...);
void trimnewline(char *string);

struct header7800 {

	unsigned char version;		//0

	char console[16];		//1-16

	char gamename[32];		//17-48

	unsigned char romsize1;		//49
	unsigned char romsize2;		//50
	unsigned char romsize3;		//51
	unsigned char romsize4;		//52

	unsigned char carttype1;	//53
	unsigned char carttype2;	//54

	unsigned char controller1;	//55
	unsigned char controller2;	//56

	unsigned char tvformat;		//57
	unsigned char saveperipheral;	//58

	unsigned char unused1[4];	//59-62

	unsigned char xm;		//63
	
	unsigned char unused2[36];	//64-99

	char headertext[28];		//100-127
	} myheader;

long gamesize;
uint32_t headergamesize;
char *rombuffer;

int overwrite=0;
int printinfo=0;
char filename[1024];

int main(int argc, char **argv)
{
	FILE *in;
	char usercommand[1024];
	int c;
	opterr = 0;


	fprintf(stderr,"\n%s %s %s\n",HEADER_VERSION_INFO,__DATE__,__TIME__);

	assert(sizeof(myheader)==128);

	if ((argc<2) || (argv[argc-1][0]=='-')) 
		usage(argv[0]);
	strncpy(filename,argv[argc-1],1024);

	in=fopen(filename,"rb");
	if(in==NULL)
		prerror("Couldn't open '%s' for reading.\n",filename); 

	//open the file and get the size...
	fseek(in, 0, SEEK_END);
        gamesize = ftell(in);
        fseek(in, 0, SEEK_SET); //rewind

	if( gamesize==0 )
		prerror("The file size of %s is 0 bytes.\n",filename); 

	if(gamesize>128)
	fread(&myheader,1,128,in);

	if(strncmp(myheader.console,"ATARI7800",9)==0)
		gamesize=gamesize-128;
	else
	{
        	fseek(in, 0, SEEK_SET); //rewind
		setupheaderdefaults();
	}

	if((gamesize & 0x0FFF)!=0)
		prwarn("The file size of %s isn't correct.\n",filename); 

	rombuffer=malloc(gamesize);
	if(rombuffer==NULL)
		prerror("Couldn't allocate %d bytes to hold rom\n",gamesize);

	fread(rombuffer,128,(gamesize/128),in);

	// get options - mainly used for reading in header configuration setup from a file
	while ((c = getopt (argc, argv, "f:op")) != -1)
	{
		switch (c)
		{
			case 'f': // load options from configuration file
				loadfile(optarg);
				writea78(filename);
				exit(0);
				break;
			case 'o': // overwrite existing A78 file
				overwrite=1;
				break;
			case 'p': // print header info and exit
				printinfo=1;
				break;
           	}
	}

	//fix bits that shouldn't be set in the header
	if(printinfo==0)
	{
		if (myheader.controller1>4)
			myheader.controller1=1;
		if (myheader.controller2>4)
			myheader.controller2=1;
		myheader.tvformat &= 1;
		myheader.saveperipheral &= 3;
		myheader.xm &= 1;
	}


	for(;;) //loop infinitly through the report until the user explicitly exits
	{
		#ifdef _WIN32
			if(printinfo==0)
				system("cls");
		#else
			if(printinfo==0)
				system("clear");
		#endif

		report();
		if(printinfo!=0)
			exit(0);
		printf("Commands: \"save\"           Save the A78 file and exit.\n");
		printf("          \"set [option]\"   Set one of the options.\n");
		printf("          \"unset [option]\" Unset one of the options.\n");
		printf("          \"name game name\" Set the game name in the header.\n");
		printf("          \"exit\"           Exit the utility. Unsaved changes will be lost.\n");
		printf("\n");
		printf("Options:  rom@4000 ram@4000 bank6@4000 pokey@450 pokey@4000 mram@4000\n");
		printf("          supergame supergameram supergamebankram absolute activision\n");
		printf("          tvpal tvntsc savekey hsc xm joystick1 joystick2 lightgun1 lightgun2\n");
		printf("          paddle1 paddle2 trackball1 trackball2\n");
		printf("\n> ");

		if (fgets(usercommand, 1024, stdin))
		{
			trimnewline(usercommand);
			if(strncmp(usercommand,"save",4)==0)
			{
				writea78(filename);
				exit(0);
			}
			else if(strncmp(usercommand,"name ",5)==0)
			{
				memset(myheader.gamename,0,32);
				strncpy(myheader.gamename,usercommand+5,32);
			}
			else if( (strncmp(usercommand,"ex",2)==0) || (usercommand[0]=='x') || (usercommand[0]=='q'))
			{
				exit(0);
			}
			else
			{
				setunset(usercommand);
			}
		}
	}
}

char * strrstr(char *haystack, char *needle)
{
	if((haystack==NULL)||(needle==NULL))
		return(NULL);
	char *last=haystack;
	while(*last!=0)
		last++;
	last--;
	while(last>haystack)
	{
		if(strncasecmp(last,needle,strlen(needle))==0)
			return(last);
		last--;
	}
	return(NULL);
}

void trimnewline(char *string)
{
	if(string==NULL)
		return;
	while(*string!=0)
	{
		if((*string=='\r')||(*string=='\n'))
		{
			*string=0;
			return;
		}
		string++;
	}
	return;
}

void writea78(char *filename)
{
	char newname[1024];
	char *ext;
	ext=strrstr(filename,".bin");
	if(ext!=NULL)
	{
		strcpy(ext,".a78");
	}
	FILE *in,*out;
	if(overwrite==0)
	{
		in=fopen(filename,"r");
		if(in!=NULL)
		{
			fclose(in);
			//the destination file exists. rename it to back it up.
			strcpy(newname,filename);
			strcat(newname,".backup");
			rename(filename,newname);
		}
	}
	out=fopen(filename,"wb");
	if(out==NULL)
		prerror("error opening file '%s' for writing.",filename);
	if(fwrite(&myheader,1,128,out)!=128)
		prerror("error while writing a78 header out.\n");
	if(fwrite(rombuffer,128,(gamesize/128),out)!=(gamesize/128))
		prerror("error while writing a78 file out.\n");
	fclose(out);
}

void setupheaderdefaults()
{
	headergamesize = phtole32(gamesize);

	// a78 header format version...
	myheader.version = 1;

	strncpy(myheader.console,"ATARI7800        ",16);
	strncpy(myheader.gamename,"My Game                          ",32);

	myheader.romsize1 = (headergamesize>>24) & 0xff;
	myheader.romsize2 = (headergamesize>>16) & 0xff;
	myheader.romsize3 = (headergamesize>>8)  & 0xff;
	myheader.romsize4 = (headergamesize>>0)  & 0xff;

	// bit 0    = pokey at $4000
	// bit 1    = supergame bank switched
	// bit 2    = supergame ram at $4000
	// bit 3    = rom at $4000
	// bit 4    = bank 6 at $4000
	// bit 5    = supergame banked ram
	// bit 6    = pokey at $450
        // bit 7    = mirror ram at $4000
	// bit 8-15 = special
	myheader.carttype1 = 0;
	myheader.carttype2 = 0;

	// controller 0=none, 1=joystick, 2=light gun
	myheader.controller1 = 1;
	myheader.controller2 = 1;

	// tv format 0=NTSC 1=PAL
	myheader.tvformat = 0;

	// save peripheral 0=none, 1=hsc, 2=savekey/avox
	myheader.saveperipheral = 0;

	memset(myheader.unused1,0,4);

	myheader.xm = 0;

	memset(myheader.unused2,0,36);
	
	// some expected static text...
	strncpy(myheader.headertext,"ACTUAL CART DATA STARTS HERE",28);


}

void setunset(char *command)
{
	char verb[1024],noun[1024];
	int set,unset;
	int t,s;
	set=0;unset=0;
	if(command==NULL)
		return;
	while(*command==' ') // suck up any leading spaces, just in case
		command++;
	for(t=0;command[t]!=0;t++)
		if((command[t]=='\n')||(command[t]=='\r'))
			command[t]=0;

	s=0;
	for(t=0;command[t]!=0;t++)
	{
		if(command[t]==' ')
		{
			verb[s]=0;
			t=t+1;
			break;
		}
		verb[s]=tolower(command[t]);
		s=s+1;
	}
	if(command[t]==0)
		return;
	s=0;
	for(;command[t]!=0;t++)
	{
		if(command[t]==' ')
		{
			noun[s]=0;
			t=t+1;
			break;
		}
		noun[s]=tolower(command[t]);
		s=s+1;
	}
	noun[s]=0;

	if(strcmp(verb,"set")==0)
		set=1;
	if(strcmp(verb,"unset")==0)
		unset=1;
	if((set==0)&&(unset==0))
		return; //we only handle setting and unsetting flags here

	if(strcmp(noun,"supergame")==0)
	{
		if(set)
		{
			myheader.carttype2 = myheader.carttype2 | 2;
			setunset("unset activision");
			setunset("unset absolute");
		}
		else
		{
			myheader.carttype2 = myheader.carttype2 & (2^0xff);
			setunset("unset supergameram");
			setunset("unset supergamebankram");
		}
	}
	else if(strcmp(noun,"supergameram")==0)
	{
		if(set)
		{
			myheader.carttype2 = myheader.carttype2 | 4; //SG+SGRAM
			setunset("set supergame");
		}
		else
			myheader.carttype2 = myheader.carttype2 & (4^0xff);
	}
	else if(strcmp(noun,"supergamebankram")==0)
	{
		if(set)
		{
			myheader.carttype2 = myheader.carttype2 | 32;
			setunset("set supergame");
		}
		else
			myheader.carttype2 = myheader.carttype2 & (32^0xff);
	}
	else if(strcmp(noun,"ram@4000")==0)
	{
		if(set)
		{
			myheader.carttype2 = myheader.carttype2 | 4; //SG+SGRAM
		}
		else
			myheader.carttype2 = myheader.carttype2 & (4^0xff);
	}
	else if(strcmp(noun,"rom@4000")==0)
	{
		if(set)
		{
			myheader.carttype2 = myheader.carttype2 | 8;
			setunset("unset pokey@4000");
			setunset("unset bank6@4000");
		}
		else
		{
			myheader.carttype2 = myheader.carttype2 & (8^0xff);
		}
	}
	else if(strcmp(noun,"bank6@4000")==0)
	{
		if(set)
		{
			myheader.carttype2 = myheader.carttype2 | 16;
			setunset("unset rom@4000");
			setunset("unset pokey@4000");
		}
		else
			myheader.carttype2 = myheader.carttype2 & (16^0xff);
	}
	else if(strcmp(noun,"pokey@4000")==0)
	{
		if(set)
		{
			myheader.carttype2 = myheader.carttype2 | 1;
			setunset("unset rom@4000");
			setunset("unset bank6@4000");
		}
		else
			myheader.carttype2 = myheader.carttype2 & (1^0xff);
	}
	else if(strcmp(noun,"mram@4000")==0)
	{
		if(set)
		{
			myheader.carttype2 = myheader.carttype2 | 128;
		}
		else
			myheader.carttype2 = myheader.carttype2 & (128^0xff);
	}
	else if(strcmp(noun,"pokey@450")==0)
	{
		if(set)
			myheader.carttype2 = myheader.carttype2 | 64;
		else
			myheader.carttype2 = myheader.carttype2 & (64^0xff);
	}
	else if(strcmp(noun,"activision")==0)
	{
		if(set)
		{
			myheader.carttype1 = myheader.carttype1 | 1;
			setunset("unset absolute");
			setunset("unset supergame");
		}
		else
			myheader.carttype1 = myheader.carttype1 & (1^0xff);
	}
	else if(strcmp(noun,"absolute")==0)
	{
		if(set)
		{
			myheader.carttype1 = myheader.carttype1 | 2;
			setunset("unset activision");
			setunset("unset supergame");
		}
		else
			myheader.carttype1 = myheader.carttype1 & (2^0xff);
	}
	else if(strcmp(noun,"tvpal")==0)
	{
		if(set)
			myheader.tvformat = 1;
		else
			myheader.tvformat = 0;
	}
	else if(strcmp(noun,"tvntsc")==0)
	{
		if(set)
			myheader.tvformat = 0;
		else
			myheader.tvformat = 1;
	}
	else if(strcmp(noun,"savekey")==0)
	{
		if(set)
			myheader.saveperipheral = myheader.saveperipheral | 2;
		else
			myheader.saveperipheral = myheader.saveperipheral & (2^0xff);
	}
	else if(strcmp(noun,"hsc")==0)
	{
		if(set)
			myheader.saveperipheral = myheader.saveperipheral | 1;
		else
			myheader.saveperipheral = myheader.saveperipheral & (1^0xff);
	}
	else if(strcmp(noun,"xm")==0)
	{
		if(set)
			myheader.xm = myheader.xm | 1;
		else
			myheader.xm = myheader.xm & (1^0xff);
	}
	else if(strcmp(noun,"joystick1")==0)
	{
		if(set)
			myheader.controller1 = myheader.controller1 = 1;
		else if (myheader.controller1==1)
			myheader.controller1 = 0;
	}
	else if(strcmp(noun,"joystick2")==0)
	{
		if(set)
			myheader.controller2 = myheader.controller2 = 1;
		else if (myheader.controller2==1)
			myheader.controller2 = 0;
	}
	else if(strcmp(noun,"lightgun1")==0)
	{
		if(set)
			myheader.controller1 = 2;
		else if (myheader.controller1==2)
			myheader.controller1 = 0;
	}
	else if(strcmp(noun,"lightgun2")==0)
	{
		if(set)
			myheader.controller2 = 2;
		else if (myheader.controller2==2)
			myheader.controller2 = 0;
	}
	else if(strcmp(noun,"paddle1")==0)
	{
		if(set)
			myheader.controller1 = 3;
		else if (myheader.controller1==3)
			myheader.controller1 = 0;
	}
	else if(strcmp(noun,"paddle2")==0)
	{
		if(set)
			myheader.controller2 = 3;
		else if (myheader.controller2==3)
			myheader.controller2 = 0;
	}
	else if(strcmp(noun,"trackball1")==0)
	{
		if(set)
			myheader.controller1 = 4;
		else if (myheader.controller1==4)
			myheader.controller1 = 0;
	}
	else if(strcmp(noun,"trackball2")==0)
	{
		if(set)
			myheader.controller2 = 4;
		else if (myheader.controller2==4)
			myheader.controller2 = 0;
	}


}

void loadfile(char *filename)
{
	char buffer[200];
	FILE *in;
	int n,t;
	uint32_t gamesize;
	in=fopen(filename,"r");

	if(in==NULL)
		prerror("Couldn't open '%s'\n",filename);

	fprintf(stderr,"  opened parameter file %s\n",filename);
	while(fgets(buffer, sizeof(buffer),in) != NULL)
	{
		trimnewline(buffer);
		if(strncmp(buffer,"name ",5)==0)
		{
			memset(myheader.gamename,0,32);
			strncpy(myheader.gamename,buffer+5,32);
		}
		setunset(buffer);
	}
	fclose(in);
}

void usage(char *binaryname)
{
	fprintf(stderr,"Usage:\n\n");
	fprintf(stderr,"\"%s [options] FILENAME\", where options are zero or more of the following... \n\n",binaryname);
	fprintf(stderr,"\t[-f file]\n\t\t...file for command input. same syntax as interactive mode.\n\n");
	fprintf(stderr,"\t[-o]\n\t\t...override backup of the a78 file before updating it.\n\n");
	fprintf(stderr,"\t[-p]\n\t\t...print info about the file's a78 header and exit.\n\n");
	exit(0);
}

uint32_t phtole32(uint32_t value)
{
	// Our portable endian conversion routine.
	// Sadly, it won't work on the mixed-endian PDP-11. 

	union
	{
		uint8_t c[4];
		uint32_t i;
	} u;
	u.i = 1;
	if (u.c[0]==1) //leave the value unchanged if we're little-endian
		return(value);

	//we're big endian. we need to swap all 4 bytes
	value=((value&0xff000000)>>24) | 
		((value&0x00ff0000)>>8) | 
		((value&0x0000ff00)<<8) | 
		((value&0x000000ff)<<24);
	return(value);
}

void report(void)
{

	printf("7800 A78 Header Info   : %s\n\n",filename);
	printf("    embedded game name : %s\n",myheader.gamename);
	printf("    rom size           : %d\n",	(myheader.romsize4)|
							(myheader.romsize3<<8)|
							(myheader.romsize2<<16)|
							(myheader.romsize1<<24));
	printf("    cart format        : ");
	if((myheader.carttype1 == 0) && (myheader.carttype2 == 0))
		printf("Non-Banked ");
	if((myheader.carttype2 & 1) > 0)
		printf("Pokey@4000 ");
	if((myheader.carttype2 & 2) > 0)
		printf("SuperGame ");
	if((myheader.carttype2 & 4) > 0)
		printf("ram@4000 ");
	if((myheader.carttype2 & 32) > 0 )
		printf("SuperGameBankRam ");
	if((myheader.carttype2 & 64) > 0 )
		printf("pokey@450 ");
	if((myheader.carttype2 & 128) > 0 )
		printf("mram@4000 ");
	if((myheader.carttype2 & 8) > 0 )
		printf("rom@4000 ");
	if((myheader.carttype2 & 16) > 0 )
		printf("bank6@4000 ");
	if((myheader.carttype1 & 1) > 0 )
		printf("Activision ");
	if((myheader.carttype1 & 2) > 0 )
		printf("Absolute ");
	printf("\n");

	printf("    controllers        : ");
	if(myheader.controller1 == 0 )
		printf("none ");
	if(myheader.controller1 == 1 )
		printf("joystick1 ");
	if(myheader.controller1 == 2 )
		printf("lightgun1 ");
	if(myheader.controller1 == 3 )
		printf("paddle1 ");
	if(myheader.controller1 == 4 )
		printf("trackball1 ");
	if(myheader.controller2 == 0 )
		printf("none ");
	if(myheader.controller2 == 1 )
		printf("joystick2 ");
	if(myheader.controller2 == 2 )
		printf("lightgun2 ");
	if(myheader.controller2 == 3 )
		printf("paddle2 ");
	if(myheader.controller2 == 4 )
		printf("trackball2 ");
	printf("\n");

	printf("    save peripheral    : ");
	if(myheader.saveperipheral == 0 )
		printf("none ");
	if(myheader.saveperipheral & 1 )
		printf("HSC ");
	if(myheader.saveperipheral & 2 )
		printf("SaveKey/AtariVOX ");
	printf("\n");

	printf("    xm/xboard          : ");
	if(myheader.xm  > 0 )
		printf("enabled ");
	else 
		printf("not enabled ");
	printf("\n");

	printf("    tv format          : ");
	if(myheader.tvformat == 0 )
		printf("NTSC");
	else if(myheader.tvformat == 1 )
		printf("PAL");
	else
		printf("unknown");
	printf("\n\n");
}

void prerror(char *format, ...)
{
        char buffer[1024];
        va_list args;
        va_start (args, format);
        vsnprintf (buffer, 1023, format, args);
        fprintf(stderr, "*** ERROR: %s\n", buffer);
        va_end(args);
        exit(1);
}
void prwarn(char *format, ...)
{
        char buffer[1024];
        va_list args;
        va_start (args, format);
        vsnprintf (buffer, 1023, format, args);
        fprintf(stderr, "*** WARNING: %s\n", buffer);
        va_end(args);
}

