#!/usr/bin/env bash
## Copyright © from the date of the last git commit to this file in this git branch,
## by all persons with git blame to this file in this git branch, per the terms of
## the GNU AGPL 3.0 with the additional allowances of the GNU LGPL 3.0.

## Clean src
## ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

## Functions
## =============================================================================

## Strip unsightly bits from paths
## -----------------------------------------------------------------------------
function strip {
	read INPUT
	echo "$INPUT" | sed "s/[\']$//gm" | sed "s/^.*[\']//gm" | sed "s/\.[/]//gm"
}

## Main
## =============================================================================
echo -e "\e[34;1m::\e[0;1m Cleaning 'bin/'...\e[0m"
cd ../../bin

## Remove compiled code
## -----------------------------------------------------------------------------
echo -e "\e[34;1m::\e[0m Removing binaries..."
for F in $(find -type f); do
	case "$F" in
		*.js)
			echo -n 'bin/'
			rm -fv "$F" | strip
			;;
	esac
done

## Remove empty directories
## -----------------------------------------------------------------------------
echo -e "\e[34;1m::\e[0m Removing empty directories..."
for D in $(find -type d); do
	if [[ "$D" != '.' ]]; then
		echo -n 'bin/'
		rmdir -v --ignore-fail-on-non-empty "$D" | strip
	fi
done

## Cleanup
## -----------------------------------------------------------------------------
cd ../build/clean.d
echo -e "\e[34;1m::\e[0;1m Done.\e[0m"
