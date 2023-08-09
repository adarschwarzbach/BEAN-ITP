#!/bin/bash

# Check if virtualenv is installed
# if ! command -v virtualenv &> /dev/null
# then
#     echo "virtualenv could not be found, installing now..."
#     pip install virtualenv
# fi

# Create a new virtual environment
virtualenv --python=/usr/bin/python3.11 venv

echo "Virtual environment 'venv' created successfully."
source venv/bin/activate 
pip3 install numpy -t venv/lib/python3.11/site-packages
cd venv/lib/python3.11/site-packages/
touch __init__.py
cd ../
mv site-packages libs
zip -r9 deployment_package.zip .

# # Rename site-packages to libs
# mv venv/lib/python3.9/site-packages venv/lib/python3.9/libs
# touch venv/lib/python3.9/libs/__init__.py

# # Create zip in parent directory
# cd venv/lib/python3.9/
# zip -r9 deployment_packages.zip .
