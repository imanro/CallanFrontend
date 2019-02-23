#!/bin/bash

PROJECT_NAME="callan"
REMOTE_HOST="81.95.188.7"
REMOTE_USER="$USER"
REMOTE_DIR_PREFIX="/var/www/vhosts"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
DEPLOY_DIR_NAME="www";
DEPLOY_DIR="$SCRIPT_DIR/../$DEPLOY_DIR_NAME";
BUILD_DIR_NAME="builds";
BUILD_DIR="$SCRIPT_DIR/../$BUILD_DIR_NAME";
ARCHIVE_EXT=".tar.gz";

# take needle archive and place unto target host
# we need predef vars: $ remote machine dir path
# $ remote host
# we ask: dir name

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

ARCHIVE_FILE_NAME="$PROJECT_NAME-$ENV-$REV$ARCHIVE_EXT"
ARCHIVE_FILE="$BUILD_DIR/$ARCHIVE_FILE_NAME";

if [ ! -e "$ARCHIVE_FILE" ]; then
    echo "The specified archive $ARCHIVE_FILE is not exists"
    exit 1;
fi;

echo "Type a remote dir name, followed by [ENTER], started with $REMOTE_DIR_PREFIX (default $PROJECT_NAME): "
read REMOTE_PROJ_DIR_NAME;

if [ "$REMOTE_PROJ_DIR_NAME" == "" ]; then
    REMOTE_PROJ_DIR_NAME="$PROJECT_NAME";
fi;

REMOTE_DIR=$REMOTE_DIR_PREFIX/$REMOTE_PROJ_DIR_NAME

echo "Okay, will deploy $ARCHIVE_FILE into $REMOTE_DIR. Is it correct (y/n)? ";
read CONFIRM;

if [ "$CONFIRM" != "y" ]; then
    echo "User has canceled the operation, exiting"
    exit 1;
fi;

echo "Uploading archive $ARCHIVE_FILE into $REMOTE_DIR/$BUILD_DIR...";
echo "run"
echo "scp $ARCHIVE_FILE $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/$BUILD_DIR_NAME";

scp $ARCHIVE_FILE $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/$BUILD_DIR_NAME


echo "Cleaning contents of $REMOTE_DIR/$DEPLOY_DIR and deploying...";
ssh $REMOTE_USER@$REMOTE_HOST REMOTE_DIR=$REMOTE_DIR DEPLOY_DIR_NAME=$DEPLOY_DIR_NAME BUILD_DIR_NAME=$BUILD_DIR_NAME ARCHIVE_FILE_NAME=$ARCHIVE_FILE_NAME 'bash -s' <<'ENDSSH'

echo "run"
echo "rm -rf $REMOTE_DIR/$DEPLOY_DIR_NAME/*"
rm -rf $REMOTE_DIR/$DEPLOY_DIR_NAME/*
echo "run"
echo "tar --strip-components=1 -C $REMOTE_DIR/$DEPLOY_DIR_NAME -xvzf $REMOTE_DIR/$BUILD_DIR_NAME/$ARCHIVE_FILE_NAME"
tar --strip-components=1 -C $REMOTE_DIR/$DEPLOY_DIR_NAME -xvzf $REMOTE_DIR/$BUILD_DIR_NAME/$ARCHIVE_FILE_NAME

ENDSSH

echo "All done!";

exit 0;
