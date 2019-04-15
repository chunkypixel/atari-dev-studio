
 ; ** Drums are mapped to keys so high that humans can not hear them...

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
  .byte $10,$0f,$0A ; first chunk of freq,channel,volume data
  .byte $10,$0f,$0A
  .byte $10,$0f,$06
  .byte $14,$0f,$06
  .byte $12,$0f,$04
  .byte $14,$0f,$02
  .byte $00,$00,$00

sfx_TomDrumLow_Std
  .byte $10,$00,$01 ; version, priority, frames per chunk
  .byte $02,$0f,$0A ; first chunk of freq,channel,volume data
  .byte $04,$0f,$06
  .byte $08,$0f,$06
  .byte $0b,$0f,$04
  .byte $0b,$0f,$04
  .byte $00,$00,$00

sfx_TomDrumHi_Std
  .byte $10,$00,$01 ; version, priority, frames per chunk
  .byte $02,$0f,$0A ; first chunk of freq,channel,volume data
  .byte $04,$0f,$06
  .byte $09,$0f,$06
  .byte $0a,$0f,$06
  .byte $0b,$0f,$04
  .byte $00,$00,$00

sfx_Snare_Std
  .byte $10,$00,$00 ; version, priority, frames per chunk
  .byte $04,$0f,$0A ; first chunk of freq,channel,volume data
  .byte $04,$0f,$0A
  .byte $08,$0f,$06
  .byte $08,$08,$06
  .byte $10,$08,$04
  .byte $10,$08,$02
  .byte $00,$00,$00

sfx_ClosedHat_Std
  .byte $10,$00,$00 ; version, priority, frames per chunk
  .byte $00,$08,$0A ; first chunk of freq,channel,volume data
  .byte $02,$08,$06
  .byte $04,$08,$04
  .byte $04,$08,$02
  .byte $00,$00,$00

sfx_OpenHat_Std
  .byte $10,$00,$01 ; version, priority, frames per chunk
  .byte $00,$08,$0A ; first chunk of freq,channel,volume data
  .byte $02,$08,$06 
  .byte $04,$08,$02 
  .byte $04,$08,$02 
  .byte $04,$08,$02 
  .byte $00,$00,$00

sfx_BassAndHat_Std
  .byte $10,$00,$01 ; version, priority, frames per chunk
  .byte $00,$08,$0A ; first chunk of freq,channel,volume data
  .byte $10,$0f,$0A
  .byte $10,$0f,$06
  .byte $14,$0f,$06
  .byte $12,$0f,$04
  .byte $14,$0f,$02
  .byte $00,$00,$00

sfx_SnareAndHat_Std
  .byte $10,$00,$01 ; version, priority, frames per chunk
  .byte $04,$0f,$0A ; first chunk of freq,channel,volume data
  .byte $10,$0f,$0A
  .byte $10,$0f,$06
  .byte $14,$0f,$06
  .byte $12,$0f,$04
  .byte $14,$0f,$02
  .byte $00,$00,$00

