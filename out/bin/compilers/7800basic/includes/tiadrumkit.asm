 ; Provided under the CC0 license. See the included LICENSE.txt for details.


 ; ** Drums are mapped to keys so high that humans can not hear them...

 ifnconst DRUMMAXVOLUME
DRUMMAXVOLUME = 10
 endif
DRUMVOL5 = (DRUMMAXVOLUME * 5 / 5)
DRUMVOL4 = (DRUMMAXVOLUME * 4 / 5)
DRUMVOL3 = (DRUMMAXVOLUME * 3 / 5)
DRUMVOL2 = (DRUMMAXVOLUME * 2 / 5)
DRUMVOL1 = (DRUMMAXVOLUME * 1 / 5)

tiadrumkitdefinition
 .word sfx_BassDrum_Std		; 0 C11  Bass/Kick
 .word sfx_TomDrumLow_Std	; 1 C#11 Low Tom
 .word sfx_TomDrumHi_Std	; 2 D11  High Tom
 .word sfx_Snare_Std		; 3 D#11 Snare
 .word sfx_ClosedHat_Std	; 4 E11  Closed Hat
 .word sfx_OpenHat_Std		; 5 F11  Open Hat
 .word sfx_BassAndHat_Std	; 6 F#11 Bass/Kick+Closed Hat 
 .word sfx_SnareAndHat_Std	; 7 G11  Snare+Closed Hat 

sfx_BassDrum_Std
  .byte $10,$00,$00 ; version, priority, frames per chunk
  .byte $10,$0f,DRUMVOL5 ; first chunk of freq,channel,volume data
  .byte $10,$0f,DRUMVOL5
  .byte $10,$0f,DRUMVOL4
  .byte $14,$0f,DRUMVOL3
  .byte $12,$0f,DRUMVOL2
  .byte $14,$0f,DRUMVOL1
  .byte $00,$00,$00

sfx_TomDrumLow_Std
  .byte $10,$00,$01 ; version, priority, frames per chunk
  .byte $02,$0f,DRUMVOL5 ; first chunk of freq,channel,volume data
  .byte $04,$0f,DRUMVOL5
  .byte $08,$0f,DRUMVOL3
  .byte $0b,$0f,DRUMVOL2
  .byte $0b,$0f,DRUMVOL2
  .byte $00,$00,$00

sfx_TomDrumHi_Std
  .byte $10,$00,$01 ; version, priority, frames per chunk
  .byte $02,$0f,DRUMVOL5 ; first chunk of freq,channel,volume data
  .byte $04,$0f,DRUMVOL5
  .byte $09,$0f,DRUMVOL3
  .byte $0a,$0f,DRUMVOL3
  .byte $0b,$0f,DRUMVOL2
  .byte $00,$00,$00

sfx_Snare_Std
  .byte $10,$00,$00 ; version, priority, frames per chunk
  .byte $04,$0f,DRUMVOL5 ; first chunk of freq,channel,volume data
  .byte $04,$0f,DRUMVOL5
  .byte $08,$0f,DRUMVOL3
  .byte $08,$08,DRUMVOL3
  .byte $10,$08,DRUMVOL2
  .byte $10,$08,DRUMVOL1
  .byte $00,$00,$00

sfx_ClosedHat_Std
  .byte $10,$00,$00 ; version, priority, frames per chunk
  .byte $00,$08,DRUMVOL5 ; first chunk of freq,channel,volume data
  .byte $02,$08,DRUMVOL3
  .byte $04,$08,DRUMVOL2
  .byte $04,$08,DRUMVOL1
  .byte $00,$00,$00

sfx_OpenHat_Std
  .byte $10,$00,$01 ; version, priority, frames per chunk
  .byte $00,$08,DRUMVOL5 ; first chunk of freq,channel,volume data
  .byte $02,$08,DRUMVOL3
  .byte $04,$08,DRUMVOL1
  .byte $04,$08,DRUMVOL1
  .byte $04,$08,DRUMVOL1
  .byte $00,$00,$00

sfx_BassAndHat_Std
  .byte $10,$00,$01 ; version, priority, frames per chunk
  .byte $00,$08,DRUMVOL5 ; first chunk of freq,channel,volume data
  .byte $10,$0f,DRUMVOL5
  .byte $10,$0f,DRUMVOL3
  .byte $14,$0f,DRUMVOL3
  .byte $12,$0f,DRUMVOL2
  .byte $14,$0f,DRUMVOL1
  .byte $00,$00,$00

sfx_SnareAndHat_Std
  .byte $10,$00,$01 ; version, priority, frames per chunk
  .byte $04,$0f,DRUMVOL5 ; first chunk of freq,channel,volume data
  .byte $10,$0f,DRUMVOL5
  .byte $10,$0f,DRUMVOL3
  .byte $14,$0f,DRUMVOL3
  .byte $12,$0f,DRUMVOL2
  .byte $14,$0f,DRUMVOL1
  .byte $00,$00,$00

