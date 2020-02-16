; Provided under the CC0 license. See the included LICENSE.txt for details.

  ifconst DEV
    ifnconst ZONEHEIGHT
      echo "* the 4k 7800basic area has",[($FF7E - *)]d,"bytes free."
    else
      if ZONEHEIGHT =  8
        echo "* the 4k 7800basic area has",[($FF7E - *)]d,"bytes free."
      else
        echo "* the 4k 7800basic area has",[($FF7E - *)]d,"bytes free."
      endif
    endif
  endif

  ; FF7E/FF7F contains the 7800basic crc checksum word

  ; FF80 - FFF7 contains the 7800 encryption key 

  ifnconst bankswitchmode 
    ORG $FFF8
  else
    ifconst ROM128K
      ORG $27FF8
      RORG $FFF8
    endif
    ifconst ROM144K
      ORG $27FF8
      RORG $FFF8
    endif
    ifconst ROM256K
      ORG $47FF8
      RORG $FFF8
    endif
    ifconst ROM272K
      ORG $47FF8
      RORG $FFF8
    endif
    ifconst ROM512K
      ORG $87FF8
      RORG $FFF8
    endif
    ifconst ROM528K
      ORG $87FF8
      RORG $FFF8
    endif
  endif


  .byte   $FF	; region verification. $FF=all regions
  .byte   $F7	; high nibble:  encryption check from $N000 to $FF7F. we only hash the last 4k for faster boot.
		; low nibble :  N=7 atari rainbow start, N=3 no atari rainbow

  ;Vectors
  .word NMI
  .word START
  .word IRQ

