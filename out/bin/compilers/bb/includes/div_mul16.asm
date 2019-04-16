; Compute mul1*mul2+acc -> acc:mul1 [mul2 is unchanged]
; Routine courtesy of John Payson (AtariAge member supercat)
 
 ; x and a contain multiplicands, result in a, temp1 contains any overflow

mul16
 sty temp1
 sta temp2
 ldx #8
 dec temp2
loopmul
 lsr
 ror temp1
 bcc noaddmul
 adc temp2
noaddmul
 dex
 bne loopmul
 RETURN

; div int/int
; numerator in A, denom in temp1
; returns with quotient in A, remainder in temp1

div16
 sty temp1
  ldx #8
loopdiv
 cmp temp1
 bcc toosmalldiv
 sbc temp1   ; Note: Carry is, and will remain, set.
 rol temp2
 rol
 dex
 bne loopdiv
 beq donediv
toosmalldiv
 rol temp2
 rol
 dex
 bne loopdiv
donediv
 sta temp1
 lda temp2
 RETURN
