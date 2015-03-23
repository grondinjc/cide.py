#!/bin/bash

PRJ_NAME="$1"
PRJ_BASE_DIR="$2"

if [ "x" == "x$PRJ_NAME" ]  || [ "x" == "x$PRJ_BASE_DIR" ]
then
  echo "[ERROR] : Missing argument"
  echo "Usage: $0 <PRJ_NAME> <PRJ_BASE_DIR>"
  exit 1
fi

SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
BIN_DIR=$SCRIPT_DIR/../bin

PRJ_TEMPLATE="$BIN_DIR/project.prj.example"
PRJ_OUTPUT="$BIN_DIR/$PRJ_NAME.prj"

sed -e "s,<<PRJ_NAME>>,$PRJ_NAME,g" $PRJ_TEMPLATE | \
sed -e "s,<<PRJ_BASE_DIR>>,$PRJ_BASE_DIR,g" > $PRJ_OUTPUT
if [ -e "$PRJ_OUTPUT" ]
then
  echo $PRJ_OUTPUT created succesfuly
else
  echo Error creating $PRJ_OUTPUT
fi

echo Done!
