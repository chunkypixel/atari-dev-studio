     ; Provided under the CC0 license. See the included LICENSE.txt for details.

START
start

     ;******** more or less the Atari recommended startup procedure

     sei
     cld

     ifnconst NOTIALOCK
         lda #$07
     else
         lda #$06
     endif
     sta INPTCTRL ;lock 7800 into 7800 mode
     lda #$7F
     sta CTRL ;disable DMA
     lda #$00
     sta OFFSET
     ifnconst NOTIALOCK
         sta INPTCTRL
         sta BACKGRND ; black default, in case a flash cart is using something else
     endif
     ldx #$FF
     txs

     ;************** Clear Memory

     ; ** Clear 1800-27FF, pg0+pg1 memory.
ClearMemPages
     lda #0
     tay ; y=0
     sta $80
     ldx #$18
ClearMemPagesLoop
     stx $81 ; needed for when we step on ZP memory
     sta ($80),y ;Store data
     iny ;Next byte
     bne ClearMemPagesLoop
     inx
     cpx #$28
     bne ClearMemPagesLoop
     sta $81

     ;seed random number with hopefully-random timer value
     lda #1
     ora INTIM
     sta rand

     ; detect the console type...
pndetectvblankstart
     lda MSTAT
     bpl pndetectvblankstart ; if we're not in VBLANK, wait for it to start 
pndetectvblankover
     lda MSTAT
     bmi pndetectvblankover ; then wait for it to be over
     ldy #$00
     ldx #$00
pndetectvblankhappening
     lda MSTAT
     bmi pndetectinvblank ; if VBLANK starts, exit our counting loop 
     sta WSYNC
     sta WSYNC
     inx
     bne pndetectvblankhappening
pndetectinvblank
     cpx #125
     bcc pndetecispal
     ldy #$01
pndetecispal
     sty paldetected

     jsr createallgamedlls

     lda #>DLLMEM
     sta DPPH
     lda #<DLLMEM
     sta DPPL

     ifconst pokeysupport
         ; pokey support is compiled in, so try to detect it...
         jsr detectpokeylocation
     endif

     lda #1 ; default for port 0 and 1 is a regular joystick
     sta port0control
     sta port1control

     ;Setup port A to read mode
     ;lda #$00
     ;sta SWCHA
     ;sta CTLSWA

     ifconst HSSUPPORT
         ifconst bankswitchmode
             ifconst included.hiscore.asm.bank
                 ifconst MCPDEVCART
                     lda #($18 | included.hiscore.asm.bank) 
                     ifconst dumpbankswitch
                         sta dumpbankswitch
                     endif
                     sta $3000
                 else
                     lda #(included.hiscore.asm.bank)
                     ifconst dumpbankswitch
                         sta dumpbankswitch
                     endif
                     sta $8000
                 endif
             endif ; included.hiscore.asm.bank
         endif ; bankswitchmode
         ; try to detect HSC
         jsr detecthsc
         and #1
         sta hsdevice
skipHSCdetect
         ; try to detect AtariVox eeprom
         jsr detectatarivoxeeprom
         and #2
         ora hsdevice
         cmp #3
         bne storeAinhsdevice
         ; For now, we tie break by giving HSC priority over AtariVox.
         ; Later we should check each device's priority byte if set, instead, 
         lda #2 
storeAinhsdevice
         sta hsdevice
         lda #$ff
         sta hsdifficulty
         sta hsgameslot
         sta hsnewscoreline
     endif ; HSSUPPORT

     ifconst AVOXVOICE
         jsr silenceavoxvoice
     endif

 ifconst MULTIBUTTON
 ifnconst HSSUPPORT
min_detectatarivoxeeprom
         jsr i2c_startwrite
         bcc min_no_eeprom_error
         lda #$ff
         jmp min_avoxdetect_done
min_no_eeprom_error
         lda #$30
         jsr i2c_txbyte
         lda #$00
         jsr i2c_txbyte
         jsr i2c_stopwrite
min_avoxdetect_done
         eor #$FF
         sta avoxdetected
         jmp min_detectatarivoxeepromdone
         include "i2c7800.inc"
         I2C_SUBS temp9
min_detectatarivoxeepromdone
 endif ; HSSUPPORT
 endif ; MULTIBUTTON

 ifconst MULTIBUTTON
         lda avoxdetected
         beq skipassignavox
         lda #10
         sta port1control ; designate port 1 as atarivox so multibutton won't disturb it.
skipassignavox
 endif ; MULTIBUTTON

     ifconst RMT
         ifconst RMTVOLUME
             lda #$F0 ; default to full RMT volume
             sta rmtvolume
             ifconst TIAVOLUME
                 sta tiavolume
             endif ; TIAVOLUME
         endif ; RMTVOLUME
     else ; !RMT
         ifconst TIAVOLUME
             lda #$F0 ; default to full TIA volume
             sta tiavolume
         endif ; TIAVOLUME
     endif ; RMT

     ifconst bankswitchmode
         ; we need to switch to the first bank as a default. this needs to
         ; happen before DMA, in case there's a topscreenroutine in bank 0
         ifconst MCPDEVCART
             lda #$18 ; xxx11nnn - switch to bank 0
             ifconst dumpbankswitch
                 sta dumpbankswitch
             endif
             sta $3000
         else
             lda #0
             ifconst dumpbankswitch
                 sta dumpbankswitch
             endif
             sta $8000
         endif
     endif

     ; CTRL 76543210
     ; 7 colorburst kill
     ; 6,5 dma ctrl 2=normal DMA, 3=no DMA
     ; 4 character width 1=2 byte chars, 0=1 byte chars
     ; 3 border control 0=background color border, 1=black border
     ; 2 kangaroo mode 0=transparency, 1=kangaroo
     ; 1,0 read mode 0=160x2/160x4 1=N/A 2=320B/320D 3=320A/320C

     ifconst DOUBLEWIDE
         lda #%01010000 ;Enable DMA, mode=160x2/160x4, 2x character width
     else
         lda #%01000000 ;Enable DMA, mode=160x2/160x4
     endif

     jsr waitforvblankstart ; give the some vblank time to minimally update the display

     sta CTRL
     sta sCTRL

     jsr vblankresync

     ldx #1
     jsr settwobuttonmode
     ldx #0
     jsr settwobuttonmode

     ifnconst .altgamestart
         jmp game
     else
         jmp .altgamestart
     endif

