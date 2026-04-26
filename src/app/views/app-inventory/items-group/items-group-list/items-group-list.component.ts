import { Component, OnInit, ViewChild } from '@angular/core';
import { ItemsGroupFormComponent } from '../items-group-form/items-group-form.component'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
import { sweetalert } from 'sweetalert';
import { ItemsGroupService } from '../items-group.service';
import { TreeNode } from 'primeng/api';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-items-group-list',
  templateUrl: './items-group-list.component.html',
  styleUrls: ['./items-group-list.component.scss']
})
export class ItemsGroupListComponent implements OnInit {
  @ViewChild('tt') treeTable: any;
  public TitlePage: string;
  tabelData: TreeNode[];
  filterMode = 'lenient';
  searchQuery: string;
  cols: any[];
  exportColumns: any[];
  loading: boolean;
  exportData: any[];
  data: any[];

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private itemsGroupService: ItemsGroupService,
    private dialog: MatDialog,
    public router: Router,
    private alert: sweetalert,
    private routePartsService: RoutePartsService
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAllItemsGroups();    
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }
  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsGroups');
    this.title.setTitle(this.TitlePage);
  }

  GetAllItemsGroups() {
    
    var currentLang = this.jwtAuth.getLang();      

    this.loading = true;
    this.tabelData = [];
    this.itemsGroupService.GetAllItemsGroups().subscribe((result) => {
      

        if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          return;
        }   
      this.tabelData = result.map((result) => ({
        data: result,
        leaf: result.children && result.children.length === 0,
        children: result.children ? this.mapChildren(result.children) : null,
      }));

      if(currentLang == "ar"){
        this.cols = [
          { field: 'id', header: 'رقم المجموعة' },
          { field: 'groupName', header: 'اسم المجموعة' },
          { field: 'mainGroupName', header: 'المجموعة الرئيسية' },
          { field: 'category', header: 'الفئة' },
          { field: 'taxName', header: 'الضريبة' },
          { field: 'discountName', header: 'الخصم' },
          { field: 'isActive', header: 'فعال' },
        ];
       }
       else{
        this.cols = [
          { field: 'id', header: 'Group Number' },
          { field: 'groupName', header: 'Group Name' },
          { field: 'mainGroupName', header: 'Main Group' },
          { field: 'category', header: 'Category' },
          { field: 'taxName', header: 'Tax' },
          { field: 'discountName', header: 'Discount' },
          { field: 'isActive', header: 'Is Active' },
        ];
       }   

      this.loading = false;
    });
  }

  mapChildren(children: TreeNode[]): any[] {
    return children.map((child) => ({
      data: child,
      leaf: child.children && child.children.length === 0,
      children: child.children ? this.mapChildren(child.children) : null,
    }));
  }

  OpenItemsGroupForm(id) {
    debugger
    let optype = '';
    if(id > 0)
      {
        optype = 'Edit'
      }
      else
      {
        optype = 'Add'
      }
    let title = this.translateService.instant('ItemsGroupForm');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ItemsGroupFormComponent, {
      width: '1250px',
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, id: id,optype:optype, GetAllItemsGroups: () => { this.GetAllItemsGroups() } }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  OpenSubItemsGroupForm(id, discount, name, tax, category) {
    var row = { id, discount, name, tax, category };
    this.routePartsService.Guid2ToEdit = row;
    this.router.navigate(['ItemsGroups/SubItemsGroup', { GetAllItemsGroups: () => this.GetAllItemsGroups() }]);

  }

  OpenDetailsForm(id:any, ishidden?){
    let optype ='Show';
    let title = this.translateService.instant('ItemsGroupForm');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ItemsGroupFormComponent, {
      width: '1250px',
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, id: id, ishidden,optype:optype, action: 'Show', GetAllItemsGroups: () => { this.GetAllItemsGroups() } }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  DeleteItemsGroup(id) {
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
        debugger
        this.itemsGroupService.DeleteItemsGroups(id).subscribe((results) => {
          debugger
          if (results === true) {
            this.alert.DeleteSuccess();
            this.GetAllItemsGroups();
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }}
          else {
            this.alert.ShowAlert('msgRecordHasLinks','error')
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
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

exportExcel() {
  import("xlsx").then(xlsx => {
    // Assuming you want to reverse columns based on the same logic
    let processedCols = this.cols;
    var currentLang = this.jwtAuth.getLang();
    if(currentLang == "ar"){
      processedCols = [...this.cols].reverse();
    }

    // Prepare the data using the same method as PDF export
    const data = this.prepareDataForExport(processedCols);

    // Format data for Excel export (each row should be an object)
    const excelData = data.map(row => {
      const rowData: any = {};
      processedCols.forEach((col, index) => {
        rowData[col.header] = row[index];
      });
      return rowData;
    });

    // Convert to Excel worksheet
    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(excelBuffer, "ItemsGroup");
  }).catch(error => {
    console.error("Error importing xlsx module:", error);
  });
}

saveAsExcelFile(buffer: any, fileName: string): void {
  let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  let EXCEL_EXTENSION = '.xlsx';
  const data: Blob = new Blob([buffer], {
    type: EXCEL_TYPE
  });
  FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
}

exportToPDF() {
  const doc = new jsPDF();
  doc.setHeaderFunction
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.setFont("Amiri"); // set font For Title
  doc.setFontSize(14);  // set font Size  For Title

  let Title;
  var currentLang = this.jwtAuth.getLang();
  if(currentLang == "ar"){
    Title = "مجموعات المواد";
    var head = [[' نشط',' خصم ','الضريبة',' الفئه',' المجموعة الرئيسيه',' اسم المجموعة',' رقم المجموعة']];
  }
  else{
    Title = "Items Groups";
    var head = [['Active','Discount','Tax','Category',' Main Collection','Collection Name','Collection Number']];
  }

  let pageWidth = doc.internal.pageSize.width;
  doc.text(Title, pageWidth / 2, 8, {align: 'center'});
  let processedCols = this.cols;
  if (currentLang == "ar") {
    processedCols = [...this.cols].reverse(); // Reverse the columns
  }
  // Prepare the data
  const data = this.prepareDataForExport(processedCols);

  // Add autoTable to jsPDF
  autoTable(doc, {
    head: head, // Table headers
    body:  data,
    headStyles: {font: "Amiri" , halign: 'center' ,fontSize: 8 ,fontStyle:'bold' ,textColor: "black", lineWidth: 0.2 ,minCellWidth:20},
    bodyStyles: {font: "Amiri" , halign: 'center' ,fontSize: 8 ,fontStyle:'bold'},
  });

  // Save the PDF
  doc.save('ItemsGroup.pdf');
}

prepareDataForExport(columns): any[] {
  const exportData = [];
  this.treeTable.value.forEach(node => {
    this.extractNodeData(node, exportData, columns);
  });
  return exportData;
}

extractNodeData(node, exportData, columns) {
  const row = columns.map(col => node.data[col.field] || '');
  exportData.push(row);

  if (node.children && node.children.length > 0) {
    node.children.forEach(childNode => {
      this.extractNodeData(childNode, exportData, columns);
    });
  }
}
}

