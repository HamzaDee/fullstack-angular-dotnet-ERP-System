import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
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
import { OpeningbalanceformComponent } from './openingbalanceform/openingbalanceform.component';
import { OpeningBalanceRoutes } from './app-openingbalance-routing.module';
import { OpeningbalancelistComponent } from './openingbalancelist/openingbalancelist.component';
import { AppGeneralAttachmentModule } from 'app/views/general/app-general-attachment/app-general-attachment.module';
import { AppSearchModule } from 'app/views/general/app-searchs/app-searchs.module';
@NgModule({
    declarations: [
        OpeningbalancelistComponent,
        OpeningbalanceformComponent,
        //AppGeneralAttachmentComponent
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
      SharedPrimengModule,
      SharedMaterialModule,
      AppGeneralAttachmentModule,
      AppSearchModule,
      RouterModule.forChild(OpeningBalanceRoutes)
    ]
  })
  export class AppOpeningBalanceModule { }