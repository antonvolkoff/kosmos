#!/bin/sh

docker build . -t icon-builder
mkdir -p Icon.iconset
docker run --rm -it -v $(pwd):/data icon-builder convert -background none -size 16x16 icon.svg Icon.iconset/icon_16x16.png
docker run --rm -it -v $(pwd):/data icon-builder convert -background none -size 32x32 icon.svg Icon.iconset/icon_32x32.png
docker run --rm -it -v $(pwd):/data icon-builder convert -background none -size 128x128 icon.svg Icon.iconset/icon_128x128.png
docker run --rm -it -v $(pwd):/data icon-builder convert -background none -size 265x265 icon.svg Icon.iconset/icon_265x265.png
docker run --rm -it -v $(pwd):/data icon-builder convert -background none -size 512x512 icon.svg Icon.iconset/icon_512x512.png
docker run --rm -it -v $(pwd):/data icon-builder convert -background none -size 32x32 icon.svg Icon.iconset/icon_16x16@2x.png
docker run --rm -it -v $(pwd):/data icon-builder convert -background none -size 64x64 icon.svg Icon.iconset/icon_32x32@2x.png
docker run --rm -it -v $(pwd):/data icon-builder convert -background none -size 265x265 icon.svg Icon.iconset/icon_128x128@2x.png
docker run --rm -it -v $(pwd):/data icon-builder convert -background none -size 512x512 icon.svg Icon.iconset/icon_265x265@2x.png
docker run --rm -it -v $(pwd):/data icon-builder convert -background none -size 1024x1024 icon.svg Icon.iconset/icon_512x512@2x.png
iconutil --convert icns Icon.iconset
