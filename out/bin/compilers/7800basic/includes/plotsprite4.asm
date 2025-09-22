     ; Provided under the CC0 license. See the included LICENSE.txt for details.

 ifconst PLOTSP4

plotsprite4
     ifnconst NODRAWWAIT
         ifconst DOUBLEBUFFER
             lda doublebufferstate
             bne skipplotsprite4wait
         endif ; DOUBLEBUFFER
         ifconst DEBUGWAITCOLOR
             lda #$41
             sta BACKGRND
         endif
plotsprite4wait
         lda visibleover
         bne plotsprite4wait
skipplotsprite4wait
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

         bcc continueplotsprite41 ; the sprite is fully on-screen, so carry on...
         ; otherwise, check to see if the bottom half is in zone 0...

         if WZONEHEIGHT = 16
             cmp #15
         else
             cmp #31
         endif

         bne exitplotsprite41
         ldx #0
         jmp continueplotsprite42
exitplotsprite41
         rts
     endif

continueplotsprite41

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
         beq checkcontinueplotsprite42
continueplotsprite41a
     endif

     lda temp1 ; graphic data, lo byte
     sta (dlpnt),y ;Low byte of data address

     iny
     lda temp3 ;palette|width
     sta (dlpnt),y

     iny
     lda temp5 ;Y position
     and #(WZONEHEIGHT - 1)
     cmp #1 ; clear carry if our sprite is just in this zone
     ora temp2 ; graphic data, hi byte
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

checkcontinueplotsprite42

     bcc doneSPDL4 ;branch if the sprite was fully in the last zone

     ;Create DL entry for lower part of sprite

     inx ;Next region

     ifnconst NOLIMITCHECKING
         cpx #WZONECOUNT

         bcc continueplotsprite42 ; the second half of the sprite is fully on-screen, so carry on...
         rts
continueplotsprite42
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
         bne continueplotsprite42a
         rts
continueplotsprite42a
     endif

     lda temp1 ; graphic data, lo byte
     sta (dlpnt),y

     iny
     lda temp3 ;palette|width
     sta (dlpnt),y

     iny
     lda temp5 ;Y position
     anc #(WZONEHEIGHT - 1) ; undocumented. A=A&IMM, then move bit 7 into carry
     ora temp2 ; graphic data, hi byte
     sbc #(WZONEHEIGHT-1) ; start at the DMA hole. -1 because carry is clear
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

doneSPDL4
     rts

 endif ; PLOTSP4
