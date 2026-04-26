import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component'
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { ManfuEquationsService } from '../manfuequations.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-manfuequations-list',
  templateUrl: './manfuequations-list.component.html',
  styleUrl: './manfuequations-list.component.scss'
})
export class ManfuequationsListComponent  implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId:number = 212 ;
  custom:boolean;
  data: any[];
  Lang: any;
  constructor
            (
              private title: Title,
              private jwtAuth: JwtAuthService,
              private translateService: TranslateService,
              private alert: sweetalert,
              private dialog: MatDialog,
              private PRService: ManfuEquationsService,
              private routePartsService: RoutePartsService,
              private router: Router,
              private readonly serv: AppCommonserviceService,
            ) { }

  ngOnInit(): void 
  {
    this.SetTitlePage();
    this.GetEntryVouchersList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Manfequationslist');
    this.title.setTitle(this.TitlePage); 
  }

  GetEntryVouchersList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.PRService.GetManFuEquationsList().subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            this.showLoader = false;
            return;
          }
        this.tabelData = result;
 debugger
        if(currentLang == "ar"){
          this.refresPurchaserequestArabic(this.tabelData);
         }
         else{
          this.refreshPurchaserequestEnglish(this.tabelData);
         } 

        this.showLoader = false;
      })
    });

  }

  handleSearchResult(result: any) {
    debugger
    this.tabelData = result;
  }

  DeleteVoucher(id: any) {
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
        this.PRService.DeleteVoucher(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetEntryVouchersList();
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

  OpenDetailsForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['ManfuEquations/manfuEquationsForm']);
  }

  AddPurRequestForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ManfuEquations/manfuEquationsForm']);
  }

  OpenPurRequestForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ManfuEquations/manfuEquationsForm']);
  }

  CopymanfuEquations(id: any) {
  this.routePartsService.GuidToEdit = id;
  this.routePartsService.Guid2ToEdit = 'Copy';
  this.router.navigate(['ManfuEquations/manfuEquationsForm']);
  }
  
  AttachmentEntryvoucher(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger      
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      //height: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId : id, typeId : 33}
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }

  formatAmount(amount: number, decimalPlaces: number = 3): string {
    return amount.toFixed(decimalPlaces);
  }

  updateFavourite(ScreenId: number) {
  this.serv.UpdateFavourite(ScreenId).subscribe(result => {
    if (result.isSuccess) {
      this.getFavouriteStatus(this.screenId);
      this.serv.triggerFavouriteRefresh(); // 🔥 THIS is key
    } else {
      this.alert.ShowAlert(result.message, 'error');
    }
  });
  }

  getFavouriteStatus(screenId)
  {
    debugger
    this.serv.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if(result.isSuccess)
      {
        this.custom = true;
      }
      else
      {
        this.custom = false;
      }
      debugger             
    })        
  }

  refresPurchaserequestArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const equationDate = new Date(x.equationDate).toLocaleDateString('ar-EG');
    return {
      'رقم المعادلة': x.id,
      'تاريخ المعادلة': equationDate,
      'المادة المنتجة': x.itemName,
      'الوحدة': x.unitName,
      'الكمية': x.qty,
    }
    });
  }

  refreshPurchaserequestEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const equationDate = new Date(x.equationDate).toLocaleDateString('en-GB');
    return {
      'Equation Type': x.id,
      'Equation Date': x.equationDate,
      'Producted Item': x.itemName,
      'Unit': x.unitName,
      'Quantity': x.qty,
    }
    });
  }

  exportExcel(dt: any) {
    import("xlsx").then(xlsx => {

            var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];

      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      }
      else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refresPurchaserequestArabic(exportSource);
      } else {
        this.refreshPurchaserequestEnglish(exportSource);
      }

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, this.TitlePage);
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

  exportPdf(dt: any)
  {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';   
    let head: string[][];
    
    if(currentLang == "ar"){
       head = [['الكمية',' الوحدة',' المادة المنتجة',' تاريخ المعادلة',' رقم المعادلة']]    }
    else{
       head = [['Quantity','Unit','Producted Item',' Equation Date','Equation Number']]
    }
    const rows :(number|string)[][]=[];

        let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    }
    else {
      exportSource = this.data;
    }

    exportSource.forEach(function(part, index) {

      const date1 = new Date(part.equationDate);
      const equationDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

    let temp: (number|string)[] =[];
     temp[0]= part.id
     temp[1]= equationDate 
     temp[2]= part.itemName
     temp[3]= part.unitName
     temp[4]= part.qty 
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


   const Title = currentLang == "ar" ? "قائمة معادلات التصنيع" : "Manufacturing Equations List" ;  
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

  PrintManfuequations(Id: number) {
  debugger
  this.Lang = this.jwtAuth.getLang();
  if (this.Lang == "ar") {
  const reportUrl = `RptManfuEquationsAR?Id=${Id}`;
  const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
  window.open(url, '_blank');
  }
  else {
  const reportUrl = `RptManfuEquationsEN?Id=${Id}`;
  const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
  window.open(url, '_blank');
  }
  }
}
