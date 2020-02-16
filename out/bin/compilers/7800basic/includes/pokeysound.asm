 ; Provided under the CC0 license. See the included LICENSE.txt for details.


 ifconst pokeysupport 

pokeysoundmodulestart

mutepokey
	lda #0
	ldy #7
mutepokeyloop
	sta pokey1pointlo,y
        sta (pokeybaselo),y
	dey
	bpl mutepokeyloop
	rts

checkpokeyplaying
         ldx #6
checkpokeyplayingloop
         lda pokey1pointlo,x
         ora pokey1pointhi,x
         beq pokeychannelinactive
         jsr playpokeysfxA ; x=channel*2
pokeychannelinactive
         dex
         dex
         bpl checkpokeyplayingloop
         rts

playpokeysfxA
         txa
         tay
         lda pokey1tick,x
         beq playpokeysfxAcont
         sec
         sbc #1
         sta pokey1tick,x ; sound resolution is >1 frame, and we're mid-tock...
         rts

playpokeysfxAcont
         lda pokey1frames,x ; set the frame countdown for this sound chunk
         sta pokey1tick,x

         lda pokey1priority,x ; decrease the sound's priority if its non-zero
         beq playpokeysfxAcont2
         sec
         sbc #1
         sta pokey1priority,x
playpokeysfxAcont2

         ; *** FREQUENCY
         lda (pokey1pointlo,x)
         sta temp1
         clc
         adc pokey1offset,x ; take into account any pitch modification
         sta (pokeybaselo),y ; PAUDF0,0

	;advance the data pointer +1
         inc pokey1pointlo,x
         bne skippokeyhiinc1
         inc pokey1pointhi,x
skippokeyhiinc1

         ; *** WAVE
         lda (pokey1pointlo,x)
         asl
         asl
         asl
         asl ; x16

	;advance the data pointer +1
         inc pokey1pointlo,x
         bne skippokeyhiinc2
         inc pokey1pointhi,x
skippokeyhiinc2

         ora (pokey1pointlo,x)
         iny
         sta (pokeybaselo),y

         ora temp1 ; check if F|C|V=0
         beq zeropokeypoint ; if so, we're at the end of the sound.

         ; advance the pointer +1, on to the next sound chunk
         inc pokey1pointlo,x
         bne skippokeyhiinc3
         inc pokey1pointhi,x
skippokeyhiinc3
         rts

zeropokeypoint
         sta pokey1pointlo,x
         sta pokey1pointhi,x
         sta pokey1priority,x
         rts

schedulepokeysfx
         ldx #6
schedulepokeysfxloop
         lda pokey1pointlo,x
         ora pokey1pointhi,x
         bne schedulespokeysearch
         jmp schedulepokeyX ; we found an unused channel, so use it...
schedulespokeysearch
         dex
         dex
         bpl schedulepokeysfxloop

         ; if we're here, all 4 channels are presently playing a sound...
         ldy #1
         lda (temp1),y ; peek at the priority of this sfx...
         bne schedulepokeysfxcont1
         rts ; ...and skip it if it's 0 priority
schedulepokeysfxcont1

         ; figure out which current sound has the lowest priority...
         lda #0
         sta temp8
         lda pokey1priority
         sta temp9
         ldx #6
findlowprioritypokeyloop
         lda pokey1priority,x
         cmp temp9
         bcs findlowprioritypokeyloopcontinue
         sta temp9
         stx temp8
findlowprioritypokeyloopcontinue
         dex
         dex
         bne findlowprioritypokeyloop
         ldx temp8 ; the low priority channel we'll interrupt

schedulepokeyX
         ;called with X=2*pokey channel to play on...
         ldy #1 ; get priority and sound-resolution (in frames)
         lda (temp1),y
         sta pokey1priority,x
         iny
         lda (temp1),y
         sta pokey1frames,x

         lda temp1
         clc
         adc #3
         sta pokey1pointlo,x
         lda temp2
         adc #0
         sta pokey1pointhi,x
         lda temp3
         sta pokey1offset,x
         lda #0
         sta pokey1tick,x
         rts

         ; pokey detection routine. we check for pokey in the XBOARD/XM location,
         ; and the standard $4000 location.
         ; if pokey the pokey is present, this routine will reset it.

detectpokeylocation
         ;XBoard/XM...
         lda #%00011100
         sta $470 ; tell XCTRL to hit the POKEY enable
         ldx #1
detectpokeyloop
         lda POKEYCHECKLO,x
         sta pokeybaselo
         lda POKEYCHECKHI,x
         sta pokeybasehi
         jsr checkforpokey
         lda pokeydetected
         beq foundpokeychip
	 dex
         bpl detectpokeyloop
foundpokeychip
         eor #$ff ; invert state for 7800basic if...then test
         sta pokeydetected
         rts

POKEYCHECKLO
	.byte <$4000, <$0450
POKEYCHECKHI
	.byte >$4000, >$0450

checkforpokey
         ldy #$0f
         lda #$00
         sta pokeydetected ; start off by assuming pokey will be detected
resetpokeyregistersloop
         sta (pokeybase),y
         dey
         bpl resetpokeyregistersloop

         ldy #PAUDCTL
         sta (pokeybase),y
         ldy #PSKCTL
         sta (pokeybase),y

         ; let the dust settle...
         nop
         nop
         nop

         lda #4
         sta temp9
pokeycheckloop1
         ; we're in reset, so the RANDOM register should read $ff...
         ldy #PRANDOM
         lda (pokeybase),y
         cmp #$ff
         bne nopokeydetected
         dec temp9
         bne pokeycheckloop1

         ; take pokey out of reset...
         ldy #PSKCTL
         lda #3
         sta (pokeybase),y
         ldy #PAUDCTL
         lda #0
         sta (pokeybase),y

         ; let the dust settle again...
         nop
         nop
         nop

         lda #4
         sta temp9 
pokeycheckloop2
         ; we're out of reset, so RANDOM should read non-$ff...
         ldy #PRANDOM
         lda (pokeybase),y
         cmp #$ff
         beq skippokeycheckreturn
         rts
skippokeycheckreturn
         dec temp9
         bne pokeycheckloop2
nopokeydetected
         dec pokeydetected ; pokeydetected=#$ff
         rts

pokeysoundmoduleend

 echo "  pokeysound assembly: ",[(pokeysoundmoduleend-pokeysoundmodulestart)]d," bytes"

 endif
