
 set romsize 128kRAM
 set zoneheight 8
 set pokeysupport $450
 set trackersupport rmt

 rem ** For RMTs authored on ntsc systems, use "ntsc" so pal decks play faster
 rem ** For RMTs authored on pal  systems, use "pal" so ntsc decks play slower
 set rmtspeed ntsc

 displaymode 320A

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
 plotchars '7800basic RMT In-RAM Demo' 0 32 0
 plotchars 'Treasure Island Dizzy' 0 32 4
 plotchars 'Michal Szpilowski (Miker)' 0 32 6

 gosub copyrmt bank2

 savescreen
 drawscreen

 playrmt $4000

main
 drawscreen
 goto main

 bank 2
 rem *** RMT files (or SAP files containing RMT data) are typically
 rem *** designed to load into $4000 in RAM. If you need to load them
 rem *** to a different address, use the 7800rmtfix utility to relocate
 rem *** them.
 incrmtfile dizzy.rmt
copyrmt
 memcpy $4000 dizzy 5459 
 return otherbank


