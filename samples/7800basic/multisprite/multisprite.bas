
 rem ** 24 sprites display. this is about the limit on real hardware.

  set doublewide on

  dim frame=a
  dim tempplayerx=b
  dim tempplayery=c
  dim tempplayercolor=d
  dim tempplayerdx=e
  dim tempplayerdy=f

  dim playerx=$2200
  dim playery=$2220
  dim playerdx=$2240
  dim playerdy=$2260

  incgraphic gfx/tileset_blanks.png 160A 3 0 1 2
  incgraphic gfx/tileset_rocks.png
  incgraphic gfx/herodown1.png

  characterset tileset_blanks

  BACKGRND=$00

  P0C1=$12
  P0C2=$F6
  P0C3=$FC

  P1C1=$00
  P1C2=$96
  P1C3=$3b

  P2C1=$00
  P2C2=$46
  P2C3=$3b

  P3C1=$00
  P3C2=$D6
  P3C3=$3b

  P4C1=$00
  P4C2=$F6
  P4C3=$3b

  for z=0 to 31
redox
    playerx[z]=rand&127
    if playerx[z]>140 then goto redox
redoy
    playery[z]=rand&127
    if playery[z]>170 then goto redoy
    playerdx[z]=(rand&2)-1
    playerdy[z]=(rand&2)-1
  next

  clearscreen
  plotmap screen1map 0 0 0 20 12
  drawscreen
  savescreen

main

 rem ** we split up the logic from the plot commands. this allows our logic
 rem ** to run during the visible screen. issuing a plot command forces 
 rem ** 7800basic to wait for the visible screen to end, to avoid glitches.
 restorescreen
 for z=0 to 23
   tempplayerx=playerx[z]+playerdx[z]
   tempplayery=playery[z]+playerdy[z]
   if tempplayerx<2 then playerdx[z]=1
   if tempplayerx>145 then playerdx[z]=-1
   if tempplayery<2 then playerdy[z]=1
   if tempplayery>172 then playerdy[z]=-1
   playerx[z]=tempplayerx
   playery[z]=tempplayery
 next z

 rem ** we could probably get a couple more sprites if we unrolled this loop
 rem ** and used a hardcoded palette value. but this is a bit more realistic.
 for z=0 to 23
   tempplayerx=playerx[z]
   tempplayery=playery[z]
   q=(z&3)+1
   plotsprite herodown1 q tempplayerx tempplayery
 next
 drawscreen

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

