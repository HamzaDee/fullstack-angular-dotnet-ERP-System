import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as FileSaver from 'file-saver';
import { MatDialog} from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import Swal from 'sweetalert2';
import { AccountsGroupsService } from '../accounts-groups.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-accounts-groups-list',
  templateUrl: './accounts-groups-list.component.html',
  styleUrl: './accounts-groups-list.component.scss'
})
export class AccountsGroupsListComponent {
  Data: any;
  showLoader: boolean;
  exportData: any[];
  custom: boolean;
  exportColumns: any[];
  tabelData: any[];
  data: any[];
  cols: any[];
  HasPerm: boolean;
  public TitlePage: string;
  Lang: string;
  screenId:number = 254;


 constructor(
  private title: Title,
  private translateService: TranslateService,
  private routePartsService: RoutePartsService,
  private router: Router,
  private jwtAuth: JwtAuthService,
  private dialog: MatDialog,
  private alert: sweetalert,
  private accountsGroupsService: AccountsGroupsService,
  private readonly serv: AppCommonserviceService,
  ) { }
 
  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAccountsGroupsList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AccountsGroupsList');
    this.title.setTitle(this.TitlePage);
  }

  GetAccountsGroupsList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';          
    this.showLoader = true;
    setTimeout(() => {
      this.accountsGroupsService.getAccountsGroupList().subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }

        this.showLoader = false;
        this.Data = result;

        if(currentLang == "ar"){
          this.refresAccountsGroupsArabic(this.Data);
        }
        else{
          this.refreshAccountsGroupsEnglish(this.Data);
        }   
      }); 
    });

  }

  ShowDetailsOnly(id){
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['AccountsGroup/AccountsGroupsForm']);
  }

  AddNewAccountsGroups(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['AccountsGroup/AccountsGroupsForm']);
  }

  EditAccountsGroups(id: any){
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['AccountsGroup/AccountsGroupsForm']);
  }

  DeleteAccountsGroups(id: any) {
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
        this.accountsGroupsService.deleteAccountsGroup(id).subscribe((results) => {
          debugger
        if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetAccountsGroupsList();
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }}
          else {
          
            this.alert.DeleteFaild();
            } 
        }); 
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  OpenAccountsGroupsReport(groupNo: number) {
      debugger
    this.routePartsService.GuidToEdit = groupNo;
    // Construct the URL you want to navigate to
    const url = `/AccountingReports/GetAccountsGroupsReportForm?groupNo=${groupNo}`;
    // Open the URL in a new tab
    window.open(url, '_blank');
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

  refresAccountsGroupsArabic(data) {
      debugger
      this.data = data;
      this.exportData = this.data.map(x => ({
        ' زمر الحسابات': x.groupNo,
        'اسم الزمره بالعربي': x.groupNameA,
        'اسم الزمره بالانجليزي': x.groupNameE,
      }));
  }

  refreshAccountsGroupsEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Groups Number': x.groupNo,
      'Groups Name Arabic': x.groupNameA,
      'Groups Name English': x.groupNameE,
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
       head = [['اسم الزمره بالانجليزي','اسم الزمره بالعربي',' زمر الحسابات']]    }
      else{
         head = [[ 'Groups Name English','Groups Name Arabic','Groups Number']]
      }

    const rows :(number|string)[][]=[];

    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
    temp[0]= part.groupNo
    temp[1]= part.groupNameA 
    temp[2]= part.groupNameE
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
  if(currentLang == "ar"){
    Title = " زمر الحسابات";
  }
  else{
    Title = "Accounts Groups List";
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
