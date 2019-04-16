
 set pokeysupport on
 displaymode 320A

 dim notedur0=a
 dim notedur1=b
 dim notedur2=c
 dim notedur3=d

 dim noteindex0=e
 dim noteindex1=f
 dim noteindex2=g
 dim noteindex3=h

 dim notefreq0=i
 dim notefreq1=j
 dim notefreq2=k
 dim notefreq3=l

 dim notevol0=m
 dim notevol1=n
 dim notevol2=o
 dim notevol3=p

 dim frame=q

 dim pokerlo=r
 dim pokerhi=s

 incgraphic gfx/alphabet_8_wide.png 320A 
 incgraphic gfx/scoredigits_8_wide.png 320A 

 P0C2=$0F

 characterset alphabet_8_wide

 clearscreen

 plotchars mytitletext 0 0 0 15

 pokerlo=pokeybasehi
 pokerhi=pokeybaselo

 if pokeydetected then plotchars pokeyfound 0 0 2 21 else plotchars pokeynotfound 0 0 2 25

 plotchars pokeybasevalue 0 0 3 22

 plotvalue scoredigits_8_wide 0 pokerlo 4 90 3

main 

 frame=frame+1

 rem ** service the notes every 8 frames...
 if (frame&7)=0 then gosub playnotes

 drawscreen

 rem ** check if the user wants to play it again...
 if !joy0fire then skipreset
 for t=0 to 3
   notedur0[t]=0
   notefreq0[t]=0
   noteindex0[t]=0
 next
skipreset

 goto main 


playnotes
  for t = 0 to 3
  if notefreq0[t]=255 then return
  if notedur0[t]>0 then goto noteisplaying
  psound t,0,10,0
  temp2=noteindex0[t]
  if t=0 then notefreq0=noteinfo0[temp2]
  if t=1 then notefreq1=noteinfo1[temp2]
  if t=2 then notefreq2=noteinfo2[temp2]
  if t=3 then notefreq3=noteinfo3[temp2]
  noteindex0[t]=noteindex0[t]+1
  temp2=noteindex0[t]
  if t=0 then notedur0=noteinfo0[temp2]
  if t=1 then notedur1=noteinfo1[temp2]
  if t=2 then notedur2=noteinfo2[temp2]
  if t=3 then notedur3=noteinfo3[temp2]
  noteindex0[t]=noteindex0[t]+1
  notevol0[t]=15

noteisplaying
  if notevol0[t]>6 then notevol0[t]=notevol0[t]-2
  temp3=notefreq0[t]
  temp4=notevol0[t]
  if temp3>0 && temp3<255 then psound t,temp3,10,temp4
  notedur0[t]=notedur0[t]-1
  next

  return

 data noteinfo0
 40,6,     47,6,     60,6,     81,6,     72,2, 64,2, 60,2,   72,4, 60,2
 81,12,              53,6,     40,6,     47,6,               60,6,        72,2, 64,2, 60,2,      53,4, 47,2
 53,10,     47,2,    45,2,     47,2,     53,2,               40,4, 47,2,  53,2,      60,8,             52,2
 47,4, 60,2,     72,4, 60,2,        72,2, 81,8, 81,2,     60,4, 47,2,     53,4, 81,2
 60,4, 47,2,     53,2, 47,2, 45,2,      40,2, 47,2, 60,2,    53,4, 81,2,   60,12
 255,255
end
 data noteinfo1
 121,6,    121,6,    121,6,    121,6,    121,6,              121,6
 121,12,             108,6,    108,6,    96,6,               96,6,        85,6,                  85,6
 91,10,     0,2,     91,6,                                   91,6,        96,6,                  96,6,
 96,6,           121,6,             121,6,     121,6,     121,6,          128,6
 121,6,          128,6,                 121,6,               128,6,        121,12
 255,255
end
 data noteinfo2
 193,6,    193,6,    162,6,    162,6,    144,6,              144,6
 162,12,             128,6,    128,6,    121,6,              121,6,       108,6,                 108,6
 108,10,    0,2,     108,6,                                  108,6,       121,6,                 121,6,
 121,6,          144,6,             162,6,     162,6,     162,6,          162,6
 162,6,          162,6,                 162,6,               162,6,        193,12
 255,255
end
 data noteinfo3
 243,6,    243,6,    193,6,    193,6,    182,6,              182,6
 193,12,             162,6,    162,6,    162,6,              144,6,       144,6,                 144,6
 162,10,    0,2,     162,6,                                  162,6,       162,6,                 162,6,
 162,6,          182,6,             193,6,     193,6,     193,6,          182,6
 193,6,          182,6,                 193,6,               182,6,        243,12
 255,255
end

 alphadata mytitletext alphabet_8_wide
 'daisy bell test'
end
 alphadata pokeyfound alphabet_8_wide
 'pokey status... found'
end
 alphadata pokeynotfound alphabet_8_wide
 'pokey status... not found'
end
 alphadata pokeybasevalue alphabet_8_wide
 'pokey base location...'
end
