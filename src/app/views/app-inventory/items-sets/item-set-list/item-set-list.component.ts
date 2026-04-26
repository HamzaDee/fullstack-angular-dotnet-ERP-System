import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ItemSetFormComponent } from '../item-set-form/item-set-form.component';
import Swal from 'sweetalert2';
import { ItemSetService } from '../items-sets.service'; 
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-item-set-list',
  templateUrl: './item-set-list.component.html',
  styleUrls: ['./item-set-list.component.scss']
})
export class ItemSetListComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  data: any[];
  exportData: any[];

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private itemSetService: ItemSetService,
    private dialog: MatDialog,) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.ItemsSetsList();
  }
  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemSetsHDList');
    this.title.setTitle(this.TitlePage);
  }
  ItemsSetsList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.showLoader = true;
    setTimeout(() => {
      this.itemSetService.ItemsSetsList().subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }
        this.tabelData = result;

        if(currentLang == "ar"){
          this.refreshItemSetListArabic(this.tabelData);
         }
         else{
          this.refreshItemSetListEnglish(this.tabelData);
         }   
        this.showLoader = false;
      })
    });
  }
  //shoud add permission
  DeleteItemSet(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.itemSetService.DeleteItemSet(id).subscribe((results) => {
          if (results == true) {
            this.alert.DeleteSuccess();
            this.ItemsSetsList();
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }}
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OpenItemSetFormPopUp(id: number, isNew?) {
    let title = isNew ? this.translateService.instant('newItemSet') : this.translateService.instant('modifyItemSet');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ItemSetFormComponent, {
      width: '1000px',
      height: '700px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, isNew,
        ItemsSetsListFromParent: () => { this.ItemsSetsList() }
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  refreshItemSetListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رقم الطقم': x.number,
      ' الباركود': x.barcode,
      'اسم الطقم': x.name,
      'السعر': x.setPrice,
      'الملاحظات': x.note,
      ' نشط': x.stopped,
    }));
  }

  refreshItemSetListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Set Number': x.number,
      'BarCode': x.barcode,
      'Set Name': x.name,
      'Price': x.setPrice,
      'Notes': x.note,
      'Active ': x.stopped,
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
       head = [['نشط','الملاحظات',' السعر',' اسم الطقم','  الباركود',' رقم الطقم']]    }
    else{
       head = [['Active','Notes','Price',' Set Name','BarCode','Set Number']]
    }

    const rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.number
     temp[1]= part.barcode 
     temp[2]= part.name
     temp[3]= part.setPrice
     temp[4]= part.note 
     temp[5]= part.stopped

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

   let Title;
   if(currentLang == "ar"){
     Title = "قائمة اطقم المواد ";
  }
   else{
     Title = "Items Sets List";
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