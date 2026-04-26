import { Component,OnInit ,ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AmiriRegular } from 'assets/fonts/amiri';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { sweetalert } from 'sweetalert';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { MaintenanceRequestsService } from '../maintenance-requests.service';
import { AppMaintenanceRequestsSearchComponent } from 'app/views/general/app-searchs/app-maintenance-requests-search/app-maintenance-requests-search.component';

@Component({
  selector: 'app-maintenance-requests-list',
  templateUrl: './maintenance-requests-list.component.html',
  styleUrl: './maintenance-requests-list.component.scss'
})
export class MaintenanceRequestsListComponent implements OnInit { 
  @ViewChild(AppMaintenanceRequestsSearchComponent) childSearch: AppMaintenanceRequestsSearchComponent;
  Data: any;
  showLoader: boolean;
  exportData: any[];
  custom: boolean;
  exportColumns: any[];
  tabelData: any[];
  data: any[] = [];
  cols: any[];
  HasPerm: boolean;
  public TitlePage: string;
  Lang: string;
  screenId: number = 296;

  constructor(
    private readonly title: Title,
    private readonly translateService: TranslateService,
    private readonly routePartsService: RoutePartsService,
    private readonly router: Router,
    private readonly jwtAuth: JwtAuthService,
    private readonly dialog: MatDialog,
    private readonly alert: sweetalert,
    private readonly MaintenanceService: MaintenanceRequestsService
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GeMaintenanceRequestsList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('MaintenanceRequestsList');
    this.title.setTitle(this.TitlePage);
  }

  GeMaintenanceRequestsList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
        this.MaintenanceService.GetMaintenanceRequestsList().subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        debugger
        this.showLoader = false;
        this.Data = result;
        this.data = result;
        debugger
         if (result.length > 0) {
           if (this.childSearch) {
            const currentDate = new Date();
             this.childSearch.vBranchList = result[0].maintenanceRequestsSearchModel.branchList;
            this.childSearch.vAreaList = result[0].maintenanceRequestsSearchModel.areaList;
            this.childSearch.vTechnicianList = result[0].maintenanceRequestsSearchModel.technicianList;
            this.childSearch.vSuppliersList = result[0].maintenanceRequestsSearchModel.suppliersList;
            this.childSearch.vDamageLis= result[0].maintenanceRequestsSearchModel.damageList;
            this.childSearch.vPriorityList= result[0].maintenanceRequestsSearchModel.priorityList;
            this.childSearch.vStatusList= result[0].maintenanceRequestsSearchModel.statusList;
            this.childSearch.vfromDate = currentDate;
            this.childSearch.vtoDate = currentDate;
            this.childSearch.ngOnInit(); 
          } 
        } 
        if (currentLang == "ar") {
          this.refresMaintenanceRequestsArabic(this.Data);
        }
        else {
          this.refreshMaintenanceRequestsEnglish(this.Data);
        }
      }); 
    });
  }

  handleSearchResult(result: any[] | null) {
    debugger;
    this.Data = result;
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang === 'ar') {
      this.refresMaintenanceRequestsArabic(this.Data);
    } else {
      this.refreshMaintenanceRequestsEnglish(this.Data);
    }
  }

  ShowDetailsOnly(id) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['MaintenanceRequests/MaintenanceRequestsForm']);
  }

  AddNewMaintenanceRequest(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['MaintenanceRequests/MaintenanceRequestsForm']);
  }

  EditMaintenanceRequest(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['MaintenanceRequests/MaintenanceRequestsForm']);
  }

  DeleteMaintenanceRequest(id: any) {
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
         this.MaintenanceService.CancelMaintenanceRequest(id).subscribe((results) => {
          debugger
          if (results == true) {
            this.alert.DeleteSuccess();
            this.GeMaintenanceRequestsList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {

            this.alert.DeleteFaild();
          }
        }); 
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OpenWorkOrder(id: number) {
    debugger
    this.routePartsService.GuidToEdit = id;
    //const url = `/SalesRequest/SalesRequestForm?id=${id}`;
    //window.open(url, '_blank');
  }

  updateFavourite(ScreenId: number) {
    this.MaintenanceService.UpdateFavourite(ScreenId).subscribe(result => {
      if (result.isSuccess) {
        this.getFavouriteStatus(this.screenId);
      } else {
        this.alert.ShowAlert(result.message, 'error');
      }
    });
  }

  getFavouriteStatus(screenId) {
    debugger
    this.MaintenanceService.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if (result.isSuccess) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }

  refresMaintenanceRequestsArabic(data) {
    debugger
    this.exportData = data.map(x => {
      const requestDate = new Date(x.requestDate).toLocaleDateString('ar-EG');
      return {
        'نوع الطلب': x.requestName,
        'رقم الطلب': x.requestNo,
        'تاريخ الطلب': requestDate,
        'العميل': x.customerName,
        'الفرع': x.branchName,
        'المنطقة': x.areaName,
        'الفني': x.technicianName,
        'درجة الاهمية': x.priorityName,
        'الحالة': x.statusName,
      }
    });
  }

  refreshMaintenanceRequestsEnglish(data) {
    debugger
    this.exportData = data.map(x => {
      const requestDate = new Date(x.requestDate).toLocaleDateString('en-EG');
      return {
        'Order Type': x.requestName,
        'Order Number': x.requestNo,
        'Order Date': requestDate,
        'Client': x.customerName,
        'Branch': x.branchName,
        'Area': x.areaName,
        'Technician': x.technicianName,
        'Priority Level': x.priorityName,
        'status': x.statusName,
      }
    });
  }

  exportExcel(dt: any) {
    debugger
    import("xlsx").then(xlsx => {
      debugger
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
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

  exportPdf(dt: any) {
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
      head = [[ 'الحالة','درجة الاهمية','الفني','المنطقة','الفرع','العميل', 'تاريخ الطلب', 'رقم الطلب','نوع الطلب']]
    }
    else {
      head = [['status','Priority Level','Technician','Area','Branch','Client','Order Date','Order Number','Order Type']]
    }
    var rows: (number | string)[][] = [];

    this.Data.forEach(function (part, index) {

      const date1 = new Date(part.requestDate);
      const requestDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.requestName
      temp[1] = part.requestNo
      temp[2] = requestDate
      temp[3] = part.customerName
      temp[4] = part.branchName
      temp[5] = part.areaName
      temp[6] = part.technicianName
      temp[7] = part.priorityName
      temp[8] = part.statusName
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.data)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "قائمة طلبات الصيانة" : "Maintenance Requests List";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 20 },
      bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
      theme: "grid",
    });
    pdf.output('dataurlnewwindow')
  }

  PrintMaintenanceRequest(Lead: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptMaintenanceRequestAR?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptMaintenanceRequestEN?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  SendtoMaintenanceOrder(Id: number) {
    debugger
    this.routePartsService.GuidToEdit = Id;
    
    // Construct the URL you want to navigate to
    const url = `/MaintenanceOrder/Maintorderform?MaintId=${Id}`;
  
    // Open the URL in a new tab
    window.open(url, '_blank');
  }
}
