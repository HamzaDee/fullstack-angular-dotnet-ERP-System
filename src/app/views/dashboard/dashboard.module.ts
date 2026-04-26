import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardRoutes } from './dashboard.routing';
import { AnalyticsComponent } from './analytics/analytics.component';
import { DashboardDarkComponent } from './dashboard-dark/dashboard-dark.component';
import { CryptocurrencyComponent } from './cryptocurrency/cryptocurrency.component';
import { DefaultDashboardComponent } from './default-dashboard/default-dashboard.component';
import { LearningManagementComponent } from './learning-management/learning-management.component';
import { AnalyticsAltComponent } from './analytics-alt/analytics-alt.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChartModule } from 'primeng/chart';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
/*imports primeng */
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { ReminderNotesFormComponent } from './dashboard/reminder-notes-form/reminder-notes-form.component';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationsListComponent } from 'app/views/dashboard/dashboard/notifications-list/notifications-list.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    NgChartsModule,
    TranslateModule,
    SharedMaterialModule,
    SharedPrimengModule,
    MatCardModule,
    ReactiveFormsModule,
    ChartModule,    
    NgxEchartsModule.forRoot({
      echarts
    }),    

    NgApexchartsModule,
    NgxDatatableModule,
    SharedPipesModule,
    RouterModule.forChild(DashboardRoutes,)
  ],
  declarations: [
    AnalyticsComponent,
    DashboardDarkComponent,
    CryptocurrencyComponent,
    DefaultDashboardComponent,
    LearningManagementComponent,
    AnalyticsAltComponent,
    DashboardComponent,    
    NotificationsListComponent ,
    ReminderNotesFormComponent],
  exports: [],
  providers: [    

  ]
})
export class DashboardModule {

}