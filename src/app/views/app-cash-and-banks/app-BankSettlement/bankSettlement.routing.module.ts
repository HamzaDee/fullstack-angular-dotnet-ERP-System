import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BankSettlementFormComponent } from './bank-settlement-form/bank-settlement-form.component';
import { BankSettlementListComponent } from './bank-settlement-list/bank-settlement-list.component';
import { config } from 'config';

export const BankSattlmentRoutingModule: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'BankSattlmentList',
          component: BankSettlementListComponent,
          data: { title: 'BankSattlmentList', breadcrumb: 'BankSattlmentList', roles: config.authRoles.sa },
        },
        {
          path: 'BankSattlmentForm',
          component: BankSettlementFormComponent,
          data: { title: 'BankSattlmentForm', breadcrumb: 'BankSattlmentForm', roles: config.authRoles.sa },
        },
      ]
  }
];

