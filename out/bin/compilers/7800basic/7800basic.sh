#!/bin/sh

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
  
echo "Starting build of $1"
 #7800preprocess$EXT<"$1" | valgrind --tool=memcheck --leak-check=yes 7800basic$EXT -i "$bas7800dir" 
 7800preprocess$EXT<"$1" | 7800basic$EXT -i "$bas7800dir" 

if [ "$?" -ne "0" ]
 then
  echo "Compilation failed."
  exit
fi
if [ "$2" = "-O" ]
  then
   7800postprocess$EXT -i "$bas7800dir" | 7800optimize$EXT > "$1.asm"
  else
   7800postprocess$EXT -i "$bas7800dir" > "$1.asm"
fi

dasm$DASMEXT $1.asm -I"$bas7800dir/includes" -f3 -l"$1.list.txt" -s"$1.symbol.txt" -o"$1.bin" | 7800filter$EXT 
7800sign$EXT -w "$1.bin"
7800header$EXT -o -f a78info.cfg "$1.bin"
7800makecc2$EXT "$1.bin"
	
exit 0
