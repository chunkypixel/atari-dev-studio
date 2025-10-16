export PROJECT=hiscoretable
export COMPILER=7800basic.sh

main: 	${PROJECT}.bas.bin

${PROJECT}.bas.bin: ${PROJECT}.bas
	${COMPILER} ${PROJECT}.bas -O

clean:
	/bin/rm -fr ${PROJECT}.bas.bin ${PROJECT}.bas.asm ${PROJECT}.bas.a78 ${PROJECT}.bas.list.txt ${PROJECT}.bas.symbol.txt cfg nvram hsgamename.asm 7800hsgameranks.asm ${PROJECT}.bas.pre 
	/bin/rm -f a78info.cfg includes.7800 7800.asm 7800gfx.asm 7800basic_variable_redefs.h 7800hsgamename.asm 

run:
	a7800 a7800 -cart ${PROJECT}.bas.a78

