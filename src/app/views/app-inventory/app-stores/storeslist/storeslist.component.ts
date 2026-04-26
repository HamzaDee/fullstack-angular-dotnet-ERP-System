import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { AppStoresService } from '../app-stores.service';
import { StoresformComponent } from '../storesform/storesform.component';
import { StoresdetailComponent } from '../storesdetail/storesdetail.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { StoreManagerHistoryComponent } from '../store-manager-history/store-manager-history.component';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-storeslist',
  templateUrl: './storeslist.component.html',
  styleUrls: ['./storeslist.component.scss']
})
export class StoreslistComponent implements OnInit {
  public TitlePage: string;
  data: any[];
  cols: any[];
  mainTableList: any;
  selectedMainTable: any;
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  exportData: any[];


  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private inventoryService: AppStoresService
  ) {
  }
  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAllStoresList();
  }
  SetTitlePage() {
    this.TitlePage = this.translateService.instant('StoresList');
    this.title.setTitle(this.TitlePage);
  }

  GetAllStoresList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.inventoryService.GetAllStores().subscribe((result) => {
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          return;
        }

      this.data = result;

      if(currentLang == "ar"){
        this.refreshStoreslistArabic(this.data);
       }
       else{
        this.refreshStoreslistEnglish(this.data);
       }   
    });
  }

  GetAllMainSystemsDefinitionListBy(tableNo) {

  }

  DeleteStore(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      debugger
      if (result.value) {
        this.inventoryService.DeleteStore(id).subscribe((results) => {
          debugger
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.GetAllStoresList();
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }}
            else if(results.message == "msgRecordHasLinks"){

              this.alert.ShowAlert("msgRecordHasLinks",'error')
          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OpenStoresFormPopUp(id: number, isNew?) {
    let optype ='';
    if(id > 0)
      {
        optype = 'Edit';
      }
      else
      {
        optype = 'Show';
      }
    let title = isNew ? this.translateService.instant('StoresForm') : this.translateService.instant('StoresForm');
    let dialogRef: MatDialogRef<any> = this.dialog.open(StoresformComponent, {
      width: '920px',
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, id: id, isNew,optype:optype ,GetAllStoresList: () => { this.GetAllStoresList() } }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  OpenStoresDetailsFormPopUp(id: number, isNew?) {
    debugger
    let optype = 'Show';
    let title = isNew ? this.translateService.instant('StoreDetail') : this.translateService.instant('StoreDetail');
    let dialogRef: MatDialogRef<any> = this.dialog.open(StoresdetailComponent, {
      width: '720px',
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, id: id, isNew,optype:optype ,GetAllStoresList: () => { this.GetAllStoresList() } }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }


  OpenStoreManagerHistoryPopUp(id: number, isNew?) {
    debugger
    let title = isNew ? this.translateService.instant('StoreManagerHistory') : this.translateService.instant('StoreManagerHistory');
    let dialogRef: MatDialogRef<any> = this.dialog.open(StoreManagerHistoryComponent, {
      width: '720px',
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, id: id, isNew}
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  refreshStoreslistArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'الرقم': x.id,
      'الاسم': x.storeName,
      'اسم مسؤول المخزن': x.storeKeeperName,
      'الهاتف': x.telephone,
      'الموبايل': x.mobile,
      'العنوان': x.address,
      'نشط': x.active,
    }));
  }

  refreshStoreslistEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Number': x.id,
      'Name': x.storeName,
      'Store Admain Name': x.storeKeeperName,
      'Telephone': x.telephone,
      'Mobile': x.mobile,
      'Address': x.address,
      'Active': x.active,
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Stores list");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  exportPdf()
  {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';   
    let head: string[][];

    if(currentLang == "ar"){
       head = [[' نشط','  العنوان','الموبايل',' الهاتف','  اسم مسؤول المخزن','  الاسم','  الرقم']]    }
    else{
        head = [['Active','Address','Mobile','Telephone',' Store Admain Name','Name','Number']]
    }
    var rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.id
     temp[1]= part.storeName 
     temp[2]= part.storeKeeperName
     temp[3]= part.telephone
     temp[4]= part.mobile 
     temp[5]= part.address
     temp[6]= part.active
     if (isArabic) {
       temp.reverse();
     }
     rows.push(temp)
   },this.data)
  
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

   let Title = "";
   if(currentLang == "ar"){
     Title = "قائمة المخازن";
  }
   else{
     Title = "Stores List";
   }
  
   let pageWidth = pdf.internal.pageSize.width;
   pdf.text(Title, pageWidth / 2, 8, {align: 'center'});
  
   autoTable(pdf as any, {
    head  :head,
    body :rows,
    headStyles: {font: "Amiri" , halign: isArabic ? 'right' : 'left' ,fontSize: 8 ,fontStyle:'bold' ,textColor: "black", lineWidth: 0.2 ,minCellWidth:20},
    bodyStyles: {font: "Amiri" , halign: isArabic ? 'right' : 'left' ,fontSize: 8 ,fontStyle:'bold'},
    theme:"grid",
  });
   pdf.output('dataurlnewwindow')
  }
}

