## VSYNC - $00 - (write)

**Vertical Sync Set/Clear**

Controls vertical sync time by writing data bit 1 into the VSYNC latch.

- bit 0: 
- bit 1: 0=Stop VSYNC, 1=Start VSYNC
- bit 2..7:



## VBLANK - $01 - (write)

**Vertical Blank Set/Clear**

Controls vertical blank and the latches and dumping transistors on the input ports by writing into bits D7, D6 and D1 of the VBLANK register.

- bit 0:
- bit 1: 0=Stop VBLANK, 1=Start VBLANK
- bit 2..5:
- bit 6: 
    - 0=Disable INPT4, INPT5 latches
    - 1=Enable INPT4, INPT5 latches
- bit 7: 
    - 0=Remove INPT0,1,2,3 dump path to ground
    - 1=Dump INPT0,1,2,3 to ground

Note - Disable latches (bit6=0) also resets latches to logic true



## WSYNC - $02 - (write)

**Wait for Horizontal Blank**

Halts microprocessor by clearing RDY latch to zero. RDY is set true again by the leading edge of horizontal blank.

- bit 0..7:



## RSYNC - $03 - (write)

**Reset Horizontal Sync Counter**

Resets the horizontal sync counter to define the beginning of horizontal blank time, and is used in chip testing.

- bit 0..7:



## NUSIZ0 - $04 - (write)

**Number/Size player/missile 0**

Controls the number and size of players and missiles.

- bit0..2:     
    - bit0=0 bit1=0 bit2=0 - One copy
    - bit0=1 bit1=0 bit2=0 - Two copies - close
    - bit0=0 bit1=1 bit2=0 - Two copies - medium
    - bit0=1 bit1=1 bit2=0 - Three copies - close
    - bit0=0 bit1=0 bit2=1 - Two copies - wide
    - bit0=1 bit1=0 bit2=1 - Double size player
    - bit0=0 bit1=1 bit2=1 - Three copies medium
    - bit0=1 bit1=1 bit2=1 - Quad sized player
- bit3:
- bit4..5: MISSILE SIZE  
    - bit4=0 bit5=0 - 1 clock
    - bit4=1 bit5=0 - 2 clocks
    - bit4=0 bit5=1 - 4 clocks 
    - bit4=1 bit5=1 - 8 clocks
- bit6:
- bit7:


## NUSIZ1 - $05 - (write)

**Number/Size player/missile 1**

Controls the number and size of players and missiles.

- bit0..2:     
    - bit0=0 bit1=0 bit2=0 - One copy
    - bit0=1 bit1=0 bit2=0 - Two copies - close
    - bit0=0 bit1=1 bit2=0 - Two copies - medium
    - bit0=1 bit1=1 bit2=0 - Three copies - close
    - bit0=0 bit1=0 bit2=1 - Two copies - wide
    - bit0=1 bit1=0 bit2=1 - Double size player
    - bit0=0 bit1=1 bit2=1 - Three copies medium
    - bit0=1 bit1=1 bit2=1 - Quad sized player
- bit3:
- bit4..5: MISSILE SIZE  
    - bit4=0 bit5=0 - 1 clock
    - bit4=1 bit5=0 - 2 clocks
    - bit4=0 bit5=1 - 4 clocks 
    - bit4=1 bit5=1 - 8 clocks
- bit6:
- bit7:



## COLUP0 - $06 - (write)

**Color-Luminance Player0 and Missile 0**

- bit 0:
- bit 1..7: Color value



## COLUP1 - $07 - (write)

**Color-Luminance Player 1 and Missile 1**

- bit 0:
- bit 1..7: Color value



## COLUPF - $08 - (write)

**Color-Luminance Playfield and Ball**

- bit 0:
- bit 1..7: Color value



## COLUBK - $09 - (write)

**Color-Luminance Background**

- bit 0:
- bit 1..7: Color value



## CTRLPF - $0A - (write)

**Control Playfield, Ball, Collisions**

This address is used to write into the playfield control register (a logic 1 causes action as described below)

- bit0: REF (reflect playfield)    
- bit1: SCORE (left half of playfield gets color of player 0, right half gets color of player 1)
- bit2: PFP (playfield gets priority over players so they can move behind the playfield)
- bit3:
- bit4..5: BALL SIZE  
    - bit4=0 bit5=0 - 1 clock
    - bit4=1 bit5=0 - 2 clocks
    - bit4=0 bit5=1 - 4 clocks 
    - bit4=1 bit5=1 - 8 clocks
- bit6:
- bit7:



## REFP0 - $0B - (write)

**Reflection Player 0**

Write bit3 into the 1 bit player reflect register.

- bit0..2:
- bit3: 
    * 0 - no reflect, bit7 of GRP0 on left
    * 1 - reflect, bit0 of GRP0 on left
- bit4..7:



## REFP1 - $0C - (write)

**Reflection Player 1**

Write bit3 into the 1 bit player reflect register.

- bit0..2:
- bit3: 
    * 0 - no reflect, bit7 of GRP1 on left
    * 1 - reflect, bit0 of GRP1 on left
- bit4..7:



## PF0 - $0D - (write)

**Playfield Register Byte 0**

- bit0..3:
- bit4..7: 'pixels' on screen

Order when CTRLPF.REF=0  
```
bit 4..7 7..0 0..7 4..7 7..0 0..7  
    PF0  PF1  PF2  PF0  PF1  PF2
```
Order when CTRLPF.REF=1  
```
bit 4..7 7..0 0..7 7..0 0..7 7..4  
    PF0  PF1  PF2  PF2  PF1  PF0  
```


## PF1 - $0E - (write)

**Playfield Register Byte 1**

- bit0..7: 'pixels' on screen

Order when CTRLPF.REF=0  
```
bit 4..7 7..0 0..7 4..7 7..0 0..7  
    PF0  PF1  PF2  PF0  PF1  PF2
```
Order when CTRLPF.REF=1  
```
bit 4..7 7..0 0..7 7..0 0..7 7..4  
    PF0  PF1  PF2  PF2  PF1  PF0  
```


## PF2 - $0F - (write)

**Playfield Register Byte 2**

- bit0..7: 'pixels' on screen

Order when CTRLPF.REF=0  
```
bit 4..7 7..0 0..7 4..7 7..0 0..7  
    PF0  PF1  PF2  PF0  PF1  PF2
```
Order when CTRLPF.REF=1  
```
bit 4..7 7..0 0..7 7..0 0..7 7..4  
    PF0  PF1  PF2  PF2  PF1  PF0  
```



## RESP0 - $10 - (write)

**Reset Player 0**

The player will begin its serial graphics at the time of a horizontal line at which the reset address occurs.



## RESP1 - $11 - (write)

**Reset Player 1**

The player will begin its serial graphics at the time of a horizontal line at which the reset address occurs.



## RESM0 - $12 - (write)

**Reset Missile 0**

The missile will begin its serial graphics at the time of a horizontal line at which the reset address occurs.



## RESM1 - $13 - (write)

**Reset Missile 1**

The missile will begin its serial graphics at the time of a horizontal line at which the reset address occurs.



## RESBL - $14 - (write)

**Reset Ball**

The ball will begin its serial graphics at the time of a horizontal line at which the reset address occurs.


## AUDC0 - $15 - (write)

**Audio Control 0**

Audio control registers which control the noise content and additional division of the audio output.

- bit0..3:
    - bit0=0 bit1=0 bit2=0 bit3=0 - Set to 1
    - bit0=1 bit1=0 bit2=0 bit3=0 - 4 bit poly
    - bit0=0 bit1=1 bit2=0 bit3=0 - Div 15 -> 4 bit poly
    - bit0=1 bit1=1 bit2=0 bit3=0 - 5 bit poly -> 4 bit poly
    - bit0=0 bit1=0 bit2=1 bit3=0 - Div 2 pure tone
    - bit0=1 bit1=0 bit2=1 bit3=0 - Div 2 pure tone
    - bit0=0 bit1=1 bit2=1 bit3=0 - Div 31 pure tone
    - bit0=1 bit1=1 bit2=1 bit3=0 - 5 bit poly -> div 2
    - bit0=0 bit1=0 bit2=0 bit3=1 - 9 bit poly white noise
    - bit0=1 bit1=0 bit2=0 bit3=1 - 5 bit poly
    - bit0=0 bit1=1 bit2=0 bit3=1 - div 31 : pure tone
    - bit0=1 bit1=1 bit2=0 bit3=1 - set last 4 bits to 1
    - bit0=0 bit1=0 bit2=1 bit3=1 - div 6 : pure tone
    - bit0=1 bit1=0 bit2=1 bit3=1 - div 6 : pure tone
    - bit0=0 bit1=1 bit2=1 bit3=1 - div 93 : pure tone
    - bit0=1 bit1=1 bit2=1 bit3=1 - 5 bit poly div 6
- bit4..7:



## AUDC1 - $16 - (write)

**Audio Control 0**

Audio control registers which control the noise content and additional division of the audio output.

- bit0..3:
    - bit0=0 bit1=0 bit2=0 bit3=0 - Set to 1
    - bit0=1 bit1=0 bit2=0 bit3=0 - 4 bit poly
    - bit0=0 bit1=1 bit2=0 bit3=0 - Div 15 -> 4 bit poly
    - bit0=1 bit1=1 bit2=0 bit3=0 - 5 bit poly -> 4 bit poly
    - bit0=0 bit1=0 bit2=1 bit3=0 - Div 2 pure tone
    - bit0=1 bit1=0 bit2=1 bit3=0 - Div 2 pure tone
    - bit0=0 bit1=1 bit2=1 bit3=0 - Div 31 pure tone
    - bit0=1 bit1=1 bit2=1 bit3=0 - 5 bit poly -> div 2
    - bit0=0 bit1=0 bit2=0 bit3=1 - 9 bit poly white noise
    - bit0=1 bit1=0 bit2=0 bit3=1 - 5 bit poly
    - bit0=0 bit1=1 bit2=0 bit3=1 - div 31 : pure tone
    - bit0=1 bit1=1 bit2=0 bit3=1 - set last 4 bits to 1
    - bit0=0 bit1=0 bit2=1 bit3=1 - div 6 : pure tone
    - bit0=1 bit1=0 bit2=1 bit3=1 - div 6 : pure tone
    - bit0=0 bit1=1 bit2=1 bit3=1 - div 93 : pure tone
    - bit0=1 bit1=1 bit2=1 bit3=1 - 5 bit poly div 6
- bit4..7:



## AUDF0 - $17 - (write)

**Audio Frequency 0**

The audio frequency divider register.

- bit0..4: Division factor
    - 0 - No division of the 30 KHz base frequency
    - 1 - Divide by two
    - 2 - Divide by three
    - ...
    - 31 - divide by thirtytwo
- bit5..7:



## AUDF1 - $18 - (write)

**Audio Frequency 1**

The audio frequency divider register.

- bit0..4: Division factor
    - 0 - No division of the 30 KHz base frequency
    - 1 - Divide by two
    - 2 - Divide by three
    - ...
    - 31 - divide by thirtytwo
- bit5..7:



## AUDV0 - $19 - (write)

**Audio Volume 0**

Audio volume registers which set the pull down impedance driving the audio output pads.

- bit0..3: 0=off, 1=lowest, 15=highest volume
- bit4..7:



## AUDV1 - $1A - (write)

**Audio Volume 1**

Audio volume registers which set the pull down impedance driving the audio output pads.

- bit0..3: 0=off, 1=lowest, 15=highest volume
- bit4..7:



## GRP0 - $1B - (write)

**Graphics Register Player 0**

Write data into the player 0 graphics register.

- bit0..7:  Graphics Data

Note: serial output begins with bit7, unless REFP0 is 1



## GRP1 - $1C - (write)

**Graphics Register Player 1**

Write data into the player 1 graphics register.

- bit0..7:  Graphics Data

Note: serial output begins with bit7, unless REFP1 is 1


## ENAM0 - $1D - (write)

**Graphics Enable Missile 0**

- bit0:
- bit1: Missile0 - 0=Disabled, 1=Enabled
- bit2..7:



## ENAM1 - $1E - (write)

**Graphics Enable Missile 1**

- bit0:
- bit1: Missile1 - 0=Disabled, 1=Enabled
- bit2..7:



## ENABL - $1F - (write)

**Graphics Enable Ball**

- bit0:
- bit1: Ball - 0=Disabled, 1=Enabled
- bit2..7:



## HMP0 - $20 - (write)

**Horizontal Motion Player 0**

Controls horizontal offset for Player0 in effect only when commanded to do so by the horizontal move command HMOVE.
WARNING: Should not be modified during the 24 computer cycles immediately following an HMOVE command. Unpredictable motion values may result.

- bit0..3:
- bit4..7: Offset value
    - bit7..4=0000 ($00): No offset 
    - bit7..4=0001 ($10): Left 1 clock
    - bit7..4=0010 ($20): Left 2 clock
    - bit7..4=0011 ($30): Left 3 clock
    - bit7..4=0100 ($40): Left 4 clock
    - bit7..4=0101 ($50): Left 5 clock
    - bit7..4=0110 ($60): Left 6 clock
    - bit7..4=0111 ($70): Left 7 clock
    - bit7..4=1000 ($80): Right 8 clock
    - bit7..4=1001 ($90): Right 7 clock
    - bit7..4=1010 ($A0): Right 6 clock
    - bit7..4=1011 ($B0): Right 5 clock
    - bit7..4=1100 ($C0): Right 4 clock
    - bit7..4=1101 ($D0): Right 3 clock
    - bit7..4=1110 ($E0): Right 2 clock 
    - bit7..4=1111 ($F0): Right 1 clock



## HMP1 - $21 - (write)

**Horizontal Motion Player 1**

Controls horizontal offset for Player1 in effect only when commanded to do so by the horizontal move command HMOVE.
WARNING: Should not be modified during the 24 computer cycles immediately following an HMOVE command. Unpredictable motion values may result.

- bit0..3:
- bit4..7: Offset value
    - bit7..4=0000 ($00): No offset 
    - bit7..4=0001 ($10): Left 1 clock
    - bit7..4=0010 ($20): Left 2 clock
    - bit7..4=0011 ($30): Left 3 clock
    - bit7..4=0100 ($40): Left 4 clock
    - bit7..4=0101 ($50): Left 5 clock
    - bit7..4=0110 ($60): Left 6 clock
    - bit7..4=0111 ($70): Left 7 clock
    - bit7..4=1000 ($80): Right 8 clock
    - bit7..4=1001 ($90): Right 7 clock
    - bit7..4=1010 ($A0): Right 6 clock
    - bit7..4=1011 ($B0): Right 5 clock
    - bit7..4=1100 ($C0): Right 4 clock
    - bit7..4=1101 ($D0): Right 3 clock
    - bit7..4=1110 ($E0): Right 2 clock 
    - bit7..4=1111 ($F0): Right 1 clock



## HMM0 - $22 - (write)

**Horizontal Motion Missile 0**

Controls horizontal offset for Missile0 in effect only when commanded to do so by the horizontal move command HMOVE.
WARNING: Should not be modified during the 24 computer cycles immediately following an HMOVE command. Unpredictable motion values may result.

- bit0..3:
- bit4..7: Offset value
    - bit7..4=0000 ($00): No offset 
    - bit7..4=0001 ($10): Left 1 clock
    - bit7..4=0010 ($20): Left 2 clock
    - bit7..4=0011 ($30): Left 3 clock
    - bit7..4=0100 ($40): Left 4 clock
    - bit7..4=0101 ($50): Left 5 clock
    - bit7..4=0110 ($60): Left 6 clock
    - bit7..4=0111 ($70): Left 7 clock
    - bit7..4=1000 ($80): Right 8 clock
    - bit7..4=1001 ($90): Right 7 clock
    - bit7..4=1010 ($A0): Right 6 clock
    - bit7..4=1011 ($B0): Right 5 clock
    - bit7..4=1100 ($C0): Right 4 clock
    - bit7..4=1101 ($D0): Right 3 clock
    - bit7..4=1110 ($E0): Right 2 clock 
    - bit7..4=1111 ($F0): Right 1 clock




## HMM1 - $23 - (write)

**Horizontal Motion Missile 1**

Controls horizontal offset for Missile1 in effect only when commanded to do so by the horizontal move command HMOVE.
WARNING: Should not be modified during the 24 computer cycles immediately following an HMOVE command. Unpredictable motion values may result.

- bit0..3:
- bit4..7: Offset value
    - bit7..4=0000 ($00): No offset 
    - bit7..4=0001 ($10): Left 1 clock
    - bit7..4=0010 ($20): Left 2 clock
    - bit7..4=0011 ($30): Left 3 clock
    - bit7..4=0100 ($40): Left 4 clock
    - bit7..4=0101 ($50): Left 5 clock
    - bit7..4=0110 ($60): Left 6 clock
    - bit7..4=0111 ($70): Left 7 clock
    - bit7..4=1000 ($80): Right 8 clock
    - bit7..4=1001 ($90): Right 7 clock
    - bit7..4=1010 ($A0): Right 6 clock
    - bit7..4=1011 ($B0): Right 5 clock
    - bit7..4=1100 ($C0): Right 4 clock
    - bit7..4=1101 ($D0): Right 3 clock
    - bit7..4=1110 ($E0): Right 2 clock 
    - bit7..4=1111 ($F0): Right 1 clock




## HMBL - $24 - (write)

**Horizontal Motion Ball**

Controls horizontal offset for Ball in effect only when commanded to do so by the horizontal move command HMOVE.
WARNING: Should not be modified during the 24 computer cycles immediately following an HMOVE command. Unpredictable motion values may result.

- bit0..3:
- bit4..7: Offset value
    - bit7..4=0000 ($00): No offset 
    - bit7..4=0001 ($10): Left 1 clock
    - bit7..4=0010 ($20): Left 2 clock
    - bit7..4=0011 ($30): Left 3 clock
    - bit7..4=0100 ($40): Left 4 clock
    - bit7..4=0101 ($50): Left 5 clock
    - bit7..4=0110 ($60): Left 6 clock
    - bit7..4=0111 ($70): Left 7 clock
    - bit7..4=1000 ($80): Right 8 clock
    - bit7..4=1001 ($90): Right 7 clock
    - bit7..4=1010 ($A0): Right 6 clock
    - bit7..4=1011 ($B0): Right 5 clock
    - bit7..4=1100 ($C0): Right 4 clock
    - bit7..4=1101 ($D0): Right 3 clock
    - bit7..4=1110 ($E0): Right 2 clock 
    - bit7..4=1111 ($F0): Right 1 clock




## VDELP0 - $25 - (write)

**Vertical Delay Player 0**

Write bit0 into the 1 bit vertical delay register to delay the Player0 one vertical line.

- bit0: 0=No delay, 1=Delay
- bit1..7:



## VDELP1 - $26 - (write)

**Vertical Delay Player 1**

Write bit0 into the 1 bit vertical delay register to delay the Player1 one vertical line.

- bit0: 0=No delay, 1=Delay
- bit1..7:



## VDELBL - $27 - (write)

**Vertical Delay Ball**

Write bit0 into the 1 bit vertical delay register, to delay the Ball one vertical line.

- bit0: 0=No delay, 1=Delay
- bit1..7:



## RESMP0 - $28 - (write)

**Reset Missile 0 to Player 0**

Used to reset the horizontal location of Missile0 to the center of the Player0. As long as this control bit is true (1) the missile will remain locked to the center of its player and the missile graphics will be disabled. When a zero is written into this location, the missile is enabled, and can be moved independently from the player.

- bit0:
- bit1: Missile0 -  0=Independent, 1=Locked to Player0
- bit2..7:



## RESMP1 - $29 - (write)

**Reset Missile 1 to Player 1**

Used to reset the horizontal location of Missile1 to the center of the Player1. As long as this control bit is true (1) the missile will remain locked to the center of its player and the missile graphics will be disabled. When a zero is written into this location, the missile is enabled, and can be moved independently from the player.

- bit0:
- bit1: Missile1 -  0=Independent, 1=Locked to Player1
- bit2..7:




## HMOVE - $2A - (write)

**Apply Horizontal Motion**

Causes the horizontal motion register values to be acted upon during the horizontal blank time in which it occurs. It must occur at the beginning of horiz. blank in order to allow time for generation of extra clock pulses into the horizontal position counters if motion is desired this command must immediately follow a WSYNC command in the program.



## HMCLR - $2B - (write)

**Clear Horizontal Move Registers**

Clears all horizontal motion registers to zero (no motion).

- bit0..7:



## CXCLR - $2C - (write)

**Clear Collision Latches**

Clears all collision latches to zero (no collision). 

- bit0..7:




## CXM0P - $00 (read)

**Read Collision  M0-P1  and M0-P0**

The bits are automatically latched and must be cleared using CXCLR.

- bit0..5:
- bit6: Missile0-Player0 - 0=No, 1=Collided
- bit7: Missile0-Player1 - 0=No, 1=Collided



## CXM1P - $01 (read)

**Read Collision  M1-P0 and M1-P1**

The bits are automatically latched and must be cleared using CXCLR.

- bit0..5:
- bit6: Missile1-Player1 - 0=No, 1=Collided
- bit7: Missile1-Player0 - 0=No, 1=Collided



## CXP0FB - $02 (read)

**Read Collision  P0-PF and P0- BL**

The bits are automatically latched and must be cleared using CXCLR.

- bit0..5:
- bit6: Player0- Ball - 0=No, 1=Collided
- bit7: Player0-Playfield - 0=No, 1=Collided



## CXP1FB - $03 (read)

**Read Collision  P1-PF and P1- BL**

The bits are automatically latched and must be cleared using CXCLR.

- bit0..5:
- bit6: Player1- Ball - 0=No, 1=Collided
- bit7: Player1-Playfield - 0=No, 1=Collided



## CXM0FB - $04 (read)

**Read Collision  M0-PF and M0- BL**

The bits are automatically latched and must be cleared using CXCLR.

- bit0..5:
- bit6: Missile0- Ball - 0=No, 1=Collided
- bit7: Missile0-Playfield - 0=No, 1=Collided



## CXM1FB - $05 (read)

**Read Collision  M1-PF and M1- BL**

The bits are automatically latched and must be cleared using CXCLR.

- bit0..5:
- bit6: Missile1- Ball - 0=No, 1=Collided
- bit7: Missile1-Playfield - 0=No, 1=Collided


## CXBLPF - $06 (read)

**Read Collision  BL-PF**

The bits are automatically latched and must be cleared using CXCLR.

- bit0..5:
- bit6: 
- bit7: Ball-Playfield - 0=No, 1=Collided


## CXPPMM - $07 (read)

**Read Collision  P0-P1 and M0-M1**

The bits are automatically latched and must be cleared using CXCLR.

- bit0..5:
- bit6: Missile0-Missile1 - 0=No, 1=Collided
- bit7: Player0-Player1 - 0=No, 1=Collided


## INPT0 - $08 (read)

**Read Paddle0 Pot Port**

Discharge cap by momentary writing high to bit7 of VBLANK, then measure the time until bit7 of INTP0 goes high.

- bit0..6:
- bit7: Paddle charge state: 0=Still charging, 1=Charging done



## INPT1 - $09 (read)

**Read Paddle1 Pot Port**

Discharge cap by momentary writing high to bit7 of VBLANK, then measure the time until bit7 of INTP1 goes high.

- bit0..6:
- bit7: Paddle charge state: 0=Still charging, 1=Charging done



## INPT2 - $0A (read)

**Read Paddle2 Pot Port**

Discharge cap by momentary writing high to bit7 of VBLANK, then measure the time until bit7 of INTP2 goes high.

- bit0..6:
- bit7: Paddle charge state: 0=Still charging, 1=Charging done




## INPT3 - $0B (read)

**Read Paddle3 Pot Port**

Discharge cap by momentary writing high to bit7 of VBLANK, then measure the time until bit7 of INTP3 goes high.

- bit0..6:
- bit7: Paddle charge state: 0=Still charging, 1=Charging done




## INPT4 - $0C (read)

**Read Input (joystick button) 0**

The bit0..6 might have any random value so testing the state should be done with the N-flag, not the Z-flag. Bit6 of VBLANK should be 0 in order to read the current state of the button, if set to 1 the state will be latched.

- bit0..6:
- bit7: Button state on Joystick0 - 0=Pressed, 1=Released



## INPT5 - $0D (read)

**Read Input (joystick button) 1**

The bit0..6 might have any random value so testing the state should be done with the N-flag, not the Z-flag. Bit6 of VBLANK should be 0 in order to read the current state of the button, if set to 1 the state will be latched.

- bit0..6:
- bit7: Button state on Joystick0 - 0=Pressed, 1=Released



## SWCHA - $280 (read)    

**RIOT Port A data register - Joystick**

Two joysticks or four paddles (just the switches as the paddles themselves are read at INP0 thru INPT3 of the TIA) can be read by configuring the entire port as input and reading the data at SWCHA according to the following table:

- bit0: Player1 - Joystick up 
- bit1: Player1 - Joystick down
- bit2: Player1 - Joystick left / Paddle button 3
- bit3: Player1 - Joystick right / Paddle button 2
- bit4: Player0 - Joystick up
- bit5: Player0 - Joystick down
- bit6: Player0 - Joystick left / Paddle button 1
- bit7: Player0 - Joystick right  / Paddle button 0

A "0" in a data bit indicates the joystick has been moved to close that switch. All "1's" in a player's nibble indicates that joystick is not moving.



## SWACNT - $281 (read/write)

**RIOT Port A data direction register (DDR) - Joystick**

- bit0..7: 0=input, 1=output



## SWCHB - $282 (read)

**RIOT Port B data - Console switches**

- bit0: Game reset, 0=switch pressed
- bit1: Game select, 0=switch pressed
- bit2:
- bit3: Color or B/W, 0=B/W, 1=color
- bit5..4:
- bit6: P0 difficulty,0=Amateur (B), 1=Pro (A)
- bit7: P1 difficulty, 0=Amateur (B), 1=Pro (A)


## SWBCNT - $283 (read/write)

**RIOT Port B data direction register (DDR) - Console switches**

- bit0..7: 0=input, 1=output



## INTIM - $284 (read)

**Get current timer value**

- bit0..7: Current timer value



## TIMINT - $285 (read)

**Get timer interupt flags**

- bit0..5:
- bit6: PA7 edge-detect interrupt flag
- bit7: Timer expired, 0=False, 1=True



## TIM1T - $294 - (write)

**Set timer /1 clock (838 ns) intervals**

- bit0..7: New timer value



## TIM8T - $295 - (write)

**Set timer /8 clock (6.7 us) intervals**

- bit0..7: New timer value



## TIM64T - $296 - (write)

**Set time /64 clock (53.6 us) intervals**

- bit0..7: New timer value




## T1024T - $297 - (write)

**Set timer /1024 clock (858.2 us) intervals**

- bit0..7: New timer value




## TIM1TI - $29C - (write)

**Set timer /1 clock (838 ns) intervals**

- bit0..7: New timer value




## TIM8TI - $29D - (write)

**Set timer /8 clock (6.7 us) intervals**

- bit0..7: New timer value




## TIM64TI - $29E - (write)

**Set time /64 clock (53.6 us) intervals**

- bit0..7: New timer value




## T1024TI - $29F - (write)

**Set timer /1024 clock (858.2 us) intervals**

- bit0..7: New timer value

