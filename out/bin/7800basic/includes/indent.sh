#!/bin/sh
# 6502/7 assembly tidying script...

if [ ! "$1" ] ; then
  echo $0 expects a 6502 assembly file as an argument.
  echo "Usage: $0 file.asm"
  echo "       will create file.asm.tidy" 
  exit 1
fi

INDENTSOURCE="                                                              "
INDENTLEVEL=1

LINE=1

IFS=""
#read in and pull off existing formatting...
cat $1 | sed 's/^;/ ;/g' | tr '\t' ' ' | tr -s ' ' | while read RASMLINE ; do
   
   echo "$RASMLINE" | cut -d ';' -f1 | grep -Ei "endif|else" >/dev/null
   if [ $? = 0 ] ; then
      #decrease indent before printing out this line
      INDENTLEVEL=$(($INDENTLEVEL-1))
   fi
   INDENTSPACES="$(echo $INDENTSOURCE | cut -c 1-$(($INDENTLEVEL*4)) )"
   if [ ! $? = 0 ] ; then
       echo "EXTRANEOUS else/endif found before line $LINE." >&2
       exit 1
   fi
   ASMLINE=$(echo $RASMLINE | sed "s/^[a-zA-Z0-9\.]* /&$INDENTSPACES/g")
   echo $ASMLINE
   echo "$RASMLINE" | cut -d ';' -f1 | grep -iv endif | grep -Ei " if |^if |#if |ifconst |ifnconst | else|^else" >/dev/null
   if [ $? = 0 ] ; then
      #increase indent after printing out this line
      INDENTLEVEL=$(($INDENTLEVEL+1))
   fi 
   LINE=$(($LINE+1))
done > $1.tidy

if [ ! $INDENTLEVEL = 1 ] ; then
	echo "Warning: there seems to be $(($INDENTLEVEL-1)) missing ENDIFs"
fi
