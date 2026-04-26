import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import * as FileSaver from 'file-saver';
import { MatDialog} from '@angular/material/dialog';
import { MainSystemDefinitionsService } from '../main-system-definitions.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { delay, of } from 'rxjs';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-main-system-definitions-list',
  templateUrl: './main-system-definitions-list.component.html',
  styleUrls: ['./main-system-definitions-list.component.scss']
})
export class MainSystemDefinitionsListComponent implements OnInit {
  public TitlePage: string;
  data: any[];
  cols: any[];
  mainTableList: any;
  userlookupList: any;
  selectedMainTable: any;
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId: number = 50;
  custom: boolean;
  exportData: any[];
  MainSystemDefinitionsForm: FormGroup;
  status: number = 1;
  loading: boolean;
  public CompanyName: string = '';

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private mainSystemDefinitionsService: MainSystemDefinitionsService,
    private formbulider: FormBuilder,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.CompanyName = window.localStorage.getItem('companyName');
    this.MainSystemDefinitionsForm = this.formbulider.group({
      id: [0],
      tableNo: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      descrE: ["", [Validators.required, Validators.min(1)]],
      descrA: ["", [Validators.required, Validators.min(1)]],
      note: [""],
      parentTableNo: [0],
      status: [false],
      companyid: [0],
    });

    this.SetTitlePage();
    this.GetAllMainSystemsDefinitionList();
    // this.GetDropDownMainTableList();
    this.GetInitialMainSystemDefinitionsForm();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('MainSystemDefinitionsList');
    this.title.setTitle(this.TitlePage);
  }

  GetInitialMainSystemDefinitionsForm() {
    debugger
    this.mainSystemDefinitionsService.InitailMainSystemsDefinition(this.MainSystemDefinitionsForm.value.id, this.MainSystemDefinitionsForm.value.tableNo).subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      debugger
      this.mainTableList = result.mainTableList;
      this.userlookupList = result.userlookupList;
      this.MainSystemDefinitionsForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedMainTable = result.tableNo;
        this.MainSystemDefinitionsForm.get('status').setValue(1);

      });
    });
  }

  toggleActive(item: any) {
    item.active = (item.active === 0) ? 1 : 0;
  }

  UpdatePayments() {
    this.mainSystemDefinitionsService.UpdatePaymentsTypes().subscribe((result) => {
      if (result.isSuccess == true) {
        this.alert.SaveSuccess();
      }
      else {
        this.alert.ShowAlert(result.message, 'error');
      }
    })
  }

  OnSaveForms() {
    debugger
    const selectedTableValue = this.selectedMainTable;
    this.MainSystemDefinitionsForm.value.status = this.status;
    this.MainSystemDefinitionsForm.value.companyid = this.jwtAuth.getCompanyId();
    this.mainSystemDefinitionsService.PostMainSystemDefinition(this.MainSystemDefinitionsForm.value).subscribe((result) => {
      debugger
      if (result == true) {
        this.alert.SaveSuccess();
        this.MainSystemDefinitionsForm.get('descrA').setValue('');
        this.MainSystemDefinitionsForm.get('descrE').setValue('');
        this.MainSystemDefinitionsForm.get('note').setValue('');
        this.MainSystemDefinitionsForm.get('id').setValue(0);
        this.MainSystemDefinitionsForm.controls['tableNo'].setValue(selectedTableValue);
        this.selectedMainTable = selectedTableValue;
        this.MainSystemDefinitionsForm.get('status').setValue(1);

        this.mainSystemDefinitionsService.GetMainSystemDefinitionListByTableNoList(this.selectedMainTable).subscribe(result => {
          this.data = result;
        })
      }
      else {
        this.alert.ShowAlert(result.message, 'error');
      }
    })
  }

  GetAllMainSystemsDefinitionList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      this.mainSystemDefinitionsService.GetAllMainSystemsDefinitionList().subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        debugger
        // this.selectedMainTable = 0;
        this.data = result;

        if (currentLang == "ar") {
          this.refreshMainSystemDefinitionsListReportTableArabic(this.data);
        }
        else {
          this.refreshMainSystemDefinitionsListReportTableEnglish(this.data);
        }
        this.showLoader = false;
      })
    });
  }

  OpenMainSystemsDefinitionFormPopUp(id: number, tableNo: number, isNew?) {
    debugger
    this.MainSystemDefinitionsForm.get("parentTableNo").setValue(0);
    this.mainSystemDefinitionsService.InitailMainSystemsDefinition(id, tableNo).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }

      this.mainTableList = result.mainTableList;
      this.status = result.status;
      this.MainSystemDefinitionsForm.patchValue(result);
      this.MainSystemDefinitionsForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(1)).subscribe(value => {
        this.MainSystemDefinitionsForm.get('tableNo')?.setValue(result.tableNo);
      });
    });
  }

  GetAllMainSystemsDefinitionListBy(tableNo) {
    this.MainSystemDefinitionsForm.get('descrE')?.setValue("");
    this.MainSystemDefinitionsForm.get('descrA')?.setValue("");
    this.MainSystemDefinitionsForm.get('note')?.setValue("");
    this.MainSystemDefinitionsForm.get('parentTableNo')?.setValue(0);

    if (tableNo > 0) {
      this.mainSystemDefinitionsService.GetMainSystemDefinitionListByTableNoList(tableNo).subscribe(result => {
        this.data = result;
      })
    }
    else {
      this.GetAllMainSystemsDefinitionList();
    }
  }

  DeleteMainSystemDefinition(id: any) {
    debugger
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
        this.mainSystemDefinitionsService.DeleteMainSystemDefinition(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            if (this.MainSystemDefinitionsForm.value.tableNo != 0) {
              this.GetAllMainSystemsDefinitionListBy(this.MainSystemDefinitionsForm.value.tableNo);
            }
            else {
              this.GetAllMainSystemsDefinitionList();
            }

          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }

          }
          else if (results.isSuccess == false && results.message === "UCantDeleteTheItemGroupIsConnectedWithMaterials") {
            {
              this.alert.ShowAlert("UCantDeleteTheItemGroupIsConnectedWithMaterials", 'error');
              return;
            }

          }
          else {
            this.alert.ShowAlert("msgRecordHasLinks", 'error')
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['نشط', ' ملاحظات ', ' الاسم', '  الجدول الرئيسي', ' الرقم']]
    }
    else {
       head = [['Active', 'Notes ', 'Name ', ' Main Table', 'Number']]
    }

    const rows: (number | string)[][] = [];
    this.data.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.number
      temp[1] = part.mainTable
      temp[2] = part.name
      temp[3] = part.note
      temp[4] = part.status

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

    let Title = "";
    if (currentLang == "ar") {
      Title = " كشف  تعريفات النظام الاساسية ";
    }
    else {
      Title = " Main System Definitions";
    }


    //let Title = " كشف  تعريفات النظام الاساسية ";
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

  refreshMainSystemDefinitionsListReportTableArabic(data) {
    this.exportData = data;
    this.exportData = this.data.map(x => ({
      ' الرقم ': x.number,
      ' الجدول الرئيسي': x.mainTable,
      ' الاسم': x.name,
      ' الملاحظات': x.note,
      ' نشط': x.status,
    }));
  }

  refreshMainSystemDefinitionsListReportTableEnglish(data) {
    this.exportData = data;
    this.exportData = this.data.map(x => ({
      ' Number ': x.number,
      '  Main Table': x.mainTable,
      ' Name': x.name,
      ' Notes': x.note,
      ' Active': x.status,
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Main System Definitions List");
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

  getFavouriteStatus(screenId) {
    debugger
    this.serv.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if (result.isSuccess) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }

  loadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.userlookupList) {
      this.userlookupList = [];
    }

    // Make sure the array is large enough
    while (this.userlookupList.length < last) {
      this.userlookupList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.userlookupList[i] = this.userlookupList[i];
    }

    this.loading = false;
  }

}
