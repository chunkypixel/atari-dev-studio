 ; a simple guard, than ensures the 7800basic code hasn't
 ; spilled into the encryption area...
 echo "   ",($FF7E-*)d,"bytes left in the 7800basic reserved area."
 if (*>$FF7D)
	ERR  ; abort the assembly
 endif
