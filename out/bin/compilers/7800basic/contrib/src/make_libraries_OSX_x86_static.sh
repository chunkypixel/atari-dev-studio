#!/bin/sh
# rebuild zlib static library for OS X x86 32-bit

TARGETDIR="$PWD/../Darwin.x86"

rm -fr "$TARGETDIR"
mkdir "$TARGETDIR" 2>/dev/null

export CC=i686-apple-darwin10-gcc
export PATH=/usr/i686-apple-darwin10/bin:$PATH

#zlib.....................
rm -fr zlib-1.2.8
tar -xvzf zlib-1.2.8.tar.gz
cd zlib-1.2.8
export CFLAGS="-m32 -arch i386" 
./configure --static --prefix="$TARGETDIR"
make
make install
cd ..
rm -fr zlib-1.2.8

#libpng...................
rm -fr libpng-1.5.17
tar -xvzf libpng-1.5.17.tar.gz
cd libpng-1.5.17/
export LDFLAGS="-L$TARGETDIR/lib"
export CFLAGS="-m32 -I$TARGETDIR/include -arch i386"
./configure --enable-static --disable-shared  --prefix="$TARGETDIR" --host=i386-apple-darwin
make
make install
cd ..
rm -fr libpng-1.5.17
