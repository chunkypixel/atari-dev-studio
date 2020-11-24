#!/bin/sh

# fixcase.sh - fix Windows mixed-case filenames that don't actually match the
# files, so they'll work with case-sensistive systems. 

# Call with argument being the basic file. it should figure things out from
# there. This is a bit hacky.

BASEPATH=$(grep basepath $1 | tr -dc '[:print:]' | head -n1 | awk '{print $3}')
if [ ! "$BASEPATH" ] ; then
	BASEPATH=.
fi
echo Using BASEPATH: $BASEPATH
for SFILE in $(grep 'incgraphic' "$1" | grep -v 'rem ' | grep -v '/\*' | grep -v ';' | awk '{print $2}') ; do
	BASEFILE=$(basename $SFILE)
	DIRPATH=$(dirname $SFILE)
	if [ ! "$DIRPATH" ] ; then
		DIRPATH=.
	fi
	LBASEFILE=$(echo $BASEFILE | tr '[A-Z]' '[a-z]')
	TFILE=$BASEPATH/$DIRPATH/$BASEFILE
	if [ -r "$TFILE" ] ; then
		#echo "file $TFILE exists"
		continue
	fi
	#echo $SFILE $TFILE
	TLOW=$(basename $(echo $TFILE | tr '[:upper:]' '[:lower:]'))
	echo Case-insenvisive-searching for $TFILE in dir
        FOUND=0
	for GFILE in $BASEPATH/$DIRPATH/* ; do
		GLOW=$(basename $(echo $GFILE | tr '[:upper:]' '[:lower:]')) 2>/dev/null 
		#echo "     "$GLOW" "$TLOW
		if [ "$GLOW" = "$TLOW" ] ; then
                        FOUND=1
			echo "    found"
			#echo mv "$GFILE" "$TFILE"
			mv "$GFILE" "$TFILE"
			break
		fi
	done
	if [ "$FOUND" = 0 ] ; then
		echo "    not found"
	fi
done
