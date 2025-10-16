 rem *** A simple demo to allow switching between rotary style input devices
 rem *** Note that they all use the same X variable, and all use the regular
 rem *** joystick firebutton checking. 

 displaymode 320A
 set zoneheight 8

 rem *** paddles are one of the controllers that are read during the visible
 rem *** screen, and will eat up CPU cycles. Reducing the range in half and
 rem *** scaling the paddle values x2 will cut CPU usage in half, at the
 rem *** loss of resolution.
 rem set paddlerange 80
 rem set paddlescalex2 on

 rem *** The paddle range. Increasing this will increase CPU usage during
 rem *** the visible screen.
 set paddlerange 160

 rem *** The driving control does 16 pulses per full rotation. To use the
 rem *** control like a paddle (instead of a slowly turned steering wheel)
 rem *** you'd need to turn the control 10 full rotations to cross the 
 rem *** screen. 
 rem *** To overcome this, when the driving control is selected (later)
 rem *** we use "port0resolution = 3" to triple the size of values returned. 
 rem *** We also apply a "drivingboost" acceleration curve (here) so the
 rem *** values returned are larger than 3, when the wheel is turned quickly,
 set drivingboost on

 rem *** Eliminate Y axis checking for mice. Uses less CPU time.
 set mousexonly on

 rem *** Our default is paddle. No particular reason.
 changecontrol 0 paddle

 dim firetest=a
 dim device=b

 incgraphic atascii_full.png 320A 1 0
 incgraphic arrow.png 320A

 characterset atascii_full
 alphachars ASCII

 rem *** set the colors for palette 0 and 1
  P1C2=$0F

main
 clearscreen

 rem ** the mouse buttons are read just like two-button joystick buttons...
 firetest=$0F
 if joy0fire0 then firetest=(firetest|$87)&$F7
 if joy0fire1 then firetest=(firetest|$47)&$F7
 P0C2=firetest

 if switchselect then gosub changecontroller

 if device=0 then plotchars 'device: paddle' 1 48 0
 if device=1 then plotchars 'device: st mouse x1' 1 48 0
 if device=2 then plotchars 'device: st mouse x2' 1 48 0
 if device=3 then plotchars 'device: amiga mouse x1' 1 48 0
 if device=4 then plotchars 'device: amiga mouse x2' 1 48 0
 if device=5 then plotchars 'device: driving wheel x1' 1 48 0
 if device=6 then plotchars 'device: driving wheel x2' 1 48 0
 if device=7 then plotchars 'device: driving wheel x3' 1 48 0

 plotvalue atascii_full 1 mousex0 2 0 0

 rem ** Draw the sprite, wait a frame, and loop...
 plotsprite arrow 0 mousex0 120
 drawscreen
 goto main

changecontroller
  clearscreen
  drawscreen
  if switchselect then goto changecontroller ; cheap debounce
  device=(device+1)&7
  if device=0 then changecontrol 0 paddle
  if device=1 then changecontrol 0 stmouse    : rem changecontrol defaults to setting port#resolution=1
  if device=2 then changecontrol 0 stmouse : port0resolution=2
  if device=3 then changecontrol 0 amigamouse 
  if device=4 then changecontrol 0 amigamouse : port0resolution=2
  if device=5 then changecontrol 0 driving:port0resolution=1
  if device=6 then changecontrol 0 driving:port0resolution=2
  if device=7 then changecontrol 0 driving:port0resolution=3
  return
