import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
import { AppLeadsActivitiesListComponent } from './LeadsActivities/app-leads-activities-list/app-leads-activities-list.component';
import { AppLeadsActivitiesFormComponent } from './LeadsActivities/app-leads-activities-form/app-leads-activities-form.component';
import { LeadsCustomersFormComponent } from './leads-customers/leads-customers-form/leads-customers-form.component';
import { LeadsCustomersListComponent } from './leads-customers/leads-customers-list/leads-customers-list.component';
import { PotentialCustomersComponent } from './CRMreports/PotentialCustomerReports/potential-customers.component';
import { OpportunitiesFormComponent } from './Opportunities/opportunities-form/opportunities-form.component';
import { OpportunitiesComponent } from './Opportunities/opportunities/opportunities.component';
import { FollowUpComponent } from './app-FollowUp/follow-up/follow-up.component';
import { FollowUpFormComponent } from './app-FollowUp/follow-up-form/follow-up-form.component';
import { PriceOffersListComponent } from './PriceOffers/price-offers-list/price-offers-list.component';
import { PriceOffersFormComponent } from './PriceOffers/price-offers-form/price-offers-form.component';
import { CrmdashboredComponent } from './CRMdashboared/crmdashboredform/crmdashbored.component';
import { PerformanceTrackingComponent } from './CRMreports/PerformanceTrackingRpt/performance-tracking.component';

export const CRMRoutes: Routes = [
  {
    path: '',
    children: [ 
      {
        path: 'LeadsCustomersList',
        component: LeadsCustomersListComponent,
        data: { title: 'LeadsCustomersList', breadcrumb: 'LeadsCustomersList', roles: config.authRoles.sa }
      },
      { 
        path: 'LeadsCustomersForm',
        component: LeadsCustomersFormComponent,
        data: { title: 'LeadsCustomersForm', breadcrumb: 'LeadsCustomersForm', roles: config.authRoles.sa }
      },
      { 
        path: 'LeadsActivitiesList',
        component: AppLeadsActivitiesListComponent,data: {title: 'LeadsActivitiesList',breadcrumb: 'ListOfInteractiveActivities',roles: config.authRoles.sa}
      },
      {
        path: 'LeadsActivitiesForm',
        component: AppLeadsActivitiesFormComponent, data: {title: 'LeadsActivitiesForm',breadcrumb: 'InteractiveActivities',roles: config.authRoles.sa}
      },
      {
        path: 'OpportunitiesList',
        component: OpportunitiesComponent,data: {title: 'Opportunities',breadcrumb: 'Opportunities',roles: config.authRoles.sa}
      },
      {
        path: 'OpportunitiesForm',
        component: OpportunitiesFormComponent, data: {title: 'OpportunitiesForm',breadcrumb: 'OpportunitiesForm',roles: config.authRoles.sa}
      },
      {
        path: 'GetPotentialCustomersReportForm',
        component: PotentialCustomersComponent, data: { title: 'LeadsCustomersReport' ,breadcrumb: 'LeadsCustomersReport',roles: config.authRoles.sa}
      },
      
      {
        path: 'PriceoffersList',
        component: PriceOffersListComponent, data: { title: 'ListOfPriceOffers' ,breadcrumb: 'ListOfPriceOffers',roles: config.authRoles.sa}
      },
      {
        path: 'PriceoffersForm',
        component: PriceOffersFormComponent, data: { title: 'PriceOffer' ,breadcrumb: 'PriceOffer',roles: config.authRoles.sa}
      }
      ,
      {
        path: 'FollowUp',
        component: FollowUpComponent, data: {title: 'FollowUpList',breadcrumb: 'FollowUpList',roles: config.authRoles.sa}
      },
      {
        path: 'FollowUpForm',
        component: FollowUpFormComponent, data: {title: 'FollowUpForm',breadcrumb: 'FollowUpForm',roles: config.authRoles.sa}
      },
      {
        path: 'CRMdashbored',
        component: CrmdashboredComponent, data: {title: 'CRMdashbored',breadcrumb: 'CRMdashbored',roles: config.authRoles.sa}
      },
      {
        path: 'GetPerformanceTrackingForm',
        component: PerformanceTrackingComponent, data: {title: 'PerformanceTrackingPerBranch',breadcrumb: 'PerformanceTrackingPerBranch',roles: config.authRoles.sa}
      }

      
      
    ]
  }
];

