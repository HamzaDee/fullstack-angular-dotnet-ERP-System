import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ReceivingDeliveringAnOriginalToAnEmployeeService } from '../receiving-delivering-an-original-to-an-employee.service';
import Swal from 'sweetalert2';
import { EceivingDeliveringAnOriginalEmployeeSheetComponent } from '../eceiving-delivering-an-original-employee-sheet/eceiving-delivering-an-original-employee-sheet.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  providers: [DatePipe, EceivingDeliveringAnOriginalEmployeeSheetComponent],
  selector: 'app-receiving-delivering-an-original-to-an-employee-list',
  templateUrl: './receiving-delivering-an-original-to-an-employee-list.component.html',
  styleUrls: ['./receiving-delivering-an-original-to-an-employee-list.component.scss']
})
export class ReceivingDeliveringAnOriginalToAnEmployeeListComponent implements OnInit {
  showLoader: boolean;
  ReceivingDeliveringAnOriginal: any;
  screenId: number = 88;
  custom: boolean;
  exportData: any[];
  data: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  public TitlePage: string;
  Lang: string;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private ReceivingDeliveringAnOriginalToAnEmployeeService: ReceivingDeliveringAnOriginalToAnEmployeeService,
    private router: Router,
    private routePartsService: RoutePartsService,
    private EceivingDeliveringAnOriginalEmployeeSheetComponent: EceivingDeliveringAnOriginalEmployeeSheetComponent,
    private datepipe: DatePipe) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetReceivingDeliveringAnOriginalToAnEmployee();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ReceivingDeliveringAnOriginalToAnEmployee');
    this.title.setTitle(this.TitlePage);
  }

  GetReceivingDeliveringAnOriginalToAnEmployee() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    debugger
    this.showLoader = true;
    setTimeout(() => {
      this.ReceivingDeliveringAnOriginalToAnEmployeeService.getReceivingDeliveringAnOriginalList().subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }

        this.ReceivingDeliveringAnOriginal = result;

        if (currentLang == "ar") {
          this.refreshReceivingDeliveringArabic(this.ReceivingDeliveringAnOriginal);
        }
        else {
          this.refreshReceivingDeliveringEnglish(this.ReceivingDeliveringAnOriginal);
        }

        this.showLoader = false;
      })
    }, 500);
  }

  ReceivingDeliveringAnOriginalDetails(id) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['ReceivingDeliveringAnOriginalToAnEmployee/ReceivingDeliveringAnOriginalToAnEmployeeForm']);
  }

  AddReceivingDeliveringAnOriginalFormPopUp(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ReceivingDeliveringAnOriginalToAnEmployee/ReceivingDeliveringAnOriginalToAnEmployeeForm']);
  }

  EditReceivingDeliveringAnOriginalFormPopUp(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ReceivingDeliveringAnOriginalToAnEmployee/ReceivingDeliveringAnOriginalToAnEmployeeForm']);
  }

  DeleteReceivingDeliveringAnOriginalForm(id: any) {
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
        this.ReceivingDeliveringAnOriginalToAnEmployeeService.deleteReceivingDeliveringAnOriginalToAnEmployee(id).subscribe((results) => {

          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetReceivingDeliveringAnOriginalToAnEmployee();
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

  Print(id) {
    debugger
    this.EceivingDeliveringAnOriginalEmployeeSheetComponent.Print(id);
  }

  refreshReceivingDeliveringArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedDate = new Date(x.transDate).toLocaleDateString('ar-EG');
      return {
        ' نوع الحركة': x.id,
        ' رقم الحركة': x.transNo,
        ' تاريخ الحركة': formattedDate,
        '  الاصل': x.assetName,
        '  الموظف': x.employeeName,
        '  البيان': x.note,
      }
    });
  }

  refreshReceivingDeliveringEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedDate = new Date(x.transDate).toLocaleDateString('en-GB');
      return {
        'Transaction Name': x.transTypeName,
        'Transaction Number': formattedDate,
        'Transaction Date': x.transDate,
        'Assest ': x.assetName,
        'Representative': x.employeeName,
        'Note': x.note,
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

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['البيان', ' الموظف', ' الاصل', 'تاريخ الحركة ', ' رقم الحركة', ' نوع الحركة']]
    }
    else {
       head = [['Note', 'Representative', ' Assest ', 'Transaction Date ', ' Transaction Number', 'Transaction Name']]
    }

    const rows: (number | string)[][] = [];
    this.data.forEach(function (part, index) {

      const date1 = new Date(part.transDate);
      const formattedDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.transTypeName
      temp[1] = part.transNo
      temp[2] = formattedDate
      temp[3] = part.assetName
      temp[4] = part.employeeName
      temp[5] = part.note
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

    const Title = currentLang == "ar" ? " كشف قائمة استلام / تسليم أصل" : "Asset Receipt/Delivery List " ;
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

  PrintReceivingDeliveringAnOriginalForm(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptReceivingDeliveringAnOriginalAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptReceivingDeliveringAnOriginalEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
