#!/bin/sh
# 7800basic compilation script (wasm)

# do some quick sanity checking...
if [ ! "$bas7800dir" ] ; then
  echo "### WARNING: the bas7800dir envionronment variable isn't set."
fi

wasmtime --version 2>&1 > /dev/null
if [ ! $? = 0 ] ; then
    if [ -r "$bas7800dir"/7800basic ] ; then
        echo "### WARNING: wasmtime is missing. Compiling with native executables."
        7800basic.native.sh $*
        exit $?
    else
        echo "### WARNING: wasmtime isn't in your PATH."
        echo "    You can install it as follows:"
        echo "      macOS/Linux: curl https://wasmtime.dev/install.sh -sSf | bash"
        echo "    See https://wasmtime.dev for other installation options."
        exit 1
    fi
fi


echo "  basic version:  "$(wasmtime $bas7800dir/7800basic.wasm -v 2>/dev/null)

echo "  "dasm version:"  " $(wasmtime $bas7800dir/dasm.wasm 2>/dev/null| head -n1)

if [ "$1" = "-v" ] ; then
  #this is just a version check. we already displayed the version earlier,
  #so just exit.
  exit
fi

if [ ! -f "$1" ]; then
    echo "### ERROR: Source file \"$1\" not found."
    exit 2
fi

echo

echo "Starting build of $1"
 wasmtime run --dir=. --dir="$bas7800dir" "$bas7800dir/7800preprocess.wasm" <"$1" >"$1.pre"
 wasmtime run --dir=. --dir="$bas7800dir"  "$bas7800dir/7800basic.wasm" -i "$bas7800dir" -b "$1" -p "$1.pre"

if [ "$?" -ne "0" ]
 then
  echo "Compilation failed."
  exit
fi
   rm -f "$1.pre"
if [ "$2" = "-O" ]
  then
   wasmtime run --dir=. --dir="$bas7800dir" "$bas7800dir/7800postprocess.wasm" -i "$bas7800dir" | wasmtime run --dir=. --dir="$bas7800dir"  "$bas7800dir/7800optimize.wasm" > "$1.asm"
  else
   wasmtime run --dir=. --dir="$bas7800dir" "$bas7800dir/7800postprocess.wasm" -i "$bas7800dir" > "$1.asm"
fi

if [ -r banksetrom.asm ] ; then
    wasmtime run --dir=. --dir="$bas7800dir"  "$bas7800dir/dasm.wasm" "$bas7800dir/includes/banksetskeleton.asm" -I"$bas7800dir/includes" -f3 -l"banksetrom.list.txt" -p20 -s"banksetrom.symbol.txt" -o"banksetrom.bin" | wasmtime "$bas7800dir/7800filter.wasm"
    wasmtime run --dir=. --dir="$bas7800dir" "$bas7800dir/banksetsymbols.wasm"
fi

wasmtime run --dir=. --dir="$bas7800dir" "$bas7800dir/dasm.wasm" "$1.asm" -I"$bas7800dir/includes" -f3 -l"$1.list.txt" -p20 -s"$1.symbol.txt" -o"$1.bin" | wasmtime "$bas7800dir/7800filter.wasm"

wasmtime run --dir=. --dir="$bas7800dir" "$bas7800dir/7800sign.wasm" -w "$1.bin"

if [ -r banksetrom.asm ] ; then
    cat "banksetrom.bin" >> "$1.bin"
    rm -f banksetrom.bin banksetrom.asm
fi

  
wasmtime run --dir=. --dir="$bas7800dir" "$bas7800dir/7800header.wasm" -o -f a78info.cfg "$1.bin"
wasmtime run --dir=. --dir="$bas7800dir" "$bas7800dir/7800makecc2.wasm" "$1.bin"
	
exit 0
