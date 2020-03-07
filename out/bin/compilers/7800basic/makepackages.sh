#!/bin/sh
# makepackages.sh
#   apply the release.dat contents to the release text in various sources
#   and documents, and then generate the individual release packages.

RELEASE=$(cat release.dat)
ERELEASE=$(cat release.dat | sed 's/ /_/g')
YEAR=$(date +%Y)

dos2unix 7800bas.c >/dev/null 2>&1
cat 7800bas.c | sed 's/BASIC_VERSION_INFO .*/BASIC_VERSION_INFO "7800basic v'"$RELEASE"'"/g' > 7800bas.c.new
mv 7800bas.c.new 7800bas.c
unix2dos 7800bas.c >/dev/null 2>&1

find . -name .\*.swp -exec rm '{}' \;

make dist

rm -fr packages
mkdir -p packages/7800basic 2>/dev/null

rm -f samples/*/*.a78 samples/*/*.bin samples/*/*.asm samples/*/*.txt samples/*/*.cfg samples/*/*.h samples/*/includes.7800
rm -fr samples/*/cfg samples/*/nvram

#populate architecture neutral stuff into the dist directory
cp -R includes packages/7800basic/
cp -R samples packages/7800basic/
rm packages/7800basic/samples/sizes.ref packages/7800basic/samples/makefile
rm packages/7800basic/samples/make_test.sh
cp *.TXT *.txt packages/7800basic/
cp docs/7800basic*pdf packages/7800basic/

for OSARCH in linux@Linux osx@Darwin win@Windows ; do
	for BITS in x64 x86 ; do
		OS=$(echo $OSARCH | cut -d@ -f1)
		ARCH=$(echo $OSARCH| cut -d@ -f2)
		if [ $OS = win ] ; then
			unix2dos packages/7800basic/*.txt
			rm -f packages/7800basic/7800basic.sh
			rm -f packages/7800basic/install_ux.sh
			cp 7800bas.bat packages/7800basic/
			cp install_win.bat packages/7800basic/
			for FILE in *"$ARCH"."$BITS".exe ; do
			  cp "$FILE" packages/7800basic/
			  SHORT=$(echo $FILE | cut -d. -f1)
			  mv "packages/7800basic/$FILE" "packages/7800basic/$SHORT.exe"
                        done
                        (cd packages ; zip -r 7800basic-$ERELEASE-$OS-$BITS.zip 7800basic)
			for FILE in *"$ARCH"."$BITS".exe ; do
			   SHORT=$(echo $FILE | cut -d. -f1)
			   rm "packages/7800basic/$SHORT" 2>/dev/null
                        done
                else
			dos2unix packages/7800basic/*.txt
			rm -f packages/7800basic/7800bas.bat
			rm -f packages/7800basic/install_win.bat
			cp install_ux.sh packages/7800basic/
			cp 7800basic.sh packages/7800basic/
			for FILE in *"$ARCH"."$BITS" ; do
			  cp "$FILE" packages/7800basic/
			  SHORT=$(echo $FILE | cut -d. -f1)
			  mv "packages/7800basic/$FILE" "packages/7800basic/$SHORT"
			done
                        (cd packages ; tar --numeric-owner -cvzf 7800basic-$ERELEASE-$OS-$BITS.tar.gz 7800basic)
			for FILE in *"$ARCH"."$BITS" ; do
			   SHORT=$(echo $FILE | cut -d. -f1)
			   rm "packages/7800basic/$SHORT" 2>/dev/null
			done
                fi
        done
done

cp *.exe *.Linux.x* *.Darwin.x* install_ux.sh install_win.bat 7800bas.bat 7800bas.c.sh packages/7800basic

#32-bit windows is default, for now
for FILE in *.Windows.x86.* ; do
	SHORT=$(echo $FILE | cut -d. -f1)
	mv "packages/7800basic/$FILE" "packages/7800basic/$SHORT.exe"
done

# make the ALL package with source code and all binaries...
cp *.c *.h *.sh *.bat make* *.lex release* *.txt packages/7800basic/
cp -R samples includes contrib packages/7800basic/
rm packages/7800basic/samples/sizes.ref packages/7800basic/samples/makefile
rm packages/7800basic/samples/make_test.sh
unix2dos packages/7800basic/*.txt
(cd packages ; tar --numeric-owner -cvzf 7800basic-$ERELEASE-ALL.tar.gz 7800basic)
(cd packages ; zip -r 7800basic-$ERELEASE-ALL.zip 7800basic)

# make the SRC packages. gotta remove the binaries
rm packages/7800basic/*exe
rm packages/7800basic/*.x64 packages/7800basic/*.x86 

(cd packages ; tar --numeric-owner -cvzf 7800basic-$ERELEASE-SRC.tar.gz 7800basic)
(cd packages ; zip -r 7800basic-$ERELEASE-SRC.zip 7800basic)

rm -fr packages/7800basic
