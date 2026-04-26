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
import { Observable } from 'rxjs';

@Component({
  selector: 'app-entryitemsserials',
  templateUrl: './entryitemsserials.component.html',
  styleUrls: ['./entryitemsserials.component.scss']
})
export class EntryitemsserialsComponent implements OnInit {
  entryitemSerialForms: FormGroup;
  public TitlePage: string;
  itemName: string;
  qty: number;
  itemId:number;
  storeId:number;
  isShown:boolean =false;
  serialTransList: any[] = [];
  orginalserialTransList: any[] = [];
  no:number=0;
  ser :number = 0;
  allowAdd :any;
  serialsCounter:number =0;
  disableSerials:boolean=false;
  voucherTypeEnum:number;
  invoice :number;
  type:number;
  serialCount: number =0 ;
  firstOpen:boolean;
  bill:any;
  kind:any;
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
    private purService:PurchaseInvoiceService,
    private invSer:InvVoucherService,
  ) 
  {}

  ngOnInit(): void {
    this.InitiailCostcentertransForm();
    this.SetTitlePage();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('itemSequencesForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailCostcentertransForm() {    
    this.entryitemSerialForms = this.formbulider.group({
      idss: [0],   
    });
    debugger
    this.no = 0;
    this.isShown =false;
    this.itemName = this.data.itemName;
    this.qty = this.data.qty; 
    this.itemId= this.data.itemId;
    this.disableSerials = this.data.disableSerials;
    this.voucherTypeEnum = this.data.voucherTypeEnum;
    this.invoice = this.data.invoice;
    this.type = this.data.type;
    this.kind = this.data.kind;
    if(this.type == 1)
      {
        this.firstOpen = this.data.firstOpen;
        this.orginalserialTransList = this.data.orginalserialTransList; 
        this.bill = this.data.bill;
      }
    
    debugger
    if(this.data.serials !== undefined && this.data.serials.length < this.qty)
    {
      this.serialTransList = this.data.serials; 
      for (let i = 0; i = this.qty - this.data.serials.length ; i++) 
      {
        this.serialTransList.push(
          {
            id: this.serialTransList.length + 1,
            itemId:this.data.itemId,
            serialNo:null, 
            rowIndex: this.data.rowIndex, 
            storeId:this.data.storeId,
            isDisabled:false,
            index: this.data.rowIndex        
          });
      }  
      this.serialsCounter= this.serialTransList.length; 
    }    
    else if(this.data.serials !== undefined && this.data.serials.length > 0){   
      
      this.serialTransList = this.data.serials;        
      this.serialsCounter= this.serialTransList.length;
      let no = this.serialTransList.length - this.qty;
      this.serialTransList.splice(0, no);
      // for(let i = 0;i < this.serialTransList.length; i++)
      //   {
      //     if( this.serialTransList.length != this.qty )
      //       {
      //         this.deleteRow(this.serialTransList[i],i);
      //       }          
      //   }
    }
    else{      
      for(let i = 0;i < this.serialTransList.length; i++)
        {
          if( this.serialTransList[i].serialNo == "")
            {
              this.serialTransList.splice(i,1);
            }          
        }
    for (let i = 0; i < this.qty; i++) 
    {
    
      this.serialTransList.push(
        {
          id: this.serialTransList.length + 1,
          itemId:this.data.itemId,
          serialNo:null, 
          rowIndex: this.data.rowIndex, 
          isDisabled:false,
          storeId:this.data.storeId,
          index: this.data.rowIndex        
        });
    } 
    this.serialsCounter= this.serialTransList.length;    
  }




debugger
if(this.type == 1 && this.bill > 0 )
  {
    for (let i = 0; i < this.serialTransList.length; i++) 
      {
        if(this.serialTransList[i].serialNo != '' && this.serialTransList[i].serialNo != null)
          {
            this.serialCount++;
          }      
      }
      if(this.serialCount != this.qty)
        {
          this.serialTransList =this.orginalserialTransList;
        }
    }
    debugger

    
    for (let i = 0; i < this.serialTransList.length; i++) {
      this.purService.GetAllowEditSerialNo(this.serialTransList[i].serialNo,this.itemId).subscribe(result => {
        if(result)
          {
            debugger
            this.serialTransList[i].isDisabled= true;
          }
          else
          {
            this.serialTransList[i].isDisabled= false;
          }      
      })
    }                    
  }
 


  onConfirm(): void {
    debugger
    this.serialCount = 0;
    if(this.serialTransList.length  > 0)
    {
      for (let i = 0; i < this.serialTransList.length; i++) 
        {
          this.serialTransList[i].id=0;      
        }

      for (let i = 0; i < this.serialTransList.length; i++) 
        {
          if(this.serialTransList[i].serialNo != '' && this.serialTransList[i].serialNo != null)
            {
              this.serialCount++;
            }      
        }
      if(this.serialCount !== this.qty)
      {
        this.alert.ShowAlert("CantSaveQtyEntryNotEqual",'error');
        return;
      }
    }
    
    let stopExt = true;
    this.serialTransList.forEach(element => {
      element.isChecked = true;
    });
    if(stopExt == true)
    {
      this.dialogRef.close(this.serialTransList);
    }
    else
    {
      this.alert.ShowAlert("PleaseEnterSerialForId",'error');
      return;
    }
   
  }

  onCancel(): void {
      this.dialogRef.close(this.serialTransList);  
  }

  clearAllSerialNumbers()
  {
    debugger
    if(this.serialTransList.length == 0 || this.serialTransList == null || this.serialTransList == undefined)
    {
      return;
    }
    else
    {
      // this.serialTransList.forEach(element => {
      //    element.rowIndex = null;
      //    element.index = null;
      //    element.serialNo= null;
      // }); 
      this.serialTransList = [];
    }
  }
    
  generateSerialNumbers() {
    debugger;
    if (this.serialTransList.length == 0 || this.serialTransList == null || this.serialTransList == undefined) {
      return;
    } else {
      if (this.serialTransList[0].serialNo == 0 || this.serialTransList[0].serialNo == null || this.serialTransList[0].serialNo == undefined || this.serialTransList[0].serialNo == '') {
        this.alert.ShowAlert("PleaseInsertFirstRowSerialId", 'error');
        return;
      }
      let i = 0;
      this.generateSerial(i,this.itemId);
    }
  }

  generateSerial(i: number,itemId:number) {
    debugger;
    if (i < this.serialTransList.length) {
      if (i == 0) {
        this.ser = this.serialTransList[i].serialNo;
        this.ser++;
        i++;
        this.generateSerial(i,itemId);
      } else {
        this.AllowAddSerial(this.ser,i,itemId).subscribe(allowAdd => {
          const filteredItems = this.serialTransList.filter(item => item.serialNo === this.ser);
          if (filteredItems.length > 0) 
          {
            if(this.serialTransList[i].serialNo === "" )
              {                
                this.serialTransList[i].serialNo = this.ser;  
                this.ser++;                           
                i++;
                this.generateSerial(i,itemId);
              }
              else if(this.serialTransList[i].serialNo === this.ser)
              {
                this.serialTransList[i].serialNo = this.ser;  
                this.ser++;                           
                i++;
                this.generateSerial(i,itemId);
              }
              else  
              {     
                this.ser++;                                          
                this.generateSerial(i,itemId);                   
              }
           
          } 
          else
          {
            if (allowAdd) {
              this.ser++;
              this.generateSerial(i,itemId);
            } else {                                  
              this.serialTransList[i].serialNo = this.ser;
              i++;  
              this.generateSerial(i,itemId);
            }
          }         
        });
      }
    }
  }

  deleteRow(row,rowIndex: number) {
    debugger     
    if(this.serialTransList.length >= 1 ) 
    {
      if(this.serialTransList.length == this.qty)
      {
        this.alert.ShowAlert("CantSaveQtyEqual",'error');
        return;
      }
    }
    
    debugger
    if  (this.type != 1)
      {
        if(row.isDisabled == true)
          {      
            this.alert.ShowAlert("CantRemoveRowSerialHaveTransactions", 'error');
            return;
          }
          else
          {
            if (rowIndex !== -1) {
              this.serialTransList.splice(rowIndex, 1);
            } 
          }
      }
    else
    {
      if (rowIndex !== -1) {
        this.serialTransList.splice(rowIndex, 1);
      } 
    }
    this.serialsCounter= this.serialTransList.length; 

    // for (let i = 0; i < this.qty; i++) 
    // {
    //   this.serialTransList.push(
    //     {
    //       id: this.serialTransList.length + 1,
    //       itemId:this.data.itemId,
    //       serialNo:null, 
    //       rowIndex: this.data.rowIndex, 
    //       isDisabled:false,
    //       storeId:this.data.storeId,
    //       index: this.data.rowIndex        
    //     });
    // } 
    // this.serialsCounter= this.serialTransList.length; 
  }

  CheckIfAllowEditSerial(row,index)
  {        
    debugger
    if( row.serialNo !== null &&  row.serialNo !== 0 &&  row.serialNo !== '')
    {
      if(this.itemId !== 0 && this.itemId !== null)
      {
        this.purService.GetAllowEditSerialNo(row.serialNo,this.itemId).subscribe(result => {
          if(result)
            {
              debugger
              this.serialTransList[index].isDisabled= true;
              if(this.type != 1)
                {
                  this.alert.ShowAlert("CantEditSerialHaveTransactions", 'error');
                }
              
            }
            else
            {
              this.serialTransList[index].isDisabled= false;
            }      
        })    
      }      
    }    
  }

  validateNumericInput(event: KeyboardEvent) {
    // Allow special keys like backspace, delete, arrows, etc.
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(event.keyCode) !== -1 ||
        // Allow Ctrl+A/Ctrl+C/Ctrl+V
        (event.keyCode === 65 && event.ctrlKey === true) ||
        (event.keyCode === 67 && event.ctrlKey === true) ||
        (event.keyCode === 86 && event.ctrlKey === true) ||
        // Allow home, end, left, right
        (event.keyCode >= 35 && event.keyCode <= 39)) {
        return;
    }
    
    // Ensure that the key pressed is a digit (0-9)
    if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
        event.preventDefault();
    }
}

AllowAddSerial1(SerialNo:any,index:number,ItemId:number)
{
  debugger
  if(this.kind != 'Edit')
    {
      if(this.invoice === 0 || this.invoice === null ||this.invoice === undefined )
        {
          if(SerialNo != "" && SerialNo != null)
            {
              this.invSer.AllowAddSerial(SerialNo,ItemId).subscribe(res =>{
                debugger
                if(res)
                  {                
                    this.serialTransList[index].serialNo = '';
                    this.alert.ShowAlert("SerialNoIsAlreadyBeingUsedTryAnother", 'error');
                  }
                  else
                  {
                    return true;
                  }
              })
            }  
        }    
    }  
    else
    {
      debugger
      this.serialTransList.forEach(element => {
        if(element.serialNo == SerialNo)
          {
            for (let i = 0; i < this.serialTransList.length; i++) 
              {
                if(SerialNo ===  Number(this.serialTransList[i].serialNo) && i != index )
                  {
                    this.serialTransList[index].serialNo = '';
                    this.alert.ShowAlert("SerialNoIsAlreadyBeingUsedTryAnother", 'error');
                  }      
              }
          }        
      });
    // }
    }
}

AllowAddSerial(SerialNo: any,index:number,itemId:number): Observable<boolean> {
  return new Observable<boolean>(observer => {
    if (SerialNo != "" && SerialNo != null) {
      this.invSer.AllowAddSerial(SerialNo,itemId).subscribe(res => {
        debugger
        if (res) {
          observer.next(true);
        } else {
          observer.next(false);
        }
      });
    } else {
      observer.next(false);
    }
  });
}



}
