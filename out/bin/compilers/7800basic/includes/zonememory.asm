 ; Provided under the CC0 license. See the included LICENSE.txt for details.

     ;************** Setup DLL entries

     ; setup some working definitions, to avoid ifnconst mess elsewhere...
     ifnconst SCREENHEIGHT
WSCREENHEIGHT         = 192
     else
WSCREENHEIGHT         = SCREENHEIGHT
     endif

     ifnconst ZONEHEIGHT
WZONEHEIGHT         = 16
     else
WZONEHEIGHT         = ZONEHEIGHT
     endif

     ifnconst ZONECOUNT
WZONECOUNT         = (WSCREENHEIGHT/WZONEHEIGHT)
     else
WZONECOUNT         = ZONECOUNT
     endif

     ; top of the frame, non-visible lines. this is based on NTSC,
     ; but we add in extra NV lines at the end of the display to ensure
     ; our PAL friends can play the game without it crashing.
NVLINES         = ((243-WSCREENHEIGHT)/2)

    ifnconst DLMEMSTART
      ifnconst DOUBLEBUFFER
WDLMEMSTART = $1880
      else
WDLMEMSTART = $18E0
      endif ; DOUBLEBUFFER
    else
WDLMEMSTART = DLMEMSTART
    endif

    ifnconst DLMEMEND
       ifconst EXTRADLMEMORY
WDLMEMEND = $23FF
       else
WDLMEMEND = $1FFF
       endif
    else
WDLMEMEND = DLMEMEND
    endif


WMEMSIZE  = (WDLMEMEND-WDLMEMSTART+1)

      ifnconst DOUBLEBUFFER
DLLASTOBJ = ((((WMEMSIZE/WZONECOUNT)-2)/5)*5) ; -2 to always ensure we have 1x double-byte terminator
      else
DLLASTOBJ = ((((WMEMSIZE/WZONECOUNT)-4)/10)*5) ; -4 to always ensure we have 2x double-byte terminators
      endif

TDOUBLEBUFFEROFFSET = (DLLASTOBJ+2) ; offset between DL buffers. ie. half the real DL
  if TDOUBLEBUFFEROFFSET > 255
DOUBLEBUFFEROFFSET = 255
  else
DOUBLEBUFFEROFFSET = (DLLASTOBJ+2)
  endif

  ifconst EXTRADLMEMORY
SECONDDLHALFSTART SET $2300
  endif

DLPOINTH
DLINDEX SET 0
  REPEAT WZONECOUNT
TMPMEMADDRESS SET (((DLINDEX*WMEMSIZE)/WZONECOUNT)+WDLMEMSTART)
  ifconst EXTRADLMEMORY
     if TMPMEMADDRESS > $1FFF
TMPMEMADDRESS SET (TMPMEMADDRESS + $300)
     else
         if ((((DLINDEX+1)*WMEMSIZE)/WZONECOUNT)+WDLMEMSTART) > $1FFF
TMPMEMADDRESS SET (TMPMEMADDRESS + $300)
SECONDDLHALFSTART SET TMPMEMADDRESS
         endif 
     endif ; TMPMEMADDRESS > $1FFF
  endif ; EXTRADLMEMORY
  ;echo " "," ZONE",[DLINDEX]d,"ADDRESS: ",TMPMEMADDRESS
  .byte >TMPMEMADDRESS
DLINDEX SET DLINDEX + 1
  REPEND

  ifconst EXTRADLMEMORY
     echo "   ",[SECONDDLHALFSTART],"to",[$27FF],"was claimed as extra DL memory."
  endif


DLPOINTL
DLINDEX SET 0
  REPEAT WZONECOUNT
TMPMEMADDRESS SET (((DLINDEX*WMEMSIZE)/WZONECOUNT)+WDLMEMSTART)
  ifconst EXTRADLMEMORY
     if TMPMEMADDRESS > $1FFF
TMPMEMADDRESS SET (TMPMEMADDRESS + $300)
     else
         if ((((DLINDEX+1)*WMEMSIZE)/WZONECOUNT)+WDLMEMSTART) > $1FFF
TMPMEMADDRESS SET (TMPMEMADDRESS + $300)
         endif 
     endif ; TMPMEMADDRESS > $1FFF
  endif ; EXTRADLMEMORY
  .byte <TMPMEMADDRESS
DLINDEX SET DLINDEX + 1
  REPEND


DLINDEX SET 0
  REPEAT WZONECOUNT
TMPMEMADDRESS SET (((DLINDEX*WMEMSIZE)/WZONECOUNT)+WDLMEMSTART)
  ifconst EXTRADLMEMORY
     if TMPMEMADDRESS > $1FFF
TMPMEMADDRESS SET (TMPMEMADDRESS + $300)
     else
         if ((((DLINDEX+1)*WMEMSIZE)/WZONECOUNT)+WDLMEMSTART) > $1FFF
TMPMEMADDRESS SET (TMPMEMADDRESS + $300)
         endif 
     endif ; TMPMEMADDRESS > $1FFF
  endif ; EXTRADLMEMORY

ZONE,DLINDEX,"ADDRESS" = TMPMEMADDRESS

DLINDEX SET DLINDEX + 1
  REPEND


  echo "   ",[WDLMEMSTART],"to",[WDLMEMEND],"used as zone memory, allowing",[(DLLASTOBJ/5)]d,"display objects per zone."

DLHEIGHT
  REPEAT WZONECOUNT
  .byte (WZONEHEIGHT-1)
  REPEND

