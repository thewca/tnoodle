#!/usr/bin/env bash

cd "$(dirname "$0")"

yarn install
yarn build

cd build

base_dir=../../webscrambles/WebContent/wca/new-ui
rm -rf $base_dir
for file in `find static` index.html; do
    if [ -f $file ]; then
        name=$base_dir/$file
        mkdir -p `dirname $name`
        name_parent=`dirname $name`
        ln -s `realpath --relative-to="$name_parent" "$file"` $name
    fi
done
