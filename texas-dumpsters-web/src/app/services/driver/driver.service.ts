import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Driver} from '../../model/driver';
import {SUCCESS, DRIVERS_URL} from '../../common/app-conf';
import {BaseService} from '../../common/base-service';
import {AuthService} from '../auth/auth.service';

@Injectable()
export class DriverService extends BaseService {

    constructor(private http: Http, private authService: AuthService) {
        super();
    }

    /**
     * Retrieves a Driver entity's information by ID.
     *
     * @param driverId: Driver key
     */
    getDriver(driverId: String): Promise<Driver> {

        super.showSpinner();

        return this.http.get(DRIVERS_URL + '?id=' + driverId).toPromise()
            .then(response => {

                super.hideSpinner();

                let res = response.json();

                if (res.status === SUCCESS) {

                    let driver: Driver = new Driver();
                    driver.parseServerResponse(res.response.driver);
                    return driver;

                } else {
                    return new Driver();
                }
            })
            .catch(this.handleError);
    }

    /**
     * Deletes a Driver entity by ID
     *
     * @param driverId: Driver key
     */
    public deleteDriver(driverId: String): Promise<boolean> {

        super.showSpinner();

        return this.http.delete(DRIVERS_URL + '?id=' + driverId).toPromise()
            .then(response => {

                super.hideSpinner();

                let res = response.json();

                if (res.status === SUCCESS) {
                    return true;
                } else {
                    return false;
                }
            })
            .catch(this.handleError);
    }

    /**
     * Saves a Driver entity to the datastore
     *
     * @param driverData: Driver data as JSON object
     */
    saveDriver(driverData): Promise<any> {

        console.log('posting the driver data to python code');
        console.log(driverData);

        super.showSpinner();

        return this.http.post(DRIVERS_URL, driverData).toPromise()
            .then(response => {
                super.hideSpinner();
                let res = response.json();
                console.log(res);
                return res;
            }).catch(err => console.log('error: %s', err));
    }

}
