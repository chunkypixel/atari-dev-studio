#!/bin/sh
dos2unix *.h *.c
for FILE in *.h *.c ; do
  indent -bli0 -i4 -npsl -l120 "$FILE"
  rm "$FILE~"
done
unix2dos *.h *.c
