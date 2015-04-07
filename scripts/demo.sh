#!/bin/bash

echo "Make sure the procedure in /doc/README was executed ..."
echo "Press [ENTER] to continue"
read dummyVar

# Fail on first error
set -e

# Adjusting current directory
FILE_PATH=`readlink -e $0`
DIR_PATH=`dirname "$FILE_PATH"`
ROOT_PATH=`dirname "$DIR_PATH"`
cd "$ROOT_PATH"

DEMO_PRJ_CFG="demo-prj"
DEMO_PRJ_DIR="$ROOT_PATH/demo"
DEMO_SRC_DIR="$ROOT_PATH/demo/code"

# Create project config
./scripts/generate_project_config.sh $DEMO_PRJ_CFG $DEMO_PRJ_DIR

# Create code directory to put files
rm -rf $DEMO_PRJ_DIR
mkdir -p $DEMO_SRC_DIR

# File 1
echo "print 'Hello World'" >> $DEMO_SRC_DIR/file1.py
# File 2
echo "def f(a):" >> $DEMO_SRC_DIR/file2.py
echo "  return a+2" >> $DEMO_SRC_DIR/file2.py
echo "" >> $DEMO_SRC_DIR/file2.py
echo "if __name__ == '__main__':" >> $DEMO_SRC_DIR/file2.py
echo "  print 'In main of file2'" >> $DEMO_SRC_DIR/file2.py
echo "  print 'f(4) is', f(4)" >> $DEMO_SRC_DIR/file2.py
# File 3
echo "from file2 import f as other_file_func" >> $DEMO_SRC_DIR/file3.py
echo "if __name__ == '__main__':" >> $DEMO_SRC_DIR/file3.py
echo "  print 'In main of file3'" >> $DEMO_SRC_DIR/file3.py
echo "  print 'f(5) is', other_file_func(5)" >> $DEMO_SRC_DIR/file3.py
# File 4
echo "from pdb import set_trace as dbg" >> $DEMO_SRC_DIR/file4.py
echo "a = 2" >> $DEMO_SRC_DIR/file4.py
echo "dbg()" >> $DEMO_SRC_DIR/file4.py
echo "b = 3" >> $DEMO_SRC_DIR/file4.py
echo "c = 4" >> $DEMO_SRC_DIR/file4.py
echo "print a,b,c" >> $DEMO_SRC_DIR/file4.py

# Create project internal config
./scripts/generate_configs.sh $ROOT_PATH

# Installing c++ modules
echo "Make sure the procedure in /doc/README was followed ..."
./scripts/install_so.sh

# Starting cide.py
python bin/startCIDE.py bin/cide.conf bin/demo-prj.prj