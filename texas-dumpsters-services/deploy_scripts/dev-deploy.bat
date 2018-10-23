echo Deploying to Project project texas-dumpsters-development

gcloud app deploy ..\index.yaml --version=py1x1 --project=texas-dumpsters-development
gcloud service-management deploy ..\texas_dumpsters_apiv1.0openapi-development.json --project=texas-dumpsters-development
gcloud app deploy ..\app.yaml --version=py1x1 --project=texas-dumpsters-development
