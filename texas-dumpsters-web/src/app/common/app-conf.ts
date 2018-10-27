export const PAGE_SIZE = 10;

export const ASSETS_URL = window.location.origin+'/assets';

export const ROLE_NAMES = {
	ADMIN: 'ADMIN',
	COMPANY_ADMIN: 'COMPANY ADMINISTRATOR',
	MANAGER: 'MANAGER',
	DISPATCHER: 'DISPATCHER',
	OFFICE_ADMIN_CSR: 'OFFICE ADMIN-CSR',
	DRIVER: 'DRIVER'
};

// This is where you decide what type of person can access what on the side-nav
export const ROLES=[
	{role_name:ROLE_NAMES.ADMIN,			options_ids:[1,2,3,101,102,104,105,106,107,201,202,203,208,301,302,303,304]},
  	{role_name:ROLE_NAMES.COMPANY_ADMIN,	options_ids:[1,2,3,103,104,105,106,107,201,202,203,208,301,302,303,304]},
	{role_name:ROLE_NAMES.MANAGER, 			options_ids:[2,201,202,203,208]},
	{role_name:ROLE_NAMES.DISPATCHER, 		options_ids:[1,2,3,104,105,106,107,201,202,208,301,302,303,304]},
	{role_name:ROLE_NAMES.OFFICE_ADMIN_CSR,	options_ids:[2,201,202,203,208]},
	{role_name:ROLE_NAMES.DRIVER, 			options_ids:[1,107]}
];

export const PURPOSE_OF_SERVICE_LIST = [
	{name:'Delivery',val:1},
	{name:'Removal',val:2},
	{name:'Swap',val:3},
	{name:'Relocate',val:4},
];

export const ASSET_SIZE_LIST = [
	{name:'10 Yard',val:1},
	{name:'11 Yard',val:2},
	{name:'12 Yard',val:3},
	{name:'15 Yard',val:4},
	{name:'18 Yard',val:5},
	{name:'20 Yard',val:6},
	{name:'30 Yard',val:7},
	{name:'40 Yard',val:8},
	{name:'50 Yard',val:9},
];

export const STATE_LIST = [
	{name:'Scheduled',val:1},
	{name:'In Route',val:2},
	{name:'Finished',val:3},
	{name:'Canceled',val:4},
];


export const SECURE_END_POINT = window.location.origin+'/x/a/v1';
export const END_POINT = window.location.origin+'/x/v1';

export const SUCCESS:string ="SUCCESS";

export const PROD_API_KEY="AIzaSyCyyOCD8SIeuNB9CkkJ0As1iM9w_OehJIU";
export const DEV_API_KEY="AIzaSyCyyOCD8SIeuNB9CkkJ0As1iM9w_OehJIU";
export const LOCAL_API_KEY="AIzaSyCyyOCD8SIeuNB9CkkJ0As1iM9w_OehJIU";

/**--------------------AUTHENTICATION/AUTHORIZATION SERVICES URLs-----------------------------------------------------*/
export const SIGN_IN_URL= END_POINT+'/sign_in';
export const SIGN_UP_URL= END_POINT+'/sign_up';
export const SIGN_OUT_URL= SECURE_END_POINT+'/sign_out';
export const VALIDATE_EMAIL_URL= END_POINT+'/user/email/availability';
export const USERS_URL= SECURE_END_POINT+'/users';
export const PROFILE_URL= END_POINT+'/user/profile';
export const GET_USER_BY_EMAIL= SECURE_END_POINT+'/users?email=';
/**--------------------END AUTHENTICATION/AUTHORIZATION SERVICES URLs-------------------------------------------------*/

/**--------------------GOOGLE SERVICES URLs ---------------------------------------------------------*/

export const DO_GOOGLE_API_CALL=SECURE_END_POINT+'/do_google_api_get_request';;
export const GEOREVERSE_ADDRESS_URL='https://maps.googleapis.com/maps/api/geocode/json';
export const DIRECTIONS_API_URL='https://maps.googleapis.com/maps/api/directions/json';

/**--------------------COMPANIES SERVICES URLs-----------------------------------------------------*/
export const ADD_COMPANY_URL= SECURE_END_POINT+'/company';
export const GET_ALL_COMPANIES_URL= SECURE_END_POINT+'/company';
export const ADD_USER_TO_COMPANY_URL= SECURE_END_POINT+'/userxcompany';
export const DELETE_USER_TO_COMPANY_URL= SECURE_END_POINT+'/userxcompany?';
export const GET_ALL_USER_FOR_COMPANY_URL= SECURE_END_POINT+'/userxcompany?';

/**--------------------CUSTOMERS SERVICES URLs-----------------------------------------------------*/
export const ADD_CUSTOMER_URL= SECURE_END_POINT+'/customer';
export const DELETE_CUSTOMER_URL= SECURE_END_POINT+'/customer';
export const GET_ALL_CUSTOMER_URL= SECURE_END_POINT+'/customer';
export const ADD_ADDRESS_TO_CUSTOMER_URL= SECURE_END_POINT+'/customer_service_address';
export const DELETE_ADDRESS_TO_CUSTOMER_URL= SECURE_END_POINT+'/customer_service_address';
export const GET_ALL_ADDRESS_FOR_CUSTOMER_URL= SECURE_END_POINT+'/customer_service_address?customer=';

/**--------------------SITES SERVICES URLs-----------------------------------------------------*/
export const ADD_SITE_URL= SECURE_END_POINT+'/site';
export const DELETE_SITE_URL= SECURE_END_POINT+'/site';
export const GET_ALL_SITE_URL= SECURE_END_POINT+'/site';
export const GET_SITES_BY_CUSTOMER_URL= SECURE_END_POINT+'/site';
export const GET_SITE_BY_ID_URL= SECURE_END_POINT+'/site?active=all&';

/**--------------------ORDERS SERVICES URLs-----------------------------------------------------*/

export const SERVICE_ORDER_URL= SECURE_END_POINT+'/serviceorder';
export const LIST_ASSETS_SIZE_URL= SECURE_END_POINT+'/list/asset_size';
export const LIST_PURPOSE_SERVICE_URL= SECURE_END_POINT+'/list/purpose_of_service';
export const LIST_ORDER_STATE_URL= SECURE_END_POINT+'/list/service_order_state';

/**--------------------YARDS SERVICES URLs-----------------------------------------------------*/
export const ADD_YARDS_URL= SECURE_END_POINT+'/yard';
export const GET_ALL_YARDS_URL= SECURE_END_POINT+'/yard';
export const GET_YARDS_BY_ID_URL= SECURE_END_POINT+'/yard?yard_key=';

/**--------------------FACILITY SERVICES URLs-----------------------------------------------------*/
export const ADD_FACILITY_URL= SECURE_END_POINT+'/facility';
export const GET_ALL_FACILITY_URL= SECURE_END_POINT+'/facility';
export const GET_FACILITY_BY_ID_URL= SECURE_END_POINT+'/facility?active=all&facility_key=';

/**--------------------VEHICLES SERVICES URLs-----------------------------------------------------*/
export const VEHICLES_URL= SECURE_END_POINT+'/vehicle';
export const GET_VEHICLES_BY_ID_URL= SECURE_END_POINT+'/vehicle?vehicle_key=';

/**--------------------DRIVERS SERVICES URLs------------------------------------------------------*/
export const DRIVERS_URL= SECURE_END_POINT+'/driver';
// export const GET_DRIVERS_BY_ID_URL= SECURE_END_POINT+'/driver?driver_key=';

/**--------------------ROTE ITEM SERVICES URLs-----------------------------------------------------*/
export const ADD_ROUTES_ITEM_URL= SECURE_END_POINT+'/route_item';
export const GET_ALL_ROUTES_ITEM_URL= SECURE_END_POINT+'/route_item';
export const GET_ROUTES_ITEM_BY_ID_URL= SECURE_END_POINT+'/route?active=all&route_key=';
export const ARRANGE_ROUTE_ITEM_URL = SECURE_END_POINT + '/route/arrange_item';

/**--------------------ROUTES SERVICES URLs-----------------------------------------------------*/
export const ROUTES_URL= SECURE_END_POINT+'/route';

/**--------------------PRICING SERVICES URLs-----------------------------------------------------*/
export const ADD_PRICING_URL= SECURE_END_POINT+'/servicepricing';
export const GET_ALL_PRICINGS_URL= SECURE_END_POINT+'/servicepricing?company=';

/**--------------------CSV SERVICES URLs-----------------------------------------------------*/
export const ADD_CSV_FILE_URL= SECURE_END_POINT+'/import_entity';

/**--------------------ASSETS SERVICES URLs-----------------------------------------------------*/
export const GET_ASSETS_INVENTORY= SECURE_END_POINT+'/asset_inventory';

/**--------------------END CSV SERVICES URLs-------------------------------------------------*/

/**------------------- MESSAGES URLs ------------------------------------------------------------*/
export const MESSAGES_URL = SECURE_END_POINT + '/message';

/**------------------- NOTIFICATIONS URLs ------------------------------------------------------------*/
export const NOTIFICATIONS_URL = SECURE_END_POINT + '/notification';

/**------------------- INCIDENTS URLs ------------------------------------------------------------*/
export const INCIDENTS_URL = SECURE_END_POINT + '/route_incident';
export const LIST_INCIDENTS_TYPE_URL= SECURE_END_POINT+'/list/route_incident_types';
export const LIST_INCIDENTS_STATUS_URL= SECURE_END_POINT+'/list/route_incident_status';

/**------------------- ROUTE POSITION URLSS ----------------------------------------------------- */
export const ROUTE_POSITION_HISTORY_URL = SECURE_END_POINT + '/route_position_history';

/**------------------- PROBLEMS URLs ------------------------------------------------------------*/
export const PROBLEMS_URL = SECURE_END_POINT + '/service_order_problem';
export const CHANGE_PROBLEM_STATUS_URL = SECURE_END_POINT + '/service_order_problem/change_status';
export const LIST_PROBLEMS_STATUS_URL= SECURE_END_POINT+'/list/service_order_problem_state';

/**------------------- ATTACHMENTS URLS ----------------------------------------------------- */
export const GET_ATTACHMENTS_URL= SECURE_END_POINT+"/attachment";

/**------------------- COMPUTE ENGINE URLS ----------------------------------------------------- */
export const TRIGGER_COMPUTE_URL = 'http://35.196.28.82:443';
