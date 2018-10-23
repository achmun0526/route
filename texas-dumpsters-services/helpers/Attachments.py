import config
import os
import base64
import cloudstorage as gcs
import ntpath
import logging
import json

from google.appengine.api import app_identity

logger = logging.getLogger()

class AttachmentsHelper(object):
    
    @staticmethod        
    def upload(file_name, file_data, content_type, entity_key):
        bucket_name = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name()) 
        path = "/" + bucket_name + "/" + entity_key + "/" + file_name
        write_retry_params = gcs.RetryParams(backoff_factor=1.1)
        gcs_file = gcs.open(path,
                            'w',
                            content_type=content_type,
                            options={'x-goog-meta-foo': 'foo',
                                        'x-goog-acl': 'public-read',
                                    'x-goog-meta-bar': 'bar'},
                            retry_params=write_retry_params)
        
        gcs_file.write(base64.b64decode(file_data))           
        gcs_file.close()
        return True


    @staticmethod        
    def get_attachments_by_entity_key(entity_key):        
        bucket_name = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name()) 
        files = gcs.listbucket("/" + bucket_name + "/" + entity_key)
        list = []
        for file in files:
            url = config.GOOGLE_CLOUD_STORAGE_BASE_ADDRESS_TO_DOWNLOAD + file.filename
            list.append({"name": ntpath.basename(file.filename), "url": url })
        return list

    @staticmethod        
    def exists_attachments_for_entity_key(entity_key):
        bucket_name = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name()) 
        files = gcs.listbucket("/" + bucket_name + "/" + entity_key)
        for file in files:
            return True
        return False