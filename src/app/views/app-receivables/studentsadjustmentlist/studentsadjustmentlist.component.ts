import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ListOfNewStudentsService } from '../ListOfNewStudents/list-of-new-students.service';
import Swal from 'sweetalert2';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-studentsadjustmentlist',
  templateUrl: './studentsadjustmentlist.component.html',
  styleUrl: './studentsadjustmentlist.component.scss'
})
export class StudentsadjustmentlistComponent {
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
  MessageHide:string;
  studentNo: number;
  voucherNote: any;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private egretLoader: AppLoaderService,
    private cdr: ChangeDetectorRef,
    private ListOfNewStudentsService: ListOfNewStudentsService) { }


  ngOnInit(): void {
    let lang = this.jwtAuth.getLang();
    if(lang == 'ar')
      {
        this.MessageHide = "اخفاء السطر "
      }
    else
      {
        this.MessageHide = "Hide Row "
      }
    this.SetTitlePage();
    this.GetListOfStudentAdjustmentForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ListOfNewStudents');
    this.title.setTitle(this.TitlePage);
  }

  GetListOfStudentAdjustmentForm()
  {debugger
    this.ListOfNewStudentsService.GetListOfStudentAdjustmentForm().subscribe(result => {
      debugger
      this.accountsList = result.accountList;
      });
  }
  
  onImportClick(fileInput: HTMLInputElement) {
    debugger
    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
    this.ListOfNewStudentsService.GetListOfStudentAdjustment().subscribe(result => {
        this.StudentList = result;
        this.egretLoader.close();
      });
  }

  UpdateReceipts(){
    this.ListOfNewStudentsService.UpdateReceipts().subscribe(result => {
      debugger
      if(result)
        this.alert.SaveSuccess();
      else
        this.alert.SaveFaild();
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
    // const hasInvalid = selectedStudents.some(s => s.accId <= 0);

    // if (hasInvalid) {
    //   this.alert.ShowAlert("الرجاء تحديد الحساب لكل الطلاب", 'error');
    //   return;
    // } 
    const hasAtLeastOneValid = selectedStudents.some(s => s.accId > 0);

    if (!hasAtLeastOneValid) {
      this.alert.ShowAlert("الرجاء إدخال حساب للطالب الاول على الأقل", 'error');
      return;
    }
    selectedStudents[0].voucherNote = this.voucherNote;
    // استدعاء الخدمة
    this.ListOfNewStudentsService.UpdateStudent(selectedStudents).subscribe((result) => {
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

  onHideRow(accountId: number) 
  {
    debugger;
    if(accountId && accountId !== 0)
    {
      Swal.fire({
      title: this.translateService.instant('AreYouSureYouWantToHideThisRow'),
      icon: 'warning',  
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translateService.instant('Yes'),
      cancelButtonText: this.translateService.instant('No')
    }).then((result) => {
      if (result.isConfirmed) {
       this.ListOfNewStudentsService.HideShowStudent(accountId,0).subscribe(res => {
          debugger;
          if (res.isSuccess) {
            this.StudentList = this.StudentList.filter(item => item.accounts_Tree_ID !== accountId);
            this.alert.ShowAlert(res.message, 'success');
          } else {
            this.alert.ShowAlert(res.message, 'error');
          }
      }
      );}});
    }
  }
  
  UnHideRow(studentNo: number, showAll: number) {
    debugger;
      if(!studentNo)
        studentNo = 0;
      this.ListOfNewStudentsService.HideShowStudent(studentNo,showAll).subscribe(res => {
        debugger;
        if (res.isSuccess) {
          this.alert.ShowAlert(res.message, 'success');
        } else {
          this.alert.ShowAlert(res.message, 'error');
        }
      });
  }
}