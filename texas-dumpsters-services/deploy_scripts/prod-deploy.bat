echo Deploying to Project project texas-dumpsters-production

gcloud app deploy ..\index.yaml --version=py1x1 --project=texas-dumpsters-production
gcloud service-management deploy ..\texas_dumpsters_apiv1.0openapi-production.json --project=texas-dumpsters-production
gcloud app deploy ..\app.yaml --version=py1x1 --project=texas-dumpsters-production