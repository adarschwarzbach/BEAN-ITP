FROM amazonlinux:latest

# Update and install dependencies
RUN yum update -y && yum install -y \
    python3 \
    python3.11-devel \
    zip \
    unzip \
    && yum clean all

# Install pip
RUN install python3-pip

# Upgrade pip
RUN python3.11 -m pi3 install --upgrade pip3

# Install specific version of virtualenv
RUN pip3 install virtualenv
