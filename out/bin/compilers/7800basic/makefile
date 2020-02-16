# The 7800basic generic-Unix makefile. Should work with most unixy OSes.
SHELL=/bin/sh
CHMOD=chmod
CP=cp
RM=rm
#CFLAGS for valgrind...
#CFLAGS= -g -O0
CFLAGS=-O0 -Wall
CC=cc
LEX=lex
LEXFLAGS=-t

all: 7800basic 7800preprocess 7800postprocess 7800filter 7800optimize 7800header 7800sign 7800makecc2

7800basic: 7800bas.c statements.c keywords.c statements.h keywords.h atarivox.h
	${CC} ${CFLAGS} -o 7800basic 7800bas.c statements.c keywords.c -lz -lpng -lm

7800postprocess: postprocess.c
	${CC} ${CFLAGS} -o 7800postprocess postprocess.c

7800filter: filter.c
	${CC} ${CFLAGS} -o 7800filter filter.c

7800preprocess: preprocess.lex
	${LEX} ${LEXFLAGS}<preprocess.lex>lex.yy.c
	${CC} ${CFLAGS} -o 7800preprocess lex.yy.c
	${RM} -f lex.yy.c

7800optimize: optimize.lex
	${LEX} ${LEXFLAGS} -i<optimize.lex>lex.yy.c
	${CC} ${CFLAGS} -o 7800optimize lex.yy.c
	${RM} -f lex.yy.c

7800header: 7800header.c
	${CC} ${CFLAGS} -o 7800header 7800header.c

7800sign: 7800sign.c
	${CC} ${CFLAGS} -o 7800sign 7800sign.c

7800makecc2: 7800makecc2.c
	${CC} ${CFLAGS} -o 7800makecc2 7800makecc2.c

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


install: all

clean:
	${RM} -f 7800basic 7800preprocess 7800postprocess 7800filter 7800optimize 7800header 7800sign 7800makecc2

love:
	@echo "not war"
peace:
	@echo "not war"
hay:
	@echo "while the sun shines"
believe:
	@echo "ok... the floor is lava"

