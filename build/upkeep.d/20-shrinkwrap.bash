#!/usr/bin/env bash
## Copyright © from the date of the last git commit to this file in this git branch,
## by all persons with git blame to this file in this git branch, per the terms of
## the GNU AGPL 3.0 with the additional allowances of the GNU LGPL 3.0.

echo -e "\e[34;1m::\e[0;1m Shrinkwrapping...\e[0m"
npm shrinkwrap --dev
echo -e "\e[34;1m::\e[0;1m Done.\e[0m"
exit 0
