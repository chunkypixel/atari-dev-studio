
 displaymode 320A

 rem **background color...
 BACKGRND=$0

 rem **set the height of characters and sprites...
 set zoneheight 8

 rem **import the characterset png...
 incgraphic atascii.png 320A 

 rem **set color of 320A text palette 0...
 P0C2=$0F

 rem **set the current character set...
 characterset atascii

 rem **set the letters represent each graphic character...
 alphachars ASCII

 clearscreen
 plotchars 'Hello World!' 0 0 0
 plotchars 'It`s great to be alive.' 0 0 1 
 plotchars '12345678901234567890123456789012' 0 0 4

main 
 drawscreen
 goto main 

