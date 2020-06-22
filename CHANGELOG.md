# Change Log

The following enhancements and changes have been made to Atari Dev Studio:

## 0.5.7

* Updated Stella to 6.2.1 (Windows, Linux, macOS)
* Added missing batari Basic keywords: ballx, bally, ballheight (Karl G)

## 0.5.6

* Updated to latest 7800basic release v0.10 (Windows, Linux, macOS)
* Added document outline for dasm (shows labels, sub-labels, macros)
* Added Go to Definition and Go to References features for dasm
* Further enhancements to Go to Definition and Go to References features for batari basic and 7800basic

## 0.5.5

* Updated A7800 to 4.0 (Windows, Linux, macOS) [Removed XBoarD Expansion option from A7800 > Console settings]
* Added document outline for batari Basic and 7800basic (shows banks, labels, sub-labels, functions, macros, dmaholes)
* Added Go to Definition and Go to References features for batari Basic and 7800basic
* Added missing batari Basic keywords: missile0height, missile1height (slacker)

## 0.5.4

* Updated Stella to 6.2 (Windows, Linux, macOS)
* Added missing 7800basic keywords: songtempo, repeat

## 0.5.3

* Fixed issue with paths to Stella and A7800 emulators when extension path locations have spaces (vbauer)

## 0.5.2

* Updated to latest 7800basic release v0.9 (Windows, Linux, macOS)
* Fixed misspelt 7800basic keyword: 528k

## 0.5.1

* #30 [Done] Fixed issue with spaces in filenames when compiling with dasm (cwieland)

## 0.5.0

* Updated Stella to 6.1.2 (Windows, Linux, macOS)
* Fixed order of command-line args for A7800

Sprite Editor
* Updated resize dialog to use new sizing boundaries

## 0.4.9

* Fixed issue with scripts (makefile, shellscript, batch) not activating the Terminal window
* Simplified compilation of makefile, shellscript, batch files when compiling them directly

Sprite Editor
* Updated the batari Basic and assembly exports to output in bottom-to-top format and added a DPC+ export (top-to-bottom format)
* Updated the export dialogs 

## 0.4.8

Sprite Editor
* Fixed issue exporting images to batari Basic and assembly with incorrect width and height (karlg)
* Added a 'Show on Startup' checkbox to the Project dialog.  The editor will default to your last settings (Note: I need to work out how I can store these outside the current installation)

## 0.4.7

* Fixed issue where 7800basic was not handling .list.txt files as expected based on preference selections
* Fixed issue where spacing on custom compiler paths failed to compile (bB, 7800basic, dasm)
* Fixed an issue with setting custom dasm path related to the recent changes
* Updated the initialisation process to display messages in the compile log when custom compilers have been chosen. For warning or error messages pop-ups are also displayed.
* Added missing 7800basic keywords: switchpause, changecontrol, drivingposition0, drivingposition1, 2buttonjoy, 1buttonjoy, lightgun, paddle, trakball, driving, keypad, stmouse, amigamouse, atarivox, keypad0key0, keypad0key1, keypad0key2, keypad0key3, keypad0key4, keypad0key5, keypad0key6, keypad0key7, keypad0key8, keypad0key9, keypad0keys, keypad0keyh, keypad1key0, keypad1key1, keypad1key2, keypad1key3, keypad1key4, keypad1key5, keypad1key6, keypad1key7, keypad1key8, keypad1key9, keypad1keys, keypad1keyh
* Updated hover tooltips for 7800basic keywords

## 0.4.6

Sprite Editor
* #16 [Done] Added NTSC and PAL palettes for the 2600 (MikeBrownEmplas) 
* #17 [Done] Added ability to create 2600 sprites (added sizing, colors and palettes) and export them to batari Basic or assembly format (MikeBrownEmplas)
* #23 [Done] Rotated palette display to show vertically instead of horizontally (various)
* #29 [Done] Added Palette (region) selector to Palette window. Added PAL palette and updated NTSC palette to match A7800 (warm)
* Updated Project dialog for better selection of sizing ranges for the 7800 where steps follow expected boundaries (multiples of 4 for width and 8 for height). Also added 2600 ranges (8 for width and 1-256 for height)
* Updated loading of projects to validate the console and total colors of the file being loaded.  Added console to properties when saving a project.
* Updating loading and saving of projects, palettes, images and source to use the workspace root folder as a starting location if none is provided.

## 0.4.5

* Updated Stella to 6.1.1 (Windows, Linux, macOS)
* Added initial items for macOS Touch Bar - Build, Build & Run (Generation2Games)
* Added missing set romsize intellisense item: 144k (7800basic)

## 0.4.4

* Updated Stella to 6.1 (Windows, Linux, macOS)

## 0.4.3

* Added ability to compile Batch (.bat) or Shell Script (.sh) files (splendidnut) using the 'Make' process (change dasm compiler option to 'Make'). This option will automatically scan the root workspace folder for a 'makefile.bat' or 'makefile.sh' to use without having to open it first (make sure your base source code file is open and active as per the current compilation process). Note: you can also open the script file and compile from that if required.
* Renamed the 'Make' terminal window to 'Atari Dev Studio'

## 0.4.2

* Added new welcome message on first run after new update has been applied.
* Added the following keyboard shortcuts which will activate when you have a bataribasic, 7800basic or dasm language file open:
    - F5 - Build and Run 
    - Shift+F5 - Build

## 0.4.1

* Disposed and re-initialised Make terminal window (Andrew Davie) this should dispose of any running processes...
* Removed Make terminal set path feature as it's no longer required
* #24 Fixed spelling issue in 6502 hover tooltip popup (Andrew Davie)

## 0.4.0

* Added option to dasm compiler to allow you to select 'Make' to compile your source code (Andrew Davie). This option will automatically scan the root workspace folder for a Makefile to use without having to open it first (make sure your base source code file is open and active as per the current compilation process). Note: you can still open a Makefile and compile from that if required.

## 0.3.9

* Added ability to use 'Make' to compile your source code (Andrew Davie). Note: this feature is experimental and requires the user to have a fully configured environment to compile and launch emulation outside VS Code (tested only on macOS)
* Added missing Command Palette option 'ads: Kill compile process'. This feature will kill any running compilation process across all available compilers. Note: this should not be required but is available if needed.

## 0.3.8

* #22 [Fixed] Fixed issue identifying ChMod files for batari Basic and 7800basic where the architecture was hard-coded to x86 (Linux and macOS)
* #19 [Fixed] Added full ChMod permissions to Stella on macOS (same as compilers)

## 0.3.7

* #19 [Done] Fix for macOS - attempt to mark Stella as an execute

## 0.3.6

* Updated to latest batari Basic release v1.5 (Windows, Linux, macOS)
* Updated to latest 7800basic release v0.8 (Windows, Linux, macOS)
* Updated internal dev packages

## 0.3.5

* Updated to latest dasm release v2.20.13 (Windows, Linux, macOS) 
* Added options in the settings for choosing to use the **Default** (built-in) compiler or using a **Custom** one you have provided (batari Basic, 7800basic, dasm). This change will allow you to keep your custom compiler path without having to remove it to revert back to the default built-in one. 
* Removed setting **atari-dev-studio.compiler.options.defaultCompiler** as it is no longer required (didn't appear to work anyway). Compilation of a file is determined by the language chosen in the editor.
* Added missing 7800basic keywords: shakescreen, spritesheet (tallsprite), rand

## 0.3.4

* Updated to latest batari Basic release v1.4 (Windows, Linux, macOS)
* Updated to latest 7800basic release v0.7 (Windows, Linux, macOS)
* Re-enabled basic language completion for 7800basic 

## 0.3.3

* #14 [Done] Fixed clock tables for Horizontal Motion documentation (thanks andyjp)
* #15 [Done] Added region folding for 7800basic and batari Basic (thanks MikeBrownEmplas) Usage: ;#region " XXX ", ;#endregion. Code based on the [#region folding for VS Code](https://marketplace.visualstudio.com/items?itemName=maptz.regionfolder) extension by maptz
* #15 [Done] Extended bank1-bank8 -> bank1-bank24 for 7800basic and batari Basic (thanks MikeBrownEmplas)
* Updated bB score_graphics.asm for DPC+ fix (TwentySixHundred/Karl G)

## 0.3.2

* Updated to latest batari Basic release v1.2 (Windows, Linux, macOS)

## 0.3.1

* Officially (finally!) included compiler and emulator packages for macOS (tested on Mojave).
* Added Stella 6.0.2 (macOS)
* Updated to latest dasm release v2.20.12 (Windows, Linux and macOS).
* Updated internal dev packages 

## 0.3.0

* Updated Stella to 6.0.2 (Windows, Linux)
* Removed the intellisense for 7800basic (for now) until we can include code keyword (ie. labels, function, variables)

## 0.2.9

* Added option to activate the A7800 emulator debugger
* Added simple intellisense for 7800basic (keywords, functions, consts etc)

## 0.2.8

* Fixed issue with rem keyword mis-highlighting when used within variables (batariBasic and 7800basic)
* Added missing 7800basic keywords: tallsprite
* Updated existing and added additional hover tooltips for 7800basic keywords

## 0.2.7

* Added missing 7800basic keywords: hsgamename, noflow, trackersupport
* Added additional hover tooltips for 7800basic keywords

Sprite Editor
* Updated Editor window to be resizable
* Re-arranged Toolbar order

## 0.2.6

* Updated internal dev packages (security notification)

## 0.2.5

* Added hover tooltips for 7800basic keywords (a large majority)
* Updated 7800basic to 0.6 Jul 13 2019 22:37:29

## 0.2.4

* Updated Stella to 6.0.1 (Windows, Linux)

## 0.2.3 

* Added missing 7800basic keywords: P6C3

Sprite Editor
* Added features to load, save and reset your palettes (via a new toolbar on the Palette window)
* Added a fix for the occasional re-popup of load and save dialogs when communicating with VSCode
* Fixed issue where items on the New Project window did not reflect the expected value on first start
* Fixed issue exporting to .png files 

## 0.2.2

* Added missing 7800basic keywords: function, BACKGRND, PXC1,PXC2,PXC3 for palettes 0-7 

Sprite Editor
* Added resize sprite feature allowing sprites sizes to be changed
* Added ability to export the selected sprite to .png
* Wrapped the toolbar to be 2 icons wide by default and adjusted initial layout location of all windows

## 0.2.1

Sprite Editor
* Fixed an issue selecting a palette color
* Indented spinner value on New Project wizard to match combobox
* Added information about the Sprite Editor to the README
 
## 0.2.0

* Updated 7800basic compilation routine to validate for additional errors and added cleanup of 7800hole.x.asm files after compilation
* Changes to RemoveCompilationFilesAsync routine as the CleanUpCompilationFiles flag wasn't working as expected
* Added missing 7800basic keywords: converttobcd, extrawide, joy0fire, joy1fire, joy0any, joy1any

Sprite Editor
* Added New Project wizard to configure your sprites allowing you to select the size, region (palette) and total colors
* Added additional messaging to status bar when using features
* Fixed issue where toolbar was not updated properly after loading project

## 0.1.9

* #13 [Done] - SmallRoomLabs updated hover text to markdown format [thanks SmallRoomLabs] 
* Updated 7800basic compilation routine to validate for additional errors

Sprite Editor
* Updated Project area to store loaded file and auto save or prompt
* Added menu bar back to display filename of active file
* Updated Palette selector to display user colors  across then down to allow for future expansion
* Changes to file format to allow sprite size to be stored
* Further internal changes

## 0.1.8

* #12 [Done] - SmallRoomLabs added a process to display hover tooltips to dasm language for 6502 and VCS opcodes [thanks SmallRoomLabs]
* Extended hover tooltip process to work across all languages
* Minor internal changes to Sprite Editor for future enhancements

## 0.1.7

* #6 [Done] - Added new drop-down selector in settings to choose what you want to display on the Status Bar (Full, Minimum, None) [thanks SmallRoomLabs]
* #7 [Done] - Autoclose any existing Stella windows before opening a new one (new option in settings to override) [thanks SmallRoomLabs]
* #8 [Fixed] - When a dasm compilation fails clean up files generated by compiler (.sym/.bin/.lst) [thanks SmallRoomLabs]
* #9 [Fixed] - Fixed issue autosaving files before compile (async) [thanks SmallRoomLabs]
* #11 [Done] - Updated label determination in dasm assembly syntax [thanks SmallRoomLabs]

Sprite Editor
* Added ability to export all sprites in project to .png (2 bit 7800basic)
* Added ability zoom editor with mousewheel
* Added ability to set transparent background color in editor (not exported to .png) to help when designing sprites

## 0.1.6

Sprite Editor
* Added ability to load and save sprites
* Added (auto) load and save of the workspace configuration (window layout)
* Added ability to select and hold down mouse button to change palette colors on the fly for selected color
* Fixed issue where holding down mouse button and leaving the sprite editing area left drawing mode on

## 0.1.4, 0.1.5

* Introduction of a Sprite Editor (basic functionality only). The Sprite Editor is based on Spritemate by Ingo Hinterding ([github](https://github.com/Esshahn/spritemate)) and was suggested by RandomTerrain. I've taken the original source and rebuilt and restructured it. It cannot do anything other than the basics - just wanted to see if it ran OK on other PCs. 

## 0.1.3

* Updated 7800basic language definition with all (known) keywords, commands and variables. Note: there is every chance I have either missed some or labled incorrectly.
* Update readme to include imore information about installing and a note about turning off the short-cut buttons on the Status Bar

## 0.1.2

* Added option in settings to show/hide commands on Status Bar (thanks SmallRoomLabs)
* Updated readme with information about debugging

### Issues
* #1 [Fixed] - Duplicated filename after re-configuration of code (thanks SmallRoomLabs)
* #5 [Fixed] - Added new setting to turn on/off the status bar commands (thanks SmallRoomLabs)

## 0.1.1

* Added new Help references and Learn areas for batari Basic and 7800basic to Welcome page
* Removed templates from Welcome page (for now)
* Updated readme with more information about the product
* Updated all internal references to accessing the settings to a const to better maintain future changes

### Issues
* #1 [UnderReview] - Added compiler notification to help with permission error when compiling dasm on macOS (thanks SmallRoomLabs)
* #2 [Fixed] - Removed popup message (thanks SmallRoomLabs)
* #3 [Fixed] - Updated breadcrumb to Settings to correct path and catered for cross-platform (thanks SmallRoomLabs)
* #4 [Fixed] - Updated syntax highlighter (thanks SmallRoomLabs)

## 0.1.0

* Initial release