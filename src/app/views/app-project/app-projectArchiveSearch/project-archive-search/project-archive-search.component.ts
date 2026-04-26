import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { sweetalert } from 'sweetalert';
import { formatDate } from '@angular/common';

interface entryVData {
  voucherType: any;
  voucherNo: any;
  docClassification: any;
  docName: any;
  authorityId: any;
  departmentId: any;
  fromDate:any;
  toDate:any;
  docName2: any;
  docNo:any;
  importanceId : any ;
  otherNo : any
  senderDocNo : any ;
  fileArchivingNumber : any ;
  serialNo : any ;
  empId:any;
}

@Component({
  selector: 'app-project-archive-search',
  templateUrl: './project-archive-search.component.html',
  styleUrl: './project-archive-search.component.scss'
})
export class ProjectArchiveSearchComponent {
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  @Input() VauthoritiesList: any;
  @Input() VemployeesList: any;
  @Input() VdocumentClassificationList: any;
  @Input() VvoucherType: any;
  @Input() VdepartmentsList: any;
  @Input() VvoucherNo: string;
  @Input() VdocName: string;
  @Input() vfromDate : Date; 
  @Input() vtoDate : Date; 
  @Input() VdocName2: string;
  @Input() VimportanceDegreeList:any;
  @Input() VotherNo: string;
  loading: boolean;
  showLoader: boolean;
  searchCriteria: entryVData;
  data: any;
  employeesList: any;
  departmentList:any;
  documentClassificationList: any;
  authoritiesList: any[] = [];
  totalAuthorities: number = 0;
  pageSize: number = 50;
  importanceDegreeList:any;
  constructor(
        private formbulider: FormBuilder,
        private http: HttpClient,
        private jwtAuth: JwtAuthService,
        private alert: sweetalert) { }

  ngOnInit(): void {
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.authoritiesList = this.VauthoritiesList;
    this.employeesList = this.VemployeesList;
    this.documentClassificationList = this.VdocumentClassificationList;
    this.importanceDegreeList = this.VimportanceDegreeList;
    this.departmentList = this.VdepartmentsList;
    const today = new Date();
    this.searchCriteria = {
      voucherType: -1,
      voucherNo: '',
      docClassification:0,
      docName: '',
      authorityId:  [],  
      departmentId: 0,
      importanceId:0 ,
      empId:0,
      fromDate: this.vfromDate ? formatDate(this.vfromDate, "yyyy-MM-dd", "en-US") : formatDate(today, "yyyy-MM-dd", "en-US"),
      toDate: this.vtoDate ? formatDate(this.vtoDate, "yyyy-MM-dd", "en-US") : formatDate(today, "yyyy-MM-dd", "en-US"),
      docName2: '',
      docNo:'',
      otherNo : '',
      senderDocNo : '' ,
      fileArchivingNumber : '' ,
      serialNo : ''
    };
  }

  getData() {
    debugger
    if(this.searchCriteria.docNo == '')
    {
      this.searchCriteria.docNo = null;
    }
    if(this.searchCriteria.voucherNo == '')
    {
      this.searchCriteria.voucherNo = null;
    }
    if(this.searchCriteria.docName == '')
    {
      this.searchCriteria.docName = null;
    }
    if(this.searchCriteria.docName2 == '')
    {
      this.searchCriteria.docName2 = null;
    }
    if(this.searchCriteria.authorityId == '')
    {
      this.searchCriteria.authorityId = null;
    }
   if(this.searchCriteria.otherNo == '')
    {
      this.searchCriteria.otherNo = null;
    }
    if(this.searchCriteria.senderDocNo == '')
    {
      this.searchCriteria.senderDocNo = null;
    }
    if(this.searchCriteria.fileArchivingNumber == '')
    {
      this.searchCriteria.fileArchivingNumber = null;
    }
    if(this.searchCriteria.serialNo == '')
    {
      this.searchCriteria.serialNo = null;
    }
     if(this.searchCriteria.empId == '')
    {
      this.searchCriteria.empId = null;
    }
    this.showLoader = true;
    this.GetProjectArchiveSearchList(this.searchCriteria).subscribe(result => {
      debugger
      this.data = result;
      this.searchResultEvent.emit(result);
      this.showLoader = false;
    },
      (error) => {
        console.error('Error occurred:', error);
        this.showLoader = false;
      });
  }

  public GetProjectArchiveSearchList(searchCriteria): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    const url = `${environment.apiURL_Main}/api/ProjectArchive/GetProjectArchiveSearchList/${this.jwtAuth.getLang()}/${this.jwtAuth.getCompanyId()}/${this.jwtAuth.getUserId()}`;
    return this.http.post<any>(url, JSON.stringify(searchCriteria), httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  GetMainData() {
    debugger
    this.showLoader = true;
    this.GetProjectArchiveList().subscribe(result => {
      debugger
      this.data = result;
      this.searchResultEvent.emit(result);
      this.showLoader = false;
    },
    (error) => {
      console.error('Error occurred:', error);
      this.showLoader = false;
    }) 
  }

   public GetProjectArchiveList(): Observable<any> {    
    return this.http.get(`${environment.apiURL_Main + '/api/ProjectArchive/GetProjectArchiveList/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
    .pipe(
      catchError(this.handleError)
    )
  }

  EmptySearch() {
    debugger
    this.searchCriteria.voucherType = -1;
    this.searchCriteria.docNo = '';
    this.searchCriteria.otherNo = '';
    this.searchCriteria.senderDocNo = '' ;
    this.searchCriteria.fileArchivingNumber
    this.searchCriteria.serialNo = '' ;
    this.searchCriteria.voucherNo = '';
    this.searchCriteria.docClassification = 0;
    this.searchCriteria.docName = '';
    this.searchCriteria.docName2 = '';
    this.searchCriteria.authorityId =  [],  
    this.searchCriteria.departmentId = 0;
    this.searchCriteria.importanceId = 0;
    this.searchCriteria.empId = 0;
    this.GetSearchFormValues();
    this.GetMainData();
  }

  private handleError(error: HttpErrorResponse) {
    debugger
    if (error.error instanceof ErrorEvent) {
      console.log(error.error.message);
    } else {
      console.log(error.status);
    }
    return throwError(
      console.log('Something is wrong!')
    );
  }
   AuthloadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.authoritiesList) {
      this.authoritiesList = [];
    }

    // Make sure the array is large enough
    while (this.authoritiesList.length < last) {
      this.authoritiesList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.authoritiesList[i] = this.authoritiesList[i];
    }

    this.loading = false;
  }

  loadLazyOptions(event: any) {
      const { first, last } = event;

      // Don't replace the full list; copy and fill only the needed range
      this.authoritiesList ??= [];

      // Make sure the array is large enough
      while (this.authoritiesList.length < last) {
          this.authoritiesList.push(null);
      }

      for (let i = first; i < last; i++) {
          this.authoritiesList[i] = this.authoritiesList[i];
      }

      this.loading = false;
    }

SelectAllAuthority(event: any) {
  const selectedValues: number[] = Array.isArray(event?.value)
    ? event.value.map((x: any) => Number(x))
    : [];

  const hasSelectAll = selectedValues.includes(0);

  const allIds = (this.authoritiesList ?? [])
    .filter((el: any) => el && Number(el.id) !== 0)  
    .map((el: any) => Number(el.id));

  let next: number[];

  if (hasSelectAll) {
    const without0 = selectedValues.filter(x => x !== 0);
    next = (without0.length !== allIds.length) ? allIds : [];
  } else {
    next = selectedValues.filter(x => x !== 0);
  }
  this.searchCriteria.authorityId = next;
}

}
