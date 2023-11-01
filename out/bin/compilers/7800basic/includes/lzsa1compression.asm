; ***************************************************************************
; ***************************************************************************
;
; lzsa1_6502.s
;
; NMOS 6502 decompressor for data stored in Emmanuel Marty's LZSA1 format.
;
; Decompresses a raw LZSA1 block, created with the command-line lzsa utility:
;     lzsa -r <original_file> <compressed_file>
;
; in:
; * LZSA_SRC_LO and LZSA_SRC_HI contain the compressed raw block address
; * LZSA_DST_LO and LZSA_DST_HI contain the destination buffer address
;
; out:
; * the destination buffer will contain the decompressed data
; * LZSA_DST_LO and LZSA_DST_HI contain the last decompressed byte address +1
;
; ***************************************************************************
;
; This code is written for the ACME assembler.
;
; The code is 165 bytes for the small version, and 191 bytes for the normal.
;
; Copyright John Brandwood 2021.
;
; Changes intruduced by Mike Saarna, 2023:
;    -converted to DASM format.
;    -generalised memory locations, for easier incorporation into 7800basic
;    -removed self-modifying code, for use on rom-based platforms.
;
; get the original unmodified code from: 
; https://raw.githubusercontent.com/emmanuel-marty/lzsa
;
; Distributed under the Boost Software License, Version 1.0.
; (See accompanying file LICENSE_1_0.txt or copy at
; http://www.boost.org/LICENSE_1_0.txt)
;
; ***************************************************************************
; ***************************************************************************



; ***************************************************************************
; ***************************************************************************
;
; Decompression Options & Macros
;

;
; Choose size over decompression speed (within sane limits)?
;

LZSA_SMALL_SIZE  = 0
LZSAFASTCOPYBYTE = 1 ; +11 bytes rom

; ***************************************************************************
; ***************************************************************************
;
; ZP memory allocations... (temp1-temp9 are 7800basic ZP locations)
LSZA1ZPRAM     = temp1 
lzsa_winptr = LSZA1ZPRAM ; 1 word.
lzsa_srcptr = LSZA1ZPRAM + 2 ; 1 word.
lzsa_dstptr = LSZA1ZPRAM + 4 ; 1 word.

; Doesn't need to be ZP allocations...
LSZA1TEMPRAM     = temp7
lzsa_cmdbuf = LSZA1TEMPRAM ; 1 byte.
lzsa_cp_npages = LSZA1TEMPRAM + 1
lzsa_lz_npages = LSZA1TEMPRAM + 2

; Alternate names for previous allocations...
lzsa_offset = lzsa_winptr
LZSA_SRC_LO = lzsa_srcptr
LZSA_SRC_HI = lzsa_srcptr+1
LZSA_DST_LO = lzsa_dstptr
LZSA_DST_HI = lzsa_dstptr+1

 ifconst lzsa1support

lzsa1modulestart

; ***************************************************************************
; ***************************************************************************
;
; lzsa1_unpack - Decompress data stored in Emmanuel Marty's LZSA1 format.
;
; Args: lzsa_srcptr = ptr to compessed data
; Args: lzsa_dstptr = ptr to output buffer
;

DECOMPRESS_LZSA1_FAST
lzsa1_unpack
     ldy #0 ; Initialize source index.
     ldx #0 ; Initialize hi-byte of length.
     stx lzsa_cp_npages
     stx lzsa_lz_npages

;
; Copy bytes from compressed source data.
;
; N.B. X=0 is expected and guaranteed when we get here.
;

.cp_length
     if LZSA_SMALL_SIZE = 1

         jsr .get_byte

     else ; !LZSA_SMALL_SIZE

         lda (lzsa_srcptr),y
         inc lzsa_srcptr+0
         bne .cp_skip0
         inc lzsa_srcptr+1

     endif ; !LZSA_SMALL_SIZE

.cp_skip0
     sta lzsa_cmdbuf ; Preserve this for later.
     and #$70        ; Extract literal length.
     lsr             ; Set CC before ...
     beq .lz_offset  ; Skip directly to match?

     lsr ; Get 3-bit literal length.
     lsr
     lsr
     cmp #$07 ; Extended length?
     bcc .cp_got_len

     jsr .get_length    ; X=0, CS from CMP, returns CC.
     stx lzsa_cp_npages ; Hi-byte of length.

.cp_got_len
     tax ; Lo-byte of length.

 ifnconst LZSAFASTCOPYBYTE

.cp_byte ; CC throughout the execution of this .cp_page loop.
     lda (lzsa_srcptr),y ; 5
     sta (lzsa_dstptr),y ; 5
     inc lzsa_srcptr+0   ; 5
     bne .cp_skip1       ; 3
     inc lzsa_srcptr+1
.cp_skip1
     inc lzsa_dstptr+0   ; 5
     bne .cp_skip2       ; 3
     inc lzsa_dstptr+1
.cp_skip2
     dex                 ; 2
     bne .cp_byte        ; 3  
                         ; ~29 cycles for X=1
                         ; ~58 cycles for X=2
                         ; ~87 cycles for X=3

 else ; LZSAFASTCOPYBYTE

 ; according to 7800heat, this loop is hot. It runs on average ~6x. 
.cp_byte ; CC throughout the execution of this .cp_page loop.
     lda (lzsa_srcptr),y ; 5
     sta (lzsa_dstptr),y ; 5
     iny                 ; 2
     dex                 ; 2
     bne .cp_byte        ; 3
                         ; ~17 cycles per iteration
     tya                 ; 2
     adc lzsa_srcptr+0   ; 3
     sta lzsa_srcptr+0   ; 3
     bcc .cp_skip1       ; 3
     inc lzsa_srcptr+1
     clc
.cp_skip1
     tya                 ; 2
     adc lzsa_dstptr+0   ; 3
     sta lzsa_dstptr+0   ; 3
     bcc .cp_skip2       ; 3
     inc lzsa_dstptr+1
     clc
.cp_skip2
     ldy #0              ; 2
                         ; ~22 cycles overhead

                         ; ~39 cycles for X=1
                         ; ~56 cycles for X=2 (break-even)
                         ; ~73 cycles for X=3
 endif ; LZSAFASTCOPYBYTE

.cp_npages
     lda lzsa_cp_npages ; Any full pages left to copy?
     beq .lz_offset

     dec lzsa_cp_npages ; Unlikely, so can be slow.
     bcc .cp_byte       ; Always true!

 if LZSA_SMALL_SIZE = 1

; Copy bytes from decompressed window.
;
; Shorter but slower version.
;
; N.B. X=0 is expected and guaranteed when we get here.
;

.lz_offset
         jsr .get_byte ; Get offset-lo.

.offset_lo
         adc lzsa_dstptr+0 ; Always CC from .cp_page loop.
         sta lzsa_winptr+0

         lda #$FF
         bit lzsa_cmdbuf
         bpl .offset_hi

         jsr .get_byte ; Get offset-hi.

.offset_hi
         adc lzsa_dstptr+1 ; lzsa_winptr < lzsa_dstptr, so
         sta lzsa_winptr+1 ; always leaves CS.

.lz_length
         lda lzsa_cmdbuf ; X=0 from previous loop.
         and #$0F
         adc #$03 - 1 ; CS from previous ADC.
         cmp #$12 ; Extended length?
         bcc .lz_got_len

         jsr .get_length ; CS from CMP, X=0, returns CC.
         stx lzsa_lz_npages ; Hi-byte of length.

.lz_got_len
         tax ; Lo-byte of length.

.lz_byte
         lda (lzsa_winptr),y ; CC throughout the execution of
         sta (lzsa_dstptr),y ; of this .lz_page loop.
         inc lzsa_winptr+0
         bne .lz_skip1
         inc lzsa_winptr+1
.lz_skip1
         inc lzsa_dstptr+0
         bne .lz_skip2
         inc lzsa_dstptr+1
.lz_skip2
         dex
         bne .lz_byte
.lz_npages
         lda lzsa_lz_npages ; Any full pages left to copy?
         beq .cp_length

         dec lzsa_lz_npages ; Unlikely, so can be slow.
         bcc .lz_byte       ; Always true!

 else ; !LZSA_SMALL_SIZE

;
; Copy bytes from decompressed window.
;
; Longer but faster.
;
; N.B. X=0 is expected and guaranteed when we get here.
;

.lz_offset
         lda (lzsa_srcptr),y ; Get offset-lo.
         inc lzsa_srcptr+0
         bne .offset_lo
         inc lzsa_srcptr+1

.offset_lo
         sta lzsa_offset+0

         lda #$FF ; Get offset-hi.
         bit lzsa_cmdbuf
         bpl .offset_hi

         lda (lzsa_srcptr),y
         inc lzsa_srcptr+0
         bne .offset_hi
         inc lzsa_srcptr+1

.offset_hi
         sta lzsa_offset+1

.lz_length
         lda lzsa_cmdbuf ; X=0 from previous loop.
         and #$0F
         adc #$03 ; Always CC from .cp_page loop.
         cmp #$12 ; Extended length?
         bcc .got_lz_len

         jsr .get_length ; X=0, CS from CMP, returns CC.

.got_lz_len
         inx ; Hi-byte of length+256.

         eor #$FF ; Negate the lo-byte of length
         tay
         eor #$FF

.get_lz_dst
         adc lzsa_dstptr+0 ; Calc address of partial page.
         sta lzsa_dstptr+0 ; Always CC from previous CMP.
         iny
         bcs .get_lz_win
         beq .get_lz_win   ; Is lo-byte of length zero?
         dec lzsa_dstptr+1

.get_lz_win
         clc ; Calc address of match.
         adc lzsa_offset+0 ; N.B. Offset is negative!
         sta lzsa_winptr+0
         lda lzsa_dstptr+1
         adc lzsa_offset+1
         sta lzsa_winptr+1

 ; according to 7800heat, this loop is hot. It runs on average ~7.5x. 
 ; TODO: see if there's a chance to unroll it.
.lz_byte
         lda (lzsa_winptr),y
         sta (lzsa_dstptr),y
         iny
         bne .lz_byte

         inc lzsa_dstptr+1
         dex ; Any full pages left to copy?
         bne .lz_more

         jmp .cp_length ; Loop around to the beginning.

.lz_more
         inc lzsa_winptr+1 ; Unlikely, so can be slow.
         bne .lz_byte ; Always true!

     endif ; !LZSA_SMALL_SIZE

;
; Get 16-bit length in X:A register pair, return with CC.
;
; N.B. X=0 is expected and guaranteed when we get here.
;

.get_length
     clc ; Add on the next byte to get
     adc (lzsa_srcptr),y ; the length.
     inc lzsa_srcptr+0
     bne .skip_inc
     inc lzsa_srcptr+1
.skip_inc

     bcc .got_length ; No overflow means done.
     clc ; MUST return CC!
     tax ; Preserve overflow value.

.extra_byte
     jsr .get_byte ; So rare, this can be slow!
     pha
     txa ; Overflow to 256 or 257?
     beq .extra_word

.check_length
     pla ; Length-lo.
     bne .got_length ; Check for zero.
     dex ; Do one less page loop if so.
.got_length
     rts

.extra_word
     jsr .get_byte ; So rare, this can be slow!
     tax
     bne .check_length ; Length-hi == 0 at EOF.

.finished
     pla ; Length-lo.
     pla ; Decompression completed, pop
     pla ; return address.
     rts

.get_byte
     lda (lzsa_srcptr),y ; Subroutine version for when
     inc lzsa_srcptr+0   ; inlining isn't advantageous.
     bne .got_byte
     inc lzsa_srcptr+1   ; Inc & test for bank overflow.
.got_byte
     rts

lzsa1moduleend

 echo "  (lzsa1compression module is using ",[(lzsa1moduleend-lzsa1modulestart)]d," bytes of rom)"

 endif ; lzsa1support
