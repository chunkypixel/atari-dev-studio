;
; i2c.inc
;
;
; AtariVox EEPROM Driver
;
; By Alex Herbert, 2004
;
; Updates to convert to 7800 platform
;
; By Mike Saarna, 2015




; Debug Constantss

 ifnconst I2C_DEBUGCOLORS
I2C_DEBUGCOLORS equ     0       ; set no non-zero to display timing colours
 endif



; I/O Constants

I2C_SDA_MASK    equ     $04
I2C_SCL_MASK    equ     $08




; Debug Macros

        mac     I2C_DEBUGCOL
        if      I2C_DEBUGCOLORS
        lda     #{1}
        sta     BACKGRND
        endif
        endm



; Signalling Macros

        mac     I2C_SCL_0
        lda     #$00
        sta     SWCHA
	nop
	nop
        endm

        mac     I2C_SCL_1
        lda     #I2C_SCL_MASK
        sta     SWCHA
	nop
	nop
        endm

        mac     I2C_SDA_IN
        lda     #I2C_SCL_MASK
        sta     SWACNT
	nop
	nop
        endm

        mac     I2C_SDA_OUT
        lda     #I2C_SCL_MASK|I2C_SDA_MASK
        sta     SWACNT
	nop
	nop
        endm



        mac     I2C_START

        I2C_SCL_1
        I2C_SDA_OUT

        endm


        mac     I2C_STOP

        I2C_SCL_0
        I2C_SDA_OUT
        I2C_SCL_1

        ; return port to input mode
        lda     #$0
        sta     SWACNT
	nop
	nop
        endm



        mac     I2C_TXBIT

        I2C_SCL_0

        lda     #$01
        rol
        asl
        asl
        sta     SWACNT  ; SDA = !C
	nop
	nop

        I2C_SCL_1

        endm


        mac     I2C_TXACK

        I2C_SCL_0
        I2C_SDA_OUT
        I2C_SCL_1

        endm


        mac     I2C_TXNACK

        I2C_SCL_0
        I2C_SDA_IN
        I2C_SCL_1

        endm



        mac     I2C_RXBIT

        I2C_SCL_0
        I2C_SDA_IN
        I2C_SCL_1

        lda     SWCHA
        lsr
        lsr
        lsr             ; C = SDA

        endm


        mac     I2C_RXACK

        I2C_RXBIT

        endm



; Subroutine Macros

        mac     I2C_SUBS

i2c_startread
        I2C_DEBUGCOL    $5e

        clv                     ; use V to flag if previous byte needs ACK

        I2C_START               ; start signal
        lda     #%10100001      ; eeprom read command
        bvc     i2c_txbyte      ; transmit



i2c_startwrite
        I2C_DEBUGCOL    $8e

        I2C_START               ; start signal
        lda     #%10100000      ; eeprom write command



i2c_txbyte
        eor     #$ff            ; invert data byte
        sta     {1}             ; store in scratchpad

        I2C_DEBUGCOL    $86

        ldy     #$08            ; loop counter
i2c_txbyteloop
        asl     {1}             ; shift next bit into C
        I2C_TXBIT               ; transmit
        dey
        bne     i2c_txbyteloop

        I2C_RXACK               ; receive acknowledge bit

        I2C_DEBUGCOL    $00
        rts


i2c_rxbyte
        I2C_DEBUGCOL    $56

        ldy     #$08            ; loop counter

        bvc     i2c_rxskipack   ; previous byte needs acknowledge?
        I2C_TXACK               ; transmit acknowledge bit

i2c_rxbyteloop
        I2C_RXBIT               ; receive bit in C
        rol     {1}             ; rotate into scratchpad
        dey
        bne     i2c_rxbyteloop

        I2C_DEBUGCOL    $00

        lda     {1}             ; get received byte from scratchpad
        rts

i2c_rxskipack
        bit     .vbit           ; set V - next byte(s) require acknowledge
.vbit   bvs     i2c_rxbyteloop



i2c_stopread
        bvc     i2c_stopwrite
        I2C_TXNACK              ; transmit no-acknowledge



i2c_stopwrite
        I2C_DEBUGCOL    $0a

        I2C_STOP                ; stop signal

        I2C_DEBUGCOL    $02
        rts


        endm


