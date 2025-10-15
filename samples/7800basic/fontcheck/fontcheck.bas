 set screenheight 224

 rem *** use a zoneheight appropriate for your font. Extra sample text will
 rem *** be displayed when you use zoneheight=8.
 ;set zoneheight 16 
 set zoneheight 8 

 dim screendata=$2200
 dim sampletextmem=screendata+320
 dim fontsize=a
 displaymode 320A

 BACKGRND=$00
 P0C2=$0F

 alphachars ASCII
 characterset atascii
 incgraphic atascii.png 320A 1 0

 fontsize=0 ; # of characters in font. use 0 for 256

 plotmap screendata  0 0   0 20 28  0 0 40 
 plotmap screendata  0 80  0 20 28 20 0 40

 memset screendata 32 960
 memcpy screendata titletext 40
 memcpy sampletextmem sampletext 960

 for y=1 to 7
     for x=0 to 39
         pokechar screendata x y 40 24 r
         r=r+1
         if r=fontsize then goto donepoking
     next
 next
donepoking


main 
 drawscreen
 goto main

; 1234567890123456789012345678901234567890
 alphadata sampletext atascii
 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, '
 'sed do eiusmod tempor incididunt ut labore et dolore magna '
 'aliqua. Ut enim ad minim veniam, quis nostrud exercitation '
 'ullamco laboris nisi ut aliquip ex ea commodo consequat. '
 'Duis aute irure dolor in reprehenderit in voluptate velit '
 'esse cillum dolore eu fugiat nulla pariatur. Excepteur sint '
 'occaecat cupidatat non proident, sunt in culpa qui officia '
 'deserunt mollit anim id est laborum. Sed ut perspiciatis '
 'unde omnis iste natus error sit voluptatem accusantium '
 'doloremque laudantium, totam rem aperiam, eaque ipsa quae '
 'ab illo inventore veritatis et quasi architecto beatae '
 'vitae dicta sunt explicabo. Nemo enim ipsam voluptatem '
 'quia voluptas sit aspernatur aut odit aut fugit, sed quia '
 'consequuntur magni dolores eos qui ratione voluptatem '
 'sequi nesciunt. Neque porro quisquam est, qui dolorem '
 'ipsum quia dolor sit amet, consectetur, adipisci velit, '
 'sed quia non numquam eius modi tempora incidunt ut labore '
 'et dolore magnam aliquam quaerat voluptatem. Ut enim ad '
 'minima veniam, quis nostrum exercitationem ullam corporis '
 'suscipit laboriosam, nisi ut aliquid ex ea commodi '
 'consequatur? Quis autem vel eum iure reprehenderit qui in '
 'ea voluptate velit esse quam nihil molestiae consequatur, '
 'vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?'
end

; 1234567890123456789012345678901234567890
 alphadata titletext atascii
 'Font Check...                           '
end
