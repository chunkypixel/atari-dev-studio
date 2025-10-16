
 rem a simple boxcollision example. player 1 joystick moves one box, fire
 rem button causes the other to move horizontally. collision causes screen
 rem color change.

 displaymode 320A

 incgraphic gfx/box1.png 320A 0 1 
 incgraphic gfx/box2.png 320A 0 1 

 set collisionwrap on

 P0C2=$0F

 dim x1=a
 dim y1=b
 dim x2=c
 dim y2=d

 x1=50
 y1=20
main 
 clearscreen
 if joy0left then x2=x2-1 
 if joy0right then x2=x2+1 
 if joy0up then y2=y2-1 
 if joy0down then y2=y2+1 
 if joy0fire then x1=x1+1
 plotsprite box1 0 x1 y1
 plotsprite box2 0 x2 y2
 if boxcollision(x1,y1, 16,16, x2,y2, 32,16) then BACKGRND=$c0 else BACKGRND=0
 drawscreen
 goto main 

