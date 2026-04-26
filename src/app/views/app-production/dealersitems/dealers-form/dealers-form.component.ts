import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { DealeritemsService } from '../dealeritems.service'; 
import { AppCommonserviceService } from 'app/views/app-commonservice.service'

@Component({
  selector: 'app-dealers-form',
  templateUrl: './dealers-form.component.html',
  styleUrls: ['./dealers-form.component.scss']
})
export class DealersFormComponent implements OnInit {
  selectedMainTable: number;
  DealerItemsForm: FormGroup;
  showLoader = false;
  titlePage: string;
  dealersItemsList: any[] = [];
  itemsList: any[];
  allUnitsList: any[];
  unitsList: Array<any> = [];
  origCountryList : any[];
  currList:any[];
  disableSave:boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private dealeritemsService: DealeritemsService,
    private appCommonserviceService : AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.InitialDealerItemsForm();
    this.data.GetDealersList();
    this.GetInitialForm();
  }

  InitialDealerItemsForm() {
    this.DealerItemsForm = this.formbulider.group({
      id: [0],
      no: [0],
      dealersItems: [null],
    });
  }

  GetInitialForm() {
    this.dealeritemsService.GetDealerItems(this.data.id).subscribe((result) => {
      debugger
      this.disableSave = false;
      this.DealerItemsForm.patchValue(result)
      this.DealerItemsForm.value.no = this.data.id;
      this.dealersItemsList = result.dealersItemsList;
      this.itemsList = result.itemsList;
      this.allUnitsList = result.itemsUnitsList;
      this.origCountryList = result.origCountryList;
      this.currList = result.currenciesList;
      let index = 0;
      if(this.dealersItemsList.length>0){
        this.dealersItemsList.forEach(ditem => {
          this.itemsList.forEach(item => {
            if(item.data1 === ditem.itemNo){
              this.unitsList[index] = this.allUnitsList.filter(unit => unit.data1 == ditem.itemNo);
              index++;          
            }
          });
        });
      }      
    });
  }

  AddNewLine(){    
    this.dealersItemsList.push(
    {
      itemNo: "",
      unitNo: 0,
      price: 0,
      originCountry: 0,
      deliveryTime:0,
      minOrderQty:0,
      packageSize:0
    });
    this.DealerItemsForm.get("dealersItems").setValue(this.dealersItemsList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.dealersItemsList.splice(rowIndex, 1);
    }
    this.DealerItemsForm.get("dealersItems").setValue(this.dealersItemsList);
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    var index = 0;
    if(this.dealersItemsList.length==0){
      this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
    }
    else{
      for (let element of this.dealersItemsList) {
        if(element.itemNo === '' || element.itemNo === null || element.unitNo === null || !this.appCommonserviceService.isValidNumber(element.price)){
          this.alert.ShowAlert("msgEnterAllData",'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
        element.index = index.toString();
        index++;
      }
    }

    if (stopExecution) {
      return; 
    } 

    try {
      this.DealerItemsForm.value.dealersItemsList = this.dealersItemsList;
      this.dealeritemsService.SaveDealerItems(this.DealerItemsForm.value)
        .subscribe(() => {
          this.alert.SaveSuccess();
          this.GetInitialForm();
          this.data.GetDealersList()
        });
        this.disableSave = false;
    }
    catch {
      this.alert.SaveFaild();
    }
    this.dialogRef.close();
  }

  GetItemUnits(itemNo,i){
    debugger
    if(itemNo != ''){
      this.dealeritemsService.GetItemUnits(itemNo.value).subscribe((result) => {        
        this.unitsList[i] = result;
      });      
    }
  }

  isEmpty(input) {
    return input === '' || input === null;
  }
}


