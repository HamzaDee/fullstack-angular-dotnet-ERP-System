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
import { HttpClientModule } from '@angular/common/http';
//import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, ChangeDetectorRef } from '@angular/core';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { AccountsbudgetsRoutes } from './app-accountsbudgets-routing.module';
import { AccountsbudgetsFormComponent } from './accountsbudgets-form/accountsbudgets-form.component'; 
import { AccountsbudgetsListComponent } from './accountsbudgets-list/accountsbudgets-list.component';


@NgModule({
  declarations: [
    AccountsbudgetsListComponent,
    AccountsbudgetsFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
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
    //AgmCoreModule.forRoot({ apiKey: 'AIzaSyBNcjxo_35qnEG17dQvvftWa68eZWepYE0' }),
    RouterModule.forChild(AccountsbudgetsRoutes)
  ]
})
export class AppAccountsBudgetsModule { }

export class NewBudgetList {
  
  id:number;
  accountId:number;
  branchId:number;
  yearId: number;
  amount: number;
  month1: number;
  month2: number;
  month3: number;
  month4: number;
  month5: number;
  month6: number;
  month7: number;
  month8: number;
  month9: number;
  month10: number;
  month11: number;
  month12: number;
  policyId: number;
  isCanceled:number;
  devideByMonths:number;   
}
export class Delete {
  NewBudgetList: any[] = [];

  constructor(public cdRef: ChangeDetectorRef) { }

  deleteRow(row: any) {
    const index = this.NewBudgetList.indexOf(row);
    if (index !== -1) {
      this.NewBudgetList.splice(index, 1);
      this.cdRef.detectChanges(); // Trigger re-render of the table
    }
  }
}