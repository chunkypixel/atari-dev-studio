#!/bin/sh

OS=$(uname -s)
if [ ! "$OS" = Linux -a ! "$OS" = Darwin ] ; then
  echo "##### WARNING: Unsupport \"$OS\" OS. This script only knows about Linux"
  echo "#####          and OS X, so it may not work correctly."
  echo "#####          Also, You'll need to compile own 7800basic binaries."
fi

if [ "$(uname -s)" = Linux ] ; then
	PROFILE=~/.bashrc
else
	PROFILE=~/.profile
fi

# need to test for these, because if they exist than bash won't read .profile
for PRO in ~/.bash_profile ~/.bash_login ~/.bashrc ; do
  [ -r "$PRO" ] && PROFILE="$PRO"
done

bas7800dir=$PWD
if [ ! -r "$bas7800dir"/7800basic.sh ] ; then
	base7800dir=$(dirname $0)
	if [ ! "$base7800dir" -o "$base7800dir" = "." ] ; then
		echo
		echo "Error: Couldn't determine the 7800basic directory."
		echo "Please use the \"cd\" command to go inside the 7800basic directory"
		echo "and run this script using this command: "
		echo "         ./install_ux.sh"
		echo
		exit
	fi
fi

cat <<EOF

__________________________The_7800basic_Unix_Installer_v1__________________________

This script will update your $PROFILE file to 
set the following variables each time you open a terminal window.

  export bas7800dir="$bas7800dir"
  export PATH=\$PATH:\$bas7800dir

You may run this script as many times as you like, and should do so if you're
installing a new version of 7800basic, or if you relocate this basic directory.

Hit [ENTER] to begin, or type Q and [ENTER] to quit.

EOF
read ANSWER
[ "$ANSWER" ]  && exit 1

# ensure the profile exists
[ -r "$PROFILE" ] || touch "$PROFILE"

# create a backup of the profile...
cp "$PROFILE" "$PROFILE.$(date +%y%m%d%H%M%S)"

# remove any old basic entries 
grep -v bas7800dir "$PROFILE" > "$PROFILE.new"

echo "##### 7800basic/bas7800dir variables, added by installer on $(date +%y/%m/%d)" >> "$PROFILE.new"
echo "export bas7800dir=\"$bas7800dir\"" >> "$PROFILE.new"
echo 'export PATH=$PATH:$bas7800dir' >> "$PROFILE.new"

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

  1. open another terminal window.  (the bas7800dir and PATH variables will 
     now be active in any new terminal window)
  2. type:  cd "$bas7800dir/samples/simple"
  3. type:  7800basic.sh simple.bas

This should create a simple.bas.bin and simple.bas.a78 binary files in the 
samples directory that will work on real hardware or under emulation.

EOF

