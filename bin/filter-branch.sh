#!/bin/bash

git filter-branch -f --index-filter 'git rm --cached --ignore-unmatch builds/*' HEAD
