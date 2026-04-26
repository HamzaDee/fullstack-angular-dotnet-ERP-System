import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountsGroupsFormComponent } from './accounts-groups-form/accounts-groups-form.component';
import { AccountsGroupsListComponent } from './accounts-groups-list/accounts-groups-list.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { AppGeneralAttachmentModule } from 'app/views/general/app-general-attachment/app-general-attachment.module';
import { AppgeneralvouchersModule } from 'app/views/general/app-generalvoucher/generalvoucher.module';
import { AppSearchModule } from 'app/views/general/app-searchs/app-searchs.module';
import { AppShowCostCenterModule } from 'app/views/general/app-showcostcenter/showcostcenter.module';
import { AppShowProjectsModule } from 'app/views/general/app-showprojects/showprojects.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AccountsGroupsRoutes } from './accounts-groups-routing.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AccountsGroupsListComponent,
    AccountsGroupsFormComponent
  ],
  imports: [
 CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgxDatatableModule,
    NgApexchartsModule,
    NgxEchartsModule,
    FlexLayoutModule,
    NgChartsModule,
    SharedPipesModule,
    SharedPrimengModule,
    SharedMaterialModule,
    AppGeneralAttachmentModule,
    AppgeneralvouchersModule,
    AppSearchModule,   
    AppShowCostCenterModule,
    AppShowProjectsModule,
    RouterModule.forChild(AccountsGroupsRoutes)  
    ]
})
export class AccountsGroupsModule { }
