
  set doublewide on
  set zoneheight 8

  displaymode 160A

  set tallsprite off

  incgraphic gfx/tileset_ramchars.png 160A

  rem ** we're using a bit of math and the "frame" parameter of plotsprite
  rem ** to simplify the walk cycle. The relative order of these is
  rem ** important.
  rem ** aslo, because we're using a zone height of 8, our sprites are
  rem ** limited to being 8 tall. no big deal, we'll just use two of them
  rem ** (a "top" and a "bottom") to make a 16 pixel tall sprite...
  incgraphic gfx/walk_left_top_1.png 160A
  incgraphic gfx/walk_left_top_2.png 160A
  incgraphic gfx/walk_left_top_3.png 160A
  incgraphic gfx/walk_left_top_4.png 160A
  incgraphic gfx/walk_right_top_1.png 160A
  incgraphic gfx/walk_right_top_2.png 160A
  incgraphic gfx/walk_right_top_3.png 160A
  incgraphic gfx/walk_right_top_4.png 160A
  incgraphic gfx/walk_left_bottom_1.png 160A
  incgraphic gfx/walk_left_bottom_2.png 160A
  incgraphic gfx/walk_left_bottom_3.png 160A
  incgraphic gfx/walk_left_bottom_4.png 160A
  incgraphic gfx/walk_right_bottom_1.png 160A
  incgraphic gfx/walk_right_bottom_2.png 160A
  incgraphic gfx/walk_right_bottom_3.png 160A
  incgraphic gfx/walk_right_bottom_4.png 160A


  dim level=a
  dim frame=b
  dim walkframe=c
  dim herox=d
  dim heroy=e
  dim herodir=f
  dim mytemp1=g
  dim mytemp2=h
  dim herochar=i
  dim blockpaint=j
  dim totalpaint=k

  dim screendata = $2200 
  rem the screen data size is 20*24 bytes = 480 bytes ($1E0 in hex)
  rem the next free RAM byte after screendata is $23E0

  rem ** set our palettes based on automatic png->7800 color conversion...
  P0C1=tileset_ramchars_color1
  P0C2=tileset_ramchars_color2
  P0C3=tileset_ramchars_color3

  P1C1=walk_right_bottom_4_color1
  P1C2=walk_right_bottom_4_color2
  P1C3=walk_right_bottom_4_color3

  rem ** one of the advantages of using different sprites for "top" and 
  rem ** "bottom" is we can draw them in different palettes. This allows
  rem ** us to give our hero different colored pants. :)
  P2C1=walk_right_bottom_4_color1
  P2C2=$D4
  P2C3=walk_right_bottom_4_color3

  rem ** we need to let the 7800 know where the character set is
  characterset tileset_ramchars

  rem ** now we setup the screen to the 7800 renders a character map 
  rem ** from RAM...
  clearscreen
  gosub loadlevel
  plotmap screendata 0 0 0 20 24
  savescreen

main 
  restorescreen

  frame=frame+1
  if (frame&7)=0 then walkframe=(walkframe+1)&3
  if (frame&1) then goto joydone
  if joy0left then herodir=0:herox=herox-1:goto joydone
  if joy0right then herodir=4:herox=herox+1:goto joydone
  walkframe=2 : rem make our hero stand tall when he's not walking
joydone

  rem ** see what character is underneath the hero...

    rem ** convert sprite coordinates to character coordinates...
    mytemp1=(herox+4)/8 : rem 8 is our zoneheight 
    mytemp2=heroy/8 : rem 4 is 160A character width, but x2 for doublewide 
    mytemp2=mytemp2+1 : rem the block under our feet

    rem ** ... then make sure we don't try to read/write 
    rem ** off-screen memory...
    if mytemp1>19 || mytemp2>23 then goto falling

    rem ** ...then read the character!
    herochar=peekchar(screendata,mytemp1,mytemp2,20,24)

  rem ** check if hero is on a block that needs to be painted...
  if herochar=2 then pokechar screendata mytemp1 mytemp2 20 24 4:blockpaint=blockpaint+1

  rem ** check if hero is on spikes. if so, make him jump in pain...
  if herochar=6 then heroy=heroy-4

  rem ** if our hero is on a block, he isn't falling...
  if herochar>0 then goto donefalling : rem check if character is blank

falling
  rem ** a simple no-physics fall routine
  heroy=heroy+1
donefalling

  gosub drawhero
  drawscreen
  if blockpaint=totalpaint then level=level+1:gosub loadlevel
  goto main 

drawhero
  mytemp1=herodir+walkframe
  plotsprite walk_left_bottom_1 2 herox heroy mytemp1
  mytemp2=heroy-8
  plotsprite walk_left_top_1 1 herox mytemp2 mytemp1
  return

loadlevel

  rem ** some variables that should get reset when the level loads
  herox=80
  heroy=0
  blockpaint=0

  level=level & 1 : rem ** limit the number of levels to 2

  rem ** use memcpy to copy the ROM level into the block of RAM 
  rem ** starting at our "screendata" variable...
  if level=0 then memcpy screendata level1 480:totalpaint=36
  if level=1 then memcpy screendata level2 480:totalpaint=6
  return
 
 rem ** our tile graphics only have 4x double-wide characters. We'll
 rem ** assign some letters to these so our alphadata looks nice.
 alphachars ' bBi' 

 alphadata level1 tileset_ramchars
 '                    '
 '                    '
 '                    '
 '                    '
 '                    '
 '  bbbbbbbbbbbbbb    '
 '                    '
 '                    '
 '               bbbb '
 '                    '
 '                    '
 '       bbbbbbb      '
 '                    '
 '                    '
 '   bbbbb     iiii   '
 '                    '
 '                    '
 '       iiiii        '
 '                    '
 '                    '
 '                    '
 '          bbbbbb    '
 '                    '
 '                    '
end

 alphadata level2 tileset_ramchars
 '                    '
 '                    '
 '                    '
 '                    '
 '                    '
 '                    '
 '                    '
 '                    '
 '       iiiiii       '
 '                    '
 '                    '
 '                    '
 '                    '
 '       bbbbbb       '
 '                    '
 '                    '
 '                    '
 '                    '
 '                    '
 '                    '
 '                    '
 '                    '
 '                    '
 '                    '
end
