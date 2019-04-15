7800AsmDevKit README
------------------------------------------------------------------------
Overview
	7800AsmDevKit is a collection of tools required for developing games
	for the 7800 in assembly code. It contains the following components:

	Dasm		the popular 6502 assembler
	7800sign	to cryptographically sign 7800 A78 or ROM images
	7800header	to add/update/edit headers on A78 or ROM images

Installation
	1. Unzip the 7800DevKit package and move the new directory to a 
	convenient location, renaming the directory if you like. 

	2. Run the installation script for your Operating System and follow the 
	on screen instructions:

	Linux or OS X: open a terminal, "cd" to the 7800AsmDevKit directory,
		and type "./install_ux.sh"

	Windows: open a CMD window, "cd" to the 7800AsmDevKit directory, and
		type "install_win.bat"

	If you move or upgrade, simply re-run the script again to register the
	new location, and re-open any command windows.

Usage Overview
	
	To assemble a binary ROM image from 7800 source code with dasm, 
	open a terminal/CMD window and type:
		7800asm sourcefile.asm

	This will also run the 7800sign utility to cryptographically sign the 
	resulting binary for the 7800.

	The samples/simple directory contains simple.asm 7800 source code
	that you may examine and test with.

	To create an A78 file for emulators, simply type the following, 
	substituting your own filename for BINFILENAME:
		7800header BINFILENAME

	To modify an existing A78 file, simply type the following, 
	substituting your own filename for A78FILENAME:
		7800header A78FILENAME

Licensing
	Dasm is copyright 1988-2014 by dasm contributors, and distributed under
		the GPL. See the provided source code package for details.
	7800sign is copyright 2005 by Bruce Tomlin. 
	7800header is copyright 2015 by Mike Saarna.

