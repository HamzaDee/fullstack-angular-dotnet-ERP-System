import {  Routes } from '@angular/router';
import { config } from 'config';
import { CheckupformComponent } from './vehiclecheckup/vcheckuoForm/checkupform.component';
import{CheckuplistComponent} from './vehiclecheckup/vcheckupList/checkuplist.component';
import { VehicleDefinitionComponent } from './VehicleDefinition/vehicle-definition/vehicle-definition.component';
import { VehicleDefinitionFormComponent } from './VehicleDefinition/vehicle-definition-form/vehicle-definition-form.component';
import { VehiclefuelformComponent } from './VehicleFuel/vehiclesFuelForm/vehiclefuelform.component';
import { VehiclefuellistComponent } from './VehicleFuel/vheiclesFuelList/vehiclefuellist.component';
import { DailyMachineryMovementComponent } from './DailyMachineryMovement/daily-machinery-movement/daily-machinery-movement.component';
import { DailyMachineryMovementFormComponent } from './DailyMachineryMovement/daily-machinery-movement-form/daily-machinery-movement-form.component';
import { RepairsOilChangeAndFuelRefillListComponent } from './RepairsOilChangeAndFuelRefill/repairs-oil-change-and-fuel-refill-list/repairs-oil-change-and-fuel-refill-list.component';
import { RepairsOilChangeAndFuelRefillFormComponent } from './RepairsOilChangeAndFuelRefill/repairs-oil-change-and-fuel-refill-form/repairs-oil-change-and-fuel-refill-form.component';
import { VehicleLicensingMovementListComponent } from './VehicleLicensingMovement/vehicle-licensing-movement-list/vehicle-licensing-movement-list.component';
import { VehicleLicensingMovementFormComponent } from './VehicleLicensingMovement/vehicle-licensing-movement-form/vehicle-licensing-movement-form.component';
import { BeneficiariesComponent } from './Beneficiaries/beneficiaries/beneficiaries.component';
import { BeneficiarieFormComponent } from './Beneficiaries/beneficiarie-form/beneficiarie-form.component';

export const VehiclesRoutingModule: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'Checkuplist',
          component:CheckuplistComponent ,
          data: { title: 'Checkuplist', breadcrumb: 'Checkuplist', roles: config.authRoles.sa }
        },
        {
          path: 'Checkupform',
          component:CheckupformComponent,
          data: { title: 'Checkupform', breadcrumb: 'Checkupform', roles: config.authRoles.sa }
        },
        {
          path: 'VehicleDefinition',
          component:VehicleDefinitionComponent,
          data: { title: 'VehicleDefinition', breadcrumb: 'VehicleDefinition', roles: config.authRoles.sa }
        },
        {
          path: 'VehicleDefinitionForm',
          component:VehicleDefinitionFormComponent,
          data: { title: 'VehicleDefinitionForm', breadcrumb: 'VehicleDefinitionForm', roles: config.authRoles.sa }
        },
        {
          path: 'VehiclefuelList',
          component:VehiclefuellistComponent,
          data: { title: 'VehiclefuelList', breadcrumb: 'VehiclefuelList', roles: config.authRoles.sa }
        },
        {
          path: 'VehiclefuelForm',
          component:VehiclefuelformComponent,
          data: { title: 'VehiclefuelForm', breadcrumb: 'VehiclefuelForm', roles: config.authRoles.sa }
        },
        {
          path: 'DailyMachineryMovement',
          component:DailyMachineryMovementComponent,
          data: { title: 'DailyMachineryMovement', breadcrumb: 'DailyMachineryMovement', roles: config.authRoles.sa }
        },
        {
          path: 'DailyMachineryMovementForm',
          component:DailyMachineryMovementFormComponent,
          data: { title: 'DailyMachineryMovementForm', breadcrumb: 'DailyMachineryMovementForm', roles: config.authRoles.sa }
        },
        {
          path: 'RepairsOilChangeAndFuelRefillList',
          component:RepairsOilChangeAndFuelRefillListComponent,
          data: { title: 'RepairsOilChangeAndFuelRefillList', breadcrumb: 'RepairsOilChangeAndFuelRefillList', roles: config.authRoles.sa }
        },
        {
          path: 'RepairsOilChangeAndFuelRefillForm',
          component:RepairsOilChangeAndFuelRefillFormComponent,
          data: { title: 'RepairsOilChangeAndFuelRefillForm', breadcrumb: 'RepairsOilChangeAndFuelRefillForm', roles: config.authRoles.sa }
        },
        {
          path: 'VehicleLicensingMovementList',
          component:VehicleLicensingMovementListComponent,
          data: { title: 'VehicleLicensingMovementList', breadcrumb: 'VehicleLicensingMovementList', roles: config.authRoles.sa }
        },
        {
          path: 'VehicleLicensingMovementForm',
          component:VehicleLicensingMovementFormComponent,
          data: { title: 'VehicleLicensingMovementForm', breadcrumb: 'VehicleLicensingMovementForm', roles: config.authRoles.sa }
        },
        {
          path: 'BeneficiariesList',
          component:BeneficiariesComponent,
          data: { title: 'BeneficiariesList', breadcrumb: 'BeneficiariesList', roles: config.authRoles.sa }
        },
        {
          path: 'BeneficiarieForm',
          component:BeneficiarieFormComponent,
          data: { title: 'BeneficiarieForm', breadcrumb: 'BeneficiarieForm', roles: config.authRoles.sa }
        }
      ]
  }
];
