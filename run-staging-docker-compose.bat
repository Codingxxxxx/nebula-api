@echo off
REM Change the directory to where your docker-compose.yml file is located
cd C:\Users\hc2mi\Personal\Projects\nebula\nebula-api

REM Run the docker-compose command
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d --build