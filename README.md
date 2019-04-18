# Atari Dev Studio
Welcome to Atari Dev Studio for designing homebrew games for the Atari 8-bit systems (Atari 2600 and 7800). Atari Dev Studio is a one-stop-shop for any programmer and includes a number of built-in features to allow you to design, develop and test games for your favourite system. 

Get started with batari Basic (2600) or 7800basic (7800) using easy to learn BASIC-like languages or go hard-core with assembly using dasm.  During development test your creation using the Stella (2600) or A7800 (7800) emulators right from within Atari Dev Studio.

![Atari Dev Studio](images/ataridevstudio-emulator.png)

## Requirements
Atari Dev Studio is an extension for Microsoft's cross-platform IDE Visual Studio Code and will run on the Microsoft Windows, Linux and macOS platforms.

The latest releases of batari Basic, 7800basic, dasm, Stella and A7800 are included so you can begin coding straight after installing the extension.

## Installing Atari Dev Studio

### What is Visual Studio Code?
Visual Studio Code (VS Code) is a streamlined code editor with support for development operations like debugging, task running, and version control. It aims to provide just the tools a developer needs for a quick code-build-debug cycle and leaves more complex workflows to fuller featured IDEs, such as Visual Studio.

### Which OSs are supported?
VS Code is a cross-platform application which runs on Windows, Linux and macOS. See [requirements](https://code.visualstudio.com/docs/supporting/requirements) for the supported versions.

> Note: Linux users on 64-bit systems will be required to install the 32-bit compatibility libraries on your system to ensure everything will run as expected. 

### Steps to install
1. Install **VS Code** from [here](https://code.visualstudio.com/Download) for your OS (depending on your OS there may be other avenues to install VS Code.)
2. Open **VS Code** and click the **Extensions** button on the **Activity Bar** to display the **Extensions** window.
3. From the **Extensions** window, type **Atari** into the **Search** box and press **Enter** to display the list of available extensions. From the list click the green **Install** button on the **Atari Dev Studio** item.

### Updating the extension
Updates will be regularly made available and will be announced via the **AtariAge** forum and you will be notified in VS Code. To update to the latest release:
1. Open **VS Code** and click on the **Extensions** button on the **Activity Bar** to display the **Extensions** window.
2. From the **Extensions** window, search the **Enabled** list and click the **Update** button on the **Atari Dev Studio** item.

It is recommended you restart VS Code after installing an update.

## Features
Atari Dev Studio includes the following features:
* Develop your game on Windows, Linux or macOS
* Compile source code for your Atari 2600 or 7800 using batari Basic, 7800basic or dasm
* Optionally launch and test your game using the Stella (2600) or A7800 (7800) emulators
* Manage your project using the File Explorer or version-control your source code directly with GitHub (and others) using the built-in features of the Visual Studio Code platform.
* Provide references to your own specific releases of each language or emulator rather than use the includes ones (via the Preferences -> Settings -> Atari Dev Studio)

Additional features are planned for the future. At this time the focus is on the core functionality and ensuring full cross-platform support.

## Known Issues
There are currently no known issues. If you find a problem please raise an issue on [GitHub](https://github.com/chunkypixel/atari-dev-studio/issues) or contact [mksmith](http://atariage.com/forums/user/66583-mksmith/) at the AtariAge community.

## Acknowlegments
This extension is only available due to the great people of the AtariAge community who have created these tools to help developers build their vision.  Special thanks to the following for either allowing the inclusion of their tools or for their ongoing help and encouragement:
* 7800basic - Mike Saarna (RevEng)
* batari Basic - Fred 'batari' Quimby
* dasm - the many contibutors
* Stella emulator - Stephen Anthony (stephena)
* A7800 emulator - Mike Saarna (RevEng) and Trebor
* Muddyfunster, TwentySixHundred, Lillapojkenpåön and vbauer for thier additional testing and bug-reporting of the previous incarnation of this extension for batari Basic.
* The AtariAge community including Albert, RevEng, Random Terrain, Gemintronic, Karl G and ZeroPage Homebrew

## Languages
Atari Dev Studio includes the following programming languages:

### batari Basic (release BB.1.1d.reveng41)
batari Basic created by Fred 'batari' Quimby is a BASIC-like language used in the creation of Atari 2600 games. batari Basic is compiled to generate a binary file that can by used on actual Atari 2600 VCS hardware via cartridge (such as a Harmony or UNO cart) or by using an Atari 2600 VCS emulator such as Stella.

batari Basic is an external project and can be downloaded seperately from [here](http://7800.8bitdev.org/index.php/Batari_basic).  Further information is about this release is available here at [AtariAge](http://atariage.com/forums/topic/214909-bb-with-native-64k-cart-support-11dreveng/).

### 7800basic (release 0.6 Jul 12 2017 22:46:35)
7800basic is a BASIC-like language for creating Atari 7800 games.  It is a compiled language that runs on a computer, and it creates a binary file that can be run with an Atari 7800 emulator, or the binary file may be used to make a cartridge that will operate on a real Atari 7800.

7800basic is derived from batari basic, a BASIC-like language for creating Atari 2600 games. Special thanks to the bB creator, Fred Quimby, and all of the the bB contributors!

7800basic is included as part of this extension with many thanks to Mike Saarna (RevEng).  7800basic is an external project and can be downloaded seperately [here](http://7800.8bitdev.org/index.php/7800basic).  Further information about this release is available here at [AtariAge](http://atariage.com/forums/topic/222638-7800basic-beta-the-release-thread/.)

### dasm (release 2.20.11 - 20171206)
dasm is a versatile macro assembler with support for several 8-bit microprocessors including MOS 6502 & 6507, Motorola 6803, 68705 & 68HC11, Hitachi HD6303 (extended Motorola 6801), and Fairchild F8.

Matthew Dillon started dasm in 1987-1988. Olaf 'Rhialto' Seibert extended dasm in 1995. Andrew Davie maintained dasm in 2003-2008. During all this time, several other versions of dasm sprung up all over the net as well, making the exact chronology quite complicated. Peter Froehlich started maintaining dasm in 2008, hoping (against hope) to unify the various strands of development a little, and to maybe give dasm another 20 years of productive life. :-)

## Emulation
Atari Dev Studio includes the following emulators for testing purposes:

### Stella (release 6.0)
Stella is a multi-platform Atari 2600 VCS emulator released under the GNU General Public License (GPL). Stella was originally developed for Linux by Bradford W. Mott, and is currently maintained by Stephen Anthony. Since its original release several people have joined the development team to port Stella to other operating systems such as AcornOS, AmigaOS, DOS, FreeBSD, IRIX, Linux, OS/2, MacOS, Unix, and Windows. The development team is working hard to perfect the emulator and we hope you enjoy our effort.

Stella is included as part of this extension with many thanks to Stephen Anthony. Stella is an external project and can be downloaded seperately [here](https://stella-emu.github.io). If you enjoy using Stella place consider [donating](https://stella-emu.github.io/donations.html) to ensure it's continued development.

### A7800 (release 188-03)
A7800 is a fork of the MAME Atari 7800 driver, with several enhancements added:
* Support for emulation of Proline Joysticks, VCS Joysticks, Lightguns, Paddles, * Driving Controllers, Keypads, Trak-Balls, Amiga Mice, and ST Mice.
Maria DMA timing has been improved further, with the addition of accurate DMA hole penalties.
* Improved saturated/normalized colors with palette selection.
* Streamlined UI including menu options to have an Atari 7800 system focus.
* A bug in the existing RIOT emulation has been fixed.
* MAME compatibility and syntax has been maintained, to allow for the reuse of MAME configuration files and front-ends.

A7800 is included as part of this extension with many thanks to Mike Saarna (RevEng). A7800 is an external project and can be downloaded seperately [here](http://7800.8bitdev.org/index.php/Emulators_and_Tools).