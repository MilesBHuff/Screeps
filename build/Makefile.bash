#!/usr/bin/env bash
## Copyright © from the date of the last git commit to this file in this git branch,
## by all persons with git blame to this file in this git branch, per the terms of
## the GNU AGPL 3.0 with the additional allowances of the GNU LGPL 3.0.

## Makefile
## ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

## Functions
## =============================================================================

## meta
## -----------------------------------------------------------------------------
function meta {
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
		echo 'ERROR:  Missing \'build\\' directory!' >&2
		exit 2
	fi
}

## clean
## -----------------------------------------------------------------------------
function clean {
	meta 'clean.d'
}

## make
## -----------------------------------------------------------------------------
function make {
	meta 'make.d'
}

## update
## -----------------------------------------------------------------------------
function update {
	meta 'update.d'
}

## main
## =============================================================================
if [[ $1 ]]; then
	INPUT="$1"
else
	echo "Type 'clean', 'make', or 'update':"
	read INPUT
fi
case "$INPUT" in
	'clean')
		clean
		;;
	'make')
		make
		;;
	'update')
		update
		;;
	*)
		echo 'ERROR:  Invalid command!' >&2
		exit 1
		;;
esac
exit 0
