     ; Provided under the CC0 license. See the included LICENSE.txt for details.

mega7800handlerstart
mega7800handler
     ifconst MEGA7800SUPPORT

     ; ** stuff the joyick directions into the shadow register
     lda sSWCHA             ; clear previous dirs for this pad, from
     ora SWCHA_DIRMASK,x    ; our sSWCHA nibble.
     sta sSWCHA
     lda SWCHA              ; load the actual joystick dirs, ensuring
     ora SWCHA_DIRMASK+1,x ; we don't change the other nibble.
     and sSWCHA
     sta sSWCHA 

     ; x=0 for left port, x=1 for right

     lda #0
     sta inttemp5 ; temporary button-state storage
     sta inttemp6 ; temporary button-state storage

     lda CTLSWA
     and SWCHA_DIRMASK+1,x ; preserve other port nibble
     ora MEGA_INIT,x
     sta CTLSWA ; enable pins UP/DOWN to work as outputs

     ; the controller type bits take a few cycles to get set after we start
     ; an extended read, so we'll start the first extended read early...
     lda SWCHA
     and SWCHA_DIRMASK+1,x ; preserve other port nibble
     sta SWCHA ; all bits are low, which STARTS the extended read
     nop 
     nop 

     ; first read  will be pad state (mega7800 connect and controller type)
     ; second read will be 3 button support (SACB)
     ; third read  will be 6 button support (MXYZ)
     
     ldy #5 ; read 6x states, with the first 2x being the controller type
m7readloop
     lda SWCHA
     and SWCHA_DIRMASK+1,x ; preserve other port nibble
     sta SWCHA ; all bits are low, which STARTS the read

     lda SWCHA 
     cpx #1
     bne m7skipp1shift
     asl
     asl
     asl
     asl
m7skipp1shift
     asl ; button bit 1 into carry
     rol inttemp6
     rol inttemp5
     asl ; button bit 0 into carry
     rol inttemp6
     rol inttemp5

     lda SWCHA
     and SWCHA_DIRMASK+1,x ; preserve other port nibble
     ora MEGA_NEXT,x
     sta SWCHA

     dey
     bpl m7readloop

     lda CTLSWA
     and SWCHA_DIRMASK+1,x ; preserve other port nibble
     sta CTLSWA ; set this port back to input

     ; if mega7800 isn't detected this frame, unpress any buttons...
     ; to avoid
     lda inttemp5
     and #%00000011
     beq m7skipscuttle
     lda #$ff
     sta inttemp6
     ifconst MULTIBUTTON
         ; the controller isn't present... revert to proline
         lda #1 ; proline
         sta port0control,x
         rts
     endif ; MULTIBUTTON
m7skipscuttle
     ifconst MULTIBUTTON
          lda inttemp5
          lsr
          lsr
          and #3
          tay
          lda megabuttons,y
          sta multibuttoncount0,x
          ; todo : update multibuttoncount0,x
     endif ; MULTIBUTTON

     lda inttemp5
     sta mega7800state0,x
     lda inttemp6
     sta mega7800data0,x

     ifconst MULTIBUTTON
         ; now update the genric multi-button bits...
         ldy #7
m7shuffleloop
         lda inttemp6
         and m7reorder,y
         clc
         adc #$FF ; bit value in carry
         rol inttemp5
         dey
         bpl m7shuffleloop
         lda inttemp5
         eor #%11000000
         sta sINPT1,x
         rts

megabuttons
         .byte 6,2,3,2
m7reorder
         ;        S          M         Z         Y
         .byte %00100000,%00000010,%00000100,%00001000
         ;        X          C         A         B
         .byte %00000001,%10000000,%00010000,%01000000
     else ;  !MULTIBUTTON
         rts
     endif ; !MULTIBUTTON

MEGA_INIT
     .byte %00110000,%00000011
MEGA_NEXT
     .byte %00100000,%00000010

mega7800handlerend
 echo "  (mega7800 module is using ",[(mega7800handlerend-mega7800handlerstart)]d," bytes of rom)"

     endif ; MEGA7800SUPPORT

