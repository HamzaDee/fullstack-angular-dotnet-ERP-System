import { Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ShippingService } from '../shipping.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ShippingAdvancedSearchComponent } from '../shipping-advanced-search/shipping-advanced-search.component';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-shipping-list',
  templateUrl: './shipping-list.component.html',
  styleUrl: './shipping-list.component.scss'
})
export class ShippingListComponent {
  @ViewChild(ShippingAdvancedSearchComponent)childSearch:ShippingAdvancedSearchComponent;
  showLoader: boolean;
  public TitlePage: string;
  screenId:number;
  custom:boolean;
  tabelData: any[];
  data: any[];
  Lang:string;
  exportData: any[];

    constructor(
      private title: Title,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private dialog: MatDialog,
      private alert: sweetalert,
      private router: Router,
      private shippingService: ShippingService,
      private routePartsService: RoutePartsService,
      private readonly serv: AppCommonserviceService,

      ) {}
  
    ngOnInit(): void {
      this.SetTitlePage();
      this.GetShippingList();
    }

    SetTitlePage() {
      this.TitlePage = this.translateService.instant('ShippingList');
      this.title.setTitle(this.TitlePage);
    }

    GetShippingList() {
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      
      this.showLoader = true;
      setTimeout(() => {
        debugger
        this.shippingService.GetShippingList().subscribe(result => {
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
            this.refresShippingArabic(this.tabelData);
           }
           else{
            this.refreshShippingEnglish(this.tabelData);
           }  
  
          this.showLoader = false;
          debugger
         if (this.childSearch && this.tabelData.length > 0) {
            this.childSearch.VsalesOrderList = result[0].advancedSearch.salesRequestsList;
            this.childSearch.VagentsList = result[0].advancedSearch.agentsList;
            this.childSearch.VcountriesList = result[0].advancedSearch.countiesList;
            this.childSearch.VAllItemsList = result[0].advancedSearch.allItemsList;
            this.childSearch.vfromdate = result[0].advancedSearch.fromdate;   
            this.childSearch.vtodate = result[0].advancedSearch.todate;                  
            this.childSearch.year = result[0].advancedSearch.year;                  
            this.childSearch.ngOnInit();
          }  
          
        })
      });
  
    }
  
    handleSearchResult(result: any) {
      debugger
      this.tabelData = result;
    }

    ShowDetailsOnly(id: any) {
      this.routePartsService.GuidToEdit = id
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      this.router.navigate(['Shipping/ShippingForm']);
    }

    EditShipping(id: any) {
      debugger
      this.routePartsService.GuidToEdit = id
      this.routePartsService.Guid2ToEdit = 'Edit';
      this.routePartsService.Guid3ToEdit = false;
      this.router.navigate(['Shipping/ShippingForm']);
    }

    AddNewShipping(id: any) {
      this.routePartsService.GuidToEdit = id
      this.routePartsService.Guid2ToEdit = 'Add';
      this.routePartsService.Guid3ToEdit = false;
      this.router.navigate(['Shipping/ShippingForm']);
    }

    DeleteShipping(id: any) {
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
            this.shippingService.DeleteShipping(id).subscribe((results) => {
              if (results.isSuccess == true) {
                this.alert.DeleteSuccess();
                this.GetShippingList();
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

     AttachmentShipp(id: any) {
         this.routePartsService.GuidToEdit = id;
         debugger      
         let title = this.translateService.instant('VoucherAttachments');
         let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
           width: '720px',
           disableClose: false,
           direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
           data: { voucherId : id, typeId : 35}
         });
         dialogRef.afterClosed()
           .subscribe(res => {
             if (res !== null) {
               debugger
               return;
             }
           })
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

    refresShippingArabic(data) {
      debugger
      this.data = data;
      this.exportData = this.data.map(x => {
      const transDate = new Date(x.transDate).toLocaleDateString('ar-EG');
      return {
        'رقم الشحن': x.shipNo,
        'رقم طلب البيع': x.salesOrderId,
        ' تاريخ الطلب': transDate,
        'الوكيل': x.agentName,
        'الدولة': x.countryName,
        'تاريخ الشحن': x.shipDate,
      }
      });
    }

    refreshShippingEnglish(data) {
      debugger
      this.data = data;
      this.exportData = this.data.map(x => {
      const transDate = new Date(x.transDate).toLocaleDateString('ar-EG');
      return {
        'Shipping Number': x.shipNo,
        'Sales Order No': x.salesOrderId,
        'Ordar Date': transDate,
        'Agent': x.agentName,
        'Country': x.countryName,
        'Shipping Date': x.shipDate,
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
         head = [['تاريخ الشحن','الدولة',' الوكيل',' تاريخ الطلب ',' رقم طلب البيع',' رقم الشحن']]
      }
      else{
          head = [['Shipping Date','Country','Agent','Ordar Date','Sales Order No','Shipping Number']]
      }
      const rows :(number|string)[][]=[];
      this.data.forEach(function(part, index) {

      const date1 = new Date(part.transDate);
      const transDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number|string)[] =[];
       temp[0]= part.shipNo
       temp[1]= part.salesOrderId 
       temp[2]= transDate
       temp[3]= part.agentName
       temp[4]= part.countryName 
       temp[5]= part.shipDate 
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

     const Title = currentLang == "ar" ?"قائمة الشحن":"Shipping List";
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
