
  set doublewide on
  set tv ntsc
  displaymode 160A
  set romsize 48k

  dim xpos_player=a
  dim ypos_player=b
  dim xpos_fire=c
  dim ypos_fire=d
  dim fire_dir=e
  dim fire_debounce=f
  dim xpos_asteroid1_large=g 
  dim xpos_asteroid1_med=h
  dim xpos_asteroid2_large=i 
  dim xpos_asteroid2_med=j
  dim xpos_asteroid3_large=k 
  dim xpos_asteroid3_med=l
  dim ypos_asteroid1_large=m 
  dim ypos_asteroid1_med=n
  dim ypos_asteroid2_large=o 
  dim ypos_asteroid2_med=p
  dim ypos_asteroid3_large=q 
  dim ypos_asteroid3_med=r
  dim xpos_ufo=s
  dim ypos_ufo=t

  rem ** setup Palette 1 (Stars & Mountain)
  P1C1=$0E
  P1C2=$38
  P1C3=$Fc

  rem white color palette (Ship)
  P2C1=$0E
  P2C2=$12
  P2C3=$00

  rem Red color palette (Fireball)
  P3C1=$32
  P3C2=$36
  P3C3=$3c

  rem color palette (Asteroid)
  P4C1=$22
  P4C2=$26
  P4C3=$2c

  rem color palette (Asteroid)
  P5C1=$82
  P5C2=$86
  P5C3=$8c

  rem color palette (Asteroid)
  P6C1=$32
  P6C2=$36
  P6C3=$3c

  rem color palette (Score)
  P7C1=$FA
  P7C2=$FA
  P7C3=$FA


  incgraphic gfx/tileset_vector_b.png 
  incgraphic gfx/tileset_stars.png 
  incgraphic gfx/alphabet_8_wide.png 160A 0 2 1 3 
  incgraphic gfx/scoredigits_8_wide.png 

  newblock

  incgraphic gfx/sprite_ship.png
  incgraphic gfx/sprite_fireball.png
  incgraphic gfx/sprite_asteroid1_large.png
  incgraphic gfx/sprite_asteroid1_med.png
  incgraphic gfx/sprite_asteroid2_large.png
  incgraphic gfx/sprite_asteroid2_med.png
  incgraphic gfx/sprite_asteroid3_large.png
  incgraphic gfx/sprite_asteroid3_med.png
  incgraphic gfx/sprite_ufo.png

  incmapfile gfx/astromap.tmx

  characterset alphabet_8_wide

  rem ** activate the graphics area with our tiles...
  characterset tileset_vector_b

  xpos_player=80
  ypos_player=170

  xpos_fire=80
  ypos_fire=170

  xpos_asteroid1_large=20
  ypos_asteroid1_large=10
  xpos_asteroid2_large=80 
  ypos_asteroid2_large=20
  xpos_asteroid3_large=120 
  ypos_asteroid3_large=15

  xpos_asteroid1_med=40
  ypos_asteroid1_med=30
  xpos_asteroid2_med=110 
  ypos_asteroid2_med=35
  xpos_asteroid3_med=140 
  ypos_asteroid3_med=40

  xpos_ufo=55
  ypos_ufo=200

  fire_debounce=0
  fire_dir=0

  clearscreen

  rem ** put the background down and save the screen before the main loop. 
  rem ** this way we don't setup the background over and over again.

  plotmap astromap 1 0 0 20 12
  savescreen

  drawscreen

mainloop

  BACKGRND=$00

  restorescreen

  ypos_asteroid1_large=ypos_asteroid1_large+1
  ypos_asteroid2_large=ypos_asteroid2_large+1
  ypos_asteroid3_large=ypos_asteroid3_large+1

  ypos_asteroid3_med=ypos_asteroid3_med+2
  xpos_asteroid3_med=xpos_asteroid3_med+1

  ypos_asteroid2_med=ypos_asteroid2_med+2
  xpos_asteroid2_med=xpos_asteroid2_med-1

  ypos_asteroid1_med=ypos_asteroid1_med+1

  ypos_ufo=ypos_ufo+1

  rem if you're not pressing the fire button, reset the bullet.
  if !joy0fire then xpos_fire=200:fire_debounce=0:goto skipstartfire

  if fire_debounce=1 then goto skipstartfire
  rem set direction for firing
  fire_dir=0
  if joy0fire then fire_dir=1
  if joy0down then fire_dir=2
  if joy0left then fire_dir=3
  if joy0right then fire_dir=4
  if fire_dir=0 then fire_debounce=0 else fire_debounce=1:xpos_fire=xpos_player+4:ypos_fire=ypos_player+4
skipstartfire

  if joy0fire then fire_dir=1

  rem plot the bullet sprite first.  It resets underneath the player character when not firing.
  plotsprite sprite_fireball 3 xpos_fire ypos_fire

  rem plot the player sprite
  plotsprite sprite_ship 2 xpos_player ypos_player

  rem plot the asteroids
  plotsprite sprite_asteroid1_large 4 xpos_asteroid1_large ypos_asteroid1_large
  plotsprite sprite_asteroid1_med 5 xpos_asteroid1_med ypos_asteroid1_med
  plotsprite sprite_asteroid2_large 6 xpos_asteroid2_large ypos_asteroid2_large
  plotsprite sprite_asteroid2_med 4 xpos_asteroid2_med ypos_asteroid2_med
  plotsprite sprite_asteroid3_large 5 xpos_asteroid3_large ypos_asteroid3_large
  plotsprite sprite_asteroid3_med 6 xpos_asteroid3_med ypos_asteroid3_med

  rem plot the ufo
  plotsprite sprite_ufo 3 xpos_ufo ypos_ufo

  if joy0left  then xpos_player=xpos_player-1
  if joy0right then xpos_player=xpos_player+1
 
  rem fire 
  if fire_dir=1 then ypos_fire=ypos_fire-5

  if boxcollision(xpos_fire,ypos_fire, 5,5, xpos_asteroid1_large,ypos_asteroid1_large, 16,16) then ypos_asteroid1_large=200:score0=score0+10
  if boxcollision(xpos_fire,ypos_fire, 5,5, xpos_asteroid2_large,ypos_asteroid2_large, 16,16) then ypos_asteroid2_large=200:score0=score0+10
  if boxcollision(xpos_fire,ypos_fire, 5,5, xpos_asteroid3_large,ypos_asteroid3_large, 16,16) then ypos_asteroid3_large=200:score0=score0+10

  if boxcollision(xpos_fire,ypos_fire, 5,5, xpos_asteroid1_med,ypos_asteroid1_med, 8,8) then ypos_asteroid1_med=200:score0=score0+10
  if boxcollision(xpos_fire,ypos_fire, 5,5, xpos_asteroid2_med,ypos_asteroid2_med, 8,8) then ypos_asteroid2_med=200:score0=score0+10
  if boxcollision(xpos_fire,ypos_fire, 5,5, xpos_asteroid3_med,ypos_asteroid3_med, 8,8) then ypos_asteroid3_med=200:score0=score0+10

  if boxcollision(xpos_fire,ypos_fire, 5,5, xpos_ufo,ypos_ufo, 14,14) then ypos_ufo=200:score0=score0+10

  plotvalue scoredigits_8_wide 7 score0 6 5 0

  drawscreen

  goto mainloop
