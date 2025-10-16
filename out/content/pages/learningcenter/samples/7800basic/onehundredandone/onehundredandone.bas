
 rem ** 101 sprites double-buffered display. This routine and 7800basic can handle
 rem ** more, but Maria runs out of DMA time when too many of the sprites drift
 rem ** into the same zone. As it stands, this demo intentionally spreads the
 rem ** sprites out vertically, to help Maria out. 

  rem ** Make the rom a 128k cart with ram, because we want extra RAM
  set romsize 128kRAM

  set zoneheight 16

  rem ** setup some cart ram as display list memory
  set dlmemory $4000 $67ff

  characterset atascii
  alphachars ASCII

  dim frame=a
  dim tempplayerx=b
  dim tempplayery=c
  dim tempplayercolor=d
  dim tempplayerdx=e
  dim tempplayerdy=f

  rem ** variable arrays for holding sprite info
  dim playerx=$2200
  dim playery=$2300
  dim playerdx=$2400
  dim playerdy=$2500

  rem ** include graphics
  incgraphic gfx/atascii.png 320A
  incgraphic gfx/ball.png

  rem ** background color
  BACKGRND=$00

  rem ** initialize the position of a bunch of sprites
  x=10: y=8
  for z=0 to 100
    playerx[z]=x
    playery[z]=y
    y=y+34
    if y>171 then y=y-171:x=x+23
    if x>149 then x=x-149
    playerdx[z]=(rand&2)-1
    playerdy[z]=(rand&2)-1
  next

  rem ** draw the screen background
  clearscreen
  drawscreen

  doublebuffer on

  plotchars '7800basic, 101 Sprite Demo' 0 24 0

  rem ** it's important buffering is active before the savescreen.
  rem ** otherwise savescreen won't copy the saved screen into both buffers.
  savescreen

  drawscreen

  rem ** color palettes
  P0C1=$F2: P0C2=$F9: P0C3=$Fe
  P1C1=$06: P1C2=$0c: P1C3=$0f
  P2C1=$22: P2C2=$26: P2C3=$2c
  P3C1=$42: P3C2=$44: P3C3=$49
  P4C1=$72: P4C2=$79: P4C3=$7e
  P5C1=$92: P5C2=$99: P5C3=$9e
  P6C1=$a2: P6C2=$a9: P6C3=$ae
  P7C1=$d2: P7C2=$D9: P7C3=$de

main

 rem ** Without double-buffering, the 7800 works best if we split up the
 rem ** game logic from the plot commands. This isn't needed when double 
 rem ** buffering is used.

 restorescreen

 for z=0 to 100
     rem ** update each sprite position variable...
     tempplayerx=playerx[z]+playerdx[z]
     tempplayery=playery[z]+playerdy[z]
     if tempplayerx<2 then playerdx[z]=1:goto skipx 
     if tempplayerx>149 then playerdx[z]=-1
skipx
     if tempplayery<8 then playerdy[z]=1:goto skipy
     if tempplayery>172 then playerdy[z]=-1
skipy
     playerx[z]=tempplayerx
     playery[z]=tempplayery

     q=z&7
     plotsprite ball q tempplayerx tempplayery
 next

 doublebuffer flip
 goto main

  rem ** 320A mode at the top of the screen for text, and color it line-by-line
topscreenroutine
  displaymode 320A
  WSYNC=0
  P0C2=$19
  WSYNC=0
  P0C2=$3a
  WSYNC=0
  P0C2=$5b
  WSYNC=0
  P0C2=$7c
  WSYNC=0
  P0C2=$9c
  WSYNC=0
  P0C2=$Bb
  WSYNC=0
  P0C2=$Da
  WSYNC=0
  P0C2=$F9
  WSYNC=0
  WSYNC=0
  displaymode 160A
  return
