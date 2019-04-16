batari Basic - README_UX.txt - Version 1.0 - 2013.09.24

_What_Is_This_Doc?_

  This document explains how to run bB under Unix. Please refer to the 
  bundled README.txt for a bB overview and and license terms.


_Supported_Unix_OSes_

  This version of batari Basic comes bundled with 32-bit x86 binaries for both
  OS X and Linux. These binaries should run on 64-bit versions of these OSes. 

  If you wish to run bB on another Unix, you'll need to rebuild the binaries.
  You may wish to refer to the provided COMPILE.txt document.


_Installing_bB_for_Unix_-_the_Easy_Way_

  1. download and unzip the bB distribution to your home directory, 
     ensuring the directory structure in the zip is maintained. I.e. there
     should be "includes" and "samples" subdirectories.

  2. open a terminal window, and "cd" to the unzipped bB directory.

  3. run the installer and follow the instructions: ./install_ux.sh


_Installing_bB_for_Unix_-_Manual_Installation_

  1. download and unzip the bB distribution to your home directory, 
     ensuring the directory structure in the zip is maintained. I.e. there
     should be "includes" and "samples" subdirectories.

  2. ensure these two environment variables are set...

       export bB=$HOME/bB
       export PATH=$bB:$PATH

     ...You should substitute the actual location of the unzipped bB 
     distribution on your system in the first line.

  3. compile your basic program using the 2600basic.sh script.

       e.g. 2600basic.sh myprogram.bas

     It should produce a binary named after the basic program, but ending 
     with the file extension ".bin".

     If it doesn't work, ensure you have set the bB and PATH variables 
     correctly.
