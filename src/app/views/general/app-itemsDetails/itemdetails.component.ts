import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { PurchaseInvoiceService } from 'app/views/app-purchase/app-purchaseinvoice/purchaseinvoice.service';
import { InvVoucherService } from 'app/views/app-inventory/app-inventoryService.service';
import { EntryvoucherhService } from 'app/views/app-inventory/app-entryvoucherh/entryvoucherh.service';
import Swal from 'sweetalert2';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-itemdetails',
  templateUrl: './itemdetails.component.html',
  styleUrl: './itemdetails.component.scss'
})
export class ItemdetailsComponent implements OnInit {
  itemDetailsForm: FormGroup;
  public TitlePage: string;
  itemName: string;
  qty: number;
  itemId: number;
  storeId: number;
  itemdetailsList: any[] = [];
  unitsList: Array<any> = [];
  itemsList: any;
  loading: boolean;
  index: number;
  optype:any;
  constructor
    (
      @Inject(MAT_DIALOG_DATA) public data: any,
      public dialogRef: MatDialogRef<any>,
      public routePartsService: RoutePartsService,
      public router: Router,
      private title: Title,
      private translateService: TranslateService,
      private formbulider: FormBuilder,
      private appCommonserviceService: AppCommonserviceService,
      private alert: sweetalert,
      private purService: PurchaseInvoiceService,
      private invSer: InvVoucherService,
      private serv: EntryvoucherhService,
    ) { }

  ngOnInit(): void {
    this.itemDetaillsForm();
    this.SetTitlePage();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('itemSequencesForm');
    this.title.setTitle(this.TitlePage);
  }

  itemDetaillsForm() {
    this.itemDetailsForm = this.formbulider.group({
      id: [0],
      invVoucherDTID: [0],
      itemDTId: [0],
    });
    debugger
    this.itemName = this.data.itemName;
    this.itemId = this.data.itemId;
    this.unitsList = this.data.units;
    this.itemsList = this.data.items;
    this.itemdetailsList = this.data.itemDtl || [];
    this.index = this.data.rowIndex;
    this.optype = this.data.kind;
    if(this.itemdetailsList.length > 0) {
      let index = 0;
       this.itemdetailsList.forEach(element => {
          element.total = element.qty * element.price;
          element.expiryDate = formatDate(element.expiryDate, "yyyy-MM-dd", "en-US")
        })
     this.itemdetailsList.forEach(element => {
          this.itemsList.forEach(item => {
            if (item.id === element.itemId) {
              this.unitsList[index] = this.unitsList.filter(unit => unit.id == element.unitId);
              index++;
            }
          });
        })
        for (let i = 0; i < this.itemdetailsList.length; i++) {
          this.onChangeItem(0, this.itemdetailsList[i], i)
        }
    }



  }

  onConfirm(): void {
    debugger
    let stopExt = false;
      
    this.itemdetailsList.forEach(element => {
        if(element.itemId == 0 || element.itemId == null || element.itemId == undefined) {
          stopExt = true;
        }
        if(element.unitId == 0 || element.unitId == null || element.unitId == undefined) {
          stopExt = true;
        }
        if(element.qty == null || element.qty == undefined || element.qty == '') {
          stopExt = true;
        }
        if(element.price == null || element.price == undefined || element.price == '') {
          stopExt = true;
        }
        if(element.total == null || element.total == undefined || element.total == '') {
          stopExt = true;
        }
    });
    for (let index = 0; index < this.itemdetailsList.length; index++) {
      const element = this.itemdetailsList[index];
      const itemId = element.itemId;
      const item = this.itemsList.find(item => item.id === itemId);
      if (!item) {
        continue;
      }
   
        if (item.hasExpiry) {
          if (element.expiryDate == "" || element.expiryDate == null) {
            this.alert.RemainimgQty("msgPleaseEnterExpiryDate1", item.text, 'error');
            stopExt = true;
          }
          
        }      
      element.index = index.toString();
    }
    if (stopExt) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      return ;
    }
    this.dialogRef.close(this.itemdetailsList);
  }

  onCancel(): void {
    debugger
    if(this.optype == 'Edit') 
      {
         this.dialogRef.close(this.itemdetailsList);
         return;
      }
      Swal.fire({
          title: this.translateService.instant('AreYouSure?'),
          text: this.translateService.instant('DoYouWannaSave'),
          icon: 'warning',
          confirmButtonColor: '#dc3741',
          showCancelButton: true,
          confirmButtonText: this.translateService.instant('Yes,deleteit!'),
          cancelButtonText: this.translateService.instant('No'),
        }).then((result) => {
          if (result.value) {
            debugger
            let stopExt = false;
            this.itemdetailsList.forEach(element => {
                if(element.itemId == 0 || element.itemId == null || element.itemId == undefined) {
                  stopExt = true;
                }
                if(element.unitId == 0 || element.unitId == null || element.unitId == undefined) {
                  stopExt = true;
                }
                if(element.qty == null || element.qty == undefined || element.qty == '') {
                  stopExt = true;
                }
                if(element.price == null || element.price == undefined || element.price == '') {
                  stopExt = true;
                }
                if(element.total == null || element.total == undefined || element.total == '') {
                  stopExt = true;
                }
            });
            if (stopExt) {
              this.alert.ShowAlert("msgEnterAllData", 'error');
              return false;
            }
            this.dialogRef.close(this.itemdetailsList);
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
            this.itemdetailsList = [];
            this.dialogRef.close(this.itemdetailsList);
          }
        })
    
  }

  cleardata() {
    debugger
    if (this.itemdetailsList.length == 0 || this.itemdetailsList == null || this.itemdetailsList == undefined) {
      return;
    }
    else {
      this.itemdetailsList = [];
    }
  }

  deleteRow(rowIndex: number) {
    debugger
    if (rowIndex !== -1) {
      this.itemdetailsList.splice(rowIndex, 1);
    }
  }

  AddNewLine() {
    this.itemdetailsList ??= []; 
    this.unitsList[this.itemdetailsList.length] = [];      
     this.itemdetailsList.push(
       {
        id: 0,
        invVoucherDTID: 0,
        itemDTId: this.itemId,
        itemId: 0,
        unitId: 0,
        unitRate: 0,
        qty: "",
        price: "",
        total: 0,
        expiryDate: '',
        pallets: 0,
        weight: 0,
        notes: '',
        index: this.index,
       });
    
  }

   onChangeItem(event, Row, i) {
    debugger
    const eventValue = (typeof event === 'object' && event.value !== undefined) ? event.value : event;
    if (eventValue === 0) {
      if (Row.itemId == 0 || Row.itemId == null) {
        this.unitsList[i] = [];
      }

      if (Row.itemId !== 0 && Row.itemId !== null) {
        this.serv.GetItemUnitbyItemId(Row.itemId).subscribe(res => {
          debugger
          this.unitsList[i] = res;
          if (res.length == 2) {
            this.itemdetailsList[i].unitId = res[1].id;
          }
          else if (this.itemdetailsList[i].unitId != 0 || this.itemdetailsList[i].unitId != null) {
            this.itemdetailsList[i].unitId = Row.unitId;
          }
          else {
            this.itemdetailsList[i].unitId = res[0].id;
          }
          this.onChangeUnit(Row, i, false);
        });
      }


    }
    else {
      if (Row.itemId == 0 || Row.itemId == null) {
        this.unitsList[i] = [];
      }
      if (Row.itemId !== 0 && Row.itemId !== null) {
        if (eventValue !== 0) {
          this.serv.GetItemUnitbyItemId(eventValue).subscribe(res => {
            debugger
            this.unitsList[i] = res;
            if (res.length == 2) {
              this.itemdetailsList[i].unitId = res[1].id;
            }
            else if (this.itemdetailsList[i].unitId != 0 || this.itemdetailsList[i].unitId != null) {
              this.itemdetailsList[i].unitId = Row.unitId;
            }
            else {
              this.itemdetailsList[i].unitId = res[0].id;
            }
            this.onChangeUnit(Row, i, false);
          });
        }


      }
    }  
  }

  onChangeUnit(event, Row, i) {
    debugger
    const eventValue = (typeof event === 'object' && event.value !== undefined) ? event.value : event;
    Row.unitId = eventValue;
    // if (eventValue !== 0 && eventValue !== null && eventValue !== undefined) {
    //   this.invSer.GetUnitRate(Row.itemId, eventValue).subscribe(res => {
    //     this.itemdetailsList[i].unitRate = res;
    //   });
    // }
  }

  loadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.itemsList) {
      this.itemsList = [];
    }

    // Make sure the array is large enough
    while (this.itemsList.length < last) {
      this.itemsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.itemsList[i] = this.itemsList[i];
    }

    this.loading = false;
  }

  OnQtyChange(event: any, row: any, Index: number) {
    debugger
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
      row.total = row.total.toFixed(3);
    }
  }

  OnPriceChange(row: any) {
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
    }
  }

  OnPriceBlur(row: any) {

    if (row.price == null || row.price == undefined) {
      row.price = 0;
      row.total = 0;
    }
    if (row.price !== null && row.price !== undefined) {
      row.price = parseFloat(row.price).toFixed(3);
    }
    if (row.total !== null && row.total !== undefined) {
      row.total = row.price * row.qty;
      row.total = parseFloat(row.total).toFixed(3);
    }
  }

  calculateSum() {
    return this.formatCurrency(this.itemdetailsList.reduce((sum, item) => sum + parseFloat(item.total), 0));
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, 3);
  }

   isRequierdEx(row: any, index: number) {
    const itemId = row.itemId;
    const item = this.itemsList.find(item => item.id === itemId);
    // 
    if (item.hasExpiry) {
      if (this.itemdetailsList[index].expiryDate == "" || this.itemdetailsList[index].expiryDate == null) {
        return true;
      }
    }
    else {
      return false;
    }

  }

}
