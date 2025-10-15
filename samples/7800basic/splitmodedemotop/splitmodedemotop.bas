
 rem ** This is a quick demo on how to split the screen with 2 modes in 
 rem ** 7800basic. The same technique can be used to just change colors on 
 rem ** the fly.
 rem **
 rem ** To make this demo less CPU-wasteful than the old splitmode demo, we use
 rem ** the "adjustvisible" statement to pretend the text are isn't part of
 rem ** the visible screen. Then we can adjust mode+color using the interrupts
 rem ** that are triggered at the top of the screen (topscreenroutine) and the
 rem ** bottom of the visible screen (bottomscreenroutine)
 
 displaymode 320A

 adjustvisible 2 12

 dim lives=a
 dim xpos=b
 dim ypos=c
 dim frame=d
 dim heroanimframe=e
 dim walkframe=f

 rem ** set the height of characters and sprites...
 set zoneheight 16

 rem ** score display during visible screen. The demo doesn't need this, but
 rem ** its an optimisation, so why not?
 set plotvalueonscreen on

 rem ** import the text characterset png...
 incgraphic gfx/text320a.png 320A 

 rem ** import some 160A graphics...
 incgraphic gfx/tileset_blanks.png 160A 3 0 1 2
 incgraphic gfx/tileset_rocks.png 160A

 rem ** Note the order of these. We later modify the "heroanimframe"
 rem ** variable so we can use it as the plotsprite "frame" parameter
 rem ** to animate the hero with a single plotsprite command.
 incgraphic gfx/herodown1.png
 incgraphic gfx/herodown2.png
 incgraphic gfx/heroleft1.png
 incgraphic gfx/heroleft2.png
 incgraphic gfx/heroup1.png
 incgraphic gfx/heroup2.png
 incgraphic gfx/heroright1.png
 incgraphic gfx/heroright2.png

 rem **set the palette we'll use for 320A text...
 P0C2=$0F

 rem **set the palette we'll use for hero sprite...
 P1C1=$00
 P1C2=$96
 P1C3=$3b

 rem **set the palette we'll use for the background...
 P2C1=$12
 P2C2=$F6
 P2C3=$FC


 rem **set the current character set...
 characterset text320a

 rem **set the letters represent each graphic character...
 alphachars '0123456789 abcdefghijklmnopqrstuvwxyz:'

 clearscreen
 plotchars 'location:' 0 0 0
 plotchars 'the boneyard' 0 60 0
 plotchars 'score:' 0 0 1
 plotchars 'lives:' 0 80 1

 plotmap screen1leftmap  2 0  2 20 10
 plotmap screen1rightmap 2 80 2 20 10

 savescreen

 xpos=80
 ypos=32

main 


 gosub processjoystick

 restorescreen
 plotvalue text320a 0 score0 5 32 1
 plotvalue text320a 0 lives  2 112 1
 plotsprite herodown1 1 xpos ypos heroanimframe

 drawscreen 

 goto main 

topscreenroutine
 rem ** topscreenroutine is called by the display interrupt every frame, 
 rem ** normally at the top of the screen. In this case we've used 
 rem ** "adjustvisible" so it will be called a few zones below the screen
 rem ** top.
 WSYNC=1 ; wait for the end of the scanline
 displaymode 160A
 WSYNC=1 ; wait for the end of the scanline
 BACKGRND=$26
 return

bottomscreenroutine
 rem ** we go to 320A after the screen is completely drawn. That way the
 rem ** the next frame
 WSYNC=1 ; wait for the end of the scanline
 displaymode 320A
 WSYNC=1 ; wait for the end of the scanline
 BACKGRND=$00
 return

processjoystick
    rem ** We move our hero in only the cardinal directions.
    rem ** "heroanimframe" will be used with plotsprite to display
    rem ** a sprite pointing in one of the cardinal directions.

    if joy0down  then ypos=ypos+1:heroanimframe=0:goto doneherowalk
    if joy0up    then ypos=ypos-1:heroanimframe=4:goto doneherowalk
    if joy0left  then xpos=xpos-1:heroanimframe=2:goto doneherowalk
    if joy0right then xpos=xpos+1:heroanimframe=6:goto doneherowalk
    return
doneherowalk

    walkframe=walkframe+1

    rem *** We need to modify "heroanimframe" to make the guy move
    rem *** his feet (by alternating adding 0 or 1 to the frame)
    heroanimframe=heroanimframe+((walkframe/16)&1)
    return

    rem ** Our screen data follows. The screen is 40 characters 
    rem ** wide. Because Maria only accepts objects up to 32 bytes
    rem ** wide, we break the screen up into 2x 20 byte parts...

    alphachars ' abcdefghijklmnopqrstuvwxyz'

    alphadata screen1leftmap tileset_blanks
    'ijhijhijhijhijhijhij'
    'hij                 '
    'jhij                '
    'hij                 '
    'jhij                '
    'hij                 '
    'jhij                '
    'hij                 '
    'jhij                '
    'ijhijhijhijhijhijhij'
end

    alphadata screen1rightmap tileset_blanks
    'hijhijhijhijhijhijhi'
    '                hijh'
    '                 hij'
    '                hijh'
    '                 hij'
    '                hijh'
    '                 hij'
    '                hijh'
    '                 hij'
    'hijhijhijhijhijhijhi'
end

