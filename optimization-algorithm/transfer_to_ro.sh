#!/bin/bash
echo Transfering include and .so files to ro-server
cp -r dist/Debug/GNU-Linux/* ../ro-server/optimization-interface/cpp/lib
cp -r include/* ../ro-server/optimization-interface/cpp/include
cd ../ro-server
cd shell_scripts
./transfer.sh
echo Done!
