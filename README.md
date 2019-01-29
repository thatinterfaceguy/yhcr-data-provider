# yhcr-data-provider

YCHR - Let's Play with FHIR
29 January 2019

## First run

Currently, installing NPM packages when launching the server using docker-compose is not supported. To workaround this, simply run the following command the first time you launch the server: 

docker run -d --rm -p8080:8080 --name orchestrator -v PATH-TO-REPO:/opt/qewd/mapped rtweed/qewd-server:latest

Once the container is running, simply stop it. Starting and stopping a single container will install any packages present in the install_modules.json file.

After this has been done, you can run the Qewd Up servicesx with: docker-compose up -d
