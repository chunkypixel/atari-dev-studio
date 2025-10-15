
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
 maxsounds=116

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
 if sound2play=19 then playsfx sfx_transporter
 if sound2play=20 then playsfx sfx_twinkle
 if sound2play=21 then playsfx sfx_electroswitch
 if sound2play=22 then playsfx sfx_nonobounce
 if sound2play=23 then playsfx sfx_70stvcomputer
 if sound2play=24 then playsfx sfx_alienlife
 if sound2play=25 then playsfx sfx_chirp
 if sound2play=26 then playsfx sfx_plonk
 if sound2play=27 then playsfx sfx_spawn
 if sound2play=28 then playsfx sfx_maser
 if sound2play=29 then playsfx sfx_rubbermallet
 if sound2play=30 then playsfx sfx_alienkitty
 if sound2play=31 then playsfx sfx_electropunch
 if sound2play=32 then playsfx sfx_drip
 if sound2play=33 then playsfx sfx_ribbit
 if sound2play=34 then playsfx sfx_wolfwhistle
 if sound2play=35 then playsfx sfx_cabwhistle
 if sound2play=36 then playsfx sfx_jumpo
 if sound2play=37 then playsfx sfx_pulsecannon
 if sound2play=38 then playsfx sfx_spring
 if sound2play=39 then playsfx sfx_buzzbomb
 if sound2play=40 then playsfx sfx_bassbump
 if sound2play=41 then playsfx sfx_hophop
 if sound2play=42 then playsfx sfx_distressed
 if sound2play=43 then playsfx sfx_ouch
 if sound2play=44 then playsfx sfx_laserrecoil
 if sound2play=45 then playsfx sfx_electrosplosion
 if sound2play=46 then playsfx sfx_hophip
 if sound2play=47 then playsfx sfx_hophipquick
 if sound2play=48 then playsfx sfx_bassbump2
 if sound2play=49 then playsfx sfx_pickupprize
 if sound2play=50 then playsfx sfx_distressed2
 if sound2play=51 then playsfx sfx_pewpew
 if sound2play=52 then playsfx sfx_denied
 if sound2play=53 then playsfx sfx_teleported
 if sound2play=54 then playsfx sfx_alienklaxon
 if sound2play=55 then playsfx sfx_crystalchimes
 if sound2play=56 then playsfx sfx_oneup
 if sound2play=57 then playsfx sfx_babywah
 if sound2play=58 then playsfx sfx_gotthecoin
 if sound2play=59 then playsfx sfx_babyribbit
 if sound2play=60 then playsfx sfx_squeek
 if sound2play=61 then playsfx sfx_whoa
 if sound2play=62 then playsfx sfx_gotthering
 if sound2play=63 then playsfx sfx_yahoo
 if sound2play=64 then playsfx sfx_warcry
 if sound2play=65 then playsfx sfx_downthepipe
 if sound2play=66 then playsfx sfx_powerup
 if sound2play=67 then playsfx sfx_falling
 if sound2play=68 then playsfx sfx_eek
 if sound2play=69 then playsfx sfx_uhoh
 if sound2play=70 then playsfx sfx_anotherup
 if sound2play=71 then playsfx sfx_bubbleup
 if sound2play=72 then playsfx sfx_jump1
 if sound2play=73 then playsfx sfx_plainlaser
 if sound2play=74 then playsfx sfx_aliencoo
 if sound2play=75 then playsfx sfx_simplebuzz
 if sound2play=76 then playsfx sfx_jump2
 if sound2play=77 then playsfx sfx_jump3
 if sound2play=78 then playsfx sfx_dunno
 if sound2play=79 then playsfx sfx_snore
 if sound2play=80 then playsfx sfx_uncovered
 if sound2play=81 then playsfx sfx_doorpound
 if sound2play=82 then playsfx sfx_distressed3
 if sound2play=83 then playsfx sfx_eek2
 if sound2play=84 then playsfx sfx_rubberhammer
 if sound2play=85 then playsfx sfx_alienbuzz
 if sound2play=86 then playsfx sfx_anotherjumpman
 if sound2play=87 then playsfx sfx_anotherjumpdies
 if sound2play=88 then playsfx sfx_longgongsilver
 if sound2play=89 then playsfx sfx_strum
 if sound2play=90 then playsfx sfx_dropped
 if sound2play=91 then playsfx sfx_alienaggressor
 if sound2play=92 then playsfx sfx_electroswitch2
 if sound2play=93 then playsfx sfx_gooditem
 if sound2play=94 then playsfx sfx_babyribbithop
 if sound2play=95 then playsfx sfx_distressed4
 if sound2play=96 then playsfx sfx_hahaha
 if sound2play=97 then playsfx sfx_yeah
 if sound2play=98 then playsfx sfx_arfarf
 if sound2play=99 then playsfx sfx_activate
 if sound2play=100 then playsfx sfx_hahaha2
 if sound2play=101 then playsfx sfx_wilhelm
 if sound2play=102 then playsfx sfx_poof1
 if sound2play=103 then playsfx sfx_poof2
 if sound2play=104 then playsfx sfx_dragit
 if sound2play=105 then playsfx sfx_roarcheep
 if sound2play=106 then playsfx sfx_roarroar
 if sound2play=107 then playsfx sfx_deeproar
 if sound2play=108 then playsfx sfx_echobang
 if sound2play=109 then playsfx sfx_tom
 if sound2play=110 then playsfx sfx_clopclop
 if sound2play=111 then playsfx sfx_museboom
 if sound2play=112 then playsfx sfx_bigboom
 if sound2play=113 then playsfx sfx_thud
 if sound2play=114 then playsfx sfx_bump
 if sound2play=115 then playsfx sfx_shouty
 if sound2play=116 then playsfx sfx_quack
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

 data sfx_transporter
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

 data sfx_twinkle
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

 data sfx_chirp
 $10,$10,$00 ; version, priority, frames per chunk
 $07, $04, $0e ; first chunk of freq,channel,volume
 $0a, $04, $0e
 $0c, $04, $0e
 $09, $04, $0f
 $0a, $04, $0e
 $07, $04, $01
 $09, $04, $00
 $00,$00,$00
end


 data sfx_plonk
 $10,$10,$00 ; version, priority, frames per chunk
 $13, $01, $0d ; first chunk of freq,channel,volume
  $12, $01, $0f
  $0d, $04, $0d
  $12, $01, $0b
  $12, $01, $05
  $06, $07, $03
  $0a, $0f, $02
  $09, $07, $01
  $10, $0f, $00
  $1b, $0c, $00
  $0b, $0e, $00
  $09, $06, $00
  $12, $01, $01
  $0a, $07, $01
 $00,$00,$00
end
 
 data sfx_spawn
 $10,$10,$01 ; version, priority, frames per chunk
  $16, $04, $0e
  $15, $04, $0e
  $15, $04, $0e
  $12, $04, $0e
  $0e, $04, $0e
  $0c, $04, $0e
  $0e, $04, $0e
  $12, $04, $0e
  $15, $04, $0a
  $15, $04, $08
 $00,$00,$00
end

 data sfx_maser
 $10,$10,$00 ; version, priority, frames per chunk
   $14, $04, $0a
  $16, $04, $0f
  $19, $04, $0d
  $0b, $07, $0f
  $0c, $07, $0f
  $00, $07, $0d
  $0f, $04, $0e
  $06, $01, $0a
  $17, $04, $0b
  $0a, $07, $0a
  $16, $01, $0a
  $19, $07, $03
  $10, $0c, $02
  $17, $0c, $00
  $15, $0f, $02
  $1f, $07, $02
 $00,$00,$00
end

 data sfx_rubbermallet
 $10,$10,$00 ; version, priority, frames per chunk
  $1c, $07, $0f
  $1b, $07, $0f
  $1c, $07, $0f
  $1a, $0c, $0f
  $12, $0c, $0f
  $1e, $07, $0e
  $17, $0c, $0e
  $1d, $07, $08
  $12, $0c, $08
  $18, $07, $09
  $17, $0c, $08
  $12, $0c, $07
  $1b, $0c, $04
  $14, $0c, $01
  $13, $01, $01
 $00,$00,$00
end

 data sfx_alienkitty
 $10,$10,$00 ; version, priority, frames per chunk
 $01, $06, $01
  $16, $01, $03
  $18, $04, $06
  $19, $04, $0f
  $0e, $07, $0e
  $19, $04, $0c
  $19, $04, $0c
  $18, $04, $0c
  $17, $04, $0a
  $15, $01, $0a
  $06, $04, $0a
  $19, $0f, $0a
  $06, $04, $06
  $17, $04, $04
  $17, $04, $04
  $17, $04, $03
  $1a, $0c, $03
  $0c, $04, $02
  $19, $04, $02
  $17, $04, $01
 $00,$00,$00
end

 data sfx_electropunch
 $10,$10,$00 ; version, priority, frames per chunk
 $07,$06,$0f ; first chunk of freq,channel,volume
 $0f,$06,$08
 $1e,$04,$0a
 $0f,$06,$08
 $12,$04,$06
 $0f,$06,$05
 $0f,$06,$06
 $0c,$04,$03
 $07,$06,$01
 $0a,$04,$03
 $02,$0c,$01
 $00,$00,$00
end

 data sfx_drip
 $10,$10,$00 ; version, priority, frames per chunk
 $17,$0c,$0f ; first chunk of freq,channel,volume
 $17,$0c,$0a
 $0d,$0c,$0a
 $1e,$06,$07
 $12,$0c,$01
 $1e,$06,$00
 $1e,$06,$02
 $03,$06,$00
 $1e,$06,$00
 $1e,$06,$00
 $03,$06,$01
 $03,$06,$02
 $12,$0c,$01
 $10,$0c,$00
 $1e,$06,$00
 $1e,$06,$01
 $00,$00,$00
end

 data sfx_ribbit
 $10,$10,$00 ; version, priority, frames per chunk
 $0c,$06,$04 ; first chunk of freq,channel,volume
 $19,$06,$0f
 $19,$06,$0f
 $19,$06,$0f
 $0c,$06,$09
 $19,$06,$0f
 $19,$06,$0f
 $08,$06,$06
 $19,$06,$0f
 $19,$06,$0f
 $19,$06,$0f
 $19,$06,$0f
 $08,$06,$07
 $19,$06,$0f
 $19,$06,$0d
 $19,$06,$0f
 $19,$06,$0c
 $19,$06,$0d
 $19,$06,$05
 $19,$06,$09
 $19,$06,$03
 $19,$06,$04
 $00,$00,$00
end

 data sfx_wolfwhistle
 $10,$10,$00 ; version, priority, frames per chunk
 $12,$04,$02 ; first chunk of freq,channel,volume
 $12,$04,$04
 $12,$04,$03
 $12,$04,$05
 $05,$0c,$06
 $10,$04,$07
 $0f,$04,$05
 $0f,$04,$06
 $0d,$04,$07
 $0c,$04,$06
 $03,$0c,$08
 $0a,$04,$06
 $09,$04,$09
 $09,$04,$09
 $02,$0c,$09
 $02,$0c,$0c
 $02,$0c,$08
 $02,$0c,$0d
 $07,$04,$0a
 $07,$04,$0a
 $07,$04,$0b
 $07,$04,$0f
 $07,$04,$0a
 $06,$04,$0f
 $06,$04,$08
 $06,$04,$05
 $06,$04,$04
 $06,$04,$04
 $06,$04,$01
 $1e,$06,$00
 $1e,$06,$00
 $1e,$06,$00
 $1e,$06,$00
 $1e,$06,$00
 $1e,$06,$00
 $1c,$04,$0b
 $0b,$0c,$0f
 $0d,$0c,$0f
 $0d,$0c,$04
 $0c,$0c,$0f
 $0a,$0c,$0f
 $0a,$0c,$0f
 $1e,$04,$0f
 $1b,$04,$0f
 $16,$04,$0f
 $13,$04,$0f
 $10,$04,$0e
 $0c,$04,$0b
 $0a,$04,$09
 $0a,$04,$09
 $02,$0c,$08
 $02,$0c,$0a
 $02,$0c,$0a
 $02,$0c,$08
 $02,$0c,$01
 $02,$0c,$07
 $02,$0c,$07
 $02,$0c,$08
 $02,$0c,$04
 $09,$04,$03
 $03,$0c,$03
 $04,$0c,$03
 $13,$04,$02
 $18,$04,$02
 $0b,$0c,$02
 $1b,$0c,$02
 $0a,$06,$02
 $00,$00,$00
end

 data sfx_cabwhistle
 $10,$10,$00 ; version, priority, frames per chunk
 $0a,$04,$03 ; first chunk of freq,channel,volume
 $09,$04,$04
 $02,$0c,$04
 $07,$04,$04
 $06,$04,$05
 $06,$04,$05
 $06,$04,$06
 $06,$04,$07
 $06,$04,$06
 $06,$04,$05
 $07,$04,$06
 $02,$0c,$04
 $02,$0c,$0a
 $09,$04,$0a
 $0a,$04,$0b
 $0a,$04,$0b
 $0a,$04,$0f
 $03,$0c,$0b
 $03,$0c,$0f
 $03,$0c,$0f
 $03,$0c,$0f
 $03,$0c,$0f
 $03,$0c,$08
 $03,$0c,$0f
 $03,$0c,$0f
 $03,$0c,$0f
 $03,$0c,$0f
 $03,$0c,$09
 $0a,$04,$0d
 $0a,$04,$0a
 $09,$04,$06
 $09,$04,$07
 $02,$0c,$04
 $02,$0c,$03
 $07,$04,$03
 $07,$04,$02
 $06,$04,$03
 $06,$04,$03
 $06,$04,$06
 $06,$04,$06
 $06,$04,$02
 $00,$00,$00
end

 data sfx_jumpo
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$0c,$03 ; first chunk of freq,channel,volume
 $1e,$0c,$01
 $1e,$0c,$06
 $1e,$0c,$06
 $1e,$0c,$04
 $1e,$06,$03
 $1e,$0c,$05
 $1e,$0c,$0a
 $1e,$0c,$06
 $1e,$06,$06
 $1e,$0c,$06
 $1b,$0c,$04
 $1b,$0c,$02
 $1b,$0c,$08
 $1b,$0c,$0b
 $1b,$0c,$0c
 $1b,$0c,$0a
 $1b,$0c,$04
 $1b,$0c,$05
 $1e,$0c,$07
 $1e,$0c,$07
 $10,$0c,$02
 $1e,$0c,$04
 $1e,$0c,$03
 $10,$0c,$01
 $1e,$0c,$06
 $1e,$0c,$06
 $07,$06,$04
 $07,$06,$05
 $07,$06,$0b
 $07,$06,$0e
 $07,$06,$0e
 $07,$06,$0a
 $17,$0c,$05
 $00,$00,$00
end

 data sfx_pulsecannon
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$0c,$0a ; first chunk of freq,channel,volume
 $07,$06,$0f
 $07,$06,$0f
 $1e,$06,$0f
 $17,$0c,$0b
 $1b,$0c,$0b
 $1e,$0c,$0f
 $07,$06,$0f
 $07,$06,$0f
 $1e,$06,$08
 $17,$0c,$06
 $1b,$0c,$0f
 $1e,$0c,$0f
 $07,$06,$0f
 $07,$06,$0f
 $0a,$06,$0a
 $17,$0c,$0a
 $1e,$0c,$04
 $1e,$06,$09
 $1b,$04,$05
 $07,$06,$0f
 $0a,$06,$09
 $17,$0c,$0d
 $1b,$0c,$09
 $0a,$06,$05
 $17,$0c,$03
 $00,$00,$00
end

 data sfx_spring
 $10,$10,$00 ; version, priority, frames per chunk
 $0d,$0c,$0f ; first chunk of freq,channel,volume
 $0d,$0c,$0d
 $10,$0c,$0b
 $10,$0c,$0f
 $1e,$0c,$06
 $0e,$0c,$05
 $0e,$0c,$0c
 $12,$0c,$0f
 $12,$0c,$0d
 $10,$0c,$0f
 $0e,$0c,$0f
 $0d,$0c,$0f
 $12,$0c,$0a
 $07,$06,$0b
 $1e,$0c,$07
 $10,$0c,$0f
 $10,$0c,$0e
 $0e,$0c,$0d
 $17,$0c,$07
 $07,$06,$08
 $1e,$0c,$07
 $10,$0c,$08
 $0e,$0c,$0a
 $0d,$0c,$0d
 $0d,$0c,$06
 $1e,$0c,$05
 $1c,$04,$03
 $0d,$0c,$08
 $0c,$0c,$0b
 $0c,$0c,$06
 $0e,$0c,$08
 $1b,$0c,$04
 $0c,$0c,$0a
 $0c,$0c,$03
 $0a,$0c,$07
 $0d,$0c,$04
 $0d,$0c,$07
 $0b,$0c,$05
 $0a,$0c,$05
 $1e,$04,$03
 $00,$00,$00
end

 data sfx_buzzbomb
 $10,$10,$00 ; version, priority, frames per chunk
 $03,$06,$05 ; first chunk of freq,channel,volume
 $0f,$06,$0f
 $0f,$06,$0f
 $07,$06,$0b
 $07,$06,$0f
 $0f,$06,$0f
 $07,$06,$0e
 $0f,$06,$0f
 $0f,$06,$0a
 $0f,$06,$0f
 $1b,$0c,$0a
 $0f,$06,$08
 $03,$06,$07
 $07,$06,$06
 $03,$06,$07
 $0f,$06,$05
 $07,$06,$05
 $0f,$06,$04
 $07,$06,$04
 $07,$06,$02
 $0f,$06,$02
 $1b,$0c,$01
 $00,$00,$00
end

 data sfx_bassbump
 $10,$10,$00 ; version, priority, frames per chunk
 $1b,$0c,$0f ; first chunk of freq,channel,volume
 $0f,$06,$0c
 $07,$06,$0e
 $0f,$06,$0f
 $0f,$06,$0f
 $0f,$06,$0f
 $07,$06,$06
 $0f,$06,$0f
 $1b,$0c,$04
 $0f,$06,$05
 $0f,$06,$06
 $07,$06,$01
 $0f,$06,$03
 $00,$00,$00
end

 data sfx_hophop
 $10,$10,$00 ; version, priority, frames per chunk
 $04,$0c,$02 ; first chunk of freq,channel,volume
 $0f,$06,$03
 $10,$04,$06
 $04,$0c,$09
 $00,$06,$09
 $1e,$06,$0b
 $1e,$06,$09
 $0c,$0c,$09
 $15,$04,$0b
 $03,$0c,$07
 $04,$0c,$0a
 $15,$04,$0c
 $0c,$04,$0f
 $1e,$06,$0f
 $1e,$06,$0c
 $1e,$06,$09
 $13,$04,$0c
 $10,$04,$0f
 $10,$04,$0f
 $10,$04,$0f
 $0c,$0c,$0a
 $0c,$0c,$08
 $0e,$0c,$02
 $1e,$06,$04
 $1e,$06,$02
 $1e,$06,$01
 $00,$00,$00
end

 data sfx_distressed
 $10,$10,$00 ; version, priority, frames per chunk
 $00,$06,$02 ; first chunk of freq,channel,volume
 $00,$06,$01
 $0f,$04,$09
 $00,$06,$0a
 $04,$0c,$0b
 $0f,$04,$0b
 $12,$04,$09
 $0c,$04,$0b
 $15,$04,$0f
 $15,$04,$0f
 $03,$0c,$0e
 $0c,$04,$0f
 $0c,$0c,$0f
 $0d,$04,$0b
 $04,$0c,$07
 $00,$06,$05
 $00,$06,$04
 $00,$06,$03
 $00,$06,$02
 $00,$00,$00
end

 data sfx_ouch
 $10,$10,$00 ; version, priority, frames per chunk
 $07,$0c,$0f ; first chunk of freq,channel,volume
 $07,$0c,$0f
 $07,$0c,$0f
 $18,$04,$07
 $19,$04,$04
 $07,$0c,$09
 $19,$04,$0f
 $19,$04,$0d
 $19,$04,$0f
 $19,$04,$0f
 $1b,$04,$0f
 $1b,$04,$0f
 $1b,$04,$0f
 $1b,$04,$0f
 $1b,$04,$09
 $1b,$04,$05
 $1b,$04,$03
 $1b,$04,$02
 $1c,$04,$01
 $1c,$04,$01
 $1c,$04,$01
 $1b,$04,$02
 $19,$04,$00
 $1b,$04,$00
 $19,$04,$01
 $00,$00,$00
end

 data sfx_laserrecoil
 $10,$10,$00 ; version, priority, frames per chunk
 $06,$0c,$0f ; first chunk of freq,channel,volume
 $16,$04,$0f
 $16,$04,$0f
 $1e,$04,$0f
 $0b,$0c,$0f
 $0b,$0c,$0f
 $1e,$06,$0f
 $1e,$06,$0c
 $16,$04,$09
 $1e,$04,$09
 $1e,$04,$0f
 $0b,$0c,$0f
 $0e,$0c,$0f
 $0d,$0c,$04
 $07,$0c,$05
 $1b,$04,$03
 $0b,$0c,$02
 $10,$0c,$03
 $03,$06,$02
 $00,$00,$00
end

 data sfx_electrosplosion
 $10,$10,$01 ; version, priority, frames per chunk
 $0f,$06,$0f ; first chunk of freq,channel,volume
 $07,$06,$0a
 $07,$06,$0f
 $03,$06,$06
 $07,$06,$0f
 $0f,$06,$08
 $07,$06,$06
 $0f,$06,$0a
 $0f,$06,$0f
 $0f,$06,$06
 $07,$06,$05
 $0f,$06,$0d
 $0f,$06,$0a
 $1b,$0c,$05
 $0f,$06,$0c
 $0f,$06,$09
 $0f,$06,$0d
 $0f,$06,$0f
 $0f,$06,$04
 $0f,$06,$06
 $0f,$06,$0f
 $07,$06,$05
 $0f,$06,$06
 $0f,$06,$01
 $07,$06,$01
 $0f,$06,$00
 $0f,$06,$03
 $0f,$06,$01
 $0f,$06,$01
 $00,$00,$00
end

 data sfx_hophip
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$04,$0f ; first chunk of freq,channel,volume
 $12,$04,$0d
 $12,$04,$0f
 $05,$0c,$0c
 $10,$04,$0a
 $05,$0c,$0f
 $05,$0c,$0f
 $05,$0c,$04
 $05,$0c,$07
 $05,$0c,$0f
 $05,$0c,$0f
 $05,$0c,$03
 $10,$04,$0c
 $10,$04,$01
 $10,$04,$09
 $10,$04,$0b
 $10,$04,$05
 $10,$04,$02
 $10,$04,$07
 $10,$04,$07
 $10,$04,$03
 $10,$04,$02
 $10,$04,$01
 $00,$00,$00
end

 data sfx_hophipquick
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$04,$0f ; first chunk of freq,channel,volume
 $12,$04,$0f
 $05,$0c,$0c
 $05,$0c,$0f
 $05,$0c,$0f
 $05,$0c,$07
 $05,$0c,$0f
 $05,$0c,$03
 $10,$04,$0c
 $10,$04,$09
 $10,$04,$0b
 $10,$04,$02
 $10,$04,$07
 $10,$04,$03
 $10,$04,$02
 $00,$00,$00
end

 data sfx_bassbump2
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$06,$0f ; first chunk of freq,channel,volume
 $1e,$06,$0f
 $1e,$06,$0f
 $1e,$06,$0f
 $1e,$06,$0f
 $17,$0c,$05
 $1e,$06,$0c
 $1e,$06,$08
 $07,$06,$07
 $1e,$0c,$06
 $12,$0c,$03
 $1e,$06,$00
 $1e,$06,$01
 $1e,$06,$01
 $1e,$06,$01
 $1e,$06,$01
 $00,$00,$00
end

 data sfx_pickupprize
 $10,$10,$00 ; version, priority, frames per chunk
 $0a,$0c,$0c ; first chunk of freq,channel,volume
 $1e,$06,$0f
 $0b,$0c,$0e
 $1e,$06,$0d
 $0c,$0c,$0f
 $1e,$06,$0e
 $1e,$06,$0c
 $0b,$0c,$05
 $16,$04,$05
 $13,$04,$0a
 $09,$04,$03
 $13,$04,$0a
 $13,$04,$06
 $13,$04,$03
 $09,$04,$02
 $12,$04,$0a
 $12,$04,$06
 $12,$04,$07
 $12,$04,$02
 $09,$04,$01
 $13,$04,$03
 $12,$04,$01
 $00,$00,$00
end

 data sfx_distressed2
 $10,$10,$00 ; version, priority, frames per chunk
 $12,$0c,$0f ; first chunk of freq,channel,volume
 $12,$0c,$0f
 $1e,$06,$0f
 $03,$0c,$0f
 $1e,$06,$0b
 $1e,$06,$0c
 $03,$0c,$08
 $0c,$04,$0e
 $0c,$04,$0a
 $0c,$04,$0a
 $1e,$06,$08
 $1e,$06,$08
 $1e,$06,$09
 $1e,$06,$05
 $04,$0c,$09
 $1e,$06,$03
 $00,$06,$06
 $0f,$04,$03
 $10,$04,$03
 $10,$04,$01
 $05,$0c,$01
 $12,$04,$01
 $12,$04,$01
 $13,$04,$01
 $00,$00,$00
end

 data sfx_pewpew
 $10,$10,$00 ; version, priority, frames per chunk
 $1c,$04,$0f ; first chunk of freq,channel,volume
 $1c,$04,$0f
 $09,$04,$0b
 $03,$0c,$0a
 $04,$0c,$0e
 $12,$04,$0c
 $19,$04,$0f
 $1c,$04,$0f
 $07,$04,$05
 $09,$04,$05
 $0d,$04,$06
 $0c,$04,$05
 $18,$04,$06
 $1c,$04,$05
 $1e,$04,$03
 $07,$04,$03
 $09,$04,$03
 $0c,$04,$02
 $04,$0c,$02
 $06,$0c,$01
 $00,$00,$00
end

 data sfx_denied
 $10,$10,$00 ; version, priority, frames per chunk
 $0e,$0c,$0d ; first chunk of freq,channel,volume
 $10,$0c,$0a
 $10,$0c,$0c
 $1e,$06,$05
 $1e,$06,$09
 $12,$0c,$07
 $12,$0c,$0b
 $12,$0c,$0f
 $12,$0c,$0b
 $12,$0c,$07
 $03,$06,$05
 $03,$06,$04
 $03,$06,$09
 $1e,$06,$03
 $12,$0c,$07
 $12,$0c,$07
 $12,$0c,$05
 $1e,$06,$05
 $1f,$0c,$03
 $1f,$0c,$02
 $1f,$0c,$01
 $00,$00,$00
end

 data sfx_teleported
 $10,$10,$00 ; version, priority, frames per chunk
 $1c,$04,$0f ; first chunk of freq,channel,volume
 $00,$06,$0f
 $0c,$04,$0f
 $03,$0c,$0f
 $0a,$04,$0f
 $0a,$04,$0f
 $04,$0c,$0f
 $10,$04,$0f
 $07,$04,$0f
 $06,$0c,$0f
 $06,$0c,$0f
 $05,$0c,$0f
 $0f,$04,$0f
 $01,$0c,$0d
 $15,$04,$0f
 $0d,$04,$0d
 $03,$0c,$0f
 $03,$0c,$0d
 $03,$0c,$0d
 $0d,$04,$0f
 $04,$0c,$0e
 $10,$04,$0f
 $10,$04,$0f
 $05,$0c,$0a
 $15,$04,$0f
 $12,$04,$0f
 $12,$04,$0f
 $05,$0c,$0d
 $16,$04,$0b
 $16,$04,$0b
 $0d,$04,$0b
 $12,$04,$0a
 $10,$04,$07
 $0d,$04,$09
 $03,$0c,$0a
 $0d,$04,$0c
 $0d,$04,$0a
 $05,$0c,$0a
 $0f,$04,$09
 $12,$04,$09
 $00,$06,$09
 $10,$04,$0c
 $10,$04,$0b
 $15,$04,$06
 $15,$04,$08
 $1c,$04,$05
 $03,$0c,$05
 $03,$0c,$05
 $0a,$04,$04
 $03,$0c,$04
 $0d,$04,$06
 $0d,$04,$06
 $02,$0c,$03
 $07,$04,$04
 $06,$0c,$04
 $12,$04,$05
 $12,$04,$03
 $01,$0c,$02
 $01,$0c,$03
 $0d,$04,$04
 $0d,$04,$05
 $07,$04,$01
 $02,$0c,$01
 $0a,$04,$01
 $03,$0c,$02
 $03,$0c,$03
 $0d,$04,$02
 $02,$0c,$00
 $03,$0c,$01
 $0a,$04,$01
 $07,$04,$01
 $02,$0c,$01
 $07,$04,$01
 $01,$0c,$01
 $0d,$04,$01
 $0d,$04,$01
 $00,$00,$00
end

 data sfx_alienklaxon
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$06,$0f ; first chunk of freq,channel,volume
 $1e,$06,$0f
 $1e,$06,$0f
 $1e,$06,$0e
 $1e,$06,$07
 $1c,$04,$0c
 $00,$06,$0c
 $1e,$04,$0f
 $0a,$0c,$0f
 $0a,$0c,$0f
 $1e,$06,$0d
 $16,$04,$09
 $1e,$06,$0f
 $1e,$06,$0b
 $1e,$06,$0f
 $0b,$0c,$0f
 $1e,$06,$0a
 $0c,$0c,$0d
 $13,$04,$0c
 $0d,$0c,$0f
 $1e,$06,$08
 $02,$0c,$04
 $12,$04,$07
 $07,$06,$03
 $0e,$0c,$0f
 $0e,$0c,$0f
 $0e,$0c,$0e
 $10,$0c,$0f
 $10,$0c,$0f
 $10,$0c,$0d
 $1e,$06,$07
 $1e,$06,$06
 $1e,$06,$08
 $1e,$06,$07
 $12,$0c,$0f
 $03,$06,$0f
 $1e,$04,$07
 $12,$0c,$0f
 $12,$0c,$0d
 $0e,$0c,$07
 $1e,$06,$01
 $1e,$06,$02
 $1e,$06,$04
 $0a,$0c,$04
 $0a,$0c,$09
 $1e,$04,$08
 $1c,$04,$08
 $1b,$04,$06
 $19,$04,$05
 $1e,$06,$02
 $04,$04,$01
 $1e,$06,$00
 $04,$04,$01
 $06,$0c,$02
 $06,$0c,$04
 $06,$0c,$01
 $12,$04,$04
 $1e,$06,$02
 $05,$0c,$01
 $04,$04,$00
 $1e,$06,$01
 $1e,$06,$00
 $00,$06,$00
 $04,$0c,$01
 $04,$0c,$01
 $04,$0c,$01
 $00,$00,$00
end

 data sfx_crystalchimes
 $10,$10,$00 ; version, priority, frames per chunk
 $03,$04,$05 ; first chunk of freq,channel,volume
 $03,$04,$0f
 $0c,$04,$05
 $0c,$04,$0d
 $0c,$04,$0f
 $0c,$04,$0b
 $0c,$04,$0f
 $0c,$04,$0f
 $06,$04,$0b
 $0c,$04,$0c
 $0c,$04,$0b
 $06,$04,$0a
 $03,$0c,$0d
 $03,$0c,$0b
 $03,$0c,$0a
 $03,$0c,$08
 $06,$04,$09
 $03,$0c,$0f
 $03,$0c,$0d
 $06,$04,$08
 $03,$0c,$0c
 $0a,$04,$07
 $0a,$04,$0a
 $0a,$04,$0d
 $03,$0c,$04
 $0a,$04,$07
 $06,$04,$06
 $0a,$04,$08
 $0a,$04,$0c
 $06,$04,$07
 $0a,$04,$04
 $0a,$04,$05
 $06,$04,$06
 $1e,$06,$02
 $06,$04,$05
 $0a,$04,$06
 $0a,$04,$06
 $06,$04,$05
 $0a,$04,$07
 $06,$04,$04
 $0a,$04,$05
 $0a,$04,$06
 $06,$04,$05
 $1e,$06,$01
 $06,$04,$04
 $0a,$04,$04
 $0a,$04,$04
 $0a,$04,$02
 $0a,$04,$02
 $06,$04,$03
 $0a,$04,$03
 $0a,$04,$05
 $06,$04,$02
 $0a,$04,$04
 $0a,$04,$03
 $0a,$04,$02
 $0a,$04,$03
 $0a,$04,$02
 $0a,$04,$03
 $0a,$04,$03
 $06,$04,$01
 $0a,$04,$03
 $0a,$04,$01
 $0a,$04,$02
 $0a,$04,$01
 $06,$04,$01
 $0a,$04,$01
 $0a,$04,$01
 $00,$00,$00
end

 data sfx_oneup
 $10,$10,$00 ; version, priority, frames per chunk
 $16,$04,$0f ; first chunk of freq,channel,volume
 $16,$04,$0f
 $16,$04,$08
 $13,$04,$04
 $13,$04,$02
 $12,$06,$01
 $12,$06,$01
 $12,$04,$0f
 $12,$04,$0f
 $12,$04,$08
 $11,$04,$04
 $10,$04,$02
 $10,$04,$01
 $10,$04,$01
 $0a,$04,$08
 $0a,$04,$08
 $1e,$06,$00
 $1e,$06,$00
 $1e,$06,$00
 $1e,$06,$00
 $0d,$04,$08
 $0d,$04,$08
 $0d,$04,$08
 $0d,$04,$06
 $1e,$06,$00
 $1e,$06,$00
 $1e,$06,$00
 $0c,$04,$08
 $0c,$04,$04
 $1e,$06,$00
 $1e,$06,$00
 $1e,$06,$00
 $1e,$06,$00
 $09,$04,$06
 $01,$04,$02
 $09,$04,$04
 $09,$04,$02
 $09,$04,$04
 $09,$04,$04
 $01,$04,$02
 $09,$04,$04
 $01,$04,$00
 $09,$04,$04
 $01,$04,$02
 $09,$04,$04
 $09,$04,$02
 $09,$04,$02
 $09,$04,$04
 $01,$04,$02
 $01,$04,$01
 $00,$00,$00
end

 data sfx_babywah
 $10,$10,$00 ; version, priority, frames per chunk
 $0d,$04,$0b ; first chunk of freq,channel,volume
 $0d,$04,$0f
 $0d,$04,$05
 $19,$04,$0c
 $19,$04,$0d
 $0c,$04,$0f
 $19,$04,$0f
 $0c,$04,$07
 $18,$04,$0f
 $18,$04,$0f
 $03,$0c,$0f
 $07,$0c,$0f
 $07,$0c,$0f
 $07,$0c,$0f
 $07,$0c,$0f
 $03,$0c,$07
 $03,$0c,$09
 $03,$0c,$06
 $18,$04,$0c
 $18,$04,$0c
 $18,$04,$0c
 $1b,$04,$04
 $0d,$04,$06
 $1c,$04,$04
 $0a,$06,$03
 $12,$04,$02
 $10,$04,$05
 $05,$0c,$06
 $12,$04,$07
 $06,$0c,$04
 $07,$0c,$03
 $19,$04,$02
 $1c,$04,$01
 $00,$00,$00
end

 data sfx_gotthecoin
 $10,$10,$00 ; version, priority, frames per chunk
 $04,$0c,$0f ; first chunk of freq,channel,volume
 $04,$0c,$0f
 $0a,$04,$0e
 $0a,$04,$0f
 $0a,$04,$0f
 $0a,$04,$0d
 $0a,$04,$09
 $0a,$04,$09
 $0a,$04,$08
 $0a,$04,$07
 $0a,$04,$06
 $0a,$04,$05
 $0a,$04,$03
 $0a,$04,$07
 $0a,$04,$09
 $0a,$04,$03
 $0a,$04,$01
 $0a,$04,$01
 $0a,$04,$01
 $0a,$04,$00
 $0a,$04,$01
 $0a,$04,$01
 $0a,$04,$01
 $00,$00,$00
end

 data sfx_babyribbit
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$04,$0f ; first chunk of freq,channel,volume
 $1c,$04,$0f
 $1c,$04,$0e
 $0c,$04,$0e
 $1c,$04,$0e
 $0a,$0c,$06
 $0e,$0c,$00
 $1e,$06,$00
 $18,$04,$06
 $18,$04,$0b
 $16,$04,$0b
 $08,$04,$07
 $04,$04,$04
 $00,$04,$02
 $00,$04,$01
 $00,$00,$00
end

 data sfx_squeek
 $10,$10,$00 ; version, priority, frames per chunk
 $06,$0c,$0f ; first chunk of freq,channel,volume
 $15,$04,$0f
 $06,$0c,$0f
 $06,$0c,$0f
 $0a,$04,$0f
 $0a,$04,$0f
 $0c,$04,$0f
 $0d,$04,$0f
 $03,$0c,$0f
 $06,$0c,$0d
 $03,$0c,$07
 $0d,$04,$06
 $06,$0c,$04
 $15,$04,$08
 $06,$0c,$03
 $06,$0c,$05
 $15,$04,$04
 $15,$04,$04
 $06,$0c,$04
 $06,$0c,$03
 $03,$0c,$01
 $15,$04,$02
 $06,$0c,$03
 $06,$0c,$03
 $0c,$04,$00
 $15,$04,$02
 $15,$04,$01
 $00,$00,$00
end

 data sfx_whoa
 $10,$10,$00 ; version, priority, frames per chunk
 $10,$0c,$06 ; first chunk of freq,channel,volume
 $0e,$0c,$07
 $0c,$0c,$0a
 $0b,$0c,$0e
 $1e,$04,$0f
 $04,$0c,$0c
 $1b,$04,$0e
 $0d,$04,$09
 $0d,$04,$0b
 $19,$04,$08
 $0c,$04,$0b
 $18,$04,$05
 $0c,$04,$0e
 $0c,$04,$09
 $07,$0c,$0a
 $03,$0c,$08
 $16,$04,$0d
 $16,$04,$0a
 $0a,$04,$0b
 $16,$04,$0f
 $16,$04,$0c
 $16,$04,$0c
 $07,$0c,$0d
 $07,$0c,$0f
 $07,$0c,$09
 $0c,$04,$0a
 $19,$04,$0e
 $1b,$04,$0b
 $1c,$04,$0b
 $1e,$04,$0f
 $0a,$0c,$08
 $0c,$0c,$09
 $0d,$0c,$0f
 $0d,$0c,$09
 $10,$0c,$0d
 $12,$0c,$0f
 $03,$06,$0c
 $03,$06,$04
 $1e,$06,$02
 $17,$0c,$01
 $1e,$0c,$02
 $1b,$0c,$01
 $00,$00,$00
end

 data sfx_gotthering
 $10,$10,$00 ; version, priority, frames per chunk
 $09,$04,$0f ; first chunk of freq,channel,volume
 $09,$04,$0a
 $09,$04,$08
 $09,$04,$04
 $0a,$04,$0a
 $0a,$04,$08
 $0a,$04,$04
 $0a,$04,$02
 $0a,$04,$01
 $0a,$04,$01
 $06,$04,$0a
 $06,$04,$0f
 $06,$04,$0f
 $06,$04,$0f
 $06,$04,$0f
 $06,$04,$0b
 $06,$04,$0f
 $06,$04,$09
 $06,$04,$04
 $06,$04,$0c
 $06,$04,$0f
 $06,$04,$05
 $06,$04,$0f
 $06,$04,$03
 $06,$04,$0a
 $06,$04,$08
 $06,$04,$01
 $06,$04,$05
 $06,$04,$0a
 $06,$04,$01
 $06,$04,$0a
 $06,$04,$05
 $06,$04,$04
 $06,$04,$05
 $06,$04,$01
 $00,$00,$00
end

 data sfx_yahoo
 $10,$10,$00 ; version, priority, frames per chunk
 $01,$0c,$02 ; first chunk of freq,channel,volume
 $18,$04,$08
 $07,$0c,$0f
 $16,$04,$0f
 $03,$0c,$05
 $0a,$04,$06
 $15,$04,$08
 $18,$04,$04
 $18,$04,$04
 $1c,$04,$04
 $1c,$04,$04
 $1c,$04,$02
 $0b,$0c,$02
 $19,$04,$01
 $19,$04,$00
 $1c,$04,$01
 $1b,$04,$03
 $19,$04,$06
 $18,$04,$04
 $1e,$04,$06
 $19,$04,$0f
 $18,$04,$0f
 $18,$04,$0f
 $18,$04,$0b
 $18,$04,$0f
 $18,$04,$0f
 $18,$04,$0f
 $18,$04,$05
 $18,$04,$08
 $19,$04,$0f
 $1b,$04,$08
 $1b,$04,$06
 $1c,$04,$0f
 $1c,$04,$0f
 $1e,$04,$08
 $1e,$04,$0e
 $1e,$04,$0b
 $0a,$0c,$08
 $0a,$0c,$0f
 $0b,$0c,$0f
 $0b,$0c,$0e
 $0b,$0c,$09
 $0c,$0c,$06
 $0c,$0c,$02
 $0d,$0c,$03
 $0d,$0c,$03
 $0d,$0c,$01
 $0e,$0c,$00
 $17,$0c,$00
 $00,$00,$00
end

 data sfx_warcry
 $10,$10,$00 ; version, priority, frames per chunk
 $0f,$06,$04 ; first chunk of freq,channel,volume
 $0a,$0c,$03
 $1c,$04,$0f
 $1e,$04,$0f
 $1e,$04,$0f
 $1c,$04,$0f
 $1b,$04,$0f
 $02,$0c,$0b
 $0c,$04,$08
 $18,$04,$0f
 $0c,$04,$0f
 $02,$0c,$0f
 $18,$04,$0f
 $18,$04,$0f
 $0c,$04,$0f
 $07,$04,$0f
 $0c,$04,$0c
 $02,$0c,$0f
 $18,$04,$0f
 $02,$0c,$0f
 $0c,$04,$0f
 $0c,$04,$09
 $19,$04,$0f
 $02,$0c,$0f
 $1b,$04,$0f
 $1b,$04,$0f
 $02,$0c,$0f
 $1c,$04,$0f
 $0d,$04,$0b
 $09,$04,$0f
 $04,$0c,$08
 $1e,$04,$0e
 $1e,$04,$0f
 $1e,$04,$0b
 $1e,$04,$0a
 $1e,$04,$08
 $1e,$04,$07
 $1e,$04,$06
 $1f,$04,$04
 $1f,$04,$03
 $1f,$04,$02
 $1f,$04,$01
 $00,$00,$00
end

 data sfx_downthepipe
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$06,$0f ; first chunk of freq,channel,volume
 $1e,$06,$0f
 $18,$04,$08
 $0c,$0c,$0d
 $12,$0c,$0b
 $0a,$06,$06
 $18,$04,$0a
 $0c,$0c,$0b
 $03,$06,$0f
 $1e,$0c,$0e
 $1e,$06,$0f
 $0f,$06,$0f
 $1e,$06,$02
 $1e,$06,$00
 $1e,$06,$00
 $07,$06,$00
 $1e,$06,$0f
 $1e,$06,$0f
 $18,$04,$08
 $0c,$0c,$0d
 $12,$0c,$0b
 $0a,$06,$06
 $18,$04,$0a
 $0c,$0c,$0b
 $03,$06,$0f
 $1e,$0c,$0e
 $1e,$06,$0f
 $0f,$06,$0f
 $1e,$06,$02
 $1e,$06,$00
 $1e,$06,$00
 $07,$06,$00
 $1e,$06,$0f
 $1e,$06,$0f
 $18,$04,$08
 $0c,$0c,$0d
 $12,$0c,$0b
 $0a,$06,$06
 $18,$04,$0a
 $0c,$0c,$0b
 $03,$06,$0f
 $1e,$0c,$0e
 $1e,$06,$0f
 $0f,$06,$0f
 $1e,$06,$02
 $1e,$06,$00
 $1e,$06,$00
 $07,$06,$00
 $00,$00,$00
end

 data sfx_powerup
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$06,$0f ; first chunk of freq,channel,volume
 $1c,$04,$0f
 $0c,$0c,$0f
 $0c,$0c,$0f
 $0c,$0c,$0f
 $1c,$04,$0f
 $1b,$04,$0a
 $16,$04,$09
 $12,$04,$07
 $12,$04,$0e
 $12,$04,$08
 $0d,$04,$03
 $12,$04,$08
 $12,$04,$0f
 $0b,$0c,$0f
 $0b,$0c,$0f
 $0b,$0c,$0c
 $1c,$04,$06
 $1c,$04,$0c
 $07,$0c,$0f
 $07,$0c,$09
 $05,$0c,$0a
 $18,$04,$07
 $07,$0c,$0f
 $07,$0c,$0a
 $05,$0c,$0c
 $05,$0c,$05
 $1e,$06,$03
 $03,$0c,$04
 $03,$0c,$04
 $03,$0c,$04
 $02,$0c,$08
 $03,$0c,$04
 $1e,$06,$02
 $0a,$0c,$0e
 $0a,$0c,$0f
 $1e,$04,$0d
 $19,$04,$08
 $15,$04,$0b
 $15,$04,$0f
 $15,$04,$08
 $0f,$04,$07
 $15,$04,$07
 $15,$04,$0c
 $06,$0c,$07
 $0f,$04,$02
 $00,$06,$04
 $01,$0c,$00
 $0a,$04,$04
 $0a,$04,$08
 $0a,$04,$03
 $07,$04,$03
 $0a,$04,$03
 $00,$00,$00
end

 data sfx_falling
 $10,$10,$00 ; version, priority, frames per chunk
 $0f,$04,$00 ; first chunk of freq,channel,volume
 $03,$0c,$03
 $0c,$04,$04
 $0c,$04,$0b
 $0c,$04,$0b
 $0d,$04,$0a
 $0d,$04,$0f
 $04,$0c,$0f
 $04,$0c,$0f
 $04,$0c,$0a
 $00,$06,$0f
 $0f,$04,$0b
 $10,$04,$08
 $00,$06,$0c
 $04,$0c,$0f
 $04,$0c,$0d
 $0d,$04,$08
 $04,$0c,$0c
 $05,$0c,$0b
 $05,$0c,$07
 $06,$0c,$06
 $12,$04,$0c
 $12,$04,$0f
 $12,$04,$0f
 $10,$04,$0f
 $10,$04,$0f
 $10,$04,$09
 $13,$04,$07
 $13,$04,$07
 $15,$04,$0b
 $06,$0c,$0f
 $13,$04,$0f
 $13,$04,$0f
 $12,$04,$08
 $05,$0c,$0c
 $05,$0c,$07
 $16,$04,$06
 $16,$04,$05
 $07,$0c,$02
 $07,$0c,$05
 $15,$04,$08
 $15,$04,$0f
 $15,$04,$0b
 $13,$04,$07
 $16,$04,$06
 $16,$04,$04
 $18,$04,$06
 $19,$04,$05
 $1b,$04,$02
 $18,$04,$01
 $16,$04,$02
 $16,$04,$06
 $06,$0c,$01
 $16,$04,$05
 $16,$04,$01
 $1c,$04,$01
 $00,$00,$00
end

 data sfx_eek
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$06,$04 ; first chunk of freq,channel,volume
 $10,$0c,$03
 $1e,$04,$0b
 $1c,$04,$0f
 $0d,$04,$0f
 $03,$0c,$0f
 $03,$0c,$0f
 $03,$0c,$0f
 $0a,$04,$0f
 $0a,$04,$0f
 $0a,$04,$0f
 $0a,$04,$0f
 $0a,$04,$0f
 $0a,$04,$0f
 $0a,$04,$08
 $0a,$04,$0f
 $0a,$04,$07
 $0a,$04,$0f
 $0a,$04,$0c
 $03,$0c,$0f
 $03,$0c,$0f
 $0c,$04,$0f
 $04,$0c,$06
 $0c,$04,$02
 $06,$0c,$01
 $06,$0c,$01
 $00,$00,$00
end

 data sfx_uhoh
 $10,$10,$00 ; version, priority, frames per chunk
 $07,$06,$01 ; first chunk of freq,channel,volume
 $1e,$0c,$03
 $1e,$0c,$04
 $17,$0c,$04
 $0a,$06,$06
 $0a,$0c,$0a
 $07,$06,$0f
 $1e,$04,$0f
 $19,$04,$0f
 $19,$04,$0f
 $1b,$04,$07
 $18,$04,$07
 $18,$04,$04
 $07,$0c,$02
 $16,$04,$00
 $16,$04,$00
 $16,$04,$00
 $0f,$06,$00
 $1e,$06,$00
 $1e,$06,$00
 $1e,$06,$00
 $19,$04,$00
 $1e,$04,$01
 $1e,$04,$0a
 $1c,$04,$0f
 $1c,$04,$0f
 $1e,$04,$0f
 $1b,$0c,$0f
 $0d,$0c,$0f
 $0d,$0c,$0e
 $0e,$0c,$0f
 $0e,$0c,$0f
 $0e,$0c,$0f
 $0e,$0c,$0f
 $0e,$0c,$0f
 $0e,$0c,$0d
 $1b,$0c,$0a
 $04,$0c,$0a
 $1b,$0c,$0b
 $0e,$0c,$0a
 $0e,$0c,$0a
 $1b,$0c,$0a
 $0d,$0c,$0a
 $0d,$0c,$06
 $0e,$0c,$04
 $0e,$0c,$04
 $0e,$0c,$02
 $00,$00,$00
end

 data sfx_anotherup
 $10,$10,$00 ; version, priority, frames per chunk
 $06,$0c,$0f ; first chunk of freq,channel,volume
 $06,$0c,$08
 $06,$0c,$0f
 $06,$0c,$0f
 $06,$0c,$0a
 $15,$04,$0a
 $06,$0c,$09
 $10,$04,$0f
 $02,$0c,$07
 $10,$04,$0f
 $10,$04,$0d
 $10,$04,$09
 $10,$04,$0b
 $0d,$04,$0d
 $06,$04,$06
 $0d,$04,$0c
 $0d,$04,$0a
 $0d,$04,$06
 $0d,$04,$0c
 $06,$0c,$0c
 $06,$0c,$0f
 $06,$0c,$0f
 $06,$0c,$0a
 $06,$0c,$06
 $06,$0c,$0f
 $10,$04,$0d
 $10,$04,$0d
 $10,$04,$0a
 $10,$04,$0a
 $10,$04,$06
 $04,$0c,$04
 $0d,$04,$08
 $0d,$04,$08
 $06,$04,$03
 $0d,$04,$09
 $0d,$04,$05
 $04,$0c,$04
 $06,$0c,$05
 $06,$0c,$05
 $06,$0c,$09
 $06,$0c,$0b
 $06,$0c,$09
 $06,$0c,$04
 $10,$04,$04
 $10,$04,$03
 $10,$04,$02
 $10,$04,$04
 $10,$04,$03
 $10,$04,$02
 $00,$00,$00
end

 data sfx_bubbleup
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$04,$0f ; first chunk of freq,channel,volume
 $1e,$04,$0f
 $12,$0c,$0e
 $19,$04,$06
 $10,$0c,$0f
 $10,$0c,$0d
 $1c,$04,$0f
 $1c,$04,$0e
 $10,$0c,$0f
 $10,$0c,$0f
 $10,$0c,$0f
 $1b,$04,$0a
 $1b,$04,$0e
 $1b,$04,$0b
 $0e,$0c,$0f
 $0e,$0c,$0e
 $10,$0c,$07
 $19,$04,$0c
 $19,$04,$08
 $0d,$0c,$07
 $0e,$0c,$07
 $0d,$0c,$0d
 $0d,$0c,$08
 $18,$04,$06
 $07,$0c,$04
 $0d,$0c,$07
 $0d,$0c,$0b
 $13,$04,$01
 $16,$04,$04
 $16,$04,$06
 $16,$04,$03
 $0c,$0c,$04
 $0c,$0c,$06
 $0c,$0c,$04
 $15,$04,$03
 $15,$04,$03
 $06,$0c,$01
 $0b,$0c,$02
 $0b,$0c,$04
 $0b,$0c,$02
 $00,$00,$00
end

 data sfx_jump1
 $10,$10,$00 ; version, priority, frames per chunk
 $03,$06,$0f ; first chunk of freq,channel,volume
 $12,$0c,$0f
 $12,$0c,$0f
 $10,$0c,$0f
 $10,$0c,$0f
 $10,$0c,$05
 $0d,$0c,$09
 $0e,$0c,$05
 $0c,$0c,$0f
 $0c,$0c,$0c
 $0b,$0c,$0c
 $0b,$0c,$03
 $1e,$04,$05
 $1c,$04,$04
 $1c,$04,$03
 $1c,$04,$02
 $19,$04,$02
 $18,$04,$02
 $07,$0c,$01
 $00,$00,$00
end

 data sfx_plainlaser
 $10,$10,$00 ; version, priority, frames per chunk
 $10,$04,$06 ; first chunk of freq,channel,volume
 $13,$04,$08
 $16,$04,$08
 $16,$04,$07
 $1c,$04,$09
 $0b,$0c,$0f
 $0d,$0c,$0f
 $0e,$0c,$0f
 $0e,$0c,$0f
 $12,$0c,$0f
 $03,$06,$0d
 $1e,$0c,$0a
 $1e,$0c,$0c
 $0a,$06,$04
 $00,$00,$00
end

 data sfx_aliencoo
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$04,$0f ; first chunk of freq,channel,volume
 $1c,$04,$0f
 $1e,$04,$0f
 $1c,$04,$0e
 $1e,$04,$0f
 $1e,$04,$05
 $1c,$04,$0f
 $1e,$04,$03
 $1c,$04,$0f
 $1c,$04,$04
 $1e,$04,$0f
 $1c,$04,$02
 $1e,$04,$0e
 $1e,$04,$03
 $1e,$04,$05
 $1e,$04,$01
 $00,$00,$00
end

 data sfx_simplebuzz
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$06,$00 ; first chunk of freq,channel,volume
 $0a,$06,$01
 $1e,$06,$02
 $1e,$06,$04
 $1e,$06,$05
 $0f,$06,$0f
 $0f,$06,$0f
 $0f,$06,$0f
 $0f,$06,$0d
 $0f,$06,$0f
 $0f,$06,$0f
 $0f,$06,$0f
 $0f,$06,$0f
 $07,$06,$08
 $07,$06,$06
 $0f,$06,$06
 $0f,$06,$04
 $0f,$06,$02
 $00,$00,$00
end

 data sfx_jump2
 $10,$10,$00 ; version, priority, frames per chunk
 $10,$0c,$0c ; first chunk of freq,channel,volume
 $10,$0c,$0f
 $0f,$0c,$0f
 $0f,$0c,$0f
 $00,$06,$07
 $0e,$0c,$0f
 $0e,$0c,$0d
 $0e,$0c,$07
 $0f,$0c,$0f
 $0f,$0c,$08
 $11,$0c,$08
 $12,$0c,$06
 $03,$06,$08
 $15,$0c,$07
 $15,$0c,$04
 $17,$0c,$06
 $04,$06,$06
 $04,$06,$01
 $17,$0c,$01
 $00,$00,$00
end

 data sfx_jump3
 $10,$10,$01 ; version, priority, frames per chunk
 $17,$0c,$07 ; first chunk of freq,channel,volume
 $1b,$0c,$0f
 $1b,$0c,$09
 $17,$0c,$0d
 $17,$0c,$0f
 $0d,$0c,$0b
 $0c,$0c,$0d
 $0a,$0c,$0a
 $1c,$04,$09
 $1b,$04,$0f
 $1b,$04,$07
 $18,$04,$04
 $1b,$04,$0c
 $0a,$0c,$04
 $0b,$0c,$03
 $0c,$0c,$03
 $0d,$0c,$01
 $00,$00,$00
end

 data sfx_dunno
 $10,$10,$00 ; version, priority, frames per chunk
 $0b,$0c,$04 ; first chunk of freq,channel,volume
 $0a,$0c,$0b
 $0a,$0c,$0f
 $0a,$0c,$0f
 $0a,$0c,$0f
 $0a,$0c,$0d
 $0a,$0c,$0f
 $0b,$0c,$0c
 $0b,$0c,$0f
 $0b,$0c,$0d
 $0b,$0c,$07
 $0b,$0c,$0b
 $0b,$0c,$08
 $08,$0c,$03
 $0b,$0c,$06
 $0b,$0c,$08
 $0b,$0c,$09
 $0b,$0c,$06
 $0c,$0c,$05
 $0b,$0c,$04
 $0b,$0c,$03
 $0b,$0c,$02
 $00,$00,$00
end

 data sfx_snore
 $10,$10,$00 ; version, priority, frames per chunk
 $0c,$0c,$01 ; first chunk of freq,channel,volume
 $17,$0c,$03
 $03,$06,$06
 $0a,$06,$04
 $0a,$06,$04
 $07,$06,$03
 $1e,$06,$0c
 $0f,$06,$0f
 $0f,$06,$0f
 $0a,$06,$0f
 $0f,$06,$0f
 $0d,$04,$0f
 $0f,$06,$0f
 $0f,$06,$0f
 $0a,$06,$0e
 $00,$06,$0c
 $0d,$04,$0d
 $0a,$06,$04
 $0f,$06,$03
 $0a,$06,$04
 $1e,$06,$01
 $0a,$06,$01
 $00,$00,$00
end

 data sfx_uncovered
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$0c,$02 ; first chunk of freq,channel,volume
 $1b,$0c,$06
 $1b,$0c,$0c
 $1b,$0c,$0e
 $1b,$0c,$0c
 $0c,$0c,$04
 $17,$0c,$0f
 $17,$0c,$05
 $1b,$0c,$07
 $17,$0c,$05
 $17,$0c,$0f
 $17,$0c,$0f
 $17,$0c,$0f
 $03,$06,$0f
 $03,$06,$0f
 $1e,$06,$0a
 $17,$0c,$0c
 $10,$0c,$0f
 $10,$0c,$0f
 $10,$0c,$07
 $10,$0c,$03
 $17,$0c,$03
 $12,$0c,$07
 $03,$06,$04
 $03,$06,$02
 $0e,$0c,$01
 $12,$0c,$02
 $12,$0c,$03
 $03,$06,$01
 $03,$06,$01
 $10,$0c,$01
 $12,$0c,$01
 $10,$0c,$01
 $10,$0c,$01
 $00,$00,$00
end

 data sfx_doorpound
 $10,$10,$00 ; version, priority, frames per chunk
 $0f,$06,$0f ; first chunk of freq,channel,volume
 $1e,$0c,$0f
 $0f,$06,$0f
 $1e,$06,$0f
 $0a,$06,$0f
 $07,$06,$0b
 $0f,$06,$0f
 $0f,$06,$0c
 $07,$06,$0a
 $07,$06,$09
 $0f,$06,$0b
 $1e,$06,$07
 $0a,$06,$06
 $0a,$06,$08
 $0f,$06,$06
 $0a,$06,$05
 $1e,$06,$03
 $0f,$06,$02
 $00,$00,$00
end

 data sfx_distressed3
 $10,$10,$00 ; version, priority, frames per chunk
 $05,$0c,$0c ; first chunk of freq,channel,volume
 $1b,$04,$0e
 $1b,$04,$0d
 $1b,$04,$06
 $0d,$04,$07
 $1b,$04,$05
 $1b,$04,$0b
 $1b,$04,$06
 $1c,$04,$09
 $0d,$04,$07
 $1c,$04,$0b
 $1c,$04,$0e
 $1c,$04,$09
 $07,$06,$08
 $07,$06,$07
 $1c,$04,$05
 $1e,$04,$0b
 $1e,$04,$0b
 $1e,$04,$0a
 $1e,$04,$09
 $0a,$06,$04
 $1e,$04,$03
 $0a,$0c,$03
 $0a,$06,$03
 $0a,$0c,$02
 $0a,$0c,$03
 $0b,$0c,$01
 $0a,$0c,$01
 $00,$00,$00
end

 data sfx_eek2
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$06,$01 ; first chunk of freq,channel,volume
 $0a,$04,$0a
 $0a,$04,$0f
 $09,$04,$0f
 $13,$04,$0e
 $09,$04,$0f
 $09,$04,$0f
 $09,$04,$0f
 $09,$04,$0a
 $09,$04,$0f
 $09,$04,$0c
 $09,$04,$0f
 $0a,$04,$0f
 $0a,$04,$0c
 $03,$0c,$0f
 $0c,$04,$0a
 $0d,$04,$05
 $09,$04,$02
 $03,$0c,$01
 $00,$00,$00
end

 data sfx_rubberhammer
 $10,$10,$00 ; version, priority, frames per chunk
 $00,$06,$08 ; first chunk of freq,channel,volume
 $1c,$04,$0f
 $1e,$06,$0f
 $1b,$04,$0f
 $1e,$04,$0f
 $1e,$04,$0f
 $0c,$0c,$0f
 $0c,$0c,$0f
 $1e,$06,$0b
 $0a,$0c,$08
 $0a,$0c,$05
 $1e,$04,$06
 $1c,$04,$05
 $1c,$04,$03
 $0e,$0c,$01
 $1b,$04,$01
 $00,$00,$00
end

 data sfx_alienbuzz
 $10,$10,$00 ; version, priority, frames per chunk
 $0d,$0c,$04 ; first chunk of freq,channel,volume
 $0c,$0c,$08
 $0c,$0c,$0b
 $12,$0c,$05
 $12,$0c,$0a
 $0d,$0c,$0f
 $0c,$0c,$0f
 $0c,$0c,$0f
 $0b,$0c,$0f
 $0c,$0c,$0e
 $0c,$0c,$0f
 $0d,$0c,$0f
 $0c,$0c,$0f
 $0c,$0c,$0f
 $0c,$0c,$0f
 $0f,$0c,$0f
 $0c,$0c,$0f
 $0c,$0c,$0f
 $0c,$0c,$0d
 $0d,$0c,$09
 $0d,$0c,$0f
 $0d,$0c,$06
 $0c,$0c,$0f
 $0c,$0c,$05
 $0d,$0c,$01
 $0d,$0c,$01
 $0c,$0c,$01
 $0d,$0c,$00
 $0c,$0c,$01
 $00,$00,$00
end

 data sfx_anotherjumpman
 $10,$10,$00 ; version, priority, frames per chunk
 $0c,$0c,$0f ; first chunk of freq,channel,volume
 $0e,$0c,$0f
 $0e,$0c,$0f
 $0d,$0c,$0f
 $1c,$04,$0f
 $1b,$04,$0f
 $1b,$04,$0c
 $18,$04,$0f
 $1c,$04,$0f
 $0a,$0c,$0f
 $0b,$0c,$0f
 $0b,$0c,$0f
 $1e,$04,$0f
 $1b,$04,$0f
 $1b,$04,$0d
 $18,$04,$09
 $1b,$04,$0e
 $1e,$04,$0f
 $0a,$0c,$0f
 $0b,$0c,$07
 $0a,$0c,$0f
 $1b,$04,$0e
 $19,$04,$0d
 $18,$04,$0f
 $18,$04,$0f
 $1e,$04,$0f
 $1e,$04,$0a
 $0b,$0c,$0f
 $0b,$0c,$0f
 $1c,$04,$0b
 $19,$04,$08
 $18,$04,$09
 $18,$04,$07
 $1e,$04,$04
 $1e,$04,$03
 $0c,$0c,$01
 $0c,$0c,$01
 $00,$00,$00
end

 ; first chunk of freq,channel,volume
 data sfx_anotherjumpdies
 $10,$10,$00 ; version, priority, frames per chunk
 $0f,$04,$03
 $10,$04,$07
 $10,$04,$05
 $0f,$04,$02
 $0a,$04,$02
 $0c,$04,$06
 $0c,$04,$03
 $0d,$04,$05
 $0d,$04,$04
 $07,$06,$02
 $04,$0c,$04
 $04,$0c,$07
 $04,$0c,$03
 $09,$04,$02
 $09,$04,$01
 $10,$04,$03
 $0f,$04,$07
 $0f,$04,$04
 $0a,$04,$02
 $0a,$04,$02
 $10,$04,$06
 $10,$04,$06
 $05,$0c,$02
 $03,$0c,$01
 $03,$0c,$01
 $12,$04,$03
 $12,$04,$04
 $12,$04,$04
 $0c,$04,$04
 $0c,$04,$05
 $13,$04,$07
 $13,$04,$07
 $13,$04,$01
 $0c,$04,$02
 $0d,$04,$03
 $15,$04,$08
 $15,$04,$06
 $16,$04,$04
 $0d,$04,$02
 $04,$0c,$06
 $04,$0c,$05
 $07,$0c,$05
 $07,$0c,$0f
 $07,$0c,$09
 $07,$06,$03
 $00,$06,$02
 $04,$0c,$02
 $18,$04,$03
 $18,$04,$0b
 $18,$04,$0a
 $1b,$04,$03
 $10,$04,$04
 $10,$04,$05
 $10,$04,$03
 $19,$04,$08
 $1b,$04,$0a
 $1b,$04,$08
 $05,$0c,$02
 $12,$04,$07
 $12,$04,$06
 $1c,$04,$07
 $1c,$04,$0d
 $1e,$04,$09
 $13,$04,$05
 $13,$04,$0c
 $13,$04,$06
 $0b,$0c,$04
 $1e,$04,$0e
 $1e,$04,$0d
 $0a,$0c,$06
 $15,$04,$04
 $15,$04,$0c
 $15,$04,$0a
 $15,$04,$02
 $00,$00,$00
end

 data sfx_longgongsilver
 $10,$10,$00 ; version, priority, frames per chunk
 $1b,$0c,$0b ; first chunk of freq,channel,volume
 $06,$0c,$07
 $1b,$0c,$0f
 $0a,$06,$0d
 $1b,$0c,$0b
 $0a,$06,$0f
 $0a,$06,$0c
 $12,$0c,$0a
 $1b,$0c,$0f
 $12,$0c,$0b
 $1b,$0c,$0f
 $1b,$0c,$0f
 $12,$0c,$0c
 $1b,$0c,$0f
 $0a,$06,$0d
 $12,$0c,$07
 $0a,$06,$0f
 $1b,$0c,$0f
 $0a,$06,$07
 $1b,$0c,$0f
 $0a,$06,$06
 $1b,$0c,$0f
 $0a,$06,$0f
 $06,$0c,$07
 $0a,$06,$0e
 $1b,$0c,$0f
 $12,$0c,$08
 $1b,$0c,$0f
 $1b,$0c,$0c
 $1b,$0c,$0f
 $1b,$0c,$0e
 $12,$0c,$08
 $0a,$06,$0c
 $1b,$0c,$0d
 $12,$0c,$08
 $1b,$0c,$0f
 $1b,$0c,$0f
 $1b,$0c,$0a
 $1b,$0c,$0f
 $0a,$06,$0a
 $0a,$06,$08
 $0a,$06,$0f
 $1b,$0c,$09
 $0a,$06,$0c
 $1b,$0c,$0f
 $06,$0c,$05
 $1b,$0c,$0f
 $0a,$06,$0b
 $12,$0c,$06
 $0a,$06,$0c
 $1b,$0c,$08
 $12,$0c,$0a
 $1b,$0c,$0d
 $1b,$0c,$06
 $1b,$0c,$0c
 $1b,$0c,$0b
 $1b,$0c,$04
 $0a,$06,$06
 $0a,$06,$07
 $0a,$06,$04
 $1b,$0c,$09
 $1b,$0c,$07
 $1b,$0c,$06
 $1b,$0c,$07
 $12,$0c,$07
 $1b,$0c,$06
 $12,$0c,$07
 $12,$0c,$05
 $0a,$06,$05
 $1b,$0c,$06
 $0a,$0c,$02
 $1b,$0c,$08
 $0a,$06,$03
 $1b,$0c,$04
 $0a,$06,$06
 $12,$0c,$02
 $1b,$0c,$02
 $1b,$0c,$05
 $12,$0c,$02
 $1b,$0c,$05
 $0a,$06,$04
 $1b,$0c,$02
 $1b,$0c,$04
 $1b,$0c,$01
 $12,$0c,$03
 $0a,$06,$04
 $1b,$0c,$02
 $1b,$0c,$01
 $1b,$0c,$04
 $0a,$06,$02
 $1b,$0c,$02
 $0a,$06,$02
 $00,$00,$00
end

 data sfx_strum
 $10,$10,$00 ; version, priority, frames per chunk
 $0c,$0c,$09 ; first chunk of freq,channel,volume
 $0c,$0c,$0f
 $0c,$0c,$0f
 $0c,$0c,$0f
 $0c,$0c,$0f
 $1e,$04,$0f
 $1e,$04,$0e
 $07,$0c,$0f
 $07,$0c,$0f
 $07,$0c,$0b
 $1e,$04,$0b
 $07,$0c,$0c
 $0c,$0c,$09
 $07,$0c,$07
 $07,$0c,$06
 $07,$0c,$05
 $07,$0c,$04
 $07,$0c,$04
 $07,$0c,$03
 $07,$0c,$03
 $07,$0c,$02
 $07,$0c,$02
 $07,$0c,$01
 $07,$0c,$01
 $00,$00,$00
end

 data sfx_dropped
 $10,$10,$00 ; version, priority, frames per chunk
 $0a,$06,$0f ; first chunk of freq,channel,volume
 $0a,$06,$0f
 $0a,$06,$06
 $0c,$04,$02
 $1b,$0c,$01
 $07,$06,$0f
 $0a,$06,$0f
 $0a,$06,$0f
 $0a,$06,$07
 $07,$04,$06
 $07,$04,$04
 $07,$06,$0f
 $07,$06,$0d
 $07,$04,$0e
 $07,$04,$06
 $07,$04,$03
 $0a,$06,$09
 $0a,$06,$0f
 $07,$04,$0f
 $07,$04,$05
 $07,$04,$05
 $1b,$0c,$08
 $07,$04,$0d
 $07,$04,$07
 $07,$04,$07
 $07,$04,$03
 $07,$04,$07
 $07,$04,$05
 $07,$04,$03
 $07,$04,$01
 $00,$00,$00
end

 data sfx_alienaggressor
 $10,$10,$00 ; version, priority, frames per chunk
 $1b,$0c,$01
 $0f,$06,$02
 $0f,$06,$03
 $1e,$06,$02
 $1e,$06,$01
 $1b,$0c,$02
 $17,$0c,$06
 $17,$0c,$09
 $17,$0c,$0d
 $07,$06,$0d
 $16,$04,$06
 $17,$0c,$0d
 $17,$0c,$0f
 $1c,$04,$0d
 $1c,$04,$0f
 $07,$0c,$08
 $18,$04,$0f
 $18,$04,$09
 $03,$0c,$0a
 $03,$0c,$0c
 $0c,$04,$0f
 $0c,$04,$0f
 $06,$0c,$08
 $18,$04,$0c
 $0a,$0c,$09
 $07,$06,$05
 $07,$06,$05
 $08,$06,$03
 $09,$06,$01
 $00,$06,$00
 $07,$06,$02
 $08,$06,$01
 $00,$00,$00
end

 data sfx_electroswitch2
 $10,$10,$00 ; version, priority, frames per chunk
 $05,$0c,$0b ; first chunk of freq,channel,volume
 $17,$0c,$0c
 $0c,$04,$0b
 $07,$04,$0b
 $0c,$04,$0f
 $0c,$04,$08
 $12,$04,$09
 $12,$04,$0f
 $1b,$0c,$08
 $0a,$06,$09
 $0a,$06,$02
 $1b,$0c,$01
 $00,$00,$00
end

 data sfx_gooditem
 $10,$10,$00 ; version, priority, frames per chunk
 $07,$0c,$0f ; first chunk of freq,channel,volume
 $06,$0c,$04
 $07,$0c,$0f
 $07,$0c,$0f
 $07,$0c,$0f
 $06,$0c,$08
 $06,$0c,$09
 $06,$0c,$0c
 $07,$0c,$0d
 $06,$0c,$0e
 $06,$0c,$0c
 $12,$04,$0d
 $12,$04,$0d
 $1b,$04,$04
 $06,$0c,$06
 $12,$04,$0c
 $12,$04,$0b
 $10,$04,$04
 $04,$0c,$04
 $12,$04,$0c
 $12,$04,$0c
 $10,$04,$0a
 $12,$04,$03
 $06,$0c,$09
 $12,$04,$0e
 $10,$04,$0d
 $04,$0c,$07
 $04,$0c,$06
 $0d,$04,$07
 $10,$04,$0a
 $10,$04,$0a
 $10,$04,$05
 $04,$0c,$04
 $10,$04,$06
 $10,$04,$0b
 $10,$04,$05
 $0d,$04,$08
 $03,$0c,$07
 $04,$0c,$09
 $04,$0c,$05
 $0c,$04,$0a
 $0a,$04,$07
 $09,$04,$04
 $0d,$04,$08
 $0d,$04,$05
 $03,$0c,$07
 $00,$00,$00
end

 data sfx_babyribbithop
 $10,$10,$00 ; version, priority, frames per chunk
 $0c,$0c,$04 ; first chunk of freq,channel,volume
 $17,$0c,$04
 $04,$0c,$06
 $0d,$04,$0d
 $0d,$04,$0c
 $0a,$04,$0f
 $09,$04,$09
 $1e,$06,$0f
 $1e,$06,$0f
 $09,$04,$0d
 $10,$0c,$09
 $09,$04,$07
 $0a,$06,$06
 $00,$00,$00
end

 data sfx_distressed4
 $10,$10,$00 ; version, priority, frames per chunk
 $1b,$04,$04 ; first chunk of freq,channel,volume
 $1c,$04,$0a
 $1c,$04,$0f
 $1b,$04,$0f
 $1c,$04,$0f
 $1c,$04,$0f
 $19,$04,$0f
 $1c,$04,$0f
 $1c,$04,$0f
 $1c,$04,$0f
 $1c,$04,$09
 $1c,$04,$0f
 $1c,$04,$0f
 $1c,$04,$0f
 $1c,$04,$09
 $1c,$04,$0f
 $1c,$04,$0f
 $1c,$04,$0f
 $1c,$04,$09
 $1c,$04,$0f
 $1c,$04,$0f
 $1d,$04,$08
 $1d,$04,$02
 $1d,$04,$01
 $1d,$04,$00
 $1d,$04,$02
 $1d,$04,$01
 $00,$00,$00
end

 data sfx_hahaha
  $10,$10,$00 ; version, priority, frames per chunk
  $0a, $07, $01 ; first chunk of freq,channel,volume
  $07, $01, $01
  $09, $07, $02
  $1f, $0f, $01
  $07, $07, $01
  $12, $0f, $01
  $08, $07, $01
  $0b, $04, $01
  $08, $06, $01
  $12, $04, $01
  $0b, $04, $01
  $16, $06, $01
  $07, $06, $01
  $12, $04, $0c
  $11, $04, $0d
  $10, $04, $0d
  $13, $04, $0d
  $15, $04, $05
  $07, $07, $03
  $13, $04, $01
  $1c, $04, $06
  $17, $04, $0b
  $15, $04, $08
  $17, $01, $08
  $01, $06, $09
  $0a, $07, $05
  $0d, $0c, $04
  $16, $07, $01
  $04, $01, $07
  $1d, $04, $0b
  $00, $06, $09
  $1b, $0f, $0d
  $04, $01, $0d
  $19, $01, $06
  $0a, $0f, $01
  $02, $06, $03
  $0c, $0c, $07
  $0a, $0c, $0c
  $1f, $04, $0f
  $11, $04, $07
  $0b, $0c, $0a
  $09, $01, $0b
  $0a, $0c, $07
  $12, $01, $01
  $0a, $07, $00
  $0c, $0c, $08
  $11, $04, $0d
  $0a, $0c, $0c
  $11, $04, $0a
  $0b, $0c, $09
  $12, $04, $09
  $04, $01, $09
  $1c, $0f, $07
  $13, $04, $08
  $14, $04, $07
  $14, $04, $07
  $0c, $0c, $06
  $14, $04, $06
  $0c, $0c, $05
  $09, $01, $06
  $02, $07, $08
  $09, $07, $04
  $02, $06, $02
  $00,$00,$00
end

 data sfx_yeah
  $10,$10,$00 ; version, priority, frames per chunk
  $15, $0c, $03 ; first chunk of freq,channel,volume
  $12, $0c, $03
  $14, $0c, $03
  $1a, $07, $04
  $02, $06, $0a
  $1c, $04, $0e
  $18, $04, $0e
  $17, $04, $0f
  $13, $06, $0f
  $0d, $06, $0e
  $0e, $07, $0e
  $0f, $0e, $0d
  $12, $06, $0b
  $11, $07, $09
  $0e, $07, $07
  $09, $07, $02
  $02, $06, $03
  $16, $0c, $03
  $17, $0c, $03
  $15, $0c, $02
  $17, $0c, $02
  $18, $0c, $01
  $18, $0c, $01
 $00,$00,$00
end

 data sfx_arfarf
 $10,$10,$00 ; version, priority, frames per chunk
  $0d, $0c, $01 ; first chunk of freq,channel,volume
  $0c, $0c, $07
  $12, $04, $0d
  $08, $07, $0c
  $1b, $04, $0c
  $1b, $04, $0d
  $19, $04, $0f
  $12, $04, $0d
  $12, $04, $0e
  $12, $04, $0e
  $07, $01, $0d
  $0a, $0c, $0d
  $1f, $04, $02
  $09, $01, $00
  $0b, $0c, $03
  $0b, $0c, $09
  $12, $0f, $0d
  $0f, $04, $0d
  $1c, $04, $0c
  $1b, $04, $0d
  $1a, $04, $0e
  $19, $04, $0d
  $19, $04, $0e
  $06, $01, $0d
  $01, $06, $0d
  $0a, $0c, $0d
  $00,$00,$00
end


 data sfx_activate
 $10,$10,$00 ; version, priority, frames per chunk
  $0b, $07, $01  ; first chunk of freq,channel,volume
  $1f, $07, $06
  $13, $0c, $07
  $15, $04, $0d
  $1c, $04, $0e
  $16, $04, $0d
  $0d, $0c, $0d
  $12, $0c, $0b
  $14, $04, $0d
  $1f, $04, $0f
  $1b, $04, $0d
  $1b, $04, $0d
  $1b, $04, $06
  $15, $0c, $05
  $1e, $07, $07
  $0e, $07, $0d
  $01, $06, $0e
  $13, $04, $0d
  $1e, $07, $0d
  $10, $0c, $0b
  $14, $04, $0d
  $0b, $0c, $0e
  $1b, $04, $0d
  $1a, $04, $0c
  $12, $0f, $05
 $00,$00,$00
end

 data sfx_hahaha2
 $10,$10,$01 ; version, priority, frames per chunk
 $14,$0f,$00 ; first chunk of freq,channel,volume
 $06,$07,$02
 $0a,$04,$0e
 $0b,$04,$0f
 $00,$06,$0f
 $0b,$04,$07
 $10,$04,$04
 $0d,$04,$02
 $10,$04,$02
 $10,$04,$0f
 $0f,$04,$0f
 $0d,$04,$07
 $00,$06,$02
 $10,$04,$04
 $00,$06,$02
 $00,$06,$0f
 $00,$06,$0f
 $00,$06,$0f
 $10,$04,$09
 $0c,$04,$08
 $00,$06,$07
 $11,$04,$06
 $10,$04,$05
 $00,$06,$04
 $10,$04,$03
 $00,$06,$02
 $0b,$04,$01
 $00,$00,$00
end

 data sfx_wilhelm
 $10,$10,$00 ; version, priority, frames per chunk
 $1d,$07,$02 ; first chunk of freq,channel,volume
 $05,$06,$0c
 $07,$07,$0f
 $17,$06,$0f
 $08,$07,$0f
 $07,$06,$0f
 $00,$06,$0f
 $02,$07,$0f
 $06,$07,$0f
 $0b,$04,$0f
 $17,$06,$0f
 $0e,$01,$0f
 $07,$07,$0f
 $0d,$06,$0f
 $0c,$07,$0f
 $07,$07,$0f
 $03,$07,$0f
 $0a,$04,$0f
 $0a,$01,$0f
 $05,$07,$0f
 $0a,$04,$0f
 $0c,$06,$0f
 $0a,$04,$0f
 $0a,$04,$0f
 $09,$01,$0f
 $0a,$04,$0f
 $1b,$06,$0f
 $0a,$04,$0f
 $0a,$01,$0f
 $0a,$04,$0f
 $0a,$04,$0f
 $13,$0f,$0f
 $00,$06,$0f
 $0a,$04,$0f
 $10,$01,$0f
 $13,$04,$0f
 $08,$07,$0f
 $09,$01,$0f
 $18,$01,$0f
 $0a,$04,$0f
 $15,$04,$0f
 $13,$04,$0f
 $15,$04,$0f
 $15,$04,$0f
 $15,$04,$0f
 $15,$04,$0f
 $16,$04,$0f
 $17,$04,$0f
 $0e,$01,$0f
 $19,$04,$09
 $0a,$07,$07
 $15,$04,$07
 $00,$06,$04
 $13,$04,$09
 $12,$04,$0c
 $12,$04,$04
 $16,$04,$04
 $08,$07,$04
 $07,$07,$04
 $08,$07,$04
 $1b,$0f,$02
 $13,$04,$02
 $09,$07,$02
 $0b,$07,$02
 $00,$00,$00
end

 data sfx_poof1
 $10,$10,$00 ; version, priority, frames per chunk
 $07,$08,$04 ; first chunk of freq,channel,volume
 $07,$08,$06
 $07,$08,$08
 $09,$08,$08
 $0c,$08,$0a
 $09,$08,$0a
 $0c,$08,$0a
 $09,$08,$0a
 $0d,$08,$08
 $0e,$08,$06
 $09,$08,$04
 $09,$08,$02
 $00,$00,$00
end

 data sfx_poof2
 $10,$10,$00 ; version, priority, frames per chunk
 $0a,$08,$04 ; first chunk of freq,channel,volume
 $12,$08,$06
 $09,$08,$08
 $11,$08,$08
 $08,$08,$0a
 $10,$08,$0a
 $07,$08,$0a
 $0F,$08,$0a
 $06,$08,$08
 $0E,$08,$06
 $05,$08,$04
 $0D,$08,$02
 $00,$00,$00
end

 data sfx_dragit
 $10,$10,$00 ; version, priority, frames per chunk
 $1c,$07,$02 ; first chunk of freq,channel,volume
 $02,$07,$06
 $1e,$08,$09
 $11,$08,$09
 $1e,$08,$09
 $11,$07,$06
 $1e,$08,$09
 $11,$07,$06
 $0e,$07,$03
 $06,$07,$02
 $00,$00,$00
end

 data sfx_roarcheep
 $10,$10,$00 ; version, priority, frames per chunk
 $0a,$06,$00 ; first chunk of freq,channel,volume
 $0e,$0f,$01
 $12,$0e,$09
 $0a,$0e,$07
 $0a,$0f,$0e
 $1b,$07,$0f
 $1b,$06,$0c
 $13,$0f,$0e
 $15,$0f,$0d
 $0f,$0e,$0f
 $19,$0f,$0f
 $0d,$0f,$07
 $0e,$0e,$08
 $0f,$0f,$08
 $0a,$01,$09
 $0d,$0e,$0b
 $19,$07,$0c
 $10,$0f,$0f
 $16,$07,$0f
 $10,$04,$0f
 $17,$04,$0f
 $15,$04,$0e
 $1b,$07,$0f
 $1f,$06,$0c
 $12,$0f,$0b
 $1a,$06,$04
 $1f,$01,$04
 $0a,$0e,$09
 $0f,$0e,$0b
 $0f,$0e,$07
 $0f,$0e,$06
 $0f,$0e,$05
 $0f,$0e,$03
 $0f,$0e,$01
 $00,$00,$00
end

 data sfx_roarroar
 $10,$10,$00 ; version, priority, frames per chunk
 $1d,$0f,$00 ; first chunk of freq,channel,volume
 $07,$06,$03
 $13,$0f,$06
 $05,$06,$09
 $1e,$0c,$0c
 $06,$06,$0f
 $1e,$0c,$0f
 $1e,$0c,$0f
 $05,$06,$0f
 $1e,$0c,$0f
 $1f,$0c,$0f
 $1f,$0c,$0f
 $1f,$0c,$0f
 $0f,$0f,$0f
 $05,$06,$0f
 $1e,$0c,$0f
 $1a,$07,$0f
 $05,$06,$0f
 $17,$0c,$0f
 $0a,$0f,$0f
 $18,$0c,$0f
 $18,$0c,$0f
 $05,$06,$0f
 $08,$06,$0f
 $04,$06,$0f
 $05,$06,$0c
 $1d,$0c,$06
 $05,$06,$03
 $17,$0c,$03
 $17,$0c,$03
 $17,$0c,$03
 $1c,$0c,$02
 $1c,$0c,$02
 $17,$0c,$02
 $06,$06,$01
 $0c,$0f,$01
 $00,$00,$00
end

 data sfx_deeproar
 $10,$10,$00 ; version, priority, frames per chunk
 $0f,$06,$02 ; first chunk of freq,channel,volume
 $0b,$06,$0a
 $1f,$06,$0f
 $14,$0f,$0f
 $0c,$06,$0f
 $13,$06,$0f
 $0d,$06,$0f
 $17,$06,$0f
 $16,$06,$0f
 $17,$06,$0f
 $14,$0f,$0f
 $13,$06,$0f
 $16,$06,$0f
 $13,$0f,$0f
 $16,$06,$0f
 $13,$06,$0f
 $17,$06,$0f
 $13,$0f,$0f
 $13,$06,$0f
 $13,$06,$0f
 $14,$0f,$0f
 $16,$06,$0f
 $0d,$06,$0f
 $17,$06,$0f
 $13,$0f,$0f
 $13,$06,$0f
 $13,$06,$0f
 $14,$0f,$0f
 $17,$06,$0f
 $0d,$06,$0f
 $14,$0f,$0f
 $14,$0f,$0f
 $0d,$06,$0f
 $17,$06,$0f
 $14,$0f,$0f
 $13,$06,$0f
 $13,$06,$0f
 $0d,$06,$0f
 $17,$06,$0f
 $17,$06,$0f
 $13,$0f,$0c
 $14,$0f,$0a
 $14,$0f,$0a
 $17,$06,$0a
 $17,$06,$0a
 $13,$0f,$0a
 $0d,$06,$07
 $13,$06,$07
 $17,$06,$07
 $13,$06,$07
 $13,$06,$07
 $0d,$06,$07
 $0d,$06,$05
 $17,$06,$05
 $17,$06,$02
 $0d,$06,$02
 $0d,$06,$02
 $0d,$06,$02
 $1c,$0f,$02
 $1d,$0f,$02
 $0d,$06,$02
 $0d,$06,$02
 $0c,$06,$02
 $0d,$06,$02
 $1b,$0f,$02
 $17,$06,$02
 $0d,$06,$02
 $13,$0f,$02
 $13,$0f,$02
 $0c,$06,$02
 $00,$00,$00
end

 data sfx_echobang
 $10,$10,$00 ; version, priority, frames per chunk
 $19,$07,$0f ; first chunk of freq,channel,volume
 $13,$07,$0f
 $1a,$06,$0f
 $1a,$01,$0f
 $17,$07,$0f
 $10,$0c,$0f
 $14,$07,$0f
 $04,$07,$0f
 $0e,$07,$0f
 $1b,$01,$0f
 $1b,$01,$0f
 $1e,$07,$0f
 $12,$07,$0f
 $09,$06,$0f
 $17,$0f,$0f
 $11,$06,$0f
 $09,$07,$0b
 $09,$07,$0e
 $0b,$0f,$0b
 $0e,$0f,$0c
 $1a,$07,$09
 $13,$0f,$09
 $14,$0f,$0b
 $0c,$0e,$07
 $18,$07,$07
 $19,$07,$07
 $0b,$0f,$06
 $1a,$07,$07
 $1a,$07,$03
 $1f,$07,$03
 $18,$06,$06
 $17,$06,$04
 $14,$06,$04
 $15,$07,$01
 $00,$00,$00
end

 data sfx_tom
 $10,$10,$00 ; version, priority, frames per chunk
 $19,$06,$04 ; first chunk of freq,channel,volume
 $0b,$0e,$04
 $1a,$06,$08
 $18,$0f,$0f
 $15,$0f,$0f
 $1e,$0c,$0f
 $1e,$0c,$0f
 $1e,$0c,$0f
 $10,$0f,$0f
 $12,$0f,$0f
 $1e,$0c,$0c
 $1e,$0c,$08
 $1e,$0c,$08
 $1e,$0c,$04
 $1e,$0c,$04
 $06,$06,$04
 $00,$00,$00
end


 data sfx_clopclop
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$04,$08 ; first chunk of freq,channel,volume
 $1c,$04,$0b
 $15,$04,$0d
 $1a,$0c,$0d
 $17,$0c,$0d
 $1c,$04,$0d
 $16,$04,$0d
 $10,$04,$0d
 $17,$0c,$0d
 $10,$0c,$0d
 $10,$0c,$02
 $13,$04,$0d
 $04,$06,$0d
 $17,$0c,$0d
 $1c,$04,$0c
 $17,$04,$0c
 $10,$04,$0d
 $16,$0c,$0d
 $10,$0c,$0b
 $0b,$0c,$02
 $00,$00,$00
end

 data sfx_museboom
 $10,$10,$00 ; version, priority, frames per chunk
 $15,$04,$0b ; first chunk of freq,channel,volume
 $12,$0c,$0b
 $1e,$04,$0d
 $16,$04,$0b
 $04,$06,$0c
 $1c,$0c,$0d
 $0a,$0c,$0b
 $15,$04,$0c
 $1a,$0c,$0a
 $0c,$0c,$0d
 $13,$0c,$0a
 $15,$04,$0a
 $1a,$0c,$0a
 $05,$06,$09
 $0b,$0c,$09
 $16,$04,$0d
 $13,$0c,$08
 $13,$0c,$0d
 $0b,$0c,$0d
 $06,$06,$0b
 $1d,$0c,$09
 $10,$0c,$0b
 $1e,$04,$0c
 $05,$06,$0a
 $05,$06,$0b
 $0b,$0c,$0a
 $1c,$04,$0d
 $05,$06,$0b
 $18,$0c,$0c
 $0c,$0c,$0c
 $1b,$07,$0d
 $15,$0c,$0d
 $14,$0c,$0b
 $0b,$0c,$0d
 $1e,$0c,$0b
 $1b,$0c,$0c
 $0b,$0c,$0c
 $0d,$0c,$0d
 $1a,$0c,$09
 $15,$0c,$09
 $0a,$0c,$0a
 $06,$06,$07
 $17,$0c,$09
 $10,$0c,$08
 $1b,$0c,$07
 $06,$06,$06
 $17,$0c,$07
 $0c,$0c,$07
 $06,$06,$07
 $0e,$0f,$07
 $14,$0c,$07
 $10,$0c,$04
 $1a,$0c,$05
 $12,$0c,$04
 $1c,$0c,$03
 $14,$0c,$03
 $1e,$0c,$03
 $1d,$07,$02
 $08,$06,$01
 $16,$0c,$01
 $15,$0c,$01
 $00,$00,$00
end

 data sfx_bigboom
 $10,$10,$00 ; version, priority, frames per chunk
 $1d,$07,$0f ; first chunk of freq,channel,volume
 $1e,$06,$0f
 $00,$06,$0f
 $14,$07,$0f
 $13,$0f,$0f
 $1b,$07,$0f
 $0e,$07,$0f
 $1b,$07,$0f
 $0f,$07,$0f
 $10,$07,$0f
 $10,$06,$0f
 $16,$07,$0f
 $0d,$0f,$0f
 $1e,$0c,$0f
 $16,$01,$0f
 $17,$01,$0f
 $10,$07,$0f
 $10,$0f,$0f
 $15,$07,$0d
 $1a,$07,$0f
 $1a,$01,$0f
 $1a,$07,$0f
 $14,$0f,$0f
 $16,$07,$0f
 $16,$07,$0f
 $15,$07,$0f
 $17,$07,$0f
 $13,$0f,$0f
 $13,$0f,$0f
 $19,$0f,$0f
 $18,$07,$0c
 $0b,$06,$0c
 $1e,$01,$0d
 $10,$01,$0d
 $14,$07,$0f
 $16,$06,$0c
 $17,$07,$0c
 $1a,$01,$0c
 $12,$06,$0d
 $17,$07,$0c
 $0b,$0f,$0c
 $19,$07,$09
 $19,$07,$0b
 $0b,$0f,$09
 $0d,$0e,$0b
 $0d,$0e,$0b
 $19,$0f,$09
 $0e,$0f,$06
 $1b,$0c,$08
 $18,$0f,$08
 $13,$07,$05
 $1a,$01,$05
 $17,$0f,$08
 $16,$06,$08
 $0c,$06,$05
 $1c,$0f,$06
 $16,$06,$08
 $0b,$06,$06
 $12,$06,$04
 $0f,$0f,$05
 $11,$07,$06
 $09,$06,$05
 $10,$06,$05
 $10,$06,$05
 $10,$06,$05
 $11,$0f,$04
 $15,$0f,$04
 $1e,$07,$05
 $16,$01,$04
 $16,$01,$04
 $1a,$0f,$04
 $19,$0f,$02
 $1e,$0f,$02
 $1b,$0f,$02
 $1e,$0f,$02
 $1c,$0f,$02
 $0d,$0f,$01
 $0f,$06,$02
 $0e,$06,$01
 $18,$0f,$01
 $0b,$06,$02
 $16,$0f,$01
 $17,$0f,$01
 $13,$06,$01
 $0f,$0e,$01
 $00,$00,$00
end

 data sfx_thud
 $10,$10,$00 ; version, priority, frames per chunk
 $1e,$07,$0f ; first chunk of freq,channel,volume
 $1e,$07,$0e
 $12,$0f,$0e
 $1f,$07,$0e
 $1f,$0f,$0c
 $0f,$0f,$09
 $0e,$0f,$07
 $11,$0f,$07
 $10,$0f,$04
 $11,$0e,$04
 $0c,$0e,$02
 $00,$00,$00
end

 data sfx_bump
 $10,$10,$00 ; version, priority, frames per chunk
 $0b,$0f,$00 ; first chunk of freq,channel,volume
 $0c,$06,$0b
 $0a,$06,$0f
 $0b,$06,$0f
 $0a,$06,$0e
 $15,$0f,$0d
 $0e,$06,$0c
 $0d,$06,$0b
 $19,$0f,$0a
 $16,$0f,$09
 $19,$0f,$08
 $10,$06,$07
 $0d,$0c,$06
 $19,$0c,$05
 $1c,$0c,$04
 $1e,$0c,$03
 $06,$06,$02
 $06,$06,$01
 $00,$00,$00
end

 data sfx_shouty
 $10,$10,$00 ; version, priority, frames per chunk
 $19,$04,$01 ; first chunk of freq,channel,volume
 $19,$04,$04
 $12,$04,$09
 $12,$04,$09
 $12,$04,$09
 $11,$04,$07
 $11,$04,$07
 $12,$04,$08
 $12,$04,$08
 $12,$04,$07
 $12,$04,$07
 $12,$04,$0b
 $0f,$04,$09
 $0f,$04,$09
 $0f,$04,$09
 $0f,$04,$09
 $12,$04,$08
 $11,$04,$0b
 $0f,$04,$0b
 $11,$04,$0d
 $11,$04,$0e
 $11,$04,$0e
 $12,$04,$0d
 $11,$04,$0f
 $11,$04,$0f
 $11,$04,$0f
 $11,$04,$0f
 $11,$04,$0c
 $11,$04,$0b
 $11,$04,$0b
 $12,$04,$0b
 $11,$04,$0a
 $11,$04,$0b
 $12,$04,$0b
 $12,$04,$0d
 $12,$04,$0d
 $0f,$04,$0a
 $12,$04,$0a
 $12,$04,$07
 $15,$04,$06
 $15,$04,$06
 $19,$04,$04
 $1b,$04,$02
 $01,$06,$01
 $0d,$06,$01
 $00,$00,$00
end

 data sfx_quack
 $10, $10, $00
 $15, $06, $08
 $15, $06, $09
 $15, $06, $0A
 $14, $06, $0B
 $14, $06, $0C
 $14, $06, $0D
 $14, $06, $0E
 $13, $06, $0F
 $13, $06, $0F
 $13, $06, $0F
 $13, $06, $0F
 $13, $06, $0F
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
 'transporter     '
 'twinkle         '
 'electro switch  '
 'nono bounce     '
 '70s tv computer '
 'alien life      '
 'chirp           '
 'plonk           '
 'spawn           '
 'maser           '
 'rubber mallet   '
 'alien kitty     '
 'electro punch   '
 'drip            '
 'ribbit          '
 'wolf whistle    '
 'cab whistle     '
 'jumpo           '
 'pulse cannon    '
 'spring          '
 'buzz bomb       '
 'bass bump       '
 'hop hop         '
 'distressed      '
 'ouch            '
 'laser recoil    '
 'electrosplosion '
 'hop hip         '
 'hop hip quick   '
 'bass bump 2     '
 'pickup prize    '
 'distressed 2    '
 'pew pew         '
 'denied          '
 'teleported      '
 'alien klaxon    '
 'crystal chimes  '
 'one up          '
 'baby wah        '
 'got the coin    '
 'baby ribbit     '
 'squeek          '
 'whoa            '
 'got the ring    '
 'yahoo           '
 'war cry         '
 'down the pipe   '
 'power up        '
 'falling         '
 'eek             '
 'uh oh           '
 'another up      '
 'bubble up       '
 'jump 1          '
 'plain laser     '
 'alien coo       '
 'simple buzz     '
 'jump 2          '
 'jump 3          '
 'dunno           '
 'snore           '
 'uncovered       '
 'door pound      '
 'distressed 3    '
 'eek 2           '
 'rubber hammer   '
 'alien buzz      '
 'anotherjumpman  '
 'anotherjump dies'
 'long gong silver'
 'strum           '
 'dropped         '
 'alien aggressor '
 'electro switch 2'
 'good item       '
 'baby ribbit hop '
 'distressed 4    '
 'ha ha ha        '
 'yeah            '
 'arf arf         '
 'activate        '
 'ha ha ha 2      '
 'wilhelm         '
 'poof1           '
 'poof2           '
 'dragit          '
 'roarcheep       '
 'roarroar        '
 'deeproar        '
 'echobang        '
 'tom             '
 'clopclop        '
 'museboom        '
 'bigboom         '
 'thud            '
 'bump            '
 'shouty          '
 'quack           '
end
