import { Component,ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog} from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { PromotionorderadvancedserarchComponent } from '../../promotionalMaterialItems/PromotionOrderAdvancedSearch/promotionorderadvancedserarch.component';
import { PromotionPlansService } from '../promoplans.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-promoplanslist',
  templateUrl: './promoplanslist.component.html',
  styleUrl: './promoplanslist.component.scss'
})
export class PromoplanslistComponent {
  @ViewChild(PromotionorderadvancedserarchComponent)childSearch:PromotionorderadvancedserarchComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId:number = 216 ;
  custom:boolean;
  data: any[];
  Lang: string;

  constructor
  (
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private service: PromotionPlansService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void 
  {
    this.SetTitlePage();
    this.GetPromotionPlansList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('PromotionPlanslist');
    this.title.setTitle(this.TitlePage); 
  }

  GetPromotionPlansList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.service.GetPromotionPlansList().subscribe(result => {
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
        debugger
        if (this.childSearch) {
          this.childSearch.vagentsList = result[0].advancedSearch.agentsList;
          this.childSearch.vcountryList = result[0].advancedSearch.countryList;
          this.childSearch.vyear = result[0].advancedSearch.year;   
          this.childSearch.vtype = result[0].advancedSearch.type;                 
          this.childSearch.ngOnInit();
        } else {
          console.error('childSearch is not defined!');
        }  
        
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
        this.service.DeletePromotionPlans(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetPromotionPlansList();
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
    this.router.navigate(['PromotionItemsPlans/PromotionPlansform']);
  }

  AddPurRequestForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['PromotionItemsPlans/PromotionPlansform']);
  }

  OpenPurRequestForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['PromotionItemsPlans/PromotionPlansform']);
  }
  
  ApproveOrder( Id: number , Status: any) {
  this.routePartsService.GuidToEdit = Id;
  this.routePartsService.Guid2ToEdit = 'Approval';
  this.routePartsService.Guid3ToEdit = Status;
  this.router.navigate(['PromotionItemsPlans/PromotionPlansform']);
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
    const planDate = new Date(x.planDate).toLocaleDateString('ar-EG');
    return {
      'رقم الخطة': x.planNo,
      'تاريخ الخطة': planDate,
      'السوق': x.countryName,
      'الوكيل': x.agentName,
      'سنة': x.yearNo,
      'القيمة الكلية للخطة': x.expectedValue,
      'توقعات المبيعات': x.salesForecast,
      'نسبة قيمة الخطة مقارنة بالتوقعات': x.planValuePercentageVsForecast,
      'الحالة': x.statusName,
    }
    });
  }

  refreshPurchaserequestEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const planDate = new Date(x.planDate).toLocaleDateString('en-GB');
    return {
      'Plan Number': x.planNo,
      'Plan Date': planDate,
      'Market': x.countryName,
      'Agent': x.agentName,
      'Year': x.yearNo,
      'Total Plan Value': x.expectedValue,
      'Sales Forecast': x.salesForecast,
      'Plan Value Percentage To Forecast': x.planValuePercentageVsForecast,
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
       head = [['الحالة',' نسبة قيمة الخطة مقارنة بالتوقعات',' توقعات المبيعات',' القيمة الكلية  للخطة','سنة',' الوكيل',' السوق',' تاريخ الخطة',' رقم الخطة']]    }
    else{
       head = [['Status','Plan Value Percentage To Forecast','Sales Forecast','Total Plan Value','Year','Agent','Market',' Plan Date','Plan Number']]
    }
    const rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {

      const date1 = new Date(part.planDate);
      const planDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

    let temp: (number|string)[] =[];
     temp[0]= part.planNo
     temp[1]= planDate 
     temp[2]= part.countryName
     temp[3]= part.agentName
     temp[4]= part.yearNo 
     temp[5]= part.expectedValue 
     temp[6]= part.salesForecast
     temp[7]= part.planValuePercentageVsForecast
     temp[8]= part.statusName 
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

    const Title = currentLang == "ar" ?"قائمة خطط المواد الدعائية":"Promotion Plans list";
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

  PrinPromoplans(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `rptPromoplansAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptPromoplansEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
