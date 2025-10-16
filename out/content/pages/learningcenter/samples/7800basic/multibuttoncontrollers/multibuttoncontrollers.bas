 rem ** Sample code for reading from multibutton controllers. If the player
 rem ** plugs in a snes2atari or mega7800, or unplugs one, the multibutton
 rem ** state will be detected and updated.

 set multibutton on

 displaymode 320A
 set zoneheight 8
 incgraphic ascii_full.png 320A 0 1
 characterset ascii_full
 alphachars ASCII
 P0C2=$0F:P1C2=$1F:P2C2=$9F:BACKGRND=$00

 rem ** If a controller is set to somthing other than "2buttonjoy" it won't 
 rem ** be scanned. 
 changecontrol 1 none 

 clearscreen
 plotchars 'MULTIBUTTON TEST' 0 0 0

 plotchars 'joy0up'      0 0 6 
 plotchars 'joy0down '   0 0 7
 plotchars 'joy0left '   0 0 8
 plotchars 'joy0right'   0 0 9

 plotchars 'joy0fire0'   0 52 6
 plotchars 'joy0fire1'   0 52 7
 plotchars 'joy0fire2'   0 52 8
 plotchars 'joy0fire3'   0 52 9

 plotchars 'joy0fire4'   0 108 6
 plotchars 'joy0fire5'   0 108 7
 plotchars 'joy0select'  0 108 8
 plotchars 'joy0start'   0 108 9

 plotchars 'Debug Info...'      0 0 14
 plotchars 'multibuttoncount0'  0 0 16
 plotchars 'SWCHA'              0 0 17
 plotchars 'sINPT1'             0 0 18
 savescreen

main
 restorescreen

 plotvalue ascii_full 0 multibuttoncount0 2 80 16
 plotvalue ascii_full 0 SWCHA 2 80 17
 plotvalue ascii_full 0 sINPT1 2 80 18

 if joy0up     then plotchars '*' 1 40 6
 if joy0down   then plotchars '*' 1 40 7
 if joy0left   then plotchars '*' 1 40 8
 if joy0right  then plotchars '*' 1 40 9

 if joy0fire0   then plotchars '*' 1 92  6
 if joy0fire1   then plotchars '*' 1 92  7
 if joy0fire2   then plotchars '*' 1 92  8
 if joy0fire3   then plotchars '*' 1 92  9

 if joy0fire4   then plotchars '*' 1 154 6
 if joy0fire5   then plotchars '*' 1 154 7
 if joy0select  then plotchars '*' 1 154 8
 if joy0start   then plotchars '*' 1 154 9

 drawscreen
 goto main
