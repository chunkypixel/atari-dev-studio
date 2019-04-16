/*
     7800filter
	reads from stdin, filters out a bunch of 7800basic symbol names, and writes to stdout.
*/

#define BUFSIZE 1000

#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Our term list. If the term starts with ^ it will only be matched at the start
// of a line...

char *filterterm[] = {
	"^bankswitchmode",
	"^pauseroutineoff",
	"^BANKRAM",
	"^DEV",
	"^collisionwrap",
	"^pokeysupport",
	"^ROM128K",
	"^ROM256K",
	"^ROM512K",
	"^DOUBLEWIDE ",
	"^ZONEHEIGHT ",
	"^ROM48k ",
	"^ROM16k ",
	"^ROM8k",
	"^0.pause",
	"^0.userinterrupt",
	"^0.topscreenroutine",
	"^ATOMICSPRITEUPDATE",
	"^FINESCROLLENABLED",
	"^AVOXVOICE",
	"^FRAMESKIPGLITCHFIX",
	"^plotvalueonscreen",
	"^included.pokeysound.asm",
	"^included.7800vox.asm",
	"^included.hiscore.asm",
	"^MUSICTRACKER",
	"^HSSCORESIZE",
	"^songdatastart_song_highscore",
	"^sfx_highscore",
	"^vox_highscore",
	"^FRAMESKIPGLITCHFIXWEAK",
	"^ZONECOUNT",
	"^HSSECONDS",
	"^DEBUGCOLOR",
	"^TURNEDOFF",
	"^HSGAMENAMELEN",
	"^HSSUPPORT",
	"^CHECKOVERWRITE",
	"^included.tracker.asm",
	"^SCREENHEIGHT",
	"^ZONELOCKS",
	"^DEBUGINTERRUPT",
	"^TIASFXMONO",
	"^SPRITECOUNTING",
	"^HSCOLORCHASESTART",
	"^BUZZBASS",
	"^NOTIALOCK",
	"^hiscorefont",
	"^MCPDEVCART",
	"^HSCUSTOMLEVELNAMES",
	"^HSNOLEVELNAMES",
	"^DEBUGFRAMES",
	"^HSGAMERANKS",
	"^ONEBUTTONMODE",
	"^SOFTRESETASPAUSEOFF",
	"^DLMEMSTART",
	"^DLMEMEND",
	" Unresolved Symbols",
	"" };

int main(int argc, char **argv)
{
	char linebuffer[BUFSIZE];
	int t,match;
        while(fgets(linebuffer,BUFSIZE,stdin)!=NULL)
	{
		match=0;
		for(t=0;filterterm[t][0]!='\0';t++)
		{
			if(filterterm[t][0]=='^')
			{
				if(strncmp(linebuffer,filterterm[t]+1,strlen(filterterm[t]+1))==0)
				{
					match=1;
					break;
				}
			}
			else
			{
				if(strstr(linebuffer,filterterm[t])!=NULL)
				{
					match=1;
					break;
				}
			}
		}
		if(match==0)
			fputs(linebuffer,stdout);
	}
	return(0);
}
