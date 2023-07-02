// Provided under the GPL v2 license. See the included LICENSE.txt for details.

/*
     banksetsymbols
        Parses through banksetrom.symbol.txt. If it finds symbols regarding 
        inline character strings or map data, it appends them to the
        7800basic_variable_redefs.h file.
*/

#define BUFSIZE 1000

#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>

void prerror (char *format, ...);

int main (int argc, char **argv)
{
    FILE *in, *out;
    fprintf (stderr, "starting bankset symbol transfer.\n");
    in = fopen ("banksetrom.symbol.txt", "rb");
    if (in == NULL)
	prerror ("couldn't open banksetrom.symbol.txt for reading.");
    out = fopen ("7800basic_variable_redefs.h", "a");
    if (out == NULL)
	prerror ("couldn't open 7800basic_variable_redefs.h for writing.");
    char inbuffer[BUFSIZE];
    char variable[BUFSIZE];
    char value[BUFSIZE];

    while (fgets (inbuffer, BUFSIZE, in) != NULL)
    {
	if (((strncmp (inbuffer, "alphadata", 9) == 0) && (inbuffer[9] >= '0')
	     && (inbuffer[9] <= '9'))
	    || (strncmp (inbuffer, "highscoredifficulty", 19) == 0)
	    || (strncmp (inbuffer, "easylevelname", 13) == 0)
	    || (strncmp (inbuffer, "mediumlevelname", 15) == 0)
	    || (strncmp (inbuffer, "hardlevelname", 13) == 0)
	    || (strncmp (inbuffer, "expertlevelname", 15) == 0)
	    || (strncmp (inbuffer, "ranklabel_", 10) == 0)
	    || (strncmp (inbuffer, "HSGAMENAMEtable", 15) == 0)
	    || (strncmp (inbuffer, "HSHIGHSCOREStext", 16) == 0)
	    || (strncmp (inbuffer, "player0label", 12) == 0)
	    || (strncmp (inbuffer, "player1label", 12) == 0)
	    || (strncmp (inbuffer, "player2label", 12) == 0)
	    || (strncmp (inbuffer, "bset_", 5) == 0) || (strncmp (inbuffer, "highscorerank", 13) == 0))

	{
	    sscanf (inbuffer, "%s %s", variable, value);
	    fprintf (out, "%s = $%s\n", variable, value);
	}

    }
    fclose (in);
    fclose (out);
    fprintf (stderr, "bankset symbol transfer complete.\n");
    return (0);
}

void prerror (char *format, ...)
{
    char buffer[1024];
    va_list args;
    va_start (args, format);
    vsnprintf (buffer, 1023, format, args);
    fprintf (stderr, "bankset symbol transfer error: %s\n", buffer);
    va_end (args);
    exit (1);
}
