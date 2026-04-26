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
import { TreeTableModule } from 'primeng/treetable';
import { TableModule } from 'primeng/table'; 
import { AccountlistComponent } from './accountlist/accountlist.component';
import { AccountTreeRoutes } from './app-accounttree-routing.module';
import { AccountFormComponent } from './account-form/account-form.component';
import { NodeService } from 'app/shared/services/nodeservice';
import { AccounttreelistComponent } from './accounttreelist/accounttreelist.component';
import { InputTextModule } from 'primeng/inputtext';
import { AccountbranchformComponent } from './accountbranchform/accountbranchform.component';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from "primeng/button";
import {TreeModule} from 'primeng/tree';
import {TreeNode} from 'primeng/api';

@NgModule({
  declarations: [
    AccountlistComponent,
    AccountFormComponent,
    AccounttreelistComponent,
    AccountbranchformComponent
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
    RouterModule.forChild(AccountTreeRoutes)
  ],
  providers: [ NodeService ]
})
export class AppAccountTreeModule { }
