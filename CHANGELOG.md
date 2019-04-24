# Change Log

The following enhancements and changes have been made to Atari Dev Studio:

## 0.1.4

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