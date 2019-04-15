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
  endif
     ldx #$FF
     txs

     ;************** Clear Memory

     ldx #$40
     lda #$00
crloop1     
     sta $00,x ;Clear zero page
     sta $100,x ;Clear page 1
     inx
     bne crloop1


     ldy #$00 ;Clear Ram
     lda #$18 ;Start at $1800
     sta $81 
     lda #$00
     sta $80
crloop3
     lda #$00
     sta ($80),y ;Store data
     iny ;Next byte
     bne crloop3 ;Branch if not done page
     inc $81 ;Next page
     lda $81
     cmp #$20 ;End at $1FFF
     bne crloop3 ;Branch if not

     ldy #$00 ;Clear Ram
     lda #$22 ;Start at $2200
     sta $81 
     lda #$00
     sta $80
crloop4
     lda #$00
     sta ($80),y ;Store data
     iny ;Next byte
     bne crloop4 ;Branch if not done page
     inc $81 ;Next page
     lda $81
     cmp #$27 ;End at $27FF
     bne crloop4 ;Branch if not

     ldx #$00
     lda #$00
crloop5     ;Clear 2100-213F, 2000-203F
     sta $2000,x
     sta $2100,x
     inx
     cpx #$40
     bne crloop5

     sta $80
     sta $81
     sta $82
     sta $83

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
     bmi pndetectvblankover ;  then wait for it to be over
     ldy #$00
     ldx #$00
pndetectvblankhappening
     lda MSTAT
     bmi pndetectinvblank   ;  if VBLANK starts, exit our counting loop 
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

     ; CTRL 76543210
     ; 7 colorburst kill
     ; 6,5 dma ctrl 2=normal DMA, 3=no DMA
     ; 4 character width 1=2 byte chars, 0=1 byte chars
     ; 3 border control 0=background color border, 1=black border
     ; 2 kangaroo mode 0=transparancy, 1=kangaroo
     ; 1,0 read mode 0=160x2/160x4 1=N/A 2=320B/320D 3=320A/320C

     ifconst DOUBLEWIDE
         lda #%01010000 ;Enable DMA, mode=160x2/160x4, 2x character width
     else
         lda #%01000000 ;Enable DMA, mode=160x2/160x4
     endif
     sta CTRL
     sta sCTRL

     jsr vblankresync

     ifconst pokeysupport
         ; pokey support is compiled in, so try to detect it...
         jsr detectpokeylocation
     endif

     ifnconst ONEBUTTONMODE
         ;Setup port B for two button reading, and turn on both joysticks...
         lda #$14
         sta CTLSWB
         lda #0
         sta SWCHB
     else
         lda #0
     endif
 
     ;max sprites displayed in any one frame before drawscreen is called...
     sta maxspritecount 

     ;Setup port A to read mode
     ;lda #$00
     ;sta SWCHA
     ;sta CTLSWA

     ifconst HSSUPPORT
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
     endif

     ifconst AVOXVOICE
         jsr silenceavoxvoice
     endif


     ifconst bankswitchmode
         ; we need to switch to the first bank before we jump there!
         ifconst MCPDEVCART
             lda #$18 ; xxx11nnn - switch to bank 0
             sta $3000
         else
             lda #0
             sta $8000
         endif
     endif

     jmp game


