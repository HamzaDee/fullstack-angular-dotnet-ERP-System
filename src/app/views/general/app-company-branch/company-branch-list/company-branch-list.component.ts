import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { sweetalert } from 'sweetalert';
import * as FileSaver from 'file-saver';
import { CompanyBranchService } from '../company-branch.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-company-branch-list',
  templateUrl: './company-branch-list.component.html',
  styleUrls: ['./company-branch-list.component.scss']
})
export class CompanyBranchListComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  data: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId:number = 5 ;
  custom:boolean;
  exportData: any[];

  constructor(
    private title: Title,
    private translateService: TranslateService,
    private alert: sweetalert,
    private router: Router,
    private companyBranchService: CompanyBranchService,
    private routePartsService: RoutePartsService,
    public jwtAuth: JwtAuthService,
    private readonly serv: AppCommonserviceService,
  ) {}


  ngOnInit(): void {
    this.SetTitlePage();
    this.GetCompanyBranchList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CompanyBranchList');
    this.title.setTitle(this.TitlePage);
  }

  GetCompanyBranchList() {
   var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      
    this.showLoader = true;
    setTimeout(() => {
      this.companyBranchService.GetCompanyBranchList().subscribe(result => {
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }

        this.data = result;

       if(currentLang == "ar"){
        this.refreshCompanyBranchTableArbic(this.data);
       }
       else{
        this.refreshCompanyBranchTableEnglish(this.data);
       }

        this.showLoader = false;
      })
    });
  }
  //shoud add permission
  DeleteCompanyBranch(id: any) {
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
        this.companyBranchService.DeleteCompanyBranch(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetCompanyBranchList();
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }}
          else {
            this.alert.ShowAlert("msgRecordHasLinks",'error')
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  //shoud add permission
  NavigateAddCompanyBranchForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.router.navigate(['CompanyBranch/CompanyBranchList/CompanyBranchForm']);
  }

//edit
  NavigateEditCompanyBranchForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';

    this.router.navigate(['CompanyBranch/CompanyBranchList/CompanyBranchForm']);
  }

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar'; 
    let head: string[][];  
    if(currentLang == "ar"){
       head = [['رقم الهاتف ',' الاسسم انجليزي',' الاسم عربي','الرقم']]
     }
     else{
       head = [[' Mobile ',' Branch English Name ','Branch Arbic Name','Number']]
     }

   
    const rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.number
     temp[1]= part.branchNameA 
     temp[2]= part.branchNameE
     temp[3]= part.tel1

  
     if (isArabic) {
       temp.reverse();
     }
     rows.push(temp)
   },this.data)
  
     const pdf = new jsPDF('l', 'pt', 'a4');
   
     // 5️⃣ Register the font
     pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
     pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
     pdf.setFont('Amiri');
     pdf.setFontSize(14);

   let Title;
   if(currentLang == "ar"){
     Title = "قائمة فروع الشركة";
  }
   else{
     Title = " Company Branch List ";
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

  refreshCompanyBranchTableArbic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      ' الرقم': x.number,
      ' الاسم _ عربي': x.branchNameA,
      ' الاسم _ انجليزي': x.branchNameE,
      ' رقم الهاتف': x.tel1,
    }));
  } 

  refreshCompanyBranchTableEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      ' Number': x.number,
      ' Branch Name Arabic': x.branchNameA,
      '  Branch Name English': x.branchNameE,
      '  Mobile': x.tel1,
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
