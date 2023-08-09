: '
    Written by: Adar Schwarzbach
    Entry script to zip and containarize the lambda function.
    This allows access to Numpy in the lambda function.
    To use:
        1) Make changes to lambd_function.py
        2) Run Docker Desktop
        3) Navigate to the bean-serverless directory
        4) Run in terminal:  `docker build -t bean_lambda_builder_image .`  # this creates the image
        5) Run in terminal: `chmod 744 runner.sh` # this makes the script executable
        6) Run in terminal:  `./runner.sh`  # this creates the container and zips the lambda function
'


container_name=lambda_docker
docker_image=bean_lambda_builder_image

docker stop $container_name
docker rm $container_name

docker run -td --name $container_name $docker_image
docker exec -i $container_name /bin/bash < ./docker_install.sh
docker cp $container_name:/venv/lib/python3.11/deployment_package.zip deployment_package.zip
docker stop $container_name
docker rm $container_name

zip -g deployment_package.zip lambda_function.py


 