import logging

from models import Message, Notification

logger = logging.getLogger()

class InternalMessageAndEmailHelper:

    @staticmethod
    def send_internal_message(company_key, sender_key, dispatcher_key, subject, body):        
        message = Message()
        message.populate(
            company_key=company_key,            
            sender_user_key=sender_key,
            receiver_user_key=dispatcher_key,
            message_title=subject,
            message_body=body,
            message_status="unread",
            message_type="Message"
        )
        message = Message.save(message)
        notificiation = Notification()
        notificiation.populate(
            company_key=company_key,
            user_key=dispatcher_key,      
            notification_text=subject,
            notification_params=message.key.urlsafe(),
            notification_status="unread",
            notification_type="Message"
        )
        Notification.save(notificiation)

    @staticmethod
    def send_email(sender, email_recipient, subject, body):
        from google.appengine.api import mail                        
        subject = subject
        body = body
        email = mail.EmailMessage(
            sender=sender,
            subject=subject,
            to=email_recipient,
            body=body)
        email.send()