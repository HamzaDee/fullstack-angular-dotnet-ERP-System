import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
@Component({
  selector: 'app-itemserialsform',
  templateUrl: './itemserialsform.component.html',
  styleUrls: ['./itemserialsform.component.scss']
})
export class ItemserialsformComponent implements OnInit  {
  itemSerialForms: FormGroup;
  public TitlePage: string;
  serialsList: any[];
  serialTransList: any[] = [];
  selectedSerials: any[];
  serialsTranModelList: any[] = [];
  selectedRows: number[] = [];
  itemName: string;
  qty: number;
  itemId:number;
  isShown:boolean =false;
  public selectedSerialCount: number = 0;
  private initialSelectedRows: number[];
  
 
 
  constructor
  (
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    public routePartsService: RoutePartsService,
    public router: Router,
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private appCommonserviceService : AppCommonserviceService,
    private alert: sweetalert,
  ) 
  {}

  ngOnInit(): void {
    debugger
    this.InitiailCostcentertransForm();


  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('itemSequencesForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailCostcentertransForm() {    
    this.itemSerialForms = this.formbulider.group({
      id: [0],
      itemId:[0],
      serialNo:[0],
      isChecked:[0],
      selectedSerialCount:[0]
    });
    debugger
    this.isShown =false;
    this.serialsList = this.data.serials;
    this.itemName = this.data.itemName;
    this.qty = this.data.qty;

    debugger
    if(this.data.transList.length > 0){
      this.serialTransList = this.data.transList;
      this.selectedSerialCount = this.serialTransList.filter(item => item.isChecked == true).length;

    }
    else{
      this.serialsList.forEach(element=> {
        this.serialTransList.push({
          id: element.id,
          itemId:element.itemId,
          serialNo: element.serialNo,
          isChecked :false, 
          rowIndex: this.data.rowIndex,  
          index: this.data.rowIndex
        });
      })
    }    
  }

  initializeSelectedRows() {
    this.initialSelectedRows = this.serialTransList
      .filter(item => item.isChecked)
      .map(item => item.index);
      debugger
  }
  
  onConfirm(): void {
    debugger
    this.itemSerialForms.get("selectedSerialCount").setValue(this.selectedSerialCount);

    this.initializeSelectedRows();
    if(this.initialSelectedRows !== undefined)
    {
      if(this.initialSelectedRows.length !== this.qty){
        this.alert.ShowAlert("CantSaveQtyNotEqual",'error');
        return;
      }
    }
    const selectedItems: any[] = [];
    this.serialTransList.forEach((item, index) => {
      const isChecked = this.selectedRows.includes(index);
    
      if (isChecked) {        
        selectedItems.push(item);
      } else {        
        selectedItems.push({
          ...item,  
          isChecked: false
        });
      }
    });
    debugger    
    this.dialogRef.close(this.serialTransList);
  }

  onCancel() {
    debugger
   // this.resetSelection();
    this.dialogRef.close();
  }

  resetSelection() {
    this.selectedSerialCount = 0; 
    this.selectedRows = []; 
    this.serialTransList.forEach((item) => {
      item.isChecked = false;
    });
  }


  onRowCheckboxChange(index: number, isChecked: boolean) {
    debugger
    if (isChecked) {
      this.selectedSerialCount++;
      this.selectedRows.push(index);
    } 
    else {
      this.selectedSerialCount--;
      const selectedIndex = this.selectedRows.indexOf(index);
      if (selectedIndex !== -1) {
        this.selectedRows.splice(selectedIndex, 1);
      }
    }

  }

  isCheckboxDisabled(index: number): boolean {
     
     return this.selectedRows.length >= this.qty && this.selectedRows.indexOf(index) === -1;
  }

  isSaveButtonDisabled(): boolean {
    if(this.data.transList.length == 0){
      return this.selectedRows.length !== this.qty;
    }
  }

  shouldDisableCheckbox(index: number): boolean {
    const initiallySelectedTrueCount = this.serialTransList.filter(item => item.isChecked).length;
    return !this.serialTransList[index].isChecked && initiallySelectedTrueCount >= this.qty;
  }
}
