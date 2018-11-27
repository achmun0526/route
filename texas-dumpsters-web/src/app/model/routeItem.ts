import { ServerEntity} from "../common/server_entity";
import {Facility} from "./facility";
import {Yard} from "./yard";
import {Order} from "./order";
import {ASSETS_URL} from "../common/app-conf";
import {CustomLatLng} from "./custom_lat_lng";
import {Utils} from "../common/utils";

export class RouteItem extends ServerEntity{

  static ENTITY_TYPES={FACILITY:'facility',YARD:'yard',ORDER:"serviceorder"};
  static STATUS_ENUM={1: 'New', 2: 'In Route', 3: 'Completed', 4: 'Canceled'};

	constructor(){
    super();
  }
	id : string = '';
 	route_key : string ="" ;
  entity_type : string ="" ;
  entity_key : string ="" ;
  sort_index : number;
  dist_2_next : number;
  time_2_next: number;  // hours
  route_number: number;
  active : boolean;
  entity: any;
  status: number = 0;

  populate(_entity_type,_entity_key,_sort_index,_entity,_dist_2_next,_time_2_next,_route_number){
    this.route_number = _route_number;
    this.entity_type=_entity_type;
    this.entity_key = _entity_key;
    this.sort_index=_sort_index;
    this.entity=_entity;
    this.dist_2_next=_dist_2_next;
    this.time_2_next=_time_2_next;

  }

  parseServerResponse(response){
    super.parseServerResponse(response);

    this.sort_index = response.sort_index;
    this.dist_2_next = response.dist_2_next;
    this.time_2_next = response.time_2_next;
    this.route_number = response.route_number;
    this.active = response.active;

    let entity:ServerEntity;
    switch (this.entity_type){
      case RouteItem.ENTITY_TYPES.FACILITY:
        entity=new Facility();
        break;
      case RouteItem.ENTITY_TYPES.YARD:
        entity=new Yard();
        break;
      case RouteItem.ENTITY_TYPES.ORDER:
        entity=new Order();
        break;
    }
    entity.parseServerResponse(response.item);
    this.entity=entity;
  }

  public getEntityType(){
    switch (this.entity_type){
      case 'facility':
        var fac:Facility=this.entity as Facility;
        return 'Facility';
      case 'yard':
        var yard:Yard=this.entity as Yard;
        return 'Yard';
      case 'serviceorder':
        var order:Order=this.entity as Order;
        var purposeOfService = "";
        switch(order.purpose_of_service){
          case 1: purposeOfService = "Delivery";break;
          case 2: purposeOfService = "Removal";break;
          case 3: purposeOfService = "Swap"; break;
          case 4: purposeOfService = "Relocate"; break;
        }
        //return 'Service Order - '+order.purpose_of_service;
        return 'Service Order - '+ purposeOfService;
    }
    return '';
  }

  public getEntityDescription(assetSizeList){
    switch (this.entity_type){
      case 'facility':
        var fac:Facility=this.entity as Facility;
        return fac.facility_name;
      case 'yard':
        var yard:Yard=this.entity as Yard;
        return yard.yard_name;
      case 'serviceorder':
        var order:Order=this.entity as Order;
        return order.assets + " - " + Utils.findNameByIdOnKeyValueList(assetSizeList,order.asset_size);
    }
    return '';
  }

  /**
   *
   *
   * */
  public getEntityAddress(){
    switch (this.entity_type){
      case 'facility':
        var fac:Facility=this.entity as Facility;
        return fac.getFormattedAddress();
      case 'yard':
        var yard:Yard=this.entity as Yard;
        return yard.getFormattedAddress();
      case 'serviceorder':
        var order:Order=this.entity as Order;
        return order.getFormattedAddress();
    }
    return '';
  }

  getMarkerObjectForEntity(){
    var obj=null;
    if (this.entity_type == "facility"){
      obj ={
        latitude: parseFloat(this.entity.latitude),
        longitude: parseFloat(this.entity.longitude),
        label: "",
        name : this.entity.facility_name,
        icon: 'delete_sweep',
        id: this.id,
        location: this.sort_index,
        type : 'facility',
        //iconUrl: ASSETS_URL+'/green.png',
        element:this,
        // iconUrl: ASSETS_URL+'/markers/facility-green.png?id='+this.id,
        iconUrl: this.getIconUrl(),
        shifted: false,
        latitude_temp: null,
        longitude_temp: null
      }
    }else if (this.entity_type == "yard"){
      obj ={
        latitude: parseFloat(this.entity.latitude),
        longitude: parseFloat(this.entity.longitude),
        label: "",
        name : this.entity.yard_name,
        icon: 'location_on',
        location: this.sort_index,
        id: this.id,
        type : 'yard',
        //iconUrl: ASSETS_URL+'/green.png',
        element:this,
        // iconUrl: ASSETS_URL+'/markers/yard-green.png?id='+this.id,
        iconUrl: this.getIconUrl(),
        shifted: false,
        latitude_temp: null,
        longitude_temp: null
      }
    }else {
      obj={
        latitude: parseFloat(this.entity.site.latitude),
        longitude: parseFloat(this.entity.site.longitude),
        label: this.entity.asset_size + '',
        name : "example",
        icon: 'assignment',
        id: this.id,
        type : 'serviceorder',
        //iconUrl: ASSETS_URL+'/green.png'
        element:this,
        location: this.sort_index,
        // iconUrl: ASSETS_URL+'/markers/' +Utils.getIconForOrder(this.entity)+'?id='+this.id,
        iconUrl: this.getIconUrl(),
        shifted: false,
        latitude_temp: null,
        longitude_temp: null
      }
    }
    //console.log('ONJ',obj);
    return obj;
  }

  public getContactName():string{
    if (this.entity instanceof Order){
      return this.entity.site.contact_name;
    }
    if (this.entity instanceof Yard){
      return this.entity.contact_name;
    }
    if (this.entity instanceof Facility){
      return this.entity.contact_name;
    }
    return "";
  }

  public getContactEmail():string{
    if (this.entity instanceof Order){
      return this.entity.site.contact_email;
    }
    if (this.entity instanceof Yard){
      return this.entity.contact_email;
    }
    if (this.entity instanceof Facility){
      return this.entity.contact_email;
    }
    return "";
  }

  public getContactPhoneNumber():string{
    if (this.entity instanceof Order){
      return this.entity.site.contact_phone;
    }
    if (this.entity instanceof Yard){
      return this.entity.contact_phone;
    }
    if (this.entity instanceof Facility){
      return this.entity.contact_phone;
    }
    return "";
  }

  // public getLatLng():CustomLatLng{
  //   var res=null;
  //   if (this.entity instanceof Facility){
  //     res=new CustomLatLng(parseFloat(this.entity.latitude),parseFloat(this.entity.longitude));
  //   }else if (this.entity instanceof Yard){
  //     res=new CustomLatLng(parseFloat(this.entity.latitude),parseFloat(this.entity.longitude));
  //   }else if (this.entity instanceof Order)
  //     res=new CustomLatLng(parseFloat(this.entity.site.latitude),parseFloat(this.entity.site.longitude));
  //   return res;
  // }

  public getLatLng(){
     var res=null;
      if (this.entity instanceof Facility){
        res= this.entity.latitude+","+this.entity.longitude;
      }else if (this.entity instanceof Yard){
        res= this.entity.latitude+","+this.entity.longitude;
      }else{
        res= this.entity.site.latitude+","+this.entity.site.longitude;
      }
      return res;
  }


  getIconUrl(){
    var iconUrl = ASSETS_URL+'/markers/';
    if (this.entity instanceof Yard){
      iconUrl = iconUrl + "yard-blue.png";
    }
    if (this.entity instanceof Facility){
      iconUrl = iconUrl + 'facility-yellow.png';
    }else{
      var iconName = "";
      switch(this.entity.purpose_of_service){
        case 1: iconName = 'order-delivery-green.png'; break;
        case 2: iconName = 'order-removal-green.png'; break;
        case 3: iconName = 'order-swap-green.png'; break;
        case 4: iconName = 'order-relocate-green.png'; break;
        default: iconName = '';
      }
      iconUrl = iconUrl + iconName;
    }
    return iconUrl;
  }

  getStatus() {
    return RouteItem.STATUS_ENUM[this.status];
  }

}
