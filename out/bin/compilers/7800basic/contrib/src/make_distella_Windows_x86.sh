#!/bin/sh
# /data/fun/Atari/7800basic.0.1/contrib/lib/linux
# rebuild distella for windows x86 32-bit

export PATH=/usr/x86_64-w64-mingw32/bin:$PATH
export CC=i586-mingw32msvc-gcc
export CFLAGS=' -m32'
export LDFLAGS=' -m32 -L/usr/lib32'

rm -fr distella-301b
tar -xvzf distella-301b.tgz
cd distella-301b/
make linux

cp distella ../../../distella.exe
cd ..
rm -fr distella-301b
