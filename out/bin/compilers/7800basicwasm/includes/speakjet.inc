;
; speakjet.inc
;
;
; AtariVox Speech Synth Driver
;
; By Alex Herbert, 2004
;




; Constants


SERIAL_OUTMASK  equ     $01
SERIAL_RDYMASK  equ     $02



; Macros

        mac     SPKOUT

        ; check buffer-full status
        lda     SWCHA
        and     #SERIAL_RDYMASK
        beq     .speech_done

        ; get next speech byte
        ldy     #$00
        lda     (speech_addr),y

        ; invert data and check for end of string
        eor     #$ff
 ;sta BACKGRND ; debug - uncomment to flash the background color with vox data
        beq     .speech_done
        sta     {1}

        ; increment speech pointer
        inc     speech_addr
        bne     .incaddr_skip
        inc     speech_addr+1
.incaddr_skip

        ; output byte as serial data

        sec     ; start bit
.byteout_loop
        ; put carry flag into bit 0 of SWACNT, preserving other bits
        lda     SWACNT          ; 4
        and     #$fe            ; 2 6
        adc     #$00            ; 2 8
        sta     SWACNT          ; 4 12

        ; 10 bits sent? (1 start bit, 8 data bits, 1 stop bit)
        cpy     #$09            ; 2 14
        beq     .speech_done    ; 2 16
        iny                     ; 2 18

	; the 7800 is 1.5x faster than the 2600. Waste more cycles here
	; to match the original baud rate...
        ;ldx     #$07 ; 2600
        ldx     #$0D

.delay_loop
        dex			; 
        bne     .delay_loop     ; 36 54

        ; shift next data bit into carry
        lsr     {1}             ; 5 59

        ; and loop (branch always taken)
        bpl     .byteout_loop   ; 3 62 cycles for loop

.speech_done

        endm


        mac     SPEAK

        lda     #<{1}
        sta     speech_addr
        lda     #>{1}
        sta     speech_addr+1

        endm



