 rem *** a simple mouse pointer demo
 rem *** that demonstrates switching between different devices, including
 rem *** the trakball.

 displaymode 320A

 set zoneheight 8

 dim firetest=a
 dim devicetype=b

 rem ** Start off with an ST mouse. See the subroutines at the end for details.
 devicetype=0

 incgraphic atascii_full.png 320A 1 0
 incgraphic arrow.png 320A

 characterset atascii_full
 alphachars ASCII

 rem *** set the colors for palette 0 and 1
  P0C2=$fb
  P1C2=$0F

 rem *** the same underlying variables are used for mice and trakballs.
 mousex0=40
 mousey0=50

setdevice
 BACKGRND=0
 if switchselect then goto setdevice : rem ** cheap debounce, not game-worthy.
 if devicetype>2 then devicetype=0   : rem ** devicetype in range 0-2
 gosub selectdevice  : rem ** actually change the controller
 clearscreen
 gosub displaydevice : rem ** display the device-type text
 savescreen

main
 restorescreen

 rem ** the mouse buttons are read just like two-button joystick buttons...
 firetest=0
 if joy0fire0 then firetest=$80
 if joy0fire1 then firetest=firetest|$40
 BACKGRND=firetest

 plotvalue atascii_full 1 mousex0 2 70 19
 plotvalue atascii_full 1 mousey0 2 90 19

 rem ** Draw the sprite, wait a frame, and loop...
 plotsprite arrow 0 mousex0 mousey0
 drawscreen
 if switchselect then devicetype=devicetype+1:goto setdevice
 goto main

selectdevice
 if devicetype=0 then changecontrol 0 stmouse
 if devicetype=1 then changecontrol 0 amigamouse
 if devicetype=2 then changecontrol 0 trakball
 return

displaydevice
 if devicetype=0 then plotchars 'device: st mouse'    1 50 1
 if devicetype=1 then plotchars 'device: amiga mouse' 1 50 1
 if devicetype=2 then plotchars 'device: trakball'    1 50 1
 return
 
