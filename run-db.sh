#!/bin/sh
docker run --name onboarding-db -e POSTGRES_HOST_AUTH_METHOD=trust --rm -p 5432:5432 --network="onboarding" postgres