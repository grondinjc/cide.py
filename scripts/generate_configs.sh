#!/bin/bash

if [ -z "$1" ]
then
  echo "Missing project path argument"
  exit 1
fi

SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
BIN_DIR=$SCRIPT_DIR/../bin
CONFIGS_DIR=$BIN_DIR/configs

for f in $BIN_DIR/*.conf.example
do
  sed -e "s,<<PRJ>>,$1,g" $f > $BIN_DIR/`basename $f .example`
  if [ -e "$BIN_DIR/`basename $f .example`" ]
  then
    echo $BIN_DIR/`basename $f .example` created succesfuly
  else
    echo Error creating $BIN_DIR/`basename $f .example`
  fi
done

for f in $CONFIGS_DIR/*.conf.example
do
  sed -e "s,<<PRJ>>,$1,g" $f > $CONFIGS_DIR/`basename $f .example`
  if [ -e "$CONFIGS_DIR/`basename $f .example`" ]
  then
    echo $CONFIGS_DIR/`basename $f .example` created succesfuly
  else
    echo Error creating $CONFIGS_DIR/`basename $f .example`
  fi
done

echo Done!

