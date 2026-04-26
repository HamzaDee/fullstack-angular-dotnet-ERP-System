import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';

import { PriceOffersAdvancedSearchComponent } from './price-offers-advanced-search.component';

@NgModule({
  declarations: [PriceOffersAdvancedSearchComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    TranslateModule,

    MatExpansionModule,
    MatDividerModule,
    MatProgressSpinnerModule,

    DropdownModule,
    ButtonModule,
  ],
  exports: [PriceOffersAdvancedSearchComponent]
})
export class PriceOffersAdvancedSearchModule { }