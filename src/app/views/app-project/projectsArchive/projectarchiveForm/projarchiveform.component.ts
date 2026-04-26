import { Component, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute,  Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import Swal from 'sweetalert2';
import { ProjectArchiveService } from '../projectarchive.service';

@Component({
  selector: 'app-projarchiveform',
  templateUrl: './projarchiveform.component.html',
  styleUrl: './projarchiveform.component.scss'
})
export class ProjarchiveformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;  
  ProjectPlansForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  opType: string; 
  voucherId: any;
  isdisabled: boolean = false;
  showLoader = false;
  decimalPlaces: number;
  disableAll:boolean;   
  disableSave:boolean;
  lang:string ;
  NewDate:any;
  showsave:boolean;
  customInvoicesList: any[] = [];
  selectedRadioValue:number = 1;
  documentClassificationList:any;
  authoritiesList:any;
  importanceDegreeList:any;
  employeesList:any;
  managmentList:any;
  disableRadio:boolean;
  oldVoucher:any;
  //Control Labels
  VoucherNoType:any;
  VoucherDateType:any;
  VoucherAuthorityType:any;
  showUsers: boolean;
  userList: any;

  constructor
    (
      private readonly title: Title,
      private readonly jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private Service: ProjectArchiveService,
      private cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    debugger
    this.disableSave = false;
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
      this.voucherId = queryParams.get('GuidToEdit');
      this.opType = 'Show';
      this.showsave = true;
    }
    else {
      this.voucherId = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
      this.showsave = this.routePartsService.Guid3ToEdit;
    }
    if (this.route.snapshot.queryParamMap.has('opType')) {
      this.opType = this.route.snapshot.queryParamMap.get('opType');
      this.voucherId = 0;
    }
    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['ProjectArchive/ProjectArchiveList']);
    }
    this.InitiailProjectArchiveForm();
    this.GetInitailProjectArchive();
    setTimeout(() => {
      if (this.opType == "Show") 
        {
          this.disableAll = true;         
        }
      else if (this.opType == "Edit")
        {
          this.disableRadio = true;
          this.disableAll = false;
        }
        else
        {
          this.disableAll = false;
        }
    });
  }

  SetTitlePage() {
      this.TitlePage = this.translateService.instant('ProjectArchiveForm');
      this.title.setTitle(this.TitlePage);
  }

  InitiailProjectArchiveForm() {
    this.ProjectPlansForm = this.formbulider.group({
      id: [0],
      companyId: [0],      
      voucherType :[0,[Validators.required]],
      voucherNo:["",[Validators.required]],
      docClassification:[0,[Validators.required, Validators.min(1)]],
      docNo:["",[Validators.required]],
      docName:[""],
      docName2:[""],
      voucherDate:["",[Validators.required]],
      otherNo:[""],
      senderDocNo:[""],
      senderDocDate:[""],
      notes:[""],
      serialNo:[""],
      authorityId:[""],  
      importanceId: [0],  
      departmentId: [""],  
      hasPermission: [false],
      userIds: [""],
      fileArchivingNumber:[""],
      addDate:[""],
      editDate:[""],
      empId:[""],
      generalAttachModelList: [null],
    });
  }

  GetInitailProjectArchive() {
    this.Service.GetInitailProjectArchive(this.voucherId,this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ProjectArchive/ProjectArchiveList']);
        return;
      }
      debugger
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US");
      result.senderDocDate = formatDate(result.senderDocDate, "yyyy-MM-dd", "en-US");

      result.addDate = formatDate(result.addDate, "yyyy-MM-dd", "en-US");
      result.editDate = formatDate(result.editDate, "yyyy-MM-dd", "en-US");
      this.oldVoucher =  result.voucherNo;
      this.documentClassificationList = result.documentClassificationList;
      this.authoritiesList = result.authoritiesList;
      this.importanceDegreeList = result.importanceDegreeList;
      this.employeesList = result.employeesList;
      this.userList = result.userList;
      this.managmentList = result.mangementsList;
      if(result.generalAttachModelList != null && result.generalAttachModelList != undefined)
        {
          if(result.generalAttachModelList.length > 0)
            {              
              this.childAttachment.data = result.generalAttachModelList;
              this.childAttachment.ngOnInit();
              this.ProjectPlansForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
            }
        }       
        
      this.ProjectPlansForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {
            this.ProjectPlansForm.get("voucherType").setValue(result.voucherType);
            this.ProjectPlansForm.get("voucherNo").setValue(result.voucherNo);
            this.ProjectPlansForm.get("docClassification").setValue(result.docClassification);
            this.ProjectPlansForm.get("docNo").setValue(result.docNo);
            this.ProjectPlansForm.get("docName").setValue(result.docName);
            this.ProjectPlansForm.get("docName2").setValue(result.docName2);
            this.ProjectPlansForm.get("voucherDate").setValue(result.voucherDate);
            this.ProjectPlansForm.get("otherNo").setValue(result.otherNo);
            this.ProjectPlansForm.get("senderDocNo").setValue(result.senderDocNo);
            this.ProjectPlansForm.get("senderDocNo").setValue(result.senderDocNo);
            this.ProjectPlansForm.get("senderDocDate").setValue(result.senderDocDate);
            this.ProjectPlansForm.get("notes").setValue(result.notes);
            this.ProjectPlansForm.get("serialNo").setValue(result.serialNo);
            this.ProjectPlansForm.get("authorityId").setValue(result.authorityId);
            this.ProjectPlansForm.get("importanceId").setValue(result.importanceId);
            this.ProjectPlansForm.get("departmentId").setValue(result.departmentId);   
            this.ProjectPlansForm.get("userIds").setValue( result.userIds ? result.userIds.split(',').map(x => +x) : []);
            this.ProjectPlansForm.get("addDate").setValue(result.addDate);
            this.ProjectPlansForm.get("editDate").setValue(result.editDate);
            if(result.voucherType == 1)
              {
                  this.VoucherNoType = "IncomingNo";
                  this.VoucherDateType = "IncomingDate";
                  this.VoucherAuthorityType = "IncomingAuthority";
              } 
              else
              {
                  this.VoucherNoType = "OutgoingNo";
                  this.VoucherDateType = "OutgoingDate";
                  this.VoucherAuthorityType = "OutgoingAuthority";
              }     
            this.ConvertIdsToNumber(result);                     
        }
        else {
            this.ProjectPlansForm.get("voucherType").setValue(1);
            this.ProjectPlansForm.get("voucherNo").setValue("");
            this.ProjectPlansForm.get("docClassification").setValue(0);
            this.ProjectPlansForm.get("docNo").setValue("");
            this.ProjectPlansForm.get("docName").setValue("");
            this.ProjectPlansForm.get("docName2").setValue("");
            this.ProjectPlansForm.get("voucherDate").setValue(result.voucherDate);
            this.ProjectPlansForm.get("otherNo").setValue("");
            this.ProjectPlansForm.get("senderDocNo").setValue("");
            this.ProjectPlansForm.get("senderDocNo").setValue("");
            this.ProjectPlansForm.get("senderDocDate").setValue(result.senderDocDate);
            this.ProjectPlansForm.get("notes").setValue("");
            this.ProjectPlansForm.get("serialNo").setValue("");
            this.ProjectPlansForm.get("authorityId").setValue("");
            this.ProjectPlansForm.get("importanceId").setValue(0);
            this.ProjectPlansForm.get("departmentId").setValue(0);
            this.VoucherNoType = "IncomingNo";
            this.VoucherDateType = "IncomingDate";
            this.VoucherAuthorityType = "IncomingAuthority";          
        }        
      });
    })
  }

  OnSaveForms() {
    debugger
    // if (this.CheckValidationOnSave() == false) {
    //   return;
    // }
    debugger
    this.ProjectPlansForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ProjectPlansForm.value.userId = this.jwtAuth.getUserId();
    this.ProjectPlansForm.get("generalAttachModelList").setValue(this.childAttachment.getVoucherAttachData());
    this.ConvertIdsToString();
    this.ProjectPlansForm.value.userIds = (this.ProjectPlansForm.value.userIds || []).join(',');
    this.Service.SaveProjectsArchive(this.ProjectPlansForm.value)
      .subscribe((result) => {
        debugger
        
        if (result) {
          this.alert.SaveSuccess();
          this.disableSave = false;
          if(this.opType == 'Edit')
            {
              this.router.navigate(['ProjectArchive/ProjectArchiveList']);
            }
          this.clearFormdata();
          
            this.voucherId = 0;
            this.opType = 'Add'; 
            this.ngOnInit();
        }
        else {
          this.alert.SaveFaild();
        }
      })
  }

  clearFormdata()
  {   
    this.NewDate = new Date;    
    this.ProjectPlansForm.get("id").setValue(0);       
    this.ProjectPlansForm.get("voucherType").setValue(1);
    this.ProjectPlansForm.get("docClassification").setValue(0);
      this.ProjectPlansForm.get("voucherNo").setValue("");
    this.ProjectPlansForm.get("docNo").setValue("");
    this.ProjectPlansForm.get("docName").setValue("");
    this.ProjectPlansForm.get("docName2").setValue("");
    this.ProjectPlansForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ProjectPlansForm.get("otherNo").setValue("");
    this.ProjectPlansForm.get("senderDocNo").setValue("");
    this.ProjectPlansForm.get("senderDocNo").setValue("");
    this.ProjectPlansForm.get("senderDocDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ProjectPlansForm.get("notes").setValue("");
    this.ProjectPlansForm.get("serialNo").setValue("");
    this.ProjectPlansForm.get("authorityId").setValue("");
    this.ProjectPlansForm.get("importanceId").setValue(0);
    this.ProjectPlansForm.get("departmentId").setValue(0);
    this.ProjectPlansForm.get("generalAttachModelList").setValue([]);     
    this.childAttachment.data =[];  
    this.voucherId = 0;
    this.opType = 'Add';
    this.GetInitailProjectArchive();      
  }

  ConvertIdsToString()
  {    
    debugger
    let C1 = this.ProjectPlansForm.value.authorityId;
    if (Array.isArray(C1)) {
      let validC1 = C1
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let C1String = validC1.join(',');
      this.ProjectPlansForm.get("authorityId").setValue(C1String);
      console.log('Filtered paymentMethod:', C1String);
    } else {
      console.error('authorityId is not an array');
    }  

    let C2 = this.ProjectPlansForm.value.empId;
    if (Array.isArray(C2)) {
      let validC2 = C2
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let C2String = validC2.join(',');
      this.ProjectPlansForm.get("empId").setValue(C2String);
      console.log('Filtered paymentMethod:', C2String);
    } else {
      console.error('empId is not an array');
    }  


        let C3 = this.ProjectPlansForm.value.departmentId;
    if (Array.isArray(C3)) {
      let validC3 = C3
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let C3String = validC3.join(',');
      this.ProjectPlansForm.get("departmentId").setValue(C3String);
      console.log('Filtered paymentMethod:', C3String);
    } else {
      console.error('departmentId is not an array');
    } 
  }

  ConvertIdsToNumber(data)
  {
    debugger
    if(data.authorityId != null && data.authorityId != undefined && data.authorityId != "" && data.authorityId != "0")
      {
        let A1 = data.authorityId.split(',').map(Number)
        this.ProjectPlansForm.get("authorityId").setValue(A1);
      }
      else
      {
        this.ProjectPlansForm.get("authorityId").setValue("");
      }   

    if(data.empId != null && data.empId != undefined && data.empId != "" && data.empId != "0")
      {
        let A2 = data.empId.split(',').map(Number)
        this.ProjectPlansForm.get("empId").setValue(A2);
      }
      else
      {
        this.ProjectPlansForm.get("empId").setValue("");
      }   

          if(data.departmentId != null && data.departmentId != undefined && data.departmentId != "" && data.departmentId != "0")
      {
        let A3 = data.departmentId.split(',').map(Number)
        this.ProjectPlansForm.get("departmentId").setValue(A3);
      }
      else
      {
        this.ProjectPlansForm.get("departmentId").setValue("");
      }   
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  DeleteVoucher(id: any) {
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
        this.Service.DeleteProjectsArchive(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['ProjectArchive/ProjectArchiveList']);
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
        // No action needed if the user cancels
      }
    })      
  } 

  onRadioChange(value: number) {
    this.ProjectPlansForm.get("voucherNo").setValue('');
    debugger
    if (value == 1) {
        this.voucherId = 0;
        this.opType = "Add";   
        this.NewDate = new Date;    
        this.ProjectPlansForm.get("id").setValue(0);            
        this.ProjectPlansForm.get("docClassification").setValue(0);
        this.ProjectPlansForm.get("docNo").setValue("");
        this.ProjectPlansForm.get("docName").setValue("");
        this.ProjectPlansForm.get("docName2").setValue("");
        this.ProjectPlansForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
        this.ProjectPlansForm.get("otherNo").setValue("");
        this.ProjectPlansForm.get("senderDocNo").setValue("");
        this.ProjectPlansForm.get("senderDocNo").setValue("");
        this.ProjectPlansForm.get("senderDocDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
        this.ProjectPlansForm.get("notes").setValue("");
        this.ProjectPlansForm.get("serialNo").setValue("");
        this.ProjectPlansForm.get("authorityId").setValue("");
        this.ProjectPlansForm.get("importanceId").setValue(0);
        this.ProjectPlansForm.get("departmentId").setValue(0);
        this.ProjectPlansForm.get("generalAttachModelList").setValue([]);     
        this.childAttachment.data =[];
        this.VoucherNoType = "IncomingNo";
        this.VoucherDateType = "IncomingDate";
        this.VoucherAuthorityType = "IncomingAuthority";
        //this.getVoucherNo(value);      
    }
    else {
        this.voucherId = 0;
        this.opType = "Add";   
        this.NewDate = new Date;    
        this.ProjectPlansForm.get("id").setValue(0);             
        this.ProjectPlansForm.get("docClassification").setValue(0);
        this.ProjectPlansForm.get("docNo").setValue("");
        this.ProjectPlansForm.get("docName").setValue("");
        this.ProjectPlansForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
        this.ProjectPlansForm.get("otherNo").setValue("");
        this.ProjectPlansForm.get("senderDocNo").setValue("");
        this.ProjectPlansForm.get("senderDocNo").setValue("");
        this.ProjectPlansForm.get("senderDocDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
        this.ProjectPlansForm.get("notes").setValue("");
        this.ProjectPlansForm.get("serialNo").setValue("");
        this.ProjectPlansForm.get("authorityId").setValue("");
        this.ProjectPlansForm.get("importanceId").setValue(0);
        this.ProjectPlansForm.get("departmentId").setValue(0);
        this.ProjectPlansForm.get("generalAttachModelList").setValue([]);     
        this.childAttachment.data =[];
        this.VoucherNoType = "OutgoingNo";
        this.VoucherDateType = "OutgoingDate";
        this.VoucherAuthorityType = "OutgoingAuthority";
        //this.getVoucherNo(value);
      
    }
  }

  getVoucherNo(type:any) {
    debugger
    this.Service.GetVoucherNo(type).subscribe((results) => {
      if (results) {
        this.ProjectPlansForm.get("voucherNo").setValue(results);
      }
      else {
        this.ProjectPlansForm.get("voucherNo").setValue(1);
      }
    });
  }

   CheckIfVoucherExist(event:any,type:any,Id :any) {
    debugger
    const year = new Date(this.ProjectPlansForm.get("voucherDate")?.value).getFullYear();

    this.Service.CheckIfVoucherExist(type,event,Id,year).subscribe((res) => {
      debugger
      if (res > 0) {
        this.voucherId = res;
        this.opType = "Edit";
        this.GetInitailProjectArchive();
      }  
      else
      {
        this.voucherId = 0;
        this.opType = "Add";   
        this.NewDate = new Date;    
        this.ProjectPlansForm.get("id").setValue(0);       
       // this.ProjectPlansForm.get("voucherType").setValue(1);      
        this.ProjectPlansForm.get("docClassification").setValue(0);
        this.ProjectPlansForm.get("docNo").setValue("");
        this.ProjectPlansForm.get("docName").setValue("");
        this.ProjectPlansForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
        this.ProjectPlansForm.get("otherNo").setValue("");
        this.ProjectPlansForm.get("senderDocNo").setValue("");
        this.ProjectPlansForm.get("senderDocNo").setValue("");
        this.ProjectPlansForm.get("senderDocDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
        this.ProjectPlansForm.get("notes").setValue("");
        this.ProjectPlansForm.get("serialNo").setValue("");
        this.ProjectPlansForm.get("authorityId").setValue("");
        this.ProjectPlansForm.get("importanceId").setValue(0);
        this.ProjectPlansForm.get("departmentId").setValue(0);
        this.ProjectPlansForm.get("generalAttachModelList").setValue([]);     
        this.childAttachment.data =[];
        this.ProjectPlansForm.get("voucherNo").setValue(event);
      }    
    });
  }

  GetDocName(event:any)
  {
    debugger
    let val = event?.value ?? 0;
    let itemno= this.documentClassificationList.find(r => r.id == val)?.data2 ?? 0;
    let dateStr = this.ProjectPlansForm.value.voucherDate;
    let year = new Date(dateStr).getFullYear();
    let voucherNo = this.ProjectPlansForm.value.voucherNo;
    let docno = " هـ/أ" + " / " +itemno + " / " + year + " / " + voucherNo
    this.ProjectPlansForm.get("docNo").setValue(docno);
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
  let selectedValues = event.value || [];
  const hasSelectAll = selectedValues.includes(0);

  if (hasSelectAll) {
    const allIds = this.authoritiesList
      .filter(el => el.id !== 0)
      .map(el => el.id);

    if (selectedValues.length - 1 !== allIds.length) {
      this.ProjectPlansForm.get("authorityId")?.setValue(allIds);
    } else {
      this.ProjectPlansForm.get("authorityId")?.setValue([]);
    }
  } else {
    const cleaned = selectedValues.filter(id => id !== 0);
    this.ProjectPlansForm.get("authorityId")?.setValue(cleaned);
  }
}

get serialNoLabelKey(): string {
  return this.selectedRadioValue === 1 ? 'IncomingNo' : 'OutgoingNo';
}


loadLazyOptionsEmp(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    this.employeesList ??= [];

    // Make sure the array is large enough
    while (this.employeesList.length < last) {
        this.employeesList.push(null);
    }

    for (let i = first; i < last; i++) {
        this.employeesList[i] = this.employeesList[i];
    }

    this.loading = false;
  }
  SelectAllDeparts(event: any){
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);

    if (hasSelectAll) {
      const allIds = this.managmentList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 === allIds.length) {
        this.ProjectPlansForm.get("departmentId")?.setValue([]);
      } else {
        this.ProjectPlansForm.get("departmentId")?.setValue(allIds);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectPlansForm.get("departmentId")?.setValue(cleaned);
    }
  }


  SelectAllEmployees(event: any) {
  let selectedValues = event.value || [];
  const hasSelectAll = selectedValues.includes(0);

  if (hasSelectAll) {
    const allIds = this.employeesList
      .filter(el => el.id !== 0)
      .map(el => el.id);

    if (selectedValues.length - 1 === allIds.length) {
      this.ProjectPlansForm.get("empId")?.setValue([]);
    } else {
      this.ProjectPlansForm.get("empId")?.setValue(allIds);
    }
  } else {
    const cleaned = selectedValues.filter(id => id !== 0);
    this.ProjectPlansForm.get("empId")?.setValue(cleaned);
  }
}

}
