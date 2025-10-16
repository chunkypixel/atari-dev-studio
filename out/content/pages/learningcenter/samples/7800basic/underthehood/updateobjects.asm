; --------------------------------------------------------------------------
; UpdateObjects assembly code provided by RevEng (Mike Saarna)
; (only works with default sprites in 7800basic - if you're using the  
; 4 byte sprites, use the UpdateObjects4 assembly file instead.)   
;   
;   allows enabling, disabling, setting palette, or graphic for any object
;   in the display lists, given the zone number (Y) and the number of the 
;   object in that zone. (X)
;   
; updated 20200529 - clean-up for release, renaming and changing of routines
; to macros, support for different zone heights in DisableObject and 
; EnableObject.  Addition of SetObjectX and SetObjectY macros.
;   
; updated 20200301 - Update to support full extended screen height, and up
; to 40 objects in the zone. Extend the x5table if you need more objects, 
; but really, Maria won't be able to likely draw more than 40.
; -------------------------------------------------------------------------- 


 ; DisableObject - X=object_X Y=object_Y
 MAC DisableObject
 jsr SetObjectPointer
 ldy #2 ; High Address of graphics
 lda (temp1),y
 if WZONEHEIGHT = 8
     ora #%00001000
 endif
 if WZONEHEIGHT = 16
     ora #%00010000
 endif
 sta (temp1),y
 ENDM


  ; EnableObject - X=object_X Y=object_Y
 MAC EnableObject
 jsr SetObjectPointer
 ldy #2 ; High Address of graphics
 lda (temp1),y
 if WZONEHEIGHT = 8
     and #%11110111
 endif
 if WZONEHEIGHT = 16
     and #%11101111
 endif
 sta (temp1),y
 ENDM


 MAC SetObjectPalette
  ; SetObjectPalette - X=object_X Y=object_Y {1}=palette
 jsr SetObjectPointer
 ldy #3 ; palette+width is the 4th byte in the dl object
 lda (temp1),y
 and #%00011111
 ldx {1}
 ora x32table,x
 sta (temp1),y
 ENDM


  MAC SetObjectX
  ; SetObjectX - X=object_X Y=object_Y {1}=X-coordinate
 jsr SetObjectPointer
 ldy #4 ; object x-coordinate is the 5th byte in the dl object
 lda {1}
 sta (temp1),y
 ENDM


 ; SetObjectY - X=object_X Y=object_Y {1}=y coordinate in zone
 MAC SetObjectY
 jsr SetObjectPointer
 ldy #2 ; High Address of graphics
 lda (temp1),y
 if WZONEHEIGHT = 8
     and #%11111000
 endif
 if WZONEHEIGHT = 16
     and #%11110000
 endif
 ora {1}
 sta (temp1),y
 ENDM


 MAC SetObjectImageLo
  ; SetObjectImageLo - X=object_X Y=object_Y {1}=index in gfx block
 jsr SetObjectPointer
 ldy #0 ; low address of gfx is the 1st byte in the dl object
 lda {1}
 sta (temp1),y
 ENDM


  ; SetObjectImage - X=object_X Y=object_Y {1}=gfx_label
 MAC SetObjectImage
 jsr SetObjectPointer
 ldy #0 ; lo Address of graphics
 lda #<{1}
 sta (temp1),y
 ldy #2 ; hi Address of graphics
 lda #>{1}
 sta (temp1),y
 ENDM

 ; ********* utility functions and structures follow *********

 jmp UpdateObjectsEnd

SetObjectPointer ; called with X=object_X Y=object_Y
 clc
 lda ZONESTARTLO,y
 adc x5table,x
 sta temp1 
 lda ZONESTARTHI,y
 adc #0
 sta temp2
 rts

x5table ; enough entries to support 40 objects per dl
MULT5IDX SET 0
 REPEAT 40
 .byte MULT5IDX
MULT5IDX SET (MULT5IDX+5)
 REPEND

x32table ; 32 multiplaction for palette values
MULT32IDX SET 0
 REPEAT 8
 .byte MULT32IDX
MULT32IDX SET (MULT32IDX+32)
 REPEND

ZONESTARTLO
 .byte <ZONE0ADDRESS
 .byte <ZONE1ADDRESS
 .byte <ZONE2ADDRESS
 .byte <ZONE3ADDRESS
 .byte <ZONE4ADDRESS
 .byte <ZONE5ADDRESS
 .byte <ZONE6ADDRESS
 .byte <ZONE7ADDRESS
 .byte <ZONE8ADDRESS
 .byte <ZONE9ADDRESS
 .byte <ZONE10ADDRESS
 .byte <ZONE11ADDRESS
 ifconst ZONE12ADDRESS
   .byte <ZONE12ADDRESS
 endif
 ifconst ZONE13ADDRESS
   .byte <ZONE13ADDRESS
 endif
 ifconst ZONE14ADDRESS
   .byte <ZONE14ADDRESS
 endif
 ifconst ZONE15ADDRESS
   .byte <ZONE15ADDRESS
 endif
 ifconst ZONE16ADDRESS
   .byte <ZONE16ADDRESS
 endif
 ifconst ZONE17ADDRESS
   .byte <ZONE17ADDRESS
 endif
 ifconst ZONE18ADDRESS
   .byte <ZONE18ADDRESS
 endif
 ifconst ZONE19ADDRESS
   .byte <ZONE19ADDRESS
 endif
 ifconst ZONE20ADDRESS
   .byte <ZONE20ADDRESS
 endif
 ifconst ZONE21ADDRESS
   .byte <ZONE21ADDRESS
 endif
 ifconst ZONE22ADDRESS
   .byte <ZONE22ADDRESS
 endif
 ifconst ZONE23ADDRESS
   .byte <ZONE23ADDRESS
 endif
 ifconst ZONE24ADDRESS
   .byte <ZONE24ADDRESS
 endif
 ifconst ZONE25ADDRESS
   .byte <ZONE25ADDRESS
 endif
 ifconst ZONE26ADDRESS
   .byte <ZONE26ADDRESS
 endif
 ifconst ZONE27ADDRESS
   .byte <ZONE27ADDRESS
 endif

ZONESTARTHI
 .byte >ZONE0ADDRESS
 .byte >ZONE1ADDRESS
 .byte >ZONE2ADDRESS
 .byte >ZONE3ADDRESS
 .byte >ZONE4ADDRESS
 .byte >ZONE5ADDRESS
 .byte >ZONE6ADDRESS
 .byte >ZONE7ADDRESS
 .byte >ZONE8ADDRESS
 .byte >ZONE9ADDRESS
 .byte >ZONE10ADDRESS
 .byte >ZONE11ADDRESS
 ifconst ZONE12ADDRESS
   .byte >ZONE12ADDRESS
 endif
 ifconst ZONE13ADDRESS
   .byte >ZONE13ADDRESS
 endif
 ifconst ZONE14ADDRESS
   .byte >ZONE14ADDRESS
 endif
 ifconst ZONE15ADDRESS
   .byte >ZONE15ADDRESS
 endif
 ifconst ZONE16ADDRESS
   .byte >ZONE16ADDRESS
 endif
 ifconst ZONE17ADDRESS
   .byte >ZONE17ADDRESS
 endif
 ifconst ZONE18ADDRESS
   .byte >ZONE18ADDRESS
 endif
 ifconst ZONE19ADDRESS
   .byte >ZONE19ADDRESS
 endif
 ifconst ZONE20ADDRESS
   .byte >ZONE20ADDRESS
 endif
 ifconst ZONE21ADDRESS
   .byte >ZONE21ADDRESS
 endif
 ifconst ZONE22ADDRESS
   .byte >ZONE22ADDRESS
 endif
 ifconst ZONE23ADDRESS
   .byte >ZONE23ADDRESS
 endif
 ifconst ZONE24ADDRESS
   .byte >ZONE24ADDRESS
 endif
 ifconst ZONE25ADDRESS
   .byte >ZONE25ADDRESS
 endif
 ifconst ZONE26ADDRESS
   .byte >ZONE26ADDRESS
 endif
 ifconst ZONE27ADDRESS
   .byte >ZONE27ADDRESS
 endif

UpdateObjectsEnd
