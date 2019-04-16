; 7800MACRO.H

;-------------------------------------------------------
; BOXCOLLISIONCHECK
; Original author: Mike Saarna
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

; EOF
