import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { sweetalert } from 'sweetalert';
import * as FileSaver from 'file-saver';
import { CompanyService } from '../company.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { ImageViewComponent } from 'app/views/app-inventory/items/image-view/image-view.component';
import { environment } from "environments/environment";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit {
  public TitlePage: string;
  data: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId:number = 4 ;
  custom:boolean;
  exportData: any[];
  baseUrl = environment.apiURL_Main;

  constructor(
    private title: Title,
    private translateService: TranslateService,
    private alert: sweetalert,
    private router: Router,
    private companyService: CompanyService,
    private routePartsService: RoutePartsService,
    public jwtAuth: JwtAuthService,
    private dialog: MatDialog,
    private readonly serv: AppCommonserviceService,
  ) {}
  
  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAllCompanyInfoList();
    this.getFavouriteStatus(this.screenId);
  }
  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CompanyList');
    this.title.setTitle(this.TitlePage);
  }

  GetAllCompanyInfoList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.showLoader = true;
    setTimeout(() => {
      this.companyService.CompanyList().subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }
          
        this.data = result;
        if(currentLang == "ar"){
          this.refreshCompanyListTableArabic(this.data);
         }
         else{
          this.refreshCompanyListTableEnglish(this.data);
         }        this.showLoader = false;
      })
    });
  }

  AddBranch(id: number = 0){
    debugger
    this.routePartsService.GuidToEdit = id;
    this.router.navigate(['CompanyBranch/CompanyBranchList/CompanyBranchForm']);
  }

  DeleteCompany(id: any) {
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
        this.companyService.DeleteCompany(id).subscribe((results) => {
          debugger
          if (results == true) {
            this.alert.DeleteSuccess();
            this.GetAllCompanyInfoList();
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }}
          else if (results == false){
            this.alert.ShowAlert("msgRecordHasLinks",'error')
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  NavigateCompanyForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.router.navigate(['Company/CompanyList/CompanyForm']);
  }

   refreshCompanyListTableArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      ' الرقم': x.number,
      ' المجموعه': x.groupName,
      ' الاسم': x.name,
      ' نشاط الشركة': x.activityName,
    }));
  }

  refreshCompanyListTableEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Number': x.number,
      'Group': x.groupName,
      'Name': x.name,
      'Activity Name': x.activityName,
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
      var head = [['نشاط الحركة ',' الاسم','  المجموعه',' الرقم']]
    }
     else{
      var head = [[' Activity note ','Name ',' Group','Number']]
     }
    var rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.number
     temp[1]= part.groupName 
     temp[2]= part.name
     temp[3]= part.activityName

     if (isArabic) {
       temp.reverse();
     }
     rows.push(temp)
   },this.data)
   // 4️⃣ Initialize jsPDF
     const pdf = new jsPDF('l', 'pt', 'a4');
   
     // 5️⃣ Register the font
     pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
     pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
     pdf.setFont('Amiri');
     pdf.setFontSize(14);
  //  const pdf = new jsPDF('p', null,'a4',true);
  //  pdf.setHeaderFunction
  //  pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  //  pdf.setFont("Amiri"); // set font For Title
  //  pdf.setFontSize(14);  // set font Size  For Title

   let Title;
   if(currentLang == "ar"){
     Title = "كشف قائمه الشركات";
  }
   else{
     Title = "Company List";
   }

  
   //let Title = "    كشف قائمه الشركات     ";
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

  viewImage(image) {
    debugger
    let imageurl = this.baseUrl + image;

    let title = this.translateService.instant('CompanyImage');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ImageViewComponent, {
      width: '600px',
      height: '600px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title,
        imageurl: imageurl,
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
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
}
