import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { VehiclesRoutingModule } from './vehical-routing.module'; 
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PerfectScrollbarModule } from 'app/shared/components/perfect-scrollbar';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { RouterModule } from '@angular/router';
import { AppGeneralAttachmentModule } from '../general/app-general-attachment/app-general-attachment.module';
import { CheckupformComponent } from './vehiclecheckup/vcheckuoForm/checkupform.component';
import { CheckuplistComponent } from './vehiclecheckup/vcheckupList/checkuplist.component';
import { VehicleDefinitionComponent } from './VehicleDefinition/vehicle-definition/vehicle-definition.component';
import { VehicleDefinitionFormComponent } from './VehicleDefinition/vehicle-definition-form/vehicle-definition-form.component';
import { VehiclefuelformComponent } from './VehicleFuel/vehiclesFuelForm/vehiclefuelform.component';
import { VehiclefuellistComponent } from './VehicleFuel/vheiclesFuelList/vehiclefuellist.component';
import { DailyMachineryMovementFormComponent } from './DailyMachineryMovement/daily-machinery-movement-form/daily-machinery-movement-form.component';
import { DailyMachineryMovementComponent } from './DailyMachineryMovement/daily-machinery-movement/daily-machinery-movement.component';
import { RepairsOilChangeAndFuelRefillFormComponent } from './RepairsOilChangeAndFuelRefill/repairs-oil-change-and-fuel-refill-form/repairs-oil-change-and-fuel-refill-form.component';
import { RepairsOilChangeAndFuelRefillListComponent } from './RepairsOilChangeAndFuelRefill/repairs-oil-change-and-fuel-refill-list/repairs-oil-change-and-fuel-refill-list.component';
import { VehicleLicensingMovementListComponent } from './VehicleLicensingMovement/vehicle-licensing-movement-list/vehicle-licensing-movement-list.component';
import { VehicleLicensingMovementFormComponent } from './VehicleLicensingMovement/vehicle-licensing-movement-form/vehicle-licensing-movement-form.component';
import { BeneficiarieFormComponent } from './Beneficiaries/beneficiarie-form/beneficiarie-form.component';
import { BeneficiariesComponent } from './Beneficiaries/beneficiaries/beneficiaries.component';
import { BeneficariesadvancedsearchComponent } from '../general/app-searchs/app-BeneficiariesAdvancedSearch/beneficariesadvancedsearch.component';

@NgModule({
  declarations: [
    CheckupformComponent,
    CheckuplistComponent,
    VehicleDefinitionComponent,
    VehicleDefinitionFormComponent,
    VehiclefuelformComponent,
    VehiclefuellistComponent,
    VehicleDefinitionFormComponent,
    DailyMachineryMovementComponent,
    DailyMachineryMovementFormComponent,
    RepairsOilChangeAndFuelRefillListComponent,
    RepairsOilChangeAndFuelRefillFormComponent,
    VehicleLicensingMovementListComponent,
    VehicleLicensingMovementFormComponent,
    BeneficiariesComponent,
    BeneficiarieFormComponent,
    BeneficariesadvancedsearchComponent,
  ],
  providers: [DatePipe],
  imports: [
    CommonModule,
    RouterModule.forChild(VehiclesRoutingModule),
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
    AppGeneralAttachmentModule,    
  ]
})
export class VehiclesModule { }
