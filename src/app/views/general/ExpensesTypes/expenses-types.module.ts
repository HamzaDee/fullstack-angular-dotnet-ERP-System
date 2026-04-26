import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { PerfectScrollbarModule } from 'app/shared/components/perfect-scrollbar'; 
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { AppGeneralAttachmentModule } from '../app-general-attachment/app-general-attachment.module';
import { AppSearchModule } from '../app-searchs/app-searchs.module';
import { ExpensesTypesListComponent } from './expenses-types-list/expenses-types-list.component';
import { ExpensesTypesFormComponent } from './expenses-types-form/expenses-types-form.component';
import { RouterModule } from '@angular/router';
import { ExpensesTypesroutes } from './expenses-types-routing.module';



@NgModule({
  declarations: [
    ExpensesTypesListComponent,
    ExpensesTypesFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ExpensesTypesroutes),  
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
    DropdownModule,
    PerfectScrollbarModule,
    AutoCompleteModule,
    MatIconModule,
    TreeTableModule,
    TableModule,
    AppSearchModule,
    AppGeneralAttachmentModule,
  ]
})
export class ExpensesTypesModule { }
