#!/usr/bin/env bash
## Copyright © from the date of the last git commit to this file in this git branch,
## by all persons with git blame to this file in this git branch, per the terms of
## the GNU AGPL 3.0 with the additional allowances of the GNU LGPL 3.0.

## Compile src
## ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

## Variables
## =============================================================================
SCRIPTS='js'

## Main
## =============================================================================
echo -e "\e[34;1m::\e[0;1m Compiling source code and copying blobs...\e[0m"
cd ../../src

## Find files
## -----------------------------------------------------------------------------
for F in $(find -type f); do

	## Exclude include-only files and directories
	[[ "$(echo $F |                      sed 's/^.*[/]//gm')" == '_'* ]] && continue
#	[[ "$(echo $F | sed 's/[/].*$//gm' | sed 's/^.*[/]//gm')" == '_'* ]] && continue

	## Exclude temporary files
	[[ "$(echo $F | sed 's/^.*[/]//gm')" == '.keep' ]] && continue

	case "$F" in
		*".$SCRIPTS")
			TYPE='Script'
			EXTIN="$SCRIPTS"
			EXTOUT='js'
			;;
		*)
			TYPE='Blob'
			EXTIN='res'
			EXTOUT='res'
			;;
	esac

	## Calculate the new path
	NEWPATH="../bin/$(echo $F | sed 's/^[.][/]//gm')"
	[[ $TYPE != 'Res' ]] && NEWPATH="$(echo $NEWPATH | sed 's/[.]'$EXTIN'$/.'$EXTOUT'/gm')"
	echo "${TYPE}:	$(echo $NEWPATH | sed 's/^[.][.][/]//gm')"

	## Transpile and minify source, and move blobs
	case "$F" in
		*".$SCRIPTS")
			../node_modules/uglify-es/bin/uglifyjs --config-file "../build/conf/mini-js.json" -o "$NEWPATH" "$F"
			;;
			chmod 0755 "$NEWPATH"
		*)
			cp "$F" "$NEWPATH"
			chmod 0644 "$NEWPATH"
			;;
	esac

## Cleanup
## -----------------------------------------------------------------------------
done
cd ../build/make.d
echo -e "\e[34;1m::\e[0;1m Done.\e[0m"
exit 0
