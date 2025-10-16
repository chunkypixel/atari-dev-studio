
 rem ** 36 sprites double-buffered display. This routine and 7800basic can handle
 rem ** more, but Maria runs out of DMA time when too many of the sprites drift
 rem ** into the same zone. As it stands, this demo intentionally spreads the
 rem ** sprites out vertically, to help Maria.

  rem ** Make the rom a 128k cart with ram, because we want extra RAM
  set romsize 128kRAM

  rem ** double-wide text characters
  set doublewide on

  rem ** setup some cart ram as display list memory
  set dlmemory $4000 $57ff

  dim frame=a
  dim tempplayerx=b
  dim tempplayery=c
  dim tempplayercolor=d
  dim tempplayerdx=e
  dim tempplayerdy=f

  rem ** variable arrays for holding sprite info
  dim playerx=$2200
  dim playery=$2240
  dim playerdx=$2280
  dim playerdy=$22C0

  rem ** include graphics
  incgraphic gfx/tileset_blanks.png 160A 3 0 1 2
  incgraphic gfx/tileset_rocks.png
  incgraphic gfx/herodown1.png

  rem ** setup characterset pointer
  characterset tileset_blanks

  rem ** background color
  BACKGRND=$00

  rem ** color palettes
  P0C1=$12: P0C2=$F6: P0C3=$FC
  P1C1=$00: P1C2=$06: P1C3=$3b
  P2C1=$00: P2C2=$36: P2C3=$3b
  P3C1=$00: P3C2=$66: P3C3=$3b
  P4C1=$00: P4C2=$86: P4C3=$3b
  P5C1=$00: P5C2=$A6: P5C3=$3b
  P6C1=$00: P6C2=$C6: P6C3=$3b
  P7C1=$00: P7C2=$D6: P7C3=$3b

  rem ** initialize the position of a bunch of sprites
  x=10: y=2
  for z=0 to 50
    playerx[z]=x
    playery[z]=y
    y=y+36
    if y>170 then y=y-170:x=x+21
    if x>140 then x=x-140
    playerdx[z]=(rand&2)-1
    playerdy[z]=(rand&2)-1
  next

  rem ** draw the screen background
  clearscreen
  plotmap screen1map 0 0 0 20 12
  drawscreen

  doublebuffer on

  rem ** it's important buffering is active before the savescreen.
  rem ** otherwise savescreen won't copy the saved screen into both buffers.
  savescreen


main

 rem ** Without double-buffering, the 7800 works best if we split up the
 rem ** game logic from the plot commands. This isn't needed when double 
 rem ** buffering is used.

 restorescreen

 for z=0 to 39
     rem ** update each sprite position variable...
     tempplayerx=playerx[z]+playerdx[z]
     tempplayery=playery[z]+playerdy[z]
     if tempplayerx<2 then playerdx[z]=1
     if tempplayerx>145 then playerdx[z]=-1
     if tempplayery<2 then playerdy[z]=1
     if tempplayery>172 then playerdy[z]=-1
     playerx[z]=tempplayerx
     playery[z]=tempplayery

     rem ** figure out which palette to use...
     q=(z&7)+1
     if q>7 then q=7
  
     rem ** use plotsprite4 to save some memory and render time...
     plotsprite4 herodown1 q tempplayerx tempplayery
 next

 doublebuffer flip

 goto main

 alphachars ' abcdefghijklmnopqrstuvwxyz'

 alphadata screen1map tileset_blanks
 'hifgfg        fgfghi'
 'hi                hi'
 'hi                hi'
 'fg                fg'
 '                    '
 '                    '
 '                    '
 '                    '
 'hi                hi'
 'hi                hi'
 'hi              dehi'
 'fgfgfg        fgfgfg'
end

