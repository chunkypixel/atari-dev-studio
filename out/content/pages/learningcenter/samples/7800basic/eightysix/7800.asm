SPACEOVERFLOW SET 0
 ifnconst SPACEOVERFLOWPASS
SPACEOVERFLOWPASS SET 0
 endif SPACEOVERFLOWPASS
game
.
 ;;line 1;; 

.L00 ;;line 2;;  rem ** 86 sprites with background and double-buffered display. This routine 

.L01 ;;line 3;;  rem ** and 7800basic can handle more, but Maria runs out of DMA time when 

.L02 ;;line 4;;  rem ** too many of the sprites drift into the same zone. As it stands, this 

.L03 ;;line 5;;  rem ** demo intentionally spreads the sprites out vertically, to help Maria

.L04 ;;line 6;;  rem ** out. Think of this demo as an upper-bound for regular sprite 

.L05 ;;line 7;;  rem ** plotting with a background banner.

.L06 ;;line 8;;  rem **

.L07 ;;line 9;;  rem ** Advanced content warning...

.L08 ;;line 10;;  rem **

.L09 ;;line 11;;  rem ** 1. This demo uses some inline assembly for the text scroller.

.L010 ;;line 12;;  rem ** 2. This demo uses the PLOTSPRITE4VP assembly macro, not plotsprite.

.
 ;;line 13;; 

.L011 ;;line 14;;  rem ** Make the rom a 128k cart with ram, because we want extra RAM

.L012 ;;line 15;;  set romsize 128kRAM

.L013 ;;line 16;;  set 7800header 'name^Eighty-Six^Sprites'

.
 ;;line 17;; 

.L014 ;;line 18;;  set pokeysupport $450

.L015 ;;line 19;;  set trackersupport rmt

.
 ;;line 20;; 

.L016 ;;line 21;;  set zoneheight 16

.L017 ;;line 22;;  set screenheight 208

.
 ;;line 23;; 

.L018 ;;line 24;;  rem ** setup some cart ram as display list memory

.L019 ;;line 25;;  set dlmemory $4000 $67ff

DLMEMSTART = $4000
DLMEMEND   = $67ff
.L020 ;;line 26;;  dim RMTRAM = $6800

.
 ;;line 27;; 

.L021 ;;line 28;;  rem ** memory that holds our scrolling text, so we can update it

.L022 ;;line 29;;  rem ** one character at a time.

.L023 ;;line 30;;  dim scrollerram = $6900

.L024 ;;line 31;;  dim scrollerram2 = $6900 + 20

.
 ;;line 32;; 

.L025 ;;line 33;;  characterset atascii

    lda #>atascii
    sta sCHARBASE

    sta CHARBASE
    lda #(atascii_mode | %01100000)
    sta charactermode

.L026 ;;line 34;;  alphachars ASCII

.
 ;;line 35;; 

.L027 ;;line 36;;  dim frame = a

.L028 ;;line 37;;  dim tempplayerx = b

.L029 ;;line 38;;  dim tempplayery = c

.L030 ;;line 39;;  dim tempplayercolor = d

.L031 ;;line 40;;  dim tempplayerdx = e

.L032 ;;line 41;;  dim tempplayerdy = f

.L033 ;;line 42;;  dim tempanim = g

.
 ;;line 43;; 

.L034 ;;line 44;;  dim textpointlo = h

.L035 ;;line 45;;  dim textpointhi = i

.
 ;;line 46;; 

.L036 ;;line 47;;  dim textfinescroll = j

.L037 ;;line 48;;  dim texttock = k

.
 ;;line 49;; 

.L038 ;;line 50;;  dim palette = q

.
 ;;line 51;; 

.L039 ;;line 52;;  rem ** variable arrays for holding sprite info

.L040 ;;line 53;;  dim playerx = $2200

.L041 ;;line 54;;  dim playery = $2300

.L042 ;;line 55;;  dim playerdx = $2400

.L043 ;;line 56;;  dim playerdy = $2500

.
 ;;line 57;; 

.L044 ;;line 58;;  rem ** include graphics

.L045 ;;line 59;;  incgraphic gfx/atascii.png 320A

.L046 ;;line 60;;  rem incgraphic gfx/ball.png

.L047 ;;line 61;;  incgraphic gfx/ring1.png

.L048 ;;line 62;;  incgraphic gfx/ring2.png

.L049 ;;line 63;;  incgraphic gfx/ring3.png

.L050 ;;line 64;;  incgraphic gfx/ring4.png

.L051 ;;line 65;;  goto rundemo

  jmp .rundemo

.
 ;;line 66;; 

.L052 ;;line 67;;  rem ** import our RMT song

.L053 ;;line 68;;  incrmtfile enigmapt2.rmta

enigmapt2
  include "enigmapt2.rmta"
.
 ;;line 69;; 

.L054 ;;line 70;;  bank 8

DMAHOLEEND0 SET .
 echo " ",[($A000 - .)]d , "bytes of ROM space left in the main area of bank 1."
 if ($A000 - .) < 0
SPACEOVERFLOW SET (SPACEOVERFLOW+1)
 endif
 if START_OF_ROM = . ; avoid dasm empty start-rom truncation.
     .byte 0
 endif
START_OF_ROM SET 0 ; scuttle so we always fail subsequent banks

 ORG $A000,0  ; *************

 RORG $A000 ; *************

atascii = $A000

atascii
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 000000000000000000000000000000000000000000000000000000
ring1 = $A07B

ring1
       HEX 0140
ring2 = $A07D

ring2
       HEX 0040
ring3 = $A07F

ring3
       HEX 0140
ring4 = $A081

ring4
       HEX 0150

 ORG $A100,0  ; *************

 RORG $A100 ; *************

;atascii
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 000000000000000000000000000000000000000000000000000000
;ring1
       HEX 0650
;ring2
       HEX 0180
;ring3
       HEX 0590
;ring4
       HEX 06a4

 ORG $A200,0  ; *************

 RORG $A200 ; *************

;atascii
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 000000000000000000000000000000000000000000000000000000
;ring1
       HEX 0890
;ring2
       HEX 0290
;ring3
       HEX 0620
;ring4
       HEX 1828

 ORG $A300,0  ; *************

 RORG $A300 ; *************

;atascii
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 000000000000000000000000000000000000000000000000000000
;ring1
       HEX 18a0
;ring2
       HEX 0290
;ring3
       HEX 0a24
;ring4
       HEX 2c1a

 ORG $A400,0  ; *************

 RORG $A400 ; *************

;atascii
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 000000000000000000000000000000000000000000000000000000
;ring1
       HEX 2024
;ring2
       HEX 0290
;ring3
       HEX 1808
;ring4
       HEX 700a

 ORG $A500,0  ; *************

 RORG $A500 ; *************

;atascii
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 000000000000000000000000000000000000000000000000000000
;ring1
       HEX 2024
;ring2
       HEX 0290
;ring3
       HEX 1808
;ring4
       HEX 7006

 ORG $A600,0  ; *************

 RORG $A600 ; *************

;atascii
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 000000000000000000000000000000000000000000000000000000
;ring1
       HEX 2024
;ring2
       HEX 0290
;ring3
       HEX 1808
;ring4
       HEX 7006

 ORG $A700,0  ; *************

 RORG $A700 ; *************

;atascii
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 000000000000000000000000000000000000000000000000000000
;ring1
       HEX 3024
;ring2
       HEX 0290
;ring3
       HEX 180c
;ring4
       HEX 7006

 ORG $A800,0  ; *************

 RORG $A800 ; *************

;atascii
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000000000000000000003080000000000000000000000000003000000000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 000000000000007c00003c00000000006006000000000000007800
;ring1
       HEX 3024
;ring2
       HEX 0290
;ring3
       HEX 180c
;ring4
       HEX 6006

 ORG $A900,0  ; *************

 RORG $A900 ; *************

;atascii
       HEX 000000000000000000000000000000003c7e7e3c0c3c3c303c38000000000000
       HEX 0018006618463b000e70000018f018403c7e7e3c0c3c3c303c38181806006018
       HEX 3e667c3c787e603e667e3c667e63663c6036663c187e186366187e1e067800ff
       HEX 003e7c3c3e3c1806663c06663c63663c6006607c0e3e1836660c7e
;ring1
       HEX 3024
;ring2
       HEX 02e0
;ring3
       HEX 180c
;ring4
       HEX 6006

 ORG $AA00,0  ; *************

 RORG $AA00 ; *************

;atascii
       HEX 00000000000000000000000000000000661830667e666630660c000000000000
       HEX 000000ff7c6666001c38661818801860661830667e666630660c18180c7e3000
       HEX 607e66666c6060666618666c60636e66606c6c0618663c77661860180c180000
       HEX 006666606660183e6618066c186b66667c3e600618663c3e3c3e30
;ring1
       HEX 3024
;ring2
       HEX 02e0
;ring3
       HEX 180c
;ring4
       HEX 6006

 ORG $AB00,0  ; *************

 RORG $AB00 ; *************

;atascii
       HEX 000000000000000000000000000000007618180c6c0666186606000000000000
       HEX 0018006606306f0018183c1800f000307618180c6c0666186606000018001818
       HEX 6e6666606660606e66180678606b7e667c667c061866667f3c18301818186300
       HEX 003e6660667e186666180678187f66666666603c1866667f186618
;ring1
       HEX 3024
;ring2
       HEX 02e0
;ring3
       HEX 180c
;ring4
       HEX 600a

 ORG $AC00,0  ; *************

 RORG $AC00 ; *************

;atascii
       HEX 000000000000000000000000000000006e180c183c7c7c0c3c3e000000000000
       HEX 001866663c1838181818ff7e008000186e180c183c7c7c0c3c3e181830000c0c
       HEX 6e667c60667c7c607e180678607f7e666666663c1866666b3c3c181830183600
       HEX 18067c603e663e667c38066c187f6666666666601866666b3c660c
;ring1
       HEX 2ca0
;ring2
       HEX 02e0
;ring3
       HEX 0a38
;ring4
       HEX 681e

 ORG $AD00,0  ; *************

 RORG $AD00 ; *************

;atascii
       HEX 000000000000000000000000000000006638660c1c6060066666000000000000
       HEX 001866ff606c1c181c383c1800f0000c6638660c1c60600666661818187e1866
       HEX 663c66666c6060606618066c60777666666666601866666366660c1860181c00
       HEX 183c603c063c183e6000006018667c3c7c3e7c3e7e66666366667e
;ring1
       HEX 0c90
;ring2
       HEX 02e0
;ring3
       HEX 0630
;ring4
       HEX 2838

 ORG $AE00,0  ; *************

 RORG $AE00 ; *************

;atascii
       HEX 000000000000000000000000000000003c183c7e0c7e3c7e3c3c000000000000
       HEX 001866663e6636180e706618008000063c183c7e0c7e3c7e3c3c00000c00303c
       HEX 3c187c3c787e7e3e667e06666063663c7c3c7c3c7e66666366667e1e40780800
       HEX 1800600006000e0060180660380000000000000018000000000000
;ring1
       HEX 0a90
;ring2
       HEX 00c0
;ring3
       HEX 06a0
;ring4
       HEX 1aa8

 ORG $AF00,0  ; *************

 RORG $AF00 ; *************

;atascii
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 0000000018001c000000000000ff000000000000000000000000000006006000
       HEX 0000000000000000000000000000000000000000000000000000000000000000
       HEX 000000000000000000000000000000000000000000000000000000
;ring1
       HEX 0240
;ring2
       HEX 0080
;ring3
       HEX 0180
;ring4
       HEX 06a0

 ORG $B000,0  ; *************

 RORG $B000 ; *************
 if START_OF_ROM = . ; avoid dasm empty start-rom truncation.
     .byte 0
 endif
START_OF_ROM SET 0 ; scuttle so we always fail subsequent banks
 ORG $24000,0
 RORG $C000
.
 ;;line 71;; 

.L055 ;;line 72;;  rem ** The golum banner takes up the whole bank, except for the dma holes.

.L056 ;;line 73;;  rem ** Any code needs to go into DMA holes, and "noflow" just tells 7800basic

.L057 ;;line 74;;  rem ** to avoid adding extra assembly code prior to the dma hole. (since

.L058 ;;line 75;;  rem ** we don't have any spare rom for it)

.L059 ;;line 76;;  dmahole 0 noflow

gameend
DMAHOLEEND0 SET .
 echo " ",[($C000 - .)]d , "bytes of ROM space left in the main area of bank 8."
 if ($C000 - .) < 0
SPACEOVERFLOW SET (SPACEOVERFLOW+1)
 endif
 if START_OF_ROM = . ; avoid dasm empty start-rom truncation.
     .byte 0
 endif
START_OF_ROM SET 0 ; scuttle so we always fail subsequent banks

 ORG $24000,0  ; *************

 RORG $C000 ; *************

golum00 = $C000

golum00
       HEX 11010001000001000000110000000d17ef4004155aa96064956abbb6bbabfebf
       HEX e7fffff810110000
golum01 = $C028

golum01
       HEX 1100015400000500110100110100555001bfe85aa6a6556aaee995a69aa9aabb
       HEX aaabffff51000690
golum02 = $C050

golum02
       HEX 150540110100001010015501454193a800016669aaefaaabaeee699666565999
       HEX 9916fff914000100
golum03 = $C078

golum03
       HEX 10005a4004014154415aa940011009015055476ee999526bbbae9aaaa99a9aaa
       HEX aafffff044000000
golum04 = $C0A0

golum04
       HEX 040101010046abbffeaeffbbefbefdd400445452ba8e4c40119559994a9aa969
       HEX 9bfbff81ffffc000
golum05 = $C0C8

golum05
       HEX 01050446e6bffffffeefbba506efebe2825465a8551044400004410000000440
       HEX 605ff50007800000

 ORG $24100,0  ; *************

 RORG $C100 ; *************

;golum00
       HEX 45000054044000000040544000040c07be050114559a5855265aaaeaeeeeefff
       HEX ebbffef020014000
;golum01
       HEX 4440015400050000040004144000214441bfe966a9aa559abba65aaaaaaabbae
       HEX e6bfffff04400690
;golum02
       HEX 544100444000000044015405440097a8000156666abbbaaabbbaa6599559a551
       HEX 115bfffd14001400
;golum03
       HEX 4400154140000150110100101004150191151a6bba6559aefeeaa66a6666aaa9
       HEX aabffff090400000
;golum04
       HEX 400440044002aeffbbeaffeefbfbf9e004110446e9df40804555656a5aa6a656
       HEX 66a9ff813fffc000
;golum05
       HEX 40150000f6fbfffffffbffe502bff7f345515565554110000000044001011110
       HEX 015ff50006800000

 ORG $24200,0  ; *************

 RORG $C200 ; *************

;golum00
       HEX 00000000001000004000150100104d0aee00045556aa5a496556aeaebffbffff
       HEX b7fffff010114000
;golum01
       HEX 1105005504014000110000111000155003bfe85aaa9991a66a99566a999aaabb
       HEX baffffff40001690
;golum02
       HEX 150441111000010111441011100096940002566a67aeeeeeeeea996659969554
       HEX 456afff940000100
;golum03
       HEX 1100540140100050044440000044480691455daeea9566bbfbaa6aaaa99999aa
       HEX aafffff040000000
;golum04
       HEX 004100010101ebbeffaebffbfeefbd9001154197baca4041159999999a99a999
       HEX 996bff800bff0000
;golum05
       HEX 00010404b9bfbffffffeffa546fffbf986459591550440544000110000805544
       HEX 457ffd4002c00000

 ORG $24300,0  ; *************

 RORG $C300 ; *************

;golum00
       HEX 00000040000010040000544000000d0bbd00114519a6569999a5aaaafbffffff
       HEX bbbffff094110000
;golum01
       HEX 4445405400050040040010044004214407bfa416aaaa65599a66599aaaaaeeee
       HEX e7bfffff04000690
;golum02
       HEX 44000554404010004400001440409664000295a69abbbbbbbbba659a95565555
       HEX 555bfffd10400440
;golum03
       HEX 54101401400000501511044505151806855569abaaaaaaefeea69aa6a6566699
       HEX abbffff090000000
;golum04
       HEX 000440000410aaefeeeaebffeffbfd800445558aebd540006566656aa6a6aa64
       HEX 566bffc101f80000
;golum05
       HEX 040400007eafffffffffffe54affeafdc1515945941105911000044001656555
       HEX 12fffc8001e00000

 ORG $24400,0  ; *************

 RORG $C400 ; *************

;golum00
       HEX 00000010500000000000000014000d0eed00451656aa959226556eabbfeffffe
       HEX e7fffff050150000
;golum01
       HEX 1105414000054001001000010000255106bea45aaaa9996a6999aaaa9aabbbbb
       HEX bafffffd00001550
;golum02
       HEX 1001155101100001110000010000da904002465999eefeeeeee9966a6665a666
       HEX 466afffd40000100
;golum03
       HEX 1500154000444000154011115444541a914469aeef999bbffaa9a999996559aa
       HEX 6afefff444000000
;golum04
       HEX 1001001400447abfffaaaefbffefec8001165a9bb7ca4401959999a66aa9aa99
       HEX 547fff8000000000
;golum05
       HEX 004400052dbfffffffffffa65afffbf8c6459556504466544000100044445995
       HEX 597ffd5001e00000

 ORG $24500,0  ; *************

 RORG $C500 ; *************

;golum00
       HEX 0540000000040000000400001401030bb800115145a955e1996a6aeeffffffbe
       HEX fbefffe084540000
;golum01
       HEX 440100000001000000000004400021440afe9016ae66991aa665aaa9aaeeeeee
       HEX e7feffff40000540
;golum02
       HEX 00004554044400404400100440009a510006966566bbffbbbba665a995569999
       HEX 999bbff904004440
;golum03
       HEX 5400055000150400150445454500181b8655a9aabbee6eefee9aaaa665595569
       HEX abfafff450000000
;golum04
       HEX 0000106900102abbfeaaaaeeffbfbd800445665be7d10804566aa66aa6aaaa64
       HEX 556fffc100000000
;golum05
       HEX 000000001e6fbfffffffffb65bffeefd4116665a9119a9900000010111551565
       HEX 66fffc6000e00000

 ORG $24600,0  ; *************

 RORG $C600 ; *************

;golum00
       HEX 0100000000000000000000001400071ef410055595aa49686a9a9bbbfffffffb
       HEX e7efffe150540000
;golum01
       HEX 115000151000000000000001000025101efe9059ba69a656a9969a9aaebbbbba
       HEX bbfffffd00001140
;golum02
       HEX 0010045041500000100400110004da4000069599a66efffffe9956aa55696666
       HEX 66aabffd00040100
;golum03
       HEX 1005055050551104040015141000245f469165aeeefbbbbfbaa6a66996559999
       HEX 6feafff444000000
;golum04
       HEX 1000006900541eafffbaabbabbfba8400111996697e4001199aa999aaaaa6aa9
       HEX 95bfff9040000000
;golum05
       HEX 100010450eabffffffffffbb6ffff9ed060599664466a9000000001045596659
       HEX ab7ffd1240e00000

 ORG $24700,0  ; *************

 RORG $C700 ; *************

;golum00
       HEX 0000000000001000000000000400037bf0011451566a995a6a9b96ffbffefffb
       HEX fbefffc244500000
;golum01
       HEX 445000154000000004011000001039441efa4116ab9a6585a666aaaa7bafeeeb
       HEX a7fbffff00400500
;golum02
       HEX 00441144044400000000000000009a41440a866665abfffffba699a565559aa9
       HEX 9a5afffd41011140
;golum03
       HEX 0115069154151000411404010000646f4655a56babbeefffeaaaeaa665966654
       HEX 6aabfff410000000
;golum04
       HEX 00500055055406befeeaaaabaebfed000540669252e0005556aea9aaa9a6aaa5
       HEX 666fffd000000000
;golum05
       HEX 441044004baaffffffffffb6abfffafd41166699019aa4000000044155665565
       HEX 6afffc56a0e00000

 ORG $24800,0  ; *************

 RORG $C800 ; *************

;golum00
       HEX 000000000000000000004000000002afd0000555a1aa966a669ba9bbffffffbb
       HEX ebffffc550540000
;golum01
       HEX 10000000000044000001000000003e102ef9005aae969956999aaa6aaefbbbee
       HEX fbfeffbd00001500
;golum02
       HEX 0010011011101000000000000400da05001b8599599efffeee596699566666aa
       HEX 8abbfffd00045440
;golum03
       HEX 4015029154155440100500440041617f4a91996aaefbbeffae6ea9999955a995
       HEX 59affff841000000
;golum04
       HEX 01540014405412efefeaaaaaabaeb8400154006141a001645aeaa6aa9aaaaa99
       HEX 99bfffe040000000
;golum05
       HEX 10011501076bbeefffffffbbbfffeeed0405aa59065a950000000111955a5599
       HEX aebffd12f9e00000

 ORG $24900,0  ; *************

 RORG $C900 ; *************

;golum00
       HEX 000000040000014400040040000041bb80000454659aa2aa9aa6ee6efffffbef
       HEX efffffc651500000
;golum01
       HEX 00005004414000140000004010003a442bf80115aa666a55a66aa6bbbbaeeebb
       HEX abfafff900101400
;golum02
       HEX 0044044004400400000040404004d941401ed566695bbffbb9959a6595999aaa
       HEX 95affffd40011140
;golum03
       HEX 0445029169151151010011001000617f4a55555aebbe9bfeeaaabaa656666a64
       HEX 567ffff810000000
;golum04
       HEX 00540400045400bbbbaaaabababba90005555680001406556bab99aaa9aa9aaa
       HEX 66bfffe000000000
;golum05
       HEX 44005400139afffefffffffabfbff9fc41166a64146a694001100455656aa666
       HEX aafffd55aff00000

 ORG $24A00,0  ; *************

 RORG $CA00 ; *************

;golum00
       HEX 001015000000015401000100001001aa010005556929a6aaa9a6eb5bffffffef
       HEX ebffffd545400000
;golum01
       HEX 00000001010000000010000000002e107be440169bb89a5169a66aaa6eebaafe
       HEX bbfaffbd10011400
;golum02
       HEX 0111010400101100000004000000d905102ba19a9a56eeeee6666a955666aaa9
       HEX 4aebffff00005450
;golum03
       HEX 000001556945014110100001000061be4a915999aeefdbfbaabbaa9965599aa9
       HEX 99affff804000000
;golum04
       HEX 445410011410406feeaaaaaaabaaed400156a941400059916ebaaa6aa6aaaaa9
       HEX aabfffe040000000
;golum05
       HEX 1101511101ebbfbbeffffffbbfffeeec90459aa445b9aa4000000154995a95a9
       HEX abbfff126bfc0000

 ORG $24B00,0  ; *************

 RORG $CB00 ; *************

;golum00
       HEX 00441000040004500040000000000054000004546a66a9eaa699eedeffffffbf
       HEX efffff9651500000
;golum01
       HEX 00000100100000044000000000002e44bbe001056a996a955aaaaeeeaaaabbef
       HEX ebfeffb910415000
;golum02
       HEX 0044044000000400040000000100d915002ee565aa56aaaa9959aa59599aaaa5
       HEX 9aaffffd40001450
;golum03
       HEX 000405555510455000000000000091bf4654599aabbffffebaaaaa6599966aaa
       HEX aabffff910000000
;golum04
       HEX 001000405500001bfbaeaaaaeeefaa000059a65595556655aaeea6aaaa99aaaa
       HEX aabffff000000000
;golum05
       HEX 4410451540eaefffbbfbfffffffffdfc9015659116e5ba5004444565666aa66a
       HEX aaffff559bfc0000

 ORG $24C00,0  ; *************

 RORG $CC00 ; *************

;golum00
       HEX 00000100001400100000015000001000000101195a5a68eaa96a6bf7fffffbef
       HEX efffffa945400000
;golum01
       HEX 00000010000000110044000000102e10eb900041aa9a66651a6aabb9eebaeaff
       HEX abfbffbc20015000
;golum02
       HEX 00101150000010141100000000009944406ba45a9695aaaaa666a99666666a9a
       HEX abbbffff10401190
;golum03
       HEX 001541404504100004001000001091fe429559a66efffffbaaeee99665599aa9
       HEX 9aaffff804000000
;golum04
       HEX 0040450455040006feeaeeeebbfea940015699196a669945bbbaa9aaa9aaaaaa
       HEX 9affffe000000000
;golum05
       HEX 10101511017abffeeeeefffbbfbffaec904559406ba6ba4001111199295aa959
       HEX aebfff516aff0000

 ORG $24D00,0  ; *************

 RORG $CD00 ; *************

;golum00
       HEX 0000000000000100104005440501000000100155588999faab976ff9fffffbaf
       HEX efffff1555000000
;golum01
       HEX 00014050000000500000000100000e41af9000455aa68a9956abaeeeaaaaaffb
       HEX b6ffffb810111000
;golum02
       HEX 00440450410001000405000000005914006fe966a6a56aaa999aa655aaaaa9ae
       HEX 9aafffff54000590
;golum03
       HEX 001100001000000000004400110092fe01a465a6abbbffeeabbaa96596566aaa
       HEX 9abefffd00000400
;golum04
       HEX 0400150055400011bffbbbebffba56004059a96a5aaaa556eeeb9a6aa66aaaa9
       HEX aabffff040000000
;golum05
       HEX 44000015403aafffbbfbeffffffffdec901641046e9a7650044445656a66aa66
       HEX eaffff569aff0000

 ORG $24E00,0  ; *************

 RORG $CE00 ; *************

;golum00
       HEX 01100000000000000000055005400000400001965692a9babffa9bfdbffefbef
       HEX afffff5665000000
;golum01
       HEX 01014000040100050150000001000e52eb8004556aa5969656aabbb9abaabebf
       HEX fbfffffc20011000
;golum02
       HEX 1010015000000500110500111410595000bbe45aa6a556666aaa996669aaaaab
       HEX aaebffff11100690
;golum03
       HEX 105504000000004000111101050093fa006966a9aafbbbbaaeeba996596599a9
       HEX 99a97ff910000000
;golum04
       HEX 01101a40150540446efeefffa94005011156a62a96a99516bbbaa6aa69aaaaaa
       HEX aafffff010400000
;golum05
       HEX 10400011101abbffeabfbffffffffedc50459011ab8f914011151599599aa695
       HEX abbfff51aabfc000

 ORG $24F00,0  ; *************

 RORG $CF00 ; *************

;golum00
       HEX 000000040000000000010040050000100000018696666a2eaffe9bff6ffffbef
       HEX effffe95a9000000
;golum01
       HEX 04000000000000000050040000000c93af40005056a994a651aeeeeaaabaf9bf
       HEX fafffff810414000
;golum02
       HEX 4400055000000500444500144000155100bfe966aa691599aaaa655aaa9a9aee
       HEX 9bbabfff45400690
;golum03
       HEX 440540040001104040405404540097e9000455699abeee6aabbaa65995596665
       HEX 5655fffd04001400
;golum04
       HEX 00011a41154140501aaaaaa8000046005059926ba5aa555aeeeaa9a6a666aaa9
       HEX aabffff040000000
;golum05
       HEX 00000004400eaefefbafeffffbbffde900116915ae4f8000045455665a66a9a5
       HEX 6fffdf97faffc000

 ORG $25000,0  ; *************

 RORG $D000 ; *************
DMAHOLESTART0 SET .
.
 ;;line 77;; 

.L060 ;;line 78;;  incbanner gfx/golum.png

.
 ;;line 79;; 

.rundemo
 ;;line 80;; rundemo

.
 ;;line 81;; 

.L061 ;;line 82;;  BACKGRND = $00

  lda #$00
  sta BACKGRND
.
 ;;line 83;; 

.L062 ;;line 84;;  rem ** Initialize the position and velocity of all of the ring objects.

.L063 ;;line 85;;  rem ** We setup more rings than the demo requires, for future experiments. :)

.L064 ;;line 86;;  x = 10 :  y = 8

  lda #10
  sta x
  lda #8
  sta y
.L065 ;;line 87;;  for z = 0 to 100

  lda #0
  sta z
.L065forz
.L066 ;;line 88;;  playerx[z] = x

  lda x
	LDX z
  sta playerx,x
.L067 ;;line 89;;  playery[z] = y

  lda y
	LDX z
  sta playery,x
.L068 ;;line 90;;  y = y + 17

  lda y
	CLC
	ADC #17
  sta y
.L069 ;;line 91;;  x = rand

 jsr randomize
  sta x
.L070 ;;line 92;;  if y > 191 then y = y - 191

  lda #191
  cmp y
  bcs .skipL070
.condpart0
  lda y
	SEC
	SBC #191
  sta y
.skipL070
.L071 ;;line 93;;  if x > 149 then x = x - 149

  lda #149
  cmp x
  bcs .skipL071
.condpart1
  lda x
	SEC
	SBC #149
  sta x
.skipL071
.L072 ;;line 94;;  playerdx[z] =  ( rand & 2 )  - 1

; complex statement detected
 jsr randomize
	AND #2
	SEC
	SBC #1
	LDX z
  sta playerdx,x
.L073 ;;line 95;;  playerdy[z] =  ( rand & 2 )  - 1

; complex statement detected
 jsr randomize
	AND #2
	SEC
	SBC #1
	LDX z
  sta playerdy,x
.L074 ;;line 96;;  next

  lda z
  cmp #100
  inc z
 if ((* - .L065forz) < 127) && ((* - .L065forz) > -128)
  bcc .L065forz
 else
  bcs .0skipL065forz
  jmp .L065forz
.0skipL065forz
 endif
.
 ;;line 97;; 

.L075 ;;line 98;;  rem ** draw the screen background

.L076 ;;line 99;;  clearscreen

 jsr clearscreen
.L077 ;;line 100;;  drawscreen

 jsr drawscreen
.
 ;;line 101;; 

.L078 ;;line 102;;  doublebuffer on

  lda #1
  sta doublebufferstate
.
 ;;line 103;; 

.L079 ;;line 104;;  alphadata scrollertext atascii

  jmp .skipL079
scrollertext
  .byte (<atascii + $20)
  .byte (<atascii + $2a)
  .byte (<atascii + $2a)
  .byte (<atascii + $2a)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $57)
  .byte (<atascii + $65)
  .byte (<atascii + $6c)
  .byte (<atascii + $63)
  .byte (<atascii + $6f)
  .byte (<atascii + $6d)
  .byte (<atascii + $65)
  .byte (<atascii + $20)
  .byte (<atascii + $74)
  .byte (<atascii + $6f)
  .byte (<atascii + $20)
  .byte (<atascii + $74)
  .byte (<atascii + $68)
  .byte (<atascii + $65)
  .byte (<atascii + $20)
  .byte (<atascii + $37)
  .byte (<atascii + $38)
  .byte (<atascii + $30)
  .byte (<atascii + $30)
  .byte (<atascii + $62)
  .byte (<atascii + $61)
  .byte (<atascii + $73)
  .byte (<atascii + $69)
  .byte (<atascii + $63)
  .byte (<atascii + $20)
  .byte (<atascii + $38)
  .byte (<atascii + $36)
  .byte (<atascii + $20)
  .byte (<atascii + $53)
  .byte (<atascii + $70)
  .byte (<atascii + $72)
  .byte (<atascii + $69)
  .byte (<atascii + $74)
  .byte (<atascii + $65)
  .byte (<atascii + $20)
  .byte (<atascii + $44)
  .byte (<atascii + $65)
  .byte (<atascii + $6d)
  .byte (<atascii + $6f)
  .byte (<atascii + $2c)
  .byte (<atascii + $20)
  .byte (<atascii + $66)
  .byte (<atascii + $65)
  .byte (<atascii + $61)
  .byte (<atascii + $74)
  .byte (<atascii + $75)
  .byte (<atascii + $72)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $67)
  .byte (<atascii + $20)
  .byte (<atascii + $6d)
  .byte (<atascii + $75)
  .byte (<atascii + $73)
  .byte (<atascii + $69)
  .byte (<atascii + $63)
  .byte (<atascii + $20)
  .byte (<atascii + $62)
  .byte (<atascii + $79)
  .byte (<atascii + $20)
  .byte (<atascii + $52)
  .byte (<atascii + $61)
  .byte (<atascii + $64)
  .byte (<atascii + $65)
  .byte (<atascii + $6b)
  .byte (<atascii + $20)
  .byte (<atascii + $22)
  .byte (<atascii + $52)
  .byte (<atascii + $61)
  .byte (<atascii + $73)
  .byte (<atascii + $74)
  .byte (<atascii + $65)
  .byte (<atascii + $72)
  .byte (<atascii + $22)
  .byte (<atascii + $20)
  .byte (<atascii + $53)
  .byte (<atascii + $74)
  .byte (<atascii + $65)
  .byte (<atascii + $72)
  .byte (<atascii + $62)
  .byte (<atascii + $61)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $2a)
  .byte (<atascii + $2a)
  .byte (<atascii + $2a)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $22)
  .byte (<atascii + $4f)
  .byte (<atascii + $6e)
  .byte (<atascii + $65)
  .byte (<atascii + $20)
  .byte (<atascii + $70)
  .byte (<atascii + $72)
  .byte (<atascii + $65)
  .byte (<atascii + $63)
  .byte (<atascii + $69)
  .byte (<atascii + $6f)
  .byte (<atascii + $75)
  .byte (<atascii + $73)
  .byte (<atascii + $2c)
  .byte (<atascii + $20)
  .byte (<atascii + $74)
  .byte (<atascii + $77)
  .byte (<atascii + $6f)
  .byte (<atascii + $20)
  .byte (<atascii + $70)
  .byte (<atascii + $72)
  .byte (<atascii + $65)
  .byte (<atascii + $63)
  .byte (<atascii + $69)
  .byte (<atascii + $6f)
  .byte (<atascii + $75)
  .byte (<atascii + $73)
  .byte (<atascii + $2c)
  .byte (<atascii + $20)
  .byte (<atascii + $74)
  .byte (<atascii + $68)
  .byte (<atascii + $72)
  .byte (<atascii + $65)
  .byte (<atascii + $65)
  .byte (<atascii + $2e)
  .byte (<atascii + $2e)
  .byte (<atascii + $2e)
  .byte (<atascii + $20)
  .byte (<atascii + $73)
  .byte (<atascii + $6f)
  .byte (<atascii + $20)
  .byte (<atascii + $6d)
  .byte (<atascii + $61)
  .byte (<atascii + $6e)
  .byte (<atascii + $79)
  .byte (<atascii + $20)
  .byte (<atascii + $70)
  .byte (<atascii + $72)
  .byte (<atascii + $65)
  .byte (<atascii + $63)
  .byte (<atascii + $69)
  .byte (<atascii + $6f)
  .byte (<atascii + $75)
  .byte (<atascii + $73)
  .byte (<atascii + $73)
  .byte (<atascii + $73)
  .byte (<atascii + $73)
  .byte (<atascii + $65)
  .byte (<atascii + $73)
  .byte (<atascii + $20)
  .byte (<atascii + $65)
  .byte (<atascii + $76)
  .byte (<atascii + $65)
  .byte (<atascii + $72)
  .byte (<atascii + $79)
  .byte (<atascii + $77)
  .byte (<atascii + $68)
  .byte (<atascii + $65)
  .byte (<atascii + $72)
  .byte (<atascii + $65)
  .byte (<atascii + $21)
  .byte (<atascii + $21)
  .byte (<atascii + $21)
  .byte (<atascii + $22)
  .byte (<atascii + $2c)
  .byte (<atascii + $20)
  .byte (<atascii + $47)
  .byte (<atascii + $6f)
  .byte (<atascii + $6c)
  .byte (<atascii + $6c)
  .byte (<atascii + $75)
  .byte (<atascii + $6d)
  .byte (<atascii + $20)
  .byte (<atascii + $73)
  .byte (<atascii + $68)
  .byte (<atascii + $6f)
  .byte (<atascii + $75)
  .byte (<atascii + $74)
  .byte (<atascii + $65)
  .byte (<atascii + $64)
  .byte (<atascii + $2c)
  .byte (<atascii + $20)
  .byte (<atascii + $73)
  .byte (<atascii + $74)
  .byte (<atascii + $61)
  .byte (<atascii + $72)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $67)
  .byte (<atascii + $20)
  .byte (<atascii + $61)
  .byte (<atascii + $74)
  .byte (<atascii + $20)
  .byte (<atascii + $74)
  .byte (<atascii + $68)
  .byte (<atascii + $65)
  .byte (<atascii + $20)
  .byte (<atascii + $73)
  .byte (<atascii + $63)
  .byte (<atascii + $72)
  .byte (<atascii + $65)
  .byte (<atascii + $65)
  .byte (<atascii + $6e)
  .byte (<atascii + $20)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $20)
  .byte (<atascii + $64)
  .byte (<atascii + $69)
  .byte (<atascii + $73)
  .byte (<atascii + $62)
  .byte (<atascii + $65)
  .byte (<atascii + $6c)
  .byte (<atascii + $69)
  .byte (<atascii + $65)
  .byte (<atascii + $66)
  .byte (<atascii + $21)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $22)
  .byte (<atascii + $48)
  .byte (<atascii + $6f)
  .byte (<atascii + $77)
  .byte (<atascii + $73)
  .byte (<atascii + $69)
  .byte (<atascii + $74)
  .byte (<atascii + $73)
  .byte (<atascii + $20)
  .byte (<atascii + $64)
  .byte (<atascii + $6f)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $67)
  .byte (<atascii + $20)
  .byte (<atascii + $74)
  .byte (<atascii + $68)
  .byte (<atascii + $61)
  .byte (<atascii + $74)
  .byte (<atascii + $3f)
  .byte (<atascii + $21)
  .byte (<atascii + $3f)
  .byte (<atascii + $22)
  .byte (<atascii + $20)
  .byte (<atascii + $68)
  .byte (<atascii + $65)
  .byte (<atascii + $20)
  .byte (<atascii + $73)
  .byte (<atascii + $61)
  .byte (<atascii + $69)
  .byte (<atascii + $64)
  .byte (<atascii + $2c)
  .byte (<atascii + $20)
  .byte (<atascii + $62)
  .byte (<atascii + $72)
  .byte (<atascii + $6f)
  .byte (<atascii + $77)
  .byte (<atascii + $20)
  .byte (<atascii + $66)
  .byte (<atascii + $75)
  .byte (<atascii + $72)
  .byte (<atascii + $72)
  .byte (<atascii + $6f)
  .byte (<atascii + $77)
  .byte (<atascii + $65)
  .byte (<atascii + $64)
  .byte (<atascii + $2e)
  .byte (<atascii + $20)
  .byte (<atascii + $52)
  .byte (<atascii + $65)
  .byte (<atascii + $61)
  .byte (<atascii + $63)
  .byte (<atascii + $68)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $67)
  .byte (<atascii + $20)
  .byte (<atascii + $6f)
  .byte (<atascii + $75)
  .byte (<atascii + $74)
  .byte (<atascii + $2c)
  .byte (<atascii + $20)
  .byte (<atascii + $68)
  .byte (<atascii + $65)
  .byte (<atascii + $20)
  .byte (<atascii + $67)
  .byte (<atascii + $72)
  .byte (<atascii + $61)
  .byte (<atascii + $62)
  .byte (<atascii + $62)
  .byte (<atascii + $65)
  .byte (<atascii + $64)
  .byte (<atascii + $20)
  .byte (<atascii + $74)
  .byte (<atascii + $68)
  .byte (<atascii + $65)
  .byte (<atascii + $20)
  .byte (<atascii + $37)
  .byte (<atascii + $38)
  .byte (<atascii + $30)
  .byte (<atascii + $30)
  .byte (<atascii + $20)
  .byte (<atascii + $63)
  .byte (<atascii + $6f)
  .byte (<atascii + $6e)
  .byte (<atascii + $73)
  .byte (<atascii + $6f)
  .byte (<atascii + $6c)
  .byte (<atascii + $65)
  .byte (<atascii + $2c)
  .byte (<atascii + $20)
  .byte (<atascii + $79)
  .byte (<atascii + $61)
  .byte (<atascii + $6e)
  .byte (<atascii + $6b)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $67)
  .byte (<atascii + $20)
  .byte (<atascii + $69)
  .byte (<atascii + $74)
  .byte (<atascii + $20)
  .byte (<atascii + $66)
  .byte (<atascii + $72)
  .byte (<atascii + $6f)
  .byte (<atascii + $6d)
  .byte (<atascii + $20)
  .byte (<atascii + $69)
  .byte (<atascii + $74)
  .byte (<atascii + $73)
  .byte (<atascii + $20)
  .byte (<atascii + $63)
  .byte (<atascii + $61)
  .byte (<atascii + $62)
  .byte (<atascii + $6c)
  .byte (<atascii + $65)
  .byte (<atascii + $73)
  .byte (<atascii + $2c)
  .byte (<atascii + $20)
  .byte (<atascii + $63)
  .byte (<atascii + $6c)
  .byte (<atascii + $75)
  .byte (<atascii + $74)
  .byte (<atascii + $63)
  .byte (<atascii + $68)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $67)
  .byte (<atascii + $20)
  .byte (<atascii + $69)
  .byte (<atascii + $74)
  .byte (<atascii + $20)
  .byte (<atascii + $74)
  .byte (<atascii + $6f)
  .byte (<atascii + $20)
  .byte (<atascii + $68)
  .byte (<atascii + $69)
  .byte (<atascii + $73)
  .byte (<atascii + $20)
  .byte (<atascii + $63)
  .byte (<atascii + $68)
  .byte (<atascii + $65)
  .byte (<atascii + $73)
  .byte (<atascii + $74)
  .byte (<atascii + $2e)
  .byte (<atascii + $20)
  .byte (<atascii + $41)
  .byte (<atascii + $6e)
  .byte (<atascii + $64)
  .byte (<atascii + $20)
  .byte (<atascii + $77)
  .byte (<atascii + $69)
  .byte (<atascii + $74)
  .byte (<atascii + $68)
  .byte (<atascii + $6f)
  .byte (<atascii + $75)
  .byte (<atascii + $74)
  .byte (<atascii + $20)
  .byte (<atascii + $61)
  .byte (<atascii + $6e)
  .byte (<atascii + $6f)
  .byte (<atascii + $74)
  .byte (<atascii + $68)
  .byte (<atascii + $65)
  .byte (<atascii + $72)
  .byte (<atascii + $20)
  .byte (<atascii + $73)
  .byte (<atascii + $6f)
  .byte (<atascii + $75)
  .byte (<atascii + $6e)
  .byte (<atascii + $64)
  .byte (<atascii + $2c)
  .byte (<atascii + $20)
  .byte (<atascii + $47)
  .byte (<atascii + $6f)
  .byte (<atascii + $6c)
  .byte (<atascii + $6c)
  .byte (<atascii + $75)
  .byte (<atascii + $6d)
  .byte (<atascii + $20)
  .byte (<atascii + $73)
  .byte (<atascii + $61)
  .byte (<atascii + $6e)
  .byte (<atascii + $6b)
  .byte (<atascii + $20)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $74)
  .byte (<atascii + $6f)
  .byte (<atascii + $20)
  .byte (<atascii + $74)
  .byte (<atascii + $68)
  .byte (<atascii + $65)
  .byte (<atascii + $20)
  .byte (<atascii + $64)
  .byte (<atascii + $65)
  .byte (<atascii + $70)
  .byte (<atascii + $74)
  .byte (<atascii + $68)
  .byte (<atascii + $73)
  .byte (<atascii + $20)
  .byte (<atascii + $6f)
  .byte (<atascii + $66)
  .byte (<atascii + $20)
  .byte (<atascii + $74)
  .byte (<atascii + $68)
  .byte (<atascii + $65)
  .byte (<atascii + $20)
  .byte (<atascii + $64)
  .byte (<atascii + $61)
  .byte (<atascii + $72)
  .byte (<atascii + $6b)
  .byte (<atascii + $20)
  .byte (<atascii + $6d)
  .byte (<atascii + $69)
  .byte (<atascii + $73)
  .byte (<atascii + $74)
  .byte (<atascii + $79)
  .byte (<atascii + $20)
  .byte (<atascii + $77)
  .byte (<atascii + $6f)
  .byte (<atascii + $6f)
  .byte (<atascii + $64)
  .byte (<atascii + $73)
  .byte (<atascii + $2e)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $2a)
  .byte (<atascii + $2a)
  .byte (<atascii + $2a)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $4c)
  .byte (<atascii + $69)
  .byte (<atascii + $73)
  .byte (<atascii + $74)
  .byte (<atascii + $65)
  .byte (<atascii + $6e)
  .byte (<atascii + $2e)
  .byte (<atascii + $20)
  .byte (<atascii + $49)
  .byte (<atascii + $74)
  .byte (<atascii + $27)
  .byte (<atascii + $73)
  .byte (<atascii + $20)
  .byte (<atascii + $63)
  .byte (<atascii + $61)
  .byte (<atascii + $6c)
  .byte (<atascii + $6c)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $67)
  .byte (<atascii + $2e)
  .byte (<atascii + $20)
  .byte (<atascii + $54)
  .byte (<atascii + $68)
  .byte (<atascii + $65)
  .byte (<atascii + $20)
  .byte (<atascii + $37)
  .byte (<atascii + $38)
  .byte (<atascii + $30)
  .byte (<atascii + $30)
  .byte (<atascii + $20)
  .byte (<atascii + $69)
  .byte (<atascii + $73)
  .byte (<atascii + $20)
  .byte (<atascii + $77)
  .byte (<atascii + $68)
  .byte (<atascii + $69)
  .byte (<atascii + $73)
  .byte (<atascii + $70)
  .byte (<atascii + $65)
  .byte (<atascii + $72)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $67)
  .byte (<atascii + $20)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $20)
  .byte (<atascii + $79)
  .byte (<atascii + $6f)
  .byte (<atascii + $75)
  .byte (<atascii + $72)
  .byte (<atascii + $20)
  .byte (<atascii + $65)
  .byte (<atascii + $61)
  .byte (<atascii + $72)
  .byte (<atascii + $2c)
  .byte (<atascii + $20)
  .byte (<atascii + $72)
  .byte (<atascii + $65)
  .byte (<atascii + $61)
  .byte (<atascii + $63)
  .byte (<atascii + $68)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $67)
  .byte (<atascii + $20)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $73)
  .byte (<atascii + $69)
  .byte (<atascii + $64)
  .byte (<atascii + $65)
  .byte (<atascii + $20)
  .byte (<atascii + $79)
  .byte (<atascii + $6f)
  .byte (<atascii + $75)
  .byte (<atascii + $2c)
  .byte (<atascii + $20)
  .byte (<atascii + $61)
  .byte (<atascii + $6e)
  .byte (<atascii + $64)
  .byte (<atascii + $20)
  .byte (<atascii + $62)
  .byte (<atascii + $75)
  .byte (<atascii + $72)
  .byte (<atascii + $72)
  .byte (<atascii + $6f)
  .byte (<atascii + $77)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $67)
  .byte (<atascii + $20)
  .byte (<atascii + $64)
  .byte (<atascii + $65)
  .byte (<atascii + $65)
  .byte (<atascii + $70)
  .byte (<atascii + $20)
  .byte (<atascii + $64)
  .byte (<atascii + $6f)
  .byte (<atascii + $77)
  .byte (<atascii + $6e)
  .byte (<atascii + $20)
  .byte (<atascii + $69)
  .byte (<atascii + $6e)
  .byte (<atascii + $74)
  .byte (<atascii + $6f)
  .byte (<atascii + $20)
  .byte (<atascii + $79)
  .byte (<atascii + $6f)
  .byte (<atascii + $75)
  .byte (<atascii + $72)
  .byte (<atascii + $20)
  .byte (<atascii + $73)
  .byte (<atascii + $6f)
  .byte (<atascii + $75)
  .byte (<atascii + $6c)
  .byte (<atascii + $2e)
  .byte (<atascii + $20)
  .byte (<atascii + $57)
  .byte (<atascii + $6f)
  .byte (<atascii + $6e)
  .byte (<atascii + $27)
  .byte (<atascii + $74)
  .byte (<atascii + $20)
  .byte (<atascii + $79)
  .byte (<atascii + $6f)
  .byte (<atascii + $75)
  .byte (<atascii + $20)
  .byte (<atascii + $61)
  .byte (<atascii + $6e)
  .byte (<atascii + $73)
  .byte (<atascii + $77)
  .byte (<atascii + $65)
  .byte (<atascii + $72)
  .byte (<atascii + $20)
  .byte (<atascii + $79)
  .byte (<atascii + $6f)
  .byte (<atascii + $75)
  .byte (<atascii + $72)
  .byte (<atascii + $20)
  .byte (<atascii + $70)
  .byte (<atascii + $72)
  .byte (<atascii + $65)
  .byte (<atascii + $63)
  .byte (<atascii + $69)
  .byte (<atascii + $6f)
  .byte (<atascii + $75)
  .byte (<atascii + $73)
  .byte (<atascii + $73)
  .byte (<atascii + $73)
  .byte (<atascii + $73)
  .byte (<atascii + $3f)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $20)
  .byte (<atascii + $40)
.skipL079
scrollertext_length = [. - scrollertext]
.
 ;;line 121;; 

.L080 ;;line 122;;  asm

  lda #<scrollertext

  sta textpointlo

  lda #>scrollertext

  sta textpointhi

.
 ;;line 128;; 

.L081 ;;line 129;;  memset scrollerram 32 42 ; 32 is the ascii space character

 ldy #42
 lda #32
memsetloop0
 sta scrollerram-1,y
 dey
 bne memsetloop0
.
 ;;line 130;; 

.L082 ;;line 131;;  rem ** the scroller is 41 characters wide. Each character object can only

.L083 ;;line 132;;  rem ** be 32 bytes wide, so we split the scroller into 2 character objects.

.L084 ;;line 133;;  plotchars scrollerram 5 0 0 20

    lda #12 ; width in two's complement
    ora #160 ; palette left shifted 5 bits
    sta temp3
    lda #<scrollerram
    sta temp1

    lda #>scrollerram
    sta temp2

    lda #0
    sta temp4

    lda #0
    sta temp5

 jsr plotcharacters
.L085 ;;line 134;;  plotchars scrollerram2 5 80 0 21

    lda #11 ; width in two's complement
    ora #160 ; palette left shifted 5 bits
    sta temp3
    lda #<scrollerram2
    sta temp1

    lda #>scrollerram2
    sta temp2

    lda #80
    sta temp4

    lda #0
    sta temp5

 jsr plotcharacters
.
 ;;line 135;; 

.L086 ;;line 136;;  plotbanner golum 4 0 16

    lda #(128)
    sta temp3

    lda #0
    sta temp4

    lda #16

    sta temp5

    lda #(golum00_mode|%01000000)
    sta temp6

    lda #<(golum00 + 0)
    sta temp1

    lda #>(golum00 + 0)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum01 + 0)
    sta temp1

    lda #>(golum01 + 0)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum02 + 0)
    sta temp1

    lda #>(golum02 + 0)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum03 + 0)
    sta temp1

    lda #>(golum03 + 0)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum04 + 0)
    sta temp1

    lda #>(golum04 + 0)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum05 + 0)
    sta temp1

    lda #>(golum05 + 0)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum06 + 0)
    sta temp1

    lda #>(golum06 + 0)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum07 + 0)
    sta temp1

    lda #>(golum07 + 0)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum08 + 0)
    sta temp1

    lda #>(golum08 + 0)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum09 + 0)
    sta temp1

    lda #>(golum09 + 0)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum10 + 0)
    sta temp1

    lda #>(golum10 + 0)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum11 + 0)
    sta temp1

    lda #>(golum11 + 0)
    sta temp2

 jsr plotsprite
    lda #(128|golum00_width_twoscompliment)
    sta temp3

    lda #0
    clc
    adc #128
    sta temp4

    lda #16

    sta temp5

    lda #(golum00_mode|%01000000)
    sta temp6

    lda #<(golum00 + 32)
    sta temp1

    lda #>(golum00 + 32)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum01 + 32)
    sta temp1

    lda #>(golum01 + 32)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum02 + 32)
    sta temp1

    lda #>(golum02 + 32)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum03 + 32)
    sta temp1

    lda #>(golum03 + 32)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum04 + 32)
    sta temp1

    lda #>(golum04 + 32)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum05 + 32)
    sta temp1

    lda #>(golum05 + 32)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum06 + 32)
    sta temp1

    lda #>(golum06 + 32)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum07 + 32)
    sta temp1

    lda #>(golum07 + 32)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum08 + 32)
    sta temp1

    lda #>(golum08 + 32)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum09 + 32)
    sta temp1

    lda #>(golum09 + 32)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum10 + 32)
    sta temp1

    lda #>(golum10 + 32)
    sta temp2

 jsr plotsprite
    clc
    lda #16
    adc temp5
    sta temp5
    lda #<(golum11 + 32)
    sta temp1

    lda #>(golum11 + 32)
    sta temp2

 jsr plotsprite
.
 ;;line 137;; 

.L087 ;;line 138;;  rem ** It's important buffering is active before the savescreen.

.L088 ;;line 139;;  rem ** Otherwise savescreen won't copy the saved screen into both buffers.

.L089 ;;line 140;;  savescreen

 jsr savescreen
.
 ;;line 141;; 

.L090 ;;line 142;;  drawscreen

 jsr drawscreen
.
 ;;line 143;; 

.L091 ;;line 144;;  rem ** Ring colors

.L092 ;;line 145;;  P0C1 = $A2 :  P0C2 = $A9 :  P0C3 = $Ae

  lda #$A2
  sta P0C1
  lda #$A9
  sta P0C2
  lda #$Ae
  sta P0C3
.L093 ;;line 146;;  P1C1 = $06 :  P1C2 = $0c :  P1C3 = $0f

  lda #$06
  sta P1C1
  lda #$0c
  sta P1C2
  lda #$0f
  sta P1C3
.L094 ;;line 147;;  P2C1 = $22 :  P2C2 = $26 :  P2C3 = $2c

  lda #$22
  sta P2C1
  lda #$26
  sta P2C2
  lda #$2c
  sta P2C3
.L095 ;;line 148;;  P3C1 = $42 :  P3C2 = $44 :  P3C3 = $49

  lda #$42
  sta P3C1
  lda #$44
  sta P3C2
  lda #$49
  sta P3C3
.
 ;;line 149;; 

.L096 ;;line 150;;  rem ** Gollum's colors

.L097 ;;line 151;;  P4C1 = $c4 :  P4C2 = $f8 :  P4C3 = $0A

  lda #$c4
  sta P4C1
  lda #$f8
  sta P4C2
  lda #$0A
  sta P4C3
.
 ;;line 152;; 

.L098 ;;line 153;;  rem ** start the music!

.L099 ;;line 154;;  playrmt enigmapt2

  lda #0
  sta rasterpause
  ldx #<enigmapt2
  ldy #>enigmapt2
  jsr RASTERMUSICTRACKER+0 ; init: returns instrument speed
  sta rmt_ispeed
  lda #1
  sta rasterpause
.
 ;;line 155;; 

.main
 ;;line 156;; main

.
 ;;line 157;; 

.L0100 ;;line 158;;  asm

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

.L0101 ;;line 172;;  playrmt enigmapt2

  lda #0
  sta rasterpause
  ldx #<enigmapt2
  ldy #>enigmapt2
  jsr RASTERMUSICTRACKER+0 ; init: returns instrument speed
  sta rmt_ispeed
  lda #1
  sta rasterpause
.skipresetsong
 ;;line 173;; skipresetsong

.
 ;;line 174;; 

.L0102 ;;line 175;;  tempanim =  ( framecounter / 4 )  & 3

; complex statement detected
  lda framecounter
  lsr
  lsr
	AND #3
  sta tempanim
.
 ;;line 176;; 

.L0103 ;;line 177;;  rem ** Without double-buffering, the 7800 works best if we split up the

.L0104 ;;line 178;;  rem ** game logic from the plot commands. This isn't needed when double 

.L0105 ;;line 179;;  rem ** buffering is used.

.
 ;;line 180;; 

.L0106 ;;line 181;;  restorescreen

 jsr restorescreen
.
 ;;line 182;; 

.L0107 ;;line 183;;  palette = 0

  lda #0
  sta palette
.
 ;;line 184;; 

.L0108 ;;line 185;;  rem ** update each ring position, and perform border bounces...

.L0109 ;;line 186;;  for z = 0 to 85

  lda #0
  sta z
.L0109forz
.L0110 ;;line 187;;  tempplayerx = playerx[z] + playerdx[z]

	LDX z
  lda playerx,x
	LDX z
	CLC
	ADC playerdx,x
  sta tempplayerx
.L0111 ;;line 188;;  tempplayery = playery[z] + playerdy[z]

	LDX z
  lda playery,x
	LDX z
	CLC
	ADC playerdy,x
  sta tempplayery
.L0112 ;;line 189;;  if tempplayerx < 1 then playerdx[z] = 1 : goto skipx

  lda tempplayerx
  cmp #1
  bcs .skipL0112
.condpart2
  lda #1
	LDX z
  sta playerdx,x
  jmp .skipx

.skipL0112
.L0113 ;;line 190;;  if tempplayerx > 149 then playerdx[z] =  - 1

  lda #149
  cmp tempplayerx
  bcs .skipL0113
.condpart3
  lda #255
	LDX z
  sta playerdx,x
.skipL0113
.skipx
 ;;line 191;; skipx

.L0114 ;;line 192;;  if tempplayery < 8 then playerdy[z] = 1 : goto skipy

  lda tempplayery
  cmp #8
  bcs .skipL0114
.condpart4
  lda #1
	LDX z
  sta playerdy,x
  jmp .skipy

.skipL0114
.L0115 ;;line 193;;  if tempplayery > 193 then playerdy[z] =  - 1

  lda #193
  cmp tempplayery
  bcs .skipL0115
.condpart5
  lda #255
	LDX z
  sta playerdy,x
.skipL0115
.skipy
 ;;line 194;; skipy

.L0116 ;;line 195;;  playerx[z] = tempplayerx

  lda tempplayerx
	LDX z
  sta playerx,x
.L0117 ;;line 196;;  playery[z] = tempplayery

  lda tempplayery
	LDX z
  sta playery,x
.
 ;;line 197;; 

.L0118 ;;line 198;;  palette =  ( palette + 32 )  & 127

; complex statement detected
  lda palette
	CLC
	ADC #32
	AND #127
  sta palette
.L0119 ;;line 199;;  tempanim =  ( tempanim + 1 )  & 3

; complex statement detected
  lda tempanim
	CLC
	ADC #1
	AND #3
  sta tempanim
.
 ;;line 200;; 

.L0120 ;;line 201;;  PLOTSPRITE4 ring1 palette tempplayerx tempplayery tempanim

 if ring1_width > 16
 echo "*** ERROR: PLOTSPRITE encountered sprite wider than 16 bytes. (ring1)"
 echo "*** PLOTSPRITE/PLOTSPRITE4 is limited to sprites 16 bytes wide or less."
 ERR
 endif
MACARG2CONST SET 0
MACARG3CONST SET 0
MACARG4CONST SET 0
MACARG5CONST SET 0
 PLOTSPRITE4 ring1,palette,tempplayerx,tempplayery,tempanim
.
 ;;line 202;; 

.L0121 ;;line 203;;  next

  lda z
  cmp #85
  inc z
 if ((* - .L0109forz) < 127) && ((* - .L0109forz) > -128)
  bcc .L0109forz
 else
  bcs .1skipL0109forz
  jmp .L0109forz
.1skipL0109forz
 endif
.
 ;;line 204;; 

.L0122 ;;line 205;;  doublebuffer flip

  jsr flipdisplaybuffer
.L0123 ;;line 206;;  goto main

  jmp .main

.
 ;;line 207;; 

.L0124 ;;line 208;;  rem ** 320A mode at the top of the screen for text, and color it line-by-line

.topscreenroutine
 ;;line 209;; topscreenroutine

.L0125 ;;line 210;;  displaymode 320A

    lda #%01000011 ;Enable DMA, mode=160x2/160x4
    sta CTRL

    sta sCTRL

.L0126 ;;line 211;;  WSYNC = 0

  lda #0
  sta WSYNC
.L0127 ;;line 212;;  P5C2 = $45

  lda #$45
  sta P5C2
.L0128 ;;line 213;;  WSYNC = 0

  lda #0
  sta WSYNC
.L0129 ;;line 214;;  P5C2 = $46

  lda #$46
  sta P5C2
.L0130 ;;line 215;;  WSYNC = 0

  lda #0
  sta WSYNC
.L0131 ;;line 216;;  P5C2 = $47

  lda #$47
  sta P5C2
.L0132 ;;line 217;;  WSYNC = 0

  lda #0
  sta WSYNC
.L0133 ;;line 218;;  P5C2 = $48

  lda #$48
  sta P5C2
.L0134 ;;line 219;;  WSYNC = 0

  lda #0
  sta WSYNC
.L0135 ;;line 220;;  P5C2 = $48

  lda #$48
  sta P5C2
.L0136 ;;line 221;;  WSYNC = 0

  lda #0
  sta WSYNC
.L0137 ;;line 222;;  P5C2 = $47

  lda #$47
  sta P5C2
.L0138 ;;line 223;;  WSYNC = 0

  lda #0
  sta WSYNC
.L0139 ;;line 224;;  P5C2 = $46

  lda #$46
  sta P5C2
.L0140 ;;line 225;;  WSYNC = 0

  lda #0
  sta WSYNC
.L0141 ;;line 226;;  P5C2 = $45

  lda #$45
  sta P5C2
.L0142 ;;line 227;;  WSYNC = 0

  lda #0
  sta WSYNC
.L0143 ;;line 228;;  WSYNC = 0

  lda #0
  sta WSYNC
.L0144 ;;line 229;;  displaymode 160A

    lda #%01000000 ;Enable DMA, mode=160x2/160x4
    sta CTRL

    sta sCTRL

.L0145 ;;line 230;;  asm



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

.L0146 ;;line 283;;  return

  tsx
  lda $102,x
  beq bankswitchret2
  rts
bankswitchret2
  jmp BS_return
.
 ;;line 284;; 

.L0147 ;;line 285;;  asm

offset1

  .byte 0,255,254,253

offset2

  .byte 80,79,78,77

DMAHOLEEND0 SET .
 echo "  ","  ","  ","  ",[(256*WZONEHEIGHT)-(DMAHOLEEND0 - DMAHOLESTART0)]d , "bytes of ROM space left in DMA hole 0."
 if ((256*WZONEHEIGHT)-(DMAHOLEEND0 - DMAHOLESTART0)) < 0
SPACEOVERFLOW SET (SPACEOVERFLOW+1)
 endif

 ORG $26000,0  ; *************

 RORG $E000 ; *************

golum06 = $E000

golum06
       HEX 11100596afffabbaaa99665400045000444542914444011aeaeaaaa510166451
       HEX 425fd6e000000000
golum07 = $E028

golum07
       HEX 1504259aa66aebaa9954145450000000044545100166ee941666654101954165
       HEX fbf0000000000000
golum08 = $E050

golum08
       HEX 0000559aaa9aa69a5500001111104000000015565140001e54440101104557c2
       HEX 0000000000000000
golum09 = $E078

golum09
       HEX 10591599999aa99540055450040414505000004551100055a955aafffb7f19a4
       HEX 0029500000000000
golum10 = $E0A0

golum10
       HEX 5141559999aaaa990111111111101000000566aa800001552fd1159abbff2a54
       HEX 6900000000000000
golum11 = $E0C8

golum11
       HEX 000691551aaaaaaa800000000000000000000000444400000001165abbfe4000
       HEX 1000000000000000

 ORG $26100,0  ; *************

 RORG $E100 ; *************

;golum06
       HEX 054042a5bffebaaaaa65599500016000105911655511001bbaaaaa54401541b0
       HEX 5017d6e440000000
;golum07
       HEX 54402966aaaaaebaa95445450440000041055964059aab5519aaa95006650591
       HEX eff0000000000000
;golum08
       HEX 010156a666666aaaa540044455440000001044558041047a51104000001155d1
       HEX 0000000000000000
;golum09
       HEX 001556aa666666650015511100414451400001115444016ba44a95ffef7d56a5
       HEX 552a500000000000
;golum10
       HEX 15514666aa6aaa680445544404000040004459aa400005995be4566aafbf6a95
       HEX 6900000000000000
;golum11
       HEX 0006a46666aaaaaa8000001000000000000101111111000000105566abfe4500
       HEX 4410003f3f0c0000

 ORG $26200,0  ; *************

 RORG $E200 ; *************

;golum06
       HEX 01001196afffeeea9a996a540001a000444545965144400afaaaaa91005406b4
       HEX 541fc6b401000000
;golum07
       HEX 1501255aa9aaaaeaa65115555000000005494510156bba9426aaba6015951546
       HEX fff8000000000000
;golum08
       HEX 0000759a99a9a9a9950041114110000000001555510401f954441011104456b2
       HEX 0040000000000000
;golum09
       HEX 0015599999999999400554440004104440000045551005ae9003517ffb7d16f0
       HEX 5569540000000000
;golum10
       HEX 150515a999aaa99900551511110401040011166a040041555bf9599abbff6a94
       HEX 6900000000000000
;golum11
       HEX 000291599aaaaaaa800001004100000000000444455444101001159abafe5544
       HEX 550400330c0c0000

 ORG $26300,0  ; *************

 RORG $E300 ; *************

;golum06
       HEX 00004165afbfbaaaaaa659950006a1001015116565111006baaeaa94005046a8
       HEX 201782b400100000
;golum07
       HEX 4440196aaa9abbaaa95456550100000011051960459a6e506aaaaa6046a44056
       HEX 2afc000000000000
;golum08
       HEX 00115666aa666aaa554004551440000000004956450506e551110104401015ae
       HEX 0000000000000000
;golum09
       HEX 00155666a6666665401151000011411100000115944016b90000805ffa7c56f1
       HEX a52a544000000004
;golum10
       HEX 06514566669aaaa40115514444404000010445990010046546ff6666eeff6aa5
       HEX 6900000000000000
;golum11
       HEX 1006a46a69aaaaa9800010041000000000001111145511444100556aeafe5551
       HEX 511000030c0c0000

 ORG $26400,0  ; *************

 RORG $E400 ; *************

;golum06
       HEX 000150a6bbffefaaa9a966a40006b10044454559555444419aaaaa5101418328
       HEX 641791b910000000
;golum07
       HEX 1144295abaaaaaaaaa9515544410000005194510156a69546aeaba601aa10141
       HEX 99fc000000000000
;golum08
       HEX 0500559a999aaaa6a5401144511000000010155500040ba9444000011040056b
       HEX 0040000000000000
;golum09
       HEX 001555a99999999940044440004410440000014565005bd00014701fff7d16f1
       HEX e66a554000000004
;golum10
       HEX 0645199a99aaa9990455551110001000000011681101115456ff999abbff6a94
       HEX 6900000000000000
;golum11
       HEX 000191599aaaaaaa401100110410000000004444515155111000159abaff5555
       HEX 5504003f0c0c0000

 ORG $26500,0  ; *************

 RORG $E500 ; *************

;golum06
       HEX 01054465affbfebbaaaa9995001ab2001059145595451114666eaa8401104020
       HEX 247790b604440000
;golum07
       HEX 04001a6ae9abaebaa5544555100040004109096040aeba50abbaaa205694146b
       HEX e9bc000000000000
;golum08
       HEX 000176a666a9a66a95500455444400000000595944041ea651044445441011af
       HEX 4000000000000000
;golum09
       HEX 041556a66a666a6550011000001541110000051594416a8000062417fe7c15b5
       HEX f67a695000000001
;golum10
       HEX 055145a6666a9a640045544444410104000444544444445516beea6bafbf5aa4
       HEX 5900000000000000
;golum11
       HEX 00066466a6aaaaa9400004440000000000041115559554444400566baeff5954
       HEX 551000300c0c0001

 ORG $26600,0  ; *************

 RORG $E600 ; *************

;golum06
       HEX 00015579abffbbeabaae6a64001ae611014551455654444559aaaa500001002c
       HEX 6477d0ab41004000
;golum07
       HEX 0041195abaaaaaeaaa5559554044000005194611116ae9406eeaaa511a9056ff
       HEX bdbf400000000000
;golum08
       HEX 0004559a999aaaaa65401111111000000041555600046e69440000111044046b
       HEX d040000000000000
;golum09
       HEX 0005599a99999999401040004411104440000146a501b90400020805fffc11a4
       HEX fa69695000000001
;golum10
       HEX 015516999a99a9a80155551101100410044111100111111045beba9abbff5a94
       HEX 1500000000000004
;golum11
       HEX 440191599aaaaaaa400040111101000000010555565545111104159abaff5a55
       HEX 554000330c0c0001

 ORG $26700,0  ; *************

 RORG $E700 ; *************

;golum06
       HEX 400545696ffefeaeaaaa9995006bb1110059151515555111666baa8400004308
       HEX 1477e06780400000
;golum07
       HEX 00045a5aeaaabaaaa99515910000000015090950455aaa51abfaaa106a505002
       HEX 21be500000000000
;golum08
       HEX 10406666a666aaaa9550445544400000000059951001baa5110100445410015b
       HEX f000000000000000
;golum09
       HEX 00145666666666a65001040400544110000005159445a00404014101fffc0065
       HEX aa555a5400000000
;golum10
       HEX 0191566a666aa6640415515444040000000044404444444401aebe6aeebf56a4
       HEX 1510000000000005
;golum11
       HEX 0006556669aaaaa94004044040100000001015999999554444004566eeff6a55
       HEX 5550003f3f3f0000

 ORG $26800,0  ; *************

 RORG $E800 ; *************

;golum06
       HEX 0011516aabffeefaebbaaaa4006ef5214165455555555445999aea5000000300
       HEX 1077f016d1100000
;golum07
       HEX 00111956ba6aabae9a5555554010400005194a41156bb941effaaa411951443f
       HEX f9ff900000000000
;golum08
       HEX 0100559aaaa9aaa69540114511000000040155590005aa99440004111044006a
       HEX f840000000000000
;golum09
       HEX 000555a9a9a99999540440000115004110000446a506d00000000001bffc1014
       HEX 6955595100000000
;golum10
       HEX 0195199999aa6a9800555511111111040001001011551111056fbe9abbbf56a4
       HEX 1510000000000001
;golum11
       HEX 000191999aaaaa9a004111110400000000015666666555555110159abaff6a55
       HEX 5500000000000000

 ORG $26900,0  ; *************

 RORG $E900 ; *************

;golum06
       HEX 0004415d6bffbbbbbaaeaa6501afe0110055145151154555666baa8000000000
       HEX 10d7f012d0410000
;golum07
       HEX 11044a5aaaaeeaaaa96466650000000015090950459aee51abfaaa80654101aa
       HEX befe940000000000
;golum08
       HEX 00006666a66aaaaa65504555444400000040595440069aa5100000555111015b
       HEX fc40000000000000
;golum09
       HEX 104456a666666a6650000040445141100000051594168000040000006bfc1005
       HEX 5515555444000000
;golum10
       HEX 006156a66666a66501555444444004000110000105554444166bbfa6afbf15a4
       HEX 0510000000000000
;golum11
       HEX 4001456666aaaaa9400444444104000000445999aa9941a95400466aaeff6a54
       HEX 6500000000000000

 ORG $26A00,0  ; *************

 RORG $EA00 ; *************

;golum06
       HEX 1101015a6afbeeeeeeaaea94006bf6144164555514411159999aea5000000000
       HEX 1157f006e1001000
;golum07
       HEX 00111a56bbaaaeeaaa9555544041000044154a401166a942affaaa5199450556
       HEX afffa50000000000
;golum08
       HEX 0040159a999aaeaa99501454510000000001556400166869400001115054445a
       HEX fe40000000000000
;golum09
       HEX 0001599a9a99a6a9940100041155000004000456550700000001540055fd1011
       HEX 5411115100100004
;golum10
       HEX 009515a99999999800455511110411100000000015551110599abfdabbbf6564
       HEX 0514000000000000
;golum11
       HEX 040191aa99aaaaaa0041010110000000000156aaaaa4006f9541159ababf5655
       HEX 5500000000000000

 ORG $26B00,0  ; *************

 RORG $EB00 ; *************

;golum06
       HEX 0444451e5bffbbbbbaeeaea501afe31400951565510444456567a94000000000
       HEX 0157f001b4110000
;golum07
       HEX 1004465aaeaaaaaaaa5559950004100014190950455ab907abfaaa956514156a
       HEX 9bffd90000000000
;golum08
       HEX 04006666a56aaaea6544454544100000010059540059a9a5005000445115015b
       HEX bf40000000000000
;golum09
       HEX 00045666666a6a66510000004514004440000146941b040000155540155f1001
       HEX 1044044004000000
;golum10
       HEX 0065666666a666650155514440104400000000004554440016abafeaeebf6954
       HEX 0124000000000000
;golum11
       HEX 1100456666aaaa99000044440440000000105aaaaa90001bf5044566eebf5555
       HEX 6500000000000000

 ORG $26C00,0  ; *************

 RORG $EC00 ; *************

;golum06
       HEX 1111004aaafeeeeeeeabbb9401afb3850154459944000111555aea4000000000
       HEX 0517f001ad000000
;golum07
       HEX 01010696bbbaabae6a9555544000400054154a400056a94aafeaaa65945056ff
       HEX d6ff9a4000000000
;golum08
       HEX 1104159aa6a6baaa995015551100000010015515001a6a99415400115054445b
       HEX ff40000000000000
;golum09
       HEX 0001559999999a99940004401555000000001056501c4500014411110057d001
       HEX 0400000410400400
;golum10
       HEX 00551599999aaa940015555511001010000000001155100005baaff6bbbf2954
       HEX 0115000000000000
;golum11
       HEX 04415599a9aaaaaa011111111001000000016aaaaa400006f941159abbbf5554
       HEX 5900000000000000

 ORG $26D00,0  ; *************

 RORG $ED00 ; *************

;golum06
       HEX 0441500b9bfbbbfffbbaeea502afe3c741911166500010044016e90000000800
       HEX 0457f4005d000000
;golum07
       HEX 0440065abeebbaaaaaa5666500111000145909510005a91a9bbaaa9555406fea
       HEX b5cfda4000000000
;golum08
       HEX 44402666a96aaba6a554445444010000010159540169aea5015540044155012b
       HEX bfc0000000000000
;golum09
       HEX 010456a6aa66a9a655000004444440101000055594584400151040040355f401
       HEX 0000000001010000
;golum10
       HEX 006556aa6666666500555444444044401000000144444400006faffaafbf6954
       HEX 0115000000000000
;golum11
       HEX 4010456666aaaaa9004444404444000000446aaaa9000041be10466bafbf5955
       HEX 6500000000000004

 ORG $26E00,0  ; *************

 RORG $EE00 ; *************

;golum06
       HEX 111544479abefffffeefbba505afb3e642545599411100000006e44000001000
       HEX 0117f4001b100000
;golum07
       HEX 11100696affaaaeaa695555400001000444546444401691aeaeaaa591101be95
       HEX 59ef9a8000000000
;golum08
       HEX 15101599a6aaaeaa6950154511100000044445110066aa99066650014055455a
       HEX bfc0000000000000
;golum09
       HEX 0011599a99a96a69540001111551000000001156502041019444040040557c01
       HEX 0040000000041000
;golum10
       HEX 0059199999a9999940155511111110504000004451110000155bebfdabbf2954
       HEX 0015400000000000
;golum11
       HEX 504155a99aaaaa99041111111100000000016aaaa4000110af41159abbff1654
       HEX 5900000000000001

 ORG $26F00,0  ; *************

 RORG $EF00 ; *************

;golum06
       HEX 04455002eafbefefbbbaeee402bff7f1c5915665144400000011500000444005
       HEX 001ff4000b800000
;golum07
       HEX 04410296bfbeeaaaaaa5599500005000105906551100151a9baaaa954405a940
       HEX 09cfda9000000000
;golum08
       HEX 55402966a99aaaeaa65445554400000011015954055aba650599950145650069
       HEX bfd0000000000000
;golum09
       HEX 100156666666aaa6950010444544000000000455405004069511101001555f01
       HEX 0000000000000000
;golum10
       HEX 00155666a6666665005551444000444510000011544440055556ebff6ebf6955
       HEX 0025400000000000
;golum11
       HEX 4410496a666aa9a9004444444001000001115aaaa00000656fd45566eeff6995
       HEX 6900000000000001
 if SPACEOVERFLOW > 0
  echo ""
  echo "######## ERROR: space overflow detected in",[SPACEOVERFLOW]d,"areas."
  echo "######## look above for areas with negative ROM space left."
 endif
 

