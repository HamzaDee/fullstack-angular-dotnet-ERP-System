import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-copyuserpermissins-form',
  templateUrl: './copyuserpermissins-form.component.html',
  styleUrls: ['./copyuserpermissins-form.component.scss']
})
export class CopyuserpermissinsFormComponent implements OnInit {
  CopyPermissionsForm: FormGroup;
  userId: any; 
  public TitlePage: string;
  usersList: any[];
  groupsList: any[];
  permissionList: any[] = [];

  constructor
  (
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    public routePartsService: RoutePartsService,
    public router: Router,
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private appCommonserviceService : AppCommonserviceService,
    private UService:UserService,
  ) { }

  ngOnInit(): void {
    debugger
    this.userId = this.routePartsService.GuidToEdit;

    this.SetTitlePage();
    if (this.userId == null || this.userId == undefined || this.userId === "") {
      this.router.navigate(['User/UserDefinitionList/UserPermissionsForm']);
    }
    this.InitiailCopyPermissionsForm();
    this.getData();
    //this.GetInitailEntryVoucher();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CopyUserPermissions');
    this.title.setTitle(this.TitlePage);
  }

  InitiailCopyPermissionsForm() {    
    this.CopyPermissionsForm = this.formbulider.group({
      id: [0],
      users: [''], 
      groups: [''],
    }); 
  }

  OnSaveForms() {
    debugger
    this.UService.GetPermissionsListByUserAndGroup(this.CopyPermissionsForm.value.users,this.CopyPermissionsForm.value.groups).subscribe(result => {
      if(result)
        {
          debugger
          this.permissionList=result;
        }
        this.dialogRef.close(this.permissionList);
    }) 
    
  }

  getData()
  {
    this.usersList = this.data.usersList;
    this.groupsList= this.data.groupsList;
  }
  isUserSelected(userId: string): boolean {
    
    const users = this.CopyPermissionsForm.get('users').value.split(',');
    return users.includes(userId);
  }

  isGroupSelected(groupId: string): boolean {
    
    const groups = this.CopyPermissionsForm.get('groups').value.split(',');
    return groups.includes(groupId);
  }

  onUserSelect(event: any): void {
    
    const userId = event.target.value;
    let users = this.CopyPermissionsForm.get('users').value.split(',');
    if (event.target.checked) {
      users.push(userId);
    } else {
      users = users.filter(id => id !== userId);
    }
    this.CopyPermissionsForm.get('users').setValue(users.join(','));
  }

  onGroupSelect(event: any): void {
    
    const groupId = event.target.value;
    let groups = this.CopyPermissionsForm.get('groups').value.split(',');
    if (event.target.checked) {
      groups.push(groupId);
    } else {
      groups = groups.filter(id => id !== groupId);
    }
    this.CopyPermissionsForm.get('groups').setValue(groups.join(','));
  }
}
