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

import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';

import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MenuIteamRoutes } from './item-routing.module';
import { ItemsListComponent } from './items-list/items-list.component';
import { ItemService } from './item.service'; 
import { ItemFormComponent } from './item-form/item-form.component'; 
import { ItemInformationsnComponent } from './item-form/item-informationsn/item-informationsn.component'; 
import { UnitsPricesComponent } from './item-form/units-prices/units-prices.component'; 
import { AccountsComponent } from './item-form/accounts/accounts.component'; 
import { ItemsLocationsComponent } from './item-form/items-locations/items-locations.component'; 
import { AlternativeVarietiesComponent } from './item-form/alternative-varieties/alternative-varieties.component'; 
import { PriceByCategoryComponent } from './item-form/units-prices/price-by-category/price-by-category.component';
import { ImageViewComponent } from './image-view/image-view.component';
import { ItemSearchFormComponent } from './ItemSearchForm/item-search-form/item-search-form.component'; 
import { ItemsdelearsComponent } from './item-form/items-dealers/itemsdelears.component';
import { ItemaddinfoFormComponent } from './item-form/item-advanceinfo/itemaddinfo-form.component';
@NgModule({
  declarations: [
    ItemsListComponent,
    ItemFormComponent,
    ItemInformationsnComponent,
    UnitsPricesComponent,
    AccountsComponent,
    ItemsLocationsComponent,
    AlternativeVarietiesComponent,
    PriceByCategoryComponent,
    ImageViewComponent,
    ItemSearchFormComponent,
    ItemsdelearsComponent,
    ItemaddinfoFormComponent,
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
    MatCardModule,
    MatListModule,
    RouterModule.forChild(MenuIteamRoutes)
  ],
  providers: [ItemService],
})
export class ItemModule { }
