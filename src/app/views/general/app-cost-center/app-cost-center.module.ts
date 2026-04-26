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
import { AppCostCenterListComponent } from './cost-center-list/cost-center-list.component';
import { AppCostCenterFormComponent } from './cost-center-list/cost-center-form/cost-center-form.component';
import { CostCenterRoutes } from './app-cost-center-routing.module';
import { CostcenterbranchformComponent } from './costcenterbranchform/costcenterbranchform.component';
import { CostCenterTreeComponent } from './cost-center-tree/cost-center-tree.component';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';


@NgModule({
  declarations: [
    AppCostCenterListComponent,
    AppCostCenterFormComponent,
    CostcenterbranchformComponent,
    CostCenterTreeComponent
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
     TreeTableModule,
     TableModule,
     SharedPipesModule,
     SharedPrimengModule,
     SharedMaterialModule,
     InputTextModule,
     TooltipModule,
     ButtonModule,
     TreeModule,
    RouterModule.forChild(CostCenterRoutes)
    
  ]
})
export class AppCostCenterModule { }
