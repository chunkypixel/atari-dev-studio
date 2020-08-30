#!/bin/sh
# makedevkit.sh
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
mkdir packages 2>/dev/null
cp -R 7800devkit packages/7800AsmDevKit

rm -f samples/*/*.a78 samples/*/*.bin samples/*/*bas.asm samples/*/*.txt samples/*/*.cfg samples/*/*.h samples/*/includes.7800
rm -fr samples/*/cfg samples/*/nvram

#populate architecture neutral stuff into the dist directory
mkdir packages/7800AsmDevKit/includes 2>/dev/null
cp includes/7800.h packages/7800AsmDevKit/includes 2>/dev/null
cp includes/macro.h packages/7800AsmDevKit/includes 2>/dev/null

for OSARCH in linux@Linux osx@Darwin win@Windows ; do
	for BITS in x64 x86 ; do
		OS=$(echo $OSARCH | cut -d@ -f1)
		ARCH=$(echo $OSARCH| cut -d@ -f2)
		if [ $OS = win ] ; then
			for FILE in *"$ARCH"."$BITS".exe ; do
			  cp "$FILE" packages/7800AsmDevKit/
			  SHORT=$(echo $FILE | cut -d. -f1)
			  mv "packages/7800AsmDevKit/$FILE" "packages/7800AsmDevKit/$SHORT.exe"
			  rm packages/7800AsmDevKit/7800basic* 
			  rm packages/7800AsmDevKit/7800filter* 
			  rm packages/7800AsmDevKit/7800optimize* 
			  rm packages/7800AsmDevKit/7800postprocess* 
			  rm packages/7800AsmDevKit/7800preprocess* 
			  rm packages/7800AsmDevKit/7800asm* 
			  rm packages/7800AsmDevKit/7800makecc2* 
			  rm packages/7800AsmDevKit/7800sign
			  rm packages/7800AsmDevKit/dasm
			  rm packages/7800AsmDevKit/7800header
                        done
                        (cd packages ; zip -r 7800AsmDevKit-$ERELEASE-$OS-$BITS.zip 7800AsmDevKit)
			for FILE in *"$ARCH"."$BITS".exe ; do
			   SHORT=$(echo $FILE | cut -d. -f1)
			   rm "packages/7800AsmDevKit/$SHORT" 2>/dev/null
                        done
                else
			dos2unix packages/7800AsmDevKit/*.txt
			rm -f packages/7800AsmDevKit/7800asm.bat
			rm -f packages/7800AsmDevKit/install_win.bat
			cp 7800devkit/install_ux.sh packages/7800AsmDevKit/
			cp 7800devkit/7800asm packages/7800AsmDevKit/
			for FILE in *"$ARCH"."$BITS" ; do
			  cp "$FILE" packages/7800AsmDevKit/
			  SHORT=$(echo $FILE | cut -d. -f1)
			  mv "packages/7800AsmDevKit/$FILE" "packages/7800AsmDevKit/$SHORT"
			done

			  rm packages/7800AsmDevKit/7800basic* 
			  rm packages/7800AsmDevKit/7800filter* 
			  rm packages/7800AsmDevKit/7800optimize* 
			  rm packages/7800AsmDevKit/7800postprocess* 
			  rm packages/7800AsmDevKit/7800preprocess* 
			  rm packages/7800AsmDevKit/7800asm* 
			  rm packages/7800AsmDevKit/7800makecc2* 
			  rm packages/7800AsmDevKit/7800sign.exe
			  rm packages/7800AsmDevKit/dasm.exe
			  rm packages/7800AsmDevKit/7800header.exe

                        (cd packages ; tar --numeric-owner -cvzf 7800AsmDevKit-$ERELEASE-$OS-$BITS.tar.gz 7800AsmDevKit)
			for FILE in *"$ARCH"."$BITS" ; do
			   SHORT=$(echo $FILE | cut -d. -f1)
			   rm "packages/7800basic/$SHORT" 2>/dev/null
			done
                fi
        done
done


rm -fr packages/7800AsmDevKit
