 ; Provided under the CC0 license. See the included LICENSE.txt for details.

 ; a simple guard, than ensures the 7800basic code hasn't
 ; spilled into the encryption area...
 echo "   ",($FF7E-*)d,"bytes left in the 7800basic reserved area."
 if (*>$FF7D)
        echo
        echo  "***************************"
        echo  "*** Abort: ROM Overflow ***"
        echo  "***************************"
	ERR  ; abort the assembly
 endif
