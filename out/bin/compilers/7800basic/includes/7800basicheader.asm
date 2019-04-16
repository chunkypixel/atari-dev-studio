 processor 6502
 include "7800basic.h"
 include "7800basic_variable_redefs.h"

 ;start address of cart...
 ifconst ROM48K
   ORG $4000,0
 else
   ifconst bankswitchmode
     ifconst ROMAT4K
       ORG  $4000,0
       RORG $4000
     else
       ORG  $8000,0
       RORG $8000
     endif
   else ; not bankswitchmode
     ifconst ROM16K
       ORG $C000,0
     else
       ifconst ROM8K
         ORG $E000,0
       else
         ORG $8000,0
       endif
     endif
   endif
 endif

