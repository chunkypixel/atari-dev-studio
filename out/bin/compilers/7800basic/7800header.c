// Provided under the GPL v2 license. See the included LICENSE.txt for details.

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <assert.h>
#include <stdint.h>
#include <stdarg.h>
#include <ctype.h>

//      7800header - a simple app to generate/interrogate a a78 header.
//                      Michael Saarna (aka RevEng@AtariAge)

#define HEADER_VERSION_INFO "7800header 0.21"

void usage (char *binaryname);
uint32_t phtole32 (uint32_t value);
void loadfile (char *filename);
void report (void);
void setupheaderdefaults (void);
void setunset (char *command);
int checkset (char *option, int typemask);
void clearbasemappers (void);
void syncheader (void);
void writea78 (char *filename);
void writebin (char *filename);
void prerror (char *format, ...);
void prwarn (char *format, ...);
void trimnewline (char *string);

struct header7800
{

    unsigned char version;	//0

    char console[16];		//1-16

    char gamename[32];		//17-48

    unsigned char romsize1;	//49
    unsigned char romsize2;	//50
    unsigned char romsize3;	//51
    unsigned char romsize4;	//52

    // deprecated bytes in v4...
    unsigned char carttype1;	//53
    unsigned char carttype2;	//54

    unsigned char controller1;	//55
    unsigned char controller2;	//56

    unsigned char tvformat;	//57
    unsigned char saveperipheral;	//58

    unsigned char unused1[3];	//59-61

    // deprecated bytes in v4...
    unsigned char irq;		//62

    unsigned char xm;		//63

    // v4 cart hardware bytes
    unsigned char mapper;	//64
    unsigned char mapper_options;	//65
    unsigned char audio1;	//66
    unsigned char audio2;	//67
    unsigned char interrupt1;	//68
    unsigned char interrupt2;	//69

    unsigned char unused2[30];	//70-99

    char headertext[28];	//100-127
} myheader;

long gamesize;
uint32_t headergamesize;
char *rombuffer;

int v3only = 0;
int v4only = 0;
int overwrite = 0;
int printinfo = 0;
char filename[1024];

int main (int argc, char **argv)
{
    FILE *in;
    char usercommand[1024];
    int c;
    opterr = 0;


    fprintf (stderr, "\n%s %s %s\n", HEADER_VERSION_INFO, __DATE__, __TIME__);

    assert (sizeof (myheader) == 128);

    if ((argc < 2) || (argv[argc - 1][0] == '-'))
	usage (argv[0]);
    strncpy (filename, argv[argc - 1], 1024);

    in = fopen (filename, "rb");
    if (in == NULL)
	prerror ("Couldn't open '%s' for reading.\n", filename);

    //open the file and get the size...
    fseek (in, 0, SEEK_END);
    gamesize = ftell (in);
    fseek (in, 0, SEEK_SET);	//rewind

    if (gamesize == 0)
	prerror ("The file size of %s is 0 bytes.\n", filename);

    if (gamesize > 128)
	fread (&myheader, 1, 128, in);

    if (strncmp (myheader.console, "ATARI7800", 9) == 0)
	gamesize = gamesize - 128;
    else
    {
	fseek (in, 0, SEEK_SET);	//rewind
	setupheaderdefaults ();
    }

    if ((gamesize & 0x0FFF) != 0)
	prwarn ("The file size of %s isn't correct.\n", filename);

    rombuffer = malloc (gamesize);
    if (rombuffer == NULL)
	prerror ("Couldn't allocate %d bytes to hold rom\n", gamesize);

    fread (rombuffer, 128, (gamesize / 128), in);

    // get options - mainly used for reading in header configuration setup from a file
    while ((c = getopt (argc, argv, "f:34opb")) != -1)
    {
	switch (c)
	{
	case 'f':		// load options from configuration file
	    loadfile (optarg);
	    writea78 (filename);
	    exit (0);
	    break;
	case '3':		// v3 header only
	    if (v4only)
		prerror ("both v3-only and v4-only headers selected.");
	    v3only = 1;
	    break;
	case '4':		// v4 header only
	    if (v3only)
		prerror ("both v3-only and v4-only headers selected.");
	    v4only = 1;
	    break;
	case 'o':		// overwrite existing A78 file
	    overwrite = 1;
	    break;
	case 'p':		// print header info and exit
	    printinfo = 1;
	    break;
	case 'b':		// write out a bin file
	    writebin (filename);
	    exit (0);
	    break;
	}
    }

    //fix bits that shouldn't be set in the header
    if (!printinfo)
    {
	if (myheader.controller1 > 11)
	    myheader.controller1 = 1;
	if (myheader.controller2 > 11)
	    myheader.controller2 = 1;
	if (myheader.version < 3)
	    myheader.tvformat &= 1;
	myheader.saveperipheral &= 3;
	myheader.xm &= 1;
	if (v3only)
	    myheader.version = 3;
	else
	{
	    myheader.version = 4;
	    if (myheader.mapper == 0xff)
	    {
		// If the v4 header bytes are 0xff, clear them out. The dasm default fill is 0xff.
		myheader.mapper = 0;
		myheader.mapper_options = 0;
		myheader.audio1 = 0;
		myheader.audio2 = 0;
		myheader.interrupt1 = 0;
		myheader.interrupt2 = 0;
	    }
	}
	if ((!v4only) && (myheader.carttype1 == 0xff) && (myheader.carttype2 == 0xff))
	{
	    // if we're not running v4 only, clear out a detected v3 scuttle
	    myheader.carttype1 = 0;
	    myheader.carttype2 = 0;
	}
    }


    for (;;)			//loop infinitely through the report until the user explicitly exits
    {
#ifdef _WIN32
	if (printinfo == 0)
	    system ("cls");
#else
	if (printinfo == 0)
	    system ("clear");
#endif

	report ();
	if (printinfo)
	    exit (0);
	printf ("Commands: \"(un)set [option]\"       -   Add/Remove options.\n");
	printf ("          \"name [embedded name]\"   -   Set the game name in the header.\n");
	if ((v3only) || (v4only))
	    printf ("          \"fix\"                    -   Fix embedded size.\n");
	else
	    printf ("          \"fix\"                    -   Fix embedded size and sync v3+v4.\n");
	printf ("          \"save [name]\"            -   Save a78 and exit.\n");
	printf ("          \"strip [name]\"           -   Save headerless bin file and exit.\n");
	printf ("          \"exit\"                   -   Exit the utility without saving.\n");
	printf ("\n");
	printf ("Options:  linear supergame souper bankset absolute activision\n");
	printf ("  rom@4000 bank6@4000 ram@4000 mram@4000 hram@4000 bankram pokey@440 pokey@450\n");
	printf ("  pokey@800 pokey@4000 ym2151@460 covox@430 adpcm@420 irqpokey1/2 irqym2151\n");
	printf ("  7800joy1/2 lightgun1/2 paddle1/2 tball1/2 7800joy1/2 lightgun1/2 paddle1/2\n");
	printf ("  tball1/2 2600joy1/2 driving1/2 keypad1/2 stmouse1/2 amouse1/2 snes1/2\n");
	printf ("  mega78001/2 hsc savekey xm tvpal tvntsc composite mregion\n");
	printf ("> ");

	if (fgets (usercommand, 1024, stdin))
	{
	    trimnewline (usercommand);
	    if (strncmp (usercommand, "save", 4) == 0)
	    {
		if ((usercommand[4] == ' ') && (usercommand[5] != 0))
		    writea78 (usercommand + 5);
		else
		    writea78 (filename);
		exit (0);
	    }
	    if (strncmp (usercommand, "strip", 5) == 0)
	    {
		if ((usercommand[5] == ' ') && (usercommand[6] != 0))
		    writebin (usercommand + 6);
		else
		    writebin (filename);
		exit (0);
	    }
	    if (strncmp (usercommand, "fix", 7) == 0)
	    {
		// recalculate the size...
		myheader.romsize4 = (gamesize >> 0) & 0xff;
		myheader.romsize3 = (gamesize >> 8) & 0xff;
		myheader.romsize2 = (gamesize >> 16) & 0xff;
		myheader.romsize1 = (gamesize >> 24) & 0xff;
		headergamesize = gamesize;

		// sync the headers...
		syncheader ();
	    }
	    else if (strncmp (usercommand, "name ", 5) == 0)
	    {
		memset (myheader.gamename, 0, 32);
		strncpy (myheader.gamename, usercommand + 5, 32);
	    }
	    else if ((strncmp (usercommand, "ex", 2) == 0) || (usercommand[0] == 'x') || (usercommand[0] == 'q'))
	    {
		exit (0);
	    }
	    else
	    {
		setunset (usercommand);
	    }
	}
    }
}

char *strrstr (char *haystack, char *needle)
{
    if ((haystack == NULL) || (needle == NULL))
	return (NULL);
    char *last = haystack;
    while (*last != 0)
	last++;
    last--;
    while (last > haystack)
    {
	if (strncasecmp (last, needle, strlen (needle)) == 0)
	    return (last);
	last--;
    }
    return (NULL);
}

void trimnewline (char *string)
{
    if (string == NULL)
	return;
    while (*string != 0)
    {
	if ((*string == '\r') || (*string == '\n'))
	{
	    *string = 0;
	    return;
	}
	string++;
    }
    return;
}

void writea78 (char *filename)
{
    char newname[1024];
    char *ext;
    ext = strrstr (filename, ".bin");
    if (ext != NULL)
    {
	strcpy (ext, ".a78");
    }
    FILE *in, *out;
    if (overwrite == 0)
    {
	in = fopen (filename, "r");
	if (in != NULL)
	{
	    fclose (in);
	    //the destination file exists. rename it to back it up.
	    strcpy (newname, filename);
	    strcat (newname, ".backup");
	    rename (filename, newname);
	}
    }
    out = fopen (filename, "wb");
    if (out == NULL)
	prerror ("error opening file '%s' for writing.", filename);
    if (fwrite (&myheader, 1, 128, out) != 128)
	prerror ("error while writing a78 header out.\n");
    if (fwrite (rombuffer, 128, (gamesize / 128), out) != (gamesize / 128))
	prerror ("error while writing a78 file out.\n");
    fclose (out);
}

void writebin (char *filename)
{
    char newname[1024];
    char *ext;
    ext = strrstr (filename, ".a78");
    if (ext != NULL)
    {
	strcpy (ext, ".bin");
    }
    FILE *in, *out;
    if (overwrite == 0)
    {
	in = fopen (filename, "r");
	if (in != NULL)
	{
	    fclose (in);
	    //the destination file exists. rename it to back it up.
	    strcpy (newname, filename);
	    strcat (newname, ".backup");
	    rename (filename, newname);
	}
    }
    out = fopen (filename, "wb");
    if (out == NULL)
	prerror ("error opening file '%s' for writing.", filename);
    if (fwrite (rombuffer, 128, (gamesize / 128), out) != (gamesize / 128))
	prerror ("error while writing bin file out.\n");
    fclose (out);
}


void setupheaderdefaults ()
{
    headergamesize = phtole32 (gamesize);

    // a78 header format version...
    if (v3only)
	myheader.version = 3;
    else
	myheader.version = 4;

    strncpy (myheader.console, "ATARI7800        ", 16);
    strncpy (myheader.gamename, "My Game                          ", 32);

    myheader.romsize1 = (headergamesize >> 24) & 0xff;
    myheader.romsize2 = (headergamesize >> 16) & 0xff;
    myheader.romsize3 = (headergamesize >> 8) & 0xff;
    myheader.romsize4 = (headergamesize >> 0) & 0xff;

    // bit 0     = pokey at $4000
    // bit 1     = supergame bank switched
    // bit 2     = supergame ram at $4000
    // bit 3     = rom at $4000
    // bit 4     = bank 6 at $4000
    // bit 5     = supergame banked ram
    // bit 6     = pokey at $450
    // bit 7     = mirror ram at $4000
    // bit 8     = activision banking
    // bit 9     = absolute banking
    // bit 10    = pokey at $440
    // bit 11    = ym2151 at $440/$441
    // bit 12    = souper
    // bit 12-15 = special

    if (!v4only)
    {
	myheader.carttype1 = 0;
	myheader.carttype2 = 0;
	myheader.irq = 0;
    }
    else			// it's v4 only, so we need to scuttle the v3 fields
    {
	myheader.carttype1 = 0xff;
	myheader.carttype2 = 0xff;
    }

    // controller 0=none, 1=7800joy, 2=lightgun, ...
    myheader.controller1 = 1;
    myheader.controller2 = 1;

    // tv format 0=NTSC 1=PAL
    myheader.tvformat = 0;

    // save peripheral 0=none, 1=hsc, 2=savekey/avox
    myheader.saveperipheral = 0;

    memset (myheader.unused1, 0, 4);

    myheader.xm = 0;

    myheader.mapper = 0;
    myheader.mapper_options = 0;
    myheader.audio1 = 0;
    myheader.audio2 = 0;
    myheader.interrupt1 = 0;
    myheader.interrupt2 = 0;

    memset (myheader.unused2, 0, 30);

    // some expected static text...
    strncpy (myheader.headertext, "ACTUAL CART DATA STARTS HERE", 28);

}

void setunset (char *command)
{
    char verb[1024], noun[1024];
    int set, unset;
    int t, s;
    set = 0;
    unset = 0;
    if (command == NULL)
	return;
    while (*command == ' ')	// suck up any leading spaces, just in case
	command++;
    for (t = 0; command[t] != 0; t++)
	if ((command[t] == '\n') || (command[t] == '\r'))
	    command[t] = 0;

    s = 0;
    for (t = 0; command[t] != 0; t++)
    {
	if (command[t] == ' ')
	{
	    verb[s] = 0;
	    t = t + 1;
	    break;
	}
	verb[s] = tolower (command[t]);
	s = s + 1;
    }
    if (command[t] == 0)
	return;
    s = 0;
    for (; command[t] != 0; t++)
    {
	if ((command[t] == ' ') || (command[t] == '#'))
	{
            char *rcommand = malloc(1026);
            if(rcommand==NULL)
                prerror ("Memory allocation error\n");
            snprintf(rcommand,1026,"%s %s",verb,command+t+1);
            setunset(rcommand);
            free(rcommand);
	    noun[s] = 0;
	    t = t + 1;
	    break;
	}
	noun[s] = tolower (command[t]);
	s = s + 1;
    }
    noun[s] = 0;

    if (strcmp (verb, "set") == 0)
	set = 1;
    if (strcmp (verb, "unset") == 0)
	unset = 1;
    if ((set == 0) && (unset == 0))
	return;			//we only handle setting and unsetting flags here

    // ***** BASE MAPPER...
    if (strcmp (noun, "linear") == 0)
	clearbasemappers ();

    if (strcmp (noun, "supergame") == 0)
    {
	if (set)
	{
	    clearbasemappers ();

	    if (!v4only)
		myheader.carttype2 = myheader.carttype2 | 2;
	    if (!v3only)
		myheader.mapper = 1;
	}
	else
	{
	    if ((!v4only) && (checkset ("supergame", 3)))
		myheader.carttype2 = myheader.carttype2 & (2 ^ 0xff);
	    if ((!v3only) && (checkset ("supergame", 4)))
		myheader.mapper = 0;
	}
    }
    else if (strcmp (noun, "activision") == 0)
    {
	if (set)
	{
	    clearbasemappers ();
	    setunset ("unset bankset");

	    if (!v4only)
		myheader.carttype1 = myheader.carttype1 | 1;
	    if (!v3only)
	    {
		myheader.mapper = 2;
		myheader.mapper_options = 0;
	    }
	}
	else
	{
	    if ((!v4only) && (checkset ("activision", 3)))
		myheader.carttype1 = myheader.carttype1 & (1 ^ 0xff);
	    if ((!v3only) && (checkset ("activision", 4)))
		myheader.mapper = 0;
	}
    }
    else if (strcmp (noun, "absolute") == 0)
    {
	if (set)
	{
	    clearbasemappers ();
	    setunset ("unset bankset");

	    if (!v4only)
		myheader.carttype1 = myheader.carttype1 | 2;
	    if (!v3only)
	    {
		myheader.mapper = 3;
		myheader.mapper_options = 0;
	    }
	}
	else
	{
	    if ((!v4only) && (checkset ("absolute", 3)))
		myheader.carttype1 = myheader.carttype1 & (2 ^ 0xff);
	    if ((!v3only) && (checkset ("absolute", 4)))
		myheader.mapper = 0;
	}
    }
    else if (strcmp (noun, "souper") == 0)
    {
	if (set)
	{
	    clearbasemappers ();
	    setunset ("unset bankset");

	    if (!v4only)
		myheader.carttype1 = myheader.carttype1 | 16;
	    if (!v3only)
	    {
		myheader.mapper = 4;
		myheader.mapper_options = 0;
	    }
	}
	else
	{
	    if ((!v4only) && (checkset ("souper", 3)))
		myheader.carttype1 = myheader.carttype1 & (16 ^ 0xff);
	    if ((!v3only) && (checkset ("souper", 4)))
		myheader.mapper = 0;
	}
    }
    else if (strcmp (noun, "bankset") == 0)
    {
	if (set)
	{
	    setunset ("unset activision");
	    setunset ("unset absolute");
	    setunset ("unset souper");

	    if (!v4only)
		myheader.carttype1 = myheader.carttype1 | 32;
	    if (!v3only)
		myheader.mapper_options = myheader.mapper_options | 0x80;
	}
	else
	{
	    if ((!v4only) && (checkset ("bankset", 3)))
		myheader.carttype1 = myheader.carttype1 & (32 ^ 0xff);
	    if ((!v3only) && (checkset ("bankset", 4)))
		myheader.mapper_options = myheader.mapper_options & 0x7F;
	}
    }

    // ***** CART RAM...
    else if ((strcmp (noun, "supergameram") == 0) || (strcmp (noun, "ram@4000") == 0))
    {
	if (set)
	{
	    if (!v4only)
		myheader.carttype2 = myheader.carttype2 | 4;
	    if (!v3only)
		myheader.mapper_options = (myheader.mapper_options & 0xF8) | 1;
	}
	else
	{
	    if ((!v4only) && (checkset ("ram@4000", 3)))
		myheader.carttype2 = myheader.carttype2 & (4 ^ 0xff);
	    if ((!v3only) && (checkset ("ram@4000", 4)))
		myheader.mapper_options = (myheader.mapper_options & 0xF8);
	}
    }
    else if (strcmp (noun, "bankram") == 0)
    {
	if (set)
	{
	    if (!v4only)
		myheader.carttype2 = myheader.carttype2 | 32;
	    if (!v3only)
		myheader.mapper_options = (myheader.mapper_options & 0xF8) | 6;
	}
	else
	{
	    if ((!v4only) && (checkset ("bankram", 3)))
		myheader.carttype2 = myheader.carttype2 & (32 ^ 0xff);
	    if ((!v3only) && (checkset ("bankram", 4)))
		myheader.mapper_options = (myheader.mapper_options & 0xF8);
	}
    }
    else if (strcmp (noun, "mram@4000") == 0)
    {
	if (set)
	{
	    if (!v4only)
		myheader.carttype2 = myheader.carttype2 | 128;
	    if (!v3only)
		myheader.mapper_options = (myheader.mapper_options & 0xF8) | 2;
	}
	else
	{
	    if ((!v4only) && (checkset ("mram@4000", 3)))
		myheader.carttype2 = myheader.carttype2 & (128 ^ 0xff);
	    if ((!v3only) && (checkset ("mram@4000", 4)))
		myheader.mapper_options = (myheader.mapper_options & 0xF8);
	}
    }
    else if (strcmp (noun, "hram@4000") == 0)
    {
	if (set)
	{
	    if (!v4only)
		myheader.carttype1 = myheader.carttype1 | 64;
	    if (!v3only)
		myheader.mapper_options = (myheader.mapper_options & 0xF8) | 3;
	}
	else
	{
	    if ((!v4only) && (checkset ("hram@4000", 3)))
		myheader.carttype1 = myheader.carttype1 & (64 ^ 0xff);
	    if ((!v3only) && (checkset ("hram@4000", 4)))
		myheader.mapper_options = (myheader.mapper_options & 0xF8);
	}
    }

    // ***** EXTRA ROM...
    else if (strcmp (noun, "rom@4000") == 0)
    {
	if (set)
	{
	    if (!v4only)
		myheader.carttype2 = myheader.carttype2 | 8;
	    if (!v3only)
		myheader.mapper_options = (myheader.mapper_options & 0xF8) | 4;
	}
	else
	{
	    if ((!v4only) && (checkset ("rom@4000", 3)))
		myheader.carttype2 = myheader.carttype2 & (8 ^ 0xff);
	    if ((!v3only) && (checkset ("rom@4000", 4)))
		myheader.mapper_options = (myheader.mapper_options & 0xF8);
	}
    }
    else if (strcmp (noun, "bank6@4000") == 0)
    {
	if (set)
	{
	    if (!v4only)
		myheader.carttype2 = myheader.carttype2 | 16;
	    if (!v3only)
		myheader.mapper_options = (myheader.mapper_options & 0xF8) | 5;
	}
	else
	{
	    if ((!v4only) && (checkset ("bank6@4000", 3)))
		myheader.carttype2 = myheader.carttype2 & (16 ^ 0xff);
	    if ((!v3only) && (checkset ("bank6@4000", 4)))
		myheader.mapper_options = (myheader.mapper_options & 0xF8);
	}
    }

    // ***** AUDIO...
    else if (strcmp (noun, "pokey@4000") == 0)
    {
	if (set)
	{
	    if (!v4only)
	    {
		myheader.carttype2 = myheader.carttype2 | 1;

		//unset other pokeys...
		myheader.carttype2 = myheader.carttype2 & (64 ^ 0xff);	// 450
		myheader.carttype1 = myheader.carttype1 & (4 ^ 0xff);	// 440
		myheader.carttype1 = myheader.carttype1 & (128 ^ 0xff);	// 800
	    }
	    if (!v3only)
		myheader.audio2 = (myheader.audio2 & 0xF8) | 5;
	}
	else
	{
	    if ((!v4only) && (checkset ("pokey@4000", 3)))
		myheader.carttype2 = myheader.carttype2 & (1 ^ 0xff);
	    if ((!v3only) && (checkset ("pokey@4000", 4)))
		myheader.audio2 = (myheader.audio2 & 0xF8);
	}
    }
    else if (strcmp (noun, "pokey@450") == 0)
    {
	if (set)
	{
	    if (!v4only)
	    {
		myheader.carttype2 = myheader.carttype2 | 64;

		//unset other pokeys...
		myheader.carttype2 = myheader.carttype2 & (1 ^ 0xff);	// 4000
		myheader.carttype1 = myheader.carttype1 & (128 ^ 0xff);	// 800
	    }
	    if (!v3only)
	    {
		if (checkset ("pokey@440", 4))
		    myheader.audio2 = (myheader.audio2 & 0xF8) | 3;
		else
		    myheader.audio2 = (myheader.audio2 & 0xF8) | 2;
	    }
	}
	else
	{
	    if ((!v4only) && (checkset ("pokey@450", 3)))
		myheader.carttype2 = myheader.carttype2 & (64 ^ 0xff);
	    if ((!v3only) && (checkset ("pokey@450", 4)))
	    {
		if (checkset ("pokey@440", 4))
		    myheader.audio2 = (myheader.audio2 & 0xF8) | 1;
		else
		    myheader.audio2 = (myheader.audio2 & 0xF8);
	    }
	}
    }
    else if (strcmp (noun, "pokey@440") == 0)
    {
	if (set)
	{
	    if (!v4only)
	    {
		myheader.carttype1 = myheader.carttype1 | 4;

		//unset other pokeys...
		myheader.carttype2 = myheader.carttype2 & (1 ^ 0xff);	// 4000
		myheader.carttype1 = myheader.carttype1 & (128 ^ 0xff);	// 800
	    }
	    if (!v3only)
	    {
		if (checkset ("pokey@450", 4))
		    myheader.audio2 = (myheader.audio2 & 0xF8) | 3;
		else
		    myheader.audio2 = (myheader.audio2 & 0xF8) | 1;
	    }
	}
	else
	{
	    if ((!v4only) && (checkset ("pokey@440", 3)))
		myheader.carttype1 = myheader.carttype1 & (4 ^ 0xff);
	    if ((!v3only) && (checkset ("pokey@440", 4)))
	    {
		if (checkset ("pokey@450", 4))
		    myheader.audio2 = (myheader.audio2 & 0xF8) | 2;
		else
		    myheader.audio2 = (myheader.audio2 & 0xF8);
	    }
	}
    }
    else if (strcmp (noun, "pokey@800") == 0)
    {
	if (set)
	{
	    if (!v4only)
	    {
		myheader.carttype1 = myheader.carttype1 | 128;

		//unset other pokeys...
		myheader.carttype2 = myheader.carttype2 & (1 ^ 0xff);	// 4000
		myheader.carttype2 = myheader.carttype2 & (64 ^ 0xff);	// 450
		myheader.carttype1 = myheader.carttype1 & (4 ^ 0xff);	// 440
	    }
	    if (!v3only)
		myheader.audio2 = (myheader.audio2 & 0xF8) | 4;
	}
	else
	{
	    if ((!v4only) && (checkset ("pokey@800", 3)))
		myheader.carttype1 = myheader.carttype1 & (128 ^ 0xff);
	    if ((!v3only) && (checkset ("pokey@800", 4)))
		myheader.audio2 = (myheader.audio2 & 0xF8);
	}
    }
    else if (strcmp (noun, "ym2151@460") == 0)
    {
	if (set)
	{
	    if (!v4only)
		myheader.carttype1 = myheader.carttype1 | 8;
	    if (!v3only)
		myheader.audio2 = myheader.audio2 | 8;
	}
	else
	{
	    if ((!v4only) && (checkset ("ym2151@460", 3)))
		myheader.carttype1 = myheader.carttype1 & (8 ^ 0xff);
	    if ((!v3only) && (checkset ("ym2151@460", 4)))
		myheader.audio2 = myheader.audio2 & (8 ^ 0xff);
	}
    }
    else if (strcmp (noun, "covox@430") == 0)
    {
	if (set)
	{
	    if (!v4only)
		prwarn ("covox skipped in v3 header fields. (unsupported)\n");
	    if (!v3only)
		myheader.audio2 = myheader.audio2 | 16;
	}
	else
	{
	    if ((!v3only) && (checkset ("covox@430", 4)))
		myheader.audio2 = myheader.audio2 & (16 ^ 0xff);
	}
    }
    else if (strcmp (noun, "adpcm@420") == 0)
    {
	if (set)
	{
	    if (!v4only)
		prwarn ("adpcm@420 skipped in v3 header fields. (unsupported)\n");
	    if (!v3only)
		myheader.audio2 = myheader.audio2 | 32;
	}
	else
	{
	    if ((!v3only) && (checkset ("adpcm@420", 4)))
		myheader.audio2 = myheader.audio2 & (32 ^ 0xff);
	}
    }
    else if (strcmp (noun, "irqpokey1") == 0)
    {
	// this one is kind of a pain. v3 irq refers to specific devices,
	// but v4 irq refers to pokey1,pokey2, and then specific devices,
	// so we need to do some checking and mapping.
	if (set)
	{
	    if (!v4only)
	    {
		if (checkset ("pokey@4000", 3))
		    myheader.irq = myheader.irq | 1;
		else if (checkset ("pokey@450", 3))
		    myheader.irq = myheader.irq | 2;
		else if (checkset ("pokey@800", 3))
		    myheader.irq = myheader.irq | 16;
	    }
	    if (!v3only)
		if (checkset ("pokey@4000", 4) || checkset ("pokey@450", 4) || checkset ("pokey@800", 4))
		    myheader.interrupt2 = myheader.interrupt2 | 1;
	}
	else
	{
	    if ((!v4only) && (checkset ("irqpokey1", 3)))
		myheader.irq = myheader.irq & ((1 | 2 | 16) ^ 0xff);	// strip pokey@4000,@450,@800
	    if ((!v3only) && (checkset ("irqpokey1", 4)))
		myheader.interrupt2 = myheader.interrupt2 & (1 ^ 0xff);
	}
    }
    else if (strcmp (noun, "irqpokey2") == 0)
    {
	if (set)
	{
	    if (!v4only)
	    {
		if (checkset ("pokey@440", 3))
		    myheader.irq = myheader.irq | 4;
	    }
	    if (!v3only)
		if (checkset ("pokey@440", 4))
		    myheader.interrupt2 = myheader.interrupt2 | 2;
	}
	else
	{
	    if ((!v4only) && (checkset ("irqpokey2", 3)))
		myheader.irq = myheader.irq & (4 ^ 0xff);	// strip @440
	    if ((!v3only) && (checkset ("irqpokey2", 4)))
		myheader.interrupt2 = myheader.interrupt2 & (2 ^ 0xff);
	}
    }
    else if (strcmp (noun, "irqym2151") == 0)
    {
	if (set)
	{
	    if (!v4only)
	    {
		if (checkset ("ym2151@460", 3))
		    myheader.irq = myheader.irq | 8;
	    }
	    if (!v3only)
		if (checkset ("ym2151@460", 4))
		    myheader.interrupt2 = myheader.interrupt2 | 4;
	}
	else
	{
	    if ((!v4only) && (checkset ("irqym2151", 3)))
		myheader.irq = myheader.irq & (8 ^ 0xff);	// strip @440
	    if ((!v3only) && (checkset ("irqym2151", 4)))
		myheader.interrupt2 = myheader.interrupt2 & (4 ^ 0xff);
	}
    }


    else if (strcmp (noun, "tvpal") == 0)
    {
	if (set)
	    myheader.tvformat = myheader.tvformat | 1;
	else
	    myheader.tvformat = myheader.tvformat & 0xfe;
    }
    else if (strcmp (noun, "tvntsc") == 0)
    {
	if (set)
	    myheader.tvformat = myheader.tvformat & 0xfe;
	else
	    myheader.tvformat = myheader.tvformat | 1;
    }
    else if (strcmp (noun, "composite") == 0)
    {
	if (set)
	    myheader.tvformat = myheader.tvformat | 2;
	else
	    myheader.tvformat = myheader.tvformat & 0xfd;
    }
    else if (strcmp (noun, "mregion") == 0)
    {
	if (set)
	    myheader.tvformat = myheader.tvformat | 4;
	else
	    myheader.tvformat = myheader.tvformat & 0xfb;
    }
    else if (strcmp (noun, "savekey") == 0)
    {
	if (set)
	    myheader.saveperipheral = myheader.saveperipheral | 2;
	else
	    myheader.saveperipheral = myheader.saveperipheral & (2 ^ 0xff);
    }
    else if (strcmp (noun, "hsc") == 0)
    {
	if (set)
	    myheader.saveperipheral = myheader.saveperipheral | 1;
	else
	    myheader.saveperipheral = myheader.saveperipheral & (1 ^ 0xff);
    }
    else if (strcmp (noun, "xm") == 0)
    {
	if (set)
	    myheader.xm = myheader.xm | 1;
	else
	    myheader.xm = myheader.xm & (1 ^ 0xff);
    }
    else if (strcmp (noun, "7800joy1") == 0)
    {
	if (set)
	    myheader.controller1 = 1;
	else if (myheader.controller1 == 1)
	    myheader.controller1 = 0;
    }
    else if (strcmp (noun, "7800joy2") == 0)
    {
	if (set)
	    myheader.controller2 = 1;
	else if (myheader.controller2 == 1)
	    myheader.controller2 = 0;
    }
    else if (strcmp (noun, "lightgun1") == 0)
    {
	if (set)
	    myheader.controller1 = 2;
	else if (myheader.controller1 == 2)
	    myheader.controller1 = 0;
    }
    else if (strcmp (noun, "lightgun2") == 0)
    {
	if (set)
	    myheader.controller2 = 2;
	else if (myheader.controller2 == 2)
	    myheader.controller2 = 0;
    }
    else if (strcmp (noun, "paddle1") == 0)
    {
	if (set)
	    myheader.controller1 = 3;
	else if (myheader.controller1 == 3)
	    myheader.controller1 = 0;
    }
    else if (strcmp (noun, "paddle2") == 0)
    {
	if (set)
	    myheader.controller2 = 3;
	else if (myheader.controller2 == 3)
	    myheader.controller2 = 0;
    }
    else if (strcmp (noun, "tball1") == 0)
    {
	if (set)
	    myheader.controller1 = 4;
	else if (myheader.controller1 == 4)
	    myheader.controller1 = 0;
    }
    else if (strcmp (noun, "tball2") == 0)
    {
	if (set)
	    myheader.controller2 = 4;
	else if (myheader.controller2 == 4)
	    myheader.controller2 = 0;
    }

    else if (strcmp (noun, "2600joy1") == 0)
    {
	if (set)
	    myheader.controller1 = 5;
	else if (myheader.controller1 == 5)
	    myheader.controller1 = 0;
    }
    else if (strcmp (noun, "2600joy2") == 0)
    {
	if (set)
	    myheader.controller2 = 5;
	else if (myheader.controller2 == 5)
	    myheader.controller2 = 0;
    }

    else if (strcmp (noun, "driving1") == 0)
    {
	if (set)
	    myheader.controller1 = 6;
	else if (myheader.controller1 == 6)
	    myheader.controller1 = 0;
    }
    else if (strcmp (noun, "driving2") == 0)
    {
	if (set)
	    myheader.controller2 = 6;
	else if (myheader.controller2 == 6)
	    myheader.controller2 = 0;
    }

    else if (strcmp (noun, "keypad1") == 0)
    {
	if (set)
	    myheader.controller1 = 7;
	else if (myheader.controller1 == 7)
	    myheader.controller1 = 0;
    }
    else if (strcmp (noun, "keypad2") == 0)
    {
	if (set)
	    myheader.controller2 = 7;
	else if (myheader.controller2 == 7)
	    myheader.controller2 = 0;
    }

    else if (strcmp (noun, "stmouse1") == 0)
    {
	if (set)
	    myheader.controller1 = 8;
	else if (myheader.controller1 == 8)
	    myheader.controller1 = 0;
    }
    else if (strcmp (noun, "stmouse2") == 0)
    {
	if (set)
	    myheader.controller2 = 8;
	else if (myheader.controller2 == 8)
	    myheader.controller2 = 0;
    }

    else if (strcmp (noun, "amouse1") == 0)
    {
	if (set)
	    myheader.controller1 = 9;
	else if (myheader.controller1 == 9)
	    myheader.controller1 = 0;
    }
    else if (strcmp (noun, "amouse2") == 0)
    {
	if (set)
	    myheader.controller2 = 9;
	else if (myheader.controller2 == 9)
	    myheader.controller2 = 0;
    }

    else if (strcmp (noun, "snes1") == 0)
    {
	if (set)
	    myheader.controller1 = 11;
	else if (myheader.controller1 == 11)
	    myheader.controller1 = 0;
    }
    else if (strcmp (noun, "snes2") == 0)
    {
	if (set)
	    myheader.controller2 = 11;
	else if (myheader.controller2 == 11)
	    myheader.controller2 = 0;
    }

    else if (strcmp (noun, "mega78001") == 0)
    {
	if (set)
	    myheader.controller1 = 12;
	else if (myheader.controller1 == 12)
	    myheader.controller1 = 0;
    }
    else if (strcmp (noun, "mega78002") == 0)
    {
	if (set)
	    myheader.controller2 = 12;
	else if (myheader.controller2 == 12)
	    myheader.controller2 = 0;
    }

}

void syncheader (void)
{
    // don't sync if we don't have v3 and v4 headers enabled.
    if ((v3only) || (v4only))
	return;
    if (checkset ("supergame", 7))
	setunset ("set supergame");
    if (checkset ("activision", 7))
	setunset ("set activision");
    if (checkset ("absolute", 7))
	setunset ("set absolute");
    if (checkset ("souper", 7))
	setunset ("set souper");
    if (checkset ("bankset", 7))
	setunset ("set bankset");
    if (checkset ("ram@4000", 7))
	setunset ("set ram@4000");
    if (checkset ("bankram", 7))
	setunset ("set bankram");
    if (checkset ("mram@4000", 7))
	setunset ("set mram@4000");
    if (checkset ("hram@4000", 7))
	setunset ("set hram@4000");
    if (checkset ("rom@4000", 7))
	setunset ("set rom@4000");
    if (checkset ("bank6@4000", 7))
	setunset ("set bank6@4000");
    if (checkset ("pokey@4000", 7))
	setunset ("set pokey@4000");
    if (checkset ("pokey@440", 7))
	setunset ("set pokey@440");
    if (checkset ("pokey@450", 7))
	setunset ("set pokey@450");
    if (checkset ("pokey@800", 7))
	setunset ("set pokey@800");
    if (checkset ("ym2151@460", 7))
	setunset ("set ym2151@460");
    if (checkset ("covox@430", 7))
	setunset ("set covox@430");
    if (checkset ("adpcm@420", 7))
	setunset ("set adpcm@420");
    if (checkset ("irqpokey1", 7))
	setunset ("set irqpokey1");
    if (checkset ("irqpokey2", 7))
	setunset ("set irqpokey2");
    if (checkset ("irqym2151", 7))
	setunset ("set irqym2151");
}

int checkset (char *option, int typemask)
{
    // call with typemask=3 to check only v3 header types
    // call with typemask=4 to check only v4 header types
    // call with typemask=7 to check both v3+v4 header types

    // return !0 if option is set
    // return  0 if option is not set

    if (!strcmp (option, "linear"))
    {
	return (!
		(checkset ("supergame", typemask) |
		 checkset ("activision", typemask) | checkset ("absolute", typemask) | checkset ("souper", typemask)));
    }
    if (!strcmp (option, "supergame"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype2 & 2)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if (myheader.mapper == 1)
		return (1);
    }
    if (!strcmp (option, "activision"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype1 & 1)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if (myheader.mapper == 2)
		return (1);
    }
    if (!strcmp (option, "absolute"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype1 & 2)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if (myheader.mapper == 3)
		return (1);
    }
    if (!strcmp (option, "souper"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype1 & 16)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if (myheader.mapper == 4)
		return (1);
    }
    if (!strcmp (option, "bankset"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype1 & 32)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if (myheader.mapper_options & 0x80)
		return (1);
    }
    if ((!strcmp (option, "supergameram")) || (!strcmp (option, "ram@4000")))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype2 & 4)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if ((myheader.mapper_options & 7) == 1)
		return (1);
    }
    if (!strcmp (option, "bankram"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype2 & 32)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if ((myheader.mapper_options & 7) == 6)
		return (1);
    }
    if (!strcmp (option, "mram@4000"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype2 & 128)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if ((myheader.mapper_options & 7) == 2)
		return (1);
    }
    if (!strcmp (option, "hram@4000"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype1 & 64)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if ((myheader.mapper_options & 7) == 3)
		return (1);
    }
    if (!strcmp (option, "rom@4000"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype2 & 8)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if ((myheader.mapper_options & 7) == 4)
		return (1);
    }
    if (!strcmp (option, "bank6@4000"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype2 & 16)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if ((myheader.mapper_options & 7) == 5)
		return (1);
    }
    if (!strcmp (option, "pokey@4000"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype2 & 1)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if ((myheader.audio2 & 7) == 5)
		return (1);
    }
    if (!strcmp (option, "pokey@450"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype2 & 64)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if ((myheader.audio2 & 6) == 2)
		return (1);
    }
    if (!strcmp (option, "pokey@440"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype1 & 4)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if ((myheader.audio2 & 5) == 1)
		return (1);
    }
    if (!strcmp (option, "pokey@800"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype1 & 128)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if ((myheader.audio2 & 7) == 4)
		return (1);
    }
    if (!strcmp (option, "ym2151@460"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.carttype1 & 8)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if (myheader.audio2 & 8)
		return (1);
    }
    if (!strcmp (option, "covox@430"))
    {
	if ((!v3only) && (typemask & 4))
	    if (myheader.audio2 & 16)
		return (1);
    }
    if (!strcmp (option, "adpcm@420"))
    {
	if ((!v3only) && (typemask & 4))
	    if (myheader.audio2 & 32)
		return (1);
    }
    if (!strcmp (option, "irqpokey1"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.irq & 19)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if (myheader.interrupt2 & 1)
		return (1);
    }
    if (!strcmp (option, "irqpokey2"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.irq & 4)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if (myheader.interrupt2 & 2)
		return (1);
    }
    if (!strcmp (option, "irqym2151"))
    {
	if ((!v4only) && (typemask & 3))
	    if (myheader.irq & 8)
		return (1);
	if ((!v3only) && (typemask & 4))
	    if (myheader.interrupt2 & 4)
		return (1);
    }
    return (0);
}

void clearbasemappers (void)
{
    setunset ("unset supergame");
    setunset ("unset activision");
    setunset ("unset absolute");
    setunset ("unset souper");
}

void loadfile (char *filename)
{
    char buffer[200];
    FILE *in;
    in = fopen (filename, "r");

    if (in == NULL)
	prerror ("Couldn't open '%s'\n", filename);

    fprintf (stderr, "  opened parameter file %s\n", filename);
    while (fgets (buffer, sizeof (buffer), in) != NULL)
    {
	trimnewline (buffer);
	if (strncmp (buffer, "name ", 5) == 0)
	{
	    memset (myheader.gamename, 0, 32);
	    strncpy (myheader.gamename, buffer + 5, 32);
	}
	setunset (buffer);
    }
    fclose (in);
}

void usage (char *binaryname)
{
    fprintf (stderr, "Usage:\n\n");
    fprintf (stderr, "\"%s [options] FILENAME\", where options are zero or more of the following... \n\n", binaryname);
    fprintf (stderr, "\t[-f file]\n\t\t...file for command input, write a78. same syntax as interactive mode.\n\n");
    fprintf (stderr, "\t[-b]\n\t\t...strip off the a78 header and write out a bin.\n\n");
    fprintf (stderr, "\t[-o]\n\t\t...override backup of the a78 file before updating it.\n\n");
    fprintf (stderr, "\t[-3]\n\t\t...only create v3 compatible header, v4 is empty.\n\n");
    fprintf (stderr, "\t[-4]\n\t\t...only create v4 compatible header, v3 is disabled.\n\n");
    fprintf (stderr, "\t[-p]\n\t\t...print info about the file's a78 header and exit.\n\n");
    exit (0);
}

uint32_t phtole32 (uint32_t value)
{
    // Our portable endian conversion routine.
    // Sadly, it won't work on the mixed-endian PDP-11. 

    union
    {
	uint8_t c[4];
	uint32_t i;
    } u;
    u.i = 1;
    if (u.c[0] == 1)		//leave the value unchanged if we're little-endian
	return (value);

    //we're big endian. we need to swap all 4 bytes
    value = ((value & 0xff000000) >> 24) |
	((value & 0x00ff0000) >> 8) | ((value & 0x0000ff00) << 8) | ((value & 0x000000ff) << 24);
    return (value);
}

void report (void)
{

    printf ("    file name          : %s\n", filename);
    printf ("    embedded game name : %s\n", myheader.gamename);
    headergamesize =
	(myheader.romsize4) | (myheader.romsize3 << 8) | (myheader.romsize2 << 16) | (myheader.romsize1 << 24);
    printf ("    rom size           : %d", headergamesize);
    if (gamesize != headergamesize)
	printf (" !!! actual %ld !!! (\"fix\" to correct)", gamesize);
    printf ("\n");

    if (!v4only)
    {
	printf ("    cart format (v3)   : ");

	if ((myheader.carttype1 == 0xff) && (myheader.carttype2 == 0xff))
	    printf ("[disabled] ");
	else
	{
	    if (checkset ("linear", 3))
		printf ("linear ");
	    if (checkset ("supergame", 3))
		printf ("supergame ");
	    if (checkset ("activision", 3))
		printf ("activision ");
	    if (checkset ("absolute", 3))
		printf ("absolute ");
	    if (checkset ("souper", 3))
		printf ("souper ");
	    if (checkset ("bankset", 3))
		printf ("bankset ");
	    if (checkset ("ram@4000", 3))
		printf ("ram@4000 ");
	    if (checkset ("bankram", 3))
		printf ("bankram ");
	    if (checkset ("mram@4000", 3))
		printf ("mram@4000 ");
	    if (checkset ("hram@4000", 3))
		printf ("hram@4000 ");
	    if (checkset ("rom@4000", 3))
		printf ("rom@4000 ");
	    if (checkset ("bank6@4000", 3))
		printf ("bank6@4000 ");
	    if (checkset ("pokey@4000", 3))
		printf ("pokey@4000 ");
	    if (checkset ("pokey@440", 3))
		printf ("pokey@440 ");
	    if (checkset ("pokey@450", 3))
		printf ("pokey@450 ");
	    if (checkset ("ym2151@460", 3))
		printf ("ym2151@460 ");
	    if (checkset ("pokey@800", 3))
		printf ("pokey@800 ");
	    if (checkset ("covox@430", 3))
		printf ("covox@430 ");
	    if (checkset ("adpcm@420", 3))
		printf ("adpcm@420 ");
	    if (checkset ("irqpokey1", 3))
		printf ("irqpokey1 ");
	    if (checkset ("irqpokey2", 3))
		printf ("irqpokey2 ");
	    if (checkset ("irqym2151", 3))
		printf ("irqym2151 ");
	}
	printf ("\n");
    }

    if (!v3only)
    {
	printf ("    cart format (v4)   : ");
	if (myheader.version < 4)
	    printf ("[header version < 4] ");
	else
	{
	    if (checkset ("linear", 4))
		printf ("linear ");
	    if (checkset ("supergame", 4))
		printf ("supergame ");
	    if (checkset ("activision", 4))
		printf ("activision ");
	    if (checkset ("absolute", 4))
		printf ("absolute ");
	    if (checkset ("souper", 4))
		printf ("souper ");
	    if (checkset ("bankset", 4))
		printf ("bankset ");
	    if (checkset ("ram@4000", 4))
		printf ("ram@4000 ");
	    if (checkset ("bankram", 4))
		printf ("bankram ");
	    if (checkset ("mram@4000", 4))
		printf ("mram@4000 ");
	    if (checkset ("hram@4000", 4))
		printf ("hram@4000 ");
	    if (checkset ("rom@4000", 4))
		printf ("rom@4000 ");
	    if (checkset ("bank6@4000", 4))
		printf ("bank6@4000 ");
	    if (checkset ("pokey@4000", 4))
		printf ("pokey@4000 ");
	    if (checkset ("pokey@440", 4))
		printf ("pokey@440 ");
	    if (checkset ("pokey@450", 4))
		printf ("pokey@450 ");
	    if (checkset ("ym2151@460", 4))
		printf ("ym2151@460 ");
	    if (checkset ("pokey@800", 4))
		printf ("pokey@800 ");
	    if (checkset ("covox@430", 4))
		printf ("covox@430 ");
	    if (checkset ("adpcm@420", 4))
		printf ("adpcm@420 ");
	    if (checkset ("irqpokey1", 4))
		printf ("irqpokey1 ");
	    if (checkset ("irqpokey2", 4))
		printf ("irqpokey2 ");
	    if (checkset ("irqym2151", 4))
		printf ("irqym2151 ");
	}
	printf ("\n");
    }


    printf ("    controllers        : ");
    if (myheader.controller1 == 0)
	printf ("none ");
    if (myheader.controller1 == 1)
	printf ("7800joy1 ");
    if (myheader.controller1 == 2)
	printf ("lightgun1 ");
    if (myheader.controller1 == 3)
	printf ("paddle1 ");
    if (myheader.controller1 == 4)
	printf ("tball1 ");
    if (myheader.controller1 == 5)
	printf ("2600joy1 ");
    if (myheader.controller1 == 6)
	printf ("driving1 ");
    if (myheader.controller1 == 7)
	printf ("keypad1 ");
    if (myheader.controller1 == 8)
	printf ("stmouse1 ");
    if (myheader.controller1 == 9)
	printf ("amouse1 ");
    if (myheader.controller1 == 11)
	printf ("snes1 ");
    if (myheader.controller1 == 12)
	printf ("mega78001 ");
    if (myheader.controller2 == 0)
	printf ("none ");
    if (myheader.controller2 == 1)
	printf ("7800joy2 ");
    if (myheader.controller2 == 2)
	printf ("lightgun2 ");
    if (myheader.controller2 == 3)
	printf ("paddle2 ");
    if (myheader.controller2 == 4)
	printf ("tball2 ");
    if (myheader.controller2 == 5)
	printf ("2600joy2 ");
    if (myheader.controller2 == 6)
	printf ("driving2 ");
    if (myheader.controller2 == 7)
	printf ("keypad2 ");
    if (myheader.controller2 == 8)
	printf ("stmouse2 ");
    if (myheader.controller2 == 9)
	printf ("amouse2 ");
    if (myheader.controller2 == 11)
	printf ("snes2 ");
    if (myheader.controller2 == 12)
	printf ("mega78002 ");

    printf ("\n");

    int peripherals = 0;
    printf ("    peripherals        : ");
    if (myheader.saveperipheral & 1)
    {
	printf ("HSC ");
	peripherals++;
    }
    if (myheader.saveperipheral & 2)
    {
	printf ("SaveKey/AtariVOX ");
	peripherals++;
    }
    if (myheader.xm)
    {
	printf ("XM ");
	peripherals++;
    }
    if (!peripherals)
	printf ("none ");
    printf ("\n");

    printf ("    tv format          : ");
    if ((myheader.tvformat & 1) == 0)
	printf ("NTSC");
    else if ((myheader.tvformat & 1) == 1)
	printf ("PAL");
    if (myheader.tvformat & 2)
	printf (" composite");
    if (myheader.tvformat & 4)
	printf (" multi-region");

    printf ("\n\n");
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
