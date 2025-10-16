 rem ** The 7800basic "Under The Hood" demo. 20200530
 rem 
 rem ** a demonstration of how to use the included updateobjects.asm assembly
 rem ** code to manipulate DL objects. You should probably understand some
 rem ** basics about 7800 display lists before you take on updteobjects.asm.
 rem 
 rem ** the functionality the demo covers is:
 rem **
 rem **   enabling/disabling DL objects 
 rem **   modifying object palette
 rem **   modifying object X coordinate 
 rem **   modifying object Y coordinate (within the zone)
 rem **   modifying object image lo pointer (index within object's gfx block) 
 rem **   modifying object image pointer (can point to another gfx block)

 asm
 ; ** import the module. This one can go in the middle of the code flow.
 include updateobjects.asm
end

 displaymode 160A
 set zoneheight 16

  rem ** color palettes
  P0C1=$F2: P0C2=$F9: P0C3=$Fe
  P1C1=$06: P1C2=$0c: P1C3=$0f
  P2C1=$22: P2C2=$26: P2C3=$2c
  P3C1=$42: P3C2=$44: P3C3=$49
  P4C1=$62: P4C2=$69: P4C3=$6e
  P5C1=$92: P5C2=$99: P5C3=$9e
  P6C1=$a2: P6C2=$a9: P6C3=$ae
  P7C1=$d2: P7C2=$D9: P7C3=$de

 rem ** Next we'll import some basic graphics, and use them to setup a grid of
 rem ** objects. It's up to you to populate the DL with plotsprite or 
 rem ** plotchars, and do so in a way that you know which object if first, 
 rem ** second, etc.

 incgraphic gfx/ascii_4_wide_2color.png 160A
 incgraphic gfx/ball.png 160A
 incgraphic gfx/smallball.png 160A

 characterset ascii_4_wide_2color
 alphachars ASCII

 rem ** When using plotsprite to create DL objects we want to modify, the 
 rem ** object needs to be plotted at a Y coordinate that's evenly divisible
 rem ** by the zone height, or else it will cause two half sprites to be
 rem ** created in the display list.

 clearscreen
 for y=16 to 176 step 32
 for x=16 to 136 step 8
    plotsprite ball 0 x y
 next
 next

 rem ** plot some label test, just to make it obvious which row is demoing
 rem ** which updateobjects macro...

 plotchars 'ENABLE/DISABLE OBJECTS' 1 0 0
 plotchars 'SET OBJECT PALETTE' 1 0 2
 plotchars 'SET OBJECT X' 1 0 4
 plotchars 'SET OBJECT Y' 1 0 6
 plotchars 'SET OBJECT IMAGE LO' 1 0 8
 plotchars 'SET OBJECT IMAGE' 1 0 10

 savescreen

 rem ** some variables we'll need for each demo...
 dim EnableDisableBall=b
 dim PaletteBall=c
 dim PaletteValue=d
 dim CoordinateXBall=e
 dim CoordinateXBallX=f
 dim CoordinateYBall=g
 dim ImageLoBall=h
 dim ImageBall=i

 rem ** Note, that we don't actually do any object plotting in the main loop. 
 rem ** We only modify the existing DL objects.

mainloop

 drawscreen

 temp1 = framecounter & 31
 if temp1 <> 0 then goto mainloop

 rem ******** ENABLE/DISABLE 
     rem ** first fix the previously modified ball
     asm
     ldx EnableDisableBall
     ldy #1
     EnableObject 
end
     rem ** now move on to the next ball
     EnableDisableBall=(EnableDisableBall+1)&15
     rem ** and then disable it
     asm
     ldx EnableDisableBall
     ldy #1
     DisableObject 
end

 rem ******** PALETTE
     rem ** first fix the previously modified ball
     asm
     ldx PaletteBall
     ldy #3
     SetObjectPalette #0 ; if you use a constant, you must use "#"
end
     rem ** now move on to the next ball
     PaletteBall=(PaletteBall+1)&15

     rem ** Get our new palette index. To keep it simple we just base it on
     rem ** the ball index
     PaletteValue=(PaletteValue+1)&7
     if PaletteValue=0 then PaletteValue=1

     rem ** and then set it's palette 
     asm
     ldx PaletteBall
     ldy #3
     SetObjectPalette PaletteValue
end

 rem ******** X COORDINATE
     CoordinateXBallX = (CoordinateXBall * 8) + 16
     rem ** first fix the previously modified ball
     asm
     ldx CoordinateXBall
     ldy #5
     SetObjectX CoordinateXBallX
end
     rem ** now move on to the next ball
     CoordinateXBall=(CoordinateXBall+1)&15

     rem ** shift it's X a bit
     CoordinateXBallX = (CoordinateXBall * 8) + 18

     rem ** and then set it's X coordinate
     asm
     ldx CoordinateXBall
     ldy #5
     SetObjectX CoordinateXBallX
end

 rem ******** Y COORDINATE
     rem ** first fix the previously modified ball
     asm
     ldx CoordinateYBall
     ldy #7
     SetObjectY #0
end
     rem ** now move on to the next ball
     CoordinateYBall=(CoordinateYBall+1)&15

     rem ** and then set it's Y coordinate
     asm
     ldx CoordinateYBall
     ldy #7
     SetObjectY #8 ; 8 pixels lower
end

 rem ******** IMAGE LO
     rem ** first fix the previously modified ball
     asm
     ldx ImageLoBall
     ldy #9
     SetObjectImageLo #<ball
end
     rem ** now move on to the next ball
     ImageLoBall=(ImageLoBall+1)&15

     rem ** and then set a new image
     asm
     ldx ImageLoBall
     ldy #9
     SetObjectImageLo #<smallball
end


 rem ******** IMAGE 
     rem ** first fix the previously modified ball
     asm
     ldx ImageBall
     ldy #11
     SetObjectImage ball
end
     rem ** now move on to the next ball
     ImageBall=(ImageBall+1)&15

     rem ** and then set a new image
     asm
     ldx ImageBall
     ldy #11
     SetObjectImage smallball
end


 goto mainloop

