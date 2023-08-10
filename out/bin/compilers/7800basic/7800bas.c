// Provided under the GPL v2 license. See the included LICENSE.txt for details.

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include "statements.h"
#include "keywords.h"
#include <math.h>

char stdoutfilename[256];
FILE *stdoutfilepointer;

extern int currentdmahole;
extern int numredefvars;
extern int numconstants;
extern char incbasepath[500];
extern char redefined_variables[80000][100];
extern char bannerfilenames[1000][100];
extern char palettefilenames[1000][100];
extern char currentcharset[256];
extern int graphicsdatawidth[16];
extern char charactersetchars[257];

#define BASIC_VERSION_INFO "7800basic v0.29"

int main (int argc, char *argv[])
{
    char **statement;
    char **deallocate_mem;
    int i, j, k;
    int unnamed = 0;
    int defcount = 0;
    char *c;
    char single;
    char code[500];
    char displaycode[500];
    FILE *header = NULL;
    int multiplespace = 0;
    char *includes_file = "default.inc";
    char *filename = "7800basic_variable_redefs.h";
    char *path = 0;
    char def[250][100];
    char defr[250][100];
    char finalcode[500];
    char *codeadd;
    char mycode[500];
    int defi = 0;
    path = NULL;
    // get command line arguments
    while ((i = getopt (argc, argv, "i:r:v")) != -1)
    {
	switch (i)
	{
	case 'i':
	    path = optarg;
	    break;
	case 'r':
	    filename = optarg;
	    break;
	case 'v':
	    printf ("%s (%s, %s)\n", BASIC_VERSION_INFO, __TIME__, __DATE__);
	    exit (0);
	case '?':
	    fprintf (stderr, "usage: %s -r <variable redefs file> -i <includes path>\n", argv[0]);
	    exit (1);
	}
    }

    // global variable init...
    strcpy (redefined_variables[numredefvars++], "collisionwrap = 1");
    incbasepath[0] = 0;
    bannerfilenames[0][0] = 0;
    palettefilenames[0][0] = 0;
    currentcharset[0] = 0;

    for (i = 0; i < 16; i++)
	graphicsdatawidth[i] = 0;

    strcpy (charactersetchars, " abcdefghijklmnopqrstuvwxyz.!?,\"$():");

    fprintf (stderr, "%s %s %s\n", BASIC_VERSION_INFO, __DATE__, __TIME__);

    // redirect STDOUT to 7800.asm, overwriting if it exists... 
    strcpy (stdoutfilename, "7800.asm");
    if ((stdoutfilepointer = freopen (stdoutfilename, "w", stdout)) == NULL)
    {
	prerror ("couldn't create the 7800.asm file.");
    }

    printf (" ;%s %s %s\n", BASIC_VERSION_INFO, __DATE__, __TIME__);

    printf ("SPACEOVERFLOW SET 0\n");
    printf (" ifnconst SPACEOVERFLOWPASS\n");
    printf ("SPACEOVERFLOWPASS SET 0\n");
    printf (" endif SPACEOVERFLOWPASS\n");

    // these asm files are produced dynamically, so as to allow out-of-order
    // assembly with dasm. Their mere presence will affect the compile process
    // so we start off by wiping them, if they exist from a previous compile.
    remove ("7800hole.0.asm");
    remove ("7800hole.1.asm");
    remove ("7800hole.2.asm");
    remove ("banksetrom.asm");
    remove ("banksetstrings.asm");

    char removefile[256];
    int t;
    for (t = 0; t < 100; t++)
    {
	sprintf (removefile, "dump_gfx_%02d.bin", t);
	if (remove (removefile))
	    break;
	sprintf (removefile, "dump_gfx_%02d.asm", t);
	remove (removefile);
    }


    create_a78info ();		//wipe/create a78 parameter file

    printf ("game\n");		// label for start of game
    init_includes (path);

    statement = (char **) malloc (sizeof (char *) * STATEMENTCOUNT);
    deallocate_mem = statement;
    for (i = 0; i < STATEMENTCOUNT; ++i)
    {
	statement[i] = (char *) malloc (sizeof (char) * (SIZEOFSTATEMENT+1));
        memset(statement[i],0,(SIZEOFSTATEMENT+1));
    }

    while (1)
    {				// clear out statement cache
	for (i = 0; i < STATEMENTCOUNT; ++i)
	{
	    for (j = 0; j < SIZEOFSTATEMENT; ++j)
	    {
		statement[i][j] = '\0';
	    }
	}
	c = fgets (code, 500, stdin);	// get next line from input
	incline ();
	strcpy (displaycode, code);

	// look for defines and remember them
	strcpy (mycode, code);
	for (i = 0; i < 495; ++i)
	    if (code[i] == ' ')
		break;
	if (code[i + 1] == 'd' && code[i + 2] == 'e' && code[i + 3] == 'f' && code[i + 4] == ' ')
	{			// found a define
	    i += 5;
	    for (j = 0; code[i] != ' '; i++)
	    {
		def[defi][j++] = code[i];	// get the define
	    }
	    def[defi][j] = '\0';

	    i += 3;

	    for (j = 0; code[i] != '\0'; i++)
	    {
		defr[defi][j++] = code[i];	// get the definition
	    }
	    defr[defi][j] = '\0';
	    removeCR (defr[defi]);
	    printf (";.%s.%s.\n", def[defi], defr[defi]);
	    defi++;
	}
	else if (defi)
	{
	    for (i = 0; i < defi; ++i)
	    {
		codeadd = NULL;
		finalcode[0] = '\0';
		defcount = 0;
		while (1)
		{
		    if (defcount++ > 250)
		    {
			fprintf (stderr,
				 "(%d) Infinitely repeating definition or too many instances of a definition\n",
				 bbgetline ());
			exit (1);
		    }
		    codeadd = strstr (mycode, def[i]);
		    if (codeadd == NULL)
			break;
		    for (j = 0; j < 500; ++j)
			finalcode[j] = '\0';
		    strncpy (finalcode, mycode, 500);
                    finalcode[(strlen (mycode) - strlen (codeadd))]=0;
		    strcat (finalcode, defr[i]);
		    strcat (finalcode, codeadd + strlen (def[i]));
		    strcpy (mycode, finalcode);
		}
	    }
	}
	if (strcmp (mycode, code))
	    strcpy (code, mycode);
	if (!c)
	    break;		//end of file

	// preprocessing removed in favor of a simplistic lex-based preprocessor

	i = 0;
	j = 0;
	k = 0;

	// look for spaces, reject multiples
	while (code[i] != '\0')
	{
	    single = code[i++];
	    if (single == ' ')
	    {
		if (!multiplespace)
		{
		    j++;
		    k = 0;
		}
		multiplespace++;
	    }
	    else
	    {
		multiplespace = 0;
		if (k < (SIZEOFSTATEMENT-1))	// avoid overrun when users use REM with long horizontal separators
		    statement[j][k++] = single;
	    }

	}
	if (j > 150)
	{
	    fprintf (stderr, "(%d) Warning: long line\n", bbgetline ());
	}
	if (statement[0][0] == '\0')
	{
	    sprintf (statement[0], "L0%d", unnamed++);
	}
	if (strncmp (statement[0], "end\0", 3))
	    printf (".%s ;; %s\n", statement[0], displaycode);	//    printf(".%s ; %s\n",statement[0],code);
	else
	    doend ();

	keywords (statement);
	if (numconstants == (MAXCONSTANTS - 1))
	{
	    fprintf (stderr, "(%d) Maximum number of constants exceeded.\n", bbgetline ());
	    exit (1);
	}
    }

    printf ("DMAHOLEEND%d SET .\n", currentdmahole);

    //if stdout is redirected, change it back to 7800.asm so the gameend label goes in the right spot...
    if (strcmp (stdoutfilename, "7800.asm") != 0)
    {
	strcpy (stdoutfilename, "7800.asm");
	if ((stdoutfilepointer = freopen (stdoutfilename, "a", stdout)) == NULL)
	{
	    prerror ("couldn't reopen the 7800.asm file.");
	}
    }

    printf ("gameend\n");

    barf_graphic_file ();

    barfmultiplicationtables ();

    printf (" if SPACEOVERFLOW > 0\n");
    printf ("  echo \"\"\n");
    printf ("  echo \"######## ERROR: space overflow detected in\",[SPACEOVERFLOW]d,\"areas.\"\n");
    printf ("  echo \"######## look above for areas with negative ROM space left.\"\n");
    printf ("  echo \"######## Aborting assembly.\"\n");
    printf ("SET SPACEOVERFLOWPASS = (SPACEOVERFLOWPASS + 1)\n");
    printf (" if SPACEOVERFLOWPASS > 0\n");
    printf ("  ERR\n");
    printf (" endif\n");
    printf (" endif\n");

    printf (" \n\n");

    header_write (header, filename);
    create_includes (includes_file);
    fprintf (stderr, "7800basic compilation complete.\n");
    freemem (deallocate_mem);
    return 0;
}
