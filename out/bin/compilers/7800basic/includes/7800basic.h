 ; Provided under the CC0 license. See the included LICENSE.txt for details.

 processor 6502
 include "7800.h"
 include "7800basic_variable_redefs.h"

 ;************ 7800 overall RAM map **************

 ;         40-FF         zero page RAM
 ;        140-1FF        RAM (stack)
 ;       1800-203F       RAM
 ;       2100-213F       RAM
 ;       2200-27FF       RAM

 ;************ 7800basic RAM usage map **************

 ;         40-FF         numerous defines, listed below
 ;        140-1FF        RAM (stack)

 ;       1800-187F       DLL  (1800-18DF with page flipping enabled)
 ;       1880-1FFF       DLs  (18E0-1FFF with page flipping enabled)

 ;       2000-203F       Reserved
 ;       2100-213F       Reserved
 ;       2200-27FF       Free

eeprombuffer     = $1FE0
DLLMEM           = $1800
DBOFFSET         =   $70   ; $E0 length DL is /2 for double-buffering

 ifconst PLOTVALUEPAGE
VALBUFFER        = (PLOTVALUEPAGE*256)
 else
VALBUFFER        = $2000 ; to $203F  ** never let VALBUFFER straddle pages
 endif


pausestate     = $2100
dlzero         = $2101 ; zero to force end of $2100 DL, which we use in vblank and overscan
sINPT1         = $2102 ; save register for joy button joy0
sINPT3         = $2103 ; save register for joy button joy1
currentbank    = $2104

currentrambank = $2105
charactermode  = $2106
sCTRL          = $2107
pokeydetected  = $2108
paldetected    = $2109
avoxdetected   = $210A
sCHARBASE      = $210B ; save register for CHARBASE

hsdevice       = $210C
hsdifficulty   = $210D
hserror        = $210E
hsgameslot     = $210F
hsnewscoreline = $2110
hsnewscorerank = $2111
HSRAMTable     = $2112 ; to $212F (30 bytes) Format: III*5, SSS*5
HSRAMInitials  = $2112 ; see above
HSRAMScores    = $2121 ; see above

ssCTRL         = $2131
ssCHARBASE     = $2132
hsdisplaymode  = $2133
gamedifficulty = $2134
hsinitialpos   = $2135
hsinitialhold  = $2136
hscursorx      = $2137
hsjoydebounce  = $2138
hsswcha        = $2139
hsinpt1        = $213A
hscolorchaseindex = $213B
visibleDLLstart   = $213C
overscanDLLstart  = $213D
frameslost        = $213E


rand       = $40
rand16     = $41
temp1      = $42
temp2      = $43
temp3      = $44
temp4      = $45
temp5      = $46
temp6      = $47
temp7      = $48
temp8      = $49
temp9      = $4a

pokeybase      = $4b
pokeybaselo    = $4b
pokeybasehi    = $4c

visibleover    = $4d

sfx1pointlo  = $4e
sfx2pointlo  = $4f
sfx1pointhi  = $50
sfx2pointhi  = $51

sfx1priority = $52
sfx2priority = $53
sfx1poffset  = $54
sfx2poffset  = $55

sfx1frames   = $56
sfx2frames   = $57
sfx1tick     = $58
sfx2tick     = $59

tempmath     = $5a

pokey1pointlo  = $5b
pokey1pointhi  = $5c
pokey2pointlo  = $5d
pokey2pointhi  = $5e
pokey3pointlo  = $5f
pokey3pointhi  = $60
pokey4pointlo  = $61
pokey4pointhi  = $62

dlpnt      = $63 ; to $64
dlend      = $65 ; to $81 - for 28 possible visible dll entries
dlendsave  = $82 ; to $9e - for 28 possible visible dll entries

speech_addr    = $9f
speech_addr_hi = $a0

HSGameTableLo = $a1
HSGameTableHi = $a2
HSVoxHi       = $a3
HSVoxLo       = $a4

;channel pointers

songchannel1layer1lo    = $a5
songchannel2layer1lo    = $a6
songchannel3layer1lo    = $a7
songchannel4layer1lo    = $a8

songchannel1layer2lo    = $a9
songchannel2layer2lo    = $aA
songchannel3layer2lo    = $aB
songchannel4layer2lo    = $aC

songchannel1layer3lo    = $aD
songchannel2layer3lo    = $aE
songchannel3layer3lo    = $aF
songchannel4layer3lo    = $b0

songchannel1layer1hi    = $b1
songchannel2layer1hi    = $b2
songchannel3layer1hi    = $b3
songchannel4layer1hi    = $b4

songchannel1layer2hi    = $b5
songchannel2layer2hi    = $b6
songchannel3layer2hi    = $b7
songchannel4layer2hi    = $b8

songchannel1layer3hi    = $b9
songchannel2layer3hi    = $bA
songchannel3layer3hi    = $bB
songchannel4layer3hi    = $bC

songdatalo = $bd
songdatahi = $be

inactivechannelcount = $bf


songchannel1transpose    = $c0
songchannel2transpose    = $c1
songchannel3transpose    = $c2
songchannel4transpose    = $c3

songstackindex           = $c4

songchannel1instrumentlo = $c5
songchannel2instrumentlo = $c6
songchannel3instrumentlo = $c7
songchannel4instrumentlo = $c8

songchannel1instrumenthi = $c9
songchannel2instrumenthi = $ca
songchannel3instrumenthi = $cb
songchannel4instrumenthi = $cc

sfx1notedata  = $cd
sfx2notedata  = $ce

songloops     = $cf

songpointerlo = $D0
songpointerhi = $D1

voxlock      = $D2
voxqueuesize = $D3

vblankroutines = $D4

doublebufferstate = $D5
doublebufferdloffset = $D6
doublebufferbufferdirty = $D7

inttemp1 = $D8
inttemp2 = $D9
inttemp3 = $DA
inttemp4 = $DB
inttemp5 = $DC
inttemp6 = $DD

sfxschedulelock = $DE
sfxschedulemissed = $DF
sfxinstrumentlo = $E0
sfxinstrumenthi = $E1
sfxpitchoffset = $E2
sfxnoteindex = $E3

CTLSWAs = $E4
CTLSWBs = $E5

A = $e6
a = $e6
B = $e7
b = $e7
C = $e8
c = $e8
D = $e9
d = $e9
E = $ea
e = $ea
F = $eb
f = $eb
G = $ec
g = $ec
H = $ed
h = $ed
I = $ee
i = $ee
J = $ef
j = $ef
K = $f0
k = $f0
L = $f1
l = $f1
M = $f2
m = $f2
N = $f3
n = $f3
O = $f4
o = $f4
P = $f5
p = $f5
Q = $f6
q = $f6
R = $f7
r = $f7
S = $f8
s = $f8
T = $f9
t = $f9
U = $fa
u = $fa
V = $fb
v = $fb
W = $fc
w = $fc
X = $fd
x = $fd
Y = $fe
y = $fe
Z = $ff
z = $ff

; var0-var99 variables use the top of the stack
var0 = $140
var1 = $141
var2 = $142
var3 = $143
var4 = $144
var5 = $145
var6 = $146
var7 = $147
var8 = $148
var9 = $149
var10 = $14a
var11 = $14b
var12 = $14c
var13 = $14d
var14 = $14e
var15 = $14f
var16 = $150
var17 = $151
var18 = $152
var19 = $153
var20 = $154
var21 = $155
var22 = $156
var23 = $157
var24 = $158
var25 = $159
var26 = $15a
var27 = $15b
var28 = $15c
var29 = $15d
var30 = $15e
var31 = $15f
var32 = $160
var33 = $161
var34 = $162
var35 = $163
var36 = $164
var37 = $165
var38 = $166
var39 = $167
var40 = $168
var41 = $169
var42 = $16a
var43 = $16b
var44 = $16c
var45 = $16d
var46 = $16e
var47 = $16f
var48 = $170
var49 = $171
var50 = $172
var51 = $173
var52 = $174
var53 = $175
var54 = $176
var55 = $177
var56 = $178
var57 = $179
var58 = $17a
var59 = $17b
var60 = $17c
var61 = $17d
var62 = $17e
var63 = $17f
var64 = $180
var65 = $181
var66 = $182
var67 = $183
var68 = $184
var69 = $185
var70 = $186
var71 = $187
var72 = $188
var73 = $189
var74 = $18a
var75 = $18b
var76 = $18c
var77 = $18d
var78 = $18e
var79 = $18f
var80 = $190
var81 = $191
var82 = $192
var83 = $193
var84 = $194
var85 = $195
var86 = $196
var87 = $197
var88 = $198
var89 = $199
var90 = $19a
var91 = $19b
var92 = $19c
var93 = $19d
var94 = $19e
var95 = $19f
var96 = $1a0
var97 = $1a1
var98 = $1a2
var99 = $1a3

 SEG.U "7800basicRAM"
 ORG $1A4

 ; MAX allocation locations are in comments...
framecounter     DS 1 ; $1A4
countdownseconds DS 1 ; $1A5
score0           DS 3 ; $1A6 $1A7 $1A8
score1           DS 3 ; $1A9 $1AA $1AB
pausebuttonflag  DS 1 ; $1AC
valbufend        DS 1 ; $1AD
valbufendsave    DS 1 ; $1AE
finescrollx      DS 1 ; $1AF
finescrolly      DS 1 ; $1B0
joybuttonmode    DS 1 ; $1B1 ; track joysticks that were changed to one-button mode
interruptindex   DS 1 ; $1B2
 
 ifconst DOUBLEBUFFER
doublebufferminimumframetarget DS 1 ; $1B3
doublebufferminimumframeindex  DS 1 ; $1B4
 endif 

pausedisable     DS 1 ; $1B5
XCTRL1s          DS 1 ; $1B6

 ifconst AVOXVOICE
avoxenable       DS 1 ; $1B7
tempavox         DS 1 ; $1B8
 endif

 ifconst MUSICTRACKER
songtempo	DS 1 ; $1B9
songtick	DS 1 ; $1BA

songchannel1layer1loops DS 1 ; $1BB
songchannel2layer1loops DS 1 ; $1BC
songchannel3layer1loops DS 1 ; $1BD
songchannel4layer1loops DS 1 ; $1BE

songchannel1layer2loops DS 1 ; $1BF
songchannel2layer2loops DS 1 ; $1C0
songchannel3layer2loops DS 1 ; $1C1
songchannel4layer2loops DS 1 ; $1C2

songchannel1layer3loops DS 1 ; $1C3
songchannel2layer3loops DS 1 ; $1C4
songchannel3layer3loops DS 1 ; $1C5
songchannel4layer3loops DS 1 ; $1C6

songchannel1busywait    DS 1 ; $1C7
songchannel2busywait    DS 1 ; $1C8
songchannel3busywait    DS 1 ; $1C9
songchannel4busywait    DS 1 ; $1CA

songchannel1stackdepth  DS 1 ; $1CB
songchannel2stackdepth  DS 1 ; $1CC
songchannel3stackdepth  DS 1 ; $1CD
songchannel4stackdepth  DS 1 ; $1CE
 endif

palframes    DS 1 ; $1CF
palfastframe DS 1 ; $1D0

 ifconst MOUSESUPPORT
port0resolution DS 1 ; $1D1
port1resolution DS 1 ; $1D2
 endif

port0control DS 1 ; $1D3
port1control DS 1 ; $1D4

 ; port#control values...
 ;      1 = proline
 ;      2 = lightgun
 ;      3 = paddle
 ;      4 = trakball
 ;      5 = vcs joystick
 ;      6 = driving
 ;      7 = keypad
 ;      8 = st mouse/cx80
 ;      9 = amiga mouse
 ;     10 = atarivox

 ; controller 0 data...
paddleposition0     DS 1 ; $1D5
keypadmatrix0a      =      paddleposition0 
drivingposition0    =      paddleposition0
trakballx0          =      paddleposition0
mousex0             =      paddleposition0
lighttgunx0         =      paddleposition0

 ; controller 1 data...
paddleposition2     DS 1 ; $1D6
keypadmatrix1a      =      paddleposition2
drivingposition1    =      paddleposition2
trakballx1          =      paddleposition2
mousex1             =      paddleposition2
lightgunx1          =      paddleposition2

 ; controller 0 altdata...
paddleposition1     DS 1 ; $1D7 
keypadmatrix0b      =      paddleposition1
trakbally0          =      paddleposition1
mousey0             =      paddleposition1
lightguny0          =      paddleposition1

 ; controller 1 altdata...
paddleposition3     DS 1 ; $1D8 
keypadmatrix1b      =      paddleposition3
trakbally1          =      paddleposition3
mousey1             =      paddleposition3
lightguny1          =      paddleposition3

; controller state save. for trakball state+dir codes, rotary position codes
controller0statesave DS 1 ; $1D9
paddleprevious0      =      controller0statesave
mousecodex0          =      controller0statesave
trakballcodex0       =      controller0statesave
keypadmatrix0c       =      controller0statesave

controller1statesave DS 1 ; $1DA
paddleprevious2      =      controller1statesave
mousecodex1          =      controller1statesave
trakballcodex1       =      controller1statesave
keypadmatrix1c       =      controller1statesave

paddleprevious1      DS 1 ; $1DB
keypadmatrix0d       =      paddleprevious1
mousecodey0          =      paddleprevious1
trakballcodey0       =      paddleprevious1

paddleprevious3      DS 1 ; $1DC
keypadmatrix1d       =      paddleprevious3
mousecodey1          =      paddleprevious3
trakballcodey1       =      paddleprevious3

 ifconst pokeysupport
pokey1frames   DS 1 ; $1DD
pokey1tick     DS 1 ; $1DE
pokey2frames   DS 1 ; $1DF
pokey2tick     DS 1 ; $1E0
pokey3frames   DS 1 ; $1E1
pokey3tick     DS 1 ; $1E2
pokey4frames   DS 1 ; $1E3
pokey4tick     DS 1 ; $1E4
pokey1priority DS 1 ; $1E5
pokey1offset   DS 1 ; $1E6
pokey2priority DS 1 ; $1E7
pokey2offset   DS 1 ; $1E8
pokey3priority DS 1 ; $1E9
pokey3offset   DS 1 ; $1EA
pokey4priority DS 1 ; $1EB
pokey4offset   DS 1 ; $1EC
 endif

 ifnconst CANARRYOFF
canary         DS 1 ; $1ED
 endif

 ifnconst bankswitchmode
   echo "  stack allowance:",[($1FF - .)/2]d,"nested subroutines."
 else
   echo "  stack allowance:",[($1FF - .)/3]d,"nested subroutines."
 endif
 ifnconst CANARRYOFF
   echo "  the canary is situated at:",[canary]
 else
   echo "  the canary is disabled."
 endif

; $1EE - $1FF reserved for stack

 SEG "GAME"

