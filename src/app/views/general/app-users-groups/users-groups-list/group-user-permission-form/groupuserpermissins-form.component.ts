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
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from 'app/views/general/app-user/user.service';
import { CopyuserpermissinsFormComponent } from 'app/views/general/app-user/user-list/Copy-user-permissions/copyuserpermissins-form.component';
import { UsersGroupsService } from '../../users-groups.service';

@Component({
  selector: 'app-groupuserpermissins-form',
  templateUrl: './groupuserpermissins-form.component.html',
  styleUrls: ['./groupuserpermissins-form.component.scss']
})
export class GroupuserpermissinsFormComponent implements OnInit {
  UserGroupPermissionForm:FormGroup;
  showLoader:boolean =false;
  isDisabled:boolean=true;
  public TitlePage: string;
  userList:any;
  groupList:any;
  systemList:any;
  loading: boolean;
  permissionList: any[] = [];
  groupId:number=0;
  TempPermissionList: any[] = [];
  constructor
  (
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private UService: UserService,
    private groupService:UsersGroupsService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private appCommonserviceService : AppCommonserviceService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void 
  {
    debugger
    this.groupId = this.routePartsService.GuidToEdit;
    this.InitiailUserGroupForm();
    this.GetFormDataPermission();
    this.SetTitlePage();
  }



  InitiailUserGroupForm() {
    this.UserGroupPermissionForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      userId:[0],
      groupId:[0],
      systemId:[0],
      speichalPer:[false],
      newGroupsPermissionsList:[null],
    });
  }

  GetFormDataPermission()
  {
    debugger
    this.groupService.GetUserGroupPermissionForm(this.groupId).subscribe(result => {
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
      if(result)
        {
          debugger
          this.userList= result.userDefinitionsList;
          this.groupList= result.usersGroupsList;
          this.systemList= result.appScreensList;
          this.permissionList=result.groupPermissionsList;
          this.TempPermissionList=result.groupPermissionsList;
          this.permissionList.forEach(element => {
            element.groupId = this.groupId;
          });
        }
        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(() => {
        this.UserGroupPermissionForm.get("userId").setValue(result.userId);
        this.UserGroupPermissionForm.get("groupId").setValue(result.groupId);
        if(this.UserGroupPermissionForm.value.groupId == 0 || this.UserGroupPermissionForm.value.groupId == null || this.UserGroupPermissionForm.value.groupId == undefined)
          {
            this.permissionList = [];
          }
        this.UserGroupPermissionForm.get("systemId").setValue(result.screenId);
        this.UserGroupPermissionForm.get("newGroupsPermissionsList").setValue(result.groupPermissionsList);
        })
    }) 
      
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AddGroupPermissions');
    this.title.setTitle(this.TitlePage);
  }

  updateOpen(event)
  {
    debugger
    if(event.currentTarget.checked == true)      
      {
        this.permissionList.forEach(permission => {
          permission.open = 1;
          permission.userId = this.UserGroupPermissionForm.value.userId;
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
          permission.userId = this.UserGroupPermissionForm.value.userId;
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
          permission.userId = this.UserGroupPermissionForm.value.userId;
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
          permission.userId = this.UserGroupPermissionForm.value.userId;
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
          permission.userId = this.UserGroupPermissionForm.value.userId;
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
          permission.userId = this.UserGroupPermissionForm.value.userId;
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
          permission.userId = this.UserGroupPermissionForm.value.userId;
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
   this.permissionList = this.TempPermissionList;
    this.UserGroupPermissionForm.get("newGroupsPermissionsList").setValue(this.permissionList);
    this.groupService.SaveGroupPermissions(this.UserGroupPermissionForm.value).subscribe((result) => {
      if (result== true) {
        this.alert.SaveSuccess();
        this.router.navigate(['UsersGroups/GetUesrGrouptList']);
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
      permission.userId =this.UserGroupPermissionForm.value.userId;
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
      permission.userId =this.UserGroupPermissionForm.value.userId;
    });
    this.cdr.detectChanges();
  }

  GetPermissionBygroup(groupId)
  {
    debugger
    if(groupId == 0)
      {
        this.UserGroupPermissionForm.get("groupId").setValue(0);
        this.UserGroupPermissionForm.get("systemId").setValue(0);
        this.permissionList = [];
        return;
      }
    this.groupService.GetUserGroupPermissionForm(groupId).subscribe(result => {
      if(result)
        {
          debugger
          this.userList= result.userDefinitionsList;
          this.groupList= result.usersGroupsList;
          this.systemList= result.appScreensList;
          this.permissionList=result.groupPermissionsList;
        }
        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(() => {
        // this.UserGroupPermissionForm.get("userId").setValue(result.userId);
        this.UserGroupPermissionForm.get("groupId").setValue(result.groupId);
        this.UserGroupPermissionForm.get("systemId").setValue(result.screenId);
        })
    }) 
  }

  GetPermissionsListByGroupAndScreen(groupId,screenId)
  {
    debugger
    if(screenId > 0)
      {
       this.permissionList = this.TempPermissionList;
       this.permissionList = this.permissionList.filter(p => p.groupId === groupId && p.parentId === screenId);
      }
      else
      {
        this.permissionList = this.TempPermissionList;
      }
    // if(groupId > 0 && screenId > 0)
    //   {
    //     this.groupService.GetPermissionsListByGroupAndScreen(groupId,screenId).subscribe(result => {
    //       if(result)
    //         {
    //           debugger
    //           this.permissionList=result;
    //         }
    //     }) 
    //   }  
    //   else
    //   {
    //     if(groupId > 0)
    //       {
    //         this.groupId = groupId;
    //       }
          
    //         this.GetFormDataPermission();
          
        
    //   }
  }

  updatePermission(event: any, permission: any, type: string, value: number) {
    debugger
    permission[type] = event.target.checked ? value : 0;
    permission.userId = this.UserGroupPermissionForm.value.userId;
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
              userId:this.UserGroupPermissionForm.value.userId,
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
          this.permissionList[index].userId = this.UserGroupPermissionForm.value.userId;
        }
      });
      this.UserGroupPermissionForm.get("newGroupsPermissionsList").setValue(this.permissionList);
    }
  });
  }
}
