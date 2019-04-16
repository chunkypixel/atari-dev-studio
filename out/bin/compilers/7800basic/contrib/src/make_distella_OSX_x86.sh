#!/bin/sh
# /data/fun/Atari/7800basic.0.1/contrib/lib/linux
# rebuild distella for OS X x86 32-bit

export PATH=/usr/i686-apple-darwin10/bin:$PATH
export CC=i686-apple-darwin10-gcc
export LD=$CC
export CFLAGS=' -m32 -arch i386 '
export LDFLAGS='-m32 -L/usr/i686-apple-darwin10/lib -arch i386'

rm -fr distella-301b
tar -xvzf distella-301b.tgz
cd distella-301b/
make linux #yeah, the linux target is just generic
cp distella ../../../distella.Darwin.x86
cd ..
rm -fr distella-301b
