7800basic - a Basic Compiler for the Atari 7800

   distributed with code that is...
   copyright 2005-2013 by Fred Quimby
   copyright 2013-2014 by Michael Saarna
   copyright 2004      by Bruce Tomlin
   copyright 1995-2014 by the zlib/libpng team.  (see source for details)
   copyright 1988-2008 by the dasm contributors. (see source for details)

-----------------------------------------

7800basic is free of charge but is not in the public domain.  It may not be 
sold for profit, nor included in any product sold for profit, without the 
author's prior written consent.

See license.txt for more information.

The license does not apply to Atari 7800 games created with 7800basic. You 
may license these games however you wish.  

-----------------------------------------


WHAT IT IS?
-----------

7800basic is a BASIC-like language for creating Atari 7800 games.  It is a 
compiled language that runs on a computer, and it creates a binary file that 
can be run with an Atari 7800 emulator, or the binary file may be used to 
make a cartridge that will operate on a real Atari 7800.

7800basic is derived from batari basic, a BASIC-like language for creating
Atari 2600 games. Special thanks to the bB creator, Fred Quimby, and all of 
the the bB contributors!

Please see README.bB.txt for the original bB terms and contributor list.

GETTING STARTED
---------------
Extract the contents of the zip file to a new directory.  The name of the 
directory doesn't matter, but for consistency with this guide and the 
tutorials, you may wish to use "7800basic"

Getting Started
----------------------------
7800basic is distributed as a single zip file. Download the latest zip 
file and unzip to whichever location you desire to use. Make sure your 
unzip utility creates the expected subdirectories (/docs, /includes, ...) 
rather than sticking all of the files into one directory.

Windows users should double-click and the provided install_win.bat file 
and follow the instructions presented.

If install_win.bat reports failure, you should manually set the following
variables to point at your 7800basic directory.

e.g.: set basic7800dir=c:\7800basic
      set PATH=%PATH%;c:\7800basic

If you want this set permanently every time you start the Windows command 
prompt, you may add the two above lines to the autoexec.nt (Windows NT/2k/XP) 
or autoexec.bat (DOS/Windows 95/98/Me) file. autoexec.nt is typically located 
either in C:\WINNT\SYSTEM32 or C:\WINDOWS\SYSTEM32, and autoexec.bat is in 
the root directory. If the files don't exist, create them.

Once the above is done, switch to a folder containing a 7800basic source file 
and type:

  7800bas filename

where filename is the name of the BASIC source file you wish to compile. The 
project folder can be any folder you create to store your files.

To test your installation, several sample programs are included in the 
"samples" folder. Switch to this folder and type:

  7800bas simple.bas

If successful, a file called simple.bas.a78 will be generated that you can 
run on an emulator. The sample program is not very interesting, but note how 
simple it was to write. Open sample.bas in a text editor and take a look at 
how it was written.


Getting Started with Linux/OS X/other Unixes
---------------------------------------------
This version of 7800basic comes bundled with 32-bit x86 binaries for both
OS X and Linux. These binaries should run on 64-bit versions of these OSes. 

If you wish to run 7800basic on another Unix, you'll need to rebuild the 
binaries. You may wish to refer to the provided COMPILE.txt document.

7800basic for Unix - the Easy Way
---------------------------------
  1. download and unzip the 7800basic distribution to your home directory, 
     ensuring the directory structure in the zip is maintained. I.e. there
     should be "includes" and "samples" subdirectories.

  2. open a terminal window, and "cd" to the unzipped 7800basic directory.

  3. run the installer and follow the instructions: ./install_ux.sh

7800basic for Unix - Manual_Installation
----------------------------------------
  1. download and unzip the 7800basic distribution to your home directory, 
     ensuring the directory structure in the zip is maintained. I.e. there
     should be "includes" and "samples" subdirectories.

  2. ensure these two environment variables are set...

       export bas7800dir=$HOME/7800basic
       export PATH=$bas7800dir:$PATH

     ...You should substitute the actual location of the unzipped 7800basic 
     distribution on your system in the first line.

  3. compile your basic program using the 7800basic.sh script.

       e.g. 7800basic.sh myprogram.bas

     It should produce a binary named after the basic program, but ending 
     with the file extension ".bin".

     If it doesn't work, ensure you have set the bas7800dir and PATH variables 
     correctly.

How It Works
------------
Not unlike other compilers, 7800 BASIC uses a 4-step compilation process:

1. Preprocess
2. Compile
3. Link
4. Assemble

1.  The preprocessor takes your basic code, and reformats and tokenizes it 
    so the compiler can understand it.  Certain errors can be caught at this 
    stage.

2.  The compiler converts your Basic code into assembly language. It will 
    create a temporary file called 7800.asm.  The basic code is preserved as 
    comments in this file so that those wishing to study assembly language 
    can learn by studying how the Basic code was converted.

3.  The linker splits the basic code into sections if needed, then 
    concatenates them, along with the kernel, modules and compilation 
    directives into a composite assembly language file.

3a. An optional stage is a peephole optimizer that looks for redundant and 
    unnecessary code in the composite assembly file.

4.  The assembler converts assembly language to a binary file that contains 
    machine code that can run in an emulator or on a real Atari 7800.

