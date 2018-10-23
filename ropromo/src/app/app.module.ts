declare var google: any;
import {BrowserModule} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {Routes, RouterModule} from '@angular/router'
import {NgModule, ApplicationRef} from '@angular/core';
import {HttpModule} from '@angular/http';
import { NguiMapModule } from '@ngui/map';
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {MatInputModule} from '@angular/material';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MaterializeModule } from "angular2-materialize";


import {AppComponent} from './app.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { HomeComponent } from './components/home/home.component';
import { TrialComponent } from './components/trial/trial.component';

//Services


// Components


const routes: Routes = [
  {path: '', component: HomeComponent, data: {title: 'Home'}},
  {path: 'pricing', component: PricingComponent, data: {title: 'Pricing Details'}},
  {path: '**', redirectTo: '/', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    PricingComponent,
    HomeComponent,
    TrialComponent,
  ],
  imports: [
    MaterializeModule,
    MatInputModule,
    HttpModule,
    BrowserModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    FormsModule,
    RouterModule.forRoot(routes),

  ],
  providers: [

  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
