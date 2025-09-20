;
; i2cleft.inc
;
;
; AtariVox EEPROM Driver
;
; By Alex Herbert, 2004
;
; Updates to convert to left-side port
;
; By Mike Saarna, 2022




; Debug Constantss

 ifnconst I2CL_DEBUGCOLORS
I2CL_DEBUGCOLORS equ     0       ; set no non-zero to display timing colours
 endif



; I/O Constants

I2CL_SDA_MASK    equ     $40
I2CL_SCL_MASK    equ     $80




; Debug Macros

        mac     I2CL_DEBUGCOL
        if      I2CL_DEBUGCOLORS
        lda     #{1}
        sta     BACKGRND
        endif
        endm



; Signalling Macros

        mac     I2CL_SCL_0
        lda     #$00
        sta     SWCHA
	nop
	nop
        endm

        mac     I2CL_SCL_1
        lda     #I2CL_SCL_MASK
        sta     SWCHA
	nop
	nop
        endm

        mac     I2CL_SDA_IN
        lda     #I2CL_SCL_MASK
        sta     SWACNT
	nop
	nop
        endm

        mac     I2CL_SDA_OUT
        lda     #I2CL_SCL_MASK|I2CL_SDA_MASK
        sta     SWACNT
	nop
	nop
        endm



        mac     I2CL_START

        I2CL_SCL_1
        I2CL_SDA_OUT

        endm


        mac     I2CL_STOP

        I2CL_SCL_0
        I2CL_SDA_OUT
        I2CL_SCL_1

        ; return port to input mode
        lda     #$0
        sta     SWACNT
	nop
	nop
        endm



        mac     I2CL_TXBIT

        I2CL_SCL_0

        ;lda     #$01
        ;rol
        ;asl
        ;asl
	; %0000001C

	lda	#%1011111
        adc	#0
	and	#%11000000 
        sta     SWACNT  ; SDA = !C
	nop
	nop

        I2CL_SCL_1

        endm


        mac     I2CL_TXACK

        I2CL_SCL_0
        I2CL_SDA_OUT
        I2CL_SCL_1

        endm


        mac     I2CL_TXNACK

        I2CL_SCL_0
        I2CL_SDA_IN
        I2CL_SCL_1

        endm



        mac     I2CL_RXBIT

        I2CL_SCL_0
        I2CL_SDA_IN
        I2CL_SCL_1

        lda     SWCHA
        ;lsr
        ;lsr
        ;lsr             ; C = SDA
	asl
	asl

        endm


        mac     I2CL_RXACK

        I2CL_RXBIT

        endm



; Subroutine Macros

        mac     I2CL_SUBS

i2cl_startread
        I2CL_DEBUGCOL    $5e

        clv                     ; use V to flag if previous byte needs ACK

        I2CL_START               ; start signal
        lda     #%10100001      ; eeprom read command
        bvc     i2cl_txbyte      ; transmit



i2cl_startwrite
        I2CL_DEBUGCOL    $8e

        I2CL_START               ; start signal
        lda     #%10100000      ; eeprom write command



i2cl_txbyte
        eor     #$ff            ; invert data byte
        sta     {1}             ; store in scratchpad

        I2CL_DEBUGCOL    $86

        ldy     #$08            ; loop counter
i2cl_txbyteloop
        asl     {1}             ; shift next bit into C
        I2CL_TXBIT               ; transmit
        dey
        bne     i2cl_txbyteloop

        I2CL_RXACK               ; receive acknowledge bit

        I2CL_DEBUGCOL    $00
        rts


i2cl_rxbyte
        I2CL_DEBUGCOL    $56

        ldy     #$08            ; loop counter

        bvc     i2cl_rxskipack   ; previous byte needs acknowledge?
        I2CL_TXACK               ; transmit acknowledge bit

i2cl_rxbyteloop
        I2CL_RXBIT               ; receive bit in C
        rol     {1}             ; rotate into scratchpad
        dey
        bne     i2cl_rxbyteloop

        I2CL_DEBUGCOL    $00

        lda     {1}             ; get received byte from scratchpad
        rts

i2cl_rxskipack
        bit     .vbit           ; set V - next byte(s) require acknowledge
.vbit   bvs     i2cl_rxbyteloop



i2cl_stopread
        bvc     i2cl_stopwrite
        I2CL_TXNACK              ; transmit no-acknowledge



i2cl_stopwrite
        I2CL_DEBUGCOL    $0a

        I2CL_STOP                ; stop signal

        I2CL_DEBUGCOL    $02
        rts


        endm


