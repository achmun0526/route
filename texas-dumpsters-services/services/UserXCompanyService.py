import logging
from models import UserXCompany

logger = logging.getLogger()

class UserXCompanyInstance:
    
    @staticmethod
    def save(entity):

        from services import UserService, CompanyService       
        
        if entity.user is None:
            raise ValueError("User is required")

        if entity.company is None:
            raise ValueError("Company is required")

        user = UserService.UserInstance.get(entity.user.urlsafe())
        if user is None:
            raise ValueError("User not found")

        company = CompanyService.CompanyInstance.get(entity.company.urlsafe())
        if company is None:
            raise ValueError("Company not found")

        if entity.key is None:
            
            #It validates if association already exists            
            v = UserXCompany.get_by_company_and_user(entity.company, entity.user)
            if v is not None:
                raise ValueError("Association already exists")

            entity = UserXCompany.save(entity)
        else:
            current = UserXCompany.get(entity.key.urlsafe())
            if current is not None:
                current.user = entity.user
                current.company = entity.company
                entity = UserXCompany.save(entity)
            else:
                raise ValueError("UserXCompany does not exists")
        return entity
  
    @staticmethod
    def delete(id):
        entity = UserXCompany.get(id)
        if(entity is None):
            raise ValueError("UserXCompany does not exists")
        else:
            entity.delete()

    @staticmethod
    def get(id): 
        return UserXCompany.get(id)

    @staticmethod
    def get_all(page, page_size):
        return UserXCompany.get_all(page, page_size)

    @staticmethod
    def get_by_company_and_user(company, user):
        return UserXCompany.get_by_company_and_user(company, user)

    @staticmethod
    def remove_all_companies_from_user(user):
        return UserXCompany.remove_all_companies_from_user(user)