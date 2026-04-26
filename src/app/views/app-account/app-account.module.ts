import { PerfectScrollbarModule } from 'app/shared/components/perfect-scrollbar'; 
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { AppAccountRoutes } from "./app-account.routing";
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';
import { LoginComponent } from './login/login.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { MatIconModule } from '@angular/material/icon';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { TreeTableModule } from 'primeng/treetable';
import { TableModule } from 'primeng/table';
import { CostcentertransComponent } from './costcentertrans/costcentertrans.component'
import { ProjectstransComponent } from './projectstrans/projectstrans.component';




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    TranslateModule,
    ReactiveFormsModule,
    SharedMaterialModule,
    SharedPipesModule,
    FlexLayoutModule,
    PerfectScrollbarModule,
    AutoCompleteModule,
    MatIconModule,
    TreeTableModule,
    TableModule,
    SharedPrimengModule,    
    RouterModule.forChild(AppAccountRoutes)
  ],
  declarations: [ NotFoundComponent, ErrorComponent,LoginComponent,CostcentertransComponent,ProjectstransComponent]
})
export class AppAccountModule { }