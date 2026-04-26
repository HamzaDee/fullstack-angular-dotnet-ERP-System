import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
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
import { ItemsdeldocumentListComponent } from './itemsDelVoucher-list/itemsdeldocument-list.component';
import { ItemsdeldocumentFormComponent } from './itemsDelVoucher-form/itemsdeldocument-form.component';
import { SalesRequestroutes } from '../sales-routing.module';
import { AppInvSearchModule } from 'app/views/general/app-invSearch/invSearch.module';
import { AppGeneralAttachmentModule } from 'app/views/general/app-general-attachment/app-general-attachment.module';
import { AppSearchModule } from "../../general/app-searchs/app-searchs.module";
import { AppFinancialvoucherModule } from 'app/views/general/app-Showfinancialdocuments/financialvoucher.module';

@NgModule({
  declarations: [ItemsdeldocumentListComponent,ItemsdeldocumentFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(SalesRequestroutes),
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
    AppInvSearchModule,
    AppGeneralAttachmentModule,
    AppSearchModule,
    AppFinancialvoucherModule
]
})
export class AppdeleiverystockModule { }
