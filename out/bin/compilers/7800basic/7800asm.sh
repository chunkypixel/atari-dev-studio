#!/bin/sh
# 7800asm.sh
# this script skips the basic preprocessing and creation of the assembly file
# and it just (re)assembles the 7800.asm file

# do some quick sanity checking...

if [ ! "$bas7800dir" ] ; then
  echo "### WARNING: the bas7800dir envionronment variable isn't set."
fi

OSTYPE=$(uname -s)
ARCH=$(uname -m)
for EXT in "" .$OSTYPE.x64 .$OSTYPE.x86 .$OSTYPE.$ARCH .$OSTYPE ; do
  echo | 7800preprocess$EXT 2>/dev/null >&2 && break
done

echo | 7800preprocess$EXT 2>/dev/null >&2 && break
if [ ! $? = 0 ] ; then
  echo "### ERROR: couldn't find 7800basic binaries for $OSTYPE($ARCH). Exiting."
  exit 1
fi

echo

echo Using \"$EXT\" flavored 7800basic binaries
echo "  "Location: $(which 7800preprocess$EXT | sed "s/7800preprocess$EXT//g" 2>/dev/null)
BV=$(7800basic$EXT -v 2>/dev/null)
echo "  Version: $BV" 

#do dasm separately, because it's distributed separately
for DASMEXT in "" .$OSTYPE.x64 .$OSTYPE.x86 .$OSTYPE.$ARCH .$OSTYPE ; do
  dasm$DASMEXT 2>/dev/null >&2 
  [ $? = 1 ] && break
done
dasm$DASMEXT 2>/dev/null >&2 
if [ ! $? = 1 ] ; then
  echo "### ERROR: couldn't find dasm binary for $OSTYPE($ARCH). Exiting."
  exit 1
fi

echo Using \"$DASMEXT\" flavored dasm binary.
echo "  "Location: $(which dasm$DASMEXT)

DV=$(dasm$DASMEXT 2>/dev/null | grep ^DASM | head -n1)
echo "  Version: $DV" 

if [ "$1" = "-v" ] ; then
  #this is just a version check. we already displayed the version earlier,
  #so just exit.
  exit
fi

echo
  
echo "(re)assembling $1"

dasm$DASMEXT $1 -I"$bas7800dir/includes" -f3 -l"$1.list.txt" -p20 -s"$1.symbol.txt" -o"$1.bin" | 7800filter$EXT 

exit 0
