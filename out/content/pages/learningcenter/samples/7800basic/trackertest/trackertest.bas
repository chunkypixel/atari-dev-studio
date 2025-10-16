 rem ** TIA Tracker Test

 rem ** I've included the salvo theme in here for educational purposes only.
 rem ** Do NOT use the salvo theme in your own music, under penalty of 
 rem ** castration.
 rem **
 rem ** Feel free to use the other samples, provided here under a public domain
 rem ** castration-free license.

 displaymode 320A

 set trackersupport basic
 set plotvalueonscreen on

 rem ** A3 is ideal Atari key. Write all of your music around this key.

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

 dim songindex=a
 dim movedebounce=b
 dim firedebounce=c

 clearscreen
 plotchars 'TIA Tracker Test' 0 0 0
 
 plotchars 'press up and down to select song'  0 0 2
 plotchars 'press fire to play'  0 0 3
 plotchars 'song name'  0 0 5
 savescreen

main
 if !joy0any then movedebounce=0
 if movedebounce>0 then movedebounce=movedebounce-1:goto skipupdown
 if joy0up && songindex>0 then songindex=songindex-1:movedebounce=30
 if joy0down && songindex<2 then songindex=songindex+1:movedebounce=30
 gosub displaysong
skipupdown
 if !joy0fire then firedebounce=0
 if firedebounce>0 then firedebounce=firedebounce-1:goto skipsongpick
 if joy0fire then gosub songselect:firedebounce=60
skipsongpick

 drawscreen
 goto main 

displaysong
 restorescreen
 if songindex=0 then plotchars 'funeral match'  0 80 5
 if songindex=1 then plotchars 'o tannenbaum'  0 80 5
 if songindex=2 then plotchars 'salvo theme'  0 80 5
 return

songselect
 restorescreen
 if songindex=0 then playsong funeralmarch 120
 if songindex=1 then playsong tannenbaum 64
 if songindex=2 then playsong salvotheme 130
 return

  data tiatrill
  $10,$18,$01 ; version, priority, frames per chunk
  $00,$0a ; note offset, Volume
  $0c,$0a
  $00,$0a
  $0c,$0a
  $00,$0a
  $0c,$0a
  $00,$08
  $0c,$08
  $00,$04
  $0c,$04
  $00,$00
end

 data tiashort
  $10,$00,$00 ; version, priority, frames per chunk
  $00,$06 ; note offset, Volume
  $00,$04 ; note offset, Volume
  $00,$00
end

 data tiaplain
  $10,$00,$00 ; version, priority, frames per chunk
  $00,$08 ; note offset, Volume
  $00,$08
  $00,$06
  $00,$04
  $00,$00
end

 data tiamedium
  $10,$03,$03 ; version, priority, frames per chunk
  $00,$08 ; note offset, Volume
  $00,$08
  $00,$06
  $00,$04
  $00,$00
end


 data tialong
  $10,$00,$05 ; version, priority, frames per chunk
  $00,$08 ; note offset, Volume
  $00,$08
  $00,$06
  $00,$04
  $00,$00
end

 data tiabass
  $10,$00,$02 ; version, priority, frames per chunk
  $00,$06 ; note offset, Volume
  $00,$04 ; note offset, Volume
  $00,$04 ; note offset, Volume
  $00,$00
end

 songdata salvotheme
main1 k=c11
  ;deadair
  slowbassline.2
  plaindrumline.2
  stockdrumline.8
  stockdrumline.8
  amendrumline.2
  drumfill
  deadair.2
  plaindrumline.4
  amendrumline.2

main2
  i=tiabass
  k=a1
  bassintro.7
  bassintro2
  k=a3
  i=tiashort
  fastarp.4
  deadair.5
  k=a4
  i=tiaplain
  verse2b.2

main3 k=a3
  deadair.2
  i=tiaplain
  verse1a.2
  verse1b
  i=tiatrill
  chorus1.2
  deadair
  i=tialong
  verse2a.2

fastarp
  fast.4
  k+7
  fast.4
  k-3
  fast.4
  k-4
  fast.4

fast
  ; a major key arp would go C E G, but E brings in many off-key notes
  r8 c8 g8 > c8 <

bassintro
 c4 c8 c8 d4 c4

bassintro2
 c4 r4 r2

deadair
  r1 r1 r1 r1

verse1a
  g4 a8 g8 g4 g4 r2 g2     f4 f8 g8 f4 f4 r2 f2
  e4 f8 e8 e4 e4 r2 e2     d4 e8 d8 d4 d4 e2 c2

verse1b
  ;     +3              +1          +1    +1
  d2 d2 c2 r1 c2    g4 f4 e4 d4   d2 d2 c2 r2  r1 r1
  d2 d2 c2 r1 c2    g4 f4 e4 d4   d2 d2 c2 r2  d4 d4 c2 d2 c2

verse2a
  g2 g2   r2 a2   g2 r2   g4 a4 g4 r4
  e2 e2   r2 f2   e2 r2   e4 f4 e4 r4
  d2 d2   r2 e2   f2 r2   e2 d2
  c2 c2   r2 d2   c2 r2   r1
verse2b
  acaarp.4
  k+7
  acaarp.4
  k+2
  acaarp.4
  k-9
  acaarp.4

acaarp
  r4 c4 r4 d4

chorus1
  c1 r4 c2 c4 g1 r2 e2     f4 e2 d2 c2 r4   f4 e2 d4   r4 e2 r4

slowbassline
  '0...............................'

plaindrumline
  '0.......5.......0.......5.......'

stockdrumline
   '0.....0.5.....0.0...0.0.5.......'

amendrumline
  '6.4.6.4.3.4.5.3.5.3.6.0.5.4.5.3.'
  '6.4.6.4.3.4.5.3.5.3.6.0.5.4.5.3.'
  '6.4.6.4.3.4.5.3.5.3.6.4.5.4.7...'
  '5.3.6.0.3...5.3.5.3.6...5.3.7.0.'

drumfill
  '0.......5.......0.......5.......'
  '0...0...0...0...5.5.5...5...5.5.'
end

  songdata funeralmarch
main1
  k=a3
  i=tiamedium
  c2 c8 r4 c8 c2   d#8 r4 d8 d8  r4 c8 c8 r8 < b4 > c2 
end


  songdata tannenbaum
main1
  k=a3
  i=tiamedium
  verse1a

main2
  k=a3
  i=tiamedium
  verse1balt

verse1a
       ;  oh       christmas tree oh            christmas tree   how     lovely  are your       bra-nches
          c4       f8 f8 f4       g4            a8 a8 a8       r8 a4     g8 a8   b4   e4         g4 f4

       ;  oh       christmas tree oh            christmas tree   how     lovely  are your       bra-nches
          c4       f8 f8 f4       g4            a8 a8 a8       r8 a4     g8 a8   b4   e4         g4 f4

       ;  So       faithful green through       out the year     in      summer and   when     winters here
        > c4       c8 < a8 > d8 r8 c8           c8 < b8 b8     r8 b4     b8 g8 > c8 < r8 b8     b8 a8   a4

       ;  oh       christmas tree oh            christmas tree   how     lovely  are your       bra-nches
          c4       f8 f8 f4       g4            a8 a8 a8       r8 a4     g8 a8    b4   e4        g4 f4

verse1b
       ;    oh       christmas tree oh            christmas tree     how        lovely     are your      bra-nches
          > c4 <       a8 a8 a4     b4            > c8 c8 c8         r8 c4 <     b8 > c8 <  d4  > c4 <    b4 a4
       ;    oh       christmas tree oh            christmas tree     how        lovely     are your      bra-nches
          > c4 <       a8 a8 a4     b4            > c8 c8 c8         r8 c4 <     b8 > c8 <  d4  > c4 <    b4 a4

       ;  So         faithful green through        out the year     in        summer and   when     winters here
          r4         r8 r8 r8 r8    r8             r8 r8 r8         r8 g4     g8 e8  a8   r8 g8     g8 f8   f4

       ;  oh        christmas tree oh              christmas tree   how        lovely     are your       bra-nches
         > c4 <     a8 a8 a4       b4              > c8 c8 c8       r8 c4 <     b8 > c8 <  d4  > c4 <    b4 a4

verse1balt
       ;    oh       christmas tree oh            christmas tree     how        lovely     are your      bra-nches
          > c4 <       a8 a8 a4     r4            > c8 c8 c8         r8 r4 <     r8 > r8 <  r4  > r4 <    r4 r4
       ;    oh       christmas tree oh            christmas tree     how        lovely     are your      bra-nches
          > c4 <       a8 a8 a4     r4            > c8 c8 c8         r8 r4 <     r8 > r8 <  r4  > r4 <    r4 r4

       ;  So         faithful green through        out the year     in        summer and   when     winters here
          r4         r8 r8 r8 r8    r8             r8 r8 r8         r8 g4     g8 e8  a8   r8 g8     g8 f8   f4
       ;  oh        christmas tree oh              christmas tree   how        lovely     are your       bra-nches
         > c4 <     a8 a8 a4       r4              > c8 c8 c8       r8 c4 <     r8 > r8 <  r4  > r4 <    b4 a4
end

