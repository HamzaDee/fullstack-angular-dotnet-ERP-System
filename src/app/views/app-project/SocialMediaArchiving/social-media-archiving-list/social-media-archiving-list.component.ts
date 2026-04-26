import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as FileSaver from 'file-saver';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import Swal from 'sweetalert2';
import { ProjectDefinitionService } from '../../projectdefinition/projDef.service';
import { SocialMediaArchivingService } from '../social-media-archiving.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-social-media-archiving-list',
  templateUrl: './social-media-archiving-list.component.html',
  styleUrl: './social-media-archiving-list.component.scss'
})
export class SocialMediaArchivingListComponent {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 252;
  custom: boolean;
  data: any[] = [];
  lang: string;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private service: ProjectDefinitionService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private socialMediaArchivingService: SocialMediaArchivingService,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetSocialMediaArchivingList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SocialMediaArchivingList');
    this.title.setTitle(this.TitlePage);
  }

  GetSocialMediaArchivingList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.socialMediaArchivingService.GetSocialMediaArchivingList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;
        this.data = result;

        if (currentLang == "ar") {
          this.refresSocialMediaArchivingArabic(this.tabelData);
        }
        else {
          this.refreshSocialMediaArchivingEnglish(this.tabelData);
        }
        this.showLoader = false;
      })
    });
  }

  DeleteSocialMediaArchiving(id: any) {
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
          this.socialMediaArchivingService.deleteSocialMediaArchiving(id).subscribe((results) => {
            if (results.isSuccess) {
              this.alert.DeleteSuccess();
              this.GetSocialMediaArchivingList();
              this.router.navigate(['SocialMediaArchiving/SocialMediaArchivingList']);
            }
            else if (!results.isSuccess && results.message === "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else {
              if (results.message == "msgRecordHasLinks") {
                this.alert.ShowAlert("msgRecordHasLinks", 'error')
              }
            }
          });
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          console.log('Delete action was canceled.');
        }
      })
  }

  OpenDetailsForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['SocialMediaArchiving/SocialMediaArchivingForm']);
  }

  AddSocialMediaArchivingForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['SocialMediaArchiving/SocialMediaArchivingForm']);
  }

  EditSocialMediaArchivingForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['SocialMediaArchiving/SocialMediaArchivingForm']);
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

  refresSocialMediaArchivingArabic(data) {
    debugger
    this.exportData = data.map(x => ({
      'رقم المشروع': x.projectName,
      'رقم الفعالية': x.eventNo,
      'التاريخ والوقت': x.eventDate,
      'تفاصيل': x.description,
      'المكان': x.placeName,
      'تصنيف الفعالية': x.eventClassName,
      'نوع  الوثيقة': x.documentTypeName,
    }));
  }

  refreshSocialMediaArchivingEnglish(data) {
    debugger
    this.exportData = data.map(x => ({
      'Project Number': x.projectName,
      'Event Number': x.eventNo,
      'Date Time': x.eventDate,
      'Details': x.description,
      'The Place': x.placeName,
      'Event Class': x.eventClassName,
      'Document Type': x.documentTypeName,
    }));
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
        this.refresSocialMediaArchivingArabic(exportSource);
      } else {
        this.refreshSocialMediaArchivingEnglish(exportSource);
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
       head = [[ 'نوع الوثيقة ', ' تصنيف الفعالية', 'المكان', 'تفاصيل', 'التاريخ و الوقت', 'رقم الفعالية ', 'رقم المشروع']]
    }
    else {
       head = [[ 'Document Type', 'Event Type',  'The Place', 'Details', 'Date Time', 'Event Number', 'Project Number']]
    }

    const rows: (number | string)[][] = [];
    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else {
      exportSource = this.data;
    }

    exportSource.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.projectName
      temp[1] = part.eventNo
      temp[2] = part.eventDate
      temp[3] = part.description
      temp[4] = part.placeName
      temp[5] = part.eventClassName
      temp[6] = part.documentTypeName
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

    const Title = currentLang == "ar" ?"أرشفة المواد الاعلامية":"Social Media Archiving List";
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
}
