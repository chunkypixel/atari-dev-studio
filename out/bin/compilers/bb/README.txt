Batari BASIC - a Basic Compiler for the Atari 2600
 	      Version 1.0
    Copyright 2005-2007 by Fred Quimby
         email: c9r@hotmail.com
__________________________________________

batari Basic is free of charge but is not in the public domain.  It may not be sold for profit, nor included in any product sold for profit, without the author's prior written consent.

See license.txt for more information.

The license does not apply to Atari 2600 games created with Batari BASIC.  You may license these games however you wish.  Some batari Basic games have been published and are available for sale on cartridge.  
______________________________________

WHAT IT IS:
___________

batari Basic (bB) is a BASIC-like language for creating Atari 2600 games.  It is a compiled language that runs on a computer, and it creates a binary file that can be run on an Atari 2600 emulator or the binary file may be used to make a cartridge that will operate on a real Atari 2600.

This is version 1.0.  Although this version is expected to be much more reliable than the various alpha and beta builds were released since July, 2005, it likely contains bugs.  If you find any bugs, please report them to me by posting on the Atari 2600 Basic forum on Atariage, or by emailing me at c9r@hotmail.com.  If you send email, please include "batari" somewhere in the subject line.

If there are a great deal of nasty bugs, a maintenance version may be released soon, so periodically check the batari Basic website for updates.

To learn how to use Batari Basic, please refer to the tutorials, the command reference 
(commands.html) and the example programs, all included in this release.

______________________________________________________________________________

GETTING STARTED:
________________

Extract the contents of the zip file to a new directory.  The name of the directory doesn't matter, but for consistency with this guide and the tutorials, you may wish to use C:\Atari2600\bB.

MS-DOS/Windows:_______________
Before you continue, you will need to move GNU sed from its subdirectory to your bB directory, e.g. C:\Atari2600\bB. Although bB will run without moving the program, sed will improve error reporting. sed is used to limit the amount of redundant warnings and bogus errors that the assembler tends to produce. sed was not placed in the same directory as bB to avoid confusion with their conflicting licensing terms.Batari Basic is a DOS/Windows command line program which must typically be run at the Windows command prompt. It will also run under pure DOS (i.e. without Windows running) with special considerations (see DOS compatibility in the help.html file.)The quickest way to get started is to run batari Basic from the Windows command prompt by using the batch file (2600bas.bat.) This may be found in the "bB" folder in your installation directory.This version of bB requires that an environment variable and path are set so that you can compile your source files no matter where they are located. So before you run bB, you need to set the "bB" environment variable and path to your bB folder. There are several ways to do this. The easiest way is to just type in the commands below. This will be active for the duration of your session, but only in the window where you define it. e.g.:set bB=c:\Atari2600\bBpath=%path%;c:\Atari2600\bBIf you want this set permanently every time you start DOS or the Windows command prompt, you may add the two above lines to the autoexec.nt (Windows NT/2k/XP) or autoexec.bat (DOS/Windows 95/98/Me) file. autoexec.nt is typically located either in C:\WINNT\SYSTEM32 or C:\WINDOWS\SYSTEM32, and autoexec.bat is in the root directory. If the files don't exist, create them.Alternatively, there is a way to change the path and environment variables in Windows without using autoexec. Since this procedure is quite involved, it is not covered here. Refer to the tutorials for complete instructions on how to do this.Once the above is done, switch to a folder containing a bB source file and type:2600bas filenamewhere filename is the name of the BASIC source file you wish to compile. The project folder can be any folder you create to store your files.To test your installation, several sample programs are included in the "Samples" folder. Switch to this folder and type:2600bas sample.basIf successful, a file called sample.bas.bin will be generated that you can run on an emulator. The sample program is not very interesting, but note how simple it was to write. Open sample.bas in a text editor and take a look at how it was written.Windows:________
If you prefer to use a fancy Windows-based interface, you can use one of the various IDE's (Integrated development environments) available that will work with bB. Please refer to Tutorial 3 for more information about how to use Crimson Editor with bB.Alternatively, Jacco Mintjes has written a Windows-based interface just for bB. 2600IDE is available at the batari BASIC homepage. Note that to use 2600IDE, you must use the included 2600baside.bat file and not the one that comes with 2600ide.Please note that while we will try to ensure that bB works with the above IDE's, we can't guarantee this forever since we did not program the IDE's, there is no source and neither IDE is being actively developed.Please see the tutorials for more detailed instructions about running the compiler.Linux and OS X:
_______________
Mac OSX and statically-linked Linux binaries are also available for download, but these aren't covered in detail, so you will need to do some configuration yourself to get things working.The binaries may be downloaded from the batari Basic website. Included with each download are four binaries (2600basic, preprocess, postprocess, and optimize) and a shell script (2600basic.sh) that you may use in place of the batch file to compile your bB programs. Copy the binaries and shell script to your main bB folder if you plan to use one of these builds.In either case, you will need to set bB's path and environment variable. How you do this depends on what shell you are using. The environment variable and path should be set to the location of your bB binary files, for example:export bB=$HOME/Atari2600/bBexport PATH=$PATH:$bBI'm sure there is a way to make the above permanent, but I don't know how to do that offhand. If you do, please let us know.Also, Mac OSX, Linux and probably all UNIX-like operating systems will already have sed, so there is no need to download it.Other platforms:
________________
bB will work with some DOS/Windows emulators, namely DOSBox 0.65 or later. Some special considerations are needed here (see help.html under DOS compatibility.) Linux users might be able to use WINE to run bB, but I cannot verify that.If none of the included binaries will work, you can get the source and compile it using a C compiler that supports makefiles. You will also need an appropriate lexical analyzer generator such as lex or GNU flex. If you have the appropriate tools, typing "make" will compile the software. It has been compiled successfully on many platforms without any issues. The source is available on the batari Basic website.If you are building bB from source on a UNIX-like OS, you can probably still use the 2600basic.sh shell script, and so some of the section above regarding Linux and OSX may also apply. If you are building under some other platform not listed here, chances are you will need to write your own script to run bB. 

HOW IT WORKS:
_____________

Not unlike other compilers, batari BASIC uses a 4-step compilation process:

1. Preprocess
2. Compile
3. Link
4. Assemble

1.  The preprocessor takes your Basic code, and reformats and tokenizes it so the compiler can understand it.  Certain errors can be caught at this stage.
2. The compiler converts your Basic code into assembly language.  It will create a temporary file called bB.asm.  The Basic code is preserved as comments in this file so that those wishing to study assembly language can learn by studying how the Basic code was converted.
3.  The linker splits the Basic code into sections if needed, then concatenates them, along with the kernel, modules and compilation directives into a composite assembly language file.
(3a.) An optional stage is a peephole optimizer that looks for redundant and unnecessary code in the composite assembly file.
4.  The assembler converts assembly language to a binary file that contains machine code that can run on an emulator or a real Atari 2600.

Revision History
________________
Note: Lists of changes are not comprehensive.

1.0: February 14, 2007
Official release
Changes:
Reinstated exotic illegal opcodes that were removed in version 0.3
pfread function for the multisprite kernel
sequential data streams >256 bytes
Superchip support
eliminated HMOVE line above score
Added score to multisprite kernel
Improved flicker algorithm in multisprite kernel
No longer need module for multiplication by 16, 32, 64, or 128
Ability to specify vertical resolution of playfield rows
Ability to specify the overall height of the playfield rows
pfscore bars
HUDs (minikernels)
  6 lives
  6 lives + status bar
Display should now have 262 scanlines
Added ability to set reflection bit for sprites in multisprite kernel
Optimized multisprite kernel for space
reboot command: warm start of current ROM
pop command: pulls out of subroutine without needing a return
7800 detection
batch file invokes sed to limit DASM's output to something more meaningful
Fixed bugs:
  playfield: command in standard kernel now work in all banks rather than just the last
  fixed point math assignments only worked when at the end of a line
  blank lines in data statements now allowed
  two parentheses at beginning of assignment no longer detected as function
  one bit assigned to another now actually works
  unary minus should work now
  math modules now work with bankswtiched games

Beta 0.99c: June 30, 2006
Unreleased build
Changes:
Kernel_options directive, which includes:
  Paddle reading
  Multicolored playfield
  Multicolored players
  ability to remove blank lines in playfield

Beta 0.99b: March 2, 2006
Unofficial, incomplete release
Changes:
Fixed many nasty bugs with fixed point math
vblank keyword
16-bit random number generator
bug with expression evaluator fixed
Added BSD-style license (see license.txt)
Improved some modules

Beta 0.99a: January 14, 2006
Unofficial, incomplete release
Changes:
Multisprite kernel implemented
Bankswitching
Full expression evaluation
debugging tools
TV type setting
pfclear command
playfield: command

Alpha 0.35: August 26, 2005
Maintenance release to fix some particularly nasty bugs.
Changes:
include command now works
bit operations now compile properly
4.4 fixed point math didn't sign-extend when adding to 8.8
Fixed point math adds/subtracts by 1.xx no longer drop the .xx
ballheight or missileXheight of 0 or 1 no longer breaks the kernel
Fixed batch file to work with Windows 95/98/ME
More than one || per program now allowed
Maybe more that I can't remember now

Alpha 0.3: August 23, 2005
Major changes:
standard kernel now has the ball
8.8 and 4.4 fixed point types
- automatic conversion from one type to another in assignments
- addition/subtraction routines do automatic conversion if multiple types are used
- immediate decimal numbers allowed, either negative or positive
- 8.8 types can be used wherever integers are used
- 4.4 can't be used anywhere but can be added/subtracted/assigned to other types
data statement length keyword
remove trailing commas from data statements
set optimization for size/speed
full divide/multiply
- optional: multiply can produce a 16-bit result or divide can produce remainder
bit operations - assign one bit to another
for-next loop bug fixed (foward loops by step >1 ended too soon)
"else" allowed in if-thens
Able to set the filename of variable alias file
set ROM size to 2k or 4k
smartbranching now accessed via set instead of rem
REFPX bug fixed
uses includes file for spcifying kernels and organizing modules
include additional modules with include command
pfread function (determine if pixel is off or on)
fixed bug in decreasing for-next loops
function declaration for user functions:
- functions can be in bB or asm
- optinally can be compiled separately and included as modules
score=score+ var now supports vars other than a-z
fixed bugs in if-thens for bit reads
longer variable names allowed (50 chars max.)
allow arrays as arguments in all functions (in user functions or built-in 
fns like pfpixel)
improved error handling/reporting:
- more descriptive errors
- line in file now echoed
const statement for defining constants
optimized code
fixed < and > comparisons, and added <= and >=
fixed collision checks
used lex to help with parsing/preprocessing
score=score-1 bug fixed
fixed bogus gosub/return errors
on...goto now allows labels instead of just linenumbers
allow negative numbers in code
{whew!}

Alpha 0.2: July 15, 2005
Major changes:

score calculation improved.
slight kernel improvements
alphanumeric labels allowed, and labels/linenumbers are now optional.
blank lines allowed
indexing (array-like feature) implemented
data statement implemented
fixed bug in inline asm where it was impossible to add labels
one boolean now allowed in an if-then (&&,||)
ability to access individual bits
fixed bug where return command wasn't recognized
for-next loops added
vastly improved parser - not nearly as sensitive to spacing
dim statement for alternate variable names
Upon compilation, DASM shows bytes free in ROM
removed exotic illegal opcodes that would cause problems in some emulators, like PCAE
Included files are now in cr/lf format to patch a limitation of DASM
fixed various bugs in pfpixel and pfhline routines
on....goto added
Fixed problem where duplicate labels were created

Alpha 0.1: July 7, 2005
Initial release.

The batari Basic team:
________________________________________________________________________

I would like to thank those who have helped me develop bB.  Actually, lots of people have
helped, but some have helped a great deal.  This is not a complete list of contributors or 
contributions!

Michael Rideout: Wrote the tutorials, added Superchip support, reported countless bugs, made many helpful suggestions, and is instrumental with helping others learn the language.
Bob Montgomery: Rewrote the standard kernel and contributed the multisprite kernel.
Kirk Israel: Hosted the bB webpage, created various bB tools, and suggested many great improvements.
Doug Dingus: Documentation of version 0.1, found numerous bugs and wrote the first playable game.
David Galloway: Wrote the fixed-point math module.
Duane Alan Hahn: Immensely improved the documentation (the commands.html file.)
Chris Read: Maintains bB game archive.
Albert Yarusso: For Atariage, without which, bB probably never would have been created!

Acknowledgments: Thomas Jentzsch, John Payson, Zach Matley, Chris Walton, Glenn Saunders, Manuel Polik and Darrell Spice.

I can't remember what some of the above people have done, but I'm sure they were helpful in some way.  Some people weren't mentioned because I don't know their real names.  If I've forgotten anyone, please let me know.

HOW YOU CAN HELP:

We encourage support and code contributions to this project.  We do not need or want monetary support, however - this project is done as a hobby.  We enjoy the challenge of programming and we do it for free.  If you think you can help develop Batari BASIC, please let us know!We'd especially like some experienced 2600 assembly programmers who are willing to write a newkernel or two.  We have some ideas for new kernels, but lack the time, and in some ways, the skill towrite them.  Note that we cannot pay you to help us - but you will get credit for your work if it isincluded in a later release, and you get full bragging rights.