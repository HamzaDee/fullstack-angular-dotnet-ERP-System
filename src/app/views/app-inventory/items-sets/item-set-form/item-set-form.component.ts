import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ItemSetService } from '../items-sets.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-set-form',
  templateUrl: './item-set-form.component.html',
  styleUrls: ['./item-set-form.component.scss']
})
export class ItemSetFormComponent implements OnInit {

  itemSetForm: FormGroup;
  itemList: any;
  itemsUintsList: any = [];
  allUnitsList: any;
  unitsList: Array<any> = [];
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  itemsList: any;
  alternativeItemFormArray: FormArray;
  disableSave:boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private itemSetService: ItemSetService,
    private alert: sweetalert,
    private fb: FormBuilder,
    private jwtAuth: JwtAuthService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.ItemSetInitialForm();
    this.GetItemSetInitialForm();
    this.initializeTable()
    this.disableSave = false;
  }

  ItemSetInitialForm() {
    this.itemSetForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      barcode: ["", Validators.required],
      setNameE: ["", Validators.required],
      setNameA: ["", Validators.required],
      setPrice: [0, Validators.required],
      stopped: [true],
      note: [""],
      itemsSetsDts: [[]]
    });
  }

  GetItemSetInitialForm() {
    this.itemSetService.GetItemSetForm(this.data.id).subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['ItemsSets/ItemSetsHDList']);
          this.dialogRef.close(false);
          return;
        }

      this.itemList = result.items
      this.allUnitsList = result.itemsUnitsList;

      if(result.itemsSetsDts.length>0){
        let index = 0;
        result.itemsSetsDts.forEach(item=> {
          this.itemList.forEach(element => {
            if(element.id === item.itemId){
              this.unitsList[index] = this.allUnitsList.filter(unit => unit.data1 == item.itemId);
              index++;          
            }
          });
          const newFormGroup = this.fb.group({
            itemSetId: item.itemSetId,
            itemId: item.itemId,
            unitId: item.unitId,
            qty: item.qty,
          });
          this.alternativeItemFormArray.push(newFormGroup);
        })
      }
      this.itemSetForm.get('itemsSetsDts').setValue(result.itemsSetsDts);
      this.itemSetForm.patchValue(result);
    });
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    this.itemSetForm.get('itemsSetsDts').setValue(this.alternativeItemFormArray.value)
    this.itemSetForm.value.companyId = this.jwtAuth.getCompanyId();
    if(this.alternativeItemFormArray.length === 0){
        this.alert.ShowAlert("MsgAddAtleastOneRow","error");
        this.disableSave = false;
        return;
    }
    for (const element of this.alternativeItemFormArray.value) {    
      if(element.itemId === 0 || element.unitId === 0 || element.qty <= 0){
        this.alert.ShowAlert("msgEnterAllData","error");
        this.disableSave = false;
        return;
      }
    };
    this.itemSetService.PostItemSetForm(this.itemSetForm.value)
      .subscribe(() => {
        if (!this.data.isNew) {
          this.data.isNew = true
          this.data.id = 0
          this.alert.SaveSuccess();
          this.disableSave = false;
          this.data.ItemsSetsListFromParent();
        }
        else {
          this.alert.SaveSuccess()
          this.GetItemSetInitialForm();
          this.data.ItemsSetsListFromParent();
          this.ClearAfterSave();
          this.disableSave = false;
        }
      })
  }

  ClearAfterSave()
  {
   debugger
   this.alternativeItemFormArray.clear();
  }

  initializeTable() {
    debugger
    this.alternativeItemFormArray = this.fb.array([]);
    // this.alternativeItemFormArray = this.itemSetForm?.get('itemsSetsDts')?.value;
    if (this.itemSetForm.get('itemsSetsDts').value.length > 0) {
      this.itemSetForm.get('itemsSetsDts').value.forEach((alternativeItem) => {
        const unitFormGroup = this.fb.group({
          itemSetId: [alternativeItem.itemSetId],
          itemId: [alternativeItem.itemId, Validators.min(1)],
          unitId: [alternativeItem.unitId, Validators.min(1)],
          qty: [alternativeItem.qty, Validators.required],
        });
        this.itemSetForm.get('itemsSetsDts').patchValue(unitFormGroup);
      });
    }
  }

  addNewRow() {
    const newFormGroup = this.fb.group({
      itemSetId: [this.itemSetForm.get('id').value],
      itemId: [0, Validators.min(1)],
      unitId: [0, Validators.min(1)],
      qty: [0, Validators.required],
    });

    this.alternativeItemFormArray.push(newFormGroup);
  }

  deleteRow(index: number) {
    this.alternativeItemFormArray.removeAt(index);
  }

  getUnitFormGroupIndex(alternativeItem: FormGroup): number {
    return this.alternativeItemFormArray.controls.findIndex(control => control === alternativeItem);
  }

  isValidBarcode(barcode) {
    this.itemSetService.IsValidBarcode(barcode).subscribe(valid => {
      const itemNoControl = this.itemSetForm.get("barcode");
      if (!valid) {
        itemNoControl.setValidators([this.customItemCodeValidator(valid), Validators.required]);
        itemNoControl.updateValueAndValidity();
      } else {
        itemNoControl.clearValidators();
        itemNoControl.updateValueAndValidity();
      }
    });
  }

  customItemCodeValidator(valid): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!valid) {
        return { isValidItemCode: true };
      }
      return null;
    };
  }

  onChangeItem(itemId,i) {
    this.itemSetService.GetItemUintbyItemId(itemId).subscribe(res => {
      this.unitsList[i] = res;
    });
  }
}