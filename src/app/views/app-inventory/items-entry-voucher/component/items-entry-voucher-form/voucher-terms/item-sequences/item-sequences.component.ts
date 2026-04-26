import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { ItemsEntryVoucherService } from 'app/views/app-inventory/items-entry-voucher/service/items-entry-voucher.service';
@Component({
  selector: 'app-item-sequences',
  templateUrl: './item-sequences.component.html',
  styleUrls: ['./item-sequences.component.scss']
})
export class ItemSequencesComponent implements OnInit {
  itemSerialsForms: FormArray;
  number: number = 0;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    private formBuilder: FormBuilder,
    private alert: sweetalert,
    private service:ItemsEntryVoucherService,
  ) { }

  ngOnInit() {
    this.setitemSerialsForms()
  }

  setitemSerialsForms() {
    debugger
    this.itemSerialsForms = this.formBuilder.array([]);
    if (this.data?.invItemSerialsFormModel &&
      this.data.invItemSerialsFormModel.length >= this.data.quantity) {
      this.itemSerialsForms = this.formBuilder.array(
        this.data.invItemSerialsFormModel.map((serialForm: any) => this.createItemSerialForm(serialForm))
      );
    }
    else {
      for (let i = 0; i < this.data.quantity; i++) {
        this.itemSerialsForms.push(this.createItemSerialForm());
      }
    }

  }

  addNewFormGroup(): FormGroup {
    return this.formBuilder.group({
      id: [0],
      number: [0],
      invVoucherDtid: [0],
      itemId: [0],
      serialNo: [0],
      sold: [false],
    });
  }

  createItemSerialForm(serialForm?: any): FormGroup {
    return this.formBuilder.group({
      id: [serialForm ? serialForm.id : 0],
      number: [this.number += 1],
      invVoucherDtid: [this.data.invVoucherDtid],
      itemId: [this.data.itemId],
      serialNo: [serialForm ? serialForm.serialNo : null],
      sold: [false],
    });
  }

  getItemName() {
    let item = this.data?.itemsList?.filter(x => x.id == this.data.itemId);
    return item[0]?.text;
  }

  clearSerialNumberByNumber(number: number): void {
    const itemSerialForm = this.itemSerialsForms.at(number - 1);
    itemSerialForm.get('serialNo').setValue(null);
  }

  clearAllSerialNumbers(): void {
    this.itemSerialsForms.controls.forEach(form => {
      form.get('serialNo').setValue(null);
    });
  }

  generateSerialNumbers(): void {
    const startingSerialNumber: number = this.itemSerialsForms.at(0).get('serialNo').value;
    if (this.itemSerialsForms.length > 0 && startingSerialNumber) {
      for (let i = 0; i < this.itemSerialsForms.length; i++) {
        let newSerialNumber: number = +startingSerialNumber + i;
        this.itemSerialsForms.at(i).get('serialNo').setValue(newSerialNumber);
      }
    }
    else {
      this.alert.ShowAlert('pleaseEnterFirstSerial','error');
    }

  }

  onSave() {
    debugger
    const hasNullSerialNo = this.itemSerialsForms.controls.some(form => form.get('serialNo').value === null);
    if (hasNullSerialNo) {
      this.alert.ShowAlert('pleaseEnterAllSerial','error');
    } else {
      this.itemSerialsForms.controls.forEach(form => {
        const serialNo = form.get('serialNo').value.toString();
        form.get('serialNo').setValue(serialNo);
      });


      // this.service.GetAllowAddSerial(this.itemSerialsForms.value).subscribe(res =>{
      //   debugger
      //   if(res)
      //     {

      //     }
      // })
      // this.itemSerialsForms.value.forEach(element => {
      //   this.service.GetAllowAddSerial(element.itemId,element.serialNo).subscribe(result => {
      //     if(result)
      //       {
  
      //       }
      //   })
      // });
      




      this.dialogRef.close({ itemSerialsForms: this.itemSerialsForms, invVoucherDtid: this.data.invVoucherDtid, itemId: this.data.itemId });
    }
  }


 
}