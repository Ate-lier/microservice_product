#!/bin/bash

# make sure files directory exist to hold all csv files
DIR="$(dirname "$0")"
if [ ! -d "$DIR/files" ]; then
  mkdir "$DIR/files"
fi

# make a files dictionary to download multiple csv files
declare -A files

files["characteristics"]="1BmQH26kRhvXBWJGH_n0iP3QElJcBEsEl"
files["related"]="1gaz6mno6QyFDfJyBof4Lp7q6eyGdVVDu"
files["skus"]="1EVVGKLDGzaU0amRaPV-tHZx11ASwibT7"
files["products"]="1fXN-J3gxtA9ZUa2EqzVFnkjszWwd7yVF"
files["photos"]="1bY6hc-b1FbZsHe_Cdhq6wqSK7QBo1h8h"
files["styles"]="1tNIJx2QhTRfd4qVmOVgJgiyvoICbTJH-"
files["features"]="1o64GDzSqwkoRoZvP3SmGY_Mrv2708oPn"

for fileName in "${!files[@]}"; do
  prefix="https://drive.google.com/uc?export=download"
  wget "${prefix}&id=${files[$fileName]}&confirm=yes" \
  -O "${DIR}/files/${fileName}.csv"
done
