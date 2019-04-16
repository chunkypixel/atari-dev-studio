
 displaymode 320A

 rem **uncomment the line below for single-channel TIA sound effects...
 rem set tiasfx mono

 rem **background color...
 BACKGRND=$0

 rem **set the height of characters and sprites...
 set zoneheight 8

 rem **import the characterset png...
 incgraphic atascii.png 320A 

 rem **set color of 320A text palette 0...
 P0C2=$0F

 rem **set the current character set...
 characterset atascii

 rem **set the letters represent each graphic character...
 alphachars ASCII

 dim sound2play=a
 dim sound2playbcd=b
 dim maxsounds=c
 maxsounds=24

main 
 clearscreen
 sound2playbcd=converttobcd(sound2play)
 plotchars 'sound to play:' 0 0 0
 plotvalue atascii 0 sound2playbcd 2 60 0
 plotmap sounddescriptions 0 72 0 16 1 0 sound2play 16

 if sfx1pointlo=0 && sfx1pointhi=0 then plotchars 'channel 0: off' 0 0 2 else plotchars 'channel 0: on' 0 0 2
 if sfx2pointlo=0 && sfx2pointhi=0 then plotchars 'channel 1: off' 0 80 2 else plotchars 'channel 1: on' 0 80 2

 plotchars 'move joystick to change sound' 0 0 20
 plotchars 'press fire to play' 0 0 21
 drawscreen

 if joy0right then sound2play=sound2play+1:gosub debouncejoymove
 if joy0left  then sound2play=sound2play-1:gosub debouncejoymove
 if sound2play=255 then sound2play=maxsounds
 if sound2play>maxsounds then sound2play=0
 if !joy0fire then goto main

 rem ** the salvo shot provides an example of randomizing the sound pitch...
 if sound2play=0  then temp7=rand&7:playsfx sfx_salvolasershot temp7
 if sound2play=1  then playsfx sfx_spaceinvshoot
 if sound2play=2  then playsfx sfx_berzerkrobotdeath
 if sound2play=3  then playsfx sfx_echo1
 if sound2play=4  then playsfx sfx_echo2
 if sound2play=5  then playsfx sfx_jumpman
 if sound2play=6  then playsfx sfx_cavalry
 if sound2play=7  then playsfx sfx_alientrill1
 if sound2play=8  then playsfx sfx_alientrill2
 if sound2play=9  then playsfx sfx_pitfalljump
 if sound2play=10 then playsfx sfx_advpickup
 if sound2play=11 then playsfx sfx_advdrop
 if sound2play=12 then playsfx sfx_advbite
 if sound2play=13 then playsfx sfx_advdragonslain
 if sound2play=14 then playsfx sfx_bling
 if sound2play=15 then playsfx sfx_dropmedium
 if sound2play=16 then playsfx sfx_electrobump
 if sound2play=17 then playsfx sfx_explosion
 if sound2play=18 then playsfx sfx_humanoid
 if sound2play=19 then playsfx sfx_twinkle1
 if sound2play=20 then playsfx sfx_twinkle2
 if sound2play=21 then playsfx sfx_electroswitch
 if sound2play=22 then playsfx sfx_nonobounce
 if sound2play=23 then playsfx sfx_70stvcomputer
 if sound2play=24 then playsfx sfx_alienlife
 gosub debouncejoyfire
 goto main 

debouncejoyfire
 drawscreen
 if joy0fire then goto debouncejoyfire
 return

debouncejoymove
 drawscreen
 if joy0left || joy0right then goto debouncejoymove
 return

 data sfx_salvolasershot
  $10,$18,$01 ; version, priority, frames per chunk
  $04,$08,$08 ; first chunk of freq,channel,volume data 
  $05,$08,$07
  $04,$08,$07
  $05,$08,$07
  $06,$08,$07
  $07,$08,$06
  $06,$08,$06
  $07,$08,$06
  $08,$08,$06
  $09,$08,$06
  $08,$08,$06
  $09,$08,$06
  $0a,$08,$04
  $09,$08,$04
  $0a,$08,$04
  $0b,$08,$04
  $0a,$08,$04
  $0b,$08,$04
  $0c,$08,$04
  $0b,$08,$02
  $0c,$08,$02
  $0d,$08,$02
  $00,$00,$00
  $00,$00,$00
end

 data sfx_spaceinvshoot
  $10,$10,$03 ; version, priority, frames per chunk
  $18,$08,$08 ; first chunk of freq,channel,volume data 
  $19,$08,$05
  $19,$08,$05
  $19,$08,$05
  $19,$08,$05
  $1C,$08,$02
  $1C,$08,$02
  $1C,$08,$02
  $1C,$08,$02
  $1C,$08,$02
  $1E,$08,$01
  $1E,$08,$01
  $1E,$08,$01
  $1E,$08,$01
  $1E,$08,$01
  $00,$00,$00
end

 data sfx_berzerkrobotdeath
  $10,$10,$00 ; version, priority, frames per chunk
  $00,$08,$0F ; first chunk of freq,channel,volume data 
  $01,$08,$0E
  $02,$08,$0D
  $03,$08,$0C
  $04,$08,$0B
  $05,$08,$0A
  $06,$08,$09
  $07,$08,$08
  $08,$08,$07
  $09,$08,$06
  $0a,$08,$05
  $0b,$08,$04
  $0c,$08,$03
  $0d,$08,$02
  $0e,$08,$01
  $00,$00,$00
end

 data sfx_echo1
  $10,$08,$08 ; version, priority, frames per chunk
  $18,$06,$0a ; first chunk of freq,channel,volume data 
  $08,$06,$0a
  $01,$00,$00 
  $18,$06,$05
  $08,$06,$05
  $01,$00,$00 
  $18,$06,$02
  $08,$06,$02
  $00,$00,$00 
end

  data sfx_echo2
  $10,$05,$04 ; version, priority, frames per chunk
  $1F,$04,$0A ; first chunk of freq,channel,volume data 
  $01,$00,$00
  $1F,$04,$05
  $01,$00,$00
  $1F,$04,$02
  $00,$00,$00 
end
 
  data sfx_jumpman
  $10,$05,$04 ; version, priority, frames per chunk
  $1E,$04,$08 ; first chunk of freq,channel,volume data 
  $1B,$04,$08
  $18,$04,$08
  $11,$04,$08
  $16,$04,$08
  $00,$00,$00 
end

  data sfx_cavalry
  $10,$07,$05 ; version, priority, frames per chunk
  $1D,$04,$08 ; first chunk of freq,channel,volume data 
  $1A,$04,$08
  $17,$04,$08
  $13,$04,$08
  $17,$04,$08
  $13,$04,$08
  $13,$04,$08
  $00,$00,$00 
end

  data sfx_alientrill1
  $10,$05,$01 ; version, priority, frames per chunk
  $1B,$04,$08 ; first chunk of freq,channel,volume data 
  $1E,$04,$08
  $1B,$04,$08
  $1E,$04,$08
  $18,$04,$08
  $00,$00,$00 
end

  data sfx_alientrill2
  $10,$05,$01 ; version, priority, frames per chunk
  $18,$04,$08 ; first chunk of freq,channel,volume data 
  $1E,$04,$08
  $18,$04,$08
  $1E,$04,$08
  $14,$04,$08
  $00,$00,$00 
end
 
 data sfx_pitfalljump
  $10,$05,$03 ; version, priority, frames per chunk
  $06,$01,$04 ; first chunk of freq,channel,volume data 
  $04,$01,$04 ; first chunk of freq,channel,volume data 
  $03,$01,$04 ; first chunk of freq,channel,volume data 
  $02,$01,$04 ; first chunk of freq,channel,volume data 
  $04,$01,$04 ; first chunk of freq,channel,volume data 
  $00,$00,$00
end

 data sfx_advpickup
  $10,$04,$02 ; version, priority, frames per chunk
  $03,$06,$08 ; first chunk of freq,channel,volume data 
  $02,$06,$08 
  $01,$06,$08 
  $00,$06,$08 
  $00,$00,$00 
end

 data sfx_advdrop
  $10,$04,$02 ; version, priority, frames per chunk
  $00,$06,$08 ; first chunk of freq,channel,volume data 
  $01,$06,$08 
  $02,$06,$08 
  $03,$06,$08 
  $00,$00,$00 
end

 data sfx_advbite
  $10,$10,$02 ; version, priority, frames per chunk
  $1F,$03,$0F ; first chunk of freq,channel,volume data 
  $1F,$08,$0E 
  $1F,$03,$0D 
  $1F,$08,$0C 
  $1F,$03,$0B 
  $1F,$08,$0A 
  $1F,$03,$09 
  $1F,$08,$08 
  $1F,$03,$07 
  $1F,$08,$06 
  $1F,$03,$05 
  $1F,$08,$04 
  $1F,$03,$03 
  $1F,$08,$02 
  $1F,$03,$01 
  $00,$00,$00 
end

 data sfx_advdragonslain
  $10,$10,$02 ; version, priority, frames per chunk
  $10,$04,$0F ; first chunk of freq,channel,volume data 
  $11,$04,$0E 
  $12,$04,$0D 
  $13,$04,$0C 
  $14,$04,$0B 
  $15,$04,$0A 
  $16,$04,$09 
  $17,$04,$08 
  $18,$04,$07 
  $19,$04,$06 
  $1A,$04,$05 
  $1B,$04,$04 
  $1C,$04,$03 
  $1D,$04,$02 
  $1E,$04,$01 
  $00,$00,$00 
end

 data sfx_bling
 $10,$10,$00 ; version, priority, frames per chunk
 $1c,$04,$07
 $1b,$04,$07
 $04,$0f,$05
 $15,$04,$09
 $16,$04,$07
 $03,$0f,$04
 $11,$04,$08
 $11,$04,$08
 $11,$04,$04
 $0e,$04,$09
 $0e,$04,$07
 $0e,$04,$04
 $1c,$04,$07
 $1b,$04,$05
 $1c,$04,$04
 $1b,$04,$02
 $00,$00,$00
end

 data sfx_dropmedium
 $10,$10,$00 ; version, priority, frames per chunk
 $00,$04,$00 ; first chunk of freq,channel,volume
 $03,$06,$0c
 $0d,$0c,$0f
 $1b,$04,$04
 $06,$0c,$00
 $00,$06,$00
 $07,$06,$00
 $10,$0c,$00
 $0d,$0c,$00
 $10,$0c,$00
 $03,$06,$00
 $10,$0c,$00
 $1b,$04,$00
 $10,$0c,$00
 $10,$0c,$00
 $03,$06,$00
 $00,$00,$00
end

 data sfx_electrobump
 $10,$10,$01 ; version, priority, frames per chunk
 $08,$08,$0a
 $08,$0c,$0a
 $08,$06,$0a
 $08,$0e,$0a
 $08,$06,$08
 $08,$06,$08
 $08,$0e,$06
 $08,$06,$04
 $08,$06,$02
 0,0,0
end

 data sfx_explosion
 $10,$10,$00 ; version, priority, frames per chunk
 $01,$08,$02
 $0b,$0c,$05
 $04,$06,$08
 $03,$0e,$0f
 $09,$06,$0f
 $0d,$06,$0f
 $04,$0e,$0f
 $0f,$06,$08
 $09,$06,$04
 $16,$01,$03
 $0c,$06,$04
 $09,$06,$05
 $0a,$06,$03
 $09,$06,$05
 $0d,$06,$08
 $09,$06,$04
 $04,$0e,$06
 $0f,$06,$05
 $0f,$06,$07
 $04,$0e,$07
 $08,$06,$06
 $03,$0e,$08
 $0f,$06,$06
 $09,$06,$05
 $06,$06,$05
 $03,$0e,$05
 $0e,$06,$06
 $02,$0e,$05
 $0f,$06,$03
 $0e,$06,$06
 $09,$06,$05
 $0c,$06,$05
 $0f,$06,$03
 $04,$0e,$08
 $0c,$06,$03
 $0f,$06,$03
 $0c,$06,$06
 $0f,$06,$04
 $0f,$06,$05
 $0f,$06,$03
 $0a,$06,$04
 $0f,$06,$03
 $08,$06,$03
 $0c,$06,$03
 $0e,$06,$03
 $08,$06,$03
 0,0,0
end

 data sfx_humanoid
 $10,$10,$00 ; version, priority, frames per chunk
 $01,$02,$05
 $0f,$06,$03
 $15,$04,$06
 $19,$04,$06
 $0a,$01,$05
 $14,$04,$08
 $17,$04,$08
 $04,$0f,$07
 $13,$04,$07
 $16,$04,$0a
 $1b,$04,$09
 $15,$01,$07
 $15,$04,$09
 $18,$04,$09
 $15,$04,$07
 $14,$04,$08
 $17,$04,$08
 $1b,$04,$07
 $13,$04,$09
 $16,$04,$0b
 $1a,$04,$09
 $03,$0f,$06
 $15,$04,$06
 $18,$04,$06
 $04,$0f,$05
 $09,$04,$04
 $0b,$04,$06
 $0d,$04,$06
 $09,$04,$05
 $0b,$04,$05
 $0d,$04,$05
 $0a,$04,$06
 $15,$04,$06
 $18,$04,$06
 $1c,$04,$06
 $00,$00,$00
end

 data sfx_twinkle1
 $10,$10,$00 ; version, priority, frames per chunk
 $00,$04,$00 ; first chunk of freq,channel,volume
 $09,$04,$02
 $02,$0c,$01
 $02,$0c,$04
 $02,$0c,$02
 $06,$04,$0a
 $06,$04,$04
 $01,$0c,$03
 $04,$04,$03
 $04,$04,$06
 $0a,$04,$04
 $03,$04,$04
 $01,$0c,$05
 $06,$04,$08
 $01,$0c,$04
 $06,$04,$02
 $04,$04,$04
 $04,$04,$09
 $0a,$04,$05
 $03,$04,$07
 $06,$04,$06
 $06,$04,$07
 $06,$04,$03
 $04,$04,$08
 $03,$04,$0a
 $03,$04,$06
 $00,$0c,$06
 $0a,$04,$05
 $00,$0c,$05
 $02,$0c,$0f
 $07,$04,$05
 $09,$04,$07
 $07,$04,$0a
 $0d,$04,$04
 $10,$04,$0c
 $02,$0c,$0a
 $07,$04,$02
 $00,$06,$05
 $02,$0c,$0b
 $0c,$04,$06
 $0c,$04,$03
 $00,$0c,$01
 $06,$04,$04
 $07,$04,$02
 $06,$04,$01
 $06,$04,$02
 $04,$0c,$01
 $07,$04,$03
 $01,$0c,$01
 $06,$04,$01
 $06,$04,$01
 $07,$04,$01
 $07,$04,$00
 $05,$0c,$00
 $07,$04,$00
 $0c,$04,$00
 $0f,$06,$00
 $00,$04,$00
 $00,$04,$00
 $00,$04,$00
 $00,$04,$00
 $00,$04,$00
 $00,$04,$00
 $00,$00,$00
end

 data sfx_twinkle2
 $10,$10,$00 ; version, priority, frames per chunk
 $00,$04,$00 ; first chunk of freq,channel,volume
 $02,$0c,$03
 $0d,$04,$0e
 $10,$04,$0d
 $1b,$04,$08
 $04,$0c,$0d
 $0a,$04,$0a
 $09,$04,$0f
 $0c,$04,$0b
 $10,$04,$0d
 $02,$0c,$02
 $1b,$04,$07
 $1b,$04,$06
 $0c,$04,$08
 $02,$0c,$08
 $0a,$04,$0b
 $00,$06,$09
 $16,$04,$07
 $1b,$04,$0b
 $18,$04,$08
 $03,$0c,$05
 $09,$04,$0b
 $09,$04,$0a
 $00,$06,$07
 $16,$04,$0c
 $1b,$04,$0a
 $18,$04,$0b
 $04,$0c,$07
 $09,$04,$08
 $0c,$04,$05
 $05,$0c,$0f
 $06,$0c,$0d
 $0b,$0c,$08
 $12,$04,$0b
 $0d,$04,$0c
 $09,$04,$0b
 $0c,$04,$07
 $05,$0c,$0b
 $06,$0c,$08
 $0b,$0c,$04
 $12,$04,$06
 $0c,$04,$05
 $09,$04,$02
 $0c,$04,$04
 $12,$04,$02
 $18,$04,$02
 $1e,$04,$01
 $12,$04,$01
 $00,$00,$00
end

  data sfx_electroswitch
  $10,$01,$02 ; version, priority, frames per chunk
  $06,$04,$0F ; first chunk of freq,channel,volume data
  $0C,$04,$08 ; first chunk of freq,channel,volume data
  $18,$04,$04 ; first chunk of freq,channel,volume data
  $31,$04,$02 ; first chunk of freq,channel,volume data
  $00,$00,$00
end

  data sfx_nonobounce
 $10,$10,$01 ; version, priority, frames per chunk
 $0f,$0c,$04
 $00,$0e,$08
 $10,$0c,$08
 $02,$06,$06
 $10,$0c,$06
 $02,$06,$06
 $00,$0e,$08
 $10,$0c,$08
 $02,$06,$08
 $0f,$0c,$06
 $10,$0c,$06
 $02,$06,$06
 $10,$0c,$06
 $0f,$0c,$04
 $10,$0c,$04
 $0f,$0c,$04
 $00,$0e,$04
 $10,$0c,$04
 $10,$0c,$02
 0,0,0
end

 data sfx_70stvcomputer
 $10,$10,$01 ; version, priority, frames per chunk
 $01,$08,$06
 $01,$08,$08
 $0c,$01,$08
 $0b,$09,$06
 $03,$01,$08
 $04,$0f,$08
 $10,$01,$08
 $16,$04,$08
 $06,$07,$08
 $01,$08,$08
 $1f,$04,$08
 $01,$06,$08
 $0b,$0c,$08
 $01,$08,$08
 $0e,$09,$08
 $0e,$0c,$08
 $00,$0e,$08
 $01,$08,$08
 $08,$09,$08
 $0c,$09,$08
 $0c,$0c,$08
 $0c,$01,$08
 $01,$08,$08
 $0a,$0c,$08
 $06,$01,$08
 $0c,$09,$08
 $10,$04,$08
 $0f,$09,$08
 $03,$01,$08
 $1c,$01,$08
 $15,$01,$08
 $0c,$09,$08
 $07,$07,$08
 $01,$08,$08
 $00,$07,$08
 $01,$08,$08
 $01,$0f,$08
 $0d,$0c,$08
 $0b,$0c,$08
 $01,$08,$08
 $01,$0f,$08
 $0d,$0c,$08
 $0b,$0c,$08
 $01,$08,$08
 $1a,$01,$08
 $0d,$09,$06
 $08,$01,$06
 $1b,$01,$06
 $04,$0f,$06
 $02,$0f,$06
 $08,$01,$06
 $04,$07,$06
 $1f,$04,$06
 $1a,$01,$06
 $02,$07,$06
 $04,$01,$06
 $04,$01,$04
 $07,$07,$04
 $0c,$0c,$02
 $0a,$0c,$02
 $0a,$0c,$01
 0,0,0
end

 data sfx_alienlife
 $10,$10,$01 ; version, priority, frames per chunk
 $16,$04,$04 ; first chunk of freq,channel,volume
 $16,$04,$07
 $16,$04,$0f
 $16,$04,$0e
 $04,$0c,$07
 $0d,$04,$07
 $03,$0c,$04
 $03,$0c,$04
 $04,$0c,$02
 $05,$0c,$04
 $12,$04,$04
 $12,$04,$02
 $05,$0c,$04
 $05,$0c,$02
 $05,$0c,$02
 $10,$04,$02
 $00,$06,$01
 $00,$00,$00
end




 alphadata sounddescriptions atascii
 'salvo laser shot'
 'spcinvader shot '
 'berzerk r.death '
 'echo 1          '
 'echo 2          '
 'jumpman         '
 'cavalry         '
 'alien trill 1   '
 'alien trill 2   '
 'pitfall jump    '
 'adventure pickup'
 'adventure drop  '
 'adv dragon bite '
 'adv dragon slain'
 'bling           '
 'drop medium     '
 'electro bump    '
 'explosion       '
 'humanoid        '
 'twinkle1        '
 'twinkle2        '
 'electro switch  '
 'nono bounce     '
 '70s tv computer '
 'alien life      '
end
