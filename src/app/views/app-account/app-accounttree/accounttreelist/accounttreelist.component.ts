import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AccountTreeService } from '../app-accounttree.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { SortEvent, TreeNode } from 'primeng/api';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-accounttreelist',
  templateUrl: './accounttreelist.component.html',
  styleUrls: ['./accounttreelist.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccounttreelistComponent implements OnInit {
  public TitlePage: string;
  tabelData: TreeNode[];
  treeData: TreeNode[];
  cols: any[];
  loading: boolean;
  filterMode = 'lenient';
  searchQuery: string;
  @ViewChild('tt', { read: '', static: true }) dt: any;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 29;
  custom: boolean;
  data: any[];
  DataPDF: any[];
  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private accountTreeService: AccountTreeService,
    private translateService: TranslateService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAccountsList(null);
    this.getFavouriteStatus(this.screenId);
    this.cols = [
      { field: 'accNo', header: 'AccountNo' },
      { field: 'accName', header: 'AccountName' },
      { field: 'parentAccName', header: 'ParentAccount' },
      { field: 'accTypeName', header: 'AccTypeName' },
      { field: 'accNatureName', header: 'accNatureName' },
      { field: 'isMain', header: 'isMain' },
      { field: 'isActive', header: 'isActive' },
    ];
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  ngAfterViewInit() {
    $('.p-treetable-thead').addClass('p-datatable-thead');
  }

  GetAccountsList(event) {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    debugger
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.tabelData = [];
      this.accountTreeService.GetAccountsList(0, 1).subscribe((result) => {  //Edit By Jihad Remove the interface and return only Result ;         
        debugger
        if (result.isSuccess == false && result.message == "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.DataPDF = result;
        this.treeData = this.transformToTreeData(result);
        this.tabelData = result.map((result) => ({
          data: result,
          leaf: result.children && result.children.length === 0,
          children: result.children ? this.mapChildren(result.children) : null,
        }));
        if (currentLang == "ar") {
          this.refresAccounttreeArabic(result);
        }
        else {
          this.refreshAccounttreeEnglish(result);
        }

      })
    });

  }

  transformToTreeData(data: any[]): any[] {
    return data.map((item) => {
      const hasChildren = item.children && item.children.length > 0; // Check if the node has children
      return {
        label: item.accName, // Change this to the correct field name from your API
        data: item, // Attach the full item for reference
        expanded: false, // Optionally, keep nodes expanded by default
        expandedIcon: hasChildren ? "pi pi-folder-open" : null, // Folder for nodes with children
        collapsedIcon: hasChildren ? "pi pi-folder" : "pi pi-file", // File icon for leaf nodes
        children: hasChildren ? this.transformToTreeData(item.children) : [] // Recursive call for children
      };
    });
  }

  onCheckboxChange(event: Event) {

    this.tabelData = [];
    this.loading = true;

    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked == true) {
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.tabelData = [];
        this.accountTreeService.GetSuspendedAccounts(0, 1).subscribe((result: TreeNode[]) => {

          this.tabelData = result.map((result) => ({
            data: result,
            leaf: result.children && result.children.length === 0,
            children: result.children ? this.mapChildren(result.children) : null,
          }));

          if (currentLang == "ar") {
            this.refresAccounttreeArabic(this.tabelData);
          }
          else {
            this.refreshAccounttreeEnglish(this.tabelData);
          }

        })
      });
    }
    else {
      this.loading = true;
      this.GetAccountsList(null);
    }
  }

  ImportFromExcel(event: any): void {

    const target: DataTransfer = <DataTransfer>event.target;
    const fileInput = event.target as HTMLInputElement;
    if (target.files.length !== 1) {
      console.error('Cannot use multiple files');
      return;
    }

    const file: File = target.files[0];
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const binaryStr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryStr, { type: 'binary' });
      const firstSheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];

      const excelData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      // Send to backend
      this.accountTreeService.ImportFromExcel(excelData).subscribe(
        (response) => {
          if (response == true) {
            window.location.reload();
          }
          else {
            this.alert.ShowAlert('Import failed', 'error')
            fileInput.value = "";
          }

        },
        (error) => { this.alert.ShowAlert('Import failed', 'error'); fileInput.value = ""; }
      );
    };

    reader.readAsBinaryString(file);
  }

  OpenAccountStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/GetAccountStatementForm?acc=${acc}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  OpenAccountForm(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.router.navigate(['Account/AccountForm']);
  }

  OpenTreeAccountForm(accData: any) {

    const id = accData.node.data.id;
    this.routePartsService.GuidToEdit = id;
    this.router.navigate(['Account/AccountForm']);
  }

  OpenSubAccountForm(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.router.navigate(['Account/AccountBranchForm']);
  }

  mapChildren(children: TreeNode[]): any[] {
    return children.map((child) => ({
      data: child,
      leaf: child.children && child.children.length === 0,
      children: child.children ? this.mapChildren(child.children) : null,
    }));
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AccountTree');
    this.title.setTitle(this.TitlePage);
  }

  expandAll() {

    this.tabelData.forEach((node) => {
      this.expandRecursive(node, true);
    });
    this.tabelData = [...this.tabelData];
  }

  collapseAll() {
    this.tabelData.forEach((node) => {
      this.expandRecursive(node, false);
    });
    this.tabelData = [...this.tabelData];
  }

  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach((childNode) => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }

  expandAllTree() {

    this.treeData.forEach(node => {
      this.expandRecursive(node, true);
    });
  }

  collapseAllTree() {
    this.treeData.forEach(node => {
      this.expandRecursiveTree(node, false);
    });
  }

  private expandRecursiveTree(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }

  DeleteAccount(id: any) {
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
        this.accountTreeService.DeleteAccount(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.GetAccountsList(null);
          }
          else {
            this.alert.ShowAlert(results.message, 'error');
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

  // Methid For Tree To Retrive All Account (Parent And Chiled)
  flattenAccounts(accounts: any[]): any[] {
    const flatList = [];

    const traverse = (account, parentAccName = null) => {
      flatList.push({
        accNo: account.accNo,
        accName: account.accName,
        parentAccName: parentAccName ?? account.parentAccName,
        accTypeName: account.accTypeName,
        accNatureName: account.accNatureName,
        isMain: account.isMain,
        isActive: account.isActive,
      });

      if (Array.isArray(account.children) && account.children.length > 0) {
        account.children.forEach(child => {
          traverse(child, account.accName); // تمرير اسم الحساب الأب
        });
      }
    };

    accounts.forEach(acc => traverse(acc));
    return flatList;
  }

  refresAccounttreeArabic(data) {
    this.data = data;
    const flatAccounts = this.flattenAccounts(this.data);
    this.exportData = flatAccounts.map(x => ({
      'رمز الحساب': x.accNo,
      'اسم الحساب': x.accName,
      'حساب الاب': x.parentAccName,
      'نوع الحساب': x.accTypeName,
      'طبيعه الحساب': x.accNatureName,
      'متفرع': x.isMain,
      'نشط': x.isActive,
    }));
  }

  refreshAccounttreeEnglish(data) {
    this.data = data;
    const flatAccounts = this.flattenAccounts(this.data);
    this.exportData = flatAccounts.map(x => ({
      'Account Number': x.accNo,
      'Account Name': x.accName,
      'Parent Account': x.parentAccName,
      'Account Type': x.accTypeName,
      'Account Nature': x.accNatureName,
      'Branch': x.isMain,
      'Active': x.isActive,
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

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';    
    const flatAccounts = this.flattenAccounts(this.data); // <- تفكيك الشجرة
    let head: string[][];
    if (currentLang == "ar") {
      head = [['نشط', 'متفرع', 'طبيعه الحساب', ' نوع الحساب', 'حساب الاب', 'اسم الحساب', 'رمز الحساب']];
    } else {
      head = [['Active', 'Branch', 'Account Nature', 'Account Type', 'Parent Account', 'Account Name', 'Account Number']];
    }

    const rows: (number | string)[][] = flatAccounts.map(part => {
      const temp: (number | string)[] = [];
      temp[0] = part.accNo;
      temp[1] = part.accName;
      temp[2] = part.parentAccName;
      temp[3] = part.accTypeName;
      temp[4] = part.accNatureName;
      temp[5] = part.isMain ? "Yes" : "No";
      temp[6] = part.isActive ? "Yes" : "No";
      return temp.reverse(); // لأنك تستخدم reverse في الجدول العربي
    });

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let title = currentLang == "ar" ? "شجرة الحسابات" : "Accounts Tree";
    let pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      headStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold',
        textColor: "black",
        lineWidth: 0.2,
        minCellWidth: 20
      },
      bodyStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold'
      },
      theme: "grid",
    });

    pdf.output('dataurlnewwindow');
  }

  updateDashboredStatus(accountId: any) {
    this.accountTreeService.UpdateDashboredStatus(accountId).subscribe(res => {
      if (res == true) {
        this.alert.SaveSuccess();
        this.GetAccountsList(0);
      }
    })
  }
}
