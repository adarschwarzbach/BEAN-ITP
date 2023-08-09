# Script to zip up changes to beanBackend.py for upload to AWS Lambda.

#!/bin/bash

# Run by:
#  `chmod +x Compute/zipBackend.sh`
#  `./Compute/zipBackend.sh`

cd Compute

if [ -f "beanBackend.py" ]; then
    echo "Zipping beanBackend.py..."
    zip beanBackend.zip beanBackend.py
    echo "Zip operation completed."
else
    echo "File beanBackend.py not found."
fi

cd ..
