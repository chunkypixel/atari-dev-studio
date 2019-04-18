# Atari Dev Studio
Welcome to Atari Dev Studio for designing games for the Atari 8-bit systems (Atari 2600 and 7800). Atari Dev Studio is a one-stop-shop for any programmer and includes a number of built-in features to allow you to design, develop and test games for your favourite system. 

Get started with batari Basic (2600) or 7800basic (7800) using easy to learn BASIC-like languages or go hard-core with assembly using dasm.  During development test your creation using the Stella (2600) or A7800 (7800) emulators right from within Atari Dev Studio.

## Features
![Atari Dev Studio](images/ataridevstudio-emulator.png)

Atari Dev Studio includes the following:

* Develop your game on Microsoft Windows, Linux or macOS
* Compile source code for your Atari 2600 or 7800 using batari Basic, 7800basic or dasm.
* Optionally launch and test your game using the Stella (2600) or A7800 (7800) emulators
* Manage your project using the File Explorer or check-in your source code directly to Github using the built-in features of the Visual Studio Code platform.
* Provide references to your own specific releases of each language or emulator rather than use the includes ones (via the Preferences -> Settings -> Atari Dev Studio)

## Requirements
Atari Dev Studio is an extension for Microsoft's cross-platform IDE Visual Studio Code and will run on the Microsoft Windows, Linux and macOS platforms.

The latest releases of batari Basic, 7800basic, dasm, Stella and A7800 are included so you can begin coding straight after installing the extension.

> Tip: Extensions are installed and managed directly with-in Visual Studio Code.

## Known Issues

There are currently no known issues. If you find a problem please raise an issue on [Github](https://github.com/chunkypixel/atari-dev-studio/issues) or contact [mksmith](http://atariage.com/forums/user/66583-mksmith/) at the AtariAge community.

## Acknowlegments
This extension is only available due to the great people of the AtariAge community who have created these tools to help developers build their vision.  Special thanks to the following for either allowing the inclusion of their tools or for their ongoing help and encouragement:

* 7800basic - Mike Saarna (RevEng)
* batari Basic - Fred 'batari' Quimby
* dasm  
* Stella emulator - Stephen Anthony (stephena)
* A7800 emulator - Mike Saarna (RevEng) and Trebor
* TwentySixHundred, Lillapojkenpåön and vbauer for thier additional testing and bug-reporting of the previous incarnation of this extension for batari Basic.
* The AtariAge community including Albert, RevEng, Random Terrain, Muddyfunster, Gemintronic, Karl G and ZeroPage Homebrew

## Languages

Atari Dev Studio includes the following programming languages:

### batari Basic (release BB.1.1d.reveng41)
batari Basic created by Fred 'batari' Quimby is a BASIC style language used in the creation of Atari 2600 games. batari Basic is compiled to generate a binary file that can by used on actual Atari 2600 VCS hardware via cartridge (such as a Harmony or UNO cart) or by using an Atari 2600 VCS emulator such as Stella.

### 7800basic (release 0.6 Jul 12 2017 22:46:35)
7800basic is a BASIC-like language for creating Atari 7800 games.  It is a compiled language that runs on a computer, and it creates a binary file that can be run with an Atari 7800 emulator, or the binary file may be used to make a cartridge that will operate on a real Atari 7800.

7800basic is derived from batari basic, a BASIC-like language for creating Atari 2600 games. Special thanks to the bB creator, Fred Quimby, and all of the the bB contributors!

7800basic is included as part this extension with many thanks to Mike Saarna (RevEng).  

### dasm (release 2.20.11 - 20171206)


## Emulation

Atari Dev Studio includes the following emulators for testing purposes:

### Stella (release 6.0)
Stella is a multi-platform Atari 2600 VCS emulator released under the GNU General Public License (GPL). Stella was originally developed for Linux by Bradford W. Mott, and is currently maintained by Stephen Anthony. Since its original release several people have joined the development team to port Stella to other operating systems such as AcornOS, AmigaOS, DOS, FreeBSD, IRIX, Linux, OS/2, MacOS, Unix, and Windows. The development team is working hard to perfect the emulator and we hope you enjoy our effort.

Stella is included as part this extension with many thanks to Stephen Anthony. Stella is a external project and can be downloaded seperately [here](https://stella-emu.github.io). If you enjoy using Stella place consider [donating](https://stella-emu.github.io/donations.html) to ensure it's continued development.

### A7800


A7800 is included as part this extension with many thanks to Mike Saarna (RevEng).