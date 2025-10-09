### DMAHOLE

The 7800 requires it's graphics to be padded with zeroes. To avoid wasting ROM space with zeroes, 7800basic uses a 7800 feature called holey DMA. This 
allows you to stick program code in these areas between the graphics blocks that would otherwise be wasted with zeroes.

```7800basic
dmahole [hole] [noflow]
```
- `hole` - number of hole (0-3)
- `noflow` (optional)

[Online](https://www.randomterrain.com/7800basic.html#dmahole)



### CHANGEDMAHOLES

If you've used the `set tightpackborder` command to import graphics into areas that would normally be reserved for dmaholes, you can disable dmaholes
entirely by using this command with the **disable** argument. If you later wish to change back to the normal dma hole behaviour again, you can use the
**enable** argument.

```7800basic
changedmaholes [mode]
```
- `mode` - disable, enable

[Online](https://www.randomterrain.com/7800basic.html#changedmaholes)



### TIGHTPACKBORDER

Normally 7800basic places your graphics data between DMA holes, so that Maria is able to position your graphics anywhere on the screen. Without DMA holes,
the graphics would glitch when placed at a Y coordinate that doesn't line up with a zone.

```7800basic
set tightpackborder [address]
```
- `address` - address of gfx data eg. $8000, top

**Note:** If you wish to tightly pack all graphics - say if your game doesn’t need arbitrary Y placement of graphics, but rather, the graphics are always 
aligned with zones perfectly - you can use **top** as the address location with `tightpackborder`.

[Online](https://www.randomterrain.com/7800basic.html#set_tightpackborder)



### DEFAULTPALETTE

Define or redefine the palette that `plotmapfile` will use with your image. You can use this to re-color certain tiles for certain levels.

```7800basic
defaultpalette [imagename] [graphicsmode] [palette#]
```
- `imagename` - name of the included graphic
- `graphicsmode` - 160A, 160B, 320A, 320B, 320C, 320D
- `palette#` - index of palette (0-7)

**Note:** When the `plotmapfile` command is encountered, it will embed the palette numbers you've specified into the charactermap data. As a result, you can't
use multiple defaultpalette changes with the same `plotmapfile` command.

[Online](https://www.randomterrain.com/7800basic.html#defaultpalette)



### LOADROMBANK

When using bankswitching, there may be times you wish to switch the active bank for using its data without actually calling goto or gosub. You may do
this from the last always-present bank.

```7800basic
loadrombank [bank]
```
- `bank` - bank to switch to ie. bank1, bank2, bank3

[Online](https://www.randomterrain.com/7800basic.html#loadrombank)



### LOADRAMBANK

When using bankswitching with the **BANKRAM** formats, you can switch the active RAM bank with the `loadrambank` command.

```7800basic
loadrambank [bank]
```
- `bank` - bank to switch to ie. bank1, bank2, bank3

[Online](https://www.randomterrain.com/7800basic.html#loadrambank)



### REBOOT

Restart your game as if the console had just been turned on.

```7800basic
reboot
```

[Online](https://www.randomterrain.com/7800basic.html#reboot)



### RAND

`rand` is a special variable that will implicitly call a random number generator when used and returns a pseudo-random number between `1` and `255` every
time it is called.

```7800basic
rand
```

**Note:** You can also set the `rand` variable to a specific value, at least until it is accessed again. The only reason you would ever want to do this
is to seed the randomizer. If you do this, pay careful attention to the value you store there, since storing a zero in rand will **break** the randomizer,
and all subsequent reads will also be zero!

[Online](https://www.randomterrain.com/7800basic.html#random_numbers)



### DISPLAYMODE

Sets the current graphics display mode.

```7800basic
displaymode [mode]
```
- `mode` - 160A (default), 160B, 320A, 320B, 320C, 320D

[Online](https://www.randomterrain.com/7800basic.html#displaymode)



### CLEARSCREEN

Erases all sprites and characters that you've previously drawn on the screen, so you can draw the next screen.

```7800basic
clearscreen
```

[Online](https://www.randomterrain.com/7800basic.html#working_with_the_screen_commands)



### SAVESCREEN

Saves any sprites and characters that you've drawn on the screen since the last `clearscreen` call.

```7800basic
savescreen
```

**Note:** `savescreen` and `restorescreen` are meant to reduce the CPU requirements of your game, by avoiding re-plotting background elements 
that don't change from frame to frame. 

[Online](https://www.randomterrain.com/7800basic.html#working_with_the_screen_commands)



### RESTORESCREEN

Erases any sprites and characters that you've drawn on the screen since the last `savescreen` call.

```7800basic
restorescreen
```

**Note:** `savescreen` and `restorescreen` are meant to reduce the CPU requirements of your game, by avoiding re-plotting background elements 
that don't change from frame to frame. 

[Online](https://www.randomterrain.com/7800basic.html#working_with_the_screen_commands)



### DRAWSCREEN

Ensures that all plotted graphics are ready to display, and waits for MARIA to start the display. Including `drawscreen` in any 
display loop ensures that the loop will run every **1/60th** of a second for **NTSC** consoles, or **1/50th** of a second for **PAL** consoles.

```7800basic
drawscreen
```

[Online](https://www.randomterrain.com/7800basic.html#working_with_the_screen_commands)



### DRAWWAIT

The `drawscreen` command completes near the beginning of the visible display. This is done intentionally, to allow your program to have the maximum 
amount of CPU time possible. You may occasionally have code that you don't want to execute during the visible screen. For these occasions you can call 
the `drawwait` command. This command will only return after the visible screen has been completely displayed.

```7800basic
drawwait
```

[Online](https://www.randomterrain.com/7800basic.html#drawwait)



### DOUBLEBUFFER

If your game takes a very long time to build the display, you may wish to use the double buffering system in 7800basic, which frees you from the requirement
of completing a display within a single frame. The double buffering system is controlled through the `doublebuffer` command.

```7800basic
doublebuffer [state] [framerate]
```
- `state` - on, off, flip, quickflip
- `framerate` (optional) - ie. 2 or greater

**Note:** You can optionally set a minimum framerate with the `doublebuffer` command, to ensure there's a uniform framerate when your game logic and 
object count differs.

[Online](https://www.randomterrain.com/7800basic.html#doublebuffer)


### ROMSIZE

This sets the ROM size and format of your game.

```7800basic
set romsize [value]
```
- `value` - 16k, 32k (default), 32kRAM, 48k, 128k, 128kRAM, 128kBANKRAM, 144k, 256k, 256kRAM, 256kBANKRAM, 272k, 512k, 512kRAM, 512kBANKRAM, 528k

**Note:** It is recommended `set bankset on` is located at the top of your set list (or at least before any use of both `set romsize` and `set extradlmemory`).  
**Note:** 32kRAM option does not currently operate in the A7800 emulator.  Try JS7800, Test7800 or BupSystem for testing purposes.

[Online](https://www.randomterrain.com/7800basic.html#set_romsize)



### DOUBLEWIDE

Tells MARIA to fetch 2 bytes of character data for each character you plot, effectively making the characters twice as wide.

```7800basic
set doublewide [state]
```
- `state` - on, off

[Online](https://www.randomterrain.com/7800basic.html#set_doublewide_on)


### DEPRECATED

Enable legacy behavior in some 7800basic routines. You should only use **set deprecated** for old code that you don't wish to update.

```7800basic
set deprecated [state]
```
- `state` - frameheight, 160bindexes, boxcollision, onepass

[Online](https://www.randomterrain.com/7800basic.html#set_deprecated)



### SHAKESCREEN

Tells 7800basic to move the screen randomly, for visual effect.

```7800basic
shakescreen [state]
```
- `state` - lo, med, hi, off

The `shakescreen` command needs to be called once per frame, to continuously move the screen. When you’re done with the shaking effect, you should call
**shakescreen off** to restore the correct screen position.

[Online](https://www.randomterrain.com/7800basic.html#shakescreen)



### TALLSPRITE

If the tallsprite is set to **on** (the default) then when the `incgraphic` command sees a graphic that is 2 zone-heights or more, it will import all 
of the graphics and link them together as a **tallsprite**. If you use the `plotsprite` command on a tallsprite graphic, the `plotsprite` command will 
loop to ensure all parts will be drawn.

```7800basic
set tallsprite [state]
```
- `state` - on, off, spritesheet

[Online](https://www.randomterrain.com/7800basic.html#set_tallsprite_on_off)



### TV

Set the default television region for the finalised ROM.

```7800basic
set tv [region]
```
- `region` - ntsc (default), pal



### ZONEHEIGHT

Graphics in 7800basic are limited to either 8 or 16 pixels tall. This is a result of MARIA's zone based architecture.

```7800basic
set zoneheight [height]
```
- `height` - 8, 16 (default)

**Note:** Using a zone height of `8` means that 7800basic needs to present more memory to MARIA for screen building. 

[Online](https://www.randomterrain.com/7800basic.html#zoneheight)



## SCREENHEIGHT

Set the vertical resolution of your screen in pixels.

```7800basic
set screenheight [height]
```
- `height` - 192 (default), 208, 224

[Online](https://www.randomterrain.com/7800basic.html#screenheight)



### EXTRADLMEMORY

Tells 7800basic that you want to use the memory at `$2200-$27ff` for the purpose of expanding your display list, to allow more objects. When you compile 
your program with this option, the compile output will advise what memory range it used.

```7800basic
set extradlmemory [state]
```
- `state` - on, off

**Note:** It is recommended `set bankset on` is located at the top of your set list (or at least before any use of both `set romsize` and `set extradlmemory`). 
Also the use of `set dlmemory` is incompatible with bankset roms and is not available when enabled.  

[Online](https://www.randomterrain.com/7800basic.html#set_extradlmemory_on)



## CANARY

If 7800basic detects the 6502 break opcode has been encountered, it will turn the screen yellow and stop the game. This is meant to highlight that data 
has been executed, instead of code, since the break opcode isn't normally part of your 7800basic game code. By default this break protection is on, but 
you can use this statement to disable the protection.

```7800basic
set canary [state]
```
- `state` - on, off

[Online](https://www.randomterrain.com/7800basic.html#set_canary)



## CRASHDUMP

If your game has the hiscorefont imported and you use `set crashdump on`, then any canary crash (red screen of death) or break protect crash (yellow 
screen of death) crash will dump the top of the stack contents to the screen. This may help someone with strong assembly skills track down which game 
routine led to the crash.

```7800basic
set crashdump [state]
```
- `state` - on, off

[Online](https://www.randomterrain.com/7800basic.html#set_crashdump)



## MCPDEVCART

This tells 7800basic to use hotspots compatible with the 7800 MCP DevCart. This only needs to be used when working with bankswitched formats.

```7800basic
set mcpdevcart [state]
```
- `state` - on, off

[Online](https://www.randomterrain.com/7800basic.html#set_mcpdevcart)



## DLMEMORY

By default, 7800basic allocates its object display list from `$1880` to `$1fff`. If you have another source of available memory (like on-cart memory) 
and you need to increase the number of objects that the display can hold, you may wish to relocate the display list.

```7800basic
set dlmemory [start_address] [end_address] 
```
- `start_address` - starting location of custom dl memory eg. $4000
- `end_address` - starting location of custom dl memory eg. $4fff

**Note:** It is recommended `set bankset on` is located at the top of your set list (or at least before any use of both `set romsize` and `set extradlmemory`). 
Also the use of `set dlmemory` is incompatible with bankset roms and is not available when enabled.  

[Online](https://www.randomterrain.com/7800basic.html#set_dlmemory)



## COLLISIONWRAP

Normally 7800basic adds a bit of extra code to collision checking that allows it to check for sprites that are partially off screen. If you need a performance 
boost, you can turn collision wrapping off.

```7800basic
set collisionwrap [state]
```
- `state` - on, off

[Online](https://www.randomterrain.com/7800basic.html#boxcollision)


 
## PLOTVALUEONSCREEN

This tells 7800basic that when the plotvalue command is used, it should update the screen immediately, instead of waiting for the screen to complete 
drawing. This will save precious off-screen cycles for plotting other objects, like sprites.

```7800basic
set plotvalueonscreen [state]
```
- `state` - on, off

[Online](https://www.randomterrain.com/7800basic.html#set_plotvalueonscreen)



## ZONEPROTECTION

If too many objects are plotted to the same horizontal zone, there's a chance objects will overflow the storage for that zone, and corrupt display of 
the next zone. Using this command will prevent that from happening, at the expense of available CPU time.

```7800basic
set zoneprotection [state]
```
- `state` - on, off

[Online](https://www.randomterrain.com/7800basic.html#set_plotvalueonscreen)



## PAUSEROUTINE

Turning `pauseroutine` off tells 7800basic to not use its built-in pause routine in the game.

```7800basic
set pauseroutine [state]
```
- `state` - on, off

[Online](https://www.randomterrain.com/7800basic.html#set_pauseroutine)



## PAUSESILENCE

Turning `pausesilence` on tells 7800basic to not play sfx or tracker music when the game is paused.

```7800basic
set pausesilence [state]
```
- `state` - on, off

[Online](https://www.randomterrain.com/7800basic.html#set_pausesilence)



## POKEYSUPPORT

This tells 7800basic to enable or disable pokey soundchip support. If `on` is selected, the pokey location will be probed by 7800basic. If you instead 
specify one of the supported pokey addresses, no autoprobe will be done, and the pokey will be assumed to be present—this is the recommended method 
of pokey support.

```7800basic
set pokeysupport [state]
```
- `state` - on, off, $450, $800, $4000

[Online](https://www.randomterrain.com/7800basic.html#set_pokeysupport)



## TIAVOLUME

This tells 7800basic to scale any TIA sounds by the variable `tiavolume`. The tiavolume value can range from 0 (silent) to 15 (full scale). This only 
applies to the 7800basic `playsfx` command and tia music tracker—if you set tia registers directly in your program, they'll be unaffected by tiavolume.

```7800basic
set tiavolume on
```

[Online](https://www.randomterrain.com/7800basic.html#set_tiavolume_on)



## TIASFX

This tells 7800basic to only use one channel for TIA sound effects. 

```7800basic
set tiasfx mono
```

[Online](https://www.randomterrain.com/7800basic.html#set_tiasfx_mono)



## AVOXVOICE

This tells 7800basic to turn on AtariVox voice support.

```7800basic
set avoxvoice on
```

[Online](https://www.randomterrain.com/7800basic.html#set_avoxvoice_on)



## DEBUG

This tells 7800basic to change the color of the screen to red, until all of the screen plotting functions are called. This allows you to judge how much 
of the program calculations are happening during the visible screen, and allows you to see the relative efficiency of your program.

```7800basic
set debug [state]
```
- `state` - color, frames, interrupt

[Online](https://www.randomterrain.com/7800basic.html#set_debug_color)



## BREAKPROTECT

If 7800basic detects the 6502 break opcode has been encountered, it will turn the screen yellow and stop the game. This is meant to highlight that data 
has been executed, instead of code, since the break opcode isn't normally part of your 7800basic game code.

```7800basic
set breakprotect [state]
```
- `state` - on (default), off

[Online](https://www.randomterrain.com/7800basic.html#set_breakprotect)



## BASEPATH

```7800basic
set basepath [directory_path]
```
- `directory_path` - relative path to files to be included on compilation

[Online](https://www.randomterrain.com/7800basic.html#set_basepath)



## BANKSET

This instructs 7800basic to create a bankset format rom. Banksets doubles the amount of ROM your game can access. 

```7800basic
set bankset [state]
```
- `state` - on, off

**Note:** It is recommended `set bankset on` is located at the top of your set list (or at least before any use of both `set romsize` and `set extradlmemory`). 
Also the use of `set dlmemory` is incompatible with bankset roms and is not available when enabled.  

[Online](https://www.randomterrain.com/7800basic.html#set_bankset_on)



## PADDLERANGE

This sets the value range the paddle controllers will return. Larger ranges use more CPU time.

```7800basic
set paddlerange [range]
```
- `range` - 1 to 240

[Online](https://www.randomterrain.com/7800basic.html#set_paddlerange)
[Paddle Controls](https://www.randomterrain.com/7800basic.html#paddle_controls)


## PADDLEPAIR

Tells 7800basic to read both paddles in a set of 2.

```7800basic
set paddlepair [state]
```
- `state` - on, off

[Online](https://www.randomterrain.com/7800basic.html#set_paddlepair)
[Paddle Controls](https://www.randomterrain.com/7800basic.html#paddle_controls)



## PADDLESCALEX2

Doubles the values returned by the paddles, increasing the range without additional CPU time.

```7800basic
set paddlescalex2 [state]
```
- `state` - on, off

[Online](https://www.randomterrain.com/7800basic.html#set_paddlescalex2)
[Paddle Controls](https://www.randomterrain.com/7800basic.html#paddle_controls)



## DUMPGRAPHICS

This instructs 7800basic to dump all graphics blocks and any needed assembly code to access those graphics within 7800basic to file.

```7800basic
set dumpgraphics [address]
```
- `address` - location of dump ie. $6000 (used for the assembly code address reference)

[Online](https://www.randomterrain.com/7800basic.html#set_dumpgraphics)



## RMTSPEED

This tells 7800basic what speed your rmt music was composed for. If you use this command, 7800basic will adjust the music speed so the music plays as 
composed, on both ntsc and pal consoles.

```7800basic
set rmtspeed [state]
```
- `state` - ntsc, pal, off

**Note:** You must also define variable `dim RMTRAM = $####` (ie. $2200) and allocate 173 bytes of RAM for RMT playback 

[Online](https://www.randomterrain.com/7800basic.html#set_rmtspeed)



## SNES0PAUSE

    set snes0pause on



## SNES1PAUSE

    set snes1pause on



## SNES#PAUSE

    set snes#pause on
    


## POKEYDETECTED

When your program has POKEY support enabled with `set pokeysupport`, you can check to see if 7800basic detected a POKEY chip through the pokeydetected variable.

```7800basic
if pokeydetected then ...
```
[Online](https://www.randomterrain.com/7800basic.html#pokeydetected_variable)



## DRAWHIGHSCORE

    drawhighscore [attract|single|player1|player2]



## HSSUPPORT

    set hssupport [address]

    address - Atari High Score Cart, AtariVox, or Savekey Identifier



## HSGAMENAME

    set hsgamename 'name'


    
## HSSECONDS

    set hsseconds seconds

    seconds - number of seconds to display high score attract screen



## HSSCORESIZE

    set hsscoresize digits

    digits - number of digits to display for scores on the high score attract screen



## HSCOLORBASE

    set hscolorbase color

    color - starting color for color cycle on the high score attract screen



## HSDIFFICULTYTEXT

    set hsdifficultytext ['string_1'] ['string_2'] ['string_3'] ['string_4'] [off]

    string_# (optional) - override provided difficulty level names (easy, intermediate, advanced, expert)
    off (optional) - turn off difficulty level names

    note: single quotes are required where a name includes spaces



## HSGAMERANKS

    set hsgameranks value_1 ['string_1'] value_2 ['string_2'] value_3 ['string_3'] ...

    value_# - value required to achieve player ranking
    string_# - display a descriptive ranking of player's score

    note: single quotes are required where a name includes spaces



## GAMEDIFFICULTY

    gamedifficulty = value

    value - 0-3 (easy, intermediate, advanced, expert)




## DRAWHISCORES

    drawhiscores [state]

    state - attract, single, player1, player2, player2joy1
    
    

## ADJUSTVISIBLE

    adjustvisible start_zone_row end_zone_row

    start_zone_row
    end_zone_row



## INCMAPFILE

    incmapfile filename.tmx

    filename.tmx - file name of the tiled map to include



## INCRMTFILE

    incrmtfile filename.rmt

    filename.rmt - file name of the rmt song file to include


**Note:** You must also define variable `dim RMTRAM = $####` (ie. $2200) and allocate 173 bytes of RAM for RMT playback 


   
## INCGRAPHIC

    incgraphic filename.png [graphics mode] [color #0] [#1] ... [palette #]

    filename.png - file name of the graphic to include
    graphics mode (optional) - 160A (default), 160B, 320A, 320B, 320C, 320D
    color # (optional) - MARIA color index
    palette # (optional) - index of palette (0-7)



## INCBANNER

    incbanner filename.png [graphics mode] [color #0] [#1]  ...

    filename.png - file name of the graphic to include
    graphics mode (optional) - 160A (default), 160B, 320A, 320B, 320C, 320D
    color # (optional) - MARIA color index



## INCBIN

    incbin filename.xxx

    filename.xxx - file name of the asset to include



## INCBASIC

    incbasic filename.xxx

    filename.xxx - file name of the source code to include



## DECOMPRESS

    decompress filename [address]

    filename.xxx - file name of the asset to decompress
    address - address of dump ie. $4000



## INCCOMPRESS

    inccompress filename.xxx

    filename.xxx - file name of the asset to compress



## NEWBLOCK

    newblock



## PLOTSPRITE

    plotsprite sprite_graphic palette_# x y [frame] [tallheight]
    
    sprite_graphic - name of the included graphic
    palette_# - index of palette (0-7)
    x - x screen co-ordinate
    y - y screen co-ordinate
    frame (optional) - index of the frame to display
    tallheight (optional) - number of zones each tallsprite occupies



## PLOTSPRITE4

    plotsprite4 sprite_graphic palette_# x y [frame] [tallheight]
    
    sprite_graphic - name of the included graphic
    palette_# - index of palette (0-7)
    x - x screen co-ordinate
    y - y screen co-ordinate
    frame (optional) - index of the frame to display
    tallheight (optional) - number of zones each tallsprite occupies



## PLOTBANNER
    
    plotbanner banner_graphic palette_# x y

    banner_graphic - name of the included graphic
    palette_# - index of palette (0-7)
    x - x screen co-ordinate
    y - y screen co-ordinate



## PLOTCHARS

    plotchars textdata palette_# x y [chars|extrawide|singlewide]

    textdata - RAM, ROM or literal string 'message' to plot onto the screen 
    palette_# - index of palette (0-7)
    x - x screen co-ordinate
    y - y line (zone) co-ordinate
    chars (optional) - number of characters to display 
    extrawide (optional) - display chars twice the width of the character size
    singlewide (optional)* - there are special requirements to using this feature. Check the 
                             7800basic Programming forum for details

    NOTE: from v0.29 onwards more than 32 characters can be plotted



## PLOTMAP

    plotmap mapdata palette_# x y width height [map_x_offset] [map_y_offset] [map_width]

    mapdata - RAM or ROM location of the data to plot onto the screen
    palette_# - index of palette (0-7)
    x - x screen co-ordinate
    y - y line (zone) co-ordinate
    width - number of character columns to plot
    height - number of character rows (zones) to plot  
    map_x_offset (optional) - x offset co-ordinate of the area to draw within the larger map 
    map_y_offset (optional) - y offset co-ordinate of the area to draw within the larger map 
    map_width (optional) - row width of the larger map



## PLOTMAPFILE

    plotmapfile map_file mapdata x y width height

    map_file = name of the included map
    mapdata - RAM or ROM location of the data to plot onto the screen
    x - x screen co-ordinate
    y - y line (zone) co-ordinate
    width - number of character columns to plot
    height - number of character rows (zones) to plot  



## PLOTVALUE

    plotvalue character_graphic palette_# variable digits x y [extrawide]

    character_graphic - name of included graphic
    palette_# - index of palette (0-7)
    variable - variable containing the BCD value to draw onto the screen
    digits - number of digits to display
    x - x screen co-ordinate
    y - y line (zone) co-ordinate
    extrawide (optional) - display chars twice the width of the character size



### PEEKCHAR
The `peekchar` command is used to read a value from the provided mapdata (or memory location) in ROM or RAM.
 [Online](https://www.randomterrain.com/7800basic.html#peekchar)

```7800basic
value = peekchar(mapdata, x, y, width, height)
```
- `mapdata` - RAM or ROM location of the data to read
- `x` - x screen column or offset co-ordinate
- `y` - y screen row or offset co-ordinate
- `width` - total width of the mapdata (or memory) area
- `height` - total height of the mapdata (or memory) area

**Returns**
byte



### POKECHAR
The `pokechar` command is used to write a value to the provided mapdata (or memory location) in RAM.

```7800basic
pokechar mapdata x y width height value
```
- `mapdata` - RAM location of the data to write
- `x` - x screen column or offset co-ordinate
- `y` - y screen row or offset co-ordinate
- `width` - total width of the mapdata (or memory) area
- `height` - total height of the mapdata (or memory) area
- `value` - value (byte) to be stored

 [Online](https://www.randomterrain.com/7800basic.html#pokechar)



## CHARACTERSET

    characterset character_graphic

    character_graphic - name of included graphic



## LOCKZONE

    lockzone number

    number - index of the zone you wish to lock



## UNLOCKZONE

    unlockzone number

    number - index of the zone you wish to unlock



## MEMCPY

    memcpy destination source bytes

    destination - RAM location to copy data into
    source - ROM or RAM location of the data to get
    bytes - number of bytes to include in copy (1 to 65535)



## STRCPY

   strcpy destination 'string'

   destination - RAM location to copy data into  
   string - literal string



## MEMSET

    memset destination value bytes

    destination - RAM location to set data into
    value - value to initialise for each byte
    bytes  - number of bytes to include in set (1 to 65535)



## BOXCOLLISION

    if boxcollision(sprite1x, sprite1y, sprite1width, sprite1height, sprite2x, sprite2y, sprite2width, sprite2height) then ...

    sprite1x
    sprite1y
    sprite1width
    sprite1height
    sprite2x
    sprite2y
    sprite2width
    sprite2height



## TSOUND

    tsound channel,[frequency],[waveform],[volume]

    channel - channel to play TIA audio (0-1)
    frequency (optional) - 0-31
    waveform (optional) - 0-15
    volume (otional) - 0-15



## PSOUND

    psound channel,[frequency],[waveform,volume]

    channel - channel to play POKEY audio (0-3)
    frequency (optional) - 0-255
    waveform (optional) - 0-15
    volume (otional) - 0-15   



## PLAYSFX

    playsfx sounddata [offset]

    sounddata - RAM or ROM location of the data to get
    offset (optional) - raise or lower pitch of the played sound



## PLAYSONG

    playsound songname tempo [repeat|number]

    songname - reference to the data to play
    tempo - initial tempo of song to play
    repeat (optional) - repeat indefinately the song to play
    number (optional) - number of times to repeat the song to play



## STOPSONG

    stopsong



## PLAYRMT

    playrmt [address] or incrmtfile

    address - address of tune ie. $6000 or set as incrmtfile

**Note:** You must also define variable `dim RMTRAM = $####` (ie. $2200) and allocate 173 bytes of RAM for RMT playback 



## STARTRMT

    startrmt



## STOPRMT

    stoprmt



## SPEAK

    speak speechname

    speechname - reference to the data to speak



## TRACKERSUPPORT

    set trackersupport [value]

    value - basic, rmt

**Note:** You must also define variable `dim RMTRAM = $####` (ie. $2200) and allocate 173 bytes of RAM for RMT playback 



## INLINE

    inline filename.asm

    filename.asm - name of assembly file to inline



## INCLUDE

    include filename.asm

    filename.asm - name of assembly file to include



## SAVEMEMORY

    savememory [variable_#] ...

    variable_# - variable to save to detected high score device (maximum of 25 variables)



## LOADMEMORY

    loadmemory [variable_#] ...

    variable_# - variable to load from detected high score device (maximum of 25 variables)



## SIZEOF

   sizeof label

   label - returns the size of a 7800basic routine or data structure at compile time


   
## SETFADE

    setfade value

    value - variable containing fade value (0-255)



## GETFADE

    PXCX = getfade(color[,black])

    color - value of base color ($00-$ff)
    value (optional) - "black" argument zeroes the hue nibble



## OPTIMIZATION

   set optimization state

   state - speed, size, noinlinedata, inlinerand, none



## MULTIBUTTON

   set multibutton state

   state - on, off



## 7800GDMENUOFF

   set 7800GDmenuoff state

   state - 0 (left controller), 1 (right controller), all (both controllers)



## 7800HEADER

   set 7800header command

   command - eg. 'name 'name of rom', 'set hsc'

   NOTE: refer to list of header flags for available options



## BACKUPSTYLE

   set backupstyle command

   command - single, running (default)

   NOTE: You need to use “set backupstyle” setting prior to using “set backupfile”, since it affects the file name 
of the backup file



## BACKUPFILE

   set backupfile 'directory_path'

   directory_path - location to store your backup

   eg. set backupfile 'E:\backups\spaceman' (Windows) or set backupfile '/Volumes/MyThumbdrive/backups/spaceman'



## BACKUP

   backup 'directory_path'

   directory_path - relative path to files to be included on backup



## CHANGECONTROL

    changecontrol port controltype

    port - left or right (0-1)
    controltype - 2buttonjoy (default), 1buttonjoy, snes, mega7800, lightgun, paddle, trakball, driving, keypad, stmouse, amigamouse, atarivox, none



## AUTODIM

   autodim type variable/rangestart length/rangeend
   
   type - init, byte, 8.8, 4.4
   variable - name of variable eg. shipspeed
   length - total number of variables to initialise
   rangestart - start of variable range to initialise eg. $2600 or var0
   rangeend - end of variable range to initialise eg. $26ff or var99

   autodim init var0 var99
   autodim init $2600 $26ff
   autodim byte shipspeed
   autodim byte enemyhealth 8
   autodim 8.8 tempxposition
   autodim 8.8 enemyxposition 4



## PORT0CONTROL

    if port0control = 11 && snesdetected0 then goto skipsnesdetect



## PORT1CONTROL

    if port1control = 11 && snesdetected1 then goto skipsnesdetect



## JOY0UP

    if joy0up then ...



## JOY0DOWN

    if joy0down then ...


    
## JOY0LEFT

    if joy0left then ...



## JOY0RIGHT

    if joy0right then ...



## JOY0ANY

    if joy0any then ...



## JOY0FIRE

    if joy0fire then ...



## JOY0FIRE0

    if joy0fire0 then ...



## JOY0FIRE1

    if joy0fire1 then ...



## JOY0FIRE2

    if joy0fire2 then ...



## JOY0FIRE3

    if joy0fire3 then ...



## JOY0FIRE4

    if joy0fire4 then ...



## JOY0FIRE5

    if joy0fire5 then ...



## JOY0SELECT

    if joy0select then ...



## JOY0START

    if joy0start then ...



## JOY1UP

    if joy1up then ...



## JOY1DOWN

    if joy1down then ...


    
## JOY1LEFT

    if joy1left then ...



## JOY1RIGHT

    if joy1right then ...



## JOY1ANY

    if joy1any then ...



## JOY1FIRE

    if joy1fire then ...



## JOY1FIRE0

    if joy1fire0 then ...



## JOY1FIRE1

    if joy1fire1 then ...



## JOY1FIRE1

    if joy1fire1 then ...



## JOY1FIRE2

    if joy1fire2 then ...



## JOY1FIRE3

    if joy1fire3 then ...



## JOY1FIRE4

    if joy1fire4 then ...



## JOY1FIRE5

    if joy1fire5 then ...



## JOY1SELECT

    if joy0select then ...



## JOY1START

    if joy0start then ...



## SNESDETECT

    snesdetect



## SNESDETECTED0

    if port0control = 11 && snesdetected0 then goto skipsnesdetect



## SNESDETECTED1

    if port1control = 11 && snesdetected1 then goto skipsnesdetect



## SNES

    if snes#? then ...

    ? - up,down,left,right,A,B,X,Y,lsh,rsh,any



## SNES0ANY

    if snes0any then ...



## SNES0ANYMOVE

    if snes0anymove then ...



## SNES0ANYABXY

    if snes0anyABXY then ...



## SNES0UP

    if snes0up then ...



## SNES0DOWN

    if snes0down then ...



## SNES0LEFT

    if snes0left then ...



## SNES0RIGHT

    if snes0right then ...



## SNES0A

    if snes0A then ...



## SNES0B

    if snes0B then ...



## SNES0X

    if snes0X then ...



## SNES0Y

    if snes0Y then ...



## SNES0LSH

    if snes0lsh then ...



## SNES0RSH

    if snes0rsh then ...



## SNES0SELECT

    if snes0select then ...



## SNES0START

    if snes0start then ...



## SNES1ANY

    if snes1any then ...



## SNES1ANYMOVE

    if snes1anymove then ...



## SNES1ANYABXY

    if snes1anyABXY then ...



## SNES1UP

    if snes1up then ...



## SNES1DOWN

    if snes1down then ...



## SNES1LEFT

    if snes1left then ...



## SNES1RIGHT

    if snes1right then ...



## SNES1A

    if snes1A then ...



## SNES1B

    if snes1B then ...



## SNES1X

    if snes1X then ...



## SNES1Y

    if snes1Y then ...



## SNES1LSH

    if snes1lsh then ...



## SNES1RSH

    if snes1rsh then ...



## SNES1SELECT

    if snes1select then ...



## SNES1START

    if snes0start then ...



## MEGA1ANY

    if mega1any then ...



## MEGA1UP

    if mega1up then ...



## MEGA1DOWN

    if mega1down then ...



## MEGA1LEFT

    if mega1left then ...



## MEGA1RIGHT

    if mega1right then ...



## MEGA1A

    if snes0A then ...



## MEGA1B

    if mega1B then ...



## MEGA1C

    if mega1C then ...



## MEGA1X

    if mega1X then ...



## MEGA1Y

    if mega1Y then ...



## MEGA1Z

    if mega1Z then ...



## MEGA1START

    if mega1start then ...

