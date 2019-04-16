
 displaymode 320A

 set tv ntsc
 set avoxvoice on


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

 clearscreen
 plotchars 'AtariVox Test' 0 0 0

 plotchars 'move joystick for speech' 0 0 1

 drawscreen

main 
 drawwait
 if joy0up    then speak   upspeech:goto debounce
 if joy0down  then speak downspeech:goto debounce
 if joy0left  then speak leftspeech:goto debounce
 if joy0right then speak rightspeech:goto debounce
 drawscreen
 goto main 

debounce
 if !joy0any then goto main
 drawscreen
 goto debounce

 speechdata upspeech
 reset
 dictionary 'game over.'
end

 speechdata downspeech
 reset
 phonetic   'may the force be with yoo.'
end

 speechdata leftspeech
 reset
 phonetic   'yooz the force, luke.'
end

 speechdata rightspeech
 reset
 phonetic 'red elf needs food, badlee'
end


