import { Injectable} from '@angular/core';
import { Observable } from "rxjs/Rx"
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



    refreshRoutes(routes,date){
      let num_of_routes = routes.length;

        // create observable
        const simpleObservable = new Observable((observer) => {

            // observable execution
            observer.next(this.routesService.deleteRoutesByDate(date));
            for(let i=0;i<num_of_routes;i++){
              let route = routes[i];
              observer.next(this.routesService.saveRoutes(route));
            }
            observer.complete();
        })
        // subscribe to the observable
        console.log('just before subscribe');
        simpleObservable.subscribe({
          next: x => console.log('got value ' + x),
          error: err => console.error('something wrong occurred: ' + err),
          complete: () => console.log('done'),
        });
        console.log('just after subscribe');
      }
}
