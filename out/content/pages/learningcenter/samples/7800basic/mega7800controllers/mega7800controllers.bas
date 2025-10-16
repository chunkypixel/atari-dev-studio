 displaymode 320A

 rem ** Sample code for reading from mega7800 adapters.
 rem ** This code uses mega7800 specific commands. 
 rem ** It's recommended to use the general multibutton
 rem ** functionality instead. See the multibutton
 rem ** sample for more details.

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

 changecontrol 0 mega7800

 BACKGRND=0

 clearscreen
 plotchars 'MEGA7800 TEST' 0 0 0

  plotchars 'mega_up'     0 0 6 
  plotchars 'mega_down '  0 0 7
  plotchars 'mega_left '  0 0 8
  plotchars 'mega_right'  0 0 9
  plotchars 'mega_A'      0 60 6
  plotchars 'mega_B'      0 60 7
  plotchars 'mega_C'      0 60 8
  plotchars 'mega_M'      0 60 9
  plotchars 'mega_X'      0 104 6
  plotchars 'mega_Y'      0 104 7
  plotchars 'mega_Z'      0 104 8
  plotchars 'mega_start'  0 104 9

 plotchars 'Debug Info...' 0 0 12
 plotchars 'SWCHA'         0 0 16
 plotchars  bitstring     0 0 17 16
 savescreen

main
 restorescreen

 plotvalue ascii_full 0 SWCHA 2 80 16

  if joy0up     then plotchars '*' 1 44 6
  if joy0down   then plotchars '*' 1 44 7
  if joy0left   then plotchars '*' 1 44 8
  if joy0right  then plotchars '*' 1 44 9

  if mega0A      then plotchars '*' 1 88  6
  if mega0B      then plotchars '*' 1 88  7
  if mega0C      then plotchars '*' 1 88  8
  if mega0mode   then plotchars '*' 1 88  9

  if mega0X      then plotchars '*' 1 154 6
  if mega0Y      then plotchars '*' 1 154 7
  if mega0Z      then plotchars '*' 1 154 8
  if mega0start  then plotchars '*' 1 154 9

 asm
 ; some code to covert the mega data to binary strings...
 lda mega7800data0
 sta temp2
 lda mega7800state0
 sta temp3
 ldy #15
 lda #0
ClearBitsLoop
 sta bitstring,y
 dey
 bpl ClearBitsLoop
 ldx #7
BitsReadLoop
 ror temp2
 rol [bitstring+8],x
 ror temp3
 rol bitstring,x
 dex 
 bpl BitsReadLoop
end
  drawscreen
 goto main
