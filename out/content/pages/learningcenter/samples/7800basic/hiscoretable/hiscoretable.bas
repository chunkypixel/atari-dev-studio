
 rem ** hi score table example

 rem ** the display mode and doublewide setting has no impact on the hi-score
 rem ** tables. 
 displaymode 160A
 set doublewide on

 rem ** hssupport is a unique ID # for your game. When your game is decently
 rem ** far along, reserve a unique ID # via the AA thread...
 rem ** https://atariage.com/forums/topic/128432-high-score-cart-values/
 set hssupport $1122

 rem ** game name displayed on hi-score table
 set hsgamename 'generic game name'

 incgraphic hiscorefont.png 320A

 rem ** different score ranks...
 set hsgameranks 50000 'warrior' 40000 'peasant' 30000 'pig flogger' 10000 'slime mold' 0 'corpse'

 score0=0

mainloop
  a=a+1
  b=rand&1
  if b then score0=score0+371
  if a=0 then drawhiscores single:score0=0
  drawscreen
  goto mainloop

 inline hiscore.asm
