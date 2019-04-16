
 rem *** a simple program to move a happy face around with the joystick

 set zoneheight 8

 dim playerx=a
 dim playery=b

 incgraphic face1.png

 rem *** set the colors of palette 0, which we'll use to draw the happy face
  P0C1=$82
  P0C2=$48
  P0C3=$fb

main
 clearscreen
 if joy0left  then playerx=playerx-1
 if joy0right then playerx=playerx+1
 if joy0down  then playery=playery+1
 if joy0up    then playery=playery-1
 plotsprite face1 0 playerx playery
 drawscreen
 goto main
