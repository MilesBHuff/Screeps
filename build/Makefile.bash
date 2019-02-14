#!/usr/bin/env bash
## Copyright © from the date of the last git commit to this file in this git branch,
## by all persons with git blame to this file in this git branch, per the terms of
## the GNU AGPL 3.0 with the additional allowances of the GNU LGPL 3.0.

## Makefile
## ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

## Variables
## =============================================================================
export PATH="$(pwd)/node_modules/.bin:$PATH"

## Functions
## =============================================================================

## execdir
## -----------------------------------------------------------------------------
function execdir {
#	echo
	PRE='build'
	if [[ -d "$PRE/$1" ]]; then
		cd "$PRE/$1"
		for F in $(echo *); do
			[[ -f "$F" ]] && ./"$F"
#			echo
		done
		cd ../..
	else
		echo "ERROR:  Missing '$PRE' directory!" >&2
		exit 2
	fi
}

## main
## =============================================================================
if [[ $1 ]]; then
	INPUT="$1"
else
	echo "Type 'clean', 'deploy', 'make', or 'upkeep':"
	read INPUT
fi
case "$INPUT" in
	'clean'  |\
	'deploy' |\
	'make'   |\
	'upkeep' )
		execdir "${INPUT}.d"
		;;
	*)
		echo 'ERROR:  Invalid command!' >&2
		exit 1
		;;
esac
exit 0
