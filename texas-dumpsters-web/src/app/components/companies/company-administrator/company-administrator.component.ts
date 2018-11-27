import {Component, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {MaterializeDirective, MaterializeAction} from 'angular2-materialize';
import {CompaniesService} from '../../../services/companies/companies.service';
import {PAGE_SIZE} from '../../../common/app-conf';
import {Router, ActivatedRoute} from '@angular/router';
import any = jasmine.any;
import {AuthService} from '../../../services/auth/auth.service';
import {CompanyModalComponent} from '../company-modal/company-modal.component';
import {BaseComponent} from '../../../common/base-component';

@Component({
    selector: 'app-company-administrator',
    templateUrl: './company-administrator.component.html',
    styleUrls: ['./company-administrator.component.css']
})
export class CompanyAdministratorComponent extends BaseComponent implements OnInit {

    private company;
    private selectedCompany;
    private companiesList = [];
    private pageInfo = {page: 1, page_size: PAGE_SIZE};
    totalCompanies = 0;
    // child component functions
    @ViewChild(CompanyModalComponent) companyModal: CompanyModalComponent;
    // add company modal
    private addUserModal = new EventEmitter<string | MaterializeAction>();
    // delete companies toasts
    private deleteCompanyToast = new EventEmitter<string | MaterializeAction>();
    private deleteCompanyToastError = new EventEmitter<string | MaterializeAction>();

    constructor(private authService: AuthService, private companiesService: CompaniesService,
                private router: Router, actRoute: ActivatedRoute) {
        super(actRoute);
        this.company = {};
    }

    ngOnInit() {
        super.ngOnInit();
        $(document).ready(function () {
            $('.collapsible').collapsible();
        });
        this.getCompanies();
    }

    getCompanies() {
        debugger
        this.companiesService.getCompaniesByUser(this.pageInfo).then(res => {
            this.companiesList = JSON.parse(res);
            this.totalCompanies = this.companiesList.length;
        });
    }

    /** go to details company function **/
    goToDetails(company) {
        this.router.navigate(['/settings/companies', company.id]);
        // this.router.navigate(["companies/company_details"], campany);
    }

    editCompany(company) {
        this.companyModal.editCompany(company);
    }

    addCompany() {
        this.companyModal.newcompany();
    }

    /** delete company function **/
    inactiveCompany(company) {
        this.company = company;
        this.companyModal.deleteCompany(company);
        /*		this.company.active = false;
                this.companiesService.addCompany(this.company).then(res=>{
                    if(res != null){
                        this.deleteCompanyToast.emit('toast');
                    }else{
                        this.deleteCompanyToastError.emit('toast');
                    }
                    this.getCompanies();
                });*/

    }

    onUserCreated() {
        this.addUserModal.emit({action: 'modal', params: ['close']});
    }

    changePage(page) {
        this.pageInfo.page = page + 1;
        this.getCompanies();
    }

    /**
     *
     * */
    addUserToCompany(company) {
        this.selectedCompany = company;
        // Before displaying the modal we need to add a delay in order to allow the ui to be drawn
        setTimeout(() => {
            this.addUserModal.emit({action: 'modal', params: ['open']});
        }, 100);
    }

    onAddUserCancelled() {
        this.selectedCompany = null;
        this.addUserModal.emit({action: 'modal', params: ['close']})
    }


}
