#!/bin/bash
# r = recursive n = line number w = match whole word l = file name
grep --exclude={*.o,*.so}  --exclude-dir=node_modules -rnwl './' -e  "Customer Info"
