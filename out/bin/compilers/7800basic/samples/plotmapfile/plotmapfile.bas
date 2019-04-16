 	
  set doublewide on
  set tv ntsc

  dim xpos=a
  dim ypos=b
  dim frame=c
  dim herodir=d
  dim walkframe=e
 
  displaymode 160A

  xpos=40

  rem ** setup Palette 0
  P0C1=$00
  P0C2=$76
  P0C3=$3b

  rem ** setup Palette 1
  P1C1=$12
  P1C2=$F6
  P1C3=$Fc

  rem ** setup Palette 2
  P2C1=$62
  P2C2=$86
  P2C3=$fc

  rem ** set the background color
  BACKGRND=$00

  rem ** the last parameter is the "default palette" each tileset will use
  rem ** when you create a map with the plotmapfile command...

  incgraphic gfx/tileset_blanks.png 160A 0 1 2 3 1
  incgraphic gfx/tileset_rocks.png 160A 0 1 2 3 1 
  incgraphic gfx/tileset_water.png 160A 0 1 2 3 2
  incgraphic gfx/scoredigits_8_wide.png 160A 0 1 2 3
  incgraphic gfx/alphabet_8_wide.png 160A 0 2 1 3 


  incgraphic gfx/herodown1.png
  incgraphic gfx/herodown2.png
  incgraphic gfx/heroleft1.png
  incgraphic gfx/heroleft2.png
  incgraphic gfx/heroup1.png
  incgraphic gfx/heroup2.png
  incgraphic gfx/heroright1.png
  incgraphic gfx/heroright2.png

  P0C1=heroright2_color1
  P0C2=heroright2_color2
  P0C3=heroright2_color3

  incmapfile gfx/myplotmapfile.tmx

  rem ** activate the graphics area with our tiles...
  characterset tileset_blanks

  clearscreen

  rem ** put the background down and save the screen before the main loop. 
  rem ** this way we don't setup the background over and over again.

  plotmapfile gfx/myplotmapfile.tmx myplotmapfile 0 0 20 12
  savescreen

  drawscreen

mainloop

    rem ** move our hero in only the cardinal directions...
    walkframe=walkframe+1
    if joy0down  then ypos=ypos+1:herodir=0:goto doneherowalk
    if joy0up    then ypos=ypos-1:herodir=2:goto doneherowalk
    if joy0left  then xpos=xpos-1:herodir=1:goto doneherowalk
    if joy0right then xpos=xpos+1:herodir=3:goto doneherowalk
    walkframe=walkframe-1 : rem we didn't move
doneherowalk

    restorescreen

    rem ** calculate which animation frame to display, based on direction and
    rem ** the walking counter...

    temp1=(herodir*2)+((walkframe/16)&1)
    plotsprite herodown1 0 xpos ypos temp1


    drawscreen

    goto mainloop

