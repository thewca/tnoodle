#!/usr/bin/env bash

# Exit if any command fails
set -e

if ! [ -x "$(command -v yarn)" ]; then
  echo "Error: yarn is not installed. Install yarn and try again: https://yarnpkg.com/en/docs/install" >&2
  echo "" >&2
  exit 1
fi

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
