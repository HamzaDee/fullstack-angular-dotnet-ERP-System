import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DataTableService } from 'app/shared/services/datatable.service';
import { UplodeFileService } from 'app/shared/services/upload-file.service';
import { UplodeFileModel } from 'app/shared/models/UplodeFileModel'
import * as FileSaver from 'file-saver';
import { Router } from '@angular/router';



@Component({
  selector: 'app-app-general-attachment',
  templateUrl: './app-general-attachment.component.html',
  styleUrls: ['./app-general-attachment.component.scss']
})
export class AppGeneralAttachmentComponent implements OnInit {
  @Input() voucherId: any;

  public data: Array<UplodeFileModel> = new Array<UplodeFileModel>();

  exportData: any[];

  constructor(
    // private dialysisService: dialysisService,
    private datatableService: DataTableService,
    private uplodeFileService: UplodeFileService,
    // private patientService : PatientService,
    private router: Router,
    
  ) { }

  ngOnInit(): void {
    this.data.forEach(item => item.url = this.uplodeFileService.convertBase64ToFile(item.base64, item.docType))
    this.refreshVoucherAttachTable(this.data);
  }
  refreshVoucherAttachTable(data) {
    this.exportData = this.data.map(x => ({
      'اسم الملف': x.docName,
      'نوع الملف': x.docExt,
    }));
  }

  onFileSelected(event) {
    
    const file: File = event.target.files[0];
    debugger
    if (file) {
      const Object = new UplodeFileModel();
      Object.fullName = file.name;
      Object.docName = file.name.split('.').slice(0, -1).join('.');
      Object.docExt = file.name.split('.').pop();
      Object.url = this.uplodeFileService.convertFileToSafeUrl(event.target.files, event.target.files[0].type)
      Object.docType = file.type //need this to display the file after save
      //Object.docExt = file.type;
      this.uplodeFileService.convertFileToBase64(event.target.files[0]).subscribe(base64 => {
        Object.base64 = base64
      });
      
      this.data.push(Object);
      this.refreshVoucherAttachTable(this.data)
    }
  }

  deleteItem(row: any) {
    debugger
    const index = this.data.indexOf(row);
    this.data.splice(index, 1);
    this.refreshVoucherAttachTable(this.data)
  }
  getVoucherAttachData() {
    if (this.data.length > 0) {
      this.data.forEach(item => { item.docId = this.voucherId });
    }
    return this.data

  }
  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, " Patient Attach", ".xlsx");
    });
  }
  saveAsExcelFile(buffer: any, fileName: string, extension: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = extension;
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE

    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  onCloseClicked() {
    debugger
    
  }
}
