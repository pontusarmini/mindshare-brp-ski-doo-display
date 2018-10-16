#!/bin/sh

if [ -z "$1" ]
  then
    printf "No arguments supplied. I need filename/path (ie video.mp4), size (ie 640x500), outputpath (ie ./dash/) and filename (ie mydashfile)\nassets/myvideo.mp4 640x500 ./dashout/ dashvideo\n"
    exit 1
fi

file=$1
size=$2
path=$3
outputname=$4
fullpath=$path$outputname

MP4Box -dash 1000 -bs-switching no -segment-name $outputname $file -out $fullpath.mpd
ffmpeg -i $file -profile:v baseline -level 3.0 -s $size -start_number 0 -force_key_frames "expr:gte(t,n_forced*2)" -hls_init_time 1 -hls_time 1 -hls_list_size 100 -f hls $fullpath.m3u8
