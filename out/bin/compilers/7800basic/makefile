# The 7800basic generic "adhoc" compiling makefile.
ARCH=
LDIR=contrib/adhoc
CC=cc
CFLAGS=
LEX=lex
LEXFLAGS=-t

all:  7800basic 7800preprocess 7800postprocess 7800filter 7800optimize 7800header 7800sign 7800makecc2 snip banksetsymbols 7800rmtfix 7800rmt2asm

7800basic: 7800bas.c statements.c keywords.c statements.h keywords.h atarivox.h minitar.c minitar.h 
	cd contrib/src ; ./make_libraries_adhoc_static.sh ; cd ../..
	${CC} ${CFLAGS} -o 7800basic 7800bas.c statements.c keywords.c minitar.c -L${LDIR}/lib -I${LDIR}/include -lpng -lz -lm -llzsa

7800postprocess: postprocess.c
	${CC} ${CFLAGS} -o 7800postprocess postprocess.c

7800filter: filter.c
	${CC} ${CFLAGS} -o 7800filter filter.c

7800preprocess: preprocess.lex
	${LEX} ${LEXFLAGS}<preprocess.lex>lex.yy.c
	${CC} ${CFLAGS} -o 7800preprocess lex.yy.c
	rm -f lex.yy.c

7800optimize: optimize.lex
	${LEX} ${LEXFLAGS} -i<optimize.lex>lex.yy.c
	${CC} ${CFLAGS} -o 7800optimize lex.yy.c
	rm -f lex.yy.c

7800header: 7800header.c
	${CC} ${CFLAGS} -o 7800header 7800header.c

7800sign: 7800sign.c
	${CC} ${CFLAGS} -o 7800sign 7800sign.c

snip: snip.c
	${CC} ${CFLAGS} -o snip snip.c

banksetsymbols: banksetsymbols.c
	${CC} ${CFLAGS} -o banksetsymbols banksetsymbols.c

7800rmtfix: 7800rmtfix.c
	${CC} ${CFLAGS} -o 7800rmtfix 7800rmtfix.c

7800rmt2asm: 7800rmt2asm.c
	${CC} ${CFLAGS} -o 7800rmt2asm 7800rmt2asm.c

7800makecc2: 7800makecc2.c
	${CC} ${CFLAGS} -o 7800makecc2 7800makecc2.c

install:   all

clean:
	rm -f 7800basic 7800preprocess 7800postprocess 7800optimize 7800header 7800sign banksetsymbols 7800filter 7800makecc2 7800rmtfix 7800rmt2asm lzsa snip
	rm -fr contrib/adhoc 

dist:
	make clean
	make distclean
	make -f makefile.xcmp.win-x86
	make -f makefile.xcmp.win-x64
	make -f makefile.linux-x86
	make -f makefile.linux-x64
	make -f makefile.xcmp.osx-x86
	make -f makefile.xcmp.osx-x64
	unix2dos *.txt *.c *.h

distclean:
	make -f makefile.xcmp.win-x86 clean
	make -f makefile.xcmp.win-x64 clean
	make -f makefile.linux-x86 clean
	make -f makefile.linux-x64 clean
	make -f makefile.xcmp.osx-x86 clean
	make -f makefile.xcmp.osx-x64 clean

