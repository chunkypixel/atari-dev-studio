 rem ** the 7800basic Backup Demo... 

 rem ** overwrite the same backup each time we compile the project...
 set backupstyle single

 rem ** We've used a local dirctory in this example, but it's better to stick
 rem ** your game backup on a usb drive or cloud storage.
 set backupfile 'backups/backuptest'

 rem ** backup our project notes...
 backup README.TXT

 rem ** One we've used "set backupfile", gfx files are automatically backed up
 incgraphic gfx/atascii.png 320A
