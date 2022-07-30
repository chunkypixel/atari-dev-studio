 ; Provided under the CC0 license. See the included LICENSE.txt for details.

 processor 6502

 include "7800basic.h"
 include "7800basic_variable_redefs.h"

 ; BEADHEADER... disabled for now
 ; A BEAD header gets automatically incorportated into the ROM header. 
 ; For more BEAD executable info, check out the spec...
 ; http://7800.8bitdev.org/index.php/The_Atari_7800_BEAD_Execuable_Specification

GAMEDESCRIPTIONSET = 1
GAMEDESCRIPTION = "Test Name"


BDHSC   = %01000000
BDYM    = %00100000
BDPOKEY = %00010000
BDROF   = %00001000
BD16K   = %00000000
BD32K   = %00000001
BD48K   = %00000010
BD1800  = %00000101
BD4000  = %00000110

 ifconst BEADHEADER
BEADHARDWARE SET 0
   ifconst ROM16K 
BEADHARDWARE SET (BEADHARDWARE|BD16K)
   endif
   ifconst ROM32K 
BEADHARDWARE SET (BEADHARDWARE|BD32K)
   endif
   ifconst ROM48K 
BEADHARDWARE SET (BEADHARDWARE|BD48K)
   endif
   ifconst pokeysupport
BEADHARDWARE SET (BEADHARDWARE|BDPOKEY)
   endif
   ifconst HSSUPPORT
BEADHARDWARE SET (BEADHARDWARE|BDHSC)
   endif
 endif

 ;start address of cart...

BANK_WAS_SET SET 0

 ifconst ROM8K
   ORG $E000,0
BANK_WAS_SET SET 1
 endif ; ROM8K

 ifconst ROM16K
   ORG $C000,0
BANK_WAS_SET SET 1
   ifconst BEADHEADER
     .byte $BE,$AD,BEADHARDWARE
     ifconst GAMEDESCRIPTION
       CLC
       BCC _SKIPDESCRIPTION
       .byte GAMEDESCRIPTION,0
_SKIPDESCRIPTION
       endif
       jmp ($FFFC)
     endif ; GAMEDESCRIPTION
   endif ; BEADHEADER
 endif ; ROM16K

 ifconst ROM32K
   ORG $8000,0
BANK_WAS_SET SET 1
   ifconst BEADHEADER
     .byte $BE,$AD,BEADHARDWARE
     ifconst GAMEDESCRIPTION
       CLC
       BCC _SKIPDESCRIPTION
       .byte GAMEDESCRIPTION,0
_SKIPDESCRIPTION
       endif
       jmp ($FFFC)
     endif ; GAMEDESCRIPTION
   endif ; BEADHEADER
 endif ; ROM32K

 ifconst ROM48K
   ORG $4000,0
BANK_WAS_SET SET 1
   ifconst BEADHEADER
      .byte $BE,$AD,BEADHARDWARE
         ifconst GAMEDESCRIPTIONSET
            CLC
            BCC _SKIPDESCRIPTION
            .byte GAMEDESCRIPTION,0
_SKIPDESCRIPTION
         endif ; GAMEDESCRIPTIONSET
      jmp ($FFFC)
   endif ; BEADHEADER
 endif ; ROM48K

  ifconst ROM52K
BANK_WAS_SET SET 1
   ORG $3000,0
 endif ; ROM52K

 ifconst bankswitchmode
   ifconst ROMAT4K
BANK_WAS_SET SET 1
     ORG  $4000,0
     RORG $4000
   else ; ROMAT4K
BANK_WAS_SET SET 1
     ORG  $8000,0
     RORG $8000
   endif
 endif

 if BANK_WAS_SET = 0
   ORG $8000,0 ; default is 32K
 endif

