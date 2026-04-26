import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { StoresdetailComponent } from './storesdetail/storesdetail.component';
import { StoresformComponent } from './storesform/storesform.component';
import { StoreslistComponent } from './storeslist/storeslist.component';
import { AppStoresRoutingModule } from './app-stores-routing.module';
import { StoreManagerHistoryComponent } from './store-manager-history/store-manager-history.component';



@NgModule({
  declarations: [
    StoreslistComponent,
    StoresformComponent,
    StoresdetailComponent,
    StoreManagerHistoryComponent
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
    RouterModule.forChild(AppStoresRoutingModule)

  ]
})

export class AppStoresModule { }
