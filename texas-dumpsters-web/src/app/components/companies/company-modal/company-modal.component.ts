import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { CompaniesService } from '../../../services/companies/companies.service';
import { isNullOrUndefined} from "util";
import { PhoneNumberPipe } from '../../../pipes/phone-number.pipe';
import {SharedService} from "../../../services/shared/shared.service";

@Component({
    selector: 'app-company-modal',
    templateUrl: './company-modal.component.html',
    styleUrls: ['./company-modal.component.css']
})
export class CompanyModalComponent implements OnInit {

    @Output() reloadData = new EventEmitter();
    private company;
    private title;
    // add companies modal
    private companyModal = new EventEmitter<string | MaterializeAction>();
    // add companies toasts
    private addCompanyToast = new EventEmitter<string | MaterializeAction>();
    private addCompanyToastError = new EventEmitter<string | MaterializeAction>();
    // Address georeference fails toast
    private addressToastError = new EventEmitter<string | MaterializeAction>();
    // delete companies toasts
    private deleteCompanyToast = new EventEmitter<string | MaterializeAction>();
    private deleteCompanyToastError = new EventEmitter<string | MaterializeAction>();

    constructor(private companiesService: CompaniesService, private sharedService: SharedService) {
        this.company = {};
    }

    ngOnInit() {
    }

    /** new company function **/
    newcompany() {
        this.title = 'Add';
        this.company = {};
        this.openModal1();
    }

    /** edit company function **/
    editCompany(company) {
        this.title = 'Edit';
        this.company = company;
        this.openModal1();
    }

    /** edit company function **/
    deleteCompany(company) {
        this.company = company;
        this.company.active = false;
        this.company.service_pricing = undefined;
        this.companiesService.addCompany(this.company).then(res => {
            if (res != null) {
                this.deleteCompanyToast.emit('toast');
            } else {
                this.deleteCompanyToastError.emit('toast');
            }
            this.reloadData.emit();
        });

    }

    /** add company function **/
    addCompany() {
        let addressToGeoReverse = this.company.address + ' ' + this.company.city + ' ' + this.company.zipcode;
        this.sharedService.geoReverseAddressToLatLong(addressToGeoReverse).then(res => {
            if (res) {
                let lat = res.lat.toString();
                let lng = res.lng.toString();

                this.company.latitude = lat;
                this.company.longitude = lng;

                this.closeModal1();

                this.companiesService.addCompany(this.company).then(res2 => {
                    if (res2 != null) {
                        this.addCompanyToast.emit('toast');
                    } else {
                        this.addCompanyToastError.emit('toast');
                    }
                    this.reloadData.emit();
                    this.closeModal1();
                });
            }
            else {
                this.addressToastError.emit('toast');
            }
        });
    }


    /**
     * file functions
     *
     * */
    uploadFile() {
        this.company.service_pricing = undefined;
        var temp = (<any>document.getElementById('logo_file'));
        if (isNullOrUndefined(temp) || isNullOrUndefined(temp.files[0])) {
            this.addCompanyToastError.emit('toast');
            return;
        }
        var file = temp.files[0];
        var reader = new FileReader();
        reader.onload = (e) => {
            var base64String = reader.result;
            base64String = base64String.split(',')[1];
            this.saveFile(base64String, file);
        }
        reader.onerror = (e) => {
            this.addCompanyToastError.emit('toast');
        };
        reader.readAsDataURL(file);

    }

    saveFile(base64String, file) {
        base64String = (base64String + '===').slice(0, base64String.length + (base64String.length % 4));
        base64String.replace(/-/g, '+').replace(/_/g, '/');
        this.company.logo_name = file.name.replace(/[^a-zA-Z0-9.]/g, ''); // fix to remove special chars
        this.company.logo_data = base64String;
        this.addCompany();
    }

    /** modals functions **/
    openModal1() {
        this.companyModal.emit({action: 'modal', params: ['open']});
    }

    closeModal1() {
        this.companyModal.emit({action: 'modal', params: ['close']});
    }

    // Phone number change model update
    private changeModel(ev) {
        this.company.contact_phone = ev;
    }

    setAddressInModel($event) {
        // this $event object brings the info. in this case the addess value
        this.company.address = $event;
    }

    setCityInModel($event) {
        this.company.city = $event
    }

    setStateInModel($event) {
        this.company.state = $event
    }

    setZipCodeInModel($event) {
        this.company.zipcode = $event;
    }
}
