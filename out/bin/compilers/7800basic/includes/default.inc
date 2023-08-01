 ; Provided under the CC0 license. See the included LICENSE.txt for details.

; Includes go below - the order is crucial, since this is also the order in
; which they will appear in the generated assembly file
;

; some venerable 2600 macro definitions. no actual code.
macro.h

; 7800basic macro definitions. no actual code.
7800macro.h

; atarivox voice macro definitions. no actual code.
speakjet.inc

; header file...
7800basicheader.asm

; the assembly code generated from the user's basic code
7800.asm

; optional routines that go in the last 4k
last4k.asm

; below are collections of subroutines and functions
std_routines.asm

; start-up routines
startup.asm

; dll+dl memory rom structures and definitions
zonememory.asm

; encryption area guard
encryptionguard.asm

; check for any missing co-requisites, like rmt+pokey
firstpasserr.asm

; the cart end vectors
7800basicfooter.asm

