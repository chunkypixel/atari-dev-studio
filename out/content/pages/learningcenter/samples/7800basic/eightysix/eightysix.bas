
  rem ** 86 sprites with background and double-buffered display. This routine 
  rem ** and 7800basic can handle more, but Maria runs out of DMA time when 
  rem ** too many of the sprites drift into the same zone. As it stands, this 
  rem ** demo intentionally spreads the sprites out vertically, to help Maria
  rem ** out. Think of this demo as an upper-bound for regular sprite 
  rem ** plotting with a background banner.
  rem **
  rem ** Advanced content warning...
  rem **
  rem ** 1. This demo uses some inline assembly for the text scroller.
  rem ** 2. This demo uses the PLOTSPRITE4VP assembly macro, not plotsprite.

  rem ** Make the rom a 128k cart with ram, because we want extra RAM
  set romsize 128kRAM
  set 7800header 'name Eighty-Six Sprites'

  set pokeysupport $450
  set trackersupport rmt

  set zoneheight 16
  set screenheight 208

  rem ** setup some cart ram as display list memory
  set dlmemory $4000 $67ff
  dim RMTRAM=$6800

  rem ** memory that holds our scrolling text, so we can update it
  rem ** one character at a time.
  dim scrollerram=$6900
  dim scrollerram2=$6900+20

  characterset atascii
  alphachars ASCII

  dim frame=a
  dim tempplayerx=b
  dim tempplayery=c
  dim tempplayercolor=d
  dim tempplayerdx=e
  dim tempplayerdy=f
  dim tempanim=g

  dim textpointlo=h
  dim textpointhi=i

  dim textfinescroll=j
  dim texttock=k

  dim palette=q

  rem ** variable arrays for holding sprite info
  dim playerx=$2200
  dim playery=$2300
  dim playerdx=$2400
  dim playerdy=$2500

  rem ** include graphics
  incgraphic gfx/atascii.png 320A
  rem incgraphic gfx/ball.png
  incgraphic gfx/ring1.png
  incgraphic gfx/ring2.png
  incgraphic gfx/ring3.png
  incgraphic gfx/ring4.png
  goto rundemo

  rem ** import our RMT song
  incrmtfile enigmapt2.rmta

  bank 8

  rem ** The golum banner takes up the whole bank, except for the dma holes.
  rem ** Any code needs to go into DMA holes, and "noflow" just tells 7800basic
  rem ** to avoid adding extra assembly code prior to the dma hole. (since
  rem ** we don't have any spare rom for it)
  dmahole 0 noflow

  incbanner gfx/golum.png

rundemo

  BACKGRND=$00

  rem ** Initialize the position and velocity of all of the ring objects.
  rem ** We setup more rings than the demo requires, for future experiments. :)
  x=10: y=8
  for z=0 to 100
    playerx[z]=x
    playery[z]=y
    y=y+17
    x=rand
    if y>191 then y=y-191
    if x>149 then x=x-149
    playerdx[z]=(rand&2)-1
    playerdy[z]=(rand&2)-1
  next

  rem ** draw the screen background
  clearscreen
  drawscreen

  doublebuffer on

  alphadata scrollertext atascii
  ' ***  Welcome to the 7800basic 86 Sprite Demo, '
  'featuring music by Radek "Raster" Sterba  ***  '
  '        '
  '"One precious, two precious, three... so many preciousssses '
  'everywhere!!!", Gollum shouted, staring at the screen in disbelief!   '
  '"Howsits doing that?!?" he said, brow furrowed. Reaching out, he grabbed '
  'the 7800 console, yanking it from its cables, clutching it to his chest. '
  'And without another sound, Gollum sank into the depths of the dark misty '
  'woods.  ***  '
  '        '
  'Listen. It's calling. The 7800 is whispering in your ear, reaching inside '
  'you, and burrowing deep down into your soul. Won't you answer your '
  'precioussss?'
  '                                              '
  '@'
end

  asm
  lda #<scrollertext
  sta textpointlo
  lda #>scrollertext
  sta textpointhi
end

  memset scrollerram 32 42 ; 32 is the ascii space character

  rem ** the scroller is 41 characters wide. Each character object can only
  rem ** be 32 bytes wide, so we split the scroller into 2 character objects.
  plotchars scrollerram  5 0  0 20
  plotchars scrollerram2 5 80 0 21

  plotbanner golum 4 0 16

  rem ** It's important buffering is active before the savescreen.
  rem ** Otherwise savescreen won't copy the saved screen into both buffers.
  savescreen

  drawscreen

  rem ** Ring colors
  P0C1=$A2: P0C2=$A9: P0C3=$Ae ; blue
  P1C1=$06: P1C2=$0c: P1C3=$0f ; white
  P2C1=$22: P2C2=$26: P2C3=$2c ; gold
  P3C1=$42: P3C2=$44: P3C3=$49 ; red

  rem ** Gollum's colors
  P4C1=$c4: P4C2=$f8: P4C3=$0A

  rem ** start the music!
  playrmt enigmapt2

main

  asm
  ; This bit of assembly code is a hack. The song wasn't designed to
  ; repeat, so we observe some memory that gets set to $10 at the end
  ; of the song. This isn't universal... some day I'll put in the 
  ; effort to see if there's a universal way to detect if a non-repeating
  ; song is complete.
  ldx #3
checktrackmarker  
  lda $680C,x
  cmp #$10
  bne .skipresetsong
  dex
  bpl checktrackmarker
end
  playrmt enigmapt2
skipresetsong

  tempanim=(framecounter/4)&3

 rem ** Without double-buffering, the 7800 works best if we split up the
 rem ** game logic from the plot commands. This isn't needed when double 
 rem ** buffering is used.

 restorescreen

 palette=0

 rem ** update each ring position, and perform border bounces...
 for z=0 to 85
     tempplayerx=playerx[z]+playerdx[z]
     tempplayery=playery[z]+playerdy[z]
     if tempplayerx<1 then playerdx[z]=1:goto skipx 
     if tempplayerx>149 then playerdx[z]=-1
skipx
     if tempplayery<8 then playerdy[z]=1:goto skipy
     if tempplayery>193 then playerdy[z]=-1
skipy
     playerx[z]=tempplayerx
     playery[z]=tempplayery

     palette=(palette+32)&127 ; PLOTSPRITE needs palette index *32
     tempanim=(tempanim+1)&3 ; un-sync all of the ring animations

     PLOTSPRITE4 ring1 palette tempplayerx tempplayery tempanim 

 next

 doublebuffer flip
 goto main

  rem ** 320A mode at the top of the screen for text, and color it line-by-line
topscreenroutine
  displaymode 320A
  WSYNC=0
  P5C2=$45
  WSYNC=0
  P5C2=$46
  WSYNC=0
  P5C2=$47
  WSYNC=0
  P5C2=$48
  WSYNC=0
  P5C2=$48
  WSYNC=0
  P5C2=$47
  WSYNC=0
  P5C2=$46
  WSYNC=0
  P5C2=$45
  WSYNC=0
  WSYNC=0
  displaymode 160A
  asm

  ; slow down the text scroller by 50%
  inc texttock
  lda texttock
  and #1
  bne skipscroller 

  ; The text scroller moves the text pixel by pixel.
  ; More specifically, 3 out of 4 frames its just moving the X coordinate of
  ; the character objects 1 pixel to the left. (fine scroll)
  ; On the 4th frame it moves the X coordinate of the character objects back to
  ; the starting position on the right, and advances the text buffer by 1 
  ; character. (coarse scroll)

  inc textfinescroll
  lda textfinescroll
  and #3
  sta textfinescroll
  tay
  lda offset2,y      ; get the X coordinate value for the first char object
  sta ZONE0ADDRESS+9 ; and store it the object's X coordinate byte.
  sta ZONE0ADDRESS+9+DOUBLEBUFFEROFFSET ; (in both screen buffers)
  lda offset1,y      ; get the X coordinate value for the second char object
  sta ZONE0ADDRESS+4 ; and store it the object's X coordinate byte.
  sta ZONE0ADDRESS+4+DOUBLEBUFFEROFFSET ; (in both screen buffers)
  bne skipscroller
readnextchar
  inc textpointlo
  bne skiptextpointhiinc
  inc textpointhi
skiptextpointhiinc
  ldy #0
  lda (textpointlo),y
  cmp #64 ; '@' is the end-of-text marker
  bne skipscrollerreset
scrollerreset
  lda #<scrollertext
  sta textpointlo
  lda #>scrollertext
  sta textpointhi
  lda (textpointlo),y
skipscrollerreset
  sta scrollerram+41 ; update the last character in the buffer
  ldx #0
shiftcharactersloop
  lda scrollerram+1,x
  sta scrollerram,x
  inx
  cpx #41
  bne shiftcharactersloop
skipscroller
end
  return

 asm
offset1
  .byte 0,255,254,253
offset2
  .byte 80,79,78,77
end
