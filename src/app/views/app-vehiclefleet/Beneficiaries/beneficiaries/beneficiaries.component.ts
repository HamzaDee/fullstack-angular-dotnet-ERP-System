import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { BeneficiariesService } from '../beneficiaries.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import { BeneficariesadvancedsearchComponent } from 'app/views/general/app-searchs/app-BeneficiariesAdvancedSearch/beneficariesadvancedsearch.component';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-beneficiaries',
  templateUrl: './beneficiaries.component.html',
  styleUrl: './beneficiaries.component.scss'
})
export class BeneficiariesComponent {
  @ViewChild(BeneficariesadvancedsearchComponent) childSearchComponent: BeneficariesadvancedsearchComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 247;
  custom: boolean;
  data: any[] = [];
  lang: string;



  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private alert: sweetalert,
      private dialog: MatDialog,
      private routePartsService: RoutePartsService,
      private router: Router,
      private beneficiariesService: BeneficiariesService) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetBeneficiariesList();
  }

  GetBeneficiariesList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.beneficiariesService.getBeneficiarieList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;
        this.data = result;
        if (result.length > 0) {
          if (this.childSearchComponent) {
            this.childSearchComponent.vGovernoratesList = result[0].beneficiariesAdvancedSearch.governoratesList;
            this.childSearchComponent.vNationalitiesList = result[0].beneficiariesAdvancedSearch.nationalitiesList;
            this.childSearchComponent.vSexIdentityList = result[0].beneficiariesAdvancedSearch.sexIdentityList;
            this.childSearchComponent.ngOnInit();
          }
        }
        if (currentLang == "ar") {
          this.refresBeneficiariesArabic(this.tabelData);
        }
        else {
          this.refreshBeneficiariesEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });
  }

    handleSearchResult(result: any) {
    debugger
    this.tabelData = result;
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    if (currentLang == "ar") {
      this.refresBeneficiariesArabic(this.tabelData);
    }
    else {
      this.refreshBeneficiariesEnglish(this.tabelData);
    }

  }

  OpenDetailsForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['Beneficiaries/BeneficiarieForm']);
  }

  AddBeneficiariesForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Beneficiaries/BeneficiarieForm']);
  }

  OpenBeneficiariesForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Beneficiaries/BeneficiarieForm']);
  }

  DeleteBeneficiaries(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    })
      .then((result) => {
        if (result.value) {
          this.beneficiariesService.DeleteBeneficiarie(id).subscribe((results) => {
            if (results == true) {
              this.alert.DeleteSuccess();
              this.GetBeneficiariesList();
              this.router.navigate(['Beneficiaries/BeneficiariesList']);
            }
            else if (!results.isSuccess && results.message === "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else {
              this.alert.DeleteFaild()
            }
          });
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          console.log('Delete action was canceled.');
        }
      })
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('BeneficiariesList');
    this.title.setTitle(this.TitlePage);
  }

  updateFavourite(ScreenId: number) {
    debugger
    this.beneficiariesService.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }

  getFavouriteStatus(screenId) {
    debugger
    this.beneficiariesService.GetFavouriteStatus(screenId).subscribe(result => {
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

  refresBeneficiariesArabic(data) {
    debugger
    this.exportData = data.map(x => {
      const birthDate = new Date(x.birthDate).toLocaleDateString('ar-EG');
      return {
        'اسم المنتفع': x.benName,
        ' الجنسيه': x.nationalityName,
        'الرقم الوطني': x.documentNo,
        'رقم الهاتف': x.phoneNo1,
        'تاريخ الميلاد': birthDate,
        ' العمر': x.age,
      }
    });
  }

  refreshBeneficiariesEnglish(data) {
    debugger
    this.exportData = data.map(x => {
      const birthDate = new Date(x.birthDate).toLocaleDateString('en-EG');
      return {
        'Beneficiarie Name': x.benName,
        'Nationality': x.nationalityName,
        'National Number': x.documentNo,
        'Phone Number': x.phoneNo1,
        'Birthday Date': birthDate,
        'Age': x.age,
      }
    });
  }

  exportExcel(dt: any) {
    import("xlsx").then(xlsx => {
  var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];

      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refresBeneficiariesArabic(exportSource);
      } else {
        this.refreshBeneficiariesEnglish(exportSource);
      }
      
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
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [[' العمر ', 'تاريخ الميلاد', ' رقم الهاتف', 'الرقم الوطني', '  الجنسيه', ' اسم المنتفع']]
    }
    else {
       head = [['Age', 'Birthday Date', 'Phone Number', 'National Number', 'Nationality', 'Beneficiarie Name']]
    }

    const rows: (number | string)[][] = [];
    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else {
      exportSource = this.data;
    }


    exportSource.forEach(function (part, index) {

      const date1 = new Date(part.birthDate);
      const birthDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.benName
      temp[1] = part.nationalityName
      temp[2] = part.documentNo
      temp[3] = part.phoneNo1
      temp[4] = birthDate
      temp[5] = part.age
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

    const Title = currentLang == "ar" ? "قائمة المنتفعين" : "Beneficiaries List" ;
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

}
