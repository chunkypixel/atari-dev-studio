
  rem ** color fade demo
 	
  set doublewide on
  set tv ntsc

  dim xpos=a
  dim ypos=b
  dim frame=c
  dim herodir=d
  dim moving=e
  dim heroframe=f
  dim fadevalue=g
 
  displaymode 160A

  xpos=40

  incgraphic gfx/tileset_blanks.png 160A 3 0 1 2
  incgraphic gfx/tileset_rocks.png 
  incgraphic gfx/scoredigits_8_wide.png
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

  rem ** activate the graphics area with our tiles...
  characterset tileset_blanks

  clearscreen

  rem ** put the background down and save the screen before the main loop. 
  rem ** this way we don't setup the background over and over again.

  plotmap screen1map 1 0 0 20 12
  plotchars demotext 2 64 3 4
  savescreen

  drawscreen

  frame=0

mainloop

  rem ** fade in and out...
  if frame<15 then fadevalue=fadevalue+1
  if frame>127 && frame<143 then fadevalue=fadevalue-1

  rem ** set the global fade value...
  setfade fadevalue

  rem ** fetch the fade values appropriate for our colors.
  rem ** note the "black" argument, which zeroes the hue nibble
  rem ** when the luminance nibble is zero.

  P1C1=getfade($12,black)
  P1C2=getfade($F6,black)
  P1C3=getfade($FC,black)

  P2C1=getfade($62,black)
  P2C2=getfade($86,black)
  P2C3=getfade($AC,black)

  rem ** we skip the "black" argument for the hero. you'll see him
  rem ** in the dark, since a hue with 0 luminance still gets displayed...
  P0C1=getfade(heroright2_color1)
  P0C2=getfade(heroright2_color2)
  P0C3=getfade(heroright2_color3)

  frame=frame+1

    BACKGRND=$00
    if joy0fire1 then BACKGRND=$38
    if joy0fire0 then BACKGRND=$a8

    rem ** move our hero in only the cardinal directions...
    moving=moving+1
    if joy0down  then ypos=ypos+1:herodir=0:goto doneherowalk
    if joy0up    then ypos=ypos-1:herodir=2:goto doneherowalk
    if joy0left  then xpos=xpos-1:herodir=1:goto doneherowalk
    if joy0right then xpos=xpos+1:herodir=3:goto doneherowalk
    moving=moving-1 : rem we didn't move
doneherowalk

    restorescreen

    rem ** calculate which animation frame to display, based on direction and
    rem ** the walking counter...

    heroframe=(herodir*2)+((moving/16)&1)
    plotsprite herodown1 0 xpos ypos heroframe

    plotvalue scoredigits_8_wide 2 score0 6 56 11
    plotvalue scoredigits_8_wide 2 score1 6 56 10

    drawscreen

    goto mainloop

 alphadata demotext alphabet_8_wide
 'demo'
end

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
