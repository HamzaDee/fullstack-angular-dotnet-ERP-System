import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../user.service';
import { ChangeDetectorRef } from '@angular/core';
import { CopyuserpermissinsFormComponent } from '../Copy-user-permissions/copyuserpermissins-form.component';


@Component({
  selector: 'app-user-permissions-form',
  templateUrl: './user-permissions-form.component.html',
  styleUrls: ['./user-permissions-form.component.scss']
})
export class UserPermissionsFormComponent implements OnInit {
  UserPermissionForm:FormGroup;
  showLoader:boolean =false;
  isDisabled:boolean=true;
  ShowCost: number = 0;
  hideCost:boolean;
  public TitlePage: string;
  // lists
  userList:any;
  groupList:any;
  systemList:any;
  loading: boolean;
  majorUserlookupList:any;
  permissionList: any[] = [];
  TempPermissionList: any[] = [];
  userId:number=0;
  constructor
  (
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private UService: UserService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private appCommonserviceService : AppCommonserviceService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    debugger
    this.userId = this.routePartsService.GuidToEdit;
    if (this.userId == null || this.userId == undefined || this.userId === 0) {
      this.router.navigate(['User/UserDefinitionList']);
    }
    this.InitiailEntryVoucherForm();
    this.GetFormDataPermission();
    this.SetTitlePage();
  }

  InitiailEntryVoucherForm() {
    this.UserPermissionForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      userId:[0],
      groupId:[0],
      systemId:[0],
      majorPermission:[''],
      speichalPer:[false],
      showCost:[false],
      newUsersPermissionsList:[null],      
    });
  }
  
SelectAll(event: any) {
  let selectedValues = event.value || [];

  // Check if "اختر" (id = 0) is included
  const hasSelectAll = selectedValues.includes(0);

  if (hasSelectAll) {
    // Toggle all items when "اختر" is clicked (exclude "اختر" itself)
    const allIds = this.majorUserlookupList
      .filter(el => el.id !== 0)
      .map(el => el.id);

    if (selectedValues.length - 1 !== allIds.length) {
      // Not all selected → select all
      this.UserPermissionForm.get("majorPermission")?.setValue(allIds);
    } else {
      // All selected → clear all
      this.UserPermissionForm.get("majorPermission")?.setValue([]);
    }
  } else {
    // Normal selection → remove "اختر" if accidentally added
    const cleaned = selectedValues.filter(id => id !== 0);
    this.UserPermissionForm.get("majorPermission")?.setValue(cleaned);
  }
}



//  SelectAll(event: any) {
//   debugger
//   let selectedValues = event.value || [];

//   // Check if "اختر" (id = 0) is included
//   const hasSelectAll = selectedValues.includes(0);

//   if (hasSelectAll) {
//     // If user tapped "اختر" AND not all selected → select all
//     if (selectedValues.length !== this.majorUserlookupList.length) {
//       const allIds = this.majorUserlookupList.map(el => el.id);
//       this.UserPermissionForm.get("majorPermission")?.setValue(allIds);
//     } 
//     else {
//       // If user tapped "اختر" again while all selected → clear all
//       this.UserPermissionForm.get("majorPermission")?.setValue([]);
//     }
//   }
// }


  GetFormDataPermission()
  {
    this.UService.GetUserPermissionForm(this.userId).subscribe(result => {
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
      if(result)
        {
          debugger
          this.hideCost = result.displayCostSeq;
          this.userList= result.userDefinitionsList;
          this.groupList= result.usersGroupsList;
          this.systemList= result.appScreensList;
          this.permissionList=result.userPermissionList;
          this.TempPermissionList=result.userPermissionList;
          this.majorUserlookupList = result.userLookupPermissionList;
          this.ShowCost =result.showCost;

          this.permissionList.forEach(element => {
            element.userId = this.userId;
            element.groupId = 0;
          });
        }
        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(() => {
        this.UserPermissionForm.get("userId").setValue(result.userId);
        this.UserPermissionForm.get("groupId").setValue(result.groupId);
        this.UserPermissionForm.get("systemId").setValue(result.screenId);
        this.UserPermissionForm.get("showCost").setValue( this.ShowCost);
        this.UserPermissionForm.get("newUsersPermissionsList").setValue(result.userPermissionList);
        let pm = result.majorPermission.split(',').map(Number)
        this.UserPermissionForm.get("majorPermission").setValue(pm);
        })
    }) 
      
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AddUserPermissions');
    this.title.setTitle(this.TitlePage);
  }

  updateOpen(event)
  {
    debugger
    if(event.currentTarget.checked == true)      
      {
        this.permissionList.forEach(permission => {
          permission.open = 1;
          permission.userId = this.UserPermissionForm.value.userId;
        });
      }
      else
      {
        this.permissionList.forEach(permission => {
          permission.open = 0;
        });
      }
      this.cdr.detectChanges();
  }

  updateAdd(event)
  {
    if(event.currentTarget.checked == true)      
      {
        this.permissionList.forEach(permission => {
          permission.add = 2;
          permission.userId = this.UserPermissionForm.value.userId;
        });
      }
      else
      {
        this.permissionList.forEach(permission => {
          permission.add = 0;
        });
      }
      this.cdr.detectChanges();
  }

  updateEdit(event)
  {
    if(event.currentTarget.checked == true)      
      {
        this.permissionList.forEach(permission => {
          permission.edit = 3;
          permission.userId = this.UserPermissionForm.value.userId;
        });
      }
      else
      {
        this.permissionList.forEach(permission => {
          permission.edit = 0;
        });
      }
      this.cdr.detectChanges();
  }

  updateDelete(event)
  {
    if(event.currentTarget.checked == true)      
      {
        this.permissionList.forEach(permission => {
          permission.delete = 4;
          permission.userId = this.UserPermissionForm.value.userId;
        });
      }
      else
      {
        this.permissionList.forEach(permission => {
          permission.delete = 0;
        });
      }
      this.cdr.detectChanges();
  }

  updatePrint(event)
  {
    if(event.currentTarget.checked == true)      
      {
        this.permissionList.forEach(permission => {
          permission.print = 5;
          permission.userId = this.UserPermissionForm.value.userId;
        });
      }
      else
      {
        this.permissionList.forEach(permission => {
          permission.print = 0;
        });
      }
      this.cdr.detectChanges();
  }

  updatePost(event)
  {
    if(event.currentTarget.checked == true)      
      {
        this.permissionList.forEach(permission => {
          permission.post = 181;
          permission.userId = this.UserPermissionForm.value.userId;
        });
      }
      else
      {
        this.permissionList.forEach(permission => {
          permission.post = 0;
        });
      }
      this.cdr.detectChanges();
  }

  updateApprove(event)
  {
    if(event.currentTarget.checked == true)      
      {
        this.permissionList.forEach(permission => {
          permission.approve = 186;
          permission.userId = this.UserPermissionForm.value.userId;
        });
      }
      else
      {
        this.permissionList.forEach(permission => {
          permission.approve = 0;
        });
      }
      this.cdr.detectChanges();
  }

  OnSaveForms()
  {
    debugger
   this.permissionList= this.TempPermissionList;
    this.UserPermissionForm.get("newUsersPermissionsList").setValue(this.permissionList);
    let lookupsPermission = this.UserPermissionForm.value.majorPermission;
    if (Array.isArray(lookupsPermission)) {
      let validPaymentMethods = lookupsPermission
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let paymentMethodsString = validPaymentMethods.join(',');
      this.UserPermissionForm.get("majorPermission").setValue(paymentMethodsString);
      // console.log('Filtered paymentMethod:', paymentMethodsString);
    } else {
      console.error('paymentMethod is not an array');
    }
    this.UService.SaveUserPermissions(this.UserPermissionForm.value).subscribe((result) => {
      if (result== true) {
        this.alert.SaveSuccess();
        this.router.navigate(['User/UserDefinitionList']);
      } else {
        this.alert.SaveFaild();
      }
    });
  }

  SelectALLCheckBox() {
    this.permissionList.forEach(permission => {
      permission.open = 1;
      permission.add = 2;
      permission.edit = 3;
      permission.delete = 4;
      permission.print = 5;
      permission.post = 181;
      permission.approve = 186;
      permission.userId =this.UserPermissionForm.value.userId;
    });
    this.cdr.detectChanges();
    debugger
  }

  DeselectALLCheckBox() {
    this.permissionList.forEach(permission => {
      permission.open = 5;
      permission.add = 4;
      permission.edit = 6;
      permission.delete = 2;
      permission.print = 1;
      permission.post = 7;
      permission.approve = 8;
      permission.userId =this.UserPermissionForm.value.userId;
    });
    this.cdr.detectChanges();
  }

  GetPermissionByUser(userId)
  {
    debugger
    if(userId == 0)
      {
        this.UserPermissionForm.get("groupId").setValue(0);
        this.UserPermissionForm.get("systemId").setValue(0);
        this.permissionList = [];
        return;
      }
    this.UService.GetUserPermissionForm(userId).subscribe(result => {
      if(result)
        {
          debugger
          this.userList= result.userDefinitionsList;
          this.groupList= result.usersGroupsList;
          this.systemList= result.appScreensList;
          this.permissionList=result.userPermissionList;
        }
        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(() => {
        this.UserPermissionForm.get("userId").setValue(result.userId);
        this.UserPermissionForm.get("groupId").setValue(result.groupId);
        this.UserPermissionForm.get("systemId").setValue(result.screenId);
        })
    }) 
  }

  GetPermissionByUserAndScreen(userId,screenId)
  {
    debugger
    if(screenId > 0)
      {
        this.permissionList= this.TempPermissionList;
        this.permissionList= this.permissionList.filter(p => p.userId === userId && p.parentId === screenId);
      }
      else
      {
        this.permissionList= this.TempPermissionList;
      }
  }

  updatePermission(event: any, permission: any, type: string, value: number) {
    debugger
    permission[type] = event.target.checked ? value : 0;
    permission.userId = this.UserPermissionForm.value.userId;
    // permission.actionId = event.target.checked ? value : 0;
  }

  OpenCopyUserPermissionForm() {
    debugger  
    let title = this.translateService.instant('CopyUserPermissions');
    let dialogRef: MatDialogRef<any> = this.dialog.open(CopyuserpermissinsFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title,              
              companyid: this.jwtAuth.getCompanyId(),    
              usersList:this.userList,
              groupsList:this.groupList,
              userId:this.UserPermissionForm.value.userId,
            }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        debugger
    if (res !== null && res !== undefined) {
      res.forEach(permission => {
        let index = this.permissionList.findIndex(p => p.screenId === permission.screenId);
        if (index !== -1) {
          this.permissionList[index].open = permission.open;
          this.permissionList[index].edit = permission.edit;
          this.permissionList[index].add = permission.add;
          this.permissionList[index].delete = permission.delete;
          this.permissionList[index].print = permission.print;
          this.permissionList[index].post = permission.post;
          this.permissionList[index].approve = permission.approve;
          this.permissionList[index].userId = this.UserPermissionForm.value.userId;
        }
      });
      this.UserPermissionForm.get("newUsersPermissionsList").setValue(this.permissionList);
    }
  });
  }

  onShowCostChange(event): void {
  debugger
  if(event.target.checked)
    {
      this.ShowCost = 1;
    }
  else
    {
      this.ShowCost = 0;
    }
    this.UserPermissionForm.get("showCost").setValue( this.ShowCost);
  }

   GetPermissionByUserAndGroup(userId, groupId)
  {
    debugger
    if(userId == 0 && groupId == 0)
      {
        this.UserPermissionForm.get("systemId").setValue(0);
        this.permissionList = [];
        return;
      }
    this.UService.GetPermissionsListByUserAndGroup(userId, groupId).subscribe(result => {
      if(result)
        {
          debugger
          this.permissionList=result
        }
    
    }) 
  }

}
