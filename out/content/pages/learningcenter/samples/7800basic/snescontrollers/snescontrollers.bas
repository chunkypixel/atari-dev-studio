 displaymode 320A

 rem ** auto-detect if snes controllers are plugged-in.
 rem ** this can go anywhere, but there's a couple things to keep in mind:
 rem **
 rem ** 1. ports that didn't have snes controllers will be set to default 
 rem ** controllers. (2 button joystick)
 rem ** 2. auto-detecting in a main game loop isn't recommended - there's
 rem ** a possibility some input may be missed, depending on the relative
 rem ** timing for the frame and when you check your controller state.

 displaymode 320A
 BACKGRND=$0
 set zoneheight 8
 incgraphic ascii_full.png 320A 0 1
 characterset ascii_full
 alphachars ASCII
 P0C2=$0F
 P1C2=$1F
 P2C2=$9F

 dim bitstring=d

 clearscreen
 plotchars 'SNES2ATARI TEST' 0 0 0

  plotchars 'snes_up'     0 0 6 
  plotchars 'snes_down '  0 0 7
  plotchars 'snes_left '  0 0 8
  plotchars 'snes_right'  0 0 9
  plotchars 'snes_A'      0 60 6
  plotchars 'snes_B'      0 60 7
  plotchars 'snes_X'      0 60 8
  plotchars 'snes_Y'      0 60 9
  plotchars 'snes_lsh'    0 104 6
  plotchars 'snes_rsh'    0 104 7
  plotchars 'snes_select' 0 104 8
  plotchars 'snes_start'  0 104 9

 plotchars 'Debug Info...' 0 0 12
 plotchars 'snesport'      0 0 13
 plotchars 'snesdetected0' 0 0 14
 plotchars 'snesdetected1' 0 0 15
 plotchars 'SWCHA'         0 0 16
 plotchars bitstring     0 0 17 16
 savescreen

main
 rem ** snes autoscan. It's recommended to only do this once, or duing a
 rem ** title screen loop, as the scan will temporarily disrupt the ports.
 temp1=framecounter&63
 if temp1>0 then skipsnesdetect
 rem ** only rescan if there are no snes controllers presently connected...
 if port0control = 11 && snesdetected0 <> 0 then skipsnesdetect
 if port1control = 11 && snesdetected1 <> 0 then skipsnesdetect
 snesdetect
skipsnesdetect
 restorescreen

 plotvalue ascii_full 0 snesport 2 80 13
 plotvalue ascii_full 0 snesdetected0 2 80 14
 plotvalue ascii_full 0 snesdetected1 2 80 15
 plotvalue ascii_full 0 SWCHA 2 80 16

  if snesdetected0 then plotchars 'snes0 detected' 0 0 2 else plotchars 'snes0 not detected' 0 0 2
  if snesdetected1 then plotchars 'snes1 detected' 0 0 3 else plotchars 'snes1 not detected' 0 0 3

  asm
  ldx snesport
  lda snes2atari0lo,x
  ora snes2atari0hi,x
  bne dosnestexts
  jmp .skipsnestext
dosnestexts
end
  if port0control <> 11 && port1control<>11 then goto skipsnestext

  if snes#up     then plotchars '*' 1 44 6
  if snes#down   then plotchars '*' 1 44 7
  if snes#left   then plotchars '*' 1 44 8
  if snes#right  then plotchars '*' 1 44 9

  if snes#A      then plotchars '*' 1 88  6
  if snes#B      then plotchars '*' 1 88  7
  if snes#X      then plotchars '*' 1 88  8
  if snes#Y      then plotchars '*' 1 88  9

  if snes#lsh    then plotchars '*' 1 154 6
  if snes#rsh    then plotchars '*' 1 154 7
  if snes#select then plotchars '*' 1 154 8
  if snes#start  then plotchars '*' 1 154 9

skipsnestext

 asm
 ; some code to covert the snes data to binary strings...
 lda snesport
 bne decodeport1
 ldy #15
 lda #0
ClearBitsLoop
 sta bitstring,y
 dey
 bpl ClearBitsLoop
 ldx #7
BitsReadLoop
 ror snes2atari0lo
 rol [bitstring+8],x
 ror snes2atari0hi
 rol bitstring,x
 dex 
 bpl BitsReadLoop
 jmp .leavehere
decodeport1
 ldy #15
 lda #0
ClearBitsLoop2
 sta bitstring,y
 dey
 bpl ClearBitsLoop2
 ldx #7
BitsReadLoop2
 ror snes2atari1lo
 rol [bitstring+8],x
 ror snes2atari1hi
 rol bitstring,x
 dex 
 bpl BitsReadLoop2
end
leavehere
  drawscreen
 goto main
