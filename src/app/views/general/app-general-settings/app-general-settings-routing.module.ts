import { Routes } from '@angular/router';
import { config } from 'config'; import { AccountingSystemFormComponent } from './add-general-settings/accounting-system-form/accounting-system-form.component';
import { AddGeneralSettingsComponent } from './add-general-settings/add-general-settings.component';
import { StoresFormComponent } from './add-general-settings/stores-form/stores-form.component';

export const GeneralSettingsRoutes: Routes = [
    {
        path: 'AddGeneralSettings',
        component: AddGeneralSettingsComponent,
        data: { title: 'AddGeneralSettings', breadcrumb: 'AddGeneralSettings', roles: config.authRoles.sa },
        children:
            [
                {
                    path: 'StoresForm',
                    component: StoresFormComponent,
                    data: { title: 'StoresForm', breadcrumb: 'StoresForm', roles: config.authRoles.sa },
                },
                {
                    path: 'AccountingSystemForm',
                    component: AccountingSystemFormComponent,
                    data: { title: 'AccountingSystemForm', breadcrumb: 'AccountingSystemForm', roles: config.authRoles.sa },
                },
            ]
    },
];
