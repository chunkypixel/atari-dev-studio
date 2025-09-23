#!/bin/sh
# 7800basic Unix installer (WASM edition)

# Pick a sensible default shell profile
PROFILE="$HOME/.profile"
for PRO in "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.bash_login" "$HOME/.zshrc"; do
  [ -r "$PRO" ] && PROFILE="$PRO"
done

bas7800dir=$PWD
if [ ! -r "$bas7800dir/7800basic.sh" ]; then
  base7800dir=$(dirname "$0")
  if [ ! "$base7800dir" ] || [ "$base7800dir" = "." ]; then
    echo
    echo "Error: Couldn't determine the 7800basic directory."
    echo "Please cd into the 7800basic directory and run:"
    echo "         ./install_ux.sh"
    echo
    exit 1
  fi
fi

# --- Check for wasmtime ---
if ! command -v wasmtime >/dev/null 2>&1; then
  cat <<EOF

### ERROR: wasmtime is not installed or not in PATH.

You can install it using:
  - macOS/Linux: curl https://wasmtime.dev/install.sh -sSf | bash
  - macOS (Homebrew):   brew install wasmtime
  - Linux (Debian/Ubuntu): sudo apt install wasmtime
  - Linux (Fedora/RHEL):  sudo dnf install wasmtime
  - Or download directly: https://wasmtime.dev/

EOF
  exit 1
fi

cat <<EOF

__________________________The_7800basic_Unix_Installer_v2__________________________

This script will update your $PROFILE file to 
set the following variables each time you open a terminal window:

  export bas7800dir="$bas7800dir"
  export PATH=\$PATH:\$bas7800dir

You may run this script as many times as you like, and should do so if you're
installing a new version of 7800basic, or if you relocate this basic directory.

Hit [ENTER] to begin, or type Q and [ENTER] to quit.

EOF
read ANSWER
[ "$ANSWER" ] && exit 1

# ensure the profile exists
[ -r "$PROFILE" ] || touch "$PROFILE"

# backup
cp "$PROFILE" "$PROFILE.$(date +%y%m%d%H%M%S)"

# remove old entries
grep -v bas7800dir "$PROFILE" > "$PROFILE.new"

# add new entries
{
  echo "##### 7800basic/bas7800dir variables, added by installer on $(date +%y/%m/%d)"
  echo "export bas7800dir=\"$bas7800dir\""
  echo 'export PATH=$PATH:$bas7800dir'
} >> "$PROFILE.new"

# replace profile
cat "$PROFILE.new" > "$PROFILE" && rm "$PROFILE.new"

cat <<EOF
$PROFILE has been updated successfully.

To test the new setup:

  1. Open another terminal window (so the updated profile is loaded).
  2. Run:  cd "$bas7800dir/samples/simple"
  3. Run:  7800basic.sh simple.bas

If everything worked, you'll get simple.bas.bin and simple.bas.a78 in that
directory, ready for real hardware or emulation.

EOF
