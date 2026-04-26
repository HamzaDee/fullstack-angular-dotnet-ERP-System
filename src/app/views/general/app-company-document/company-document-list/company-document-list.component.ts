import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { sweetalert } from 'sweetalert';
import * as FileSaver from 'file-saver';
import { CompanyDocumentService } from '../company-document.service';
import { environment } from 'environments/environment';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ImageViewComponent } from 'app/views/app-inventory/items/image-view/image-view.component';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-company-document-list',
  templateUrl: './company-document-list.component.html',
  styleUrls: ['./company-document-list.component.scss']
})
export class CompanyDocumentListComponent implements OnInit {
  public TitlePage: string
  data: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  baseUrl = environment.apiURL_Main;
  showLoader: boolean;
  screenId: number = 7;
  custom: boolean;
  private apiUrl = environment.apiURL_Main;
  public exportData: any[];
  public Path: string;

  constructor(
    private title: Title,
    private translateService: TranslateService,
    private alert: sweetalert,
    private router: Router,
    private companyDocumentService: CompanyDocumentService,
    private routePartsService: RoutePartsService,
    public jwtAuth: JwtAuthService,
    private dialog: MatDialog,
    private readonly serv: AppCommonserviceService,
  ) { }
  ngOnInit(): void {
    this.SetTitlePage();
    this.GetCompanyDocumentList();
    this.getFavouriteStatus(this.screenId);
  }

  DownLoadFile() {
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CompanyDocumentList');
    this.title.setTitle(this.TitlePage);
  }

  GetCompanyDocumentList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      this.companyDocumentService.GetCompanyDocumentList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.data = result;

        for (var i = 0; i < result.length; i++) {
          this.Path = environment.apiURL_Main + result[i].docImage;
        }
        if (currentLang == "ar") {
          this.refreshCompanyDocumentTableArabic(this.data);
        }
        else {
          this.refreshCompanyDocumentTableEngilsh(this.data);
        }
        this.showLoader = false;
      })
    });
  }

  DeleteCompanyDocument(id: any) {
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
        this.companyDocumentService.DeleteCompnayDocument(id).subscribe((results) => {
          debugger
          if (results == true) {
            this.alert.DeleteSuccess();
            this.GetCompanyDocumentList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
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

  //shoud add permission
  NavigateCompanyDocumentForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.router.navigate(['CompanyDocument/CompanyDocumentList/CompanyDocumentForm']);
  }

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];
    if (currentLang == "ar") {
       head = [[' تاريخ الصلاحية ', ' تاريخ الاصدار ', ' نوع الوثيقة ', ' الاسم ', ' رقم  الوثيقة', 'الرقم']]
    }
    else {
       head = [['Document Image', 'Expiry Date', 'Date Of Issue', ' Document Type ', ' Name ', 'Document Number', 'Number']]
    }

    const rows: (number | string)[][] = [];
    this.data.forEach(function (part, index) {

    const date1 = new Date(part.issueDate);
      const issueDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      const date2 = new Date(part.expiryDate);
      const expiryDate = currentLang === 'ar'
        ? `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`
        : `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.number
      temp[1] = part.docNo
      temp[2] = part.docName
      temp[3] = part.docTypeName
      temp[4] = issueDate
      temp[5] = expiryDate


      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.data)

    
    const pdf = new jsPDF('l', 'pt', 'a4');

    // 5️⃣ Register the font
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title;
    if (currentLang == "ar") {
      Title = "قائمة وثائق الشركة";
    }
    else {
      Title = " Company Document List  ";
    }


    // let Title = "   كشف قائمه فروع  الشركات ";
    let pageWidth = pdf.internal.pageSize.width;
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

  refreshCompanyDocumentTableArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const issueDate = new Date(x.issueDate).toLocaleDateString('ar-EG');
      const expiryDate = new Date(x.expiryDate).toLocaleDateString('ar-EG');
      return {
        ' الرقم': x.number,
        ' رقم الوثيقه ': x.docNo,
        '  الاسم الوثيقة ': x.docName,
        '  نوع الوثيقه': x.docTypeName,
        '  تاريخ الاصدار ': issueDate,
        ' تاريخ  الصلاحيه': expiryDate,
      }
    });
  }

  refreshCompanyDocumentTableEngilsh(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const issueDate = new Date(x.issueDate).toLocaleDateString('ar-EG');
      const expiryDate = new Date(x.expiryDate).toLocaleDateString('ar-EG');
      return {
        'Number': x.number,
        'Document Number': x.docNo,
        'Name ': x.docName,
        'Document Type': x.docTypeName,
        'Date Of Issue': issueDate,
        'Expiry Date ': expiryDate,
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

  viewImage(image) {
    let imageurl = this.baseUrl + image;

    let title = this.translateService.instant('itemImage');
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
}
