#! /bin/bash

cd texas-dumpsters-web
pwd
ng build
cd dist
cp -a ./. ../../texas-dumpsters-services/static/
cd ../../texas-dumpsters-services/deploy_scripts
{"Y" "Y"} |./dev-deploy.sh
