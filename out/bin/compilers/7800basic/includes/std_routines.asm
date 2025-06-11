     ; Provided under the CC0 license. See the included LICENSE.txt for details.

     ;standard routimes needed for pretty much all games

     ; some definitions used with "set debug color"
DEBUGCALC     = $91
DEBUGWASTE     = $41
DEBUGDRAW     = $C1

     ;NMI and IRQ handlers
NMI
     ;VISIBLEOVER is 255 while the screen is drawn, and 0 right after the visible screen is done.
     pha ; save A
     cld
     lda visibleover
     eor #255
     sta visibleover
     ifconst DEBUGINTERRUPT
         and #$93
         sta BACKGRND
     endif
     txa ; save X
     pha
     tya ; save Y
     pha
     dec interruptindex 
     bne skipreallyoffvisible
     jmp reallyoffvisible
skipreallyoffvisible
     lda visibleover
     bne carryontopscreenroutine
     ifconst .bottomscreenroutine
         lda interrupthold
         beq skipbottomroutine
         jsr .bottomscreenroutine
skipbottomroutine
     endif
     jmp NMIexit
carryontopscreenroutine
     ifconst .topscreenroutine
         lda interrupthold
         beq skiptoproutine
         jsr .topscreenroutine
skiptoproutine
     endif
     ifnconst CANARYOFF
         lda canary
         beq skipcanarytriggered
         lda #$45
         sta BACKGRND
         jmp skipbrkolorset ; common crash dump routine, if available
skipcanarytriggered
     endif

     inc frameslost ; this is balanced with a "dec frameslost" when drawscreen is called.

     ; ** Other important routines that need to regularly run, and can run onscreen.
     ; ** Atarivox can't go here, because Maria might interrupt it while it's bit-banging.

     ifconst LONGCONTROLLERREAD
longcontrollerreads         ; ** controllers that take a lot of time to read. We use much of the visible screen here.
         ldy port1control
         lda longreadtype,y
         beq LLRET1
         tay
         lda longreadroutinehiP1,y
         sta inttemp4
         lda longreadroutineloP1,y
         sta inttemp3
         jmp (inttemp3)
LLRET1
         ldy port0control
         lda longreadtype,y
         beq LLRET0
         tay
         lda longreadroutinehiP0,y
         sta inttemp4
         lda longreadroutineloP0,y
         sta inttemp3
         jmp (inttemp3)
LLRET0


         ifconst PADDLERANGE
TIMEVAL             = PADDLERANGE
         else
TIMEVAL             = 160
         endif
TIMEOFFSET         = 10

     endif ; LONGCONTROLLERREAD


     jsr servicesfxchannels 
     ifconst MUSICTRACKER
         jsr servicesong
     endif ; MUSICTRACKER
     ifconst RMT
         ifnconst RMTOFFSPEED
             ifconst RMTPALSPEED
                 lda ntscslowframe
                 bne skiprasterupdate
             endif
         endif
         lda rasterpause
         beq skiprasterupdate
 ifconst PAUSESILENT
         lda pausestate 
         bne skiprasterupdate
 endif
         jsr RASTERMUSICTRACKER+3
skiprasterupdate
RMT_Iend
     endif

     inc framecounter
     lda framecounter
     and #63
     bne skipcountdownseconds
     lda countdownseconds
     beq skipcountdownseconds
     dec countdownseconds
skipcountdownseconds

     ldx #1
buttonreadloop
     txa
     pha
     ldy port0control,x
     lda buttonhandlerlo,y
     sta inttemp3
     lda buttonhandlerhi,y
     sta inttemp4
     ora inttemp3
     beq buttonreadloopreturn
     jmp (inttemp3)
buttonreadloopreturn
     pla
     tax
     dex
     bpl buttonreadloop

     ifconst DOUBLEBUFFER
         lda doublebufferminimumframeindex
         beq skipdoublebufferminimumframeindexadjust
         dec doublebufferminimumframeindex
skipdoublebufferminimumframeindexadjust
     endif
     
     jmp NMIexit

IRQ     ; the only source of non-nmi interrupt should be the BRK opcode.
     ifnconst BREAKPROTECTOFF
         lda #$1A
         sta BACKGRND
skipbrkolorset
skipbrkdetected
         lda #$60
         sta sCTRL
         sta CTRL
         ifnconst hiscorefont
             .byte $02 ; KIL/JAM
         else ; hiscorefont is present
             ifconst CRASHDUMP
                 bit MSTAT
                 bpl skipbrkdetected ; wait for vblank to ensure we're clear of NMI

                 ifconst dumpbankswitch
                     lda dumpbankswitch
                     pha
                 endif

                 ; bankswitch if needed, to get to the hiscore font
                 ifconst bankswitchmode
                     ifconst included.hiscore.asm.bank
                         ifconst MCPDEVCART
                             lda #($18 | included.hiscore.asm.bank)
                             sta $3000
                         else
                             lda #(included.hiscore.asm.bank)
                             sta $8000
                         endif
                     endif ; included.hiscore.asm.bank
                 endif ; bankswitchmode

                 ifconst DOUBLEBUFFER
                     ;turn off double-buffering, if on...
                     lda #>DLLMEM
                     sta DPPH
                     lda #<DLLMEM
                     sta DPPL
                 endif

                 lda #$00
                 sta P0C2

                 ;update the second-from-top DL...
                 ldy #8
NMIupdatetopDL
                 lda show2700,y
                 sta ZONE1ADDRESS,y
                 dey
                 bpl NMIupdatetopDL

                 ; the hiscore font is present, so we try to output the stack
                 ldy #0
copystackloop
                 pla
                 pha
                 lsr
                 lsr
                 lsr
                 lsr
                 tax
                 lda hiscorehexlut,x
                 sta $2700,y
                 iny

                 pla
                 and #$0F
                 tax
                 lda hiscorehexlut,x
                 sta $2700,y
                 iny

                 lda #27 ; period
                 sta $2700,y
                 iny

                 cpy #30
                 bne copystackloop

                 lda #>hiscorefont
                 sta CHARBASE
                 sta sCHARBASE
                 lda #%01000011 ;Enable DMA, mode=320A
                 sta CTRL
                 sta sCTRL
                 .byte $02 ; KIL/JAM
hiscorehexlut
                 ; 0 1 2 3 4 5 6 7 8 9 A B C D E F
                 .byte 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 0, 1, 2, 3, 4, 5
show2700
                 ; lo mode hi width=29 x EODL
                 .byte $00, %01100000, $27, 3, 20, 0,0,0
             else ; CRASHDUMP
                 .byte $02 ; KIL/JAM
             endif ; crashdump
         endif ; hiscorefont
     else
         RTI
     endif

     ifconst LONGCONTROLLERREAD

longreadtype
         .byte 0, 0, 0, 1 ; NONE PROLINE LIGHTGUN PADDLE
         .byte 2, 0, 3, 0 ; TRKBALL VCSSTICK DRIVING KEYPAD
         .byte 3, 3, 0, 0 ; STMOUSE AMOUSE ATARIVOX SNES

longreadroutineloP0
         .byte <LLRET0 ; 0 = no routine
         .byte <paddleport0update ; 1 = paddle
         .byte <trakball0update ; 2 = trakball
         .byte <mouse0update ; 3 = mouse

longreadroutinehiP0
         .byte >LLRET0 ; 0 = no routine
         .byte >paddleport0update ; 1 = paddle
         .byte >trakball0update ; 2 = trackball
         .byte >mouse0update ; 3 = mouse

longreadroutineloP1
         .byte <LLRET1 ; 0 = no routine
         .byte <paddleport1update ; 1 = paddle
         .byte <trakball1update ; 2 = trakball
         .byte <mouse1update ; 3 = mouse

longreadroutinehiP1
         .byte >LLRET1 ; 0 = no routine
         .byte >paddleport1update ; 1 = paddle
         .byte >trakball1update ; 2 = trackball
         .byte >mouse1update ; 3 = mouse


SETTIM64T
         bne skipdefaulttime
         ifnconst PADDLESMOOTHINGOFF
             lda #(TIMEVAL+TIMEOFFSET+1)
         else
             lda #(TIMEVAL+TIMEOFFSET)
         endif
skipdefaulttime
         tay
         dey
.setTIM64Tloop
         sta TIM64T
         cpy INTIM
         bne .setTIM64Tloop
         rts
     endif ; LONGCONTROLLERREAD

reallyoffvisible
     sta WSYNC

     lda #0
     sta visibleover
     ifconst DEBUGINTERRUPT
         sta BACKGRND
     endif

     lda #3
     sta interruptindex

     jsr uninterruptableroutines

     ifconst .userinterrupt
         lda interrupthold
         beq skipuserintroutine
         jsr .userinterrupt
skipuserintroutine
     endif

     ifconst KEYPADSUPPORT
         jsr keypadcolumnread
         jsr keypadrowselect
     endif

NMIexit
     pla
     tay
     pla
     tax
     pla
     RTI

clearscreen
     ldx #(WZONECOUNT-1)
     lda #0
clearscreenloop
     sta dlend,x
     dex
     bpl clearscreenloop
     lda #0
     sta valbufend ; clear the bcd value buffer
     sta valbufendsave 
     rts

restorescreen
     ldx #(WZONECOUNT-1)
     lda #0
restorescreenloop
     lda dlendsave,x
     sta dlend,x
     dex
     bpl restorescreenloop
     lda valbufendsave
     sta valbufend
     rts

savescreen
     ldx #(WZONECOUNT-1)
savescreenloop
     lda dlend,x
     sta dlendsave,x
     dex
     bpl savescreenloop
     lda valbufend
     sta valbufendsave
     ifconst DOUBLEBUFFER
         lda doublebufferstate
         beq savescreenrts
         lda #1
         sta doublebufferbufferdirty
savescreenrts
     endif ; DOUBLEBUFFER
     rts

drawscreen

     ifconst interrupthold
         lda #$FF
         sta interrupthold ; if the user called drawscreen, we're ready for interrupts
     endif

     lda #0
     sta temp1 ; not B&W if we're here...

drawscreenwait
     lda visibleover
     bne drawscreenwait ; make sure the visible screen isn't being drawn

     ;restore some registers in case the game changed them mid-screen...
     lda sCTRL
     ora temp1
     sta CTRL
     lda sCHARBASE
     sta CHARBASE

     ;ensure all of the display list is terminated...
     jsr terminatedisplaylist

     ifnconst pauseroutineoff
         jsr pauseroutine
     endif ; pauseroutineoff

     ; Make sure the visible screen has *started* before we exit. That way we can rely on drawscreen
     ; delaying a full frame, but still allowing time for basic calculations.
visiblescreenstartedwait
     lda visibleover
     beq visiblescreenstartedwait
visiblescreenstartedwaitdone
     dec frameslost ; ; this gets balanced with an "inc frameslost" by an NMI at the top of the screen
     rts

     ifnconst pauseroutineoff
         ; check to see if pause was pressed and released
pauseroutine
         lda pausedisable
         bne leavepauseroutine
         lda #8
         bit SWCHB
         beq pausepressed

         ifconst SNES0PAUSE
             lda port0control
             cmp #11
             bne skipsnes0pause
             lda snesdetected0
             beq skipsnes0pause
             lda snes2atari0hi
             and #%00010000
             beq pausepressed
skipsnes0pause
         endif
         ifconst SNES1PAUSE

             lda port1control
             cmp #11
             bne skipsnes1pause
             lda snesdetected1
             beq skipsnes1pause
             lda snes2atari1hi
             and #%00010000
             beq pausepressed
skipsnes1pause
         endif
         ifconst SNESNPAUSE
             ldx snesport
             lda port0control,x
             cmp #11
             bne skipsnesNpause
             lda snesdetected0,x
             beq skipsnesNpause
             lda snes2atari0hi,x
             and #%00010000
             beq pausepressed
skipsnesNpause
         endif
         ifconst MULTIBUTTONPAUSE
             ldx #1
multibuttonpauseloop
             lda port0control,x
             cmp #11
             bcc multibuttonpauseloopbottom
             lda sINPT1,x
             and #1
             beq pausepressed
multibuttonpauseloopbottom
             dex
             bpl multibuttonpauseloop
         endif ; MULTIBUTTONPAUSE

         ;pause isn't pressed
         lda #0
         sta pausebuttonflag ; clear pause hold state in case its set

         ;check if we're in an already paused state
         lda pausestate
         beq leavepauseroutine ; nope, leave

         cmp #1 ; last frame was the start of pausing
         beq enterpausestate2 ; move from state 1 to 2

         cmp #2
         beq carryonpausing

         ;pausestate must be >2, which means we're ending an unpause 
         lda #0
         sta pausebuttonflag 
         sta pausestate 
         lda sCTRL
         sta CTRL
         jmp leavepauseroutine

pausepressed
         ;pause is pressed
         lda pausebuttonflag
         cmp #$ff
         beq carryonpausing

         ;its a new press, increment the state
         inc pausestate

         ;silence volume at the start and end of pausing
         lda #0 
         sta AUDV0
         sta AUDV1

         ifconst pokeysupport
             ldy #7
pausesilencepokeyaudioloop
             sta (pokeybase),y
             dey
             bpl pausesilencepokeyaudioloop
         endif ; pokeysupport

         lda #$ff
         sta pausebuttonflag
         bne carryonpausing

enterpausestate2
         lda #2
         sta pausestate
         bne carryonpausing
leavepauseroutine
         lda sCTRL
         sta CTRL
         rts
carryonpausing
         ifconst .pause
             jsr .pause
         endif ; .pause
         lda sCTRL
         ora #%10000000 ; turn off colorburst during pause...
         sta CTRL
         jmp pauseroutine
     endif ; pauseroutineoff


     ifconst DOUBLEBUFFER
skipterminatedisplaylistreturn
         rts
     endif ; DOUBLEBUFFER
terminatedisplaylist
     ifconst DOUBLEBUFFER
         lda doublebufferstate
         bne skipterminatedisplaylistreturn ; double-buffering runs it's own DL termination code
     endif ; DOUBLEBUFFER
terminatedisplaybuffer
     ;add DL end entry on each DL
     ldx #(WZONECOUNT-1)
dlendloop
     ifconst VSCROLL
         ldy Xx3,x
         lda DLLMEM+11,y
     else  ; !VSCROLL
         lda DLPOINTL,x ;Get pointer to DL that this sprite starts in
     endif ; !VSCROLL
     ifconst DOUBLEBUFFER
         clc
         adc doublebufferdloffset
     endif ; DOUBLEBUFFER
     sta dlpnt
     ifconst VSCROLL
         lda DLLMEM+10,y
     else  ; !VSCROLL
         lda DLPOINTH,x
     endif ; !VSCROLL
     ifconst DOUBLEBUFFER
         adc #0
     endif ; DOUBLEBUFFER
     sta dlpnt+1
     ldy dlend,x
     lda #$00
dlendmoreloops
     iny
     sta (dlpnt),y
     ifconst FRAMESKIPGLITCHFIXWEAK
         cpy #DLLASTOBJ+1
         beq dlendthiszonedone
         iny
         iny
         iny
         iny
         iny
         sta (dlpnt),y
dlendthiszonedone
     endif FRAMESKIPGLITCHFIXWEAK
     ifconst FRAMESKIPGLITCHFIX
         iny
         iny
         iny
         iny
         cpy #DLLASTOBJ-1
         bcc dlendmoreloops
     endif ; FRAMESKIPGLITCHFIX
     dex
     bpl dlendloop

     ifnconst pauseroutineoff
         jsr pauseroutine
     endif ; pauseroutineoff
     rts

uninterruptableroutines
     ; this is for routines that must happen off the visible screen, each frame.

     ifconst AVOXVOICE
         jsr serviceatarivoxqueue
     endif
     ifconst MEGA7800SUPPORT
         ldx #1
mega7800polling
         lda port0control,x
         cmp #12 ; mega7800
         bne mega7800handlercheck2
         jsr mega7800handler
         jmp mega7800handlerdone
mega7800handlercheck2
     ifconst MULTIBUTTON
             cmp #1 ; proline
             bne mega7800handlerdone
             lda framecounter
             eor #7 ; avoid the same frame as the snes2atari probe
             and #63
             bne mega7800handlerdone
             lda #12
             sta port0control,x
             jsr mega7800handler
     endif ; MULTIBUTTON
mega7800handlerdone
         dex
         bpl mega7800polling
     endif ; MEGA7800SUPPORT

     lda #0
     sta palfastframe
     sta ntscslowframe
     ldy palframes
     iny
     ldx paldetected ; 0=ntsc 1=pal
     beq ntsc2palskipcheck
pal2ntscskipcheck
     cpy #5 ; every 5th frame, add a frame
     bne palframeskipdone
     beq frameskipdo
ntsc2palskipcheck
     cpy #6 ; every 6th frame, drop a frame
     bne palframeskipdone
frameskipdo
     inc ntscslowframe,x
     ldy #0
palframeskipdone
     sty palframes
skippalframeadjusting

     ifconst MUSICTRACKER
         ; We normally run the servicesong routine from the top-screen interrupt, but if it
         ; happens to interrupt the scheduling of a sound effect in the game code, we skip it.
         ; If that happens, we try again here. Chances are very small we'll run into the same
         ; problem twice, and if we do, we just drop a musical note or two.
         lda sfxschedulemissed
         beq servicesongwasnotmissed
         jsr servicesong
servicesongwasnotmissed
     endif ; MUSICTRACKER

     ifconst RMT
         ifnconst RMTPALSPEED
             ifnconst RMTOFFSPEED
 ifconst PAUSESILENT
         lda pausestate 
         bne skiprasterupdate2
 endif
                 lda palfastframe
                 beq skiprasterupdate2
                 lda rasterpause
                 beq skiprasterupdate2
                 jsr RASTERMUSICTRACKER+3
skiprasterupdate2
             endif
         endif
     endif

     rts

serviceatarivoxqueue
     ifconst AVOXVOICE
         lda voxlock
         bne skipvoxprocessing ; the vox is in the middle of speech address update
skipvoxqueuesizedec
         jmp processavoxvoice
skipvoxprocessing
         rts

processavoxvoice
         ifconst HSSUPPORT
             ; ** we skip speech if hi-score is on and no vox was detected
             ; ** this is to avoid later collision with snes pads.
             lda hsdevice
             and #2
             beq processavoxvoicereturn
         endif ; HSSUPPORT
         lda avoxenable
         bne avoxfixport
         SPKOUT tempavox
         rts
avoxfixport
         lda #0 ; restore the port to all bits as inputs...
         sta CTLSWA
         rts
silenceavoxvoice
         SPEAK avoxsilentdata
processavoxvoicereturn
         rts
avoxsilentdata
         .byte 31,255
     else
         rts
     endif ; AVOXVOICE

prolinebuttonpadhandler
     ifconst MULTIBUTTON
         lda framecounter
         and #63
         bne jbhandlercont1
         jsr setonebuttonmode
         lda #11
         sta port0control,x
         jsr snes2atari_signal_go
         lda port0control,x
         cmp #1 ; check if it's still a proline 
         beq jbhandlercont1
         jmp buttonreadloopreturn
jbhandlercont1
     lda #2
     sta multibuttoncount0,x
     endif ; MULTIBUTTON
joybuttonpadhandler
     lda sSWCHA             ; clear previous dirs for this pad, from
     ora SWCHA_DIRMASK,x    ; our sSWCHA nibble.
     sta sSWCHA
     lda SWCHA              ; load th actual joystick dirs, ensuring
     ora SWCHA_DIRMASK+1,x  ; we don't change the other nibble.
     and sSWCHA
     sta sSWCHA 
joybuttonhandler
     txa
     asl
     tay
     lda INPT0,y
     lsr
     ;ora #%00111111
     sta sINPT1,x
     lda INPT1,y
     and #%10000000
     ora sINPT1,x
     sta sINPT1,x

     lda INPT4,x
     bmi .skip1bjoyfirecheck
     ;one button joystick is down
     eor #%10000000
     sta sINPT1,x

     lda joybuttonmode
     and thisjoy2buttonbit,x
     beq .skip1bjoyfirecheck
     lda joybuttonmode
     ora thisjoy2buttonbit,x
     sta joybuttonmode
     sta SWCHB
.skip1bjoyfirecheck
     lda #%00111111
     ora sINPT1,x
     sta sINPT1,x ; ensure multibutton bits are hi
     jmp buttonreadloopreturn

SWCHA_DIRMASK
             ;  p0  p1  p0
         .byte $F0,$0F,$F0

gunbuttonhandler     ; outside of the conditional, so our button handler LUT is valid
     ifconst LIGHTGUNSUPPORT
         cpx #0
         bne secondportgunhandler
firstportgunhandler
         lda SWCHA
         asl 
         asl 
         asl ; shift D4 to D7
         and #%10000000
         eor #%10000000
         sta sINPT1
         jmp buttonreadloopreturn
secondportgunhandler
         lda SWCHA
         lsr ; shift D0 into carry
         lsr ; shift carry into D7
         and #%10000000
         eor #%10000000
         sta sINPT3
         jmp buttonreadloopreturn
     endif ; LIGHTGUNSUPPORT

controlsusing2buttoncode
     .byte 0 ; 00=no controller plugged in
     .byte 1 ; 01=proline joystick
     .byte 0 ; 02=lightgun
     .byte 0 ; 03=paddle
     .byte 1 ; 04=trakball
     .byte 1 ; 05=vcs joystick
     .byte 1 ; 06=driving control
     .byte 0 ; 07=keypad control
     .byte 0 ; 08=st mouse/cx80
     .byte 0 ; 09=amiga mouse
     .byte 1 ; 10=atarivox
     .byte 0 ; 11=snes2atari
     .byte 0 ; 12=mega7800

buttonhandlerhi
     .byte 0                        ; 00=no controller plugged in
     .byte >prolinebuttonpadhandler ; 01=proline joystick
     .byte >gunbuttonhandler        ; 02=lightgun
     .byte >paddlebuttonhandler     ; 03=paddle
     .byte >joybuttonhandler        ; 04=trakball
     .byte >joybuttonpadhandler     ; 05=vcs joystick
     .byte >joybuttonhandler        ; 06=driving control
     .byte 0                        ; 07=keypad
     .byte >mousebuttonhandler      ; 08=st mouse
     .byte >mousebuttonhandler      ; 09=amiga mouse
     .byte >joybuttonhandler        ; 10=atarivox
     .byte >snes2atarihandler       ; 11=snes
     .byte 0                        ; 12=mega7800
buttonhandlerlo
     .byte 0                        ; 00=no controller plugged in
     .byte <prolinebuttonpadhandler ; 01=proline joystick
     .byte <gunbuttonhandler        ; 02=lightgun 
     .byte <paddlebuttonhandler     ; 03=paddle
     .byte <joybuttonhandler        ; 04=trakball
     .byte <joybuttonpadhandler     ; 05=vcs joystick
     .byte <joybuttonhandler        ; 06=driving control
     .byte 0                        ; 07=keypad
     .byte <mousebuttonhandler      ; 08=st mouse
     .byte <mousebuttonhandler      ; 09=amiga mouse
     .byte <joybuttonhandler        ; 10=atarivox
     .byte <snes2atarihandler       ; 11=snes
     .byte 0                        ; 12=mega7800

drawwait
     bit visibleover ; 255 if screen is being drawn, 0 when not.
     bmi drawwait ; make sure the visible screen isn't being drawn
     rts

drawoverwait
     bit visibleover ; 255 if screen is being drawn, 0 when not.
     bpl drawoverwait ; make sure the visible screen is being drawn
     rts


mutetia
     lda #0
     ldx #3
mutetialoop
     sta sfx1pointlo,x
     sta AUDF0,x
     dex
     bpl mutetialoop
     rts

servicesfxchannelsdone
     ifnconst pokeysupport
         rts
     else
         jmp checkpokeyplaying
     endif
servicesfxchannels
 ifconst PAUSESILENT
     lda pausestate
     beq servicesfxchannels_1
     rts
servicesfxchannels_1
 endif
     ldx #255
servicesfxchannelsloop
     inx
     ifnconst TIASFXMONO
         cpx #2
     else
         cpx #1
     endif
     beq servicesfxchannelsdone

     lda sfxschedulelock ; =1 if locked
     bne servicesfxchannelsdone ; exit if a pointer may be mid-way change

     lda sfx1pointlo,x
     sta inttemp5
     ora sfx1pointhi,x
     beq servicesfxchannelsloop
     lda sfx1pointhi,x
     sta inttemp6

     lda sfx1tick,x
     beq servicesfx_cont1 ; this chunk is over, load the next!
     dec sfx1tick,x ; frame countdown is non-zero, subtract one
     jmp servicesfxchannelsloop
servicesfx_cont1

     ldy #1 ; check to see if they're changing the frame countdown
     lda (inttemp5),y
     cmp #$10
     bne servicesfx_cont1a
     ldy #2
     lda (inttemp5),y
     sta sfx1frames,x ; change the frame countdown
     lda #0
     sta sfx1tick,x
     ; advance the sound pointer by 3...
     lda sfx1pointlo,x
     clc
     adc #3
     sta sfx1pointlo,x
     lda sfx1pointhi,x
     adc #0
     sta sfx1pointhi,x
     ; and then fetch another sample for this channel...
     dex 
     jmp servicesfxchannelsloop
servicesfx_cont1a

     lda sfx1frames,x ; set the frame countdown for this sound chunk
     sta sfx1tick,x

     lda sfx1priority,x ; decrease the sound's priority if its non-zero
     beq servicesfx_cont2
     dec sfx1priority,x
servicesfx_cont2

     ldy #0 ; play the sound
     lda (inttemp5),y
     sta inttemp1

     ifconst MUSICTRACKER
         lda sfx1notedata,x
         beq exitmusictracker ; exit if this isn't a pitched instrument
         ldy #0
         sty inttemp2
         clc
         adc (inttemp5),y
         asl ; x2
         tay
         lda tiatrackeroctavenotes,y
         sta AUDC0,x
         iny
         lda tiatrackeroctavenotes,y
         sta AUDF0,x
         ldy #1
         jmp sfxvolumeentrypt
exitmusictracker
         lda inttemp1
     endif ; MUSICTRACKER

     clc
     adc sfx1poffset,x ; take into account any pitch modification
     sta AUDF0,x
     iny
     lda (inttemp5),y
     sta AUDC0,x
     sta inttemp2
     iny
sfxvolumeentrypt
     ifconst TIAVOLUME
         lda tiavolume
         asl
         asl
         asl
         asl
         sta fourbitfadevalueint
     endif ; TIAVOLUME
     lda (inttemp5),y
     ifconst TIAVOLUME
         jsr fourbitfadeint
     endif ; TIAVOLUME
     sta AUDV0,x
     cmp #$10
     bcs sfxsoundloop ; AUDV0>$0F means the sound is looped while priority is active

     ora inttemp2
     ora inttemp1 ; check if F|C|V=0
     beq zerosfx ; if so, we're at the end of the sound.

advancesfxpointer
     ; advance the pointer to the next sound chunk
     iny
     sty inttemp3
     clc
     lda sfx1pointlo,x
     adc inttemp3
     sta sfx1pointlo,x
     lda sfx1pointhi,x
     adc #0
     sta sfx1pointhi,x
     jmp servicesfxchannelsloop

sfxsoundloop
     pha
     lda sfx1priority,x
     bne sfxsoundloop_carryon
     pla ; fix the stack before we go
     jmp advancesfxpointer
sfxsoundloop_carryon
     pla
     and #$F0
     lsr
     lsr
     lsr
     lsr
     
zerosfx
     sta sfx1pointlo,x
     sta sfx1pointhi,x
     sta sfx1priority,x
     jmp servicesfxchannelsloop


schedulesfx
     ; called with sfxinstrumentlo=<data sfxinstrumenthi=>data sfxpitchoffset=pitch-offset sfxnoteindex=note index
     ldy #0
     ifconst pokeysupport
         lda sfxinstrumenthi
         beq scheduletiasfx   ; drums have undefined instrument
         lda (sfxinstrumentlo),y
         cmp #$20 ; POKEY?
         bne scheduletiasfx
         jmp schedulepokeysfx
     endif
scheduletiasfx
     ;cmp #$10 ; TIA?
     ;beq continuescheduletiasfx
     ; rts ; unhandled!!! 
continuescheduletiasfx
     ifnconst TIASFXMONO
         lda sfx1pointhi
         beq schedulesfx1 ;if channel 1 is idle, use it
         lda sfx2pointhi
         beq schedulesfx2 ;if channel 2 is idle, use it
         ; Both channels are scheduled. 
         lda sfxinstrumenthi
         beq skipscheduledrums
         ldy #1
         lda (sfxinstrumentlo),y
         bne interruptsfx
skipscheduledrums
         rts ; the new sound has 0 priority and both channels are busy. Skip playing it.
interruptsfx
         ;Compare which active sound has a lower priority. We'll interrupt the lower one.
         lda sfx1priority
         cmp sfx2priority
         bcs schedulesfx2
     endif ; !TIASFXMONO

schedulesfx1
     ldx #0 ; channel 1
     ifnconst TIASFXMONO
         beq skipschedulesfx2
schedulesfx2
         ldx #1 ; channel 2
skipschedulesfx2
     endif ; !TIASFXMONO

     ifconst MUSICTRACKER
         lda sfxnoteindex
         bpl skipdrumkitoverride
         and #$7F ; subtract 128
         sec
         sbc #4 ; drums start at 132, i.e. octave 10
         asl
         tay
         lda tiadrumkitdefinition,y
         sta sfxinstrumentlo
         iny
         lda tiadrumkitdefinition,y
         sta sfxinstrumenthi
         lda #0
         sta sfxnoteindex ; and tell the driver it's a non-pitched instrument
skipdrumkitoverride
     endif ; MUSICTRACKER
     ldy #1 ; get priority and sound-resolution (in frames)
     lda (sfxinstrumentlo),y
     sta sfx1priority,x
     iny
     lda (sfxinstrumentlo),y
     sta sfx1frames,x
     lda sfxinstrumentlo
     clc
     adc #3
     sta sfx1pointlo,x
     lda sfxinstrumenthi
     adc #0
     sta sfx1pointhi,x
     lda sfxpitchoffset
     sta sfx1poffset,x
     lda #0
     sta sfx1tick,x
     lda sfxnoteindex
     sta sfx1notedata,x
     rts

plotsprite
     ifnconst NODRAWWAIT
         ifconst DOUBLEBUFFER
             lda doublebufferstate
             bne skipplotspritewait
         endif ; DOUBLEBUFFER
         ifconst DEBUGWAITCOLOR
             lda #$41
             sta BACKGRND
         endif
plotspritewait
         lda visibleover
         bne plotspritewait
skipplotspritewait
         ifconst DEBUGWAITCOLOR
             lda #$0
             sta BACKGRND
         endif
     endif

     ;arguments: 
     ; temp1=lo graphicdata 
     ; temp2=hi graphicdata 
     ; temp3=palette | width byte
     ; temp4=x
     ; temp5=y
     ; temp6=mode
     lda temp5 ;Y position
     lsr ; 2 - Divide by 8 or 16
     lsr ; 2
     lsr ; 2
     if WZONEHEIGHT = 16
         lsr ; 2
     endif

     tax

     ifnconst NOLIMITCHECKING

         ; the next block allows for vertical masking, and ensures we don't overwrite non-DL memory

         cmp #WZONECOUNT

         bcc continueplotsprite1 ; the sprite is fully on-screen, so carry on...
         ; otherwise, check to see if the bottom half is in zone 0...

         if WZONEHEIGHT = 16
             cmp #15
         else
             cmp #31
         endif

         bne exitplotsprite1
         ldx #0
         jmp continueplotsprite2
exitplotsprite1
         rts

continueplotsprite1
     endif

     ifconst VSCROLL
         ldy Xx3,x
         lda DLLMEM+11,y
     else  ; !VSCROLL
         lda DLPOINTL,x ;Get pointer to DL that this sprite starts in
     endif ; !VSCROLL
     ifconst DOUBLEBUFFER
         clc
         adc doublebufferdloffset
     endif ; DOUBLEBUFFER
     sta dlpnt
     ifconst VSCROLL
         lda DLLMEM+10,y
     else  ; !VSCROLL
         lda DLPOINTH,x
     endif ; !VSCROLL
     ifconst DOUBLEBUFFER
         adc #0
     endif ; DOUBLEBUFFER
     sta dlpnt+1

     ;Create DL entry for upper part of sprite

     ldy dlend,x ;Get the index to the end of this DL

     ifconst CHECKOVERWRITE
         cpy #DLLASTOBJ
         beq checkcontinueplotsprite2
continueplotsprite1a
     endif

     lda temp1 ; graphic data, lo byte
     sta (dlpnt),y ;Low byte of data address

     ifnconst ATOMICSPRITEUPDATE
         iny
         lda temp6
         sta (dlpnt),y
     else
         iny
         sty temp8
     endif

     iny

     lda temp5 ;Y position
     and #(WZONEHEIGHT - 1)
     cmp #1 ; clear carry if our sprite is just in this zone
     ora temp2 ; graphic data, hi byte
     sta (dlpnt),y

     iny
     lda temp3 ;palette|width
     sta (dlpnt),y

     iny
     lda temp4 ;Horizontal position
     sta (dlpnt),y

     iny
     sty dlend,x

     ifconst ALWAYSTERMINATE
         iny
         lda #0
         sta (dlpnt),y
     endif

     ifconst ATOMICSPRITEUPDATE
         ldy temp8
         lda temp6
         sta (dlpnt),y
     endif

checkcontinueplotsprite2

     bcc doneSPDL ;branch if the sprite was fully in the last zone

     ;Create DL entry for lower part of sprite

     inx ;Next region

     ifnconst NOLIMITCHECKING
         cpx #WZONECOUNT

         bcc continueplotsprite2 ; the second half of the sprite is fully on-screen, so carry on...
         rts
continueplotsprite2
     endif

     ifconst VSCROLL
         ldy Xx3,x
         lda DLLMEM+11,y
     else  ; !VSCROLL
         lda DLPOINTL,x ;Get pointer to next DL
     endif ; !VSCROLL
     ifconst DOUBLEBUFFER
         clc
         adc doublebufferdloffset
     endif ; DOUBLEBUFFER
     sta dlpnt
     ifconst VSCROLL
         lda DLLMEM+10,y
     else  ; !VSCROLL
         lda DLPOINTH,x
     endif ; !VSCROLL
     ifconst DOUBLEBUFFER
         adc #0
     endif ; DOUBLEBUFFER
     sta dlpnt+1
     ldy dlend,x ;Get the index to the end of this DL

     ifconst CHECKOVERWRITE
         cpy #DLLASTOBJ
         bne continueplotsprite2a
         rts
continueplotsprite2a
     endif

     lda temp1 ; graphic data, lo byte
     sta (dlpnt),y

     ifnconst ATOMICSPRITEUPDATE
         iny
         lda temp6
         sta (dlpnt),y
     else
         iny
         sty temp8
     endif

     iny

     lda temp5 ;Y position
     anc #(WZONEHEIGHT - 1) ; undocumented. A=A&IMM, then move bit 7 into carry
     ora temp2 ; graphic data, hi byte
     sbc #(WZONEHEIGHT-1) ; start at the DMA hole. -1 because carry is clear
     sta (dlpnt),y

     iny

     lda temp3 ;palette|width
     sta (dlpnt),y

     iny

     lda temp4 ;Horizontal position
     sta (dlpnt),y

     iny
     sty dlend,x

     ifconst ALWAYSTERMINATE
         iny
         lda #0
         sta (dlpnt),y
     endif

     ifconst ATOMICSPRITEUPDATE
         ldy temp8
         lda temp6
         sta (dlpnt),y
     endif

doneSPDL
     rts

     ifconst VSCROLL
     ; x3 table for fast DLL parsing
Xx3
         .byte  0,3,6,9,12,15,18,21,24,27
         .byte 30,33,36,39,42,45,48,51,54,57
         .byte 60,63,66,69,72,75,78,81,84,87
maskscrollsprite
         .byte $00,%11000000,($D0+WZONEHEIGHT),0,160  ; 5*2 + 32*3 = 106 cycles
         .byte $00,1,($D0+WZONEHEIGHT),160            ; 4*2 + 31*3 = 101 cycles 
         .byte $00,1,($D0+WZONEHEIGHT),160            ; 4*2 + 31*3 = 101 cycles 
         .byte $00,1,($D0+WZONEHEIGHT),160            ; 4*2 + 31*3 = 101 cycles 
         .byte $00,%01000000,($D0+WZONEHEIGHT),16,160 ; 5*2 + 16*3 =  58 cycles
	                                         ; MAX  ============ 467 cycles
	                                         ; MIN  ============  59 cycles
maskscrollspriteend
     endif ; VSCROLL

lockzonex
     ifconst ZONELOCKS
         ldy dlend,x
         cpy #DLLASTOBJ
         beq lockzonexreturn ; the zone is either stuffed or locked. abort!
         lda DLPOINTL,x
         ifconst DOUBLEBUFFER
             clc
             adc doublebufferdloffset
         endif ; DOUBLEBUFFER
         sta dlpnt
         lda DLPOINTH,x
         ifconst DOUBLEBUFFER
             adc #0
         endif ; DOUBLEBUFFER
         sta dlpnt+1
         iny
         lda #0
         sta (dlpnt),y
         dey
         tya
         ldy #(DLLASTOBJ-1)
         sta (dlpnt),y
         iny
         sty dlend,x
lockzonexreturn
         rts
     endif ; ZONELOCKS
unlockzonex
     ifconst ZONELOCKS
         ldy dlend,x
         cpy #DLLASTOBJ
         bne unlockzonexreturn ; if the zone isn't stuffed, it's not locked. abort!
         lda DLPOINTL,x
         ifconst DOUBLEBUFFER
             clc
             adc doublebufferdloffset
         endif ; DOUBLEBUFFER
         sta dlpnt
         lda DLPOINTH,x
         ifconst DOUBLEBUFFER
             adc #0
         endif ; DOUBLEBUFFER
         sta dlpnt+1
         dey
         lda (dlpnt),y
         tay
         sty dlend,x
unlockzonexreturn
     endif ; ZONELOCKS
     rts

plotcharloop
     ; ** read from a data indirectly pointed to from temp8,temp9
     ; ** format is: lo_data, hi_data, palette|width, x, y
     ; ** format ends with lo_data | hi_data = 0

     ifconst DOUBLEBUFFER
         lda doublebufferstate
         bne skipplotcharloopwait
     endif ; DOUBLEBUFFER
     ifconst DEBUGWAITCOLOR
         lda #$61
         sta BACKGRND
     endif
plotcharloopwait
     lda visibleover
     bne plotcharloopwait
     ifconst DEBUGWAITCOLOR
         lda #0
         sta BACKGRND
     endif
skipplotcharloopwait
plotcharlooploop
     ldy #0
     lda (temp8),y
     sta temp1
     iny
     lda (temp8),y
     sta temp2
     ora temp1
     bne plotcharloopcontinue
     ;the pointer=0, so return
     rts
plotcharloopcontinue
     iny
     lda (temp8),y
     sta temp3
     iny
     lda (temp8),y
     sta temp4
     iny
     lda (temp8),y
     ;sta temp5 ; not needed with our late entry.
     jsr plotcharactersskipentry
     lda temp8
     clc
     adc #5
     sta temp8
     lda temp9
     adc #0
     sta temp9
     jmp plotcharlooploop

plotcharacters
     ifconst DOUBLEBUFFER
         lda doublebufferstate
         bne skipplotcharacterswait
     endif ; DOUBLEBUFFER
     ifconst DEBUGWAITCOLOR
         lda #$41
         sta BACKGRND
     endif
plotcharacterswait
     lda visibleover
     bne plotcharacterswait
     ifconst DEBUGWAITCOLOR
         sta BACKGRND
     endif
skipplotcharacterswait
     ;arguments: 
     ; temp1=lo charactermap
     ; temp2=hi charactermap
     ; temp3=palette | width byte
     ; temp4=x
     ; temp5=y

     lda temp5 ;Y position

plotcharactersskipentry

     ;ifconst ZONEHEIGHT
     ; if ZONEHEIGHT = 16
     ; and #$0F
     ; endif
     ; if ZONEHEIGHT = 8
     ; and #$1F
     ; endif
     ;else
     ; and #$0F
     ;endif

     tax
     
    ifconst VSCROLL
         ldy Xx3,x
         lda DLLMEM+11,y
     else  ; !VSCROLL
         lda DLPOINTL,x ;Get pointer to DL that the characters are in
     endif ; !VSCROLL
     ifconst DOUBLEBUFFER
         clc
         adc doublebufferdloffset
     endif ; DOUBLEBUFFER
     sta dlpnt
     ifconst VSCROLL
         lda DLLMEM+10,y
     else  ; !VSCROLL
         lda DLPOINTH,x
     endif ; !VSCROLL
     ifconst DOUBLEBUFFER
         adc #0
     endif ; DOUBLEBUFFER
     sta dlpnt+1

     ;Create DL entry for the characters

     ldy dlend,x ;Get the index to the end of this DL

     ifconst CHECKOVERWRITE
         cpy #DLLASTOBJ
         bne continueplotcharacters
         rts
continueplotcharacters
     endif

     lda temp1 ; character map data, lo byte
     sta (dlpnt),y ;(1) store low address

     iny
     lda charactermode 
     sta (dlpnt),y ;(2) store mode

     iny
     lda temp2 ; character map, hi byte
     sta (dlpnt),y ;(3) store high address

     iny
     lda temp3 ;palette|width
     sta (dlpnt),y ;(4) store palette|width

     iny
     lda temp4 ;Horizontal position
     sta (dlpnt),y ;(5) store horizontal position

     iny
     sty dlend,x ; save display list end byte
     rts


     ifconst plotvalueonscreen
plotcharacterslive
         ; a version of plotcharacters that draws live and minimally disrupts the screen...

         ;arguments: 
         ; temp1=lo charactermap
         ; temp2=hi charactermap
         ; temp3=palette | width byte
         ; temp4=x
         ; temp5=y

         lda temp5 ;Y position

         tax

         ifconst VSCROLL
             ldy Xx3,x
             lda DLLMEM+11,y
         else  ; !VSCROLL
             lda DLPOINTL,x ;Get pointer to DL that the characters are in
         endif ; !VSCROLL
         ifconst DOUBLEBUFFER
             clc
             adc doublebufferdloffset
         endif ; DOUBLEBUFFER
         sta dlpnt
         ifconst VSCROLL
             lda DLLMEM+10,y
         else  ; !VSCROLL
             lda DLPOINTH,x
         endif ; !VSCROLL
         ifconst DOUBLEBUFFER
             adc #0
         endif ; DOUBLEBUFFER
         sta dlpnt+1

         ;Create DL entry for the characters

         ldy dlend,x ;Get the index to the end of this DL

         ifconst CHECKOVERWRITE
             cpy #DLLASTOBJ
             bne continueplotcharacterslive
             rts
continueplotcharacterslive
         endif

         lda temp1 ; character map data, lo byte
         sta (dlpnt),y ;(1) store low address

         iny
         ; we don't add the second byte yet, since the charmap could briefly
         ; render without a proper character map address, width, or position.
         lda charactermode 
         sta (dlpnt),y ;(2) store mode

         iny
         lda temp2 ; character map, hi byte
         sta (dlpnt),y ;(3) store high address

         iny
         lda temp3 ;palette|width
         sta (dlpnt),y ;(4) store palette|width

         iny
         lda temp4 ;Horizontal position
         sta (dlpnt),y ;(5) store horizontal position

         iny
         sty dlend,x ; save display list end byte

         rts
     endif ;plotcharacterslive

     ifconst USED_PLOTVALUE
plotvalue
         ; calling 7800basic command:
         ; plotvalue digit_gfx palette variable/data number_of_digits screen_x screen_y
         ; ...displays the variable as BCD digits
         ;
         ; asm sub arguments: 
         ; temp1=lo charactermap
         ; temp2=hi charactermap
         ; temp3=palette | width byte
         ; temp4=x
         ; temp5=y
         ; temp6=number of digits
         ; temp7=lo variable
         ; temp8=hi variable
         ; temp9=character mode

plotdigitcount         = temp6

         ifconst ZONELOCKS
             ldx temp5
             ldy dlend,x
             cpy #DLLASTOBJ
             bne carryonplotvalue
             rts
carryonplotvalue
         endif

         lda #0
         tay
         ldx valbufend

         lda plotdigitcount
         and #1
         beq pvnibble2char
         lda #0
         sta VALBUFFER,x ; just in case we skip this digit
         beq pvnibble2char_skipnibble

pvnibble2char
         ; high nibble...
         lda (temp7),y
         and #$f0 
         lsr
         lsr
         lsr
         ifnconst DOUBLEWIDE ; multiply value by 2 for double-width
             lsr
         endif

         clc
         adc temp1 ; add the offset to character graphics to our value
         sta VALBUFFER,x
         inx
         dec plotdigitcount

pvnibble2char_skipnibble
         ; low nibble...
         lda (temp7),y
         and #$0f 
         ifconst DOUBLEWIDE ; multiply value by 2 for double-width
             asl
         endif
         clc
         adc temp1 ; add the offset to character graphics to our value
         sta VALBUFFER,x 
         inx
         iny

         dec plotdigitcount
         bne pvnibble2char

         ;point to the start of our valuebuffer
         clc
         lda #<VALBUFFER
         adc valbufend
         sta temp1
         lda #>VALBUFFER
         adc #0
         sta temp2

         ;advance valbufend to the end of our value buffer
         stx valbufend

         ifnconst plotvalueonscreen
             jmp plotcharacters
         else
             jmp plotcharacterslive
         endif

     endif ; USED_PLOTVALUE


     ifconst USED_PLOTVALUEEXTRA
plotdigitcount         = temp6
plotvalueextra
         ; calling 7800basic command:
         ; plotvalue digit_gfx palette variable/data number_of_digits screen_x screen_y
         ; ...displays the variable as BCD digits
         ;
         ; asm sub arguments: 
         ; temp1=lo charactermap
         ; temp2=hi charactermap
         ; temp3=palette | width byte
         ; temp4=x
         ; temp5=y
         ; temp6=number of digits
         ; temp7=lo variable
         ; temp8=hi variable

         lda #0
         tay
         ldx valbufend
         ifnconst plotvalueonscreen
             sta VALBUFFER,x
         endif

         lda plotdigitcount
         and #1
         
         bne pvnibble2char_skipnibbleextra

pvnibble2charextra
         ; high nibble...
         lda (temp7),y
         and #$f0 
         lsr
         lsr
         ifnconst DOUBLEWIDE ; multiply value by 2 for double-width
             lsr
         endif
         clc
         adc temp1 ; add the offset to character graphics to our value
         sta VALBUFFER,x
         inx

         ; second half of the digit
         clc
         adc #1
         sta VALBUFFER,x
         inx
         dec plotdigitcount

pvnibble2char_skipnibbleextra
         ; low nibble...
         lda (temp7),y
         and #$0f 
         ifconst DOUBLEWIDE ; multiply value by 2 for double-width
             asl
         endif
         asl

         clc
         adc temp1 ; add the offset to character graphics to our value
         sta VALBUFFER,x 
         inx

         clc
         adc #1
         sta VALBUFFER,x
         inx
         iny

         dec plotdigitcount
         bne pvnibble2charextra

         ;point to the start of our valuebuffer
         clc
         lda #<VALBUFFER
         adc valbufend
         sta temp1
         lda #>VALBUFFER
         adc #0
         sta temp2

         ;advance valbufend to the end of our value buffer
         stx valbufend

         ifnconst plotvalueonscreen
             jmp plotcharacters
         else
             jmp plotcharacterslive
         endif
     endif ; USED_PLOTVALUEEXTRA

boxcollision
     ifconst BOXCOLLISION
         ; the worst case cycle-time for the code below is 43 cycles.
         ; unfortunately, prior to getting here we've burned 44 cycles in argument setup. eep!

         ;__boxx1 = accumulator
         ;__boxy1 = y
__boxw1 = temp3
__boxh1 = temp4

__boxx2 = temp5
__boxy2 = temp6
__boxw2 = temp7
__boxh2 = temp8

DoXCollisionCheck
         ;lda __boxx1 ; skipped. already in the accumulator
         cmp __boxx2 ;3
         bcs X1isbiggerthanX2 ;2/3
X2isbiggerthanX1
         ; carry is clear
         adc __boxw1 ;3
         cmp __boxx2 ;3
         bcs DoYCollisionCheck ;3/2
         rts ;6 - carry clear, no collision
X1isbiggerthanX2
         clc ;2
         sbc __boxw2 ;3
         cmp __boxx2 ;3
         bcs noboxcollision ;3/2
DoYCollisionCheck
         tya ; 2 ; use to be "lda __boxy1"
         cmp __boxy2 ;3
         bcs Y1isbiggerthanY2 ;3/2
Y2isbiggerthanY1
         ; carry is clear
         adc __boxh1 ;3
         cmp __boxy2 ;3
         rts ;6 
Y1isbiggerthanY2
         clc ;2
         sbc __boxh2 ;3
         cmp __boxy2 ;3
         bcs noboxcollision ;3/2
yesboxcollision
         sec ;2
         rts ;6
noboxcollision
         clc ;2
         rts ;6
     endif ; BOXCOLLISION

randomize
     lda rand
     lsr
     rol rand16
     bcc noeor
     eor #$B4
noeor
     sta rand
     eor rand16
     rts

     ; *** bcd conversion routine courtesy Omegamatrix
     ; *** http://atariage.com/forums/blog/563/entry-10832-hex-to-bcd-conversion-0-99/
 ifconst .calledfunction_converttobcd
converttobcd
     ;value to convert is in the accumulator
     sta temp1
     lsr
     adc temp1
     ror
     lsr
     lsr
     adc temp1
     ror
     adc temp1
     ror
     lsr
     and #$3C
     sta temp2
     lsr
     adc temp2
     adc temp1 
     rts ; return the result in the accumulator
 endif ; .calledfunction_converttobcd

 ifconst .calledfunction_mul8
     ; Y and A contain multiplicands, result in A
mul8
     sty temp1
     sta temp2
     lda #0
reptmul8
     lsr temp2
     bcc skipmul8
     clc
     adc temp1
     ;bcs donemul8 might save cycles?
skipmul8
     ;beq donemul8 might save cycles?
     asl temp1
     bne reptmul8
donemul8
     rts
 endif ; .calledfunction_mul8

 ifconst .calledfunction_div8
div8
     ; A=numerator Y=denominator, result in A
     cpy #2
     bcc div8end+1;div by 0 = bad, div by 1=no calc needed, so bail out
     sty temp1
     ldy #$ff
div8loop
     sbc temp1
     iny
     bcs div8loop
div8end
     tya
     ; result in A
     rts
 endif ; .calledfunction_div8

 ifconst .calledfunction_mul16
     ; Y and A contain multiplicands, result in temp2,A=low, temp1=high
mul16
     sty temp1
     sta temp2

     lda #0
     ldx #8
     lsr temp1
mul16_1
     bcc mul16_2
     clc
     adc temp2
mul16_2
     ror
     ror temp1
     dex
     bne mul16_1
     sta temp2
     rts
 endif ; .calledfunction_mul16

 ifconst .calledfunction_div16
     ; div int/int
     ; numerator in A, denom in temp1
     ; returns with quotient in A, remainder in temp1
div16
     sta temp2
     sty temp1
     lda #0
     ldx #8
     asl temp2
div16_1
     rol
     cmp temp1
     bcc div16_2
     sbc temp1
div16_2
     rol temp2
     dex
     bne div16_1
     sta temp1
     lda temp2
     rts
 endif ; .calledfunction_div16

     ifconst bankswitchmode
BS_jsr
         ifconst dumpbankswitch
             sta dumpbankswitch
         endif
         ifconst MCPDEVCART
             ora #$18
             sta $3000
         else
             sta $8000
         endif
         pla
         tax
         pla
         rts

BS_return
         pla ; bankswitch bank
         ifconst dumpbankswitch
             sta dumpbankswitch
         endif
         ifconst BANKRAM
             sta currentbank
             ora currentrambank
         endif
         ifconst MCPDEVCART
             ora #$18
             sta $3000
         else
             sta $8000
         endif
         pla ; bankswitch $0 flag
         rts 
     endif

checkselectswitch
     lda SWCHB ; check the real select switch...
     and #%00000010
checkselectswitchreturn
     rts

checkresetswitch
     lda SWCHB ; check the real reset switch...
     and #%00000001
     rts

     ifconst FINESCROLLENABLED
finescrolldlls
         ldx temp1 ; first DLL index x3
         lda DLLMEM,x
         and #%11110000
         ora finescrolly
         sta DLLMEM,x

         ldx temp2 ; last DLL index x3
         lda DLLMEM,x
         and #%11110000
         ora finescrolly
         eor #(WZONEHEIGHT-1)
         sta DLLMEM,x
         rts
     endif ; FINESCROLLENABLED

     ifconst USED_ADJUSTVISIBLE
adjustvisible
         ; called with temp1=first visible zone *3, temp2=last visible zone *3
         jsr waitforvblankstart ; ensure vblank just started
         ldx visibleDLLstart
findfirstinterrupt
         lda DLLMEM,x
         bmi foundfirstinterrupt
         inx
         inx
         inx
         bne findfirstinterrupt
foundfirstinterrupt
         and #%01111111 ; clear the interrupt bit
         sta DLLMEM,x
         ifconst DOUBLEBUFFER
             sta DLLMEM+DBOFFSET,x
         endif ; DOUBLEBUFFER
         ldx overscanDLLstart
findlastinterrupt
         lda DLLMEM,x
         bmi foundlastinterrupt
         dex
         dex
         dex
         bne findlastinterrupt
foundlastinterrupt
         and #%01111111 ; clear the interrupt bit
         sta DLLMEM,x
         ifconst DOUBLEBUFFER
             sta DLLMEM+DBOFFSET,x
         endif ; DOUBLEBUFFER
         ;now we need to set the new interrupts
         clc
         lda temp1
         adc visibleDLLstart
         tax
         lda DLLMEM,x
         ora #%10000000
         sta DLLMEM,x
         ifconst DOUBLEBUFFER
             sta DLLMEM+DBOFFSET,x
         endif ; DOUBLEBUFFER
         clc
         lda temp2
         adc visibleDLLstart
         tax
         lda DLLMEM,x
         ora #%10000000
         sta DLLMEM,x
         ifconst DOUBLEBUFFER
             sta DLLMEM+DBOFFSET,x
         endif ; DOUBLEBUFFER
         jsr vblankresync
         rts
     endif ; USED_ADJUSTVISIBLE

vblankresync
     jsr waitforvblankstart ; ensure vblank just started
     lda #0
     sta visibleover
     lda #3
     sta interruptindex
     rts

createallgamedlls
     ldy #(DLLLUTEND-DLLLUT)
createallgamedllsloop
     dey
     lda DLLLUT,y
     sta DLLMEM,y
  ifconst DOUBLEBUFFER
     sta DLLMEM+DBOFFSET,y
  endif ; DOUBLEBUFFER
     cpy #0
     bne createallgamedllsloop

  ifconst DOUBLEBUFFER
     ldy #(DLLLUTNONVISSTART-DLLLUTVISSTART)
fixdoublebuffer
     dey
     lda DLLMEM+DBOFFSET+DLLLUTVISSTART-DLLLUT,y
     clc
     adc #DOUBLEBUFFEROFFSET
     sta DLLMEM+DBOFFSET+DLLLUTVISSTART-DLLLUT,y
     dey
     lda DLLMEM+DBOFFSET+DLLLUTVISSTART-DLLLUT,y
     adc #0
     sta DLLMEM+DBOFFSET+DLLLUTVISSTART-DLLLUT,y
     dey
     bne fixdoublebuffer
 endif

  ifconst BANKSET_DL_IN_CARTRAM 
     ; N.B. banksets doesn't in-fact allow DL in cart-ram, so this conditional
     ; is always skipped. This is here in case some day the limitation is
     ; worked around, but it's untested. 

     ; With bankset cart ram, we added $8000 to the DL address so plot 
     ; functions would hit the cart-ram write-address. We need to subtract $80
     ; so Maria will read from the cart-ram read-address.
     ldy #(DLLLUTNONVISSTART-DLLLUTVISSTART)
fixbanksetaddresses
     dey
     dey
     lda DLLMEM+DLLLUTVISSTART-DLLLUT,y
     and #%01111111
     sta DLLMEM+DLLLUTVISSTART-DLLLUT,y
  ifconst DOUBLEBUFFER
     lda DLLMEM+DBOFFSET+DLLLUTVISSTART-DLLLUT,y
     and #%01111111
     sta DLLMEM+DBOFFSET+DLLLUTVISSTART-DLLLUT,y
  endif ; DOUBLEBUFFER
     dey
     bne fixbanksetaddresses
  endif ; BANKSET_DL_IN_CARTRAM

     lda paldetected
     beq skippaladjust
     lda #($0F|(WZONEHEIGHT*4)) ; +15 lines
     sta DLLMEM+6
 ifconst DOUBLEBUFFER
     sta DLLMEM+DBOFFSET+6
 endif
  if WSCREENHEIGHT = 192
     lda #($0D|(WZONEHEIGHT*4)) ; +6 lines
  else
     lda #($07|(WZONEHEIGHT*4)) ; +6 lines
  endif ; 
     sta DLLMEM+3
 ifconst DOUBLEBUFFER
     sta DLLMEM+DBOFFSET+3
 endif ; DOUBLEBUFFER

skippaladjust

     ; save the DL markers...
     lda #(DLLLUTVISSTART-DLLLUT)
     sta visibleDLLstart
     lda #(DLLLUTNONVISSTART-DLLLUT)
     sta overscanDLLstart
     rts

     ; N.B. max DLL length is 112 bytes (for double-buffered)

DLLLUT
  if WSCREENHEIGHT = 192
     .byte ($0F|(WZONEHEIGHT*4)),$21,$00 ; 16 blank lines
     .byte ($07|(WZONEHEIGHT*4)),$21,$00 ;  8 blank lines
     .byte ($00|(WZONEHEIGHT*4)),$21,$00 ;  1 blank lines 
                                         ;=25 blank lines
  endif ; WSCREENHEIGHT = 192
  if WSCREENHEIGHT = 208
     .byte ($0E|(WZONEHEIGHT*4)),$21,$00 ; 15 blank lines
     .byte ($00|(WZONEHEIGHT*4)),$21,$00 ;  1 blank lines
     .byte ($00|(WZONEHEIGHT*4)),$21,$00 ;  1 blank lines 
                                         ;=17 blank lines
  endif ; WSCREENHEIGHT = 208
  if WSCREENHEIGHT = 224
     .byte ($06|(WZONEHEIGHT*4)),$21,$00 ;  7 blank lines
     .byte ($00|(WZONEHEIGHT*4)),$21,$00 ;  1 blank lines
     .byte ($00|(WZONEHEIGHT*4)),$21,$00 ;  1 blank lines 
                                         ;= 9 blank lines
  endif ; WSCREENHEIGHT = 224

DLLLUTVISSTART
     .byte ($80|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE0ADDRESS,<ZONE0ADDRESS
     ;       ^--NMI 1: start of visible
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE1ADDRESS,<ZONE1ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE2ADDRESS,<ZONE2ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE3ADDRESS,<ZONE3ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE4ADDRESS,<ZONE4ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE5ADDRESS,<ZONE5ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE6ADDRESS,<ZONE6ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE7ADDRESS,<ZONE7ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE8ADDRESS,<ZONE8ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE9ADDRESS,<ZONE9ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE10ADDRESS,<ZONE10ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE11ADDRESS,<ZONE11ADDRESS
  ifconst ZONE12ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE12ADDRESS,<ZONE12ADDRESS
  endif
  ifconst ZONE13ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE13ADDRESS,<ZONE13ADDRESS
  endif
  ifconst ZONE14ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE14ADDRESS,<ZONE14ADDRESS
  endif
  ifconst ZONE15ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE15ADDRESS,<ZONE15ADDRESS
  endif
  ifconst ZONE16ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE16ADDRESS,<ZONE16ADDRESS
  endif
  ifconst ZONE17ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE17ADDRESS,<ZONE17ADDRESS
  endif
  ifconst ZONE18ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE18ADDRESS,<ZONE18ADDRESS
  endif
  ifconst ZONE19ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE19ADDRESS,<ZONE19ADDRESS
  endif
  ifconst ZONE20ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE20ADDRESS,<ZONE20ADDRESS
  endif
  ifconst ZONE21ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE21ADDRESS,<ZONE21ADDRESS
  endif
  ifconst ZONE22ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE22ADDRESS,<ZONE22ADDRESS
  endif
  ifconst ZONE23ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE23ADDRESS,<ZONE23ADDRESS
  endif
  ifconst ZONE24ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE24ADDRESS,<ZONE24ADDRESS
  endif
  ifconst ZONE25ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE25ADDRESS,<ZONE25ADDRESS
  endif
  ifconst ZONE26ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE26ADDRESS,<ZONE26ADDRESS
  endif
  ifconst ZONE27ADDRESS
     .byte ($00|(WZONEHEIGHT*4)|(WZONEHEIGHT-1)),>ZONE27ADDRESS,<ZONE27ADDRESS
  endif
DLLLUTNONVISSTART
     .byte ($83|(WZONEHEIGHT*4)),$21,$00 ;  4 blank lines
     ;       ^--NMI 2: start of non-visible
     .byte ($8F|(WZONEHEIGHT*4)),$21,$00 ; 16 blank lines
     ;       ^--NMI 3: start of overscan
     .byte ($0F|(WZONEHEIGHT*4)),$21,$00 ; 16 blank lines
     .byte ($0F|(WZONEHEIGHT*4)),$21,$00 ; 16 blank lines
     .byte ($0F|(WZONEHEIGHT*4)),$21,$00 ; 16 blank lines
DLLLUTEND
  ;echo "DLL size: ",[(DLLLUTEND-DLLLUT)]d,"bytes"
  ;echo "DLL code size: ",[(DLLLUTEND-createallgamedlls)]d,"bytes"

waitforvblankstart
vblankendwait
     BIT MSTAT
     bmi vblankendwait
vblankstartwait
     BIT MSTAT
     bpl vblankstartwait
     rts

     ifconst DOUBLEBUFFER
flipdisplaybufferreturn
         rts
flipdisplaybuffer
         ifconst interrupthold
             lda #$FF
             sta interrupthold
         endif
         lda doublebufferstate
         beq flipdisplaybufferreturn ; exit if we're not in double-buffer

         jsr terminatedisplaybuffer ; terminate the working buffer before we flip

         lda doublebufferstate
         lsr ; /2, so we'll see 0 or 1, rather than 1 or 3
         tax

         ; ensure we don't flip mid-display. otherwise the displayed DL will be the one the game is working on.

flipdisplaybufferwait1
         lda visibleover
         beq flipdisplaybufferwait1

flipdisplaybufferwait
         lda visibleover
         bne flipdisplaybufferwait

         lda doublebufferminimumframetarget
         beq skipminimumframecode
         lda doublebufferminimumframeindex
         bne flipdisplaybufferwait1
         lda doublebufferminimumframetarget
         sta doublebufferminimumframeindex
skipminimumframecode

         lda DLLMEMLutHi,x
         sta DPPH
         lda DLLMEMLutLo,x
         sta DPPL

         lda NewPageflipstate,x
         sta doublebufferstate
         lda NewPageflipoffset,x
         sta doublebufferdloffset

         ifnconst BANKSET_DL_IN_CARTRAM
             lda doublebufferbufferdirty
             beq flipdisplaybufferreturn

             ; The doublebuffer buffer is dirty, so the game code must have issued a savescreen recently.
             ; To make savescreen work with the new working buffer, we need to copy over the saved objects
             ; from the displayed buffer to the working buffer...

             lda doublebufferdloffset
             eor #DOUBLEBUFFEROFFSET
             sta temp6 ; make temp6 the anti-doublebufferdloffset variable
             
             ldx #(WZONECOUNT-1)
copybufferzoneloop

             lda DLPOINTL,x
             clc
             adc doublebufferdloffset
             sta temp1
             lda DLPOINTH,x
             adc #0
             sta temp2

             lda DLPOINTL,x
             clc
             adc temp6
             sta temp3
             lda DLPOINTH,x
             adc #0
             sta temp4

             lda dlendsave,x
             tay
copybuffercharsloop
             lda (temp3),y
             sta (temp1),y
             dey
             bpl copybuffercharsloop
             dex
             bpl copybufferzoneloop
             lda #0
             sta doublebufferbufferdirty
         endif ; ! BANKSET_DL_IN_CARTRAM
         rts

doublebufferoff
         lda #1
         sta doublebufferstate
         jsr flipdisplaybuffer
         lda #0
         sta doublebufferstate
         sta doublebufferdloffset
         rts

DLLMEMLutLo
         .byte <DLLMEM,<(DLLMEM+DBOFFSET)
DLLMEMLutHi
         .byte >DLLMEM,>(DLLMEM+DBOFFSET)
NewPageflipstate
         .byte 3,1
NewPageflipoffset
         .byte DOUBLEBUFFEROFFSET,0

     endif ; DOUBLEBUFFER

     ifconst MOUSESUPPORT

rotationalcompare
         ; old = 00 01 10 11
         .byte $00, $01, $ff, $00 ; new=00
         .byte $ff, $00, $00, $01 ; new=01
         .byte $01, $00, $00, $ff ; new=10
         .byte $00, $ff, $01, $00 ; new=11

         ; 0000YyXx st mouse

         ; 0000xyXY amiga mouse

         ifconst MOUSEXONLY
amigatoataribits             ; swap bits 1 and 4...
             .byte %0000, %0000, %0010, %0010
             .byte %0000, %0000, %0010, %0010
             .byte %0001, %0001, %0011, %0011
             .byte %0001, %0001, %0011, %0011

             ; null change bits
             .byte %0000, %0001, %0010, %0011
             .byte %0000, %0001, %0010, %0011
             .byte %0000, %0001, %0010, %0011
             .byte %0000, %0001, %0010, %0011

         else ; !MOUSEXONLY

amigatoataribits             ; swap bits 1 and 4...
             .byte %0000, %1000, %0010, %1010
             .byte %0100, %1100, %0110, %1110
             .byte %0001, %1001, %0011, %1011
             .byte %0101, %1101, %0111, %1111
             ; null change bits
             .byte %0000, %0001, %0010, %0011
             .byte %0100, %0101, %0110, %0111
             .byte %1000, %1001, %1010, %1011
             .byte %1100, %1101, %1110, %1111
         endif ; !MOUSEXONLY

     endif ; MOUSESUPPORT

mouse0update
     ifconst MOUSE0SUPPORT

mousetableselect         = inttemp2
mousexdelta         = inttemp3
mouseydelta         = inttemp4
lastSWCHA         = inttemp6

         ; 0000YyXx st mouse
         ; 0000xyXY amiga mouse

         lda #$ff
         sta lastSWCHA

         ldy port0control

         lda #%00010000
         cpy #9 ; AMIGA?
         bne skipamigabitsfix0
         lda #0
skipamigabitsfix0
         sta mousetableselect
         ifconst DRIVINGBOOST
             cpy #6 ; DRIVING?
             bne skipdriving0setup
             ; swap mousex0 and mousey0. mousex seen by the 7800basic program
             ; trails the actual mousex0, so we can smoothly interpolate toward
             ; the actual position. This actual position is stored in mousey0 
             ; after the driver has run.
             ldx mousex0
             lda mousey0
             stx mousey0
             sta mousex0
skipdriving0setup
         endif ; DRIVINGBOOST

         lda #0
         sta mousexdelta
         sta mouseydelta

         ifnconst MOUSETIME
             ifnconst MOUSEXONLY
                 lda #180 ; minimum for x+y
             else
                 lda #100 ; minimum for just x
             endif
         else
             lda #MOUSETIME
         endif
         jsr SETTIM64T ; INTIM is in Y

mouse0updateloop
         lda SWCHA
         asr #%11110000 ; Undocumented. A = A & #IMM, then LSR A.
         cmp lastSWCHA
         beq mouse0loopcondition
         sta lastSWCHA
         lsr
         lsr
         lsr

         ora mousetableselect ; atari/amiga decoding table selection

         ; st mice encode on different bits/joystick-lines than amiga mice...
         ; 0000YyXx st mouse
         ; 0000xyXY amiga mouse
         ; ...so can shuffle the amiga bits to reuse the st driver.
         tay
         lax amigatoataribits,y

         ifnconst MOUSEXONLY
             ; first the Y...
             and #%00001100
             ora mousecodey0
             tay
             lda rotationalcompare,y
             clc 
             adc mouseydelta
             sta mouseydelta
             tya
             lsr
             lsr
             sta mousecodey0
             txa
             ; ...then the X...
             and #%00000011
             tax
         endif ; !MOUSEXONLY

         asl
         asl
         ora mousecodex0
         tay
         lda rotationalcompare,y
         adc mousexdelta ; carry was clear by previous ASL
         sta mousexdelta
         stx mousecodex0
mouse0loopcondition
         lda TIMINT
         bpl mouse0updateloop

         ; *** adapt to selected device resolution. 
         ldx port0control

         ifconst PRECISIONMOUSING
             ldy port0resolution
             bne mouse0halveddone
             cpx #6 ; half-resolution is no good for driving wheels
             beq mouse0halveddone 
             ; resolution=0 is half mouse resolution, necessary for precision 
             ; mousing on a 160x240 screen with a 1000 dpi mouse.

             lda mousexdelta
             cmp #$80
             ror ; do a signed divide by 2.
             clc
             adc mousex0
             sta mousex0
             ifnconst MOUSEXONLY
                 lda mouseydelta
                 clc
                 adc mousey0
                 sta mousey0
             endif
             ; at half resolution we just exit after updating x and y
             jmp LLRET0
mouse0halveddone
         endif ; PRECISIONMOUSING

         ifnconst MOUSEXONLY
             asl mouseydelta ; *2 because Y resolution is finer
             ldy port0resolution
             dey
             lda #0 
mousey0resolutionfix
             clc
             adc mouseydelta 
             dey
             bpl mousey0resolutionfix
             clc
             adc mousey0
             sta mousey0
         endif ; MOUSEXONLY

         ldy port0resolution
         dey
         lda #0
mousex0resolutionfix
         clc
         adc mousexdelta 
         dey
         bpl mousex0resolutionfix
         ifnconst DRIVINGBOOST
             clc
             adc mousex0
             sta mousex0
         else
             cpx #6
             beq carryonmouse0boost
             clc
             adc mousex0
             sta mousex0
             jmp LLRET0
carryonmouse0boost
             sta mousexdelta
             clc
             adc mousecodey0
             sta mousecodey0
             clc
             adc mousex0 
             tay ; save the target X
             adc mousey0 ; average in the smoothly-trailing X
             ror 
             sta mousex0 ; mousex0 now has the smoothly trailing X
             sty mousey0 ; and mousey0 has the the target X

             ; check to see if the coordinate wrapped. If so, undo the averaging code.
             ; A has mousex0, the smoothly trailing X
             sbc mousey0 ; less the target X
             bpl skipabsolutedrive0
             eor #$ff
skipabsolutedrive0
             cmp #64 ; just an unreasonably large change
             bcc skipdrivewrapfix0
             sty mousex0 ; if X wrapped, we catch the trailing X up to the target X
skipdrivewrapfix0

             ; get rid of the tweening if the distance travelled was very small
             lda mousexdelta
             cmp port0resolution
             bcs skipbetweenfix0
             lda mousex0
             sta mousey0
skipbetweenfix0

drivingboostreductioncheck0
             ; The below code amounts to mousecodey0=mousecodey0-(mousecodey0/8)
             ; +ve mousecodey0 is converted to -ve to do the calculation, and then
             ; negated again because truncation during BCD math results in 
             ; differing magnitudes, depending if the value is +ve or -ve.
driving0fix
             lax mousecodey0
             cmp #$80
             bcs driving0skipnegate1
             eor #$FF
             adc #1 
             sta mousecodey0
driving0skipnegate1
             cmp #$80
             ror
             cmp #$80
             ror
             cmp #$80
             ror
             sta inttemp1
             lda mousecodey0
             sec
             sbc inttemp1
             cpx #$80
             bcs driving0skipnegate2
             eor #$FF
             adc #1 
driving0skipnegate2
             sta mousecodey0
drivingboostdone0
         endif ; DRIVINGBOOST

         jmp LLRET0

     endif ; MOUSE0SUPPORT

mouse1update
     ifconst MOUSE1SUPPORT

mousetableselect         = inttemp2
mousexdelta         = inttemp3
mouseydelta         = inttemp4
lastSWCHA         = inttemp6

         ; 0000YyXx st mouse
         ; 0000xyXY amiga mouse

         lda #$ff
         sta lastSWCHA

         ldy port1control

         lda #%00010000
         cpy #9 ; AMIGA?
         bne skipamigabitsfix1
         lda #0
skipamigabitsfix1
         sta mousetableselect
         ifconst DRIVINGBOOST
             cpy #6 ; DRIVING?
             bne skipdriving1setup
             ; swap mousex1 and mousey1. mousex seen by the 7800basic program
             ; trails the actual mousex1, so we can smoothly interpolate toward
             ; the actual position. This actual position is stored in mousey1 
             ; after the driver has run.
             ldx mousex1
             lda mousey1
             stx mousey1
             sta mousex1
skipdriving1setup
         endif ; DRIVINGBOOST

         lda #0
         sta mousexdelta
         sta mouseydelta

         ifnconst MOUSETIME
             ifnconst MOUSEXONLY
                 lda #180 ; minimum for x+y
             else
                 lda #100 ; minimum for just x
             endif
         else
             lda #MOUSETIME
         endif
         jsr SETTIM64T ; INTIM is in Y

mouse1updateloop
         lda SWCHA
         and #%00001111 
         cmp lastSWCHA
         beq mouse1loopcondition
         sta lastSWCHA

         ora mousetableselect ; atari/amiga decoding table selection

         ; st mice encode on different bits/joystick-lines than amiga mice...
         ; 0000YyXx st mouse
         ; 0000xyXY amiga mouse
         ; ...so can shuffle the amiga bits to reuse the st driver.
         tay
         lax amigatoataribits,y

         ifnconst MOUSEXONLY
             ; first the Y...
             and #%00001100
             ora mousecodey1
             tay
             lda rotationalcompare,y
             clc 
             adc mouseydelta
             sta mouseydelta
             tya
             lsr
             lsr
             sta mousecodey1
             txa
             ; ...then the X...
             and #%00000011
             tax
         endif ; !MOUSEXONLY

         asl
         asl
         ora mousecodex1
         tay
         lda rotationalcompare,y
         adc mousexdelta ; carry was clear by previous ASL
         sta mousexdelta
         stx mousecodex1
mouse1loopcondition
         lda TIMINT
         bpl mouse1updateloop

         ; *** adapt to selected device resolution. 
         ldx port1control

         ifconst PRECISIONMOUSING
             ldy port1resolution
             bne mouse1halveddone
             cpx #6 ; half-resolution is no good for driving wheels
             beq mouse1halveddone 
             ; resolution=0 is half mouse resolution, necessary for precision 
             ; mousing on a 160x240 screen with a 1000 dpi mouse.

             lda mousexdelta
             cmp #$80
             ror ; do a signed divide by 2.
             clc
             adc mousex1
             sta mousex1
             ifnconst MOUSEXONLY
                 lda mouseydelta
                 clc
                 adc mousey1
                 sta mousey1
             endif
             ; at half resolution we just exit after updating x and y
             jmp LLRET1
mouse1halveddone
         endif ; PRECISIONMOUSING

         ifnconst MOUSEXONLY
             asl mouseydelta ; *2 because Y resolution is finer
             ldy port1resolution
             dey
             lda #0 
mousey1resolutionfix
             clc
             adc mouseydelta 
             dey
             bpl mousey1resolutionfix
             clc
             adc mousey1
             sta mousey1
         endif ; MOUSEXONLY

         ldy port1resolution
         dey
         lda #0
mousex1resolutionfix
         clc
         adc mousexdelta 
         dey
         bpl mousex1resolutionfix
         ifnconst DRIVINGBOOST
             clc
             adc mousex1
             sta mousex1
         else
             cpx #6
             beq carryonmouse1boost
             clc
             adc mousex1
             sta mousex1
             jmp LLRET1
carryonmouse1boost
             sta mousexdelta
             clc
             adc mousecodey1
             sta mousecodey1
             clc
             adc mousex1
             tay ; save the target X
             adc mousey1 ; average in the smoothly-trailing X
             ror 
             sta mousex1 ; mousex0 now has the smoothly trailing X
             sty mousey1 ; and mousey0 has the the target X

             ; check to see if the coordinate wrapped. If so, undo the averaging code.
             ; A has mousex1, the smoothly trailing X
             sbc mousey1 ; less the target X
             bpl skipabsolutedrive1
             eor #$ff
skipabsolutedrive1
             cmp #64 ; just an unreasonably large change
             bcc skipdrivewrapfix1
             sty mousex1 ; if X wrapped, we catch the trailing X up to the target X
skipdrivewrapfix1

             ; get rid of the tweening if the distance travelled was very small
             lda mousexdelta
             cmp port1resolution
             bcs skipbetweenfix1
             lda mousex1
             sta mousey1
skipbetweenfix1

drivingboostreductioncheck1
             ; The below code amounts to mousecodey0=mousecodey0-(mousecodey0/8)
             ; +ve mousecodey0 is converted to -ve to do the calculation, and then
             ; negated again because truncation during BCD math results in 
             ; differing magnitudes, depending if the value is +ve or -ve.
driving1fix
             lax mousecodey1
             cmp #$80
             bcs driving0skipnegate1
             eor #$FF
             adc #1 
             sta mousecodey1
driving0skipnegate1
             cmp #$80
             ror
             cmp #$80
             ror
             cmp #$80
             ror
             sta inttemp1
             lda mousecodey1
             sec
             sbc inttemp1
             cpx #$80
             bcs driving1skipnegate2
             eor #$FF
             adc #1 
driving1skipnegate2
             sta mousecodey1
drivingboostdone1
         endif ; DRIVINGBOOST

         jmp LLRET1

     endif ; MOUSE1SUPPORT


trakball0update
     ifconst TRAKBALL0SUPPORT
         ifnconst TRAKTIME
             ifnconst TRAKXONLY
                 lda #180 ; minimum for x+y
             else; !TRAKXONLY
                 lda #100 ; minimum for just x
             endif; !TRAKXONLY
         else ; !TRAKTIME
             lda #TRAKTIME
         endif ; !TRAKTIME
         jsr SETTIM64T ; INTIM is in Y
         ldx #0
         ifnconst TRAKXONLY
             ldy #0
         endif ; TRAKXONLY
trakball0updateloop
         lda SWCHA
         and #%00110000
         cmp trakballcodex0
         sta trakballcodex0
         beq trakball0movementXdone
         and #%00010000
         beq trakball0negativeX
trakball0positiveX
         ;(2 from beq)
         inx ; 2
         jmp trakball0movementXdone ; 3
trakball0negativeX
         ;(3 from beq)
         dex ; 2
         nop ; 2
trakball0movementXdone

         ifnconst TRAKXONLY
             lda SWCHA
             and #%11000000
             cmp trakballcodey0
             sta trakballcodey0
             beq trakball0movementYdone
             and #%01000000
             beq trakball0negativeY
trakball0positiveY
             ;(2 from beq)
             iny ; 2
             jmp trakball0movementYdone ; 3
trakball0negativeY
             ;(3 from beq)
             dey ; 2
             nop ; 2
trakball0movementYdone
         endif ; !TRAKXONLY

         lda TIMINT
         bpl trakball0updateloop
         lda #0
         cpx #0
         beq trakball0skipXadjust
         clc
trakball0Xloop
         adc port0resolution
         dex
         bne trakball0Xloop
         clc
         adc trakballx0
         sta trakballx0
trakball0skipXadjust
         ifnconst TRAKXONLY
             lda #0
             cpy #0
             beq trakball0skipYadjust
             clc
trakball0yloop
             adc port0resolution
             dey
             bne trakball0yloop
             clc
             adc trakbally0
             sta trakbally0
trakball0skipYadjust
         endif ; !TRAKXONLY

         jmp LLRET0
     endif



trakball1update
     ifconst TRAKBALL1SUPPORT
         ifnconst TRAKTIME
             ifnconst TRAKXONLY
                 lda #180 ; minimum for x+y
             else; !TRAKXONLY
                 lda #100 ; minimum for just x
             endif; !TRAKXONLY
         else ; !TRAKTIME
             lda #TRAKTIME
         endif ; !TRAKTIME
         jsr SETTIM64T ; INTIM is in Y
         ldx #0
         ifnconst TRAKXONLY
             ldy #0
         endif ; TRAKXONLY
trakball1updateloop
         lda SWCHA
         and #%00000011
         cmp trakballcodex1
         sta trakballcodex1
         beq trakball1movementXdone
         and #%00000001
         beq trakball1negativeX
trakball1positiveX
         ;(2 from beq)
         inx ; 2
         jmp trakball1movementXdone ; 3
trakball1negativeX
         ;(3 from beq)
         dex ; 2
         nop ; 2
trakball1movementXdone

         ifnconst TRAKXONLY
             lda SWCHA
             and #%00001100
             cmp trakballcodey1
             sta trakballcodey1
             beq trakball1movementYdone
             and #%00000100
             beq trakball1negativeY
trakball1positiveY
             ;(2 from beq)
             iny ; 2
             jmp trakball1movementYdone ; 3
trakball1negativeY
             ;(3 from beq)
             dey ; 2
             nop ; 2
trakball1movementYdone
         endif ; !TRAKXONLY

         lda TIMINT
         bpl trakball1updateloop
         lda #0
         cpx #0
         beq trakball1skipXadjust
         clc
trakball1Xloop
         adc port1resolution
         dex
         bne trakball1Xloop
         clc
         adc trakballx1
         sta trakballx1
trakball1skipXadjust
         ifnconst TRAKXONLY
             lda #0
             cpy #0
             beq trakball1skipYadjust
             clc
trakball1yloop
             adc port1resolution
             dey
             bne trakball1yloop
             clc
             adc trakbally1
             sta trakbally1
trakball1skipYadjust
         endif ; !TRAKXONLY

         jmp LLRET1
     endif


paddleport0update
     ifconst PADDLE0SUPPORT
         lda #6
         sta VBLANK ; start charging the paddle caps
         lda #0 ; use PADDLE timing
         jsr SETTIM64T ; INTIM is in Y

paddleport0updateloop
         lda INPT0
         bmi skippaddle0setposition
         sty paddleposition0
skippaddle0setposition         
         ifconst TWOPADDLESUPPORT
             lda INPT1
             bmi skippaddle1setposition
             sty paddleposition1
skippaddle1setposition             
         endif
         ldy INTIM
         cpy #TIMEOFFSET
         bcs paddleport0updateloop

         lda #%10000110
         sta VBLANK ; dump paddles to ground... this may not be great for genesis controllers
         sec
         lda paddleposition0
         sbc #TIMEOFFSET
         ifconst PADDLESCALEX2
             asl
         endif

         ifnconst PADDLESMOOTHINGOFF
             clc
             adc paddleprevious0
             ror
             sta paddleprevious0
         endif

         sta paddleposition0

         ifconst TWOPADDLESUPPORT
             sec
             lda paddleposition1
             sbc #TIMEOFFSET
             ifconst PADDLESCALEX2
                 asl
             endif

             ifnconst PADDLESMOOTHINGOFF
                 clc
                 adc paddleprevious1
                 ror
                 sta paddleprevious1
             endif
             sta paddleposition1
         endif ; TWOPADDLESUPPORT

         jmp LLRET0
     endif

paddleport1update
     ifconst PADDLE1SUPPORT
         lda #6
         sta VBLANK ; start charging the paddle caps

         lda #0 ; use PADDLE timing
         jsr SETTIM64T ; INTIM is in Y

paddleport1updateloop
         lda INPT2
         bmi skippaddle2setposition
         sty paddleposition2
skippaddle2setposition
         ifconst TWOPADDLESUPPORT
             lda INPT3
             bmi skippaddle3setposition
             sty paddleposition3
skippaddle3setposition
         endif
         ldy INTIM
         cpy #TIMEOFFSET
         bcs paddleport1updateloop

         lda #%10000110
         sta VBLANK ; dump paddles to ground... this may not be great for genesis controllers
         sec
         lda paddleposition2
         sbc #TIMEOFFSET
         ifconst PADDLESCALEX2
             asl
         endif

         ifnconst PADDLESMOOTHINGOFF
             clc
             adc paddleprevious2
             ror
             sta paddleprevious2
         endif

         sta paddleposition2

         ifconst TWOPADDLESUPPORT
             sec
             lda paddleposition3
             sbc #TIMEOFFSET
             ifconst PADDLESCALEX2
                 asl
             endif

             ifnconst PADDLESMOOTHINGOFF
                 clc
                 adc paddleprevious3
                 ror
                 sta paddleprevious3
             endif
             sta paddleposition3
         endif ; TWOPADDLESUPPORT

         jmp LLRET1
     endif


paddlebuttonhandler     ; outside of conditional, for button-handler LUT
     ifconst PADDLESUPPORT
         ; x=0|1 for port, rather than paddle #. 
         ; Only the first paddle button will integrate into "joy0fire" testing. If the
         ; game wants to support 2 paddles, up to the game to instead test the 
         ; joystick right+left directions instead.
         lda SWCHA ; top of nibble is first paddle button
         cpx #0 ; port 0?
         beq skippaddleport2shift
         asl ; shift second port to upper nibble
         asl
         asl
         asl
skippaddleport2shift
         and #%11000000
         eor #%11000000 ; invert
         sta sINPT1,x
         jmp buttonreadloopreturn
     endif ; PADDLESUPPORT

mousebuttonhandler     ; outside of conditional, for button-handler LUT
     ifconst MOUSESUPPORT
         ; stick the mouse buttons in the correct shadow register...
         txa
         asl
         tay ; y=x*2
         lda INPT4,x
         eor #%10000000
         lsr
         sta sINPT1,x

         lda INPT1,y
         and #%10000000
         eor #%10000000
         ora sINPT1,x
         sta sINPT1,x
         jmp buttonreadloopreturn
     endif ; MOUSESUPPORT

     ifconst KEYPADSUPPORT
         ; ** select keypad rows 0 to 3 over 4 frames...
keypadrowselect
         inc keypadcounter
         ldy #0
         lda port0control
         cmp #7
         bne skipport0val
         iny ; y=y+1
skipport0val
         lda port1control
         cmp #7
         bne skipport1val
         iny
         iny ; y=y+2
skipport1val
         cpy #0 
         beq exitkeypadrowselect 
         lda keyrowdirectionmask,y
         sta CTLSWA
         tya
         asl
         asl
         sta inttemp1
         lda keypadcounter
         and #3
         ora inttemp1
         tax
         lda keyrowselectvalue,x
         sta SWCHA
exitkeypadrowselect
         rts

keyrowdirectionmask
         .byte #%00000000 ; 0 : port0=input port1=input
         .byte #%11110000 ; 1 : port0=output port1=input
         .byte #%00001111 ; 2 : port0=input port1=output
         .byte #%11111111 ; 3 : port0=output port1=output

keyrowselectvalue
         .byte #%00000000, #%00000000, #%00000000, #%00000000 ; no row selected, all pins high, always
         .byte #%11100000, #%11010000, #%10110000, #%01110000 ; p0 keypad in
         .byte #%00001110, #%00001101, #%00001011, #%00000111 ; p1 keypad in
         .byte #%11101110, #%11011101, #%10111011, #%01110111 ; p0+p1 keypads in
     endif; KEYPADSUPPORT

     ifconst KEYPADSUPPORT
         ; TODO - split into compile-time KEYPAD0SUPPORT and KEYPAD1SUPPORT
keypadcolumnread
         lda port0control
         cmp #7
         bne skipkeypadcolumnread0
         lda keypadcounter
         and #3
         asl ; x2 because keypad variables are interleaved
         tax
         lda #0
         sta keypadmatrix0a,x
         lda INPT0
         cmp #$80
         rol keypadmatrix0a,x
         lda INPT1
         cmp #$80
         rol keypadmatrix0a,x
         lda INPT4
         cmp #$80
         rol keypadmatrix0a,x
         lda keypadmatrix0a,x
         eor #%00000111
         sta keypadmatrix0a,x
skipkeypadcolumnread0         

         lda port1control
         cmp #7
         bne skipkeypadcolumnread1
         lda keypadcounter
         and #3
         asl ; x2 because keypad variables are interleaved
         tax
         lda #0
         sta keypadmatrix1a,x
         rol keypadmatrix1a,x
         lda INPT2
         cmp #$80
         rol keypadmatrix1a,x
         lda INPT3
         cmp #$80
         rol keypadmatrix1a,x
         lda INPT5
         cmp #$80
         rol keypadmatrix1a,x
         lda keypadmatrix1a,x
         eor #%00000111
         sta keypadmatrix1a,x
skipkeypadcolumnread1
         rts
     endif ; KEYPADSUPPORT
     
setportforinput
     lda CTLSWA
     and SWCHA_DIRMASK,x
     sta CTLSWA
     rts

setonebuttonmode
     lda #6 ; in case we're in unlocked-bios mode
     sta VBLANK ; if we were on paddles, the line is grounded out.
     lda #$14
     sta CTLSWB
     lda SWCHB
     ora thisjoy2buttonbit,x ; disable: write 1 to the 2-button bit
     sta SWCHB
     rts

settwobuttonmode
     lda #6 ; in case we're in unlocked-bios mode
     sta VBLANK ; if we were on paddles, the line is grounded out.
     lda #$14
     sta CTLSWB
     lda SWCHB
     and thisjoy2buttonbit+1,x ; enable: write 0 to the 2-button bit
     sta SWCHB
     rts
     
thisjoy2buttonbit
          ; p0   p1   p0
     .byte $04, $10, $04

     ifconst CHANGEDMAHOLES
removedmaholes
     ldx #0
removedllholesloop
     lda DLLMEM,x
     and #%10001111
     sta DLLMEM,x
   ifconst DOUBLEBUFFER
     sta DLLMEM+DBOFFSET,x
   endif
     inx
     inx
     inx
   ifconst DOUBLEBUFFER
     cpx #DBOFFSET
     bcc removedllholesloop
   else
     bpl removedllholesloop
   endif
     rts

createdmaholes
     ldx #0
createdllholesloop
     lda DLLMEM,x
     ora #(WZONEHEIGHT*4)
     sta DLLMEM,x
   ifconst DOUBLEBUFFER
     sta DLLMEM+DBOFFSET,x
   endif
     inx
     inx
     inx
   ifconst DOUBLEBUFFER
     cpx #DBOFFSET
     bcc createdllholesloop
   else
     bpl createdllholesloop
   endif
     rts
 endif

