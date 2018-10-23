fuser -k 8080/tcp
fuser -k 8000/tcp
cd texas-dumpsters-web
ng build --watch -op ../texas-dumpsters-services/static &
cd ..
pwd
dev_appserver.py --enable_console --port=8080 ./texas-dumpsters-services/app.yaml &
