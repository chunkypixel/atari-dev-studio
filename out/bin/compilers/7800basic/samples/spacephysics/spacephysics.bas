 /***************************************************************************

 A simple-as-possible program to demonstrate thrust mechanics in 7800basic.

 Features:
  Ship with 16 angles of rotation, and thrust system
  3 bullets with fire button debouncing
  "Atmospheric" drag to slow down the ship
  Optional code blocks to change the ship thrust power
  Optional code blocks to change the bullet velocity
  Optional code blocks to change bullet behaviors at edges: stop, bounce, 
    or wrap
  Optional code blocks to change ship behavior at edges: bounce or wrap

 Key Concepts: 
  The ship position and velocity are held as fixed point variables, 
  which are basically 16-bit values, with one byte representing whole 
  numbers, and one byte representing fractional numbers. This allows 
  for "movement" smaller than 1 pixel per frame.
  [http://www.randomterrain.com/7800basic.html#8_8_fixed_point_variables]

  The code relies a fair bit on two's complement math, where (for example) 
  255 can mean 255 or -1, depending on how its used. ie. when you're using 
  bytes for storage, 3-1=2, and 3+255=2. So we wind up adding the dx/dy 
  velocity values to the ship position, whether they're negative or positive.
  [https://en.wikipedia.org/wiki/Two%27s_complement]

  The thrust table is a sine wave, with an extra quarter wave so we can use 
  the same table for cosine lookups. When we look up the thrust values using 
  the ship's angle, it's analogous to finding a point for a given angle on 
  the unit circle.
  [https://www.mathsisfun.com/geometry/unit-circle.html]

  Understanding these key concepts aren't a requirement to using the code -
  you can treat the routines as a black box - but modifications to any of the
  routines or memory layout will be tricky otherwise. 

  ***************************************************************************/

  displaymode 320A
  set zoneheight 16
  set screenheight 192
  set plotvalueonscreen on
  set romsize 32k
  set basepath gfx/

  rem ** some handy temp variables...
  dim tempx=var46
  dim tempy=var47
  dim temploop=var48
 
  rem ** joystick fire debounce...
  dim debouncefire=var49

  rem ** ship attributes...
  dim ship_angle=var50     ;direction ship is facing 

  rem ** fixed point variables for game object coordinates and velocities...
    rem ** the ship position...
    dim ship_x=var1.var2
    dim ship_y=var3.var4

    rem ** the ship velocity...
    dim ship_dx=var5.var6
    dim ship_dy=var7.var8

    rem ** the bullet fixed point variables follow. The relative order of the 
    rem ** memory locations used is important, because some subroutines use
    rem ** the relative locations to loop through locations... 

    rem ** the positions of the 3 bullets...
    dim bullet1_x=var9.var15
    dim bullet2_x=var10.var16
    dim bullet3_x=var11.var17
    dim bullet1_y=var12.var18
    dim bullet2_y=var13.var19
    dim bullet3_y=var14.var20

    rem ** the velocities of the 3 bullets...
    dim bullet1_dx=var21.var27
    dim bullet2_dx=var22.var28
    dim bullet3_dx=var23.var29
    dim bullet1_dy=var24.var30
    dim bullet2_dy=var25.var31
    dim bullet3_dy=var26.var32

  rem ** bullet time on screen...
  dim bullet1_time=var33
  dim bullet2_time=var34
  dim bullet3_time=var35

  rem ** setup Palette 0 (Default player ship color yellow)
  P0C2=$8E; white
  P1C2=$0E; white
  P2C2=$1B; yellow
  P3C2=$4B; unused

  incgraphic bullet_8x8.png
  incgraphic shipwedge_0_8x8.png   320C
  incgraphic shipwedge_1_8x8.png   320C
  incgraphic shipwedge_2_8x8.png   320C
  incgraphic shipwedge_3_8x8.png   320C
  incgraphic shipwedge_4_8x8.png   320C
  incgraphic shipwedge_5_8x8.png   320C
  incgraphic shipwedge_6_8x8.png   320C
  incgraphic shipwedge_7_8x8.png   320C
  incgraphic shipwedge_8_8x8.png   320C
  incgraphic shipwedge_9_8x8.png   320C
  incgraphic shipwedge_10_8x8.png  320C
  incgraphic shipwedge_11_8x8.png  320C
  incgraphic shipwedge_12_8x8.png  320C
  incgraphic shipwedge_13_8x8.png  320C
  incgraphic shipwedge_14_8x8.png  320C
  incgraphic shipwedge_15_8x8.png  320C

  incgraphic shipwedgeT_0_8x8.png  320C
  incgraphic shipwedgeT_1_8x8.png  320C
  incgraphic shipwedgeT_2_8x8.png  320C
  incgraphic shipwedgeT_3_8x8.png  320C
  incgraphic shipwedgeT_4_8x8.png  320C
  incgraphic shipwedgeT_5_8x8.png  320C
  incgraphic shipwedgeT_6_8x8.png  320C
  incgraphic shipwedgeT_7_8x8.png  320C
  incgraphic shipwedgeT_8_8x8.png  320C
  incgraphic shipwedgeT_9_8x8.png  320C
  incgraphic shipwedgeT_10_8x8.png 320C
  incgraphic shipwedgeT_11_8x8.png 320C
  incgraphic shipwedgeT_12_8x8.png 320C
  incgraphic shipwedgeT_13_8x8.png 320C
  incgraphic shipwedgeT_14_8x8.png 320C
  incgraphic shipwedgeT_15_8x8.png 320C
 
  rem ** Initializations
    ship_angle=4                   ; facing right 
    ship_x=24
    ship_y=92
    ship_dx=0.0                    ; dead stop
    ship_dy=0.0                    ; dead stop
    debouncefire=0

    bullet1_x=200:bullet2_x=200:bullet3_x=200 ; x=200 means inactive

main_loop
  clearscreen

  rem ###### Section 1. ship controls and physics
    rem ** check the joystick and change the ship rotation...
    gosub rotate

    rem ** add thrust to velocity...
    if joy0up then gosub addshipthrust
    
    rem ** add velocity to ship coordinates...
    ship_x=ship_x+ship_dx
    ship_y=ship_y+ship_dy

    rem ** slow the ship down...
    gosub adddrag

    rem ** check if the ship has hit a wall...
    gosub check_ship_boundary

  rem ###### Section 2. bullet firing controls and physics
    gosub check_firebutton

    rem ** move the bullets, if they're in the air...
    gosub move_bullets

    rem ** check if the bullets have hit the wall...
    gosub check_bullet_boundary

    rem ** check if the bullets have been on-screen too long...
    gosub check_bullet_time

  rem ###### Section 3. display objects. this should always be last in the main loop for maximum efficiency.
    rem ** ship display...
    gosub display_live_player

    rem ** bullet display...
    gosub display_bullets

  drawscreen

  goto main_loop

rotate
  rem ** only rotate every 8th frame to slow it down...
  if (framecounter&7) then return
  if joy0left  then ship_angle=(ship_angle-1)&15
  if joy0right then ship_angle=(ship_angle+1)&15 
  return

check_ship_boundary
  /*
     there are 2 optional behaviours for ship:
	* bounce the ship if it hits a wall
	* allow the ship to wrap around the screen edges
     uncomment the code block you want to enable, comment the others.
  */

  rem ** bounce the ship if it hits a wall
    if ship_x<5 || ship_x>145 then ship_dx=0.0-ship_dx
    if ship_y>170 || ship_y<5 then ship_dy=0.0-ship_dy

/*
  rem ** allow the ship to wrap around the screen edges...
    if ship_x<5 then ship_x=145
    if ship_x>145 then ship_x=5
    if ship_y<5 then ship_y=170
    if ship_y>170 then ship_y=5
*/

  return

display_live_player
  if joy0up then plotsprite shipwedgeT_0_8x8 0 ship_x ship_y ship_angle : return
  plotsprite shipwedge_0_8x8 0 ship_x ship_y ship_angle
  return

addshipthrust
 dim tempfix=temp1.temp2


 rem ** lookup x component of thrust from our table...
 temp3=ship_angle*2    ; +0=sine lookup
 temp1=thrusttable[temp3]
 temp3=temp3+1
 temp2=thrusttable[temp3]

 asm
 ; ** signed divide by 2
 ; ** this is a bit of a kludge for 320 mode. Because 320 mode uses 160 sprite
 ; ** positioning resolution, we need to divide X accelerations/velocities by 2.
 ; ** alternatively we could have created a second velocity table with the divide
 lda temp1
 cmp #$80
 ror temp1
 ror temp2
end
 ship_dx=ship_dx+tempfix

 rem ** maximum warp x=2. Clamp the ship from moving more than 2 x pixels/frame
 if ship_dx>127 && ship_dx<254 then ship_dx=254
 if ship_dx<127 && ship_dx>2 then ship_dx=2

 rem ** lookup y component of thrust from our table...
 temp3=(ship_angle*2)+8 ; +8=cosine lookup
 temp1=thrusttable[temp3]
 temp3=temp3+1
 temp2=thrusttable[temp3]
 ship_dy=ship_dy-tempfix

 rem ** maximum warp y=3. Clamp the ship from moving more than 3 y pixels/frame
 if ship_dy>127 && ship_dy<253 then ship_dy=253
 if ship_dy<127 && ship_dy>3 then ship_dy=3
 return
  
 rem ** this is a 16-bit sine+cosine table, used for thrust based on the angle
; strong thrust table
/*
 data thrusttable
 $00,$00, $00,$06, $00,$0b, $00,$0e
 $00,$10, $00,$0e, $00,$0b, $00,$06
 $00,$00, $ff,$fa, $ff,$f5, $ff,$f2
 $ff,$f0, $ff,$f2, $ff,$f5, $ff,$fa
 $00,$00, $00,$06, $00,$0b, $00,$0e
end
*/

; medium thrust table
 data thrusttable
 $00,$00, $00,$03, $00,$05, $00,$07
 $00,$08, $00,$07, $00,$05, $00,$03
 $00,$00, $ff,$fd, $ff,$fb, $ff,$f9
 $ff,$f8, $ff,$f9, $ff,$fb, $ff,$fd
 $00,$00, $00,$03, $00,$05, $00,$07
end

; weak thrust table
/*
 data thrusttable
 $00,$00, $00,$01, $00,$02, $00,$03
 $00,$04, $00,$03, $00,$02, $00,$01
 $00,$00, $ff,$ff, $ff,$fe, $ff,$fd
 $ff,$fc, $ff,$fd, $ff,$fe, $ff,$ff
 $00,$00, $00,$01, $00,$02, $00,$03
end
*/

adddrag
 rem ** don't drag every frame, or we slow down too fast...
 if(framecounter&31) then return
 
 rem ** each time addrag is called, velocity loses 1/8th of its current value
 if ship_dx>127 then tempfix=0.0-ship_dx else tempfix=ship_dx
 asm
     LSR tempfix
     ROR tempfix+1; divided by 2
     LSR tempfix
     ROR tempfix+1; divided by 4
     LSR tempfix
     ROR tempfix+1; divided by 8
end
 rem ** if 1/8th of the speed is 0, then completely stop...
 if (temp1|temp2)=0 then ship_dx=0.0

 rem ** subtract 1/8th from the x velocity...
 if ship_dx>127 then ship_dx=ship_dx+tempfix else ship_dx=ship_dx-tempfix

 if ship_dy>127 then tempfix=0.0-ship_dy else tempfix=ship_dy
 asm
     LSR tempfix
     ROR tempfix+1; divided by 2
     LSR tempfix
     ROR tempfix+1; divided by 4
     LSR tempfix
     ROR tempfix+1; divided by 8
end
 rem ** subtract 1/8th from the y velocity...
 if (temp1|temp2)=0 then ship_dy=0.0

 rem ** subtract 1/8th from the y velocity...
 if ship_dy>127 then ship_dy=ship_dy+tempfix else ship_dy=ship_dy-tempfix

 return


check_firebutton
 rem ** return if the ship already fired a shot and the player is holding 
 rem ** the fire button down... 
 if debouncefire>0 && joy0fire then return

 rem ** if the player isn't holding fire, ensure debouncefire is clear and 
 rem ** return...
 if !joy0fire then debouncefire=0:return

 rem ** if we're here, the player just pressed fire. Check to see if we have 
 rem ** a free bullet to fire...
 temp5=255
 for temp1=0 to 2
   if bullet1_x[temp1]!=200 then temp5=temp1
 next

 rem ** return if all 3 bullets are in play then return...
 if temp5=255 then return

 debouncefire=255 ; remember that the fire button was pressed

 bullet1_time[temp5]=200 ; the bullet lives for 200 frames

 rem ** set the bullet position to the middle of the ship...
 bullet1_x[temp5]=ship_x+1;
 bullet1_y[temp5]=ship_y+3;

 rem ** set the x component of bullet velocity...
 temp3=ship_angle*2 ; +0 for sine lookup
 bullet1_dx[temp5]=bulletvelocity[temp3]
 temp5=temp5+6 ; in our dim statements, the low bytes of fixed point 
               ; numbers are +6 bytes away from the high bytes
 temp3=temp3+1
 bullet1_dx[temp5]=bulletvelocity[temp3]

 temp5=temp5-6 ; restore temp5

 asm
 ; ** 16-bit signed division by 2.
 ; ** this is a bit of a kludge for 320 mode. Because 320 mode uses 160 sprite
 ; ** positioning resolution, we need to divide X accelerations/velocities by 2.
 ; ** alternatively we could have created a second velocity table with the divide
 ; ** by 2 baked in.
  ldx temp5
  lda bullet1_dx,x
  cmp #$80  
  ror bullet1_dx,x
  ror bullet1_dx+6,x
end

 rem ** set the y component of bullet velocity...
 rem ** Bitmap Y coordinates grow downward, instead of up like math Y coordinates
 temp3=(ship_angle*2)+8 ; +8 for cosine lookup
 bullet1_dy[temp5]=bulletvelocity[temp3]^255
 rem ** the ^255 is a fancy way of changing bullet1_dy into -bullet1_dy.
 rem ** Technically we should add +1, but it's a very small error value.

 temp5=temp5+6 ; in our dim statements, the low bytes of fixed point 
               ; numbers are +6 bytes away from the high bytes
 temp3=temp3+1
 bullet1_dy[temp5]=bulletvelocity[temp3]^255
 rem ** the ^255 is a fancy way of changing bullet1_dy into -bullet1_dy.
 rem ** Technically we should add +1, but it's a very small error value.
 return

move_bullets
 rem ** if a bullet x isn't in flight, its x coordinate is 200
 if bullet1_x<>200 then bullet1_x=bullet1_x+bullet1_dx:bullet1_y=bullet1_y+bullet1_dy
 if bullet2_x<>200 then bullet2_x=bullet2_x+bullet2_dx:bullet2_y=bullet2_y+bullet2_dy
 if bullet3_x<>200 then bullet3_x=bullet3_x+bullet3_dx:bullet3_y=bullet3_y+bullet3_dy
 return

check_bullet_time
  rem ** deactivate any live bullets if their timer  has counted down to 0
  for temp1=0 to 2
    if bullet1_time[temp1]>0 then bullet1_time[temp1]=bullet1_time[temp1]-1 else bullet1_x[temp1]=200
  next
 return


check_bullet_boundary
  /*
     there are 3 optional behaviours for bullets:
	* stop the bullets if they hit a wall
	* bounce the bullets if they hit a wall
	* allow bullets to wrap around the screen edges
     uncomment the code block you want to enable, comment the others.
  */

  for temp1=0 to 2
    tempx=bullet1_x[temp1]
    tempy=bullet1_y[temp1]

    rem ** stop the bullets if they hit a wall
      if tempx<5 || tempx>145 then bullet1_x[temp1]=200
      if tempy<5 || tempy>170 then bullet1_x[temp1]=200

/*
    rem ** bounce the bullets if they hit a wall
      temp2=temp1+6
      if tempx<5 || tempx>145 then bullet1_dx[temp1]=bullet1_dx[temp1]^255:bullet1_dx[temp2]=bullet1_dx[temp2]^255
      if tempy<5 || tempy>170 then bullet1_dy[temp1]=bullet1_dy[temp1]^255:bullet1_dy[temp2]=bullet1_dy[temp2]^255
      rem ** the ^255 is a fancy way of negating the bullet velocity.
      rem ** Technically we should add +1, but it's a very small error value.
*/

/*
    rem ** allow the bullets to wrap around the screen edges...
      if tempx<5 then bullet1_x[temp1]=145
      if tempx>145 then bullet1_x[temp1]=5
      if tempy<5 then bullet1_y[temp1]=170
      if tempy>170 then bullet1_y[temp1]=5
*/
	
  next
  return

 rem ** this is a 16-bit sine+cosine table, used for intial bullet velocity,
 rem ** based on the ship angle...
/*
; slow bullet velocity 
 data bulletvelocity
 $00,$00, $00,$61, $00,$b5, $00,$ec
 $01,$00, $00,$ec, $00,$b5, $00,$61
 $00,$00, $ff,$9f, $ff,$4b, $ff,$14
 $ff,$00, $ff,$14, $ff,$4b, $ff,$9f
 $00,$00, $00,$61, $00,$b5, $00,$ec
end
*/

; medium bullet velocity 
 data bulletvelocity
 $00,$00, $00,$92, $01,$0f, $01,$62
 $01,$80, $01,$62, $01,$0f, $00,$92
 $00,$00, $ff,$6e, $fe,$f1, $fe,$9e
 $fe,$80, $fe,$9e, $fe,$f1, $ff,$6e
 $00,$00, $00,$92, $01,$0f, $01,$62
end

/*
; fast bullet velocity 
 data bulletvelocity
 $00,$00, $00,$c3, $01,$6a, $01,$d9
 $02,$00, $01,$d9, $01,$6a, $00,$c3
 $00,$00, $ff,$3d, $fe,$96, $fe,$27
 $fe,$00, $fe,$27, $fe,$96, $ff,$3d
 $00,$00, $00,$c3, $01,$6a, $01,$d9
end
*/

display_bullets
  for temploop=0 to 2
    tempx=bullet1_x[temploop]
    tempy=bullet1_y[temploop]
    if tempx<>200 then plotsprite bullet_8x8 0 tempx tempy
  next
  return


