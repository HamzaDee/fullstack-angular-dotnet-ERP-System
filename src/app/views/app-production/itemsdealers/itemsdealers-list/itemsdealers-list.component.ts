import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { Router } from '@angular/router';
import { ItemsdealersService } from '../itemsdealers.service'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { DealersitemsListComponent } from '../dealersitems-list/dealersitems-list.component'; 
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-itemsdealers-list',
  templateUrl: './itemsdealers-list.component.html',
  styleUrls: ['./itemsdealers-list.component.scss']
})
export class ItemsdealersListComponent implements OnInit {
  tabelData: any[];
  public TitlePage: string;
  exportData: any[];
  exportColumns: any[];
  data: any[];

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private egretLoader: AppLoaderService,
    private ItemsdealersService: ItemsdealersService,
    private router: Router,
    private http: HttpClient,
    private routePartsService: RoutePartsService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetItemsList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsdealersList');
    this.title.setTitle(this.TitlePage);
  }

  GetItemsList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    setTimeout(() => {
      this.ItemsdealersService.GetItemsList().subscribe(result => {
        this.tabelData = result;

        if(currentLang == "ar"){
          this.refresItemsdealersListArabic(this.tabelData);
         }
         else{
          this.refreshItemsdealersListEnglish(this.tabelData);
         }   

      })
    });
  }

  ShowDealersList(itemNo,itemName){
    debugger
      let dialogRef: MatDialogRef<any> = this.dialog.open(DealersitemsListComponent, {
        width: '1000px',
        height: '90%',
        //maxHeight: '700px',
        direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
        data: { title: this.translateService.instant('ItemsdealersList'), itemNo: itemNo,itemName: itemName, GetDealersList: () => { this.GetItemsList() } }
      });
      dialogRef.afterClosed()
        .subscribe(res => {
          if (!res) {
            // If user press cancel
            return;
          }
        })
  }

  AttachmentEntryvoucher(itemId) {
    this.routePartsService.GuidToEdit = itemId;
    debugger      
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      //height: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId : itemId, typeId : 4}
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          // var newList = this.EntryVoucherAddForm.value.costCenterTranModelList.filter(item => item.index !== rowIndex);
          // newList = [...newList , ...res];
          // this.EntryVoucherAddForm.get("costCenterTranModelList").setValue(newList);
          // If user press cancel
          return;
        }
      })
  }

  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }

  refresItemsdealersListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رقم المادة': x.item_No,
      'اسم المادة': x.item_Name,
      'الصنف': x.typeName,
    }));
  }

  refreshItemsdealersListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Item Number': x.item_No,
      'Item Name': x.item_Name,
      'category': x.typeName,
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "products");
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
       head = [[' الصنف',' اسم المادة',' رقم المادة']]    }
    else{
       head = [[' category','Item Name','Item Number']]
    }
    const rows :(number|string)[][]=[];

    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.item_No
     temp[1]= part.item_Name 
     temp[2]= part.typeName


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

   const Title = currentLang == "ar" ?  "قائمة موردي المواد" : "Materials Suppliers List ";   
   const pageWidth = pdf.internal.pageSize.width;
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


