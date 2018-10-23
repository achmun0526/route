from models import User

class UserInstance:

    @staticmethod
    def get_by_email(email):
        return User.get_by_email(email)

    @staticmethod
    def get_by_auth_token(email, password):
        return User.get_by_auth_token(email,password)

    @staticmethod
    def get(id):
        return User.get_by_urlsafe(id)

    @staticmethod
    def delete(id):
        entity = User.get_by_urlsafe(id)
        if(entity is None):
            raise ValueError("User does not exists")
        else:
            entity.activated = False
            User.save(entity)
