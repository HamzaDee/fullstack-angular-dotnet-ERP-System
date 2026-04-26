import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { CheckUpService } from '../../vehiclecheckup/checkup.service';
import Swal from 'sweetalert2';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { VehicleDefinitionService } from '../vehicle-definition.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-vehicle-definition',
  templateUrl: './vehicle-definition.component.html',
  styleUrl: './vehicle-definition.component.scss'
})
export class VehicleDefinitionComponent {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 237;
  custom: boolean;
  data: any[] = [];
  lang: string;


  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private service: CheckUpService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private VehicleDefinitionService: VehicleDefinitionService) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetVehicleDefinitionList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('VehicleDefinition');
    this.title.setTitle(this.TitlePage);
  }

  GetVehicleDefinitionList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.VehicleDefinitionService.getVehicleDefinitionList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;
        this.data = result;

        if (currentLang == "ar") {
          this.refresVehicleDefinitionArabic(this.tabelData);
        }
        else {
          this.refreshVehicleDefinitionEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });

  }

  ShowDetailsOnly(id) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['VehicleDefinition/VehicleDefinitionForm']);
  }

  AddVehicleForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['VehicleDefinition/VehicleDefinitionForm']);
  }

  EditVehicleForm(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['VehicleDefinition/VehicleDefinitionForm']);
  }

  DeleteVehicle(id: any) {
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
        this.VehicleDefinitionService.deleteVehicleDefinition(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetVehicleDefinitionList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {
            if (results.message == "msgRecordHasLinks") {

              this.alert.ShowAlert("msgRecordHasLinks", 'error')

            }
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  AttachmentVehicle(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 42 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }

  updateFavourite(ScreenId: number) {
    debugger
    this.VehicleDefinitionService.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }

  getFavouriteStatus(screenId) {
    debugger
    this.VehicleDefinitionService.GetFavouriteStatus(screenId).subscribe(result => {
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


  refresVehicleDefinitionArabic(data) {
    debugger
    this.exportData = data.map(x => {
    const licenseExpDate = new Date(x.licenseExpDate).toLocaleDateString('ar-EG');
      return {
      'رقم اللوحة': x.plateNo,
      ' السيارة': x.vehicleName,
      'نوع السيارة': x.vehicleTypeName,
      'موديل السيارة': x.modelName,
      'سنة التصنيع ': x.manufactureYear,
      'اسم السائق': x.driverNames,
      'تاريخ انتهاء الترخيص': licenseExpDate,
    }
    });
  }


  refreshVehicleDefinitionEnglish(data) {
    debugger
    this.exportData = data.map(x => {
    const licenseExpDate = new Date(x.licenseExpDate).toLocaleDateString('en-EG');
      return {
      'Plate Number': x.plateNo,
      'Car': x.vehicleName,
      'Car Type': x.vehicleTypeName,
      'Car Model ': x.modelName,
      'Year of Manufacture': x.manufactureYear,
      'Driver Name': x.driverNames,
      'License Expiration Date': licenseExpDate,
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
        this.refresVehicleDefinitionArabic(exportSource);
      } else {
        this.refreshVehicleDefinitionEnglish(exportSource);
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
       head = [['تاريخ انتهاء الترخيص', 'اسم السائق', ' سنة التصنيع', ' موديل السيارة', ' نوع السيارة', 'السيارة', 'رقم اللوحة']]
    }
    else {
       head = [['License Expiration Date', 'Driver Name', 'Year of Manufacture', 'Car Model', 'Car Type', 'Car ', 'Plate Number']]
    }

    const rows: (number | string)[][] = [];

        let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else {
      exportSource = this.data;
    }

    exportSource.forEach(function (part, index) {

      const date1 = new Date(part.licenseExpDate);
      const licenseExpDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.plateNo
      temp[1] = part.vehicleName
      temp[2] = part.vehicleTypeName
      temp[3] = part.modelName
      temp[4] = part.manufactureYear
      temp[5] = part.driverNames
      temp[6] = licenseExpDate
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

    const Title = currentLang == "ar" ? "قائمة تعريف السيارة" : "Vehicle Definition List" ;
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
