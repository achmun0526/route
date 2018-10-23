import { Injectable } from '@angular/core';
import { User } from '../../model/user';
import { Http } from '@angular/http';
import {
  SIGN_IN_URL, VALIDATE_EMAIL_URL, SIGN_OUT_URL, SIGN_UP_URL,
  PROFILE_URL, USERS_URL, SUCCESS, ROLE_NAMES, GET_USER_BY_EMAIL
} from '../../common/app-conf';
import {MENU_OPTIONS} from '../../common/menu_options';
import {ROLES} from '../../common/app-conf';
import 'rxjs/add/operator/toPromise';
import {Router} from '@angular/router';
import {BaseService} from '../../common/base-service';
import {isNullOrUndefined} from "util";
import {PaginationResponse} from "../../model/pagination_response";
import {Company} from "../../model/company";


@Injectable()
export class AuthService extends BaseService {

  private userMenu=null;


  constructor(private http: Http,private router:Router) {
    super();
  }


  /**
   * This method calls the update profile service sending the given information as parameter
   * to update the user profile
   * */
  getUserProfile():Promise<User>{
    debugger;
    console.log("in getUserProfile");
		super.showSpinner();
    return this.http.get(PROFILE_URL).toPromise()
      .then(response => {
				super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          this.saveSignedInUser(res.user as User);
          console.log("logging the user");
          console.log(res.user)
          return res.user as User;
        }else{
          this.clearSignedInUser();
          return null;
        }});
  }

  /** 
   * This method calls the signin service and authenticate a
   * user given its username and password as parameter.
   * */
  signIn(username:String,password:String):Promise<boolean> {
		super.showSpinner();
    return this.http.post(SIGN_IN_URL,{email:username,password:password}).toPromise()
      .then(response => {
				super.hideSpinner();
        var res=response.json();
        console.log(res);
        if (res.status===SUCCESS){
          var user:User =res.user as User;
          this.saveSignedInUser(user);
          return true;
        }else{
          if (res.locked){
            window.alert(res.errors[0]);
          }
          return false;
        }})
      .catch(this.handleError);
  }

  /**
   * This method calls the signup service in orer to create a new account
   * sending the information given as parameter
   * */
  signUp(userData):Promise<boolean> {
    super.showSpinner();
    return this.http.post(SIGN_UP_URL,userData).toPromise()
      .then(response => {
				super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return true;
        }else{
          return false;
        }})
      .catch(this.handleError);
  }

  /**
   * This method calls the signOut service and remove the info
   * for the user
   * */
  signOut():void {
    localStorage.removeItem("user");
    window.location.href=SIGN_OUT_URL;
  }

  /**
   * This method calls the validate username service and
   * checks if a given email is available
   * */
  validateEmail(email:String):Promise<boolean> {
		super.showSpinner();
    return this.http.get(VALIDATE_EMAIL_URL+'/'+email).toPromise()
      .then(response => {
				super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return true;
        }else{
          return false;
        }})
      .catch(this.handleError);
  }

  /**
   * Deletes the given user
   * */
  public deleteUser(user_key:String):Promise<PaginationResponse>{
    var urlParams='?id='+user_key;
    super.showSpinner();
    return this.http.delete(USERS_URL+urlParams).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return true;
        }else{
          return false;
        }})
      .catch(this.handleError);
  }

  /**
   * Retrieves a list of users from the server filtering by the given parameters
   * */
  private getUsers(pageInfo,paramName:String,paramValue:String):Promise<PaginationResponse>{
    var urlParams='';
    if (paramName!=null){
      urlParams='?'+paramName+'='+paramValue;
    }
    if (!isNullOrUndefined(pageInfo)){
      urlParams=super.getPagingInfoAsURLParams(urlParams,pageInfo).toString();
    }
		super.showSpinner();
    return this.http.get(USERS_URL+urlParams).toPromise()
      .then(response => {
				super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,User);
        }else{
          return new PaginationResponse();
        }})
      .catch(this.handleError);
  }

  getAllUsers(pageInfo):Promise<PaginationResponse>{
    return this.getUsers(pageInfo,null,null);
  }

  /**
   *
   *
   * */
  public getUsersByCompanyId(pageInfo,companyId):Promise<PaginationResponse>{
    return this.getUsers(pageInfo,'company_key',companyId);
  }


  /**
   * Returns an instance of the User which is currently Signed in
   * */
  getCurrentUser():User {
    if (this.isUserSignedIn()){
      var user:User=new User();
      user.parseServerResponse(JSON.parse(localStorage.getItem('user')));
      return user;
    }
    return null;
  }

  /**
   * This method is used to validate if there is a user already signed in
   *
   * */
  isUserSignedIn():boolean{
    if (localStorage.getItem('user')==null){
      return false;
    }
    return true;
  }

  /**
   * This method validates if the user menu was already build, if it hasn't it's in charge of creating it and then send
   * it as a response.
   *
   * */
  getUserMenu():any[]{
    // Add in this.buildUserMenu(); below if you want to reset the sidenav for already made users
    console.log("called build user menu");
    this.buildUserMenu();
    if (this.userMenu==null || this.userMenu.length==0){
      this.buildUserMenu();
    }
    return this.userMenu;
  }


  /**
   * This method is intended to create dynamically the user menu based on the options that are intended for each role.
   * */
  private buildUserMenu(){
    this.userMenu=[];
    var optionsByRole=this.getAvailableOptionsByRole();
    if (optionsByRole.length>0){
      for (let menuOption of MENU_OPTIONS){
        if(optionsByRole.indexOf(menuOption.id)!=-1){
          if (menuOption.parent_id==0){
            menuOption.dropdown=[];
            this.userMenu.push(menuOption);
          }else{
            this.addMenuOptionToParent(menuOption,this.userMenu);
          }
        }
      }
    }
  }

  /**
   *
   * */
  private addMenuOptionToParent(optionToAdd,userMenu){
    for (let menuOption of userMenu){
      if (menuOption.id==optionToAdd.parent_id){
        menuOption.dropdown.push(optionToAdd);
        return;
      }
    }
  }

  /**
   *
   *
   *
   * */
  private getAvailableOptionsByRole(){
    if (this.getCurrentUser()!=null){
      var userRole=this.getCurrentUser().roles.length>0?this.getCurrentUser().roles[0]:'NONE';
      for (let roleOptions of ROLES){
        if (roleOptions.role_name===userRole){
          return roleOptions.options_ids;
        }
      }
    }
    return [];
  }

  /**
   * This method must be called after a successful sign in, in order to
   * save the user information.
   *
   * */
  private clearSignedInUser(){
    localStorage.removeItem('user');
  }

  /**
   * This method must be called after a successful sign in, in order to
   * save the user information.
   *
   * */
  private saveSignedInUser(user:User){
    localStorage.setItem('user',JSON.stringify(user));
    this.buildUserMenu();
  }


  public getAuthorizedRolesToGrant():Promise<string[]>{
    return new Promise((resolve, reject) => {
      var roles:string[]=[];
      if (!isNullOrUndefined(this.getCurrentUser())){
        if (this.getCurrentUser().hasAdminRole()){
          roles.push(ROLE_NAMES.ADMIN);
        }
        roles.push(ROLE_NAMES.COMPANY_ADMIN);
        roles.push(ROLE_NAMES.MANAGER);
        roles.push(ROLE_NAMES.OFFICE_ADMIN_CSR);
        roles.push(ROLE_NAMES.DISPATCHER);
        roles.push(ROLE_NAMES.DRIVER);
      }
      resolve(roles);
    });
  }

  /**
   * This method set on the session the current selected company
   *
   * */
  public saveCurrentSelectedCompany(company:Company,overwrite){
    if (!isNullOrUndefined(this.getCurrentUser())){
      var key=this.getCurrentUser().email+'-company';
      if(isNullOrUndefined(sessionStorage.getItem(key)) || overwrite){
        sessionStorage.setItem(key,JSON.stringify(company));
      }
    }
  }

  /**
   * This method set on the session the current selected company
   *
   * */
  public getCurrentSelectedCompany():Company{
    if (!isNullOrUndefined(this.getCurrentUser())){
      var key=this.getCurrentUser().email+'-company';
      var company:Company=new Company();
      company.parseServerResponse(JSON.parse(sessionStorage.getItem(key)));
      return company;
    }
    return null;
  }


/**
   * This method calls the server in order to get User by email
   *
   *
   * */
  getUserByEmail(userEmail):Promise<User> {
    super.showSpinner();
    return this.http.get(GET_USER_BY_EMAIL + userEmail).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          var user:User=new User();
          user.parseServerResponse(res.response.records[0]);
          return user;
        }else{
          return new User();
        }})
      .catch(this.handleError);
  }

	/**
   * This method calls the server in order to get User by Role
   * Automatically filter by selected company
   *
   * */
	getUsersByRole(roleType, optimized):Promise<PaginationResponse> {
    super.showSpinner();
     var params = '?company_key=' + this.getCurrentSelectedCompany().id + '&roles='+ roleType +
     ( (optimized!=null)? "&optimized="+optimized : "" );
		params=super.getPagingInfoAsURLParams(params,null).toString();
    return this.http.get(USERS_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,User);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }

  /*** Get al users filtering only by rol not by company */
  getAllUsersByRole_superAdmin(roleType):Promise<PaginationResponse> {
    super.showSpinner();
   	var params = '?roles='+ roleType ;
		params=super.getPagingInfoAsURLParams(params,null).toString();
    return this.http.get(USERS_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,User);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }

  /*** Get al user filtering by company and specifc role */
  getUsersByRoleAndCompany_superAdmin(roleType, companyId):Promise<PaginationResponse> {
    super.showSpinner();
   	var params = '?company_key=' + companyId + '&roles='+ roleType ;
		params=super.getPagingInfoAsURLParams(params,null).toString();
    return this.http.get(USERS_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,User);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }

}
