#!/bin/sh
rm -f sizes.ref.new
for BAS in */*.bas ; do
  BDIR=$(dirname "$BAS")
  cd "$BDIR"
  make clean
  make
  cd ..
  if [ -r "$BAS.a78" ] ; then 
      SIZE=$(du -sb "$BAS.a78" | awk '{print $1}')
      NAME=$(basename $BAS | cut -d. -f1)
      echo "$NAME $SIZE" >> sizes.ref.new
  fi
  cd "$BDIR"
  make clean
  cd ..
done
echo -n "all: " > makefile.new
for SAMPLE in $(cat sizes.ref.new | awk '{print $1}') ; do
  echo -n "$SAMPLE/$SAMPLE.bas.a78 " >> makefile.new
done
echo >> makefile.new
echo >> makefile.new
echo 'test:' >> makefile.new
echo '\t./make_test.sh' >> makefile.new
echo >> makefile.new
for SAMPLE in $(cat sizes.ref.new | awk '{print $1}') ; do
  echo "$SAMPLE/$SAMPLE.bas.a78:" >> makefile.new
  echo '\t'"cd $SAMPLE ; 7800basic.sh $SAMPLE.bas" >> makefile.new
  echo >> makefile.new
done
echo >> makefile.new
echo 'clean:' >> makefile.new
echo '\trm -fr */*.bas.* */*.list.txt */*.symbol.txt */banksetrom.asm */7800.asm */7800basic_variable_redefs.h */a78info.cfg */includes.7800 */cfg */banksetrom.bin */message.log' >> makefile.new

mv sizes.ref.new sizes.ref
mv makefile.new makefile
