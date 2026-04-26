import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';

import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { AuditChangesLogsRoutes } from './app-audit-changes-logs-routing.module';
import { AuditChangesLogsListComponent } from './audit-changes-logs-list/audit-changes-logs-list.component';


@NgModule({
  declarations: [AuditChangesLogsListComponent],
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
    SharedMaterialModule,
    SharedPrimengModule,
    MatCardModule,
    MatListModule,
    RouterModule.forChild(AuditChangesLogsRoutes)

  ]
})
export class AppAuditChangesLogsModule { }
