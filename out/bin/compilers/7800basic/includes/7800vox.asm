 ; Provided under the CC0 license. See the included LICENSE.txt for details.

     ; AtariVox 7800basic wrapper

     ; to be called with
     ; A=# of bytes
     ;

     ifconst HSSUPPORT

AVoxReadBytes
         sta temp8
         jsr i2c_startwrite
         bcs eeprom_error

         lda HSVoxHi
         jsr i2c_txbyte
         lda HSVoxLo
         jsr i2c_txbyte
         jsr i2c_stopwrite

         jsr i2c_startread

         ldx #0
AVoxReadBytesLoop
         jsr i2c_rxbyte
         sta eeprombuffer,x
         inx
         cpx temp8
         bne AVoxReadBytesLoop
         jsr i2c_stopread
         lda #0
         rts

         ; to be called with
         ; A=# of bytes
         ;

AVoxWriteBytes
         sta temp8
         jsr i2c_startwrite
         bcs eeprom_error

         lda HSVoxHi
         jsr i2c_txbyte
         lda HSVoxLo
         jsr i2c_txbyte

         ldx #$00
AVoxWriteBytesLoop
         lda eeprombuffer,x
         jsr i2c_txbyte
         inx
         cpx temp8
         bne AVoxWriteBytesLoop
         jsr i2c_stopwrite

         lda #0
         rts

eeprom_error
         lda #$ff
         rts

AVoxDetect
  
         jsr i2c_startwrite
         bcs eeprom_error
         lda #$30
         jsr i2c_txbyte
         lda #$00
         jsr i2c_txbyte
         jsr i2c_stopwrite
         rts

         include "i2c7800.inc"
         I2C_SUBS temp9

     endif

