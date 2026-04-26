import { Component, OnInit,ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { OpportunitiesService } from '../opportunities.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AmiriRegular } from 'assets/fonts/amiri';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { OpportunitiesSearchComponent } from 'app/views/general/app-searchs/opportunities-search/opportunities-search.component';
import { FollowUpFormComponent } from '../../app-FollowUp/follow-up-form/follow-up-form.component';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';

@Component({
  selector: 'app-opportunities',
  templateUrl: './opportunities.component.html',
  styleUrl: './opportunities.component.scss'
})
export class OpportunitiesComponent  implements OnInit{
  @ViewChild(OpportunitiesSearchComponent) childSearch: OpportunitiesSearchComponent;
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
  screenId: number = 291;

  constructor(
    private readonly title: Title,
    private readonly translateService: TranslateService,
    private readonly routePartsService: RoutePartsService,
    private readonly router: Router,
    private readonly jwtAuth: JwtAuthService,
    private readonly dialog: MatDialog,
    private readonly alert: sweetalert,
    private readonly CrmService: OpportunitiesService,
    private readonly appEntryvouchersService: AppEntryvouchersService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetOpportunitiesList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Opportunities');
    this.title.setTitle(this.TitlePage);
  }

  GetOpportunitiesList() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
       this.CrmService.getOpportunitiesList().subscribe(result => {
        if (!result.isSuccess && result.message === "msNoPermission") {
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
            this.childSearch.vBranchList = result[0].opportunitiesSearchModel.branchList;
            this.childSearch.vStageList = result[0].opportunitiesSearchModel.stageList;
            this.childSearch.vSalesEmployeeList = result[0].opportunitiesSearchModel.salesEmployeeList;
            this.childSearch.vLeadList = result[0].opportunitiesSearchModel.leadList;
            this.childSearch.vDealersList= result[0].opportunitiesSearchModel.dealersList;
            this.childSearch.vfromDate = currentDate;
            this.childSearch.vtoDate = currentDate;
            this.childSearch.ngOnInit();
          } 
        }
        if (currentLang == "ar") {
          this.refresOpportunitiesArabic(this.Data);
        }
        else {
          this.refreshOpportunitiesEnglish(this.Data);
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
      this.refresOpportunitiesArabic(this.Data);
    } else {
      this.refreshOpportunitiesEnglish(this.Data);
    }
  }

  ShowDetailsOnly(id) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['Opportunities/OpportunitiesForm']);
  }

  AddNewOpportunities(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Opportunities/OpportunitiesForm']);
  }

  EditOpportunities(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Opportunities/OpportunitiesForm']);
  }

  DeleteOpportunities(id: any) {
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
        this.CrmService.CancelOpportunities(id).subscribe((results) => {
          debugger
          if (results == true) {
            this.alert.DeleteSuccess();
            this.GetOpportunitiesList();
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

  ConvertToSalesOrder(id: number) {
    debugger
    this.routePartsService.GuidToEdit = id;
    const url = `/SalesRequest/SalesRequestForm?id=${id}`;
    window.open(url, '_blank');
  }

  updateFavourite(ScreenId: number) {
    this.CrmService.UpdateFavourite(ScreenId).subscribe(result => {
      if (result.isSuccess) {
        this.getFavouriteStatus(this.screenId);
      } else {
        this.alert.ShowAlert(result.message, 'error');
      }
    });
  }

  getFavouriteStatus(screenId) {
    debugger
    this.CrmService.GetFavouriteStatus(screenId).subscribe(result => {
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

  refresOpportunitiesArabic(data) {
    debugger
    this.exportData = data.map(x => {
      const expectedCloseDate = new Date(x.expectedCloseDate).toLocaleDateString('ar-EG');
      return {
        'رقم الفرصه': x.opportunityNo,
        'االعميل  / العميل المحتمل': x.customerName,
        'الوصف': x.title,
        'المرحلة': x.stageName,
        'الاحتمالية': x.probability,
        'تاريخ الاغلاق المتوقع': expectedCloseDate,
        'القيمة المتوقعة': x.expectedAmount,
        'الفرع': x.branchName,
        'مندوب المبيعات': x.salesUserName,
      }
    });
  }

  refreshOpportunitiesEnglish(data) {
    debugger
    this.exportData = data.map(x => {
      const expectedCloseDate = new Date(x.expectedCloseDate).toLocaleDateString('en-EG');
      return {
        'Opportunity Number': x.opportunityNo,
        'Client/Potential client': x.customerName,
        'Description': x.title,
        'Stage': x.stageName,
        'Probability': x.probability,
        'Expected Close Date': expectedCloseDate,
        'Expected Value': x.expectedAmount,
        'Branch': x.branchName,
        'Sales Employee': x.salesUserName,
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
      head = [['مندوب المبيعات', 'الفرع', 'القيمة المتوقعة', ' تاريخ الاغلاق المتوقع', 'الاحتمالية', 'المرحلة', 'الوصف', 'االعميل  / العميل المحتمل',  'رقم الفرصه']]
    }
    else {
      head = [['Sales Employee','Branch','Expected Value','Expected Close Date','Probability', 'Stage','Description', 'Client/Potential client','Opportunity Number']]
    }
    var rows: (number | string)[][] = [];



    this.Data.forEach(function (part, index) {

      const date1 = new Date(part.expectedCloseDate);
      const expectedCloseDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.opportunityNo
      temp[1] = part.customerName
      temp[2] = part.title
      temp[3] = part.stageName
      temp[4] = part.probability
      temp[5] = expectedCloseDate
      temp[6] = part.expectedAmount
      temp[7] = part.branchName
      temp[8] = part.salesUserName
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

    const Title = currentLang == "ar" ? "قائمة فرص البيع" : "Opportunities List";
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

  PrintOpportunities(Lead: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptOpportunitiesAR?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptOpportunitiesEN?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  ConvertToPriceOffer(oppertunityId: number) {
      debugger
      this.routePartsService.GuidToEdit = oppertunityId;
      
      // Construct the URL you want to navigate to
      const url = `/Quotations/PriceoffersForm?oppertunityId=${oppertunityId}`;
    
      // Open the URL in a new tab
      window.open(url, '_blank');
  }
    
  OpenFollowUpForm(opportunityNo: number, crruntrow: any, isNew?, isView?) {
      let title = isNew ? this.translateService.instant('AddFollowUpForm') : this.translateService.instant('modifiyFollowUpForm');
      let dialogRef: MatDialogRef<any> = this.dialog.open(FollowUpFormComponent, {
        width: '1000px',
        disableClose: true,
        direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
        data: { title: title, Id: 0,opportunityNo: opportunityNo, row: crruntrow, isNew, isView, companyid: this.jwtAuth.getCompanyId() }
      });
      dialogRef.afterClosed()
        .subscribe(res => {
          if (!res) {
            // If user press cancel
            return;
          }
        })
  }

  CalculateTotal()
    {
      debugger
      if(this.Data){
        return this.formatCurrency(this.Data.reduce((sum, item) => {
          return sum + item.expectedAmount;
        }, 0), 3);
      }
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appEntryvouchersService.formatCurrency(value, decimalPlaces);
  }
}
