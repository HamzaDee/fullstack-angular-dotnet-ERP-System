import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import * as FileSaver from 'file-saver';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppCostCenterFormComponent } from './cost-center-form/cost-center-form.component';
import { CostCenterService } from '../cost-center.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-cost-center-list',
  templateUrl: './cost-center-list.component.html',
  styleUrls: ['./cost-center-list.component.scss']
})
export class AppCostCenterListComponent implements OnInit {
  public TitlePage: string;
  data: any[];
  cols: any[];
  mainTableList: any;
  selectedMainTable: any;
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId: number = 21;
  custom: boolean;
  exportData: any[];

  constructor(private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private costCenterService: CostCenterService,
    private routePartsService: RoutePartsService,
    private router: Router) { }
    

  ngOnInit(): void {
    this.SetTitlePage();
    this.CostCenterList();
    this.GetDropDownMainTableList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CostCenterList');
    this.title.setTitle(this.TitlePage);
  }

  GetDropDownMainTableList() {
    this.costCenterService.GetMianTableDropDownList().subscribe(result => {
      this.mainTableList = result;
    })
  }

  GetCostCenterListByTableNo(tableNo) {
    if (tableNo > 0) {
      this.showLoader = true;
      setTimeout(() => {
        this.costCenterService.GetCostCenterListByTableNo(tableNo).subscribe(result => {
       
          this.data = result;
          this.showLoader = false;
        })
      });
    }
    else {
      this.CostCenterList();
    }
  }

  CostCenterList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      this.costCenterService.CostCenterList().subscribe(result => {

        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }

        this.data = result;

        if(currentLang == "ar"){
          this.refresAppCostCenterListArabic(this.data);
         }
         else{
          this.refreshAppCostCenterListEnglish(this.data);
         }

        this.selectedMainTable = 0;
        this.showLoader = false;
      })
    });
  }

  DeleteCostCenter(id: any) {
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
        this.costCenterService.DeleteCostCenter(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.CostCenterList();
          }
          else if (results.isSuccess == false && results.message === "msgRecordHasLinks") {
            {
              this.alert.ShowAlert("msgRecordHasLinks", 'error');
              return;
            }
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

  OpenCostCenterFormPopUp(id: number, isNew?) {
    let title = isNew ? this.translateService.instant('AddCostCenter') : this.translateService.instant('ModifyCostCenterList');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppCostCenterFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, isNew, companyid: this.jwtAuth.getCompanyId(),
        CostCenterListFromParent: () => { this.CostCenterList() }
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

  OpenSubCostCenter(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.router.navigate(['CostCenter/Costcenterbranchform']);
  }

  updateFavourite(ScreenId: number) {
    debugger
    this.costCenterService.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }

  getFavouriteStatus(screenId) {
    debugger
    this.costCenterService.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if (result) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }

  refresAppCostCenterListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'الرقم': x.number,
      'الاسم': x.name,
      'ملاحظات': x.note,
      'نشط': x.statusName,
    }));
  }

  refreshAppCostCenterListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Number': x.number,
      'Name': x.name,
      'Note': x.note,
      'Active': x.statusName,
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
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';   
    if(currentLang == "ar"){
      var head = [[' نشط',' ملاحظات ','الاسم','الرقم']]    }
      else{
        var head = [['Active','Note','Name','Number']]
      }
    var rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.number
     temp[1]= part.name 
     temp[2]= part.note
     temp[3]= part.statusName

     if (isArabic) {
       temp.reverse();
     }
     rows.push(temp)
   },this.data)
  
   const pdf = new jsPDF('p', null,'a4',true);
   pdf.setHeaderFunction
   pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");
   
   pdf.setFont("Amiri"); // set font For Title
   pdf.setFontSize(14);  // set font Size  For Title

   let Title;
   if(currentLang == "ar"){
     Title = "قائمة مراكز الكلف  ";
  }
   else{
     Title = "Cost Center List";
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
