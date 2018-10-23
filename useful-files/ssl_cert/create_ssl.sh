openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr
openssl x509 -req -days 365 -in server.csr -signkey example.key -out server.crt
gcloud compute ssl-certificates create roserver \
    --certificate ./roserver.crt \
    --private-key ./roserver.key
gcloud compute ssl-certificates describe roserver
gcloud compute ssl-certificates

# ///////////////this section is a work in progress /////////////////////////
# echo "do you want to update your https proxy with this SSL? y/n"
# read user_input
# if [ "$user_input" = "y" ]
# then
#   gcloud compute target-https-proxies update [PROXY_NAME] \
#       --ssl-certificates [SSL_CERT_1][,[SSL_CERT_2],...]
# else
#     echo "Not Cool Beans"
# fi
