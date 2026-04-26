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

import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';

import { UsersGroupsRoutes } from './app-users-groups-routing.module';
import { UsersGroupsListComponent } from './users-groups-list/users-groups-list.component';
import { UsersGroupsFormComponent } from './users-groups-list/users-groups-form/users-groups-form.component';
import { GroupuserpermissinsFormComponent } from './users-groups-list/group-user-permission-form/groupuserpermissins-form.component';


@NgModule({
  declarations: [
    UsersGroupsListComponent,
    UsersGroupsFormComponent,
    GroupuserpermissinsFormComponent
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
    SharedMaterialModule,
    SharedPrimengModule,
    RouterModule.forChild(UsersGroupsRoutes)
  ]
})
export class AppUsersGroupsModule { }
