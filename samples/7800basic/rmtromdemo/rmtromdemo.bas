
 set romsize 48k
 set zoneheight 8
 set pokeysupport $450
 set trackersupport rmt

 rem ** For RMTs authored on ntsc systems, use "ntsc" so pal decks play faster
 rem ** For RMTs authored on pal  systems, use "pal" so ntsc decks play slower
 set rmtspeed ntsc

 displaymode 320A

 dim songindex=a
 dim cursorpos=b

 rem ** you need to define the variable RMTRAM pointing to 173 bytes of RAM
 dim RMTRAM=$2200 ; to $22AC

 rem **import the characterset png...
 incgraphic gfx/atascii_full.png 320A 1 0

 rem **set color of 320A text palette 0...
 P0C2=$0F

 BACKGRND=$84

 rem **set the current character set...
 characterset atascii_full

 rem **set the letters represent each graphic character...
 alphachars ASCII

 clearscreen
 plotchars '7800basic RMT In-ROM Demo' 0 30 0
 plotchars 'Axel F' 0 8 3
 plotchars 'Sal Esquivel (Kjmann)' 0 60 3
 plotchars 'Popcorn' 0 8 4
 plotchars 'Chris Martin (Cybernoid)' 0 60 4
 plotchars 'BubbleBobble' 0 8 5
 plotchars 'Sal Esquivel (Kjmann)' 0 60 5
 plotchars 'Fireworks' 0 8 6
 plotchars 'Nils Feske (505)' 0 60 6
 plotchars 'Chopin2010' 0 8 7
 plotchars 'Michal Szpilowski (Miker)' 0 60 7
 plotchars 'Frogger' 0 8 8
 plotchars 'Sal Esquivel (Kjmann)' 0 60 8
 plotchars '[ STOP  ]' 0 8 9
 plotchars '[ START ]' 0 8 10
 savescreen

 drawscreen

main
 if switchreset then rasterpause=1
 if joy0up then gosub cheapjoymovedebounce:songindex=(songindex-1)&7
 if joy0down then gosub cheapjoymovedebounce:songindex=(songindex+1)&7
 if joy0fire then gosub cheapjoyfiredebounce:gosub startrmtsong
 cursorpos=songindex+3
 restorescreen
 plotchars '>' 0 0 cursorpos
 drawscreen
 goto main

startrmtsong
 framecounter=0
 on songindex goto song1sub song2sub song3sub song4sub song5sub song6sub songstop songstart

song1sub
 playrmt axel_f
 return
song2sub
 playrmt popcorn
 return
song3sub
 playrmt bubble
 return
song4sub
 playrmt fireworks
 return
song5sub
 playrmt chopin2010
 return
song6sub
 playrmt frogger
 return
songstop
 stoprmt 
 return
songstart
 startrmt 
 return

cheapjoyfiredebounce
 drawscreen
 if joy0fire then goto cheapjoyfiredebounce
 return

cheapjoymovedebounce
 drawscreen
 if joy0any then goto cheapjoymovedebounce
 return

 incrmtfile axel_f.rmta
 incrmtfile popcorn.rmta
 incrmtfile bubble.rmta
 incrmtfile fireworks.rmta
 incrmtfile frogger.rmta
 incrmtfile chopin2010.rmta
