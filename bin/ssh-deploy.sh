#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
CFG_DIR="$SCRIPT_DIR/../etc"
LIBS_DIR="$SCRIPT_DIR/libs";

DEPLOY_DIR_NAME="www";
DEPLOY_DIR="$SCRIPT_DIR/../$DEPLOY_DIR_NAME";
BUILD_DIR_NAME="builds";
BUILD_DIR="$SCRIPT_DIR/../$BUILD_DIR_NAME";
ARCHIVE_EXT=".tar.gz";

. $LIBS_DIR/shini.sh

__shini_parsed ()
{
    if [ "$1" == "$ENV" ]; then
	export $2="$3";
    fi;
}

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


    shini_parse "$CFG_DIR/ssh-deploy.ini";

    if [ -z "$PROJECT_NAME" ]; then
	echo "Wrong environment name given: its not defined in ssh-deploy.ini";
	exit 1;
    fi;


ARCHIVE_FILE_NAME="$PROJECT_NAME-$ENV-$REV$ARCHIVE_EXT"
ARCHIVE_FILE="$BUILD_DIR/$ARCHIVE_FILE_NAME";

if [ ! -e "$ARCHIVE_FILE" ]; then
    echo "The specified archive $ARCHIVE_FILE is not exists"
    exit 1;
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
