#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
DIST_DIR="$SCRIPT_DIR/../dist";
BUILD_DIR="$SCRIPT_DIR/../builds";

echo "Type a revision number, followed by [ENTER]: ";
read REV
echo "Type an environment name, followed by [ENTER] (default \"production\"): ";
read ENV

if [ "$ENV" == "" ]; then
    ENV="production";
fi;

cd $SCRIPT_DIR/../

echo "Updating git version..."
node git-version.js

echo "Building for $ENV...";
ng build --configuration=$ENV

FILE_NAME="$BUILD_DIR/callan-$ENV-$REV.tar.gz";
echo "Creating $FILE_NAME"

tar -czf $FILE_NAME -C $DIST_DIR .

exit 0;
