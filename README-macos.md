# Atari Dev Studio - macOS build instruction

Atari Dev Studio does not currently include the latest `*.Darwin.arm64` (Apple silicon macs) binaries.

Use these instructions to manually build the latest binaries from source and configure Atari Dev Studio to use your locally built binaries.

>Thank you to Fred Sauer for providing the following information.  If you are a MacOS arm64 user who can compile and keep the following compiler libraries up to date please contact **@mksmith** on the AtariAge forum.


# Install Atari Dev Studio

1. Use VS Code to install the [Atari Dev Studio](https://marketplace.visualstudio.com/items?itemName=chunkypixel.atari-dev-studio) extension.
2. Optionally build a `*.bas` (batari Basic) program and make note of the batari Basic and dasm version strings reported in the compiler
   output window, for comparison later. These might look something like this:

```
Found dasm version: DASM 2.20.15-SNAPSHOT
batari Basic v1.6-SNAPSHOT (c)2021
```

# Create a directory for your locally built binaries

1. Create a directory to store your locally built batari Basic and dasm binaries. You'll later configure Atari Dev Studio to use this directory.

```
mkdir ~/mybatariBasic
```

# batari Basic build and copy

1. Change to your preferred working directory.

```
cd
```

2. Clone the batari Basic repo and build binaries.

```
git clone git@github.com:batari-Basic/batari-Basic.git
cd batari-Basic
make
```

3. Copy files to your local batari Basic directory.

```
cp 2600basic.sh ~/mybatariBasic/
cp -r includes ~/mybatariBasic/

OSTYPE=$(uname -s)
ARCH=$(uname -m)
cp 2600basic ~/mybatariBasic/2600basic.$OSTYPE.$ARCH
cp bbfilter ~/mybatariBasic/bbfilter.$OSTYPE.$ARCH
cp optimize ~/mybatariBasic/optimize.$OSTYPE.$ARCH
cp postprocess ~/mybatariBasic/postprocess.$OSTYPE.$ARCH
cp preprocess ~/mybatariBasic/preprocess.$OSTYPE.$ARCH
```

4. Optionally, delete the cloned batari-Basic repo.

```
cd ..
rm -rf batari-Basic
```
# 7800basic build and copy

**TBC**

# dasm build and copy

1. Change to your preferred working directory.

```
cd
```

2. Clone the dasm repo and build.

```
git clone git@github.com:dasm-assembler/dasm.git
make
```

3. Copy dasm to your local batari Basic directory.

```
cp bin/dasm ~/mybatariBasic/dasm.$OSTYPE.$ARCH
```

4. Optionally, delete the cloned dasm-assembler repo.

```
cd ..
rm -rf dasm-assembler
```

# Configure Atari Dev Studio

1. In VS Code, open Settings (`CMD-,` or `CMD-SHIFT-P` > `Settings`)
2. Search for `Batari Basic: Folder` (under `Atari-dev-studio` > `Compiler`).
   Or, follow this URL to go straight there: `vscode://settings/atari-dev-studio.compiler.batariBasic.folder`.
3. Specify your local batari Basic folder. Use the full qualified path name. VS Code will *not* understand `~` to mean your home directory.
   For example, `/Users/yourusername/mybatariBasic/`.

# Verify that everything is working

1. In VS Code, open a `*.bas` (batari Basic) file.
2. Press `F5` to compile and launch your program.
3. Verify the batari Basic and dasm version strings mentioned in the compiler output are the latest.
   These versions might look something like this:

```
Found dasm version: DASM 2.20.15-SNAPSHOT
batari Basic v1.8 (c)2025
```
