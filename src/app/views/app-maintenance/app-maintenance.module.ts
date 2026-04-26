import { PerfectScrollbarModule } from 'app/shared/components/perfect-scrollbar';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { NgSelect2Module } from 'ng-select2';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { AppMaintenanceRoutes } from './app-maintenance.routing';
import { MaintorderformComponent } from './MaintenanceOrder/MaintenanceOrderForm/maintorderform.component';
import { MaintorderlistComponent } from './MaintenanceOrder/MaintenanceOrderList/maintorderlist.component';
import { MaintadvancedsearchComponent } from './MaintenanceOrder/MaintenanceOrderAdvancedSearch/maintadvancedsearch.component';
import { MaintenanceRequestsFormComponent } from './app-MaintenanceRequests/maintenance-requests-form/maintenance-requests-form.component';
import { MaintenanceRequestsListComponent } from './app-MaintenanceRequests/maintenance-requests-list/maintenance-requests-list.component';
import { MaintenanceRequestsModule } from '../general/app-searchs/app-maintenance-requests-search/maintenance-requests.module';
import { AppGeneralAttachmentModule } from "app/views/general/app-general-attachment/app-general-attachment.module";
import { MaintenanceorderrptComponent } from './app-MaintenanceReports/MaintenanceOrderRpt/maintenanceorderrpt.component';
import { MaintenanceFaultReportComponent } from './app-MaintenanceReports/maintenance-fault-report/maintenance-fault-report.component';
import { MaintenanceRequestReportComponent } from './app-MaintenanceReports/maintenance-request-report/maintenance-request-report.component';
import { TechnicalReportComponent } from './app-MaintenanceReports/technical-report/technical-report.component';
@NgModule({
  declarations: [
    MaintenanceRequestsListComponent,
    MaintenanceRequestsFormComponent,
    MaintorderformComponent,
    MaintorderlistComponent,
    MaintadvancedsearchComponent,
    MaintenanceorderrptComponent,
    MaintenanceRequestReportComponent,
    TechnicalReportComponent,
    
    MaintorderformComponent,MaintorderlistComponent,MaintadvancedsearchComponent,
    MaintenanceorderrptComponent,
    MaintenanceFaultReportComponent
   ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    SharedMaterialModule,
    FlexLayoutModule,
    PerfectScrollbarModule,
    SharedComponentsModule,
    NgSelect2Module,
    DragDropModule,
    DropdownModule,
    ButtonModule,
    ToolbarModule,
    TableModule,
    TreeTableModule,
    AppGeneralAttachmentModule,
    RouterModule.forChild(AppMaintenanceRoutes),
    MaintenanceRequestsModule
  ],

})
export class AppMaintenanceModule { }