import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { CheckUpService } from '../../vehiclecheckup/checkup.service';
import { VehicleLicensingMovementService } from '../vehicle-licensing-movement.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import { VehicleLicensingMovementFormComponent } from '../vehicle-licensing-movement-form/vehicle-licensing-movement-form.component';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-vehicle-licensing-movement-list',
  templateUrl: './vehicle-licensing-movement-list.component.html',
  styleUrl: './vehicle-licensing-movement-list.component.scss'
})
export class VehicleLicensingMovementListComponent {
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
    private vehicleLicensingMovementService: VehicleLicensingMovementService,
    private formbulider: FormBuilder) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetVehicleLicensingMovementList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('VehicleLicensingMovementList');
    this.title.setTitle(this.TitlePage);
  }

  GetVehicleLicensingMovementList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.vehicleLicensingMovementService.GetVehicleLicensingMovementList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;
        this.data = result;

        if (currentLang == "ar") {
          this.refresVehicleLicensingMovementArabic(this.tabelData);
        }
        else {
          this.refreshVehicleLicensingMovementEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });
  }

  ShowDetailsOnly(id) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['VehicleLicensingMovement/VehicleLicensingMovementForm']);
  }

  OpenVehicleLicensingMovementFormPopUp(id: number, crruntrow: any, isNew?, isShow?) {
    let title = isNew ? this.translateService.instant('VehicleLicensingMovementForm') : this.translateService.instant('modifiyVehicleLicensingMovement');
    let dialogRef: MatDialogRef<any> = this.dialog.open(VehicleLicensingMovementFormComponent, {
      width: '1000px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, id: id, row: crruntrow, isNew, isShow, companyid: this.jwtAuth.getCompanyId(), GetVehicleLicensingMovementList: () => { this.GetVehicleLicensingMovementList() } }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
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
        this.vehicleLicensingMovementService.DeleteVehicleLicensingMovement(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetVehicleLicensingMovementList();
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

  updateFavourite(ScreenId: number) {
    debugger
    this.vehicleLicensingMovementService.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }

  getFavouriteStatus(screenId) {
    debugger
    this.vehicleLicensingMovementService.GetFavouriteStatus(screenId).subscribe(result => {
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

  refresVehicleLicensingMovementArabic(data) {
    debugger
    this.exportData = data.map(x => {
      const licenseExpDate = new Date(x.licenseExpDate).toLocaleDateString('ar-EG');
      const insuranceExpDate = new Date(x.insuranceExpDate).toLocaleDateString('ar-EG');
      return {
        ' رقم الالية': x.vehicleName,
        'تاريخ انتهاء الترخيص ': licenseExpDate,
        'اسم شركة التامين ': x.insuranceName,
        ' تاريخ انتهاء التامين ': insuranceExpDate,
      }
    });
  }

  refreshVehicleLicensingMovementEnglish(data) {
    debugger
    this.exportData = data.map(x => {
      const licenseExpDate = new Date(x.licenseExpDate).toLocaleDateString('en-EG');
      const insuranceExpDate = new Date(x.insuranceExpDate).toLocaleDateString('en-EG');
      return {
        'Mechanism Number': x.vehicleName,
        'License Expiration Date': licenseExpDate,
        'Insurance': x.insuranceName,
        'Expire Date For Insurance Card': insuranceExpDate,
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
        this.refresVehicleLicensingMovementArabic(exportSource);
      } else {
        this.refreshVehicleLicensingMovementEnglish(exportSource);
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
       head = [[' تاريخ انتهاء التامين ', ' اسم شركة التامين ', ' تاريخ انتهاء الترخيص ', '  رقم الالية']]
    }
    else {
       head = [['Expire Date For Insurance Card', 'Insurance', 'License Expiration Date', 'Mechanism Number']]
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


      const date2 = new Date(part.insuranceExpDate);
      const insuranceExpDate = currentLang === 'ar'
        ? `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`
        : `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.vehicleName
      temp[1] = licenseExpDate
      temp[2] = part.insuranceName
      temp[3] = insuranceExpDate
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

    const Title = currentLang == "ar" ? "حركة ترخيص السيارة" : "Vehicle Licensing Movement List" ;
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
