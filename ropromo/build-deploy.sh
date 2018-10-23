#! /bin/bash
ng build
echo Deploying to Project ropromo
{y} | gcloud app deploy app.yaml --version=py1x1 --project=ropromo-214500
gcloud app browse --project=ropromo-214500
