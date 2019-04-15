
 rem *** a simple program to move a happy face around with the joystick

 set zoneheight 8

 rem *** enable driving controllers!
 set drivingcontrols on

 dim player0x=a
 dim player0y=b
 dim player1x=c
 dim player1y=d

 rem *** import a sprite
 incgraphic arrow.png

 rem *** set the colors for palette 0 and 1
  P0C1=$82:P0C2=$48:P0C3=$fb
  P1C1=$92:P1C2=$98:P1C3=$9b

 player0x=80
 player0y=50
 player1x=80
 player1y=90

 rem ** if you've spent a lot of time prior to your display screen, you should
 rem ** clear the drivingposition variables. The player might have been turning
 rem ** the controller, and you don't want to sprites to start in the wrong
 rem ** location.
 drivingposition0=0:drivingposition1=0

main
 clearscreen

 rem ** 7800basic automatically reads the driving controllers and updates the
 rem ** drivingposition0 and drivingposition1 variables for you. You just need
 rem ** to add these variables to your sprites position/rotation - this will
 rem ** add or subtract from the players position/rotation, depending on 
 rem ** which direction the driving controller was turned. 
 player0x=player0x+drivingposition0

 rem ** Be sure to clear the drivingposition variables after usage...
 drivingposition0=0 

 rem ** Now lets do player 1 with less talk...
 player1x=player1x+drivingposition1
 drivingposition1=0 

 rem ** Draw the sprites, wait a frame, and loop...
 plotsprite arrow 0 player0x player0y
 plotsprite arrow 1 player1x player1y
 drawscreen
 goto main
