import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppSearchFormComponent } from 'app/views/general/app-searchs/app-search-form/app-search-form.component';
import { CustomerOpeningBalanceService } from '../app-customeropeningbalance.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-customersopeningbalance-list',
  templateUrl: './customersopeningbalance-list.component.html',
  styleUrls: ['./customersopeningbalance-list.component.scss']
})
export class CustomersopeningbalanceListComponent implements OnInit {
  @ViewChild(AppSearchFormComponent) childSearch: AppSearchFormComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 81;
  custom: boolean;
  hid: boolean = true;
 data: any[];
 Lang: string;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private alert: sweetalert,
      private dialog: MatDialog,
      private cusService: CustomerOpeningBalanceService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private readonly serv: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    debugger
    this.SetTitlePage();
    this.GetSuppOpeningBalanceList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CustOpeningBalanceList');
    this.title.setTitle(this.TitlePage);
  }

  GetSuppOpeningBalanceList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.showLoader = true;
    setTimeout(() => {
      this.cusService.GetCustomersOpeningBalanceList().subscribe(result => {
        if(result.isSuccess == false && result.message =="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
        this.tabelData = result;

        if(currentLang == "ar"){
          this.refreshCustomersopeningbalanceArabic(this.tabelData);
         }
         else{
          this.refreshCustomersopeningbalanceEnglish(this.tabelData);
         } 

        this.showLoader = false;
        debugger
        if (this.childSearch) {
          const currentDate = new Date();
          this.childSearch.vTypeList = result[0].searchCriteriaModel.voucherTypeList2;
          this.childSearch.vStatusList = result[0].searchCriteriaModel.statusList;
          this.childSearch.vBranchList = result[0].searchCriteriaModel.userCompanyBranchList;
          this.childSearch.vcurrencyList = result[0].searchCriteriaModel.currencyModels;
          this.childSearch.vemployeeList = result[0].searchCriteriaModel.employeeModelList;
          this.childSearch.vfromVoucherNo = "";
          this.childSearch.vtoVoucherNo = "";
          this.childSearch.vfromDate = currentDate;
          this.childSearch.vtoDate = currentDate;
          this.childSearch.vnote = "";
          this.childSearch.ngOnInit();
        } else {
          console.error('childSearch is not defined!');
        }
      })
      debugger
      if (this.childSearch) {
        this.childSearch.searchResultEvent.subscribe(result => {
          this.tabelData = result;
        });
      } else {
        console.error('childSearch is not defined!');
      }
    });
  }

  handleSearchResult(result: any) {
    debugger
    this.tabelData = result;
  }

  PostOpeningBalance(id: any, isPosted: boolean) {
    debugger
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('msgConfirmPost'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.cusService.PostCustomersOpeningBalance(id, isPosted).subscribe((result) => {
          if (result) {
            if(result.isSuccess == false && result.message =="msNoPermission")
              {
                this.alert.ShowAlert("msNoPermission", 'error');
                return;
              }
              else
              {
                this.alert.ShowAlert('PostSuccess', 'success');
                this.GetSuppOpeningBalanceList();
              }
            
          }
          else {
            this.alert.SaveFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  DeleteOpeningBalance(id: any) {
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
        this.cusService.DeleteCustomersOpeningBalance(id).subscribe((results) => {
          if (results) {
            if(results.isSuccess == false && results.message =="msNoPermission")
              {
                this.alert.ShowAlert("msNoPermission", 'error');
                return;
              }
              else
              {
                this.alert.DeleteSuccess();
                this.GetSuppOpeningBalanceList();
              }
            
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

  OpenOpeningBalanceForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.router.navigate(['CustomersOpeningBalance/CustopeningbalanceForm']);
  }

  AddCustomerOpeningBalanceForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.router.navigate(['CustomersOpeningBalance/CustopeningbalanceForm']);
  }

  CopyOpeningBalance(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.router.navigate(['CustomersOpeningBalance/CustopeningbalanceForm']);
  }

  ReverseOpeningBalance(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Reverse';
    this.router.navigate(['CustomersOpeningBalance/CustopeningbalanceForm']);
  }

  OpenDetailsForm(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.router.navigate(['CustomersOpeningBalance/CustopeningbalanceForm']);

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

  refreshCustomersopeningbalanceArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
      'نوع السند': x.voucherName,
      'رقم السند': x.voucherNo,
      'تاريخ السند': formattedDate,
      'الفرع': x.branchName,
      'العمله': x.currncyName,
      'سعر الصرف': x.currRate,
      'الحالة': x.statusName,
    }
    });
  }

  refreshCustomersopeningbalanceEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
    return {
      'Voucher Type': x.voucherName,
      'Voucher Number': x.voucherNo,
      'Voucher Date': formattedDate,
      'Branch': x.branchName,
      'Currency': x.currncyName,
      'Exchange Rate': x.currRate,
      'Status': x.statusName,
    }
    });
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
       head = [['الحالة',' سعر الصرف','العمله',' الفرع',' تاريخ السند',' رقم السند',' نوع السند']]    }
     else{
       head = [['Status','Exchange Rate','Currency','Branch',' Voucher Date','Voucher Number','Voucher Type']]
    }
    const rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {

    const date = new Date(part.voucherDate);
    const formattedDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;


    let temp: (number|string)[] =[];
     temp[0]= part.voucherName
     temp[1]= part.voucherNo 
     temp[2]= formattedDate
     temp[3]= part.branchName
     temp[4]= part.currncyName 
     temp[5]= part.currRate
     temp[6]= part.statusName
  
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

   const Title = currentLang == "ar" ? "قائمة الأرصدة الأفتتاحية للعملاء " : " Customers Opening Balance List" ;
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

  PrintOpeningBalance(voucherId, voucherDate, voucherTypeId, voucherNo) {
  debugger
  this.Lang = this.jwtAuth.getLang();
  voucherDate = formatDate( voucherDate, "dd-MM-yyyy" , "en-US" );

  if(this.Lang == "ar")
  { 
  const reportUrl = `RptCustomerOpeningBalanceAR?VoucherTypeId=${voucherTypeId}&voucherNo=${voucherNo}&VoucherDate=${voucherDate}`;
  const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
  window.open(url, '_blank');
  }
  else{ 
  const reportUrl = `RptCustomerOpeningBalanceEN?VoucherTypeId=${voucherTypeId}&voucherNo=${voucherNo}&VoucherDate=${voucherDate}`;
  const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
  window.open(url, '_blank');
  }
  }
}
