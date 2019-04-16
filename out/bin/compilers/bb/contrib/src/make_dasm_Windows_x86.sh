#!/bin/sh
# /data/fun/Atari/7800basic.0.1/contrib/lib/linux
# rebuild dasm for linux x86 32-bit

export PATH=/usr/x86_64-w64-mingw32/bin:$PATH
export CC=i586-mingw32msvc-gcc
export CFLAGS=' -m32'
export LDFLAGS=' -m32 -L/usr/lib32'

rm -fr dasm-2.20.11-20171206
tar -xvzf dasm-2.20.11-update-20171206.tgz
cd dasm-2.20.11-20171206/src
make

cp dasm ../../../../dasm.exe
cd ../..
rm -fr dasm-2.20.11-20171206
