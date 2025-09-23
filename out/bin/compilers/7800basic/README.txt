7800basic - a Basic Compiler for the Atari 7800

Legal Stuff
-----------

   7800basic is created by Michael Saarna.
   7800basic is derived from the batari Basic compiler for the 2600, 
   which was created by Fred Quimby. (aka batari)

   Additional code is courtesy...
      -Bruce Tomlin (sign7800)
      -the zlib/libpng team
      -the dasm team
      -Emmanuel Marty (lzsa compression)

   See the LICENSE.txt file for details on licensing. 
  
-----------------------------------------------------------------------------

WHAT IT IS?
-----------

7800basic is a BASIC-like language for creating Atari 7800 games.  It is a 
compiled language that runs on a computer, and it creates a binary files that 
can be run with Atari 7800 emulators and flash carts, or the binary files
can be used to create a cartridge that will operate on a real Atari 7800.

If you find any bugs, please report them via github.


GETTING STARTED
---------------
Extract the contents of the zip file to a new directory.  The name of the 
directory doesn't matter. The examples in this guide assume "c:\7800basic"
for Windows, and $HOME/7800basic for Unix.

PREREQUISITES  
-------------
7800basic is distributed as Web Assembly binaries - these are universal 
programs that via the "wasmtime" runtime. This allows 7800basic to run
on any one of the many platforms that wasmtime supports.

To install wasmtime, use one of the following methods:
  - Windows: winget install BytecodeAlliance.Wasmtime.Portable
  - macOS/Linux: curl https://wasmtime.dev/install.sh -sSf | bash
  - macOS (Homebrew):   brew install wasmtime
  - Linux (Debian/Ubuntu): sudo apt install wasmtime
  - Linux (Fedora/RHEL):  sudo dnf install wasmtime
  - *: download from: https://wasmtime.dev/


Windows:
--------
7800basic is distributed as a single zip file. Download the latest zip 
file and unzip to whichever location you desire to use. Make sure your 
unzip utility creates the expected subdirectories (/docs, /includes, ...) 
rather than sticking all of the files into one directory.

To point Windows at the 7800basic directory, you should double-click the 
provided install_win.bat file, and follow the instructions presented.

If install_win.bat reports failure, you should manually set the following
variables to point at your 7800basic directory.

e.g.: set basic7800dir=c:\7800basic
      set PATH=%PATH%;c:\7800basic

This is accomplished differently, depending on your version of Windows. This
info is easily found on the Internet - https://tinyurl.com/yx756dug

Once the above is done, switch to a folder containing a 7800basic source file 
and type:

  7800bas filename

where filename is the name of the BASIC source file you wish to compile. The 
project folder can be any folder you create to store your files.

To test your installation, several sample programs are included in the 
"samples" folder. Switch to this folder and type:

  7800bas simple.bas

If successful, a file called simple.bas.a78 will be generated that you can 
run on an emulator, or add to a flash cart. The sample program is not very 
interesting, but note how simple it was to write. Open sample.bas in a text 
editor and take a look at how it was written.


Getting Started with Linux/OS X/other Unixes
--------------------------------------------
This version of 7800basic comes bundled with 32-bit and 64-bit binaries for
both OS X and Linux.  If you wish to run 7800basic on another Unix, you'll 
need to rebuild the binaries. (refer to the provided COMPILE.txt document)

The rest of this section assumes you understand what directory you saved
the 7800basic archive to, how to extract the archive file, how to open a
Unix shell, and how to use the "cd" command to move into in directories.


7800basic for Unix - the Easy Way
---------------------------------
  1. download and unzip/untar the 7800basic distribution to your home 
     directory, ensuring the directory structure is maintained.  I.e. there 
     should be "includes" and "samples" subdirectories.

  2. open a terminal window, and "cd" to the unzipped 7800basic directory.

  3. run the installer and follow the instructions: ./install_ux.sh

7800basic for Unix - Manual_Installation
----------------------------------------
  1. download and unzip/untar the 7800basic distribution to your home 
     directory, ensuring the directory structure is maintained. I.e. there
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

1.  Preprocess...
    The preprocessor takes your basic code, and reformats and tokenizes it 
    so the compiler can understand it.  Certain errors can be caught at this 
    stage.

2.  Compile...
    The compiler converts your Basic code into assembly language. It will 
    create a temporary file called 7800.asm.  The basic code is preserved as 
    comments in this file so that those wishing to study assembly language 
    can learn by studying how the Basic code was converted.

3.  Link...
    The linker splits the basic code into sections if needed, then 
    concatenates them, along with the kernel, modules and compilation 
    directives into a composite assembly language file.

[3a. Optimize...]
    An optional stage is a peephole optimizer that looks for redundant and 
    unnecessary code in the composite assembly file.

4.  Assemble...
    The assembler converts assembly language to a binary file that contains 
    machine code that can run in an emulator or on a real Atari 7800.

