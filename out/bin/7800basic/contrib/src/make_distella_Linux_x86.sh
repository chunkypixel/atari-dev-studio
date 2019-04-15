#!/bin/sh
# /data/fun/Atari/7800basic.0.1/contrib/lib/linux
# rebuild distella for linux x86 32-bit

export LDFLAGS=' -m32 -L/usr/lib32'
export CFLAGS=' -m32'

rm -fr distella-301b
tar -xvzf distella-301b.tgz
cd distella-301b/
make linux
cp distella ../../../distella.Linux.x86
cd ..
rm -fr distella-301b
