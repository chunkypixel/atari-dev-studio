## DMAHOLE

    dmahole hole [noflow]

    hole
    noflow (optional)



## LOADROMBANK

    loadrombank bank

    bank



## LOADRAMBANK

    loadrambank bank

    bank



## REBOOT

    reboot



## RAND

    rand



## DISPLAYMODE

    displaymode mode

    mode - 160A, 160B, 320A, 320B, 320C, 320D



## CLEARSCREEN

    clearscreen



## SAVESCREEN

    savescreen



## RESTORESCREEN

    restorescreen



## DRAWSCREEN

    drawscreen



## DRAWWAIT

    drawwait



## DRAWHIGHSCORE

    drawhighscore [attract|single|player1|player2]



## DOUBLEBUFFER
    
    doublebuffer state [framerate]

    state - on, off, flip
    framerate (optional)



## ROMSIZE

    set romsize size

    size - 16k, 32k, 48k, 128k, 128kRAM, 128kBANKRAM, 144k, 256k, 256kRAM, 256kBANKRAM, 272k, 512k, 512kRAM, 512kBANKRAM, 528k

    NOTE: it is recommended 'set bankset on' is located at the top of your set list (or at least before any use of both 'set romsize' and 'set extradlmemory').  




## DOUBLEWIDE

    set doublewide state

    state - on, off



## DEPRECATED

    set deprecated value

    value - frameheight, 160bindexes



## SHAKESCREEN

    shakescreen state

    state - lo, med, hi, off



## TALLSPRITE

    set tallsprite state

    state - on, off, spritesheet



## TV

    set tv region

    region - ntsc (default), pal



## ZONEHEIGHT

    set zoneheight height

    height - 8 (default), 16



## SCREENHEIGHT

    set screenheight height

    height - 192 (default), 208, 224



## EXTRADLMEMORY

    set extradlmemory state

    state - on, off

    NOTE: it is recommended 'set bankset on' is located at the top of your set list (or at least before any use of both 'set romsize' and 'set extradlmemory').  The use of 'set dlmemory' is incompatible with bankset roms and is not available when turned on.   



## CANARY

    set canary state

    state - on, off



## DLMEMORY

    set dlmemory start_byte_location end_byte_location 

    start_byte_location
    end_byte_location

    NOTE: it is recommended 'set bankset on' is located at the top of your set list (or at least before any use of both 'set romsize' and 'set extradlmemory').  The use of 'set dlmemory' is incompatible with bankset roms and is not available when turned on.  



## COLLISIONWRAP

    set collisionwrap on


    
## PLOTVALUEONSCREEN

    set plotvalueonscreen state

    state - on, off



## ZONEPROTECTION

    set zoneprotection state

    state - on, off



## PAUSEROUTINE

    set pauseroutine state

    state - on, off


## POKEYSOUND

    set pokeysound state

    state - on, off



## POKEYSUPPORT

    set pokeysupport state

    state - on, off, $450, $800, $4000



## TIAVOLUME

    set tiavolume on



## TIASFX

    set tiasfx mono



## AVOXVOICE

    set avoxvoice on



## DEBUG

    set debug color



## MCPDEVCART

    set mcpdevcart state

    state - on, off



## PADDLERANGE

   set paddlerange range

   range - 1 to 240



## PADDLEPAIR

   set paddlepair state

   state - on, off



## PADDLESCALEX2

   set paddlescalex2 state

   state - on, off



## BASEPATH

    set basepath directory_path

    directory_path - relative path to files to be included on compilation



## BANKSET

    set bankset state

    state - on, off

    NOTE: it is recommended 'set bankset on' is located at the top of your set list (or at least before any use of both 'set romsize' and 'set extradlmemory').  The use of 'set dlmemory' is incompatible with bankset roms and is not available when turned on.



## DUMPGRAPHICS

    set dumpgraphics $####

    $#### - address of dump ie. $6000



## RMTSPEED

    set rmtspeed state

    state - ntsc, pal, off

    NOTE: made sure to define variable 'dim RMTRAM = $####' and allocate 173 bytes of RAM for RMT playback (ie. $2200)



## SNES0PAUSE

    set snes0pause on



## SNES1PAUSE

    set snes1pause on



## SNES#PAUSE

    set snes#pause on
    


## POKEYDETECTED

    if pokeydetected then ...



## HSSUPPORT

    set hssupport $####

    $#### - Atari High Score Cart, AtariVox, or Savekey Identifier



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

    drawhiscores state

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


    NOTE: made sure to define variable 'dim RMTRAM = $####' and allocate 173 bytes of RAM for RMT playback (ie. $2200)


   
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



## PEEKCHAR

    value = peekchar(mapdata, x, y, width, height)

    mapdata - RAM or ROM location of the data to get
    x - x screen column co-ordinate
    y - y screen row co-ordinate
    width - total width of the map
    height - total height of the map



## POKECHAR

    pokechar mapdata x y width height value

    mapdata - RAM or ROM location of the data to set
    x - x screen column co-ordinate
    y - y screen row co-ordinate
    width - total width of the map
    height - total height of the map
    value - value to be stored

    

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



## CHANGECONTROL

    changecontrol port controltype

    port - left or right (0-1)
    controltype - 2buttonjoy (default), 1buttonjoy, snes, lightgun, paddle, trakball, driving, keypad, stmouse, amigamouse, atarivox)



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


## SNESDETECT

    snesdetect



## SNESDETECTED0

    if port0control = 11 && snesdetected0 then goto skipsnesdetect



## SNESDETECTED1

    if port1control = 11 && snesdetected1 then goto skipsnesdetect



## SNES

    if snes#? then ...

    ? - up,down,left,right,A,B,X,Y,lsh,rsh,any



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

    playrmt $#### or incrmtfile 

    $#### - address of tune ie. $6000 or set as incrmtfile

    NOTE: made sure to define variable 'dim RMTRAM = $####' and allocate 173 bytes of RAM for RMT playback (ie. $2200)



## STARTRMT

    startrmt



## STOPRMT

    stoprmt



## SPEAK

    speak speechname

    speechname - reference to the data to speak



## TRACKERSUPPORT

    set trackersupport value

    value - basic, rmt

    NOTE: made sure to define variable 'dim RMTRAM = $####' and allocate 173 bytes of RAM for RMT playback (ie. $2200)



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


