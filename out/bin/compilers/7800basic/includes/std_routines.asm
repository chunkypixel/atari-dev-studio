 ; Provided under the CC0 license. See the included LICENSE.txt for details.

     ;standard routimes needed for pretty much all games

     ; some definitions used with "set debug color"
DEBUGCALC      = $91
DEBUGWASTE     = $41
DEBUGDRAW      = $C1

     ;NMI and IRQ handlers
NMI
     ;VISIBLEOVER is 255 while the screen is drawn, and 0 right after the visible screen is done.
     pha ; save A
     lda visibleover
     eor #255
     sta visibleover
     ifconst DEBUGINTERRUPT
         and #$93
         sta BACKGRND
     endif
     dec interruptindex 
     bne skipreallyoffvisible
     jmp reallyoffvisible
skipreallyoffvisible
       lda visibleover
       beq skiptopscreenroutine
         txa ; save X+Y
         pha
         tya
         pha
         cld
 ifconst .topscreenroutine
         jsr .topscreenroutine
 endif
         inc frameslost ; this is balanced with a "dec frameslost" when drawscreen is called.

       ; ** Other important routines that need to regularly run, and can run onscreen.
       ; ** Atarivox can't go here, because Maria might interrupt it while it's bit-banging.

longcontrollerreads ; ** controllers that take a lot of time to read. We use much of the visible screen here.
         ifconst LONGCONTROLLERREAD
           lda #$38
 ifconst LONGDEBUG
           sta BACKGRND
 endif
           sta inttemp6

longreadlineloop
           ldx #1
longreadloop
           ldy port0control,x
           lda longreadroutinelo,y
           sta inttemp3
           lda longreadroutinehi,y
           sta inttemp4
	   ora inttemp3
           beq longreadloopreturn
           jmp (inttemp3)
longreadloopreturn
           dex
           bpl longreadloop
           dec inttemp6
           sta WSYNC
           bne longreadlineloop

 ifconst LONGDEBUG
           lda #$00
           sta BACKGRND
 endif
         endif ; LONGCONTROLLERREAD

         jsr servicesfxchannels 
         ifconst MUSICTRACKER
           jsr servicesong
         endif ; MUSICTRACKER

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

	 ifconst DRIVINGSUPPORT
           jsr drivingupdate
	 endif ; DRIVINGSUPPORT
	 ifconst KEYPADSUPPORT
           jsr keypadrowselect
	 endif ; KEYPADSUPPORT


         lda doublebufferminimumframeindex
         beq skipdoublebufferminimumframeindexadjust
         dec doublebufferminimumframeindex
skipdoublebufferminimumframeindexadjust

         pla
         tay
         pla
         tax
skiptopscreenroutine
     pla
IRQ
     RTI

     ifconst LONGCONTROLLERREAD
longreadroutinelo
 ;        NONE          PROLINE        LIGHTGUN      PADDLE
 .byte    0,            0,             0,            0           
 ;        TRKBALL       VCS STICK      DRIVING       KEYPAD
 .byte    0,            0,             0,            0           
 ;        STMOUSE       AMOUSE         ATARIVOX
 .byte    <mouseupdate, <mouseupdate,  0

longreadroutinehi
 ;        NONE          PROLINE        LIGHTGUN      PADDLE
 .byte    0,            0,             0,            0           
 ;        TRKBALL       VCS STICK      DRIVING       KEYPAD
 .byte    0,            0,             0,            0           
 ;        STMOUSE       AMOUSE         ATARIVOX
 .byte    >mouseupdate, >mouseupdate,  0
nullroutine
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

     txa
     pha
     tya
     pha
     cld

     jsr uninterruptableroutines

     ifconst .userinterrupt
         jsr .userinterrupt
     endif

     ifconst KEYPADSUPPORT
         jsr keypadcolumnread
     endif

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
     ifconst SPRITECOUNTING
         lda spritecount
         cmp maxspritecount
         bcc skipspritecountsave
         sta maxspritecount
skipspritecountsave
         lda #0
         sta spritecount
     endif ; SPRITECOUNTING

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

 ifnconst SOFTRESETASPAUSEOFF
 ifnconst MOUSESUPPORT
     lda SWCHA ; then check the soft "RESET" joysick code...
     and #%01110000 ; _LDU
     beq pausepressed
 endif
 endif

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

     lda #0
     sta palfastframe
     lda paldetected
     beq skippalframeadjusting
     ; ** PAL console is detected. we increment palframes to accurately count 5 frames,
     ldx palframes
     inx
     cpx #5
     bne palframeskipdone
     inc palfastframe
     ldx #0
palframeskipdone
     stx palframes
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
         rts
avoxsilentdata
         .byte 31,255
     else
     	rts
     endif ; AVOXVOICE

joybuttonhandler
     txa
     lsr
     tay
     lda INPT0,y
     lsr
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
     and twobuttonmask,x
     beq .skip1bjoyfirecheck
     lda joybuttonmode
     ora twobuttonmask,x
     sta joybuttonmode
     sta SWCHB
.skip1bjoyfirecheck
     jmp buttonreadloopreturn

twobuttonmask
 .byte %00000100,%00010000

gunbuttonhandler ; outside of the conditional, so our button handler LUT is valid
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

buttonhandlerhi
     .byte 0                  ; 00=no controller plugged in
     .byte >joybuttonhandler  ; 01=proline joystick
     .byte >gunbuttonhandler  ; 02=lightgun
     .byte 0                  ; 03=paddle [not implemented yet]
     .byte >joybuttonhandler  ; 04=trakball
     .byte >joybuttonhandler  ; 05=vcs joystick
     .byte >joybuttonhandler  ; 06=driving control
     .byte 0                  ; 07=keypad
     .byte >mousebuttonhandler; 08=st mouse
     .byte >mousebuttonhandler; 09=amiga mouse
     .byte >joybuttonhandler  ; 10=atarivox
buttonhandlerlo
     .byte 0 ; 00=no controller plugged in
     .byte <joybuttonhandler  ; 01=proline joystick
     .byte <gunbuttonhandler  ; 02=lightgun 
     .byte 0                  ; 03=paddle [not implemented yet]
     .byte <joybuttonhandler  ; 04=trakball
     .byte <joybuttonhandler  ; 05=vcs joystick
     .byte <joybuttonhandler  ; 06=driving control
     .byte 0                  ; 07=keypad
     .byte <mousebuttonhandler; 08=st mouse
     .byte <mousebuttonhandler; 09=amiga mouse
     .byte <joybuttonhandler  ; 10=atarivox

drawwait
     lda visibleover
     bne drawwait ; make sure the visible screen isn't being drawn
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
     ldx #255
servicesfxchannelsloop
     inx
     ifnconst TIASFXMONO
         cpx #2
     else
         cpx #1
     endif
     beq servicesfxchannelsdone

     lda sfx1pointlo,x
     sta inttemp5
     ora sfx1pointhi,x
     beq servicesfxchannelsloop
     lda sfx1pointhi,x
     sta inttemp6

     lda sfx1tick,x
     beq servicesfx_cont1 ; this chunk is over, load the next!
     dec sfx1tick,x ; frame countdown is non-zero, subtract one
     lda palfastframe
     beq servicesfxchannelsloop
     lda sfx1tick,x
     beq servicesfx_cont1 ; this chunk is over, load the next!
     dec sfx1tick,x ; frame countdown is non-zero, subtract one
     jmp servicesfxchannelsloop
servicesfx_cont1

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
     lda (inttemp5),y
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
     lda (sfxinstrumentlo),y
     ifconst pokeysupport
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
         lda sfx1pointlo
         ora sfx1pointhi
         beq schedulesfx1 ;if channel 1 is idle, use it
         lda sfx2pointlo
         ora sfx2pointhi
         beq schedulesfx2 ;if channel 2 is idle, use it
         ; Both channels are scheduled. 
         ldy #1
         lda (sfxinstrumentlo),y
         bne interruptsfx
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
     ifconst SPRITECOUNTING
         inc spritecount
     endif

 ifconst DOUBLEBUFFER
     lda doublebufferstate
     bne skipplotspritewait
 endif ; DOUBLEBUFFER
plotspritewait
     lda visibleover
     bne plotspritewait
skipplotspritewait

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

     lda DLPOINTL,x ;Get pointer to DL that this sprite starts in
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
         ;lda #0
         ;sta (dlpnt),y
     endif

     iny
     lda temp5 ;Y position

     if WZONEHEIGHT = 16
         and #$0F
     else ; WZONEHEIGHT = 8
         and #$7
     endif

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

     ifconst ATOMICSPRITEUPDATE
         ldy temp8
         lda temp6
         sta (dlpnt),y
     endif
checkcontinueplotsprite2

     lda temp5
     and #(WZONEHEIGHT-1)

     beq doneSPDL ;branch if it is

     ;Create DL entry for lower part of sprite

     inx ;Next region

     cpx #WZONECOUNT

     bcc continueplotsprite2 ; the second half of the sprite is fully on-screen, so carry on...
     rts
continueplotsprite2

     lda DLPOINTL,x ;Get pointer to next DL
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
         ;lda #0
         ;sta (dlpnt),y
     endif

     iny
     lda temp5 ;Y position

     if WZONEHEIGHT = 16
         and #$0F
         eor #$0F
     endif
     if WZONEHEIGHT = 8
         and #$07
         eor #$07
     endif

     sta temp9
     lda temp2 ; graphic data, hi byte
     clc
     sbc temp9
     sta (dlpnt),y

     iny
     lda temp3 ;palette|width
     sta (dlpnt),y

     iny
     lda temp4 ;Horizontal position
     sta (dlpnt),y

     iny
     sty dlend,x

     ifconst ATOMICSPRITEUPDATE
         ldy temp8
         lda temp6
         sta (dlpnt),y
     endif

doneSPDL
     rts

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
         ;ldy #(DLLASTOBJ-1)
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
plotcharloopwait
     lda visibleover
     bne plotcharloopwait
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
     ifconst SPRITECOUNTING
         inc spritecount
     endif
 ifconst DOUBLEBUFFER
     lda doublebufferstate
     bne skipplotcharacterswait
 endif ; DOUBLEBUFFER
plotcharacterswait
     lda visibleover
     bne plotcharacterswait
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
     lda DLPOINTL,x ;Get pointer to DL that the characters are in
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
     lda DLPOINTL,x ;Get pointer to DL that the characters are in
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

plotdigitcount     = temp6

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
plotdigitcount     = temp6
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
     cmp __boxx2          ;3
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

     ; bcd conversion routine courtesy Omegamatrix
     ; http://atariage.com/forums/blog/563/entry-10832-hex-to-bcd-conversion-0-99/
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

     ifconst bankswitchmode
BS_jsr
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
     lda SWCHB ; first check the real select switch...
     and #%00000010
 ifnconst MOUSESUPPORT
     beq checkselectswitchreturn ; switch is pressed
     lda SWCHA ; then check the soft "select" joysick code...
     and #%10110000 ; R_DU
 endif ; MOUSESUPPORT
checkselectswitchreturn
     rts

checkresetswitch
     lda SWCHB ; first check the real reset switch...
     and #%00000001
 ifnconst MOUSESUPPORT
     beq checkresetswitchreturn ; switch is pressed
     lda SWCHA ; then check the soft "reset" joysick code...
     and #%01110000 ; _LDU
 endif ; MOUSESUPPORT
checkresetswitchreturn
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
     ldx #0
     lda #NVLINES
     ldy paldetected
     beq skipcreatePALpadding
     clc
     adc #21 
skipcreatePALpadding
     jsr createnonvisibledlls
     stx visibleDLLstart
     jsr createvisiblezones
     stx overscanDLLstart
createallgamedllscontinue
     lda #(NVLINES+55) ; extras for PAL
     jsr createnonvisibledlls

     ldx visibleDLLstart
     lda DLLMEM,x
     ora #%10000000 ; NMI 1 - start of visible screen
     sta DLLMEM,x
     ifconst DOUBLEBUFFER
       sta DLLMEM+DBOFFSET,x
     endif ; DOUBLEBUFFER

     ldx overscanDLLstart
     lda DLLMEM,x
     ora #%10000011 ; NMI 2 - end of visible screen
     and #%11110011 ; change this to a 1-line DLL, so there's time enough for the "deeper overscan" DLL
     sta DLLMEM,x
     ifconst DOUBLEBUFFER
       sta DLLMEM+DBOFFSET,x
     endif ; DOUBLEBUFFER

     inx
     inx
     inx

     lda DLLMEM,x
     ora #%10000000 ; NMI 3 - deeper overscan
     sta DLLMEM,x
     ifconst DOUBLEBUFFER
       sta DLLMEM+DBOFFSET,x
     endif ; DOUBLEBUFFER

     rts

createnonvisibledlls
     sta temp1
     lsr
     lsr
     lsr
     lsr ; /16
     beq skipcreatenonvisibledlls1loop
     tay
createnonvisibledlls1loop
     lda #%01001111 ;low nibble=16 lines, high nibble=Holey DMA
     jsr createblankdllentry
     dey
     bne createnonvisibledlls1loop
skipcreatenonvisibledlls1loop
     lda temp1
     and #%00001111
     beq createnonvisibledllsreturn
     sec
     sbc #1
     ora #%01000000
     jsr createblankdllentry
createnonvisibledllsreturn
     rts

createblankdllentry
     sta DLLMEM,x
     ifconst DOUBLEBUFFER
       sta DLLMEM+DBOFFSET,x
     endif ; DOUBLEBUFFER
     inx
     lda #$21 ; blank
     sta DLLMEM,x
     ifconst DOUBLEBUFFER
       sta DLLMEM+DBOFFSET,x
     endif ; DOUBLEBUFFER
     inx
     lda #$00
     sta DLLMEM,x
     ifconst DOUBLEBUFFER
       sta DLLMEM+DBOFFSET,x
     endif ; DOUBLEBUFFER
     inx
     rts 

createvisiblezones
     ldy #0
createvisiblezonesloop
     lda.w DLHEIGHT,y
     ora #(WZONEHEIGHT * 4) ; set Holey DMA for 8 or 16 tall zones
     sta DLLMEM,x
     ifconst DOUBLEBUFFER
       sta DLLMEM+DBOFFSET,x
     endif ; DOUBLEBUFFER
     inx
     lda DLPOINTH,y
     sta DLLMEM,x
     ifconst DOUBLEBUFFER
       sta DLLMEM+DBOFFSET,x
     endif ; DOUBLEBUFFER
     inx
     lda DLPOINTL,y
     sta DLLMEM,x
     ifconst DOUBLEBUFFER
       clc
       adc #DOUBLEBUFFEROFFSET
       sta DLLMEM+DBOFFSET,x
       bcc skiphidoublebufferadjust  ; dlls are big endian, so we need to fix the hi byte after-the-fact...
         inc DLLMEM+DBOFFSET-1,x
skiphidoublebufferadjust
     endif ; DOUBLEBUFFER
     inx
     iny
     cpy #WZONECOUNT
     bne createvisiblezonesloop
     rts

waitforvblankstart
visibleoverwait
     BIT MSTAT
     bpl visibleoverwait
vblankstartwait
     BIT MSTAT
     bmi vblankstartwait
     rts

     ifconst DOUBLEBUFFER
flipdisplaybufferreturn
     rts
flipdisplaybuffer
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
   ifnconst DRIVINGSUPPORT
rotationalcompare
     ; new=00, old=xx
     .byte $00, $01, $ff, $00
     ; new=01, old=xx
     .byte $ff, $00, $00, $01
     ; new=10, old=xx
     .byte $01, $00, $00, $ff
     ; new=11, old=xx
     .byte $00, $ff, $01, $00
   endif

   ;  0000YyXx st mouse
   ;  0000xyXY amiga mouse
amigatoataribits ; swap bits 1 and 4...
  .byte %00000000, %00001000, %00000010, %00001010
  .byte %00000100, %00001100, %00000110, %00001110
  .byte %00000001, %00001001, %00000011, %00001011
  .byte %00000101, %00001101, %00000111, %00001111

mouseupdate
;LONGDEBUG = 1
   lda SWCHA
   and #$0f
   sta inttemp2
   lda SWCHA
   lsr
   lsr
   lsr
   lsr
   sta inttemp1

   lda port0control,x
   cmp #8 ; st mouse
   beq domousecontrol
   cmp #9 ; amiga mouse
   bne skipmousecontrol
   ; st mice encode on different bits/joystick-lines than amiga mice...
   ;  0000YyXx st mouse
   ;  0000xyXY amiga mouse
   ; ...so can shuffle the amiga bits to reuse the st driver.
   lda inttemp1,x
   tay
   lda amigatoataribits,y
   sta inttemp1,x
domousecontrol
   ;port X has a mouse enabled
   lda inttemp1,x
   and #%00000011
   asl
   asl
   ora mousecodex0,x
   and #%00001111
   tay
   lda rotationalcompare,y
   clc
   adc mousex0,x
   sta mousex0,x
   tya
   lsr
   lsr
   sta mousecodex0,x

   lda inttemp1,x
   and #%00001100
   ora mousecodey0,x
   and #%00001111
   tay
   lda rotationalcompare,y
   asl ; *2 for y axis, since it has ~double the resolution of x
   clc
   adc mousey0,x
   sta mousey0,x
   tya
   lsr
   lsr
   sta mousecodey0,x
skipmousecontrol
   jmp longreadloopreturn
 endif ; MOUSESUPPORT

mousebuttonhandler ; outside of conditional, so button handler entry in LUT is valid
 ifconst MOUSESUPPORT
   ; stick the mouse buttons in the correct shadow register...
   txa
   asl
   tay ; y=x*2
   lda INPT1,y
 eor #%10000000
   lsr
   sta sINPT1,x

   lda INPT4,x
   and #%10000000
 eor #%10000000
   ora sINPT1,x
   sta sINPT1,x
   jmp buttonreadloopreturn
 endif ; MOUSESUPPORT

 ifconst DRIVINGSUPPORT
rotationalcompare
 ; new=00, old=xx
 .byte $00, $01, $ff, $00
 ; new=01, old=xx
 .byte $ff, $00, $00, $01
 ; new=10, old=xx
 .byte $01, $00, $00, $ff
 ; new=11, old=xx
 .byte $00, $ff, $01, $00
drivingupdate
   ldx #1
   lda port1control
   cmp #6 ; check if port1=driving
   bne skipfirstdrivingcontrol
   lda SWCHA
   and #%00000011
   asl
   asl
drivingupdateloop
   ora controller0statesave,x
   tay
   lda rotationalcompare,y
   clc
   adc drivingposition0,x
   sta drivingposition0,x
   tya
   lsr
   lsr
   sta controller0statesave,x
skipfirstdrivingcontrol
   lda port0control
   cmp #6 ; check if port0=driving
   bne drivingcontrolsloopdone
   lda SWCHA
   and #%00110000
   lsr
   lsr
   dex
   bpl drivingupdateloop
drivingcontrolsloopdone
   rts
 endif ; DRIVINGSUPPORT

 ifconst KEYPADSUPPORT
   ; ** select keypad rows 0 to 3 over 4 frames...
keypadrowselect
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
   lda keyrowdirectionmask,y
   sta CTLSWA
   tya
   asl
   asl
   sta inttemp1
   lda framecounter
   and #3
   ora inttemp1
   tax
   lda keyrowselectvalue,x
   sta SWCHA
   rts

keyrowdirectionmask
    .byte #%00000000 ; 0 : port0=input  port1=input
    .byte #%11110000 ; 1 : port0=output port1=input
    .byte #%00001111 ; 2 : port0=input  port1=output
    .byte #%11111111 ; 3 : port0=output port1=output

keyrowselectvalue
        .byte #%00000000, #%00000000, #%00000000, #%00000000 ; no row selected, all pins high, always
        .byte #%11100000, #%11010000, #%10110000, #%01110000 ; p0 keypad in
        .byte #%00001110, #%00001101, #%00001011, #%00000111 ; p1 keypad in
        .byte #%11101110, #%11011101, #%10111011, #%01110111 ; p0+p1 keypads in
 endif;  KEYPADSUPPORT

 ifconst KEYPADSUPPORT
keypadcolumnread
   lda framecounter
   and #3
   asl ; x2 because keypad variables are interleaved
   tax

   lda #0
   sta keypadmatrix0a,x
   sta keypadmatrix1a,x

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

   rts
 endif ; KEYPADSUPPORT
 
setportforinput
   lda CTLSWAs
   and allpinsinputlut,x
   sta CTLSWAs
   sta CTLSWA
   rts

allpinsinputlut
 .byte $0F, $F0

setonebuttonmode
   lda #$14
   sta CTLSWB ; set both 2-button disable bits to writable
   lda CTLSWBs
   ora thisjoy2buttonbit,x 
   sta CTLSWBs
   sta SWCHB ; turn off the 2-button disable bits
   rts

thisjoy2buttonbit
 .byte $04, $10

settwobuttonmode
   lda #$14
   sta CTLSWB ; set both 2-button disable bits to writable
   lda CTLSWBs
   and thisjoy2buttonmask,x
   sta CTLSWBs
   sta SWCHB
   rts
 
thisjoy2buttonmask
 .byte $fb, $ef

