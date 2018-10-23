declare var google: any;
import {BrowserModule} from '@angular/platform-browser';
import {Routes, RouterModule} from '@angular/router'
import {NgModule, ApplicationRef} from '@angular/core';
import {HttpModule} from '@angular/http';
import { NguiMapModule } from '@ngui/map';
import {PROD_API_KEY, DEV_API_KEY} from './common/app-conf';
import {MaterializeModule} from 'angular2-materialize';
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatInputModule} from '@angular/material';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import { LZStringModule, LZStringService } from 'ng-lz-string';
import {SigninComponent} from './components/auth/signin/signin.component';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
//Services
import {AuthGuard} from './services/auth/auth.guard.service';
import {CompaniesService} from './services/companies/companies.service';
import {CustomerService} from './services/customer/customer.service';
import {SitesService} from './services/sites/sites.service';
import {OrdersService} from './services/orders/orders.service';
import {YardsService} from './services/yards/yards.service';
import {DriversService} from './services/drivers/drivers.service';
import {RoutesService} from './services/routes/routes.service';
import {CsvService} from './services/csv/csv.service';
import {VehiclesService} from './services/vehicles/vehicles.service';
import {FacilitiesService} from './services/facilities/facilities.service';
import {AuthService} from './services/auth/auth.service';
import {SharedService} from './services/shared/shared.service';
import {SMSService} from './services/sms/sms.service';
import {AssetsService} from './services/assets/assets.service';
import {MessagesService} from './services/messages/messages.service';
import {NotificationService} from './services/notifications/notifications.service';
import {IncidentsService} from './services/incidents/incidents.service';
import {RoutePositionService} from './services/route_position/route_position.service';
import {ProblemsService} from './services/problems/problems.service';
import {AttachmentsService} from './services/attachments/attachments.service';
import {ComputeService} from './services/compute/compute.service';

// Components
import {ChartsModule} from 'ng2-charts';
import {PaginationComponent} from './components/common/pagination/pagination.component';
import {IconTooltipComponent} from './components/common/icon-tooltip/icon-tooltip.component';
import {SideNavComponent} from './components/common/side-nav/side-nav.component';
import {CompanyAdministratorComponent} from './components/companies/company-administrator/company-administrator.component';
import {CompanyDetailsComponent} from './components/companies/company-details/company-details.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {PhoneNumberPipe} from './pipes/phone-number.pipe';
import {PhoneDirectiveDirective} from './directives/phone-directive.directive';
import {UsersComponent} from './components/users/users/users.component';
import {CompanyModalComponent} from './components/companies/company-modal/company-modal.component';
import {CustomersComponent} from './components/customers/customers/customers.component';
import {SaveCustomerComponent} from './components/customers/save-customer/save-customer.component';
import {DetailsCustomerComponent} from './components/customers/details-customer/details-customer.component';
import {SaveAddressesComponent} from './components/customers/save-addresses/save-addresses.component';
import {SaveUserComponent} from './components/users/save-user/save-user.component';
import {SendSMSComponent} from './components/users/send-sms-modal/send-sms.component';
import {CsvFileComponent} from './components/common/csv-file/csv-file.component';
import {SitesManagementComponent} from './components/sites/sites-management/sites-management.component';
import {SaveSiteComponent} from './components/sites/save-site/save-site.component';
import {SavePricingComponent} from './components/companies/save-pricing/save-pricing.component';
import {OrdersAdministratorComponent} from './components/orders/orders-administrator/orders-administrator.component';
import {SaveOrderComponent} from './components/orders/save-order/save-order.component';
import {AdministratorVehiclesComponent} from './components/vehicles/administrator-vehicles/administrator-vehicles.component';
import {SaveVehiclesComponent} from './components/vehicles/save-vehicles/save-vehicles.component';
import {DetailsVehiclesComponent} from './components/vehicles/details-vehicles/details-vehicles.component';
import {DetailsOrdersComponent} from './components/orders/details-orders/details-orders.component';
import {AdministratorDisposalComponent} from './components/disposal/administrator-disposal/administrator-disposal.component';
import {SaveDisposalComponent} from './components/disposal/save-disposal/save-disposal.component';
import {DetailsDisposalComponent} from './components/disposal/details-disposal/details-disposal.component';
import {DetailsSiteComponent} from './components/sites/details-site/details-site.component';
import {DetailsUsersComponent} from './components/users/details-users/details-users.component';
import {AdministratorYardsComponent} from './components/yards/administrator-yards/administrator-yards.component';
import {SaveYardsComponent} from './components/yards/save-yards/save-yards.component';
import {DetailsYardsComponent} from './components/yards/details-yards/details-yards.component';
import {AdministratorRouteComponent} from './components/routes/administrator-route/administrator-route.component';
import {SaveRouteComponent} from './components/routes/save-route/save-route.component';
import {DetailsRouteComponent} from './components/routes/details-route/details-route.component';
import {DateComponent} from './components/common/date/date.component';
import {SearchAddressComponent} from './components/common/search-address/search-address.component';
import {MapHandlerComponent} from './components/common/map-handler/map-handler.component';
import {AssetsInventoryComponent} from './components/assets/assets-inventory/assets-inventory.component';
import {AdministratorMessageComponent} from './components/messages/administrator-message/administrator-message.component';
import {ThreadMessageComponent} from './components/messages/thread-message/thread-message.component';
import {SaveMessageComponent} from './components/messages/save-message/save-message.component';
import {WidgetNotificationComponent} from './components/notifications/widget-notification/widget-notification.component';
import {IncidentReportComponent} from '../app/components/incidents/incidents.component';
import {ProblemsComponent} from '../app/components/problems/problems.component';
import {ListAttachmentsComponent} from './components/attachments/list-attachments/list-attachments.component';
import {ComputeComponent} from './components/compute/compute.component';
import { TesterComponent } from './tester/tester.component';
import { DriversComponent } from './components/drivers/drivers-administrator/drivers.component';
import { DetailsDriversComponent } from './components/drivers/details-drivers/details-drivers.component';
import { SaveDriversComponent } from './components/drivers/save-drivers/save-drivers.component';
import { ServiceDetailComponent } from './components/compute/service-detail/service-detail.component';
import { SaveIncidentComponent } from './components/incidents/save-incident/save-incident.component';
import { RegularSigninComponent } from './components/auth/regular-signin/regular-signin.component';

const routes: Routes = [
  {path: '', component: DashboardComponent, canActivate: [AuthGuard], data: {title: 'Dashboard'}},
  {path: 'compute', component: ComputeComponent, data: {title: 'Compute Interface'}},
  {path: 'auth/signin', component: SigninComponent, data: {title: 'Sign In'}},
  {path: 'settings/companies', canActivate: [AuthGuard], component: CompanyAdministratorComponent, data: {title: 'Companies'}},
  {path: 'settings/companies/:id', canActivate: [AuthGuard], component: CompanyDetailsComponent, data: {title: 'Company Details'}},
  {path: 'settings/users', canActivate: [AuthGuard], component: UsersComponent, data: {title: 'Users'}},
  {path: 'settings/users_details/:email', canActivate: [AuthGuard], component: DetailsUsersComponent, data: {title: 'User Details'}},
  {path: 'management/customers', canActivate: [AuthGuard], component: CustomersComponent, data: {title: 'Customers'}},
  {path: 'management/customers/:id', canActivate: [AuthGuard], component: DetailsCustomerComponent, data: {title: 'Customer Details'}},
  {path: 'management/sites', canActivate: [AuthGuard], component: SitesManagementComponent, data: {title: 'Sites'}},
  {path: 'management/sites_details/:id', canActivate: [AuthGuard], component: DetailsSiteComponent, data: {title: 'Site Details'}},
  {path: 'management/orders', component: OrdersAdministratorComponent, data: {title: 'Orders'}},//canActivate:[AuthGuard],   Turn this back on later
  {path: 'management/orders/:id', canActivate: [AuthGuard], component: DetailsOrdersComponent, data: {title: 'Order Details'}},
  {path: 'management/routes', canActivate: [AuthGuard], component: AdministratorRouteComponent, data: {title: 'Routes'}},
  {path: 'management/routes/:id', canActivate: [AuthGuard], component: DetailsRouteComponent, data: {title: 'Route Details'}},
  {path: 'management/messages', canActivate: [AuthGuard], component: AdministratorMessageComponent, data: {title: 'Messages'}},
  {path: 'management/messages/:id', canActivate: [AuthGuard], component: ThreadMessageComponent, data: {title: 'Messages of this thread'}},
  {path: 'settings/drivers', canActivate: [AuthGuard], component: DriversComponent, data: {title: 'Drivers'}},
  {path: 'settings/drivers_details/:id', canActivate: [AuthGuard], component: DetailsDriversComponent, data: {title: 'Driver Details'}},
  {path: 'settings/vehicles', canActivate: [AuthGuard], component: AdministratorVehiclesComponent, data: {title: 'Vehicles'}},
  {path: 'settings/vehicles_details/:id', canActivate: [AuthGuard], component: DetailsVehiclesComponent, data: {title: 'Vehicle Details'}},
  {path: 'settings/disposals', canActivate: [AuthGuard], component: AdministratorDisposalComponent, data: {title: 'Facilities'}},
  {path: 'settings/disposals_details/:id', canActivate: [AuthGuard], component: DetailsDisposalComponent, data: {title: 'Facility Details'}},
  {path: 'settings/yards', canActivate: [AuthGuard], component: AdministratorYardsComponent, data: {title: 'Yards'}},
  {path: 'settings/yards_details/:id', canActivate: [AuthGuard], component: DetailsYardsComponent, data: {title: 'Yard Details'}},
  {path: 'reports/assets', canActivate: [AuthGuard], component: AssetsInventoryComponent, data: {title: 'Assets Report'}},
  {path: 'reports/incidents', canActivate: [AuthGuard], component: IncidentReportComponent, data: {title: 'Incidents Report'}},
  {path: 'reports/problems', canActivate: [AuthGuard], component: ProblemsComponent, data: {title: 'Problems Report'}},
  {path: '**', redirectTo: '/', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    PaginationComponent,
    IconTooltipComponent,
    SideNavComponent,
    SigninComponent,
    CompanyAdministratorComponent,
    CompanyDetailsComponent,
    PhoneDirectiveDirective,
    DashboardComponent,
    UsersComponent,
    CompanyModalComponent,
    CustomersComponent,
    SaveCustomerComponent,
    DetailsCustomerComponent,
    SaveAddressesComponent,
    SaveUserComponent,
    SendSMSComponent,
    CsvFileComponent,
    SitesManagementComponent,
    SaveSiteComponent,
    SavePricingComponent,
    OrdersAdministratorComponent,
    SaveOrderComponent,
    AdministratorVehiclesComponent,
    SaveVehiclesComponent,
    DetailsVehiclesComponent,
    DetailsOrdersComponent,
    AdministratorDisposalComponent,
    SaveDisposalComponent,
    DetailsDisposalComponent,
    DetailsSiteComponent,
    DetailsUsersComponent,
    AdministratorYardsComponent,
    SaveYardsComponent,
    DetailsYardsComponent,
    AdministratorRouteComponent,
    SaveRouteComponent,
    DetailsRouteComponent,
    DateComponent,
    SearchAddressComponent,
    MapHandlerComponent,
    AssetsInventoryComponent,
    AdministratorMessageComponent,
    ThreadMessageComponent,
    SaveMessageComponent,
    WidgetNotificationComponent,
    IncidentReportComponent,
    ProblemsComponent,
    ListAttachmentsComponent,
    ComputeComponent,
    TesterComponent,
    DriversComponent,
    DetailsDriversComponent,
    SaveDriversComponent,
    ServiceDetailComponent,
    SaveIncidentComponent,
    RegularSigninComponent
  ],
  imports: [
    LZStringModule,
    MaterializeModule,
    MatInputModule,
    BrowserModule,
    HttpModule,
    ChartsModule,
    BrowserModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    FormsModule,
    RouterModule.forRoot(routes),
    NguiMapModule.forRoot({
        apiUrl: 'https://maps.google.com/maps/api/js?key=' + PROD_API_KEY
    }),
  ],
  providers: [
    AuthGuard,
    CompaniesService,
    AuthService,
    CustomerService,
    SitesService,
    OrdersService,
    CsvService,
    VehiclesService,
    FacilitiesService,
    YardsService,
    RoutesService,
    SharedService,
    PhoneNumberPipe,
    SMSService,
    AssetsService,
    MessagesService,
    NotificationService,
    IncidentsService,
    RoutePositionService,
    ProblemsService,
    AttachmentsService,
    ComputeService,
    DriversService,
    LZStringService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
