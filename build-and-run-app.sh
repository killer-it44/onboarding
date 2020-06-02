#!/bin/sh
docker build --tag onboarding .
docker run --rm --name onboarding --network="onboarding" -e SERVER_PORT=3001 -e DB_CONNECTION_URI=postgres://postgres@onboarding-db:5432/postgres -p 3001:3001 onboarding
