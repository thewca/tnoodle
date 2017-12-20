#!/usr/bin/env bash

# Copied from https://stackoverflow.com/a/7305217/1739415
relpath(){ python3 -c "import os.path; print(os.path.relpath('$1', start='${2:-$PWD}'))" ; }

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
        ln -s `relpath "$file" "$name_parent"` $name
    fi
done
