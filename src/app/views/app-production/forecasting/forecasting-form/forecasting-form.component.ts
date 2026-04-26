import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { sweetalert } from 'sweetalert';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { CheckPermissionsService } from 'app/shared/services/app-permissions/check-permissions.service';
import { ScreenActionsEnum } from 'app/shared/Enum/enum';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropDownModel } from 'app/shared/models/DropDownModel';
import { formatDate } from '@angular/common';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { ForecastingService } from '../forecasting.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-forecasting-form',
  templateUrl: './forecasting-form.component.html',
  styleUrls: ['./forecasting-form.component.scss']
})
export class ForecastingFormComponent implements OnInit {
  public TitlePage: string;
  showLoader = false;
  ForcastingForm: FormGroup;
  countriesList: any[];
  itemsList: any[];
  allUnitsList: any;
  unitsList: Array<any> = [];
  selectedCountry: any;
  forcastingList: any[] = [];
  itemWithPriceList:any;
  RequstId: any;
  opType: string;
  showsave: boolean;
  disableAll:boolean=false;
  customersList: any;
  allCustomersList: any;
  disableTotal:boolean = true;
  totalQty: any;
  totalvalue: any;
  totalPrice: any;
  HideApproval:boolean;
  disableSave:boolean;
  tempSave: boolean = false;
  sts :number = 0;
  bonusPer:number = 0;
  freePer:number = 0;
//test 
  monthsList = new Array(12);
  constructor(
    public routePartsService: RoutePartsService,
    public router: Router,
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private ForecastingService: ForecastingService,
    private alert: sweetalert,
    private cdr :ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    debugger
    console.log('ForecastingFormComponent initialized');
    this.RequstId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.disableSave = false;
    if(this.opType == "Show"){
      this.showsave = true;
      this.disableAll = true;
      this.HideApproval = true;
    }
    else
    {
      this.showsave = false;
      this.disableAll = false;
    }
    if(this.opType == 'Edit')
      {
        this.HideApproval = false;
      }
      else
      {
        this.HideApproval = true;
      }
    this.SetTitlePage();
    if (this.RequstId == null || this.RequstId == undefined || this.RequstId === "") {
      this.router.navigate(['Forecasting/ForecastingList']);
    }
    this.InitiailForecastingForm();
  }



  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ForecastingForm');
    this.title.setTitle(this.TitlePage);
  }

  selectAllText(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  InitiailForecastingForm() {
    debugger
    this.ForcastingForm = this.formbulider.group({
      id: [0],
      fYear: [{ value: 0, disabled: this.disableAll }, [Validators.required, Validators.min(1)]],
      transDate: [{ value: "", disabled: this.disableAll }, [Validators.required]],
      countryId: [{ value: 0, disabled: this.disableAll }, [Validators.required, Validators.min(1)]],//[0, [Validators.required, Validators.min(1)]],
      note: [{ value: "", disabled: this.disableAll }],
      agentId: [{ value: 0, disabled: this.disableAll }, [Validators.required, Validators.min(1)]],
      forecastingDTList: [null],
      status:[0],
    });

    this.ForecastingService.GetForecastingForm(this.RequstId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message == "msNoPermission") 
      {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['Forecasting/ForecastingList']);
        return;
      }
      debugger
      this.countriesList = result.countryList;
      this.itemsList = result.itemsList;
      this.allUnitsList = result.itemUnitsList;
      this.customersList = result.customersList;
      this.allCustomersList = result.customersList;
      this.sts = result.status;      
      result.transDate = formatDate(result.transDate, "yyyy-MM-dd", "en-US");
      this.ForcastingForm.patchValue(result);
      if (result.forecastingDTList != null) {
        this.forcastingList = result.forecastingDTList;
        let index = 0;
        this.forcastingList.forEach(element=> {
          this.updateSum(element);
          this.itemsList.forEach(item => {
            if(item.data1 === element.itemNo){
              this.unitsList[index] = this.allUnitsList.filter(unit => unit.data1 == element.itemNo);
              index++;          
            }
          });
        })
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        if(this.RequstId > 0){
          this.ForcastingForm.get("countryId").setValue(result.countryId);
          this.ForcastingForm.get("agentId").setValue(result.agentId.toFixed(3));
          this.tempSave = this.sts === 3;
        }
      });
    })
  }

  getCustomers(event: any){
    debugger
    const countryId = event.value === undefined ? event : event.value;
    if(countryId == 0)
      this.customersList = this.allCustomersList;
    else
      this.customersList = this.allCustomersList.filter(c => c.id == countryId || c.id == -1);
  }

  getCountry(event: any){
    debugger
    const custId = event.value === undefined ? event : event.value;
    this.selectedCountry = this.customersList.find(c=> c.data1 == custId).id;
    // if(countryId > 0)
    //   this.SalesOrderAddForm.get("sales_No").setValue(countryId);
  }

  filterUnits(selectedItem: any, rowIndex: number): void {
    debugger
    if(this.forcastingList.length > 0)
      {
        for (let i = 0; i < this.forcastingList.length; i++) 
        {
          let element = this.forcastingList[i];
          if(element.itemNo == selectedItem.value && i != rowIndex )
            {      
                  Swal.fire({
                    title: this.translateService.instant('DoWantToContinue'),
                    text: this.translateService.instant('msgTheItemRepeatedReminder'),
                    icon: 'warning',
                    confirmButtonColor: '#dc3741',
                    showCancelButton: true,
                    confirmButtonText: this.translateService.instant('Yes,deleteit!'),
                    cancelButtonText: this.translateService.instant('Close'),
                  }).then((result) => {
                    if (result.value) {
                                        
                    }
                    else if (result.dismiss === Swal.DismissReason.cancel) {
                       setTimeout(() => {
                        this.forcastingList[rowIndex].itemNo = 0;
                        this.forcastingList[rowIndex].unitNo = 0;
                        this.forcastingList[rowIndex].price = 0;
                        this.cdr.detectChanges();
                      }); 
                    }
                  })                      
            }
        }
      }
    this.unitsList[rowIndex] = this.allUnitsList.filter(unit => unit.data1 === selectedItem.value);
    this.ForecastingService.getPriceByCountryAndAgent(selectedItem.value, this.ForcastingForm.value.countryId, this.ForcastingForm.value.agentId).subscribe(result => {
      debugger
      this.forcastingList[rowIndex].price = result;
      this.forcastingList[rowIndex].unitNo = this.unitsList[rowIndex].find(c => c.data1 ==selectedItem.value).id;
    })
  }

  deleteRow(rowIndex: number) {
    debugger
    if(this.disableAll ==true)
      {
        return;
      }
      
    if (rowIndex !== -1) {
      this.forcastingList.splice(rowIndex, 1);
    }
     this.updateSum(this.forcastingList);
  }

  DeleteAll() {
    if(this.disableAll ==true)
    {
      return;
    }
    this.forcastingList = [];
    this.totalQty = 0;
    this.totalvalue = 0;
    this.totalPrice = 0;
    this.AddNewRow()
  }

  AddNewRow() {
    debugger
    if(this.disableAll ==true)
    {
      return;
    }

    let maxId = 0;
    if (this.forcastingList.length > 0) {
      this.forcastingList.forEach(elements => {
        if (elements.id > maxId) {
          maxId = elements.id;
        }
      });
    }
    const newRow = {
      itemNo: [""],
      unitNo:0,
      price: "",
      total:0,
      totalvalue:0,
      totalQuantities:0,
      totalFree:0,
      totalBouns:0,
      qty1: '',
      free1: '',
      bonus1: '',
      qty2: '',
      free2: '',
      bonus2: '',
      qty3: '',
      free3: '',
      bonus3: '',
      qty4: '',
      free4: '',
      bonus4: '',
      qty5: '',
      free5: '',
      bonus5: '',
      qty6: '',
      free6: '',
      bonus6: '',
      qty7: '',
      free7: '',
      bonus7: '',
      qty8: '',
      free8: '',
      bonus8: '',
      qty9: '',
      free9: '',
      bonus9: '',
      qty10: '',
      free10: '',
      bonus10: '',
      qty11: '',
      free11: '',
      bonus11: '',
      qty12: '',
      free12: '',
      bonus12: '',
    };
    this.forcastingList.push(newRow);
  }

  GetItems() {
    debugger
    if(this.disableAll ==true)
    {
      return;
    }    
    this.showLoader = true;
    this.forcastingList = [];
    debugger
    setTimeout(() => {
      this.ForecastingService.GetAllItemsWithPrice(this.ForcastingForm.value.countryId,this.ForcastingForm.value.agentId).subscribe(res => 
        {
          debugger
          if(res.length > 0)
            {
              this.itemWithPriceList = res;
              if(this.itemWithPriceList.length > 0)
                {    
                  for (let i = 0; i < this.itemWithPriceList.length; i++) {
                      const  element = this.itemWithPriceList[i];
                      this.unitsList[i] = this.allUnitsList.filter(unit => unit.data1 === element.itemNo);  
                      const unit = this.unitsList[i].find(c => c.data1 ==element.itemNo).id;
                      this.forcastingList.push(
                        {
                          itemNo: element.itemNo,
                          unitNo:unit,
                          price: element.price,
                          total:0,
                          qty1: '',
                          free1: '',
                          bonus1: '',
                          qty2: '',
                          free2: '',
                          bonus2: '',
                          qty3: '',
                          free3: '',
                          bonus3: '',
                          qty4: '',
                          free4: '',
                          bonus4: '',
                          qty5: '',
                          free5: '',
                          bonus5: '',
                          qty6: '',
                          free6: '',
                          bonus6: '',
                          qty7: '',
                          free7: '',
                          bonus7: '',
                          qty8: '',
                          free8: '',
                          bonus8: '',
                          qty9: '',
                          free9: '',
                          bonus9: '',
                          qty10: '',
                          free10: '',
                          bonus10: '',
                          qty11: '',
                          free11: '',
                          bonus11: '',
                          qty12: '',
                          free12: '',
                          bonus12: '',
                        })
                    }        
                } 
            }        
        })
    });     
    this.showLoader = false;
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    let tempSave = $("#tempSave").prop('checked');
     if(tempSave)
      {
        if(this.forcastingList.length == 0)
          {
            this.alert.ShowAlert("MsgAddAtleastOneRow",'error');            
            this.disableSave = false;
            return;
          }
        if(this.ForcastingForm.value.countryId == 0 || this.ForcastingForm.value.countryId == null ||this.ForcastingForm.value.countryId == undefined)
          {
              this.alert.ShowAlert("msgEnterAllData",'error');
              this.disableSave = false;
              return;
          }
        if(this.ForcastingForm.value.agentId == 0 || this.ForcastingForm.value.agentId == null ||this.ForcastingForm.value.agentId == undefined)
          {
              this.alert.ShowAlert("msgEnterAllData",'error');
              this.disableSave = false;
              return;
          }
           this.ForcastingForm.get("status").setValue(3);
          this.prepareTable();
      }
      else
      {
         if(this.forcastingList.length == 0)
          {
            this.alert.ShowAlert("MsgAddAtleastOneRow",'error');            
            this.disableSave = false;
            return;
          }
        if(this.ForcastingForm.value.countryId == 0 || this.ForcastingForm.value.countryId == null ||this.ForcastingForm.value.countryId == undefined)
          {
              this.alert.ShowAlert("msgEnterAllData",'error');
              this.disableSave = false;
              return;
          }
        if(this.ForcastingForm.value.agentId == 0 || this.ForcastingForm.value.agentId == null ||this.ForcastingForm.value.agentId == undefined)
          {
              this.alert.ShowAlert("msgEnterAllData",'error');
              this.disableSave = false;
              return;
          }
      this.forcastingList.forEach(element=> {
        if(element.itemNo == null || element.total == 0 || element.total == '' || element.total == null || element.price == ""){
            this.alert.ShowAlert("msgEnterAllData",'error');
            stopExecution = true;
            this.disableSave = false;
            return;
          }
        })
        if (stopExecution) {
          return; 
        }      
        this.forcastingList = this.forcastingList.map(item => {
          // Iterate through each property in the item
          Object.keys(item).forEach(key => {
            // Check if the key is qty, free, or bonus with a number suffix
            if (/^(qty|free|bonus)\d+$/.test(key)) {
              item[key] = parseFloat(item[key]) || 0; // Convert to number or default to 0 if empty
            }
          });
          return item;
        });
        this.ForcastingForm.get("status").setValue(1);
      }
   
  
    this.ForcastingForm.value.forecastingDTList = this.forcastingList;
    this.ForcastingForm.value.agentId = Number(this.ForcastingForm.value.agentId);
    this.ForecastingService.PostForecasting(this.ForcastingForm.value).subscribe(res => {
      if(res){
        debugger
        this.alert.SaveSuccess();
        this.router.navigate(['Forecasting/ForecastingList']);

      }
      else{
        this.alert.SaveFaild();
      }    
      this.disableSave = false;    
    }, err => {
      this.alert.SaveFaild();
    })
  }

  formatNumber(row: any) {
    debugger
    // Ensure `totalQuantities` is a valid number
    if (row.qty1 != null) {
      // Format the number (e.g., two decimal places and comma separators)
      row.qty1 = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(row.qty1);
    }
  }

  updateValueField(value: number, row: any, fieldName: string): void {      
    debugger
    if (fieldName === 'total') {
      const copiedValue = value; // Create a copy of the original value
      //this.divideValue(row, copiedValue);
    } else {
      // Update the specific month field
      row[fieldName] = value;
    }  
    this.updateSum(row);
  }

  private updateSum(row: any): void {
  debugger;
  let sum = 0;
  let totalQty = 0; 
  let totalFree = 0; 
  let totalBonus = 0; 

  for (let i = 1; i <= 12; i++) {
    const qty = parseFloat(row['qty' + i]) || 0;
    const free = parseFloat(row['free' + i]) || 0;
    const bonus = parseFloat(row['bonus' + i]) || 0;
    const total = qty + free + bonus;

    row['total' + i] = Number(total.toFixed(3));
    row['mtotal' + i] = Number((qty * row.price).toFixed(3));

    sum += total;
    totalQty += qty;
    totalFree += free;
    totalBonus += bonus;
  }

  debugger;
  // Format accumulated totals
  sum = Number(sum.toFixed(3));
  totalQty = Number(totalQty.toFixed(3));
  totalFree = Number(totalFree.toFixed(3));
  totalBonus = Number(totalBonus.toFixed(3));
  // total and price 
  row.total = Number(sum.toFixed(3));
  row.totalvalue = Number((row.price * totalQty).toFixed(3));

  // total Qty and Free and Bonus
  row.totalQuantities = Number(totalQty.toFixed(3));
  row.totalFree = Number(totalFree.toFixed(3));
  row.totalBouns = Number(totalBonus.toFixed(3));

  // total All Qty and All Free and All Bonus
  this.totalvalue ??= 0;
  this.totalPrice ??= 0;

  this.totalQty = Number(
    this.forcastingList.reduce((sum, item) => sum + Number(item.total), 0).toFixed(3)
  );

  this.totalvalue = Number(
    this.forcastingList.reduce((sum, item) => sum + Number(item.totalvalue), 0).toFixed(3)
  );

  this.totalPrice = this.totalQty !== 0
    ? Number((this.totalvalue / this.totalQty).toFixed(3))
    : 0;
}

  // private updateSum(row: any): void {
  //   debugger
  //   let sum = 0;
  //   let totalQty = 0; 
  //   let totalFree = 0; 
  //   let totalBonus = 0; 

  //   for (let i = 1; i <= 12; i++) {
  //     const qty = parseFloat(row['qty' + i]) || 0;
  //     const free = parseFloat(row['free' + i]) || 0;
  //     const bonus = parseFloat(row['bonus' + i]) || 0;
  //     const total = qty + free + bonus;

  //     row['total' + i] = total;
  //     row['mtotal' + i] = (qty * row.price).toFixed(3);

  //     sum += total;

  //     totalQty += qty;
  //     totalFree += free;
  //     totalBonus += bonus;
  //   }

  //   debugger
  //   // total and price 
  //   row.total = sum;
  //   row.totalvalue = (row.price * totalQty).toFixed(3);

  //  // total Qty and Free and Bonus
  //   row.totalQuantities = totalQty.toFixed(3);
  //   row.totalFree = totalFree.toFixed(3);
  //   row.totalBouns = totalBonus.toFixed(3);

  // // total All Qty and All Free and All  Bonus
  // this.totalvalue ??= 0;
  // this.totalPrice ??= 0;
  //   this.totalQty = this.forcastingList.reduce((sum, item) => sum + Number(item.total), 0).toFixed(3);
  //   this.totalvalue =this.forcastingList.reduce((sum, item) => sum + Number(item.totalvalue), 0).toFixed(3);
  //   this.totalPrice = (this.totalvalue /  this.totalQty).toFixed(3);
  //   this.totalPrice = Number(this.totalPrice.toFixed(3));
  // }

  calculateSum(type){
    if(this.forcastingList != null){
/*       if(type == 1)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.price), 0); */
       if(type == 1)
        return this.forcastingList.reduce((sum, item) => sum + item.total, 0).toFixed(3);
      else if(type == 2)
        return this.forcastingList.reduce((sum, item) => sum + item.totalvalue, 0);
      else if(type == 3)
        return this.forcastingList.reduce((sum, item) => sum + item.totalQuantities, 0);
      else if(type == 4)
        return this.forcastingList.reduce((sum, item) => sum + item.totalFree, 0);
      else if(type == 5)
        return this.forcastingList.reduce((sum, item) => sum + item.totalBouns, 0);
      else if(type == 6)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.qty1) , 0);
      else if(type == 7)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.free1), 0);
      else if(type == 8)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.bonus1) , 0);
      else if(type == 9)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.total1), 0);
      else if(type == 10)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.qty2) , 0);
      else if(type == 11)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.free2), 0);
      else if(type == 12)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.bonus2) , 0);
      else if(type == 13)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.total2), 0);
      else if(type == 14)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.qty3) , 0);
      else if(type == 15)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.free3), 0);
      else if(type == 16)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.bonus3) , 0);
      else if(type == 17)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.total3), 0);
      else if(type == 18)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.qty4) , 0);
      else if(type == 19)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.free4), 0);
      else if(type == 20)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.bonus4) , 0);
      else if(type == 21)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.total4), 0);
      else if(type == 22)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.qty5) , 0);
      else if(type == 23)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.free5), 0);
      else if(type == 24)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.bonus5) , 0);
      else if(type == 25)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.total5), 0);
      else if(type == 26)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.qty6) , 0);
      else if(type == 27)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.free6), 0);
      else if(type == 28)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.bonus6) , 0);
      else if(type == 29)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.total6), 0);
      else if(type == 30)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.qty7) , 0);
      else if(type == 31)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.free7), 0);
      else if(type == 32)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.bonus7) , 0);
      else if(type == 33)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.total7), 0);
      else if(type == 34)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.qty8) , 0);
      else if(type == 35)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.free8), 0);
      else if(type == 36)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.bonus8) , 0);
      else if(type == 37)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.total8), 0);
      else if(type == 38)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.qty9) , 0);
      else if(type == 39)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.free9), 0);
      else if(type == 40)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.bonus9) , 0);
      else if(type == 41)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.total9), 0);
      else if(type == 42)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.qty10) , 0);
      else if(type == 43)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.free10), 0);
      else if(type == 44)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.bonus10) , 0);
      else if(type == 45)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.total10), 0);
      else if(type == 46)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.qty11) , 0);
      else if(type == 47)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.free11), 0);
      else if(type ==48)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.bonus11) , 0);
      else if(type == 49)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.total11), 0);
      else if(type == 50)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.qty12) , 0);
      else if(type == 51)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.free12), 0);
      else if(type == 52)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.bonus12) , 0);
      else if(type == 53)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.total12), 0);
      else if(type == 54)
          return this.forcastingList.reduce((sum, item) => sum + Number(item.mtotal1), 0);
      else if(type == 55)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.mtotal2), 0);
      else if(type == 56)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.mtotal3), 0);
      else if(type == 57)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.mtotal4), 0);
      else if(type == 58)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.mtotal5), 0);
      else if(type == 59)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.mtotal6), 0);
      else if(type == 60)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.mtotal7), 0);
      else if(type == 61)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.mtotal8), 0);
      else if(type == 62)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.mtotal9), 0);
      else if(type == 63)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.mtotal10), 0);
      else if(type == 64)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.mtotal11), 0);
      else if(type == 65)
        return this.forcastingList.reduce((sum, item) => sum + Number(item.mtotal12), 0);
    }    
  }

  ApproveForecasting(id:any)
  {
    this.ForecastingService.ApproveForcasting(id).subscribe(res=> 
      {
        if (res.isSuccess == false && res.message == "msNoPermission") 
          {
            this.alert.ShowAlert("msNoPermission", 'error');
            this.showLoader = false;
            return;
          }
        if(res == true)
          {
            this.HideApproval = true;
            this.alert.SaveSuccess();
            this.router.navigate(['Forecasting/ForecastingList']);
          }
          else
          {
            this.alert.SaveFaild();
          }
      })
  }

  focusedRowIndex: number | null = null;
  setFocusedRow(index: number): void {
    this.focusedRowIndex = index;
  }

  getSelectedItemName(itemNo: string): string | undefined {
    const selectedItem = this.itemsList.find(item => item.data1 === itemNo);
    return selectedItem?.text;
  }

  exportToExcel(): void {
    const selectedAgentId = this.ForcastingForm.get('agentId')?.value;
    const selectedAgent = this.customersList.find(agent => agent.data1 === selectedAgentId)?.text;
    const selectedCountryId = this.ForcastingForm.get('countryId')?.value;
    const selectedCountryName = this.countriesList.find(agent => agent.id === selectedCountryId)?.text;
    const extraRows = [
      ["Country:", selectedCountryName], 
      ["Agent Name:", selectedAgent], 
      [], 
    ];
    const table = document.getElementById('forecastingTable');
    const tableData = XLSX.utils.table_to_sheet(table);
  
    // Convert table sheet to array
    const tableArray: any[][] = XLSX.utils.sheet_to_json(tableData, { header: 1 }) as any[][];
  
    // Remove the first column from each row (skip empty rows)
    const trimmedTableArray = tableArray.map(row => row.slice(1));
  
    // Merge extraRows with the trimmed table data
    const finalData: any[][] = [...extraRows, ...trimmedTableArray];
  
    // Create worksheet and workbook
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(finalData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Forecasting Data');
  
    // Export to Excel
    XLSX.writeFile(wb, 'ForecastingData.xlsx');
  }

  prepareTable()
  {
    for (let i = 0; i < this.forcastingList.length; i++) {
        let row = this.forcastingList[i];
        if(row.price == "" || row.price == null || row.price == undefined)
          {
            row.price = 0;
          }
        if(row.qty1 == "" || row.qty1 == null || row.qty1 == undefined)
          {
            row.qty1 = 0;
          }
        if(row.free1 == "" || row.free1 == null || row.free1 == undefined)
          {
            row.free1 = 0;
          }
          if(row.bonus1 == "" || row.bonus1 == null || row.bonus1 == undefined)
          {
            row.bonus1 = 0;
          }

        if(row.qty2 == "" || row.qty2 == null || row.qty2 == undefined)
          {
            row.qty2 = 0;
          }
        if(row.free2 == "" || row.free2 == null || row.free2 == undefined)
          {
            row.free2 = 0;
          }
        if(row.bonus2 == "" || row.bonus2 == null || row.bonus2 == undefined)
          {
            row.bonus2 = 0;
          }
        
        if(row.qty3 == "" || row.qty3 == null || row.qty3 == undefined)
          {
            row.qty3 = 0;
          }
        if(row.free3 == "" || row.free3 == null || row.free3 == undefined)
          {
            row.free3 = 0;
          }
        if(row.bonus3 == "" || row.bonus3 == null || row.bonus3 == undefined)
          {
            row.bonus3 = 0;
          }

        if(row.qty4 == "" || row.qty4 == null || row.qty4 == undefined)
          {
            row.qty4 = 0;
          }
        if(row.free4 == "" || row.free4 == null || row.free4 == undefined)
          {
            row.free4 = 0;
          }
        if(row.bonus4 == "" || row.bonus4 == null || row.bonus4 == undefined)
          {
            row.bonus4 = 0;
          }

        if(row.qty5 == "" || row.qty5 == null || row.qty5 == undefined)
          {
            row.qty5 = 0;
          }
        if(row.free5 == "" || row.free5 == null || row.free5 == undefined)
          {
            row.free5 = 0;
          }
        if(row.bonus5 == "" || row.bonus5 == null || row.bonus5 == undefined)
          {
            row.bonus5 = 0;
          }

        if(row.qty6 == "" || row.qty6 == null || row.qty6 == undefined)
          {
            row.qty6 = 0;
          }
        if(row.free6 == "" || row.free6 == null || row.free6 == undefined)
          {
            row.free6 = 0;
          }
        if(row.bonus6 == "" || row.bonus6 == null || row.bonus6 == undefined)
          {
            row.bonus6 = 0;
          }
          // --------------------------------------------------------------------------
        if(row.qty7 == "" || row.qty7 == null || row.qty7 == undefined)
          {
            row.qty7 = 0;
          }
        if(row.free7 == "" || row.free7 == null || row.free7 == undefined)
          {
            row.free7 = 0;
          }
          if(row.bonus7 == "" || row.bonus7 == null || row.bonus7 == undefined)
          {
            row.bonus7 = 0;
          }

        if(row.qty8 == "" || row.qty8 == null || row.qty8 == undefined)
          {
            row.qty8 = 0;
          }
        if(row.free8 == "" || row.free8 == null || row.free8 == undefined)
          {
            row.free8 = 0;
          }
        if(row.bonus8 == "" || row.bonus8 == null || row.bonus8 == undefined)
          {
            row.bonus8 = 0;
          }
        
        if(row.qty9 == "" || row.qty9 == null || row.qty9 == undefined)
          {
            row.qty9 = 0;
          }
        if(row.free9 == "" || row.free9 == null || row.free9 == undefined)
          {
            row.free9 = 0;
          }
        if(row.bonus9 == "" || row.bonus9 == null || row.bonus9 == undefined)
          {
            row.bonus9 = 0;
          }

        if(row.qty10 == "" || row.qty10 == null || row.qty10 == undefined)
          {
            row.qty10 = 0;
          }
        if(row.free10 == "" || row.free10 == null || row.free10 == undefined)
          {
            row.free10 = 0;
          }
        if(row.bonus10 == "" || row.bonus10 == null || row.bonus10 == undefined)
          {
            row.bonus10 = 0;
          }

        if(row.qty11 == "" || row.qty11 == null || row.qty11 == undefined)
          {
            row.qty11 = 0;
          }
        if(row.free11 == "" || row.free11 == null || row.free11 == undefined)
          {
            row.free11 = 0;
          }
        if(row.bonus11 == "" || row.bonus11 == null || row.bonus11 == undefined)
          {
            row.bonus11 = 0;
          }

        if(row.qty12 == "" || row.qty12 == null || row.qty12 == undefined)
          {
            row.qty12 = 0;
          }
        if(row.free12 == "" || row.free12 == null || row.free12 == undefined)
          {
            row.free12 = 0;
          }
        if(row.bonus12 == "" || row.bonus12 == null || row.bonus12 == undefined)
          {
            row.bonus12 = 0;
          }
      }
  }
  
  calcBounsAndFree(qty: number, row: any, name: string) {
  debugger;
  console.log('Triggered calcBounsAndFree', qty, this.bonusPer, this.freePer);
  let qtyy = Number(qty);
  if (qtyy > 0) {
    if(name === 'qty1')
      {
        if (this.bonusPer > 0) {
            row.bonus1 = (qtyy * this.bonusPer) / 100;
            row.bonus1 =  Number(row.bonus1.toFixed(3));
        }
        if (this.freePer > 0) {
            row.free1 = (qtyy * this.freePer) / 100;
            row.free1 =  Number(row.free1.toFixed(3));
        }
      }
    if(name === 'qty2')
      {
        if (this.bonusPer > 0) {
            row.bonus2 = (qtyy * this.bonusPer) / 100;
            row.bonus2 =  Number(row.bonus2.toFixed(3));
        }
        if (this.freePer > 0) {
            row.free2 = (qtyy * this.freePer) / 100;
            row.free2 =  Number(row.free2.toFixed(3));
        }
      }
    if(name === 'qty3')
      {
        if (this.bonusPer > 0) {
            row.bonus3 = (qtyy * this.bonusPer) / 100;
            row.bonus3 =  Number(row.bonus3.toFixed(3));
        }
        if (this.freePer > 0) {
            row.free3 = (qtyy * this.freePer) / 100;
            row.free3 =  Number(row.free3.toFixed(3));
        }
      }
     if(name === 'qty4')
      {
        if (this.bonusPer > 0) {
            row.bonus4 = (qtyy * this.bonusPer) / 100;
            row.bonus4 =  Number(row.bonus4.toFixed(3));
        }
        if (this.freePer > 0) {
            row.free4 = (qtyy * this.freePer) / 100;
            row.free4 =  Number(row.free4.toFixed(3));
        }
      }
    if(name === 'qty5')
      {
        if (this.bonusPer > 0) {
            row.bonus5 = (qtyy * this.bonusPer) / 100;
            row.bonus5 =  Number(row.bonus5.toFixed(3));
        }
        if (this.freePer > 0) {
            row.free5 = (qtyy * this.freePer) / 100;
            row.free5 =  Number(row.free5.toFixed(3));
        }
      }
    if(name === 'qty6')
      {
        if (this.bonusPer > 0) {
            row.bonus6 = (qtyy * this.bonusPer) / 100;
            row.bonus6 =  Number(row.bonus6.toFixed(3));
        }
        if (this.freePer > 0) {
            row.free6 = (qtyy * this.freePer) / 100;
            row.free6 =  Number(row.free6.toFixed(3));
        }
      }
    if(name === 'qty7')
      {
        if (this.bonusPer > 0) {
            row.bonus7 = (qtyy * this.bonusPer) / 100;
            row.bonus7 =  Number(row.bonus7.toFixed(3));
        }
        if (this.freePer > 0) {
            row.free7 = (qtyy * this.freePer) / 100;
            row.free7 =  Number(row.free7.toFixed(3));
        }
      }
    if(name === 'qty8')
      {
        if (this.bonusPer > 0) {
            row.bonus8 = (qtyy * this.bonusPer) / 100;
            row.bonus8 =  Number(row.bonus8.toFixed(3));
        }
        if (this.freePer > 0) {
            row.free8 = (qtyy * this.freePer) / 100;
            row.free8 =  Number(row.free8.toFixed(3));
        }
      }
    if(name === 'qty9')
      {
        if (this.bonusPer > 0) {
            row.bonus9 = (qtyy * this.bonusPer) / 100;
            row.bonus9 =  Number(row.bonus9.toFixed(3));
        }
        if (this.freePer > 0) {
            row.free9 = (qtyy * this.freePer) / 100;
            row.free9 =  Number(row.free9.toFixed(3));
        }
      }
    if(name === 'qty10')
      {
        if (this.bonusPer > 0) {
            row.bonus10 = (qtyy * this.bonusPer) / 100;
            row.bonus10 =  Number(row.bonus10.toFixed(3));
        }
        if (this.freePer > 0) {
            row.free10 = (qtyy * this.freePer) / 100;
            row.free10 =  Number(row.free10.toFixed(3));
        }
      }
    if(name === 'qty11')
      {
        if (this.bonusPer > 0) {
            row.bonus11 = (qtyy * this.bonusPer) / 100;
            row.bonus11 =  Number(row.bonus11.toFixed(3));
        }
        if (this.freePer > 0) {
            row.free11 = (qtyy * this.freePer) / 100;
            row.free11 =  Number(row.free11.toFixed(3));
        }
      }
    if(name === 'qty12')
      {
        if (this.bonusPer > 0) {
            row.bonus12 = (qtyy * this.bonusPer) / 100;
            row.bonus12 =  Number(row.bonus12.toFixed(3));
        }
        if (this.freePer > 0) {
            row.free12 = (qtyy * this.freePer) / 100;
            row.free12 =  Number(row.free12.toFixed(3));
        }
      }
  }
 this.updateValueField(qty, row, name);
}


}
