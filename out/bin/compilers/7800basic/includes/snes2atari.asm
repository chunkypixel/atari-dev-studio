     ; Provided under the CC0 license. See the included LICENSE.txt for details.

     ifconst SNES2ATARISUPPORT
snes2atarimodulestart

SNES_CLOCK_PORT_BIT
         .byte $10,$01 
SNES_CTLSWA_MASK
         .byte $30,$03
SNES_CTLSWA_SIGNAL
         .byte $C0,$0C

         ; Probe each port for SNES, and see if autodetection succeeds anywhere.
SNES_AUTODETECT
         ifconst HSSUPPORT
             ; ** an atarivox might be plugged in, so we skip scanning the second
             ; ** port for a snes if vox was detected...
             lda hsdevice ; b1 high means atarivox/savekey was detected
             lsr
             and #1
             eor #1
             tax
         else
             ldx #1
         endif ; HSSUPPORT

SNES_AUTODETECT_LOOP
     ifnconst MULTIBUTTON ; snesdetect shouldn't be used in multibutton mode
         lda #1 ; proline
         sta port0control,x
         jsr setportforinput
         jsr setonebuttonmode
         jsr SNES_READ
         lda snesdetected0,x
         bne SNES_AUTODETECT_FOUND
         ; detection failed
         jsr setportforinput
         jsr settwobuttonmode
         dex
         bpl SNES_AUTODETECT_LOOP
         rts
SNES_AUTODETECT_FOUND
         lda #11 ; formally set the snes controller
         sta port0control,x
         stx snesport
     endif ; !MULTIBUTTON
         rts
     endif ; SNES2ATARISUPPORT
     
snes2atarihandler
     ifconst SNES2ATARISUPPORT
SNES2ATARI
         jsr SNES_READ 
         jmp buttonreadloopreturn

SNES_READ
         ; x=0 for left port, x=1 for right
         lda port0control,x
         cmp #11 ; snes
         bne snes2atari_signal_go ; if this is a first auto-detection read, go ahead and signal
         lda snesdetected0,x 
         bne snes2atari_signal_skip ; if snes was available in previous frames, skip signalling
snes2atari_signal_go
         jsr SNES2ATARI_SIGNAL
snes2atari_signal_skip

         lda CTLSWA
         and SWCHA_DIRMASK+1,x ; preserve other nibble
         ora SNES_CTLSWA_MASK,x
         sta CTLSWA ; enable pins UP/DOWN to work as outputs

         lda SWCHA
         and SWCHA_DIRMASK+1,x ; preserve other nibble
         ora SNES_CTLSWA_MASK,x

         sta SWCHA ; latch+clock high
         nop
         nop
         nop
         nop
         nop
         nop
         nop
         lda SWCHA
         and SWCHA_DIRMASK+1,x ; preserve other nibble
         sta SWCHA ; latch and clock low
         ldy #16 ; 16 bits 
SNES2ATARILOOP
         rol INPT4,x ; sample data into carry
         lda SWCHA 
         and SWCHA_DIRMASK+1,x ; preserve other nibble
         ora SNES_CLOCK_PORT_BIT,x
         sta SWCHA ; clock low
         rol snes2atari0lo,x
         rol snes2atari0hi,x
         lda SWCHA
         and SWCHA_DIRMASK+1,x ; preserve other nibble
         sta SWCHA ; latch and clock low
         dey ; next bit
         bne SNES2ATARILOOP
         rol INPT4,x ; 17th bit should be lo if controller is there.
         rol ; 17th snes bit into A low bit
         eor snes2atari0lo,x ; 16th bit should be hi if controller is there.
         and #1
         sta snesdetected0,x
         beq SNES_STOP_CLOCK ; if snes isn't detected, leave port in default state
         stx snesport ; snesport keeps the index of the latest autodetected controller
         lda SWCHA
         and SWCHA_DIRMASK+1,x ; preserve other nibble
         ora SNES_CLOCK_PORT_BIT,x
         jmp SNES_STOP_CLOCK
SNES_STOP_CLOCK
         sta SWCHA ; clock low
         lda CTLSWA
         and SWCHA_DIRMASK+1,x ; preserve other nibble
         ;ora SNES_CLOCK_PORT_BIT,x
         sta CTLSWA ; set port bits to input avoid conflict with other drivers
         ifconst MULTIBUTTON
             lda snesdetected0,x
             bne snesexit
             lda #1 ; proline
             sta port0control,x
             jmp settwobuttonmode
snesexit
             lda #6
             sta multibuttoncount0,x
             ; stuff directions into sSWCHA nibble and buttons into sINPT1,x...
             lda s2a_joyshiftcount,x
             tay
             lda snes2atari0hi,x
snesjoypadloop
             lsr
             rol inttemp6
             dey
             bpl snesjoypadloop
             lda sSWCHA
             ora SWCHA_DIRMASK,x ; turn off the bits for this port
             sta sSWCHA
             lda inttemp6    
             ora SWCHA_DIRMASK+1,x ; don't change the other port
             and sSWCHA
             sta sSWCHA

             ; snes2atari0hi = B  Y  Se St *  *  *  *
             ; snes2atari0lo = A  X  Ls Rs 
             ; sINPT1        = B  A  Y  X  Ls Rs Se St
             lda snes2atari0lo,x 
             sta inttemp5
             lda snes2atari0hi,x
             sta inttemp6
             asl inttemp5 ; A
             rol 
             asl inttemp6 ; B
             rol 
             asl inttemp6 ; Y
             rol 
             asl inttemp5 ; X
             rol 
             asl inttemp5 ; Ls
             rol 
             asl inttemp5 ; Rs
             rol 
             asl inttemp6 ; Ls
             rol 
             asl inttemp6 ; Rs
             rol 
             eor #%11000000 ; invert to match proline
             sta sINPT1,x
         endif ; MULTIBUTTON
         rts
SNES2ATARI_SIGNAL
         ; signal to SNES2ATARI++ that we want SNES mode...
         lda CTLSWA
         and SWCHA_DIRMASK+1,x ; preserve other nibble
         ora SNES_CTLSWA_SIGNAL,x
         sta CTLSWA 
         lda SWCHA
         and SWCHA_DIRMASK+1,x ; preserve other nibble
         sta SWCHA
         ldy #16 
SNES_SIGNAL_LOOP
         dey
         bne SNES_SIGNAL_LOOP
         lda SWCHA
         ora SWCHA_DIRMASK,x
         sta SWCHA
         rts
s2a_joyshiftcount
  .byte 7,3
snes2atarimoduleend
  echo "  (snes2atari module is using ",[(snes2atarimoduleend-snes2atarimodulestart)]d," bytes of rom)"
     endif ; SNES2ATARISUPPORT


