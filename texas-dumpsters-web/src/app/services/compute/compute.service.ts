import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

// services
import {SitesService} from '../sites/sites.service'
import {OrdersService} from '../orders/orders.service'
import { RoutesService } from '../routes/routes.service'
import { BaseService} from '../../common/base-service';
import { AuthService } from '../auth/auth.service';
import { FacilitiesService } from '../facilities/facilities.service';
import { YardsService } from '../yards/yards.service';

// models
import { Customer } from '../../model/customer';
import { ServicesAddress } from '../../model/service_address';
import { PaginationResponse } from '../../model/pagination_response';

import { TRIGGER_COMPUTE_URL } from '../../common/app-conf';
import {ServiceRoute} from '../../model/route';
import {Utils} from '../../common/utils';


@Injectable()
export class ComputeService extends BaseService {

    private selectedCompany: string;
    private depots: any = [];
    private landfills: any = [];
    private assetsSizeList: any = [];
    private yardsList: any = [];
    private facilityList: any = [];
    private date: string;

    constructor(private http: Http, private authService: AuthService, private siteService: SitesService,
                private routesService: RoutesService, private orderService: OrdersService, private facilityService: FacilitiesService,
                private yardsService: YardsService) {
        super();

        this.orderService.getAssetsSizeList().then(res => this.assetsSizeList = res);

        this.facilityService.getFacilities(null).then(res => {
            this.facilityList = res.records;
            // Forming an array of depots
            for (let i = 0; i < this.facilityList.length; i++) {
                let Facility = {};
                Facility['latitude'] = parseFloat(this.facilityList[i].latitude);
                Facility['longitude'] = parseFloat(this.facilityList[i].longitude);
                this.depots.push(Facility);
            }
        });

        this.yardsService.getYards(null).then(res => {
            this.yardsList = res.records;
            // Forming an array of landfills
            for (let i = 0; i < this.yardsList.length; i++) {
                let Yard = {};
                Yard['latitude'] = parseFloat(this.yardsList[i].latitude);
                Yard['longitude'] = parseFloat(this.yardsList[i].longitude);
                this.landfills.push(Yard);
            }
        });

        this.date = Utils.date2FormmatedString(Utils.addDays(new Date, 1), 'MM/DD/YYYY');
    }

    // updateDatabase(response, ordersList): Promise<ServiceRoute[]> {
    //     let json_data = JSON.parse(response);
    //     let routes_list = json_data.routes;
    //     let num_routes = routes_list.length;
    //
    //     // TODO: finish adding individual routeItems to database linked to the appropriate site, facility, or yard
    //     let server_routes = [];
    //     for (let i = 0; i < num_routes; i++) {
    //         let route_object = {
    //             'company_key': this.selectedCompany,
    //             'date': this.date,
    //         };
    //         server_routes.push(route_object);
    //
    //     }
    //     this.routesService.addRoute(true,server_routes);
    //
    //     return null;
    // }


    // triggerCompute(ordersList): Promise<string> {
    //     super.showSpinner();
    //
    //     let data = {};
    //     let orders = [];
    //     let trucks = [];
    //     for (let i = 0; i < ordersList.length; i++) {
    //         let Order = {};
    //
    //         Order['order_id'] = ordersList[i].id;
    //         Order['customer_key'] = ordersList[i].customer_key;
    //         Order['quantity'] = parseInt(ordersList[i].quantity);
    //
    //         let order_site = ordersList[i].site;
    //         Order['site_id'] = order_site.id;
    //         Order['latitude'] = parseFloat(order_site.latitude);
    //         Order['longitude'] = parseFloat(order_site.longitude);
    //
    //         let size_string = parseInt(this.assetsSizeList[ordersList[i].asset_size - 1].name);
    //         Order['size'] = size_string;
    //         Order['type'] = ordersList[i].purpose_of_service;
    //         orders.push(Order);
    //     }
    //
    //     data['orders'] = orders;
    //     data['depots'] = this.depots;
    //     data['landfills'] = this.landfills;
    //     data['num_of_trucks'] = trucks;
    //
    //     return this.http.post(TRIGGER_COMPUTE_URL, data).toPromise().then(val => {
    //         super.hideSpinner();
    //         return this.updateDatabase(val['_body'], ordersList);
    //     }).catch(this.handleError);
    // }

    get_address_from_symbol(symbol, ordersList) {
        let address = '';
        let type = symbol.slice(0, 1);
        if (type === 'L') {
            let location_string = symbol.slice(1);
            let location_int = parseInt(location_string);
            address = this.yardsList[location_int].getFormattedAddress();
        } else if (type === 'H') {
            let location_string = symbol.slice(1);
            let location_int = parseInt(location_string);
            address = this.facilityList[location_int].getFormattedAddress();
        } else {
            let location_int = parseInt(symbol);
            // let order_site = this.ordersList[location_int].site;
            address = ordersList[location_int].getFormattedAddress();
        }
        return address;
    }

    set_selected_company(company) {
        this.selectedCompany = company;
    }


}
