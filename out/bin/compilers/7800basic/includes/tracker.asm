 ; Provided under the CC0 license. See the included LICENSE.txt for details.


 ifconst MUSICTRACKER

trackerstart

	; ** songtempo lists how many 256ths of a frame a 16th note lasts
	; ** the player operates on a 16th note grid.

servicesongover
	rts
servicesong
	lda songtempo
	beq servicesongover ; ** if song is off/paused then return
servicesongcontinue
        lda sfxschedulelock
        sta sfxschedulemissed
        bne servicesongover
	lda songtempo
	clc
	adc songtick ; add songtempo to songtick until it rolls over
	sta songtick ; this is how we break away from 50/60Hz timing.
	bcc servicesongover
	; ** if we're here a new 16th note has passed
	; ** check if a new note is due on any of the 4 channels
servicesongredo
	ldx #3
checkchannelloop
	dec songchannel1busywait,x
	bpl carryoncheckingchannel
	    txa
	    pha ; save X for the loop
	    jsr processsongdata
            pla ; restore X for the loop
            tax
carryoncheckingchannel
	dex
	bpl checkchannelloop
	lda inactivechannelcount
        cmp #15
	bne skipstopsong
	lda songloops
	bne doasongloop
        ;lda #0
	sta songtempo ; all channels are done. stop the song
	rts
doasongloop
	bmi skipsongloopadjust
	dec songloops
skipsongloopadjust
	jsr setsongchannels
        jmp servicesongredo
skipstopsong
	rts

processsongdata
        ; channel needs processing
	; X=channel #

	txa
	clc
	adc songchannel1stackdepth,x ; stack depth value will be 0, 4, or 8
	tay


	; ** indirect x is cumbersome with mult-byte commands. 
        ; ** setup a pointer to the song data for indirect y addressing.
        lda songchannel1layer1lo,y
        sta songdatalo
        lda songchannel1layer1hi,y
        sta songdatahi
        ora songdatalo
	bne channelhasdata
	    ;channel data is pointing at $0000
	    lda #$7F
	    sta songchannel1busywait,x ; skip a bunch of notes
setchannelcountbits
            lda channel2bits,x
	    ora inactivechannelcount
	    sta inactivechannelcount
	rts
channelhasdata

        sty songstackindex
        ldy #0
	lda (songdatalo),y           ; ** load in the next byte of song data, so we can decode it
	cmp #$ff
	bne carryoncheckingdatatype; ** $ff=pattern end marker
	jmp handlechannelEOD

carryoncheckingdatatype
	and #$F0
        cmp #$C0
	beq handlechannelrest ; 0000XXXX=rest
	cmp #$F0
	beq handlemultibytecommand
        cmp #$D0
	beq handlesemiup
        cmp #$E0
	beq handlesemidown
handlenotedata
	; ** TODO: note playing is a terrible choice for fall-through

	; ** its simple note data, prepare arguments for schedulesfx

	; ** set the note length
	lda (songdatalo),y
	and #$0F
	sta songchannel1busywait,x

	; ** load the instrument
	lda songchannel1instrumentlo,x
	sta sfxinstrumentlo
	lda songchannel1instrumenthi,x
	sta sfxinstrumenthi

	; ** get the note, and transpose
	lda (songdatalo),y
	lsr
	lsr
	lsr
	lsr
	clc
	adc songchannel1transpose,x  ; ** add it to the transpose index
	; ** its up the respective SFX scheduler to handle and save the note data
	sta sfxnoteindex
 
	lda #0
	sta sfxpitchoffset

	jsr schedulesfx

        jmp advancethesongpointer1byte ; advance to the next data byte and exit

handlechannelrest
	; ** set the note length
	lda (songdatalo),y
	and #$0F
	sta songchannel1busywait,x
        jmp advancethesongpointer1byte ; advance to the next data byte and exit

handlesemiup
	lda (songdatalo),y           ; ** reload the song data, so we can get at the lower nibble
	and #$0f                     ; ** since we need to mask the nibble of the subtracted value,
        clc
handlesemidownentry
	adc songchannel1transpose,x  ; ** add it to the transpose index
	sta songchannel1transpose,x
        jsr advancethesongpointer1byte
	jmp processsongdata ; semi doesn't have note length, so process the next data byte...

handlesemidown
	lda (songdatalo),y           ; ** reload the song data, so we can get at the lower nibble
	and #$0f                     ; ** since we need to mask the nibble of the subtracted value,
	eor #$ff                     ; ** its easier if we negate it, and then add it instead.
	sec
	jmp handlesemidownentry

handlemultibytecommand
	lda (songdatalo),y           ; ** reload the song data, so we can get at the lower nibble
	and #$0f                     ; ** since we need to mask the nibble of the subtracted value,
	cmp #$08                     ; ** load new instrument?
        bne nothandleinstrumentchange
handleinstrumentchange
	iny
	lda (songdatalo),y
	sta songchannel1instrumentlo,x
	iny
	lda (songdatalo),y
	sta songchannel1instrumenthi,x
	lda #3
        jsr advancethesongpointerNbytes ; advance 3 bytes
	jmp processsongdata 

nothandleinstrumentchange
	cmp #$09                     ; ** absolute tempo change?
	bne nothandletempochange
	lda #0
	sta songtempo
handlerelativetempochange
	iny
	lda (songdatalo),y
        clc
	adc songtempo
	sta songtempo
	lda #2
        jsr advancethesongpointerNbytes ; advance 2 bytes
	jmp processsongdata

nothandletempochange
	cmp #$0A                     ; ** relative tempo change?:
	beq handlerelativetempochange
	cmp #$0B                     ; ** octave/semi change?
	beq handleoctavesemichange
handlepatterndata
	; ** if we're here its a pattern/loop "subroutine"
	; ** move the channel's "stack" pointer and populate the new stack level

	lda #4
	clc
	adc songchannel1stackdepth,x
	sta songchannel1stackdepth,x ; stack depth value will be 0, 4, or 8

	stx inttemp6 ; about to invalidate x. save it.
        lda songstackindex
	adc #4
	tax

	lda (songdatalo),y
	and #$7
	sta songchannel1layer1loops,x
	iny 
	lda (songdatalo),y
	sta songchannel1layer1lo,x
	iny 
	lda (songdatalo),y
	sta songchannel1layer1hi,x

	ldx inttemp6 ; restore x with the channel #

	; ** advance will operate on the old stack level, since we didn't store the updated songstackindex...
	lda #3
        jsr advancethesongpointerNbytes ; advance 3 bytes

	; ** ...but the new stack level will be correctly picked up when we process the next byte.
	jmp processsongdata
       
handlechannelEOD
	; ** check if there are loops remaining on the pattern
	stx inttemp6
        ldx songstackindex
	dec songchannel1layer1loops,x
	bmi handlechannelEODnoloop
	; ** loops are remaining. set the pattern pointer to the pattern start, which is contained after the EOD
	iny
	lda (songdatalo),y
        sta songchannel1layer1lo,x
	iny
	lda (songdatalo),y
        sta songchannel1layer1hi,x
	ldx inttemp6
	jmp processsongdata ; EOD handling doesn't have note length, so process the next data byte...

handlechannelEODnoloop
	; this pattern/loop is done playing. "pop" the stack
        ldx inttemp6
	lda songchannel1stackdepth,x
	beq handlerootchannelEOD
	sec
	sbc #4
	sta songchannel1stackdepth,x
	jmp processsongdata ; EOD handling doesn't have note length, so process the next data byte...

handlerootchannelEOD
	; this channel is done. point it to $ff data so we no longer process this channel.
	lda #0
        sta songchannel1layer1lo,x
        sta songchannel1layer1hi,x
	sta songchannel1busywait,x
	jmp setchannelcountbits
	rts

nothandlepatternchange
handleoctavesemichange
	iny
	lda (songdatalo),y
	sta songchannel1transpose,x
	lda #2
        jsr advancethesongpointerNbytes ; advance 2 bytes
	jmp processsongdata

advancethesongpointer1byte
        txa
        ldx songstackindex
        inc songchannel1layer1lo,x
	bne skiphiadvancethesongpointer1byte
        inc songchannel1layer1hi,x
skiphiadvancethesongpointer1byte
	tax
	rts

advancethesongpointerNbytes
	; entered with A=# of byte to advance
	stx inttemp6
        ldx songstackindex
	clc
        adc songchannel1layer1lo,x
        sta songchannel1layer1lo,x
	lda #0
        adc songchannel1layer1hi,x
        sta songchannel1layer1hi,x
	ldx inttemp6
	rts

clearsongmemory
	lda #0
	ldx #(songchannel4instrumenthi-songchannel1layer1lo)
clearsongmemoryloop1
	sta songchannel1layer1lo,x
	dex
	bpl clearsongmemoryloop1

	ldx #(songchannel4stackdepth-songchannel1layer1loops)
clearsongmemoryloop2
	sta songchannel1layer1loops,x
	dex
	bpl clearsongmemoryloop2

	lda #$ff
	ldx #3
clearsongmemoryloop3
	sta songchannel1busywait,x
	dex
	bpl clearsongmemoryloop3
	rts

setsongchannels
	jsr clearsongmemory
	ldy #7
	ldx #3
setsongchannelsloop
	lda (songpointerlo),y
	sta songchannel1layer1hi,x
	dey
	lda (songpointerlo),y
	sta songchannel1layer1lo,x
	dex
	dey
	bpl setsongchannelsloop
	rts

channel2bits
	.byte 1,2,4,8

tiatrackeroctavenotes
 ifconst BUZZBASS
LOWC = 15
 else
LOWC = 14
 endif
			; ****** ELECTRONIC (0 to 11)
	.byte LOWC,20	; c0    16.1Hz
	.byte LOWC,18	; c#0
	.byte LOWC,17	; d0
	.byte LOWC,16	; d#0
	.byte LOWC,15	; e0
	.byte LOWC,14	; f0  (very off)
	.byte LOWC,14	; f#0 
	.byte LOWC,13	; g0 
	.byte LOWC,12	; g#0 
	.byte LOWC,11	; a0 
	.byte LOWC,11	; a#0 (very off) 
	.byte LOWC,10	; b0    30.7Hz

			; ****** SLIGHTLY BUZZY (12 to 23)
	.byte 6,30	; c1    32.7Hz       
	.byte 6,28	; c#1        
	.byte 6,27	; d1
	.byte 6,25	; d#1
	.byte 6,24	; e1
	.byte 6,22	; f1
	.byte 6,21	; f#1
	.byte 6,20	; g1
	.byte 6,18	; g#1
	.byte 6,17	; a1
	.byte 6,16	; a#1
	.byte 6,15	; b1    63.4Hz

			; ****** BUZZY (24 to 39)
	.byte 1,31	; c2    65.5
	.byte 1,30	; c#2   67.6
	.byte 1,27	; d2    72.3
	.byte 1,26	; d#2   77.6
	.byte 1,24	; e2
	.byte 1,23	; f2
	.byte 1,22	; f#2
	.byte 1,20	; g2
	.byte 1,19	; g#2
	.byte 1,18	; a2
	.byte 1,17	; a#2
	.byte 1,16	; b2
	.byte 1,15	; c3   126.8Hz
	.byte 1,14	; c#3 
	.byte 1,13	; d3   149.7Hz
	.byte 1,12	; d#3  161.2Hz (very off)
			; ****** PURE (40 to 71) - best key is A3 Major
	.byte 12,31	; e3   163.8Hz
	.byte 12,29	; f3
	.byte 12,28	; f#3
	.byte 12,26	; g3
	.byte 12,24	; g#3
	.byte 12,23	; a3  songs in key of A benefit from Perceptual Tuning
	.byte 12,22	; a#3 
	.byte 12,20	; b3
	.byte 12,19	; c4  (middle C)
	.byte 12,18	; c#4
	.byte 12,17	; d4
	.byte 12,16	; d#4
	.byte 12,15	; e4
	.byte 12,14	; f4
	.byte 12,13	; f#4
	.byte 12,12	; g4  (very off)
	.byte 12,12	; g#4
	.byte 12,11	; a4
	.byte 12,10	; a#4
	.byte 4,31	; b4
	.byte 4,29	; c5
	.byte 4,28	; c#5
	.byte 4,26	; d5
	.byte 4,24	; d#5
	.byte 4,23	; e5
	.byte 4,22	; f5
	.byte 4,20	; f#5
	.byte 4,19	; g5
	.byte 4,18	; g#5
	.byte 4,17	; a5
	.byte 4,16	; a#5
	.byte 4,15	; b5

			; ****** TUNED WIND (72 to 83)
	.byte 8,30	; c
	.byte 8,28	; c#
	.byte 8,27	; d
	.byte 8,25	; d#
	.byte 8,24	; e
	.byte 8,22	; f
	.byte 8,21	; f#
	.byte 8,20	; g
	.byte 8,18	; g#
	.byte 8,17	; a
	.byte 8,16	; a#
	.byte 8,15	; b

	include "tiadrumkit.asm"

trackerend

 echo "  (tracker module is using ",[(trackerend-trackerstart)]d," bytes)"

 endif ;MUSICTRACKER
