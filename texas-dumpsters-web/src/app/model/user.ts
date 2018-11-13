import {ROLE_NAMES} from '../common/app-conf';
import {ServerEntity} from '../common/server_entity';
import {Company} from './company';
import {isNullOrUndefined} from 'util';

export class User extends ServerEntity {
  email: String = '';
  first_name: String = '';
  last_name: String = '';
  user_key: String = '';
  id = '';  // what's the difference between this and user_key?
  user_id = '';
  roles: any[];
  company_key = '';
  company: Company = null;
  contact_phone_desk = '';
  contact_phone_mobile = '';
  device_id = '' ;
  activated = false;

  constructor() {
    super();
  }

  public parseServerResponse(serverResponseObject) {
    super.parseServerResponse(serverResponseObject);
    this.roles = serverResponseObject.roles;
    if (!isNullOrUndefined(serverResponseObject.company)) {
      let company: Company = new Company();
      company.parseServerResponse(serverResponseObject.company);
      this.company = company;
    }
  }

  public getUserRole(): String {
    if (this.roles != null && this.roles.length > 0) {
      return this.roles[0];
    }
    return 'User';
  }

  public hasAdminRole(): boolean {
    return this.hasRoleGranted(ROLE_NAMES.ADMIN);
  }

  private hasRoleGranted(role: String): boolean {
    return this.roles != null && this.roles.length > 0 && this.roles[0] === role;
  }

}
