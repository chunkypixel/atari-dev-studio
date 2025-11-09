.PHONY: all compile package

all: package

compile:
	npm ci  # Install dependencies (clean install)
	npm run compile  # Run your compile script from package.json (e.g., tsc for TypeScript)

package: compile
	npx vsce package --out atari-dev-studio.vsix  # Package into a .vsix file; replace 'my-extension' with your extension name