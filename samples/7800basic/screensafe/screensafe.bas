 displaymode 320A
 set screenheight 224

 set tv ntsc

 rem **background color...
 BACKGRND=$0

 rem **set the height of characters and sprites...
 set zoneheight 8

 rem **import the characterset png...
 incgraphic gfx/ascii_full2.png 320A 

 rem **set color of 320A text palette 0...
 P0C2=$0F ; white
 P1C2=$44 ; red
 P2C2=$1a ; yellow
 P3C2=$94 ; blue

 rem **set the current character set...
 rem characterset ascii
 rem characterset asciidma
 characterset ascii_full2
 rem characterset atascii_full

 rem **set the letters represent each graphic character...
 alphachars ASCII

 dim magicnum=a
 

 alphachars ASCII
	displaymode 320A
	clearscreen

	rem ** RED DANGER
	plotchars blanks 1 00 0   20
	plotchars blanks 1 80 0   20
	plotchars blanks 1 00 27  20
	plotchars blanks 1 80 27  20

	plotchars blanks 2 00 1   20
	plotchars blanks 2 80 1   20
	plotchars blanks 2 00 26  20
	plotchars blanks 2 80 26  20

	plotchars blanks 3 00 2   20
	plotchars blanks 3 80 2   20
	plotchars blanks 3 00 25  20
	plotchars blanks 3 80 25  20


 for t=3 to 24
	plotchars blanks 3 00  t   1
	plotchars blanks 3 156 t   1
 next

        plotchars 'Danger Zone' 0 44  8
        plotchars 'Some TVs cut this off.' 0 44  9

        plotchars 'Action Safe' 0 44  12
        plotchars 'Most TVs display this.' 0 44  13

        plotchars 'Title Safe' 0 44  16
        plotchars 'All TVs display this.' 0  44  17

	plotchars blanks 1 26 8   4
	plotchars blanks 1 26 9   4

	plotchars blanks 2 26 12  4
	plotchars blanks 2 26 13  4

	plotchars blanks 3 26 16  4
	plotchars blanks 3 26 17  4

        plotchars '00' 0 8  0
        plotchars '01' 0 8  1
        plotchars '02' 0 8  2
        plotchars '03' 0 8  3
        plotchars '04' 0 8  4
        plotchars '05' 0 8  5
        plotchars '06' 0 8  6
        plotchars '07' 0 8  7
        plotchars '08' 0 8  8
        plotchars '09' 0 8  9
        plotchars '10' 0 8 10
        plotchars '11' 0 8 11
        plotchars '12' 0 8 12
        plotchars '13' 0 8 13
        plotchars '14' 0 8 14
        plotchars '15' 0 8 15
        plotchars '16' 0 8 16
        plotchars '17' 0 8 17
        plotchars '18' 0 8 18
        plotchars '19' 0 8 19
        plotchars '20' 0 8 20
        plotchars '21' 0 8 21
        plotchars '22' 0 8 22
        plotchars '23' 0 8 23
        plotchars '24' 0 8 24
        plotchars '25' 0 8 25
        plotchars '26' 0 8 26
        plotchars '27' 0 8 27

        plotchars '008' 0 140  0
        plotchars '016' 0 140  1
        plotchars '024' 0 140  2
        plotchars '032' 0 140  3
        plotchars '040' 0 140  4
        plotchars '048' 0 140  5
        plotchars '056' 0 140  6
        plotchars '064' 0 140  7
        plotchars '072' 0 140  8
        plotchars '080' 0 140  9
        plotchars '088' 0 140 10
        plotchars '096' 0 140 11
        plotchars '104' 0 140 12
        plotchars '112' 0 140 13
        plotchars '120' 0 140 14
        plotchars '128' 0 140 15
        plotchars '136' 0 140 16
        plotchars '144' 0 140 17
        plotchars '152' 0 140 18
        plotchars '160' 0 140 19
        plotchars '168' 0 140 20
        plotchars '176' 0 140 21
        plotchars '184' 0 140 22
        plotchars '192' 0 140 23
        plotchars '200' 0 140 24
        plotchars '208' 0 140 25
        plotchars '216' 0 140 26
        plotchars '224' 0 140 27


        savescreen
main
  drawscreen
 goto main

 asm
blanks
 .byte 19, 19, 19, 19, 19, 19, 19, 19, 19, 19
 .byte 19, 19, 19, 19, 19, 19, 19, 19, 19, 19
end
