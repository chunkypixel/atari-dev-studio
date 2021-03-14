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

#define BASIC_VERSION_INFO "7800basic v0.18"

int main(int argc, char *argv[])
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
    while ((i = getopt(argc, argv, "i:r:v")) != -1)
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
	    printf("%s (%s, %s)\n", BASIC_VERSION_INFO, __TIME__, __DATE__);
	    exit(0);
	case '?':
	    fprintf(stderr, "usage: %s -r <variable redefs file> -i <includes path>\n", argv[0]);
	    exit(1);
	}
    }

    // global variable init...
    condpart = 0;
    ongosub = 0;
    decimal = 0;
    romat4k = 0;
    bankcount = 0;
    currentbank = 0;
    doublebufferused = 0;
    boxcollisionused = 0;
    dmaplain = 0;
    templabel = 0;
    doublewide = 0;
    zoneheight = 16;
    zonelocking = 0;
    superchip = 0;
    optimization = 0;
    smartbranching = 1;
    collisionwrap = 1;
    strcpy(redefined_variables[numredefvars++], "collisionwrap = 1");
    line = 0;
    numfixpoint44 = 0;
    numfixpoint88 = 0;
    incbasepath[0] = 0;
    includesfile_already_done = 0;
    tallspritemode = 1;
    multtableindex = 0;
    bannerfilenames[0][0] = 0;
    palettefilenames[0][0] = 0;
    currentcharset[0] = 0;
    ors = 0;
    numjsrs = 0;
    numfors = 0;
    numthens = 0;
    numelses = 0;
    numredefvars = 0;
    numconstants = 0;
    branchtargetnumber = 0;
    doingfunction = 0;
    sprite_index = 0;
    multisprite = 0;
    lifekernel = 0;
    playfield_number = 0;
    playfield_index[0] = 0;
    extra = 0;
    extralabel = 0;
    extraactive = 0;
    macroactive = 0;

    for (i = 0; i < 16; i++)
	graphicsdatawidth[i] = 0;

    strcpy(charactersetchars, " abcdefghijklmnopqrstuvwxyz.!?,\"$():");

    fprintf(stderr, "%s %s %s\n", BASIC_VERSION_INFO, __DATE__, __TIME__);

    // redirect STDOUT to 7800.asm, overwriting if it exists... 
    strcpy(stdoutfilename, "7800.asm");
    if ((stdoutfilepointer = freopen(stdoutfilename, "w", stdout)) == NULL)
    {
	prerror("couldn't create the 7800.asm file.");
    }

    printf(" ;%s %s %s\n", BASIC_VERSION_INFO, __DATE__, __TIME__);

    printf("SPACEOVERFLOW SET 0\n");

    remove("7800hole.0.asm");
    remove("7800hole.1.asm");
    remove("7800hole.2.asm");

    create_a78info();		//wipe/create a78 parameter file

    printf("game\n");		// label for start of game
    header_open(header);
    init_includes(path);

    statement = (char **) malloc(sizeof(char *) * 200);
    deallocate_mem = statement;
    for (i = 0; i < 200; ++i)
    {
	statement[i] = (char *) malloc(sizeof(char) * 200);
    }

    while (1)
    {				// clear out statement cache
	for (i = 0; i < 200; ++i)
	{
	    for (j = 0; j < 200; ++j)
	    {
		statement[i][j] = '\0';
	    }
	}
	c = fgets(code, 500, stdin);	// get next line from input
	incline();
	strcpy(displaycode, code);

	// look for defines and remember them
	strcpy(mycode, code);
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
	    removeCR(defr[defi]);
	    printf(";.%s.%s.\n", def[defi], defr[defi]);
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
			fprintf(stderr, "(%d) Infinitely repeating definition or too many instances of a definition\n",
				bbgetline());
			exit(1);
		    }
		    codeadd = strstr(mycode, def[i]);
		    if (codeadd == NULL)
			break;
		    for (j = 0; j < 500; ++j)
			finalcode[j] = '\0';
		    strncpy(finalcode, mycode, strlen(mycode) - strlen(codeadd));
		    strcat(finalcode, defr[i]);
		    strcat(finalcode, codeadd + strlen(def[i]));
		    strcpy(mycode, finalcode);
		}
	    }
	}
	if (strcmp(mycode, code))
	    strcpy(code, mycode);
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
		if (k < 199)	//REVENG - avoid overrun when users use REM with long horizontal separators
		    statement[j][k++] = single;
	    }

	}
	if (j > 150)
	{
	    fprintf(stderr, "(%d) Warning: long line\n", bbgetline());
	}
	if (statement[0][0] == '\0')
	{
	    sprintf(statement[0], "L0%d", unnamed++);
	}
	if (strncmp(statement[0], "end\0", 3))
	    printf(".%s ;; %s\n", statement[0], displaycode);	//    printf(".%s ; %s\n",statement[0],code);
	else
	    doend();

	keywords(statement);
    }

    printf("DMAHOLEEND%d SET .\n",currentdmahole);

    //if stdout is redirected, change it back to 7800.asm so the gameend label goes in the right spot...
    if (strcmp(stdoutfilename, "7800.asm") != 0)
    {
	strcpy(stdoutfilename, "7800.asm");
	if ((stdoutfilepointer = freopen(stdoutfilename, "a", stdout)) == NULL)
	{
	    prerror("couldn't reopen the 7800.asm file.");
	}
    }

    printf("gameend\n");

    barf_graphic_file();

    barfmultiplicationtables();

    printf(" if SPACEOVERFLOW > 0\n");
    printf(" echo \"\"\n");
    printf(" echo \"######## ERROR: space overflow detected in\",[SPACEOVERFLOW]d,\"areas.\"\n");
    printf(" echo \"######## look above for areas with negative ROM space left.\"\n");
    printf(" echo \"######## Aborting assembly.\"\n");
    printf(" ERR\n");
    printf(" endif\n");

    printf(" \n\n");

    header_write(header, filename);
    create_includes(includes_file);
    fprintf(stderr, "7800basic compilation complete.\n");
    freemem(deallocate_mem);
    return 0;
}
