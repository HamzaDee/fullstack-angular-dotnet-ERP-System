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
import { environment } from 'environments/environment';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { PurordersService } from '../purorders.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-purorder-list',
  templateUrl: './purorder-list.component.html',
  styleUrls: ['./purorder-list.component.scss']
})
export class PurorderListComponent implements OnInit {
  tabelData: any[];
  purOrderStatusList : any[];
  public TitlePage: string;
  data: any[];
  exportData: any[];
  fromDate: string;
  toDate: string;
  Lang: string;
  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private egretLoader: AppLoaderService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private http: HttpClient,
    private purordersService: PurordersService
  ) {
    const today = new Date();
    this.fromDate = today.toISOString().split('T')[0]; 
    this.toDate = today.toISOString().split('T')[0]; 
   }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetPurOrdersList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('PurorderList');
    this.title.setTitle(this.TitlePage);
  }

  GetPurOrdersList() {
     var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    setTimeout(() => {
      this.purordersService.GetPurOrdersList().subscribe(result => {
        if(result.isSuccess === false || result.message === "msNoPermission"){
          this.alert.ShowAlert("msNoPermission","error");
          return
        }
        this.tabelData = result.purOrderHDList;
        this.purOrderStatusList = result.purOrderStatusList;

        if(currentLang == "ar"){
          this.refresPurorderListArabic(this.tabelData);
         }
         else{
          this.refreshPurorderListEnglish(this.tabelData);
         }

      })
    });
  }

  GetSearch(){
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      
    var fromDate = this.fromDate;
    var toDate =this.toDate;
    this.purordersService.GetPurorderSearch(fromDate, toDate).subscribe((result) =>{
        debugger
        this.tabelData = result;
    });
  }

  clearFormData() {
    const today = new Date();
    this.fromDate = today.toISOString().split('T')[0]; 
    this.toDate = today.toISOString().split('T')[0]; 
    this.GetPurOrdersList();
  }

  AddNew(id: any){
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'New';
    this.router.navigate(['PurchaseOrder/PurorderForm']);
  }

  EditPurOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.router.navigate(['PurchaseOrder/PurorderForm']);
  }

  ShowPurOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.router.navigate(['PurchaseOrder/PurorderForm']);
  }

  CopyPurOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.router.navigate(['PurchaseOrder/PurorderForm']);
  }

  DeletePurOrder(id: any) {
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
        this.purordersService.DeletePurOrder(id).subscribe((results) => {
          if(results.isSuccess === false || results.message === "msNoPermission"){
            this.alert.ShowAlert("msNoPermission","error");
            return
          }
          if (results) {
            this.alert.DeleteSuccess();
            this.GetPurOrdersList();
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

  PurchaseOrderttachment(id: any) {
      this.routePartsService.GuidToEdit = id;
      debugger      
      let title = this.translateService.instant('VoucherAttachments');
      let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
        width: '720px',
        disableClose: false,
        direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
        data: { voucherId : id, typeId : 47}
      });
      dialogRef.afterClosed()
        .subscribe(res => {
          if (res !== null) {
            debugger
            return;
          }
        })
      }

  SaveStatus(orderId, statusId) {
    debugger
    setTimeout(() => {
      this.purordersService.SavePurOrderStatus(orderId, statusId).subscribe(result => {
        if(result){
          this.alert.SaveSuccess();
          this.GetPurOrdersList();
        };
      })
    });
  }

  OnSaveAll(){    
    setTimeout(() => {
      this.egretLoader.open(this.translateService.instant('PleaseWait'));
      this.SaveAll().subscribe(result => {
        if(result){
          this.alert.SaveSuccess();
        };
        this.egretLoader.close()
      })
    });
  }

  SaveAll() : Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/PurOrders/SaveAllProdItemQty/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, this.tabelData, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }

  refresPurorderListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const odate = new Date(x.odate).toLocaleDateString('ar-EG');
    const arrivalDate = new Date(x.arrivalDate).toLocaleDateString('ar-EG');
      return {
      'رقم الامر': x.order_no,
      'تاريخ الطلب':odate,
      ' المورد': x.venName,
      'تاريخ الوصول': arrivalDate,
      'حالة الطلب': x.statusName,
    }
    });
  }

  refreshPurorderListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const odate = new Date(x.odate).toLocaleDateString('ar-EG');
    const arrivalDate = new Date(x.arrivalDate).toLocaleDateString('ar-EG');
      return {
      'Order Number': x.order_no,
      'Order Date': odate,
      'Supplier': x.venName,
      'Arrival Date': arrivalDate,
      'Order Status': x.statusName,
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
       head = [[' حالة الطلب','تاريخ الوصول',' المورد',' تاريخ الطلب',' رقم الامر']]    }
    else{
       head = [['Order Status','Arrival Date','Supplier','Order Date','Order Number']]
    }
    const rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {

      const date1 = new Date(part.odate);
      const odate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      const date2 = new Date(part.arrivalDate);
      const arrivalDate = currentLang === 'ar'
        ? `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`
        : `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;

    let temp: (number|string)[] =[];
     temp[0]= part.order_no
     temp[1]= odate
     temp[2]= part.venName
     temp[3]= arrivalDate
     temp[4]= part.statusName 

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

   const Title = currentLang == "ar" ?"قائمة طلبات الشراء":"Purchase Orders List";
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


  
  PrintPurchaseOrder(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `ProductionPurOrderAr?transno=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `ProductionPurOrderEN?transno=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
