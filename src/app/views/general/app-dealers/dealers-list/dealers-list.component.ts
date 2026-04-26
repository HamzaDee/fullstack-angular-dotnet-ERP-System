import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { sweetalert } from 'sweetalert';
import * as FileSaver from 'file-saver';
import { DealersService } from '../dealers.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-dealers-list',
  templateUrl: './dealers-list.component.html',
  styleUrls: ['./dealers-list.component.scss']
})
export class DealersListComponent implements OnInit {
  public TitlePage: string;
  data: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId: number;
  custom: boolean;
  showAccountId: boolean = false;
  type: any;
  exportData: any[];
  dealerType: string;
  
  constructor
    (
      private title: Title,
      private translateService: TranslateService,
      private alert: sweetalert,
      private router: Router,
      private dealersService: DealersService,
      private routePartsService: RoutePartsService,
      private jwtAuth: JwtAuthService,
      private dialog: MatDialog,
      private route2: ActivatedRoute,
      private readonly serv: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    debugger
    this.type = this.route2.snapshot.data['type'];
    if (this.type == 1) {
      this.screenId = 80;
    }
    else {
      this.screenId = 78;
    }
    this.SetTitlePage();
    this.GetDealersList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    if (this.type == 1) {
      this.TitlePage = this.translateService.instant('DealersList1');
      this.dealerType = 'CustomerType';
      this.title.setTitle(this.TitlePage);
    }
    else {
      this.TitlePage = this.translateService.instant('DealersList');
      this.dealerType = 'SupplierType';
      this.title.setTitle(this.TitlePage);
    }

  }

  GetDealersList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.showLoader = true;
    setTimeout(() => {
      this.dealersService.GetDealersList(this.type).subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message =="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
        this.data = result;
        if(currentLang == "ar"){
          this.refresDealersListArabic(this.data);
         }
         else{
          this.refreshDealersListEnglish(this.data);
         }   

        this.showLoader = false;
      })
    });
  }

  ShowDealerForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = true;
    this.routePartsService.Guid3ToEdit = this.type;
    this.routePartsService.Guid4ToEdit = 'Show';

    if (this.type == 1) {
      this.router.navigate(['Dealers/DealersForm1']);
    }
    else {
      this.router.navigate(['Dealers/DealersForm']);
    }

  }

  EditDealerForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = false;
    this.routePartsService.Guid3ToEdit = this.type;
    this.routePartsService.Guid4ToEdit = 'Edit';
    // this.router.navigate(['Dealers/DealersForm']);
    if (this.type == 1) {
      this.router.navigate(['Dealers/DealersForm1']);
    }
    else {
      this.router.navigate(['Dealers/DealersForm']);
    }
  }

  DeleteDealer(id: any) {
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
        if (this.type == 1) {
          this.dealersService.DeleteCustomer(id).subscribe((results) => {
            if (results) {
              if(results.isSuccess == false && results.message =="msNoPermission")
                {
                  this.alert.ShowAlert("msNoPermission", 'error');
                  return;
                }
                else
                {
                  this.alert.DeleteSuccess();
                  this.GetDealersList();
                }
              
            }
            else {
              this.alert.ShowAlert("CantDeleteTheresATransaction", 'error');
            }
          });
        }
        else {
          this.dealersService.DeleteSupplier(id).subscribe((results) => {
            if (results) {
              if(results.isSuccess == false && results.message =="msNoPermission")
                {
                  this.alert.ShowAlert("msNoPermission", 'error');
                  return;
                }
                else
                {
                  this.alert.DeleteSuccess();
                  this.GetDealersList();
                }
              
            }
            else {
              this.alert.ShowAlert("CantDeleteTheresATransaction", 'error');
            }
          });
        }       
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  AttachmentDealer(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      //height: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 2 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }

  OpenAccountStatementForm(acc: number) {
    debugger
    this.routePartsService.GuidToEdit = acc;

    if(this.type ==1 )
    {
      const url = `/ReceivableReports/GetCustomersAccountStatementForm?acc=${acc}`;
      window.open(url, '_blank');
    }
    else{
      const url = `/PayablesReport/GetSupplierAccountStatementForm?acc=${acc}`;
      window.open(url, '_blank');
    }

    // Construct the URL you want to navigate to

    // Open the URL in a new tab
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

  refresDealersListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'الرقم': x.id,
      'الاسم': x.dealerName,
      'الفئه': x.categoryName,
      'التصنيف': x.className,
      'الحساب': x.accountName,
      'رقم الهاتف': x.tel1,
      'الموقع الالكتروني': x.website,
      'نشط': x.isActive,
    }));
  }

  refreshDealersListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'number': x.id,
      'Name': x.dealerName,
      'Category': x.categoryName,
      'Classification': x.className,
      'ACCOUNT': x.accountName,
      'Phone Number': x.tel1,
      'Website': x.website,
      'Active': x.isActive,
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
         head = [['نشط',' الموقع الالكتروني',' رقم الهاتف','الحساب',' التصنيف','الفئه','الاسم','الرقم']]    }
    else{
         head = [['Active','Website','Phone Number','ACCOUNT','Classification',' Category','Name','number']]
      }

    const rows :(number|string)[][]=[];

    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.id
     temp[1]= part.dealerName 
     temp[2]= part.categoryName
     temp[3]= part.className
     temp[4]= part.accountName 
     temp[5]= part.tel1
     temp[6]= part.website
     temp[7]= part.isActive

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

   if (this.type == 1) {
    
    if(currentLang == "ar"){
      Title = "قائمة العملاء";
   }
    else{
      Title = "Customers List";
    }
  }
  else {
   if(currentLang == "ar"){
     Title = "قائمة الموردين";
  }
   else{
     Title = "Suppliers list";
   }
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
