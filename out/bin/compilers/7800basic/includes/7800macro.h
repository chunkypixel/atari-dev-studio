 ; Provided under the CC0 license. See the included LICENSE.txt for details.

; 7800MACRO.H

;-------------------------------------------------------
; BOXCOLLISIONCHECK
; author: Mike Saarna
;
; A general bounding box collision check. compares 2 rectangles of differing size
; and shape for overlap. Carry is set for collision detected, clear for none.
; 
; Usage: BOXCOLLISIONCHECK x1var,y1var,w1var,h1var,x2var,y2var,w2var,h2var
;

 MAC BOXCOLLISIONCHECK
.boxx1    SET {1}
.boxy1    SET {2}
.boxw1    SET {3}
.boxh1    SET {4}
.boxx2    SET {5}
.boxy2    SET {6}
.boxw2    SET {7}
.boxh2    SET {8}

.DoXCollisionCheck
     lda .boxx1 ;3
     cmp .boxx2 ;2
     bcs .X1isbiggerthanX2 ;2/3
.X2isbiggerthanX1
     adc #.boxw1 ;2
     cmp .boxx2 ;3
     bcs .DoYCollisionCheck ;3/2
     bcc .noboxcollision ;3
.X1isbiggerthanX2
     clc ;2
     sbc #.boxw2 ;2
     cmp .boxx2 ;3
     bcs .noboxcollision ;3/2
.DoYCollisionCheck
     lda .boxy1 ;3
     cmp .boxy2 ;3
     bcs .Y1isbiggerthanY2 ;3/2
.Y2isbiggerthanY1
     adc #.boxh1 ;2
     cmp .boxy2 ;3
     jmp .checkdone ;6 
.Y1isbiggerthanY2
     clc ;2
     sbc #.boxh2 ;2
     cmp .boxy2 ;3
     bcs .noboxcollision ;3/2
.boxcollision
     sec ;2
     .byte $24 ; hardcoded "BIT [clc opcode]", used to skip over the following clc
.noboxcollision
     clc ;2
.checkdone

 ENDM

; QBOXCOLLISIONCHECK
; author: unknown
;
; A general bounding box collision check. compares 2 rectangles of differing size
; and shape for overlap. Carry is CLEAR for collision detected, SET for none.
; 
; Usage: QBOXCOLLISIONCHECK x1var,y1var,w1var,h1var,x2var,y2var,w2var,h2var
;
 MAC QBOXCOLLISIONCHECK
.boxx1    SET {1}
.boxy1    SET {2}
.boxw1    SET {3}
.boxh1    SET {4}
.boxx2    SET {5}
.boxy2    SET {6}
.boxw2    SET {7}
.boxh2    SET {8}

	lda .boxx2
	clc
	adc #.boxw2
	sbc .boxx1
	cmp #.boxw1+.boxw2-1
	bcs .qboxcollisiondone
	;if we're here, carry is clear
 	lda .boxy2
	adc #.boxh2
	sbc .boxy1
	cmp #.boxh1+.boxh2-1
.qboxcollisiondone
	rol ; temp for testing - invert carry...
	eor #1
	ror
 ENDM


 MAC MEDIAN3

	; A median filter (for smoothing paddle jitter)
	;   this macro takes the current paddle value, compares it to historic
	;   values, and replaces the current paddle value with the median.
	; 
	; called as:  MEDIAN3 STORAGE CURRENT
	;    where STORAGE points to 3 consecutive bytes of memory. The first 2
	;        must be dedicated to this MEDIAN filter. The last 1 is a temp.
	;    where CURRENT is memory holding the new value you wish to compare to
	;        the previous values, and update with the median value.
	;
	; returns: CURRENT (modified to contain median value)
	;
	; author: Mike Saarna (aka RevEng)

.MedianBytes    SET {1}
.NewValue       SET {2}

	lda #0
	ldy .NewValue
	sty .MedianBytes+2 ; put the new value in the most "recent" slot

	; build an index from relative size comparisons between our 3 values.
	cpy .MedianBytes
	rol
	cpy .MedianBytes+1
	rol
	ldy .MedianBytes
	cpy .MedianBytes+1
	rol
	tay

	ldx MedianOrderLUT,y ; convert the size-comparison index to an index to the median value
	lda .MedianBytes,x
	sta .NewValue ; we replace the new value memory with the median value

	; then shift values from "newer" bytes to "older" bytes, leaving the 
	; newest byte (.MedianBytes+2) empty for next time.
	lda .MedianBytes+1 
	sta .MedianBytes
	lda .MedianBytes+2
	sta .MedianBytes+1
 ifnconst MedianOrderLUT
	jmp MedianOrderLUTend
MedianOrderLUT ; converts our "comparison index" to an index to the median value
	.byte 0 ; 0  B2 < B0 < B1
	.byte 1 ; 1  B2 < B1 < B0
	.byte 2 ; 2   impossible 
	.byte 2 ; 3  B1 < B2 < B0
	.byte 2 ; 4  B0 < B2 < B1
	.byte 2 ; 5   impossible 
	.byte 1 ; 6  B0 < B1 < B2
	.byte 0 ; 7  B1 < B0 < B2
MedianOrderLUTend
 endif
   ENDM

 MAC PLOTSPRITE

	; A macro version of the plotsprite command. 
	; This trades off rom space for speed.
	; It also doesn't check if the visible screen is displayed or not.
	; It has no training wheels. It is all rusty sharp edges.

.GFXLabel   SET {1}
.Palette    SET {2} ; constant
.SpriteX    SET {3} ; variable
.SpriteY    SET {4} ; variable
.ByteOffset SET {5} ; variable 

	lda .SpriteY
        lsr
        lsr
        asr #%11111110 ; ensure carry is clear
   if WZONEHEIGHT = 16
        asr #%11111110 ; ensure carry is clear
   endif
 
	tax

        cpx #WZONECOUNT
	bcs .PLOTSPRITEnext
	; carry is clear
	
	lda DLPOINTL,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc doublebufferdloffset
	endif ; DOUBLEBUFFER
	sta dlpnt
	lda DLPOINTH,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc #0
	endif ; DOUBLEBUFFER
	sta dlpnt+1
	
 	ldy dlend,x ; find the next new object position in this zone

 ifconst .ByteOffset

	lda .ByteOffset 

	ifconst DOUBLEBUFFER
 	if {1}_width = 1
        	clc
 	endif
 	endif

 if {1}_width = 2
        asl
 endif
 if {1}_width = 3
        asl
        adc .ByteOffset
 endif
 if {1}_width = 4
        asl
        asl
 endif
 if {1}_width = 5
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 6
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 7
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 8
        asl
        asl
        asl
 endif
 if {1}_width = 9
        asl
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 10
        asl
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 11
        asl
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 12
        asl
        adc .ByteOffset
        asl
        asl
 endif
 if {1}_width = 13
        asl
        adc .ByteOffset
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 14
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 15
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 16
        asl
        asl
        asl
        asl
 endif

	adc #<.GFXLabel ; carry is clear via previous asl or asr
 else
	lda #<.GFXLabel ; carry is clear via previous asl or asr
 endif ; .ByteOffset
        sta (dlpnt),y ; #1 - low byte object address

	iny

	lda #({1}_mode | %01000000)
	sta (dlpnt),y ; #2 - graphics mode , indirect

	iny

	lda .SpriteY
	and #(WZONEHEIGHT - 1)
	cmp #1 ; clear carry if our sprite is just in this zone
	ora #>.GFXLabel
	sta (dlpnt),y ; #3 - hi byte object address

	iny

	lda #({1}_width_twoscompliment | (.Palette * 32))
	sta (dlpnt),y ; #4 - palette|width

	iny

	lda .SpriteX
	sta (dlpnt),y ; #5 - x object position

        iny
        sty dlend,x

    ifconst ALWAYSTERMINATE
         iny
         lda #0
         sta (dlpnt),y
     endif

	bcc .PLOTSPRITEend

.PLOTSPRITEnext
	inx ; next zone

        cpx #WZONECOUNT
	bcs .PLOTSPRITEend 
	; carry is clear

	lda DLPOINTL,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc doublebufferdloffset
	endif ; DOUBLEBUFFER
	sta dlpnt
	lda DLPOINTH,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc #0
	endif ; DOUBLEBUFFER
	sta dlpnt+1
	
 	ldy dlend,x ; find the next new object position in this zone

 ifconst .ByteOffset

	lda .ByteOffset
 if {1}_width = 1
        clc
 endif
 if {1}_width = 2
        asl ; carry clear
 endif
 if {1}_width = 3
        asl ; carry clear
        adc .ByteOffset
 endif
 if {1}_width = 4
        asl ; carry clear
        asl
 endif
 if {1}_width = 5
        asl ; carry clear
        asl
        adc .ByteOffset
 endif
 if {1}_width = 6
        asl ; carry clear
        adc .ByteOffset
        asl
 endif
 if {1}_width = 7
        asl ; carry clear
        adc .ByteOffset
        asl
 endif
 if {1}_width = 8
        asl ; carry clear
        asl
        asl
 endif
 if {1}_width = 9
        asl ; carry clear
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 10
        asl ; carry clear
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 11
        asl ; carry clear
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 12
        asl ; carry clear
        adc .ByteOffset
        asl
        asl
 endif
 if {1}_width = 13
        asl ; carry clear
        adc .ByteOffset
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 14
        asl ; carry clear
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 15
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 16
        asl
        asl
        asl
        asl
 endif

	adc #<.GFXLabel
 else
	lda #<.GFXLabel
 endif ; .ByteOffset

        sta (dlpnt),y ; #1 - low byte object address

	iny

	lda #({1}_mode | %01000000)
	sta (dlpnt),y ; #2 - graphics mode , indirect

	iny

	lda .SpriteY
	and #(WZONEHEIGHT - 1)
	ora #>(.GFXLabel - (WZONEHEIGHT * 256)) ; start in the dma hole
	sta (dlpnt),y ; #3 - hi byte object address

	iny

	lda #({1}_width_twoscompliment | (.Palette * 32))
	sta (dlpnt),y ; #4 - palette|width

	iny

	lda .SpriteX
	sta (dlpnt),y ; #5 - x object position

	iny
	sty dlend,x

    ifconst ALWAYSTERMINATE
         iny
         lda #0
         sta (dlpnt),y
     endif

.PLOTSPRITEend
 ENDM

 MAC PLOTSPRITEVP

	; A macro version of the plotsprite command. (with Variable palette)
	; This trades off rom space for speed.
	; It also doesn't check if the visible screen is displayed or not.
	; It has no training wheels. It is all rusty sharp edges.

.GFXLabel   SET {1}
.Palette    SET {2} ; variable (palette desired *32)
.SpriteX    SET {3} ; variable
.SpriteY    SET {4} ; variable
.ByteOffset SET {5} ; variable 

	lda .SpriteY
        lsr
        lsr
        asr #%11111110 ; ensure carry is clear
   if WZONEHEIGHT = 16
        asr #%11111110 ; ensure carry is clear
   endif
 
	tax

        cpx #WZONECOUNT
	bcs .PLOTSPRITEnext
	; carry is clear
	
	lda DLPOINTL,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc doublebufferdloffset
	endif ; DOUBLEBUFFER
	sta dlpnt
	lda DLPOINTH,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc #0
	endif ; DOUBLEBUFFER
	sta dlpnt+1
	
 	ldy dlend,x ; find the next new object position in this zone

 ifconst .ByteOffset

	lda .ByteOffset 

	ifconst DOUBLEBUFFER
 	if {1}_width = 1
        	clc
 	endif
 	endif

 if {1}_width = 2
        asl
 endif
 if {1}_width = 3
        asl
        adc .ByteOffset
 endif
 if {1}_width = 4
        asl
        asl
 endif
 if {1}_width = 5
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 6
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 7
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 8
        asl
        asl
        asl
 endif
 if {1}_width = 9
        asl
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 10
        asl
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 11
        asl
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 12
        asl
        adc .ByteOffset
        asl
        asl
 endif
 if {1}_width = 13
        asl
        adc .ByteOffset
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 14
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 15
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 16
        asl
        asl
        asl
        asl
 endif

	adc #<.GFXLabel ; carry is clear via previous asl or asr
 else
	lda #<.GFXLabel ; carry is clear via previous asl or asr
 endif ; .ByteOffset
        sta (dlpnt),y ; #1 - low byte object address

	iny

	lda #({1}_mode | %01000000)
	sta (dlpnt),y ; #2 - graphics mode , indirect

	iny

	lda .SpriteY
	and #(WZONEHEIGHT - 1)
	cmp #1 ; clear carry if our sprite is just in this zone
	ora #>.GFXLabel
	sta (dlpnt),y ; #3 - hi byte object address

	iny

	lda #({1}_width_twoscompliment)
        ora .Palette
	sta (dlpnt),y ; #4 - palette|width

	iny

	lda .SpriteX
	sta (dlpnt),y ; #5 - x object position

        iny
        sty dlend,x

    ifconst ALWAYSTERMINATE
         iny
         lda #0
         sta (dlpnt),y
     endif

	bcc .PLOTSPRITEend

.PLOTSPRITEnext
	inx ; next zone

        cpx #WZONECOUNT
	bcs .PLOTSPRITEend 
	; carry is clear

	lda DLPOINTL,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc doublebufferdloffset
	endif ; DOUBLEBUFFER
	sta dlpnt
	lda DLPOINTH,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc #0
	endif ; DOUBLEBUFFER
	sta dlpnt+1
	
 	ldy dlend,x ; find the next new object position in this zone

 ifconst .ByteOffset

	lda .ByteOffset
 if {1}_width = 1
        clc
 endif
 if {1}_width = 2
        asl ; carry clear
 endif
 if {1}_width = 3
        asl ; carry clear
        adc .ByteOffset
 endif
 if {1}_width = 4
        asl ; carry clear
        asl
 endif
 if {1}_width = 5
        asl ; carry clear
        asl
        adc .ByteOffset
 endif
 if {1}_width = 6
        asl ; carry clear
        adc .ByteOffset
        asl
 endif
 if {1}_width = 7
        asl ; carry clear
        adc .ByteOffset
        asl
 endif
 if {1}_width = 8
        asl ; carry clear
        asl
        asl
 endif
 if {1}_width = 9
        asl ; carry clear
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 10
        asl ; carry clear
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 11
        asl ; carry clear
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 12
        asl ; carry clear
        adc .ByteOffset
        asl
        asl
 endif
 if {1}_width = 13
        asl ; carry clear
        adc .ByteOffset
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 14
        asl ; carry clear
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 15
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 16
        asl
        asl
        asl
        asl
 endif


	adc #<.GFXLabel
 else
	lda #<.GFXLabel
 endif ; .ByteOffset

        sta (dlpnt),y ; #1 - low byte object address

	iny

	lda #({1}_mode | %01000000)
	sta (dlpnt),y ; #2 - graphics mode , indirect

	iny

	lda .SpriteY
	and #(WZONEHEIGHT - 1)
	ora #>(.GFXLabel - (WZONEHEIGHT * 256)) ; start in the dma hole
	sta (dlpnt),y ; #3 - hi byte object address

	iny

	lda #({1}_width_twoscompliment)
        ora .Palette
	sta (dlpnt),y ; #4 - palette|width

	iny

	lda .SpriteX
	sta (dlpnt),y ; #5 - x object position

	iny
	sty dlend,x

    ifconst ALWAYSTERMINATE
         iny
         lda #0
         sta (dlpnt),y
     endif

.PLOTSPRITEend
 ENDM

 MAC PLOTSPRITE4

	; A macro version of plotsprite. (with 4 byte objects)
	; This trades off rom space for speed.
	; It also doesn't check if the visible screen is displayed or not.
	; It has no training wheels. It is all rusty sharp edges.

.GFXLabel   SET {1}
.Palette    SET {2} ; constant
.SpriteX    SET {3} ; variable
.SpriteY    SET {4} ; variable
.ByteOffset SET {5} ; variable 

	lda .SpriteY
        lsr
        lsr
        asr #%11111110 ; ensure carry is clear
   if WZONEHEIGHT = 16
        asr #%11111110 ; ensure carry is clear
   endif
 
	tax

        cpx #WZONECOUNT
	bcs .PLOTSPRITEnext
	; carry is clear
	
	lda DLPOINTL,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc doublebufferdloffset
	endif ; DOUBLEBUFFER
	sta dlpnt
	lda DLPOINTH,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc #0
	endif ; DOUBLEBUFFER
	sta dlpnt+1
	
 	ldy dlend,x ; find the next new object position in this zone

 ifconst .ByteOffset

	lda .ByteOffset 

	ifconst DOUBLEBUFFER
 	if {1}_width = 1
       		clc
 	endif
 	endif

 if {1}_width = 2
        asl
 endif
 if {1}_width = 3
        asl
        adc .ByteOffset
 endif
 if {1}_width = 4
        asl
        asl
 endif
 if {1}_width = 5
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 6
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 7
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 8
        asl
        asl
        asl
 endif
 if {1}_width = 9
        asl
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 10
        asl
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 11
        asl
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 12
        asl
        adc .ByteOffset
        asl
        asl
 endif
 if {1}_width = 13
        asl
        adc .ByteOffset
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 14
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 15
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 16
        asl
        asl
        asl
        asl
 endif


	adc #<.GFXLabel ; carry is clear via previous asl or asr
 else
	lda #<.GFXLabel ; carry is clear via previous asl or asr
 endif ; .ByteOffset
        sta (dlpnt),y ; #1 - low byte object address

	iny
	lda #({1}_width_twoscompliment | (.Palette * 32))
	sta (dlpnt),y ; #2 - palette|width

	iny
	lda .SpriteY
	and #(WZONEHEIGHT - 1)
	cmp #1 ; clear carry if our sprite is just in this zone
	ora #>.GFXLabel
	sta (dlpnt),y ; #3 - hi byte object address

	iny
	lda .SpriteX
	sta (dlpnt),y ; #4 - x object position

        iny
        sty dlend,x

    ifconst ALWAYSTERMINATE
         iny
         lda #0
         sta (dlpnt),y
     endif

	bcc .PLOTSPRITEend

.PLOTSPRITEnext
	inx ; next zone

        cpx #WZONECOUNT
	bcs .PLOTSPRITEend 
	; carry is clear

	lda DLPOINTL,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc doublebufferdloffset
	endif ; DOUBLEBUFFER
	sta dlpnt
	lda DLPOINTH,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc #0
	endif ; DOUBLEBUFFER
	sta dlpnt+1
	
 	ldy dlend,x ; find the next new object position in this zone

 ifconst .ByteOffset

	lda .ByteOffset
 if {1}_width = 1
        clc
 endif
 if {1}_width = 2
        asl ; carry clear
 endif
 if {1}_width = 3
        asl ; carry clear
        adc .ByteOffset
 endif
 if {1}_width = 4
        asl ; carry clear
        asl
 endif
 if {1}_width = 5
        asl ; carry clear
        asl
        adc .ByteOffset
 endif
 if {1}_width = 6
        asl ; carry clear
        adc .ByteOffset
        asl
 endif
 if {1}_width = 7
        asl ; carry clear
        adc .ByteOffset
        asl
 endif
 if {1}_width = 8
        asl ; carry clear
        asl
        asl
 endif
 if {1}_width = 9
        asl ; carry clear
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 10
        asl ; carry clear
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 11
        asl ; carry clear
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 12
        asl ; carry clear
        adc .ByteOffset
        asl
        asl
 endif
 if {1}_width = 13
        asl ; carry clear
        adc .ByteOffset
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 14
        asl ; carry clear
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 15
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 16
        asl
        asl
        asl
        asl
 endif


	adc #<.GFXLabel
 else
	lda #<.GFXLabel
 endif ; .ByteOffset
        sta (dlpnt),y ; #1 - low byte object address

	iny
	lda #({1}_width_twoscompliment | (.Palette * 32))
	sta (dlpnt),y ; #2 - palette|width

	iny
	lda .SpriteY
	and #(WZONEHEIGHT - 1)
	ora #>(.GFXLabel - (WZONEHEIGHT * 256)) ; start in the dma hole
	sta (dlpnt),y ; #3 - hi byte object address

	iny
	lda .SpriteX
	sta (dlpnt),y ; #4 - x object position

	iny
	sty dlend,x

    ifconst ALWAYSTERMINATE
         iny
         lda #0
         sta (dlpnt),y
     endif

.PLOTSPRITEend
 ENDM

 MAC PLOTSPRITE4VP
        ; 
	; A macro version of plotsprite. (with 4 byte objects+variable palette)
	; This trades off rom space for speed.
	; It also doesn't check if the visible screen is displayed or not.
	; It has no training wheels. It is all rusty sharp edges.

.GFXLabel   SET {1}
.Palette    SET {2} ; variable (palette desired *32)
.SpriteX    SET {3} ; variable
.SpriteY    SET {4} ; variable
.ByteOffset SET {5} ; variable 

	lda .SpriteY
        lsr
        lsr
        asr #%11111110 ; ensure carry is clear
   if WZONEHEIGHT = 16
        asr #%11111110 ; ensure carry is clear
   endif
 
	tax

        cpx #WZONECOUNT
	bcs .PLOTSPRITEnext
	; carry is clear
	
	lda DLPOINTL,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc doublebufferdloffset
	endif ; DOUBLEBUFFER
	sta dlpnt
	lda DLPOINTH,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc #0
	endif ; DOUBLEBUFFER
	sta dlpnt+1
	
 	ldy dlend,x ; find the next new object position in this zone

 ifconst .ByteOffset
	lda .ByteOffset 

	ifconst DOUBLEBUFFER
 	if {1}_width = 1
       		clc
 	endif
 	endif

 if {1}_width = 2
        asl
 endif
 if {1}_width = 3
        asl
        adc .ByteOffset
 endif
 if {1}_width = 4
        asl
        asl
 endif
 if {1}_width = 5
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 6
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 7
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 8
        asl
        asl
        asl
 endif
 if {1}_width = 9
        asl
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 10
        asl
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 11
        asl
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 12
        asl
        adc .ByteOffset
        asl
        asl
 endif
 if {1}_width = 13
        asl
        adc .ByteOffset
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 14
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 15
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 16
        asl
        asl
        asl
        asl
 endif

	adc #<.GFXLabel ; carry is clear via previous asl or asr
 else
	lda #<.GFXLabel ; carry is clear via previous asl or asr
 endif ; .ByteOffset
        sta (dlpnt),y ; #1 - low byte object address

	iny
	lda #({1}_width_twoscompliment)
        ora .Palette
	sta (dlpnt),y ; #2 - palette|width

	iny
	lda .SpriteY
	and #(WZONEHEIGHT - 1)
	cmp #1 ; clear carry if our sprite is just in this zone
	ora #>.GFXLabel
	sta (dlpnt),y ; #3 - hi byte object address

	iny
	lda .SpriteX
	sta (dlpnt),y ; #4 - x object position

        iny
        sty dlend,x

    ifconst ALWAYSTERMINATE
         iny
         lda #0
         sta (dlpnt),y
     endif

	bcc .PLOTSPRITEend

.PLOTSPRITEnext
	inx ; next zone

        cpx #WZONECOUNT
	bcs .PLOTSPRITEend 
	; carry is clear

	lda DLPOINTL,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc doublebufferdloffset
	endif ; DOUBLEBUFFER
	sta dlpnt
	lda DLPOINTH,x ; setup DL pointer for this zone
	ifconst DOUBLEBUFFER
		adc #0
	endif ; DOUBLEBUFFER
	sta dlpnt+1
	
 	ldy dlend,x ; find the next new object position in this zone

 ifconst .ByteOffset

	lda .ByteOffset
 if {1}_width = 1
        clc
 endif
 if {1}_width = 2
        asl ; carry clear
 endif
 if {1}_width = 3
        asl ; carry clear
        adc .ByteOffset
 endif
 if {1}_width = 4
        asl ; carry clear
        asl
 endif
 if {1}_width = 5
        asl ; carry clear
        asl
        adc .ByteOffset
 endif
 if {1}_width = 6
        asl ; carry clear
        adc .ByteOffset
        asl
 endif
 if {1}_width = 7
        asl ; carry clear
        adc .ByteOffset
        asl
 endif
 if {1}_width = 8
        asl ; carry clear
        asl
        asl
 endif
 if {1}_width = 9
        asl ; carry clear
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 10
        asl ; carry clear
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 11
        asl ; carry clear
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 12
        asl ; carry clear
        adc .ByteOffset
        asl
        asl
 endif
 if {1}_width = 13
        asl ; carry clear
        adc .ByteOffset
        asl
        asl
        adc .ByteOffset
 endif
 if {1}_width = 14
        asl ; carry clear
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
 endif
 if {1}_width = 15
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
        asl
        adc .ByteOffset
 endif
 if {1}_width = 16
        asl
        asl
        asl
        asl
 endif


	adc #<.GFXLabel
 else
	lda #<.GFXLabel
 endif ; .ByteOffset
        sta (dlpnt),y ; #1 - low byte object address

	iny
	lda #({1}_width_twoscompliment)
	ora .Palette
	sta (dlpnt),y ; #2 - palette|width

	iny
	lda .SpriteY
	and #(WZONEHEIGHT - 1)
	ora #>(.GFXLabel - (WZONEHEIGHT * 256)) ; start in the dma hole
	sta (dlpnt),y ; #3 - hi byte object address

	iny
	lda .SpriteX
	sta (dlpnt),y ; #4 - x object position

	iny
	sty dlend,x

    ifconst ALWAYSTERMINATE
         iny
         lda #0
         sta (dlpnt),y
     endif

.PLOTSPRITEend
 ENDM


 MAC SIZEOF

	; echo's the size difference between the current address and the
	; a label that was passed as an argument. This is a quick way to
	; determine the size of a structure.

.NAME SETSTR {1}
        echo " The Size of",.NAME,"is:",[* - {1}]d,[* - {2}]d,"bytes."
  ENDM

