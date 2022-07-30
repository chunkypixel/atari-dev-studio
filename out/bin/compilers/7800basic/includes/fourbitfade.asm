 ; ** fourbit fade, which is useful for audio levels and brightness fades
 ; ** input:  A=value to fade, fourbitfadevalue=global fade value
 ; **         N.B. the global fade value is in the upper nibble. i.e. $Fx-0x
 ; ** output: A=faded value in lo nibble. orig top nibble is preserved, 
 ; **         other registers are preserved

 ifconst FOURBITFADE

 ; non-interrupt routine

fourbitfade
  sty fourbittemp1
  pha
  and #$0F
  ora fourbitfadevalue
  tay
  pla
  and #$F0
  ora fourbitfadelut,y
  ldy fourbittemp1 ; restore Y
  rts

 ; interrupt routine

fourbitfadeint
  sty fourbittemp1int
  pha
  and #$0F
  ora fourbitfadevalueint
  tay
  pla
  and #$F0
  ora fourbitfadelut,y
  ldy fourbittemp1int ; restore Y
  rts

fourbitfadelut
 .byte $00,$00,$00,$00,$00,$00,$00,$00,$00,$00,$00,$00,$00,$00,$00,$00
 .byte $00,$00,$00,$00,$00,$00,$00,$00,$01,$01,$01,$01,$01,$01,$01,$01
 .byte $00,$00,$00,$00,$00,$00,$01,$01,$01,$01,$01,$02,$02,$02,$02,$02
 .byte $00,$00,$00,$00,$01,$01,$01,$01,$02,$02,$02,$02,$03,$03,$03,$03
 .byte $00,$00,$00,$00,$01,$01,$01,$02,$02,$02,$03,$03,$03,$04,$04,$04
 .byte $00,$00,$00,$01,$01,$01,$02,$02,$03,$03,$03,$04,$04,$04,$05,$05
 .byte $00,$00,$00,$01,$01,$02,$02,$03,$03,$03,$04,$04,$05,$05,$06,$06
 .byte $00,$00,$01,$01,$02,$02,$03,$03,$04,$04,$05,$05,$06,$06,$07,$07
 .byte $00,$00,$01,$01,$02,$02,$03,$03,$04,$05,$05,$06,$06,$07,$07,$08
 .byte $00,$00,$01,$01,$02,$03,$03,$04,$05,$05,$06,$06,$07,$08,$08,$09
 .byte $00,$00,$01,$02,$02,$03,$04,$04,$05,$06,$06,$07,$08,$08,$09,$0a
 .byte $00,$00,$01,$02,$03,$03,$04,$05,$06,$06,$07,$08,$09,$09,$0a,$0b
 .byte $00,$00,$01,$02,$03,$04,$04,$05,$06,$07,$08,$08,$09,$0a,$0b,$0c
 .byte $00,$00,$01,$02,$03,$04,$05,$06,$07,$07,$08,$09,$0a,$0b,$0c,$0d
 .byte $00,$00,$01,$02,$03,$04,$05,$06,$07,$08,$09,$0a,$0b,$0c,$0d,$0e
 .byte $00,$01,$02,$03,$04,$05,$06,$07,$08,$09,$0a,$0b,$0c,$0d,$0e,$0f

fourbitfadeend

 echo "  (fourbitfade module is using ",[(fourbitfadeend-fourbitfade)]d," bytes)"

 endif
