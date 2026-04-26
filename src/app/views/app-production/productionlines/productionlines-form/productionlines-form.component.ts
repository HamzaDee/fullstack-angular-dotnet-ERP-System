import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ProductionlinesService } from '../productionlines.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'

@Component({
  selector: 'app-productionlines-form',
  templateUrl: './productionlines-form.component.html',
  styleUrls: ['./productionlines-form.component.scss']
})
export class ProductionlinesFormComponent implements OnInit {
  selectedMainTable: number;
  ProdLineForm: FormGroup;
  showLoader = false;
  titlePage: string;
  productionLinesDTList: any[] = [];
  itemsList: any[];
  allUnitsList: any[];
  unitsList: Array<any> = [];
  disableSave:boolean;
  public CompanyName: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private productionlinesService: ProductionlinesService,
    private appCommonserviceService : AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.CompanyName = window.localStorage.getItem('companyName');
    this.InitialProdLineForm();
    this.data.GetProdLinesList();
    this.GetInitialForm();
  }

  InitialProdLineForm() {
    this.ProdLineForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      prodLineNo: [0, [Validators.required, Validators.min(1)]],
      lineNameA: ["", [Validators.required]],
      lineNameE: ["", [Validators.required]],
      runtime: [0, [Validators.required, Validators.min(1)]],
      active: [true],
      description: [""],
      createdDate: [null],
      userId: [0],
      productionLinesDTList: [null],
    });
  }

  GetInitialForm() {
    this.productionlinesService.GetProdLine(this.data.id).subscribe((result) => {
      debugger
      if(result.isSuccess === false || result.message === "msNoPermission"){
          this.alert.ShowAlert("msNoPermission","error");
          this.dialogRef.close();
          return
        }
      this.ProdLineForm.patchValue(result)
      this.productionLinesDTList = result.productionLinesDTList;
      this.itemsList = result.itemsList;
      this.allUnitsList = result.itemsUnitsList;
      let index = 0;
      if(this.CompanyName == 'Billa')
      {
          this.itemsList.forEach(item => {
          if(item.data1 !== null){
            this.unitsList[index] = this.allUnitsList.filter(unit => unit.data1 == item.data1);
            index++;          
          }
        });
      }
      else
      {
        this.productionLinesDTList.forEach(element => {
          this.GetItemUnits(element,index);
          index++;
        });
        index = 0;
        this.productionLinesDTList.forEach(element => {
          this.itemsList.forEach(item => {
            if (item.id === element.itemId) {
              this.unitsList[index] = this.allUnitsList.filter(unit => unit.id == element.unitNo);
              index++;
            }
          });
        })
      }
      
      
    });
  }

  AddNewLine(){    
    this.productionLinesDTList.push(
    {
      itemId: 0,
      itemNo: "",
      unitNo: 0,
      prodCapacityQty: 0,
      weight:0,
      mix:0,
      packing:0,
      wrapping:0,
      hoursQty: 0,
    });
    this.ProdLineForm.get("productionLinesDTList").setValue(this.productionLinesDTList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.productionLinesDTList.splice(rowIndex, 1);
    }
    this.ProdLineForm.get("productionLinesDTList").setValue(this.productionLinesDTList);
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    var index = 0;
    if(this.productionLinesDTList.length==0){
      this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
    }
    else{
      if(this.CompanyName == 'Billa')
      {
        for (let element of this.productionLinesDTList) {
        if(element.itemNo === '' || element.itemNo === null || element.unitNo === null || !this.appCommonserviceService.isValidNumber(element.hoursQty) || !this.appCommonserviceService.isValidNumber(element.prodCapacityQty)){
          this.alert.ShowAlert("msgEnterAllData",'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
        element.index = index.toString();
        index++;
      }
      }
      else
      {
        for (let element of this.productionLinesDTList) {
        if(element.itemId === '' || element.itemId === null || element.unitNo === null || !this.appCommonserviceService.isValidNumber(element.hoursQty) || !this.appCommonserviceService.isValidNumber(element.prodCapacityQty)){
          this.alert.ShowAlert("msgEnterAllData",'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
        element.index = index.toString();
        index++;
      }
      }
      
    }

    if (stopExecution) {
      return; 
    } 

    try {
      this.ProdLineForm.value.productionLinesDTList = this.productionLinesDTList;
      debugger
      this.productionlinesService.SaveProdLine(this.ProdLineForm.value)
        .subscribe(() => {
          this.alert.SaveSuccess();
          this.GetInitialForm();
          this.data.GetProdLinesList()
        });
    }
    catch {
      this.alert.SaveFaild();
    }
    this.disableSave = false;
    this.dialogRef.close();
  }

  GetItemUnits(row,i){
    debugger
    if(this.CompanyName == 'Billa')
      {
        if(row.itemNo != ''){
          this.productionlinesService.GetItemUnits(row.itemNo).subscribe((result) => {        
            this.unitsList[i] = result;
          });      
        }
      }
    else
      {
        if(row.itemId > 0){
          this.productionlinesService.GetItemUnitbyItemId(row.itemId).subscribe((result) => {        
            this.unitsList[i] = result;
          });      
        }
      }
    
  }

  CheckLineNo(event){
    debugger
    var id = this.ProdLineForm.value.id;
    if(id == 0){
      this.productionlinesService.CheckLineNo(event.target.value).subscribe((result) => {        
        if(result.isSuccess == false){
          this.alert.ShowAlert('LineAvailable','error');
          this.ProdLineForm.get("prodLineNo").setValue(result.message);
        };
      });
    }   
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  calculateHour(itemList){
    itemList.hoursQty = itemList.weight + itemList.mix + itemList.packing + itemList.wrapping;
  }
}

