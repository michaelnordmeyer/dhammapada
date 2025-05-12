#!/usr/bin/env sh

set -eu

mkdir -p assets/icons

convert \
  -background darkorange \
  -fill black \
  -size 180x180 \
  -gravity center \
  -font "/System/Library/Fonts/Apple Symbols.ttf" \
  -pointsize 256 \
  -annotate +1+25 "☸" \
  label:' ' \
  assets/icons/icon.webp
