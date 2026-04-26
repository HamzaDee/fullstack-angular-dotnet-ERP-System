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

import { UserMessagesListComponent } from './user-messages-list/user-messages-list.component';
import { UserMessagesFormComponent } from './user-messages-list/user-messages-form/user-messages-form.component';
import { UserMessagesDetialsFormComponent } from './user-messages-list/user-messages-detials-form/user-messages-detials-form.component';
import { UsersRoutes } from './app-user-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-list/user-form/user-form.component';
import { LinkingUsersToCompaniesBranchesFormComponent } from './user-list/linking-users-to-companies-branches-form/linking-users-to-companies-branches-form.component';
import { UserPermissionsFormComponent } from './user-list/user-permissions-form/user-permissions-form.component';
import { ChangeUserPasswordFormComponent } from './change-user-password-form/change-user-password-form.component';
import { PasswordModule } from 'primeng/password';
import { CopyuserpermissinsFormComponent } from './user-list/Copy-user-permissions/copyuserpermissins-form.component';

@NgModule({
  declarations: [
    UserMessagesListComponent,
    UserMessagesFormComponent,
    UserMessagesDetialsFormComponent,
    UserListComponent,
    UserFormComponent,
    LinkingUsersToCompaniesBranchesFormComponent,
    UserPermissionsFormComponent,
    ChangeUserPasswordFormComponent,
    CopyuserpermissinsFormComponent
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
    PasswordModule,
    RouterModule.forChild(UsersRoutes)
  ]
})
export class AppUserModule { }
