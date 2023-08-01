// Provided under the GPL v2 license. See the included LICENSE.txt for details.

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
    "^PAL",
    "^TIASFXMONO",
    "^MCPDEVCART",
    "^MULTIBUTTON",
    "^debugcolor",
    "^collisionwrap",
    "^pokeysupport",
    "^pokeysfxsupport",
    "^pokeykeysupport",
    "^ROM32K",
    "^ROM52K",
    "^ROM128K",
    "^ROM256K",
    "^ROM512K",
    "^ROM272K",
    "^ROM144K",
    "^ROM528K",
    "^USED_PLOTVALUEEXTRA",
    "^DOUBLEWIDE ",
    "^ZONEHEIGHT ",
    "^BOXCOLLISION ",
    "^ROM48K ",
    "^ROM16K ",
    "^ROM8K ",
    "^ROMAT4K ",
    "^CANARYOFF ",
    "^EXTRADLMEMORY ",
    "^USED_PLOTVALUE ",
    "^LONGCONTROLLERREAD ",
    "^DRIVINGSUPPORT ",
    "^DRIVINGBOOST ",
    "^KEYPADSUPPORT ",
    "^MOUSESUPPORT ",
    "^MOUSETIME ",
    "^MOUSE0SUPPORT ",
    "^MOUSE1SUPPORT ",
    "^MOUSEXONLY ",
    "^PRECISIONMOUSING ",
    "^PADDLESUPPORT ",
    "^PADDLE0SUPPORT ",
    "^PADDLE1SUPPORT ",
    "^PADDLESMOOTHINGOFF ",
    "^PADDLESCALEX2 ",
    "^ZONE ",
    "^TWOPADDLESUPPORT ",
    "^TRAKBALLSUPPORT ",
    "^TRAKBALL0SUPPORT ",
    "^TRAKBALL1SUPPORT ",
    "^TRAKXONLY ",
    "^TRAKTIME ",
    "^TIAVOLUME ",
    "^RMTVOLUME ",
    "^RMTOFFSPEED ",
    "^RMTNTSCSPEED ",
    "^RMTPALSPEED ",
    "^RMT ",
    "^FOURBITFADE ",
    "^PADDLERANGE ",
    "^LIGHTGUNSUPPORT ",
    "^DOUBLEBUFFER ",
    "^PLOTVALUEPAGE ",
    "^USED_ADJUSTVISIBLE ",
    "^HSCHARSHERE ",
    "^BANKSET",
    "^isBANKSETBANK ",
    "^SNES",
    "^MEGA7800",
    "^0.pause",
    "^0.userinterrupt",
    "^0.topscreenroutine",
    "^0.bottomscreenroutine",
    "^0.altgamestart",
    "^0.HSup",
    "^0.calledfunction_mul8",
    "^0.calledfunction_mul16",
    "^0.calledfunction_div8",
    "^0.calledfunction_div16",
    "^interrupthold",
    "_main2 ",
    "_main3 ",
    "_main4 ",
    "^ATOMICSPRITEUPDATE",
    "^FINESCROLLENABLED",
    "^AVOXVOICE",
    "^FRAMESKIPGLITCHFIX",
    "^plotvalueonscreen",
    "^included.pokeysound.asm",
    "^included.rmtplayer.asm",
    "^included.fourbitfade.asm",
    "^included.7800vox.asm",
    "^included.hiscore.asm",
    "^included.mega7800.asm",
    "^included.snes2atari.asm",
    "^MUSICTRACKER",
    "^HSSCORESIZE",
    "^songdatastart_song_highscore",
    "^sfx_highscore",
    "^vox_highscore",
    "^FRAMESKIPGLITCHFIXWEAK",
    "^ZONECOUNT",
    "^ZONEFROM ",
    "^ZONETO ",
    "^HSSECONDS",
    "^DEBUGCOLOR",
    "^DEBUGWAITCOLOR",
    "^TURNEDOFF",
    "^HSGAMENAMELEN",
    "^HSSUPPORT",
    "^CHECKOVERWRITE",
    "^included.tracker.asm",
    "^SCREENHEIGHT",
    "^ZONE",
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
    "^pokeysound.asm",
    "^pokeyaddress",
    "^rmtplayer.asm",
    "^fourbitfade.asm",
    "^BEADHEADER",
    "^LONGDEBUG",
    "^hiscore.asm",
    "^tracker.asm",
    "^mega7800.asm",
    "^snes2atari.asm",
    " Unresolved Symbols",
    "^SGRAM",
    "^ALWAYSTERMINATE",
    "^NODRAWWAIT",
    "^NOLIMITCHECKING",
    "^INFO: Label",
    "^CRASHDUMP",
    "^BREAKPROTECT",
    "^dumpbankswitch",
    ""
};

int main (int argc, char **argv)
{
    char linebuffer[BUFSIZE];
    int t, match;
    while (fgets (linebuffer, BUFSIZE, stdin) != NULL)
    {
	match = 0;
	for (t = 0; filterterm[t][0] != '\0'; t++)
	{
	    if (filterterm[t][0] == '^')
	    {
		if (strncmp (linebuffer, filterterm[t] + 1, strlen (filterterm[t] + 1)) == 0)
		{
		    match = 1;
		    break;
		}
	    }
	    else
	    {
		if (strstr (linebuffer, filterterm[t]) != NULL)
		{
		    match = 1;
		    break;
		}
	    }
	}
	if (match == 0)
	    fputs (linebuffer, stdout);
    }
    return (0);
}
