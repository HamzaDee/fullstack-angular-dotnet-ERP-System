import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PriceByCategoryComponent } from './price-by-category/price-by-category.component';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { sweetalert } from 'sweetalert';

@Component({
  selector: 'app-units-prices',
  templateUrl: './units-prices.component.html',
  styleUrls: ['./units-prices.component.scss']
})
export class UnitsPricesComponent implements OnInit {
  
  @Input() unitsPricesFormData: any;
  @Input() isViewMode: boolean = false;
  unitsList: any;
  unitsFormArray: FormArray;
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
      this.unitsFormArray.disable();
    }
  }

  initializeTable() {
    this.unitsList = this.unitsPricesFormData?.unitsList;
    this.unitsFormArray = this.fb.array([]);

    if (this.unitsPricesFormData?.unitsPricesSubs.length > 0) {
      this.unitsPricesFormData?.unitsPricesSubs?.forEach((unitPrice) => {
        const unitFormGroup = this.fb.group({
          id: [unitPrice.id],
          unitId: [unitPrice.unitId, Validators.min(1)],
          itemId: [unitPrice.itemId],
          convertRate: [unitPrice.convertRate,[Validators.required, Validators.min(1)]],
          price: [unitPrice.price],
          barcode: [unitPrice.barcode],
          isSmall: [unitPrice.isSmall],
          isDefault: [unitPrice.isDefault],
          itemsPricesPostModel: [unitPrice.itemsPricesSub]
        });

        this.unitsFormArray.push(unitFormGroup);
        this.checkViewMode(unitFormGroup);

      });
    } else {
      this.addNewRow();
    }
  }

  addNewRow() {
    if (!this.isViewMode) {
      const newFormGroup = this.fb.group({
        id: [0],
        itemId: [0],
        unitId: [0, Validators.required],
        convertRate: ["", Validators.required],
        price: [0, ],
        barcode: ["",],
        isSmall: [false],
        isDefault: [false],
        itemsPricesPostModel: [[]]
      });
      this.unitsFormArray.push(newFormGroup);
    }
  }

  getUnitFormGroupIndex(unitFormGroup: FormGroup): number {
    return this.unitsFormArray.controls.findIndex(control => control === unitFormGroup);
  }

  deleteRow(index: number) {
    if (!this.isViewMode && this.unitsFormArray.length > 1) {
      this.unitsFormArray.removeAt(index);
    }
  }

  openCategoryPricePopup(id: number, unitId: number) {
    debugger
    if (unitId > 0) {
      let title = this.translateService.instant('itemsPricesByCategoryAndUnit');
      let unitName = this.unitsPricesFormData?.unitsList?.find(x => x.id == unitId).text;
      //let uPrices = this.unitsPricesFormData?.unitsPricesSubs.filter(c=> c.id == id);
      let uPrices = this.unitsFormArray.value[id].itemsPricesPostModel;
      let dialogRef: MatDialogRef<any> = this.dialog.open(PriceByCategoryComponent, {
        width: '1000px',
        disableClose: true,
        direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
        data: {
          title: title,
          rowIndex: id,
          unitId: unitId,
          unitName: unitName,
          pricesCategoriesList: this.unitsPricesFormData?.pricesCategoriesList,
          unitPricesList: uPrices
        }
      });
      dialogRef.afterClosed()
        .subscribe(res => {
          debugger
          if (res !== null  && res.length>0) {            
            this.unitsFormArray.value[id].itemsPricesPostModel = res;
            return;
          }
        })
    }
    else {
      this.alert.ShowAlert('PleaseSelectedUint','error');
    }

  }

  handleOnlyOneCheckedChange(currentFormGroup: FormGroup, controlName: string): void {
    const currentIsDefaultControl = currentFormGroup.get(controlName);
    if(controlName == 'isSmall'){
      if(currentFormGroup.get(controlName).value){
        if(currentFormGroup.get('convertRate').value > 1){
          this.alert.ShowAlert('SmallIsOne','error');
          currentIsDefaultControl.setValue(false);
          return;
        };
      };
      
    }
    if (currentIsDefaultControl.value) {
      // If the current checkbox is checked, uncheck others
      this.unitsFormArray.controls.forEach((control: AbstractControl) => {
        const isDefaultControl = control.get(controlName);

        if (isDefaultControl !== currentIsDefaultControl) {
          isDefaultControl.setValue(false, { emitEvent: false });
        }
      });
    }
  }

  onChangeConvertRate(currentFormGroup: FormGroup): void {
    debugger
    if(currentFormGroup.get('isSmall').value){
      if(currentFormGroup.get('convertRate').value > 1){
        this.alert.ShowAlert('SmallIsOne','error');
        currentFormGroup.get('convertRate').setValue(1);
        return;
      };
    }
  }
}