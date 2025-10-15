
 rem ** Keypad reading sample program. Works with a keypad in the first port.

 displaymode 320A

 changecontrol 0 keypad
 changecontrol 1 keypad

 set tv ntsc

 rem      column bits:  b3 b2 b1 b0
 dim temploop=d
 dim cursorx=x
 dim cursory=y

 rem **background color...
 BACKGRND=$0

 rem **set the height of characters and sprites...
 set zoneheight 8

 rem **import the characterset png...
 incgraphic atascii_full.png 320A 1 0 
 incgraphic cursor.png 320A

 rem **set color of 320A text palette 0...
 P0C2=$0F
 P1C2=$89
 P2C2=$2a

 rem **set the current character set...
 characterset atascii_full

 rem **set the letters represent each graphic character...
 alphachars ASCII

 clearscreen
 plotchars 'Atari 7800 Keypad Test' 0 36 0
 rem        12345678901234567890123456789012
 plotchars '1   2   3              1   2   3' 1 16 5 
 plotchars '4   5   6              4   5   6' 1 16 9
 plotchars '7   8   9              7   8   9' 1 16 13
 plotchars '*   0   #              *   0   #' 1 16 17
 savescreen
main
 restorescreen

 rem ** the keypad key rows are encoded in the variables keypadmatrix0,1,2,3
 rem ** if you want to efficiently test the relative positions of pressed keys,
 rem ** it would be better to scan through the keypadmatrix# variables, test 
 rem ** bits, and figure out some sort of index of the key pressed.
 rem **
 rem ** We use the "if keypad#key#..." format because it's the typical keyboard
 rem ** usage, and this is a demo.

 rem keypad0...
   rem row 1...
   if keypad0key1 then cursorx=16:cursory=40:gosub plotthecursor
   if keypad0key4 then cursorx=16:cursory=72:gosub plotthecursor
   if keypad0key7 then cursorx=16:cursory=104:gosub plotthecursor
   if keypad0keys then cursorx=16:cursory=136:gosub plotthecursor

   rem row 2...
   if keypad0key2 then cursorx=32:cursory=40:gosub plotthecursor
   if keypad0key5 then cursorx=32:cursory=72:gosub plotthecursor
   if keypad0key8 then cursorx=32:cursory=104:gosub plotthecursor
   if keypad0key0 then cursorx=32:cursory=136:gosub plotthecursor

   rem row 3...
   if keypad0key3 then cursorx=48:cursory=40:gosub plotthecursor
   if keypad0key6 then cursorx=48:cursory=72:gosub plotthecursor
   if keypad0key9 then cursorx=48:cursory=104:gosub plotthecursor
   if keypad0keyh then cursorx=48:cursory=136:gosub plotthecursor

 rem keypad1...
   rem row 1...
   if keypad1key1 then cursorx=108:cursory=40:gosub plotthecursor
   if keypad1key4 then cursorx=108:cursory=72:gosub plotthecursor
   if keypad1key7 then cursorx=108:cursory=104:gosub plotthecursor
   if keypad1keys then cursorx=108:cursory=136:gosub plotthecursor

   rem row 2...
   if keypad1key2 then cursorx=124:cursory=40:gosub plotthecursor
   if keypad1key5 then cursorx=124:cursory=72:gosub plotthecursor
   if keypad1key8 then cursorx=124:cursory=104:gosub plotthecursor
   if keypad1key0 then cursorx=124:cursory=136:gosub plotthecursor

   rem row 3...
   if keypad1key3 then cursorx=140:cursory=40:gosub plotthecursor
   if keypad1key6 then cursorx=140:cursory=72:gosub plotthecursor
   if keypad1key9 then cursorx=140:cursory=104:gosub plotthecursor
   if keypad1keyh then cursorx=140:cursory=136:gosub plotthecursor


 drawscreen
 goto main 

plotthecursor
   plotsprite cursor 2 cursorx cursory
   return
