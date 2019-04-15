
calculatecartcrc
 asm
 lda #$00 ; lo byte of cart rom start
 sta temp1

 ifconst ROM48k
   lda #$40
     ifconst ROM16k
       lda #$C0
     else
       ifconst ROM8k
         lda #$E0
       else
         lda #$80
       endif ; ROM8k
     endif ; ROM16k
 endif ; ROM48k
 sta temp2 ; hi byte of cart rom start

 lda #$00
 ifconst bankswitchmode
   sta temp3 ; current bank
   ifconst MCPDEVCART
     sta $3000
   else
     sta $8000
   endif
 endif ; bankswitchmode
 sta temp4 ; clear the crc variables
 sta temp5
calculatecarttemploop
        ldy #0
        lda (temp1),y
        eor temp5
        sta temp5
        lsr
        lsr
        lsr
        lsr
        tax
        asl
        eor temp4
        sta temp4
        txa
        eor temp5
        sta temp5
        asl
        asl
        asl
        tax
        asl
        asl
        eor temp5
        tay
        txa
        rol
        eor temp4
        sta temp5
        sty temp4
 inc temp1
 bne calculatecarttemploop
 inc temp2
 ifconst bankswitchmode
   lda temp2
   cmp #$C0
   bne calculatecarttemploop

   inc temp3
   lda temp3
   ifconst MCPDEVCART
     ora #$18
     sta $3000
   else
     sta $8000
   endif

   cmp #bankswitchmode
   beq calculatecarttemploop
   lda #$80
   sta temp2
   bne calculatecarttemploop
 endif ; bankswitchmode
 lda temp2
 cmp #$ff ; we don't calculate the last page
 bne calculatecarttemploop
 ; when we exit, the crc is in temp4+temp5
 rts


