#!/bin/sh

OS=$(uname -s)
if [ ! "$OS" = Linux -a ! "$OS" = Darwin ] ; then
  echo "##### ERROR: Unsupport \"$OS\" OS. This script only knows about Linux"
  echo "#####          and OS X, so it will not work correctly."
  echo "#####          You'll need to compile own 7800AsmDevKit binaries."
  exit
fi

if [ "$(uname -s)" = Linux ] ; then
	PROFILE=~/.bashrc
else
	PROFILE=~/.profile
fi

for FILE in *$OS.x86 ; do
	PLAINNAME=$(echo $FILE | sed "s/\.$OS\.x86//g")
	cp "$FILE" "$PLAINNAME"
	chmod 755 "$PLAINNAME"
done

# need to test for these, because if they exist than bash won't read .profile
for PRO in ~/.bash_profile ~/.bash_login ~/.bashrc ; do
  [ -r "$PRO" ] && PROFILE="$PRO"
done

asm7800dir=$PWD
if [ ! -r "$asm7800dir"/7800header ] ; then
	base7800dir=$(dirname $0)
	if [ ! "$base7800dir" -o "$base7800dir" = "." ] ; then
		echo
		echo "Error: Couldn't determine the 7800AsmDevKit directory."
		echo "Use the \"cd\" command to go to the 7800AsmDevKit directory"
		echo "and re-run this script using this command: "
		echo "         ./install_ux.sh"
		echo
		exit
	fi
fi

cat <<EOF

______________________The_7800AsmDevKit_Unix_Installer_v1_______________________

This script will update your $PROFILE file to 
set the following variables each time you open a terminal window.

  export asm7800dir="$asm7800dir"
  export PATH=\$PATH:\$asm7800dir

You may run this script as many times as you like, and should do so if you're
installing a new version of 7800AsmDevKit, or if you relocate this directory.

Hit [ENTER] to begin, or type Q and [ENTER] to quit.

EOF
read ANSWER
[ "$ANSWER" ]  && exit 1

# ensure the profile exists
[ -r "$PROFILE" ] || touch "$PROFILE"

# create a backup of the profile...
cp "$PROFILE" "$PROFILE.$(date +%y%m%d%H%M%S)"

# remove any old entries 
grep -v asm7800dir "$PROFILE" > "$PROFILE.new"

echo "##### 7800AsmDevKit/asm7800dir variables, added by installer on $(date +%y/%m/%d)" >> "$PROFILE.new"
echo "export asm7800dir=\"$asm7800dir\"" >> "$PROFILE.new"
echo 'export PATH=$PATH:$asm7800dir' >> "$PROFILE.new"

if [ ! -r "$PROFILE.new" ] ; then
  echo
  echo "Could not create the new profile. Is the filesystem full?"
  echo "Exiting..."
  exit 2
fi

# move the contents instead, to preserve any custom permissions on the profile
cat "$PROFILE.new" > "$PROFILE" && rm "$PROFILE.new"

cat <<EOF
$PROFILE has been updated successfully.

To test the new setup...

  1. open another terminal window.  (the asm7800dir and PATH variables will 
     now be active in any new terminal window)
  2. type:  cd "$asm7800dir/samples/simple"
  3. type:  7800asm simple.asm

This should compile simple.asm into simple.asm.bin.

EOF
