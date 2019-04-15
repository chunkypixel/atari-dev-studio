#!/bin/sh
# rebuild zlib static library for Win32 x86

TARGETDIR="$PWD/../Win32.x86"

rm -fr "$TARGETDIR"
mkdir "$TARGETDIR" 2>/dev/null

export PATH=/usr/x86_64-w64-mingw32/bin:$PATH
export CC=i586-mingw32msvc-gcc

#zlib.....................
rm -fr zlib-1.2.8
tar -xvzf zlib-1.2.8.tar.gz
cd zlib-1.2.8
export CFLAGS=-O2
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
export CFLAGS="-I$TARGETDIR/include"
./configure --enable-static --disable-shared  --prefix="$TARGETDIR" --host=i386-mingw32msvc
make
make install
cd ..
rm -fr libpng-1.5.17
