import { Component, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ListOfNewStudentsService } from '../list-of-new-students.service';
import Swal from 'sweetalert2';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-list-of-new-students',
  templateUrl: './list-of-new-students.component.html',
  styleUrl: './list-of-new-students.component.scss'
})
export class ListOfNewStudentsComponent {
  showLoader: boolean;
  public loading: boolean;
  DataList: any;
  tabelData: any[];
  screenId: number = 258;
  custom: boolean;
  exportData: any[];
  exportColumns: any[];
  data: any[];
  cols: any[];
  HasPerm: boolean;
  public TitlePage: string;
  Lang: string;
  StudentList: any[] = [];
  accountsList: any[] = [];
  isAnyRowChecked: boolean = false;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private egretLoader: AppLoaderService,
    private cdr: ChangeDetectorRef,
    private ListOfNewStudentsService: ListOfNewStudentsService) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetListOfStudentInfo();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ListOfNewStudents');
    this.title.setTitle(this.TitlePage);
  }


  GetListOfStudentInfo()
  {debugger
    this.ListOfNewStudentsService.GetListOfStudentInfo().subscribe(result => {
      debugger
      this.accountsList = result.accountList;
      });
  }

  
  onImportClick(fileInput: HTMLInputElement) {
    debugger
    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
    this.ListOfNewStudentsService.GetNewStudents().subscribe(result => {
        this.StudentList = result;
        this.egretLoader.close();
      });
  }

  OnSaveForms(student: any) {
    debugger
    var studentId = 0;
    var studentName = "All";
    var totalDebit = 0;
    var accId = 0;
    if(student != 0){
      studentId = student.accounts_Tree_ID;
      studentName = student.full_Name;
      totalDebit = student.netBalanceAfterDiscount;
      accId = student.selectedAccId;
    }
    this.ListOfNewStudentsService.AddStudent(studentId,studentName,totalDebit,accId).subscribe((result) => {
      debugger;
      if (result.isSuccess == true) {
        this.alert.SaveSuccess();
        if(student != 0)
          this.StudentList = this.StudentList.filter(s => s.accounts_Tree_ID !== student.accounts_Tree_ID);
        else
          this.StudentList = null;
        this.cdr.detectChanges();
      } else {
        this.alert.SaveFaild();
      }
    });
  }

  OnSaveAll(student: any) {
    debugger;
    let studentsToSave: any[] = [];

      if (student && student !== 0) {
        // تم الضغط من صف واحد
        studentsToSave = [student];
      } else {
        // تم الضغط على "حفظ المحددين"
        studentsToSave = this.StudentList.filter(s => s.isChecked === true);

        if (studentsToSave.length === 0) {
          this.alert.ShowAlert("الرجاء اختيار الطلاب أولاً", "warning");
          return;
        }
      }
    // اجلب الطلاب الذين تم اختيارهم فقط
    const selectedStudents = this.StudentList.filter(s => s.isChecked === true);

    if (selectedStudents.length === 0) {
      this.alert.ShowAlert("الرجاء اختيار الطلاب أولاً", "warning");
      return;
    }

    // استدعاء الخدمة
    this.ListOfNewStudentsService.AddAllStudent(selectedStudents).subscribe((result) => {
      debugger;
      if (result.isSuccess == true) {
        this.alert.SaveSuccess();

        // احذف من القائمة الطلاب الذين تم حفظهم
        this.StudentList = this.StudentList.filter(s => !s.isChecked);
        this.cdr.detectChanges();
      } else {
        this.alert.SaveFaild();
      }
    });
  }

  toggleAllCheckboxes(event: any, table: any) {
    const isChecked = event.target.checked;

    // إذا كان هناك تصفية حالية، استخدم filteredValue
    const visibleRows = table.filteredValue ? table.filteredValue : table.value;

    visibleRows.forEach((row: any) => (row.isChecked = isChecked));
  }
  updateIsAnyRowChecked() {
    this.isAnyRowChecked = this.StudentList.some((row) => row.isChecked);
  }
}
