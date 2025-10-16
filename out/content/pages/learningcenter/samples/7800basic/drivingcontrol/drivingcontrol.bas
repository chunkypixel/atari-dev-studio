
 rem *** a simple program to move an arrow around with the driving controller

 set zoneheight 8

 rem *** enable driving controllers!
 changecontrol 0 driving

 dim player0x=a
 dim player0y=b

 rem *** import a sprite
 incgraphic arrow.png

 rem *** set the colors for palette 0 and 1
  P0C1=$82:P0C2=$48:P0C3=$fb
  P1C1=$92:P1C2=$98:P1C3=$9b

 player0y=50

 rem ** initialize driving position as you like...
 drivingposition0=80

main
 clearscreen

 rem ** 7800basic automatically reads the driving controllers and updates the
 rem ** drivingposition0 and drivingposition1 variables for you.

 rem ** Draw the sprites, wait a frame, and loop...
 plotsprite arrow 0 drivingposition0 player0y
 drawscreen
 goto main
