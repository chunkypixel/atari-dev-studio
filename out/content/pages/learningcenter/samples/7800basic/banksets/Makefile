export PROJECT=banksets
export COMPILER=7800basic.sh

main: 	${PROJECT}.bas.bin

${PROJECT}.bas.bin: ${PROJECT}.bas
	${COMPILER} ${PROJECT}.bas -O

clean:
	/bin/rm -f ${PROJECT}.bas.bin ${PROJECT}.bas.asm ${PROJECT}.bas.a78 ${PROJECT}.bas.list.txt ${PROJECT}.bas.symbol.txt 7800.asm 7800gfx.asm includes.7800 7800basic_variable_redefs.h a78info.cfg banksetrom.bin ${PROJECT}.bas.pre message.log banksetrom.symbol.txt banksetrom.list.txt banksetrom.asm
	/bin/rm -fr cfg

run:
	a7800 a7800 -cart ${PROJECT}.bas.a78
