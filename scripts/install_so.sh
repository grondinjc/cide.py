#!/bin/bash
set -e

echo "Detecting virtual env ..."
if [ "x" == "x$VIRTUAL_ENV" ]
then
  echo "[ERROR] : No python virtual env detected !"
  echo "          Select an env because packages will be installed on it."
  exit 1
fi

# Adjusting current directory
FILE_PATH=`readlink -e $0`
DIR_PATH=`dirname "$FILE_PATH"`
cd "$DIR_PATH"

# Building libs
echo "Building libs ..."
mkdir -p ../src/app/c++/build
cd ../src/app/c++/build
cmake ..
make

# Deploy all shared lib
echo ""
echo "Deploying the following libs :"
ls | grep *.so
echo ""
cp -r *.so $VIRTUAL_ENV/lib/python2.7/site-packages/

echo "Installation complete"
echo 'Make sure env contains the right libs by doing : lssitepackages | grep ".so$"'
