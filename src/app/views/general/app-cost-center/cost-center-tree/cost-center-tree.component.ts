import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { TreeNode } from 'primeng/api';
import { sweetalert } from 'sweetalert';
import { CostCenterService } from '../cost-center.service';
import { AppCostCenterFormComponent } from '../cost-center-list/cost-center-form/cost-center-form.component';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as FileSaver from 'file-saver';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-cost-center-tree',
  templateUrl: './cost-center-tree.component.html',
  styleUrl: './cost-center-tree.component.scss'
})
export class CostCenterTreeComponent {
  loading: boolean;
  tabelData: TreeNode[];
  treeData: TreeNode[];
  filterMode = 'lenient';
  cols: any[];
  screenId: number = 21;
  custom: boolean;
  exportData: any[];
  data: any[];
  public TitlePage: string;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private costCenterService: CostCenterService,
    private translateService: TranslateService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private readonly serv: AppCommonserviceService,

  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.CostCenterList(null);
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CostCenterTree');
    this.title.setTitle(this.TitlePage);
  }

  CostCenterList(event) {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    debugger
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.tabelData = [];
      this.costCenterService.GetCostCenterList(0, 1).subscribe((result) => {
        debugger
        if (result.isSuccess == false && result.message == "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        // this.DataPDF = result;
        this.treeData = this.transformToTreeData(result);
        this.tabelData = result.map((result) => ({
          data: result,
          leaf: result.children && result.children.length === 0,
          children: result.children ? this.mapChildren(result.children) : null,
        }));
        if (currentLang == "ar") {
          this.refresAppCostCenterListArabic(result);
        }
        else {
          this.refreshAppCostCenterListEnglish(result);
        }

      })
    });
  }

  transformToTreeData(data: any[]): any[] {
    return data.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      return {
        label: item.name,
        data: item,
        expanded: false,
        expandedIcon: hasChildren ? "pi pi-folder-open" : null,
        collapsedIcon: hasChildren ? "pi pi-folder" : "pi pi-file",
        children: hasChildren ? this.transformToTreeData(item.children) : []
      };
    });
  }

  mapChildren(children: TreeNode[]): any[] {
    return children.map((child) => ({
      data: child,
      leaf: child.children && child.children.length === 0,
      children: child.children ? this.mapChildren(child.children) : null,
    }));
  }

  OpenCostCenterFormPopUp(id: number, isNew?) {
    debugger
    let title = isNew ? this.translateService.instant('AddCostCenter') : this.translateService.instant('ModifyCostCenterList');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppCostCenterFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, isNew, companyid: this.jwtAuth.getCompanyId(),
        CostCenterListFromParent: () => { this.CostCenterList(0) }
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
            this.CostCenterList(0);
          }
          else if (results.isSuccess == false && results.message === "msgRecordHasLinks") {
            {
              this.alert.ShowAlert("msgRecordHasLinks", 'error');
              return;
            }
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

  // Method For Tree To Retrieve All Cost Centers (Parent + Children)
  flattenAccounts(accounts: any[]): any[] {
    debugger
    const flatList = [];

    const traverse = (account, parentName = null, parentId = null) => {
      flatList.push({
        itemNo: account.itemNo,
        name: account.name || account.name,
        note: account.note,
        statusName: account.statusName,
      });

      if (Array.isArray(account.children) && account.children.length > 0) {
        account.children.forEach(child => {
          traverse(child, account.name, account.id);
        });
      }
    };

    accounts.forEach(acc => traverse(acc));
    return flatList;
  }

  refresAppCostCenterListArabic(data) {
    debugger
    this.data = data;
    const flatAccounts = this.flattenAccounts(this.data);
    this.exportData = flatAccounts.map(x => ({
      'الرقم': x.itemNo,
      'الاسم': x.name,
      'ملاحظات': x.note,
      'نشط': x.statusName,
    }));
  }

  refreshAppCostCenterListEnglish(data) {
    debugger
    this.data = data;
    const flatAccounts = this.flattenAccounts(this.data);
    this.exportData = flatAccounts.map(x => ({
      'Number': x.itemNo,
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
      this.saveAsExcelFile(excelBuffer, "Cost Center");
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
    const flatAccounts = this.flattenAccounts(this.data); // <- تفكيك الشجرة


    if (currentLang == "ar") {
       head = [[' نشط', ' ملاحظات ', 'الاسم', 'الرقم']]
    }
    else {
       head = [['Active', 'Note', 'Name', 'Number']]
    }

    const rows: (number | string)[][] = flatAccounts.map(part => {
      const temp: (number | string)[] = [];
      temp[0] = part.itemNo
      temp[1] = part.name
      temp[2] = part.note
      temp[3] = part.statusName
      return temp.reverse(); // لأنك تستخدم reverse في الجدول العربي
    });

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title = "";
    if (currentLang == "ar") {
      Title = "قائمة مراكز الكلف  ";
    }
    else {
      Title = "Cost Center List";
    }

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
