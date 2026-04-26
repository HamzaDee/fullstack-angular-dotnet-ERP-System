import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { sweetalert } from 'sweetalert';

@Component({
  selector: 'app-itemsdelears',
  templateUrl: './itemsdelears.component.html',
  styleUrl: './itemsdelears.component.scss'
})
export class ItemsdelearsComponent {
  @Input() itemsdealersFormData: any;
  @Input() isViewMode: boolean = false;
  // unitsList: any;
  // unitsFormArray: FormArray;
  dealersList: any;
  originCountryList: any;
  unitsList:any;
  itemsDealersFormArray: FormArray;
  constructor(
    private dialog: MatDialog,
    private jwtAuth: JwtAuthService,
    private fb: FormBuilder,
    private translateService: TranslateService,
    private alert: sweetalert,
  ) { }

  ngOnInit(): void {
    this.initializeTable();
  }

  checkViewMode(formGroup) {
    if (this.isViewMode) {
      formGroup.disable();
      this.itemsDealersFormArray.disable();
    }
  }

  initializeTable() {
    debugger
    this.dealersList = this.itemsdealersFormData?.suppliersList;
    this.unitsList = this.itemsdealersFormData?.unitsList;
    this.originCountryList = this.itemsdealersFormData?.originCountiesList;
    this.itemsDealersFormArray = this.fb.array([]);

    if (this.itemsdealersFormData?.itemsDealersLists.length > 0) {
      this.itemsdealersFormData?.itemsDealersLists?.forEach((itemsdealers) => {
        const itemsdealersFormGroup = this.fb.group({
          id:[itemsdealers.id],
          dealerId: [itemsdealers.dealerId, Validators.min(1)],
          itemId: [itemsdealers.itemId],
          unitId: [itemsdealers.unitId, Validators.min(1)],
          price:  [itemsdealers.price],  
          originCountry: [itemsdealers.originCountry],
          deliveryTime:[itemsdealers.deliveryTime],
          minOrderQty:[itemsdealers.minOrderQty],
          packageSize:[itemsdealers.packageSize]
        });

         this.itemsDealersFormArray.push(itemsdealersFormGroup);
        this.checkViewMode(itemsdealersFormGroup);

      });
    } else {
      // this.addNewRow();
    }
  }

  addNewRow() {
    if (!this.isViewMode) {
      const newFormGroup = this.fb.group({
        id:[0],
        dealerId: [0, Validators.required],
        itemId:[0,Validators.required],
        unitId: [0, Validators.required],
        price: [""],  
        originCountry: [0],
        deliveryTime:[0],
        minOrderQty:[0],
        packageSize:[0]
      });
      this.itemsDealersFormArray.push(newFormGroup);
    }
  }

  getUnitFormGroupIndex(itemsdealersFormGroup: FormGroup): number {
    debugger
    return this.itemsDealersFormArray.controls.findIndex(control => control === itemsdealersFormGroup);
  }

  deleteRow(index: number) {
    if (!this.isViewMode && this.itemsDealersFormArray.length >= 1) {
      this.itemsDealersFormArray.removeAt(index);
      // this.addNewRow();
    }
  }

}
