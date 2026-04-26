import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { MatIconModule } from '@angular/material/icon';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { TreeTableModule } from 'primeng/treetable';
import { TableModule } from 'primeng/table';
import { AppLeadsActivitiesListComponent } from './LeadsActivities/app-leads-activities-list/app-leads-activities-list.component';
import { AppLeadsActivitiesFormComponent } from './LeadsActivities/app-leads-activities-form/app-leads-activities-form.component';
import { AppActivitySearchModule } from './LeadsActivities/app-activityAdvancedSearch/advancedsearch.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PerfectScrollbarModule } from 'app/shared/components/perfect-scrollbar';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { LeadsCustomersFormComponent } from './leads-customers/leads-customers-form/leads-customers-form.component';
import { LeadsCustomersListComponent } from './leads-customers/leads-customers-list/leads-customers-list.component';
import { CRMRoutes } from './crm.routing.module';
import { AppLeadsAdvancedSearchModule } from '../general/app-searchs/app-leaded-customer-search/leadssearch.module';
import { PotentialCustomersComponent } from './CRMreports/PotentialCustomerReports/potential-customers.component';
import { OpportunitiesFormComponent } from './Opportunities/opportunities-form/opportunities-form.component';
import { OpportunitiesComponent } from './Opportunities/opportunities/opportunities.component';
import { OpportunitiesModule } from '../general/app-searchs/opportunities-search/opportunities.module';
import { PriceOffersListComponent } from './PriceOffers/price-offers-list/price-offers-list.component';
import { PriceOffersFormComponent } from './PriceOffers/price-offers-form/price-offers-form.component';
import { PriceOffersAdvancedSearchModule } from './PriceOffers/price-offers-advanced-search/advancedsearch.module';
import { AppGeneralAttachmentModule } from '../general/app-general-attachment/app-general-attachment.module';
import { FollowUpComponent } from './app-FollowUp/follow-up/follow-up.component';
import { FollowUpFormComponent } from './app-FollowUp/follow-up-form/follow-up-form.component';
import { CrmdashboredComponent } from './CRMdashboared/crmdashboredform/crmdashbored.component';
import { PerformanceTrackingComponent } from './CRMreports/PerformanceTrackingRpt/performance-tracking.component';
import { ChartModule } from 'primeng/chart';
import { FollowUpModule } from '../general/app-searchs/follow-up-search/follow-up.module';
@NgModule({
  declarations: [
    AppLeadsActivitiesListComponent,
    AppLeadsActivitiesFormComponent,
    LeadsCustomersListComponent,
    LeadsCustomersFormComponent,
    PotentialCustomersComponent,
    OpportunitiesComponent,
    OpportunitiesFormComponent,
    PriceOffersListComponent,
    PriceOffersFormComponent,
    OpportunitiesFormComponent,
    FollowUpComponent,
    FollowUpFormComponent,
    CrmdashboredComponent,
    PerformanceTrackingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    TranslateModule,
    ReactiveFormsModule,
    SharedMaterialModule,
    SharedPipesModule,
    FlexLayoutModule,
    AutoCompleteModule,
    MatIconModule,
    TreeTableModule,
    TableModule,
    SharedPrimengModule,    
    AppActivitySearchModule,
    AppGeneralAttachmentModule,
    PriceOffersAdvancedSearchModule,
    CommonModule,
    RouterModule.forChild(CRMRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgxDatatableModule,
    NgApexchartsModule,
    NgxEchartsModule,
    FlexLayoutModule,
    NgChartsModule,
    ChartModule,
    SharedPipesModule,
    SharedMaterialModule,
    SharedPrimengModule,
    DropdownModule,
    PerfectScrollbarModule,
    AutoCompleteModule,
    MatIconModule,
    TreeTableModule,
    TableModule,
    AppLeadsAdvancedSearchModule,
    OpportunitiesModule,
    FollowUpModule
  ]
})
export class AppCRMModule { }
