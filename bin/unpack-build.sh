#!/bin/bash

SCRIPT_PREFIX="callan"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
DEPLOY_DIR="$SCRIPT_DIR/../www";
BUILD_DIR="$SCRIPT_DIR/../builds";
ARCHIVE_EXT=".tar.gz";

if [ ! -e "$DEPLOY_DIR" ]; then
    echo "The deploy dir $DEPLOY_DIR is not exists"
    exit;
fi;

echo "Type a revision number, followed by [ENTER]: ";
read REV;

echo "Type an evnvironment followed by [ENTER] (default \"production\"): ";
read ENV;

if [ "$ENV" == "" ]; then
    ENV="production";
fi;



ARCHIVE_FILE="$BUILD_DIR/$SCRIPT_PREFIX-$ENV-$REV$ARCHIVE_EXT";

if [ -e "$ARCHIVE_FILE" ]; then
    echo "Cleaning contents of $DEPLOY_DIR/...";
    rm -rf $DEPLOY_DIR/*
    tar --strip-components=1 -C $DEPLOY_DIR -xvzf $ARCHIVE_FILE
else
    echo "The specified archive $ARCHIVE_FILE is not exists"
    exit 1;
fi;


exit 0;
