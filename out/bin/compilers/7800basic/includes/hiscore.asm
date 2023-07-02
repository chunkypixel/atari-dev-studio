     ; Provided under the CC0 license. See the included LICENSE.txt for details.

     ifconst HSSUPPORT

         ifconst BANKSETROM
             ifconst isBANKSETBANK
HSCHARSHERE                 = 1
             endif
         else ; !BANKSETROM so embed the character strings
HSCHARSHERE             = 1
         endif

         ifnconst isBANKSETBANK
hiscorestart

detectatarivoxeeprom
hiscoremodulestart
             ; do a test to see if atarivox eeprom can be accessed, and save results
             jsr AVoxDetect
             eor #$ff ; invert for easy 7800basic if...then logic
             sta avoxdetected
             lda #$0
             sta SWACNT
             lda avoxdetected
             rts

detecthsc
             ; check for the HSC ROM signature...
             lda XCTRL1s 
             ora #%00001100
             sta XCTRL1s
             sta XCTRL1

             lda $3900
             eor #$C6
             bne detecthscfail
             lda $3904
             eor #$FE
             bne detecthscfail

             ; check if it's initialized...
             ldy #0
             lda #$ff
checkhscinit
             and $1000,y
             dey
             bpl checkhscinit
             cmp #$ff
             bne hscisalreadyinit
             ; if we're here, we need to do a minimal HSC init...
             ldy #$28
hscinitloop1
             lda hscheader,y
             sta $1000,y
             dey
             bpl hscinitloop1
             ldy #$89
             lda #$7F
hscinitloop2
             sta $10B3,y
             dey
             cpy #$ff
             bne hscinitloop2
hscisalreadyinit
             lda #$ff
             rts
hscheader
             .byte $00,$00,$68,$83,$AA,$55,$9C,$FF,$07,$12,$02,$1F,$00,$00,$00,$00
             .byte $00,$00,$00,$00,$00,$00,$00,$00,$00,$00,$00,$00,$00,$00,$00,$00
             .byte $00,$00,$00,$00,$00,$00,$00,$00,$03
detecthscfail
             lda XCTRL1s 
             and #%11110111
             sta XCTRL1s 
             lda #0
             rts
         endif ; isBANKSETBANK

         ifnconst hiscorefont
             echo ""
             echo "WARNING: High score support is enabled, but the hiscorefont.png was"
             echo " NOT imported with incgraphic. The high score display code"
             echo " has been omitted from this build."
             echo ""
         else ; hiscorefont
             ifnconst isBANKSETBANK
hscdrawscreen

                 ; we use 20 lines on a 24 line display
                 ; HSSCOREY to dynamically centers based on 
                 ;HSSCOREY = 0
HSSCOREY                 = ((WZONECOUNT*WZONEHEIGHT/8)-22)/2
HSCURSORY                 = ((HSSCOREY/(WZONEHEIGHT/8))*WZONEHEIGHT)

                 ifconst HSSCORESIZE
SCORESIZE                     = HSSCORESIZE
                 else
SCORESIZE                     = 6
                 endif

                 ;save shadow registers for later return...
                 lda sCTRL
                 sta ssCTRL
                 lda sCHARBASE
                 sta ssCHARBASE
                 lda #$60
                 sta charactermode
                 jsr drawwait
                 jsr blacken320colors
                 jsr clearscreen

                 ;set the character base to the HSC font
                 lda #>hiscorefont
                 sta CHARBASE
                 sta sCHARBASE
                 lda #%01000011 ;Enable DMA, mode=320A
                 sta CTRL
                 sta sCTRL

                 lda #60
                 sta hsjoydebounce

                 lda #0
                 sta hscursorx
                 sta framecounter
                 ifnconst HSCOLORCHASESTART
                     lda #$8D ; default is blue. why not?
                 else
                     lda #HSCOLORCHASESTART
                 endif
                 sta hscolorchaseindex

                 lda #$0F
                 sta P0C2 ; base text is white

                 jsr hschasecolors
                 ; ** plot all of the initials
                 lda #<HSRAMInitials
                 sta temp1 ; charmaplo
                 lda #>HSRAMInitials
                 sta temp2 ; charmaphi
                 lda #32+29 ; palette=0-29 | 32-(width=3)
                 sta temp3 ; palette/width
                 lda #104
                 sta temp4 ; X
                 lda #((HSSCOREY+6)/(WZONEHEIGHT/8))
                 sta temp5 ; Y
plothsinitialsloop
                 jsr plotcharacters
                 clc
                 lda temp3
                 adc #32
                 sta temp3
                 inc temp5
                 if WZONEHEIGHT = 8
                     inc temp5
                 endif
                 clc
                 lda #3
                 adc temp1
                 sta temp1
                 cmp #(<(HSRAMInitials+15))
                 bcc plothsinitialsloop

                 ifconst HSGAMENAMELEN
                     ;plot the game name...
                     lda #<HSGAMENAMEtable
                     sta temp1 ; charmaplo
                     lda #>HSGAMENAMEtable
                     sta temp2 ; charmaphi
                     lda #(32-HSGAMENAMELEN) ; palette=0*29 | 32-(width=3)
                     sta temp3 ; palette/width
                     lda #(80-(HSGAMENAMELEN*2))
                     sta temp4 ; X
                     lda #((HSSCOREY+0)/(WZONEHEIGHT/8))
                     sta temp5 ; Y
                     jsr plotcharacters
                 endif ; HSGAMENAMELEN

                 ;plot "difficulty"...
                 ldy gamedifficulty
                 ifnconst HSNOLEVELNAMES
                     lda highscoredifficultytextlo,y
                     sta temp1
                     lda highscoredifficultytexthi,y
                     sta temp2
                     sec
                     lda #32
                     sbc highscoredifficultytextlen,y
                     sta temp3 ; palette/width
                     sec
                     lda #40
                     sbc highscoredifficultytextlen,y
                     asl
                     sta temp4 ; X
                 else
                     lda #<HSHIGHSCOREStext
                     sta temp1 ; charmaplo
                     lda #>HSHIGHSCOREStext
                     sta temp2 ; charmaphi
                     lda #(32-11) ; palette=0*29 | 32-(width=3)
                     sta temp3 ; palette/width
                     lda #(80-(11*2))
                     sta temp4 ; X
                 endif ; HSNOLEVELNAMES

                 lda #((HSSCOREY+2)/(WZONEHEIGHT/8))
                 sta temp5 ; Y
                 jsr plotcharacters
                 ldy hsdisplaymode ; 0=attact mode, 1=player eval, 2=player 1 eval, 3=player 2 player eval, 4=player 2 player evel (joy1)
                 bne carronwithscoreevaluation
                 jmp donoscoreevaluation
carronwithscoreevaluation
                 dey
                 lda highscorelabeltextlo,y
                 sta temp1
                 lda highscorelabeltexthi,y
                 sta temp2
                 sec
                 lda #(32-15) ; palette=0*29 | 32-(width=3)
                 sta temp3 ; palette/width
                 lda highscorelabeladjust1,y
                 sta temp4 ; X
                 lda #((HSSCOREY+18)/(WZONEHEIGHT/8))
                 sta temp5 ; Y
                 jsr plotcharacters

                 ldy hsdisplaymode ; 0=attact mode, 1=player eval, 2=player 1 eval, 3=player 2 player eval, 4=player 2 player evel (joy1)
                 dey
                 ;plot the current player score...
                 lda #(32-SCORESIZE) ; palette=0*32 
                 sta temp3 ; palette/width
                 lda highscorelabeladjust2,y
                 sta temp4 ; X
                 lda #((HSSCOREY+18)/(WZONEHEIGHT/8))
                 sta temp5 ; Y

                 lda scorevarlo,y
                 sta temp7 ; score variable lo
                 lda scorevarhi,y
                 sta temp8 ; score variable hi

                 lda #(hiscorefont_mode | %01100000) ; charactermode 
                 sta temp9

                 lda #<(hiscorefont+33) ; +33 to get to '0' character
                 sta temp1 ; charmaplo
                 lda #>(hiscorefont+33)
                 sta temp2 ; charmaphi
                 lda #SCORESIZE
                 sta temp6
                 ifnconst DOUBLEWIDE
                     jsr plotvalue
                 else
                     jsr plotvaluedw
                 endif

USED_PLOTVALUE = 1 ; ensure that plotvalue gets compiled in

                 ifconst HSGAMERANKS

                     ldx #$ff ; start at 0 after the inx...
comparescore2rankloop
                     inx
                     ldy #0
                     lda rankvalue_0,x
                     cmp (temp7),y
                     bcc score2rankloopdone
                     bne comparescore2rankloop
                     iny
                     lda rankvalue_1,x
                     cmp (temp7),y
                     bcc score2rankloopdone
                     bne comparescore2rankloop
                     iny
                     lda (temp7),y
                     cmp rankvalue_2,x
                     bcs score2rankloopdone
                     jmp comparescore2rankloop
score2rankloopdone
                     stx hsnewscorerank

                     lda ranklabello,x
                     sta temp1
                     lda ranklabelhi,x
                     sta temp2
                     sec
                     lda #32 ; palette=0*29 | 32-(width=3)
                     sbc ranklabellengths,x
                     sta temp3 ; palette/width
                     sec
                     lda #(40+6)
                     sbc ranklabellengths,x
                     asl
                     sta temp4 ; X
                     lda #((HSSCOREY+20)/(WZONEHEIGHT/8))
                     sta temp5 ; Y
                     jsr plotcharacters

                     ldx hsnewscorerank

                     lda #<highscoreranklabel
                     sta temp1
                     lda #>highscoreranklabel
                     sta temp2

                     lda #(32-5) ; palette=0*29 | 32-(width=3)
                     sta temp3 ; palette/width
                     lda #(40-6)
                     sec
                     sbc ranklabellengths,x
                     asl
                     sta temp4 ; X
                     lda #((HSSCOREY+20)/(WZONEHEIGHT/8))
                     sta temp5 ; Y
                     jsr plotcharacters
                 endif ; HSGAMERANKS


                 ; ** which line did this player beat?
                 lda #$ff
                 sta hsnewscoreline
                 ldx #$fd 
comparescoreadd2x
                 inx
comparescoreadd1x
                 inx
comparescore2lineloop
                 inc hsnewscoreline
                 inx ; initialrun, x=0
                 cpx #15
                 beq nohighscoreforyou
                 ldy #0
                 lda HSRAMScores,x
                 cmp (temp7),y ; first score digit
                 bcc score2lineloopdonedel1x
                 bne comparescoreadd2x
                 iny
                 inx
                 lda HSRAMScores,x
                 cmp (temp7),y
                 bcc score2lineloopdonedel2x
                 bne comparescoreadd1x
                 iny
                 inx
                 lda (temp7),y
                 cmp HSRAMScores,x
                 bcs score2lineloopdonedel3x
                 jmp comparescore2lineloop
nohighscoreforyou
                 lda #$ff
                 sta hsnewscoreline
                 sta countdownseconds
                 jmp donoscoreevaluation
score2lineloopdonedel3x
                 dex
score2lineloopdonedel2x
                 dex
score2lineloopdonedel1x
                 dex

                 ; 0 1 2
                 ; 3 4 5
                 ; 6 7 8
                 ; 9 0 1
                 ; 2 3 4

                 stx temp9
                 cpx #11
                 beq postsortscoresuploop
                 ldx #11
sortscoresuploop
                 lda HSRAMScores,x
                 sta HSRAMScores+3,x
                 lda HSRAMInitials,x
                 sta HSRAMInitials+3,x
                 dex
                 cpx temp9
                 bne sortscoresuploop
postsortscoresuploop

                 ;stick the score and cleared initials in the slot...
                 inx
                 ldy #0 
                 sty hsinitialhold
                 lda (temp7),y
                 sta HSRAMScores,x
                 iny
                 lda (temp7),y
                 sta HSRAMScores+1,x
                 iny
                 lda (temp7),y
                 sta HSRAMScores+2,x
                 lda #0
                 sta HSRAMInitials,x
                 lda #29
                 sta HSRAMInitials+1,x
                 sta HSRAMInitials+2,x

                 stx hsinitialpos

                 ifconst vox_highscore
                     lda <#vox_highscore
                     sta speech_addr
                     lda >#vox_highscore
                     sta speech_addr+1
                 endif ; vox_highscore
                 ifconst sfx_highscore
                     lda <#sfx_highscore
                     sta temp1
                     lda >#sfx_highscore
                     sta temp2
                     lda #0
                     sta temp3
                     jsr schedulesfx
                 endif ; sfx_highscore
                 ifconst songdatastart_song_highscore
                     lda #<songchanneltable_song_highscore
                     sta songpointerlo
                     lda #>songchanneltable_song_highscore
                     sta songpointerhi
                     lda #73
                     sta songtempo
                     jsr setsongchannels
                 endif ; songdatastart_song_highscore


donoscoreevaluation

                 lda #(32+(32-SCORESIZE)) ; palette=0*32 | 32-(width=6)
                 sta temp3 ; palette/width
                 lda #(72+(4*(6-SCORESIZE)))
                 sta temp4 ; X
                 lda #((HSSCOREY+6)/(WZONEHEIGHT/8))
                 sta temp5 ; Y
                 lda #<HSRAMScores
                 sta temp7 ; score variable lo
                 lda #>HSRAMScores
                 sta temp8 ; score variable hi
                 lda #(hiscorefont_mode | %01100000) ; charactermode 
                 sta temp9
plothsscoresloop
                 lda #<(hiscorefont+33) ; +33 to get to '0' character
                 sta temp1 ; charmaplo
                 lda #>(hiscorefont+33)
                 sta temp2 ; charmaphi
                 lda #6
                 sta temp6
                 ifnconst DOUBLEWIDE
                     jsr plotvalue
                 else
                     jsr plotvaluedw
                 endif
                 clc
                 lda temp3
                 adc #32
                 sta temp3
                 inc temp5
                 if WZONEHEIGHT = 8
                     inc temp5
                 endif
                 clc
                 lda #3
                 adc temp7
                 sta temp7
                 cmp #(<(HSRAMScores+15))
                 bcc plothsscoresloop
plothsindex
                 lda #32+31 ; palette=0*32 | 32-(width=1)
                 sta temp3 ; palette/width
                 lda #44
                 sta temp4 ; X
                 lda #((HSSCOREY+6)/(WZONEHEIGHT/8))
                 sta temp5 ; Y
                 lda #<hsgameslotnumbers
                 sta temp7 ; score variable lo
                 lda #>hsgameslotnumbers
                 sta temp8 ; score variable hi
                 lda #(hiscorefont_mode | %01100000) ; charactermode 
                 sta temp9
plothsindexloop
                 lda #<(hiscorefont+33)
                 sta temp1 ; charmaplo
                 lda #>(hiscorefont+33)
                 sta temp2 ; charmaphi
                 lda #1
                 sta temp6 ; number of characters
                 ifnconst DOUBLEWIDE
                     jsr plotvalue
                 else
                     jsr plotvaluedw
                 endif
                 clc
                 lda temp3
                 adc #32
                 sta temp3
                 inc temp5
                 if WZONEHEIGHT = 8
                     inc temp5
                 endif
                 inc temp7
                 lda temp7
                 cmp #(<(hsgameslotnumbers+5))
                 bcc plothsindexloop

                 jsr savescreen
                 ifnconst HSSECONDS
                     lda #6
                 else
                     lda #HSSECONDS
                 endif

                 sta countdownseconds

keepdisplayinghs
                 jsr restorescreen

                 jsr setuphsinpt1

                 lda hsnewscoreline
                 bpl carryonkeepdisplayinghs
                 jmp skipenterscorecontrol
carryonkeepdisplayinghs


                 ifnconst HSSECONDS
                     lda #6
                 else
                     lda #HSSECONDS
                 endif

                 sta countdownseconds

                 ;plot the "cursor" initial sprite...
                 lda hsinitialhold

                 sta temp1
                 lda #>(hiscorefont+32)
                 sta temp2
                 lda #31 ; palette=0*32 | 32-(width=1)
                 sta temp3 ; palette/width
                 lda hscursorx
                 asl
                 asl
                 clc
                 adc #104
                 sta temp4 ; X
                 lda hsnewscoreline
                 asl
                 asl
                 asl
                 asl
                 adc #((3*16)+HSCURSORY)
                 sta temp5 ; Y
                 lda #%01000000
                 sta temp6
                 jsr plotsprite

                 ldx hscursorx
                 ldy hsdisplaymode
                 ifnconst .HSup
                     lda SWCHA
                     cpy #3
                     bne hsskipadjustjoystick1
                     asl
                     asl
                     asl
                     asl
hsskipadjustjoystick1
                     sta hsswcha
                 else ; there are user-defined routines!
                     jsr .HSdown
                     lda hsreturn ; b0
                     asl
                     pha
                     jsr .HSup
                     pla 
                     ora hsreturn 
                     asl 
                     asl 
                     asl 
                     asl 
                     eor #$FF 
                     sta hsswcha
                 endif
                 lda SWCHB
                 and #%00000010
                 bne hsskipselectswitch
                 lda #%00010000
                 sta hsswcha
                 bne hsdodebouncecheck
hsskipselectswitch
                 lda hsswcha
                 and #%00110000
                 cmp #%00110000
                 beq hsjoystickskipped
hsdodebouncecheck
                 lda hsjoydebounce
                 beq hsdontdebounce
                 jmp hspostjoystick
hsdontdebounce
                 ldx #1 ; small tick sound
                 jsr playhssfx
                 lda hsswcha
                 and #%00110000
                 ldx hscursorx
                 cmp #%00100000 ; check down
                 bne hsjoycheckup
                 ldy hsinitialhold
                 cpx #0
                 bne skipavoid31_1
                 cpy #0 ; if we're about to change to the <- char (#31) then double-decrement to skip over it
                 bne skipavoid31_1
                 dey
skipavoid31_1
                 dey
                 jmp hssetdebounce
hsjoycheckup
                 cmp #%00010000 ; check up
                 bne hsjoystickskipped
                 ldy hsinitialhold
                 cpx #0
                 bne skipavoid31_2
                 cpy #30 ; if we're about to change to the <- char (#31) then double-increment to skip over it
                 bne skipavoid31_2
                 iny
skipavoid31_2
                 iny
hssetdebounce
                 tya
                 and #31
                 sta hsinitialhold
                 lda #15
                 sta hsjoydebounce
                 bne hspostjoystick
hsjoystickskipped
                 ; check the fire button only when the stick isn't engaged
                 lda hsinpt1
                 bpl hsbuttonskipped
                 lda hsjoydebounce
                 bne hspostjoystick
hsfiredontdebounce
                 lda hsinitialhold
                 cmp #31
                 beq hsmovecursorback
                 inc hscursorx
                 inc hsinitialpos
                 lda hscursorx
                 cmp #3
                 bne skiphsentryisdone
                 lda #0
                 sta framecounter
                 lda #$ff
                 sta hsnewscoreline
                 dec hsinitialpos
                 bne skiphsentryisdone
hsmovecursorback
                 lda hscursorx
                 beq skiphsmovecursorback
                 lda #29
                 ldx hsinitialpos
                 sta HSRAMInitials,x
                 dec hsinitialpos
                 dec hscursorx
                 dex
                 lda HSRAMInitials,x
                 sta hsinitialhold
skiphsmovecursorback
skiphsentryisdone
                 ldx #0
                 jsr playhssfx
                 lda #20
                 sta hsjoydebounce
                 bne hspostjoystick

hsbuttonskipped
                 lda #0
                 sta hsjoydebounce
hspostjoystick

                 ldx hsinitialpos
                 lda hsinitialhold
                 sta HSRAMInitials,x

                 jmp skiphschasecolors

skipenterscorecontrol
                 jsr hschasecolors
                 jsr setuphsinpt1
                 lda hsjoydebounce
                 bne skiphschasecolors
                 lda hsinpt1
                 bmi returnfromhs
skiphschasecolors

                 jsr drawscreen

                 lda countdownseconds
                 beq returnfromhs
                 jmp keepdisplayinghs
returnfromhs

                 ifconst songdatastart_song_highscore
                     lda hsdisplaymode
                     beq skipclearHSCsong
                     lda #0
                     sta songtempo
skipclearHSCsong
                 endif
                 jsr drawwait
                 jsr clearscreen
                 lda #0
                 ldy #7
                 jsr blacken320colors
                 lda ssCTRL
                 sta sCTRL
                 lda ssCHARBASE
                 sta sCHARBASE
                 rts

setuphsinpt1
                 lda #$ff
                 sta hsinpt1
                 lda hsjoydebounce
                 beq skipdebounceadjust
                 dec hsjoydebounce
                 bne skipstorefirebuttonstatus
skipdebounceadjust
                 lda SWCHB
                 and #%00000001
                 bne hscheckresetover
                 lda #$ff
                 sta hsinpt1
                 rts
hscheckresetover
                 ifnconst .HSup
                     ldx hsdisplaymode
                     cpx #3
                     bne hsskipadjustjoyfire1
                     lda sINPT3
                     jmp hsskipadjustjoyfire1done
hsskipadjustjoyfire1
                     lda sINPT1
hsskipadjustjoyfire1done
                     sta hsinpt1
                 else ; there are user-defined routines!
                     jsr .HSselect
                     lda hsreturn
                     ror ; carry
                     ror ; b7
                     sta hsinpt1
                 endif .HSup
skipstorefirebuttonstatus
                 rts

blacken320colors
                 ldy #7
blacken320colorsloop
                 sta P0C2,y
                 dey
                 bpl blacken320colorsloop
                 rts

hschasecolors
                 lda framecounter
                 and #3
                 bne hschasecolorsreturn
                 inc hscolorchaseindex
                 lda hscolorchaseindex

                 sta P5C2
                 sbc #$02
                 sta P4C2
                 sbc #$02
                 sta P3C2
                 sbc #$02
                 sta P2C2
                 sbc #$02
                 sta P1C2
hschasecolorsreturn
                 rts

playhssfx
                 lda hssfx_lo,x
                 sta temp1
                 lda hssfx_hi,x
                 sta temp2
                 lda #0
                 sta temp3
                 jmp schedulesfx

hssfx_lo
                 .byte <sfx_hsletterpositionchange, <sfx_hslettertick
hssfx_hi
                 .byte >sfx_hsletterpositionchange, >sfx_hslettertick

sfx_hsletterpositionchange
                 .byte $10,$18,$00
                 .byte $02,$06,$08
                 .byte $02,$06,$04
                 .byte $00,$00,$00
sfx_hslettertick
                 .byte $10,$18,$00
                 .byte $00,$00,$0a
                 .byte $00,$00,$00

highscorelabeladjust1
                 .byte (80-(14*2)-(SCORESIZE*2)),(80-(16*2)-(SCORESIZE*2)),(80-(16*2)-(SCORESIZE*2)),(80-(16*2)-(SCORESIZE*2))
highscorelabeladjust2
                 .byte (80+(14*2)-(SCORESIZE*2)),(80+(16*2)-(SCORESIZE*2)),(80+(16*2)-(SCORESIZE*2)),(80+(16*2)-(SCORESIZE*2))

scorevarlo
                 .byte <(score0+((6-SCORESIZE)/2)),<(score0+((6-SCORESIZE)/2)),<(score1+((6-SCORESIZE)/2)),<(score1+((6-SCORESIZE)/2))
scorevarhi
                 .byte >(score0+((6-SCORESIZE)/2)),>(score0+((6-SCORESIZE)/2)),>(score1+((6-SCORESIZE)/2)),>(score1+((6-SCORESIZE)/2))

             endif ; !isBANKSETBANK

             ifnconst HSNOLEVELNAMES
                 ifnconst isBANKSETBANK
highscoredifficultytextlo
                     .byte <easylevelname, <mediumlevelname, <hardlevelname, <expertlevelname
highscoredifficultytexthi
                     .byte >easylevelname, >mediumlevelname, >hardlevelname, >expertlevelname
                 endif ; !isBANKSETBANK

                 ifnconst HSCUSTOMLEVELNAMES
                     ifnconst isBANKSETBANK
highscoredifficultytextlen
                         .byte 22, 30, 26, 24
                     endif ; !isBANKSETBANK

                     ifconst HSCHARSHERE

easylevelname
                         .byte $04,$00,$12,$18,$1d,$0b,$04,$15,$04,$0b,$1d,$07,$08,$06,$07,$1d,$12,$02,$0e,$11,$04,$12
mediumlevelname
                         .byte $08,$0d,$13,$04,$11,$0c,$04,$03,$08,$00,$13,$04,$1d,$0b,$04,$15,$04,$0b,$1d,$07,$08,$06,$07,$1d,$12,$02,$0e,$11,$04,$12
hardlevelname
                         .byte $00,$03,$15,$00,$0d,$02,$04,$03,$1d,$0b,$04,$15,$04,$0b,$1d,$07,$08,$06,$07,$1d,$12,$02,$0e,$11,$04,$12
expertlevelname
                         .byte $04,$17,$0f,$04,$11,$13,$1d,$0b,$04,$15,$04,$0b,$1d,$07,$08,$06,$07,$1d,$12,$02,$0e,$11,$04,$12
                     endif ; HSCHARSHERE
                 else ; HSCUSTOMLEVELNAMES
                     include "7800hsgamediffnames.asm"
                 endif ; HSCUSTOMLEVELNAMES
             else ; HSNOLEVELNAMES
                 ifconst HSCHARSHERE
HSHIGHSCOREStext
                     .byte $07,$08,$06,$07,$1d,$12,$02,$0e,$11,$04,$12
                 endif ; HSCHARSHERE
             endif ; HSNOLEVELNAMES

             ifnconst isBANKSETBANK
highscorelabeltextlo
                 .byte <player0label, <player1label, <player2label, <player2label
highscorelabeltexthi
                 .byte >player0label, >player1label, >player2label, >player2label
             endif ; !isBANKSETBANK

             ifconst HSCHARSHERE
player0label
                 .byte $0f,$0b,$00,$18,$04,$11,$1d,$12,$02,$0e,$11,$04,$1a,$1d,$1d

player1label
                 .byte $0f,$0b,$00,$18,$04,$11,$1d,$22,$1d,$12,$02,$0e,$11,$04,$1a

player2label
                 .byte $0f,$0b,$00,$18,$04,$11,$1d,$23,$1d,$12,$02,$0e,$11,$04,$1a
             endif ; HSCHARSHERE


             ifconst HSGAMENAMELEN
                 ifconst HSCHARSHERE
HSGAMENAMEtable
                     include "7800hsgamename.asm"
                 endif ; HSCHARSHERE
             endif ; HSGAMENAMELEN
             ifconst HSGAMERANKS
                 include "7800hsgameranks.asm"
                 ifconst HSCHARSHERE
highscoreranklabel
                     .byte $11,$00,$0d,$0a,$1a
                 endif ; HSCHARSHERE
             endif ; HSGAMERANKS

             ;ensure our table doesn't wrap a page...
             if ((<*)>251)
                 align 256
             endif
hsgameslotnumbers
             .byte 33,34,35,36,37
         endif ; hiscorefont


         ifnconst isBANKSETBANK
loaddifficultytable
             lda gamedifficulty
             and #$03 ; ensure the user hasn't selected an invalid difficulty
             sta gamedifficulty
             cmp hsdifficulty; check game difficulty is the same as RAM table
             bne loaddifficultytablecontinue1
             rts ; this high score difficulty table is already loaded
loaddifficultytablecontinue1
             lda gamedifficulty
             sta hsdifficulty
             ;we need to check the device for the table
             lda hsdevice
             bne loaddifficultytablecontinue2
             ; there's no save device. clear out this table.
             jmp cleardifficultytablemem
loaddifficultytablecontinue2
             lda hsdevice
             and #1
             beq memdeviceisntHSC
             jmp loaddifficultytableHSC
memdeviceisntHSC
             jmp loaddifficultytableAVOX

savedifficultytable
             ;*** we need to check which device we should use...
             lda hsdevice
             bne savedifficultytablerealdevice
             rts ; its a ram device
savedifficultytablerealdevice
             and #1
             beq savememdeviceisntHSC
             jmp savedifficultytableHSC
savememdeviceisntHSC
             jmp savedifficultytableAVOX

savedifficultytableAVOX
             ; the load call already setup the memory structure and atarivox memory location
             jsr savealoadedHSCtablecontinue
savedifficultytableAVOXskipconvert
             lda #HSIDHI
             sta eeprombuffer
             lda #HSIDLO
             sta eeprombuffer+1
             lda hsdifficulty
             sta eeprombuffer+2
             lda #32
             jsr AVoxWriteBytes
             rts

savedifficultytableHSC
             ;we always load a table before reaching here, so the
             ;memory structures from the load should be intact...
             ldy hsgameslot
             bpl savealoadedHSCtable
             rts
savealoadedHSCtable
             lda HSCGameDifficulty,y
             cmp #$7F
             bne savealoadedHSCtablecontinue
             jsr initializeHSCtableentry
savealoadedHSCtablecontinue
             ;convert our RAM table to HSC format and write it out...
             ldy #0
             ldx #0
savedifficultytableScores

             lda HSRAMInitials,x
             sta temp3
             lda HSRAMInitials+1,x
             sta temp4
             lda HSRAMInitials+2,x
             sta temp5
             jsr encodeHSCInitials ; takes 3 byte initials from temp3,4,5 and stores 2 byte initials in temp1,2

             lda temp1
             sta (HSGameTableLo),y
             iny
             lda temp2
             sta (HSGameTableLo),y
             iny

             lda HSRAMScores,x
             sta (HSGameTableLo),y
             iny
             lda HSRAMScores+1,x
             sta (HSGameTableLo),y
             iny
             lda HSRAMScores+2,x
             sta (HSGameTableLo),y
             iny
             inx
             inx
             inx ; +3
             cpx #15
             bne savedifficultytableScores
             rts

loaddifficultytableHSC
             ; routine responsible for loading the difficulty table from HSC
             jsr findindexHSC
             ldy hsgameslot
             lda HSCGameDifficulty,y
             cmp #$7F
             bne loaddifficultytableHSCcontinue
             ;there was an error. use a new RAM table instead...
             jsr initializeHSCtableentry
             jmp cleardifficultytablemem
loaddifficultytableHSCcontinue
             ; parse the data into the HS memory...
             ldy #0
             ldx #0
loaddifficultytableScores
             lda (HSGameTableLo),y
             sta temp1
             iny
             lda (HSGameTableLo),y
             sta temp2
             jsr decodeHSCInitials ; takes 2 byte initials from temp1,2 and stores 3 byte initials in temp3,4,5
             iny
             lda (HSGameTableLo),y
             sta HSRAMScores,x
             lda temp3
             sta HSRAMInitials,x
             inx
             iny
             lda (HSGameTableLo),y
             sta HSRAMScores,x
             lda temp4
             sta HSRAMInitials,x
             inx
             iny
             lda (HSGameTableLo),y
             sta HSRAMScores,x
             lda temp5
             sta HSRAMInitials,x
             inx
             iny
             cpx #15
             bne loaddifficultytableScores
             rts

decodeHSCInitials
             ; takes 2 byte initials from temp1,2 and stores 3 byte initials in temp3,4,5
             ; 2 bytes are packed in the form: 22211111 22_33333
             lda #0
             sta temp4
             lda temp1
             and #%00011111
             sta temp3

             lda temp2
             and #%00011111
             sta temp5

             lda temp1
             asl
             rol temp4
             asl
             rol temp4
             asl
             rol temp4
             lda temp2
             asl
             rol temp4
             asl
             rol temp4
             rts
encodeHSCInitials
             ; takes 3 byte initials from temp3,4,5 and stores 2 byte initials in temp1,2
             ; 2 bytes are packed in the form: 22211111 22_33333
             ; start with packing temp1...
             lda temp4
             and #%00011100
             sta temp1
             asl temp1
             asl temp1
             asl temp1
             lda temp3
             and #%00011111
             ora temp1
             sta temp1
             ; ...temp1 is now packed, on to temp2...
             lda temp5
             asl
             asl
             ror temp4
             ror
             ror temp4
             ror
             sta temp2
             rts

findindexHSCerror
             ;the HSC is stuffed. return the bad slot flag
             ldy #$ff
             sty hsgameslot
             rts

findindexHSC
HSCGameID1             = $1029
HSCGameID2             = $106E
HSCGameDifficulty             = $10B3
HSCGameIndex             = $10F8
             ; routine responsible for finding the game index from HSC
             ; call with x=0 to create a new table if none exist, call with x=$ff to avoid creating new tables
             ; the HS loading routine will use x=$ff, the HS saving routine will use x=0
             ldy #69 ; start +1 to account for the dey
findindexHSCloop
             dey
             bmi findindexHSCerror
             lda HSCGameDifficulty,y
             cmp #$7F
             beq findourindexHSC
             cmp gamedifficulty
             bne findindexHSCloop
             lda HSCGameID1,y
             cmp #HSIDHI
             bne findindexHSCloop
             lda HSCGameID2,y
             cmp #HSIDLO
             bne findindexHSCloop
findourindexHSC
             ; if we're here we found our index in the table
             ; or we found the first empty one
             sty hsgameslot
             jsr setupHSCGamepointer ; setup the pointer to the HS Table for this game...
             rts


initializeHSCtableentry
             ldy hsgameslot
             ; we need to make a new entry...
             lda #HSIDHI
             sta HSCGameID1,y
             lda #HSIDLO
             sta HSCGameID2,y
             lda gamedifficulty
             sta HSCGameDifficulty,y
             ldx #0
fixHSDGameDifficultylistLoop
             inx
             txa
             sta HSCGameIndex,y
             iny
             cpy #69
             bne fixHSDGameDifficultylistLoop
             rts

setupHSCGamepointer
             ; this routines sets (HSGameTableLo) pointing to the game's HS table
             lda #$17
             sta HSGameTableHi
             lda #$FA
             sta HSGameTableLo
setupHSCGamepointerLoop
             lda HSGameTableLo
             sec
             sbc #25
             sta HSGameTableLo
             lda HSGameTableHi
             sbc #0
             sta HSGameTableHi
             iny
             cpy #69
             bne setupHSCGamepointerLoop
             rts

loaddifficultytableAVOX
             ; routine responsible for loading the difficulty table from Avox
             ; we reuse HSC routines to format data to/from our Avox RAM buffer...
             lda #>(eeprombuffer+3)
             sta HSGameTableHi
             lda #<(eeprombuffer+3)
             sta HSGameTableLo

             ; the start location in EEPROM, subtract 32...
             lda #$5F
             sta HSVoxHi
             lda #$E0
             sta HSVoxLo
             lda #0
             sta temp1
loaddifficultytableAVOXloop
             inc temp1
             beq loaddifficultytableAVOXfull
             clc
             lda HSVoxLo
             adc #32
             sta HSVoxLo
             lda HSVoxHi
             adc #0
             sta HSVoxHi
             lda #3
             jsr AVoxReadBytes ; read in 3 bytes, ID1,ID2,Difficulty
             lda eeprombuffer
             cmp #$FF
             beq loaddifficultytableAVOXempty
             cmp #HSIDHI
             bne loaddifficultytableAVOXloop
             lda eeprombuffer+1
             cmp #HSIDLO
             bne loaddifficultytableAVOXloop
             lda eeprombuffer+2
             cmp gamedifficulty
             bne loaddifficultytableAVOXloop
loaddifficultytableAVOXdone
             lda #32
             jsr AVoxReadBytes
             jsr loaddifficultytableHSCcontinue
             rts
loaddifficultytableAVOXfull
             lda #0
             sta hsdevice ; looks like all 255 entries are taken... disable it.
loaddifficultytableAVOXempty
             jmp cleardifficultytablemem
             rts

cleardifficultytablemem
             ldy #29
             lda #0
cleardifficultytablememloop
             sta HSRAMTable,y
             dey
             bpl cleardifficultytablememloop
             rts
hiscoremoduleend

             ifconst DOUBLEWIDE
plotvaluedw
plotdigitcount                 = temp6
                 lda #0
                 tay
                 ldx valbufend

                 lda plotdigitcount
                 and #1
                 beq pvnibble2chardw
                 lda #0
                 sta VALBUFFER,x ; just in case we skip this digit
                 beq pvnibble2char_skipnibbledw

pvnibble2chardw
                 ; high nibble...
                 lda (temp7),y
                 and #$f0 
                 lsr 
                 lsr
                 lsr
                 lsr

                 clc
                 adc temp1 ; add the offset to character graphics to our value
                 sta VALBUFFER,x
                 inx
                 dec plotdigitcount
pvnibble2char_skipnibbledw
                 ; low nibble...
                 lda (temp7),y
                 and #$0f 
                 clc
                 adc temp1 ; add the offset to character graphics to our value
                 sta VALBUFFER,x
                 inx
                 iny

                 dec plotdigitcount
                 bne pvnibble2chardw
                 ;point to the start of our valuebuffer
                 clc
                 lda #<VALBUFFER
                 adc valbufend
                 sta temp1
                 lda #>VALBUFFER
                 adc #0
                 sta temp2

                 ;advance valbufend to the end of our value buffer
                 stx valbufend

                 ifnconst plotvalueonscreen
                     jmp plotcharacters
                 else
                     jmp plotcharacterslive
                 endif
             endif ; DOUBLEWIDE

hiscoreend
             echo " (hiscore module is using ",[(hiscoreend-hiscorestart)]d," bytes)"
         endif ; !isBANKSETBANK
     endif ; HSSUPPORT

