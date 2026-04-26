import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationsSettingsService } from '../notifications-settings.service';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { Router } from '@angular/router';
import { WorkflowsModel } from '../WorkflowsModel';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notifications-settings-list',
  templateUrl: './notifications-settings-list.component.html',
  styleUrls: ['./notifications-settings-list.component.scss']
})
export class NotificationsSettingsListComponent implements OnInit {
public showLoader: boolean;
public loading: boolean;
public WorkflowsList: any[] = [];
NotificationsSettingsForm: FormGroup;
public VoucherTypeList: any;
public OperationList: any;
public UserList: any;
public Data: WorkflowsModel = new WorkflowsModel();
public TitlePage: string;


  constructor(private NotificationsSettingsService: NotificationsSettingsService,
              private title: Title,
              private jwtAuth: JwtAuthService,
              private alert: sweetalert,
              public router: Router,
              private translateService: TranslateService,
              private formbulider: FormBuilder) { }


  ngOnInit(): void {
    this.SetTitlePage();

    this.NotificationsSettingsForm = this.formbulider.group({
      id              :[0],
      companyId       :[0],
      voucherTypeId   :[0 , [Validators.required, Validators.pattern('^[1-9][0-9]*')]],  
      operationId     :[0],
      UserIds          :[''],
      WorkflowsList :[null],
    });

   this.GetInitailNotificationsSettings();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('NotificationsSettingsList');
    this.title.setTitle(this.TitlePage);
  }

  GetInitailNotificationsSettings() {
    debugger
    this.NotificationsSettingsService.getNotificationsSettings().subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
      this.VoucherTypeList = result.voucherTypeList;
      this.OperationList   = result.operationList;
      this.UserList        = result.userList;
      this.Data = result;
     this.NotificationsSettingsForm.patchValue(result);
    });
  }

  AddNewLine(){    
    this.WorkflowsList.push(
    {
      operationId   :[0],
      userIds        :[]
    });
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.WorkflowsList.splice(rowIndex, 1);
    }
  }

  getVocherType(event: any) {
  
  const selectedValue = event.value;
  this.NotificationsSettingsService.GetVocherTypeInfo(selectedValue).subscribe((result) =>{
    debugger
    this.WorkflowsList = result.vocherTypeList;
    for (let i = 0; i < this.WorkflowsList.length; i++) {

      const userIdsArray = result.vocherTypeList[i].userIdsArray;
      this.WorkflowsList[i].userIds = userIdsArray.map(id => parseInt(id, 10));

            //this.WorkflowsList[i].userIds = result.vocherTypeList[i].userIdsArray.map(id => id.toString());
    }
  });
  }

  OnSaveForms(){
    debugger
    let isValid = true;
    this.WorkflowsList.forEach(element => {
      debugger
      if (element.operationId == null || element.operationId <= 0  ||(element.userIds == null || element.userIds <= '' ||element.userIds == undefined))
       {
        isValid = false;
        this.alert.ShowAlert("msgEnterAllData",'error');
        return;
      } 
    });
    if (isValid) {
      const formData = new FormData();
      this.NotificationsSettingsForm.value.WorkflowsList = this.WorkflowsList;
      formData.append('voucherTypeId', this.NotificationsSettingsForm.value.voucherTypeId);
      formData.append("WorkflowsList", JSON.stringify(this.WorkflowsList));
      this.NotificationsSettingsService.saveNotificationsSettingsForm(formData).subscribe((result) => {
        debugger
        if (result.isSuccess== true) {
          this.alert.SaveSuccess();
          this.WorkflowsList =[];
          this.NotificationsSettingsForm.get("voucherTypeId").setValue(0);
        } else {
          this.alert.SaveFaild();
        }
      });
      }

  }

}
