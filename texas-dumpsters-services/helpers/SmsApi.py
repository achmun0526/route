class Twilio:

    @staticmethod
    def send(to, message):

        if len(message) > 160:
            raise ValueError("Up to 160 characters long")

        import config
        from twilio.rest import TwilioRestClient
            
        account_sid = config.TWILIO_ACCOUNT_SID
        auth_token  = config.TWILIO_AUTH_TOKEN
        
        client = TwilioRestClient(account_sid, auth_token)

        response = client.messages.create(
            to = to, 
            from_ = config.TWILIO_NUMBER, 
            body = message
            #media_url="https://c1.staticflickr.com/3/2899/14341091933_1e92e62d12_b.jpg", 
        )
        
        return response