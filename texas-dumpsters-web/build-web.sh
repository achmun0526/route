#!/bin/bash
echo Building web angular project and copying to services repo...
rm -rf ../texas-dumpsters-services/static/*
rm -rf dist
ng build
cp -r dist/* ../texas-dumpsters-services/static
echo Done!
