#!/bin/sh

if [ -z "$1" ]
  then
    printf "No arguments supplied."
    exit 1
fi

base="s3://delivered-by-madington.com/client/"
path=$base$2
aws s3 cp $1 $path --recursive --include "*"
