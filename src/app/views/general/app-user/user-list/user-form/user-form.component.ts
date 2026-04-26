import { Component, OnInit } from '@angular/core';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import * as _ from 'lodash';
import { sweetalert } from 'sweetalert';
import { map } from "rxjs/operators";
import { environment } from 'environments/environment';
import { UserService } from '../../user.service';
import { DropDownModel } from 'app/shared/models/DropDownModel';
import { CompanyBranchService } from 'app/views/general/app-company-branch/company-branch.service';
import { UsersGroupsService } from 'app/views/general/app-users-groups/users-groups.service';

export class UserCompaniesListModel {
  id: number;
  companyId: number;
  groupId: number;
  branchId: number;
  isDefault: boolean;
}

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})

export class UserFormComponent implements OnInit {
  RequstId: any;
  TitlePage: string;
  userForm: FormGroup;
  uploadImage = "assets/images/defualt-upload.png";
  file: File;
  cardImageBase64: string;
  imagePath = "assets/images/defualt-upload.png";
  tabelData: UserCompaniesListModel[] = [];
  passwordGenerated: string;
  loading: boolean;
  image:any;
  /** checkBox isChecked */
  isActive: boolean;
  isCashier:boolean;
  isRequireChangePassword: boolean;

  /** DropDownList Options*/
  companiesList: DropDownModel[] = [];
  groupsList: DropDownModel[] = [];
  branchsList: DropDownModel[] = [];

  constructor(
    private router: Router,
    private routePartsService: RoutePartsService,
    private formbulider: FormBuilder,
    private userService: UserService,
    private companyBranchService: CompanyBranchService,
    private usersGroupsService: UsersGroupsService,
    private title: Title,
    private translateService: TranslateService,
    private alert: sweetalert) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.InitiailUserForm();
    this.RequstId = this.routePartsService.GuidToEdit;
    if (this.RequstId == null || this.RequstId == undefined || this.RequstId === "") {
      this.router.navigate(['User/UserDefinitionList']);
    }
    else {
      // this.GetUserGroupsList();

      this.GetInitialUserForm();
    }
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('UserForm');
    this.title.setTitle(this.TitlePage);
  }

  onUploadIamge(event) {
    debugger
    if (event) {
      this.file = event[0]
      var reader = new FileReader();
      reader.readAsDataURL(event[0]);
      reader.onload = (event: any) => {
        this.uploadImage = event.target.result;
        const imgBase64Path = event.target.result;
        this.cardImageBase64 = imgBase64Path;
      }
    }
  }

  ClearImagePath(image): void {
    image.value = "";
    this.imagePath= "";
    this.uploadImage = "assets/images/defualt-upload.png";
  }

  InitiailUserForm() {
    this.userForm = this.formbulider.group({
      id: [0, [Validators.required]],
      nameA: [""],
      nameE: [""],
      password: [""],
      groupId: [0],
      tel: [""],
      email: [""],
      requireChangePassword: [0],
      isActive: [0],
      isCashier:[0],
      usercompanyList: [new UserCompaniesListModel],
      usercompanysList:[""]
    });
  }

  GetInitialUserForm() {
    this.userService.GetUserInitailForm(this.RequstId).subscribe(result => {
      // this.userForm.patchValue(result);
      debugger
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['User/UserDefinitionList']);
          return;
        }
      this.companiesList = result.companiesList;
      this.branchsList = result.branchsList;
      this.groupsList = result.groupsList;
      this.isActive = result.isActive;
      this.isCashier = result.isCashier;
      this.isRequireChangePassword = result.requireChangePassword;
 
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        if(this.RequstId > 0)
          {
            debugger
            this.userForm.get("id").setValue(result.id);
            this.userForm.get("nameA").setValue(result.nameA);
            this.userForm.get("nameE").setValue(result.nameE);
            this.userForm.get("password").setValue(result.password);
            // this.userForm.get("groupId").setValue(result.groupId);
            this.userForm.get("tel").setValue(result.tel);
            this.userForm.get("email").setValue(result.email);
            if(result.usercompanyList == null)
              {
                result.usercompanyList =[];
              }
            this.userForm.get("usercompanyList").setValue(result.usercompanyList);
            this.tabelData = result.usercompanyList;
            this.isActive = result.isActive;
            this.isCashier = result.isCashier;
            this.isRequireChangePassword = result.requireChangePassword;
          }          
      })
      debugger
      if (result.image && result.image != "")
      {
        this.imagePath = environment.apiURL_Main + result.image;  
        this.image=result.image;
      }
      else       
      {
        this.imagePath = "assets/images/defualt-upload.png";
      }
        
    });

  }


  AddNewRow() {
    debugger
    const newId = this.tabelData.length;
    this.tabelData.push({
      id: newId,
      companyId: 0,
      groupId: 0,
      branchId: 0,
      isDefault: false,
    });
  }
  
  DeleteRow(id) {
    const index = this.tabelData.findIndex(x => x.id === id);
    if (this.tabelData.length > 1) {
      this.tabelData.splice(index, 1);
      this.tabelData.find(x => x.id == index).id += 1
    }
    console.log(this.tabelData)
  }

  OnSaveForms() {
    debugger
    let stopExecution = false;
    this.userForm.value.usercompanyList = this.tabelData;
    for (let i = 0; i < this.userForm.value.usercompanyList.length; i++) {
      const element = this.userForm.value.usercompanyList[i];
      if (element.groupId == 0 || element.companyId == 0 ) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        return false;
      }
      element.i = i.toString();
    }
    if(this.userForm.value.nameA === null || this.userForm.value.nameA === undefined ||this.userForm.value.nameA === "")
      {
        this.alert.ShowAlert("PleaseInsertnameA", 'error');
        return;
      }  
    if(this.userForm.value.nameE === null || this.userForm.value.nameE === undefined ||this.userForm.value.nameE === "")
      {
        this.alert.ShowAlert("PleaseInsertnameE", 'error');
        return;
      } 
    if(this.userForm.value.password === null || this.userForm.value.password === undefined ||this.userForm.value.password === "")
      {
        this.alert.ShowAlert("PleaseInsertpassword", 'error');
        return;
      } 
    if(this.userForm.value.email === null || this.userForm.value.email === undefined ||this.userForm.value.email === "")
      {
        this.alert.ShowAlert("PleaseInsertemail", 'error');
        return;
      }    
    if(this.userForm.value.usercompanyList.length == 0 ||this.userForm.value.usercompanyList.length == null ||this.userForm.value.usercompanyList.length == undefined)
      {
        this.alert.ShowAlert("PleaseAddAtleastoneCompanyAndGroup", 'error');
        return;
      }

    debugger      
    this.userForm.get("isActive").setValue(this.isActive)
    this.userForm.get("isCashier").setValue(this.isCashier)
    this.userForm.get("requireChangePassword").setValue(this.isRequireChangePassword)
    if(this.userForm.value.requireChangePassword === null || this.userForm.value.requireChangePassword === undefined || this.userForm.value.requireChangePassword === 0)
      {
        this.userForm.get("requireChangePassword").setValue(false); 
      } 
    if(this.userForm.value.isActive === null || this.userForm.value.isActive === undefined || this.userForm.value.isActive === 0)
      {
        this.userForm.get("isActive").setValue(false); 
      } 
      if(this.userForm.value.isCashier === null || this.userForm.value.isCashier === undefined || this.userForm.value.isCashier === 0)
        {
          this.userForm.get("isCashier").setValue(false); 
        } 
    const formData = new FormData();
    formData.append('id', this.RequstId)
    formData.append("nameA", this.userForm.value.nameA)
    formData.append("nameE", this.userForm.value.nameE)
    formData.append("password", this.userForm.value.password)
    formData.append("groupId", this.userForm.value.groupId)
    formData.append("tel", this.userForm.value.tel)
    formData.append("email", this.userForm.value.email)
    formData.append("requireChangePassword", this.userForm.value.requireChangePassword)
    formData.append("isActive", this.userForm.value.isActive)
    formData.append("isCashier", this.userForm.value.isCashier)
    // formData.append("UsercompanyList", this.userForm.value.UsercompanyList)
      if(this.image != "" && this.image != undefined && this.image != null)
        {
          formData.append("image", this.image )
        }

    if (this.file == undefined) {
      formData.append("file", null)      
    }
    else {
      formData.append("file", this.file)
      formData.append("image", this.file.type)
    }
    debugger
    formData.append("usercompanyList", JSON.stringify(this.tabelData));
    formData.append("usercompanysList", JSON.stringify(this.tabelData));
    console.log("userForm value :", this.userForm.value)
    console.log("usercompanyList value :", this.userForm.value.usercompanyList)
    this.userService.PostUser(formData).subscribe(res => {
      if(res.isSuccess)
        {
          debugger
          if(res.message !== "" && res.message !== null && res.message !== undefined)
            {
              this.alert.GeneralWarningMessage(res.message)
            }
            else
            {
              this.alert.SaveSuccess()
              this.router.navigate(['User/UserDefinitionList']);
            }
          
        }
        else
        {
          this.alert.SaveFaildFieldRequired()
        }
      
    }, err => {
      this.alert.SaveFaildFieldRequired()
    })
  }

  GeneratePassword() {
    this.passwordGenerated = Math.random().toString(36).slice(-8);
  }
  
  OnChange(index,Row) {
    debugger
    for (let i = 0; i < this.tabelData.length; i++) {
      if(this.tabelData[i].companyId ==  Row.companyId && this.tabelData[i].groupId ==Row.groupId && this.tabelData[i].branchId ==Row.branchId && i != index)
        {
          this.alert.ShowAlert("UcantAddSameCompanyToSameUser", 'error');
          this.tabelData[index].companyId =0;
          this.tabelData[index].groupId =0;
          this.tabelData[index].branchId =0;
          this.tabelData[index] = { ...Row };
        }
  }
  }



  getvalue(row,event,index)
  {
    if(event.currentTarget.checked == true)
      {
        this.tabelData[index].isDefault =true;
        this.tabelData[index] = { ...row };
      }
      else
      {
        this.tabelData[index].isDefault =false;
        this.tabelData[index] = { ...row };
      }

  }
  // OnChangeGroup(id: number,index,Row) {
  //   debugger
  //   for (let i = 0; i < this.tabelData.length; i++) {
  //     if(this.tabelData[i].companyId ==  Row.companyId && this.tabelData[i].groupId ==Row.groupId && this.tabelData[i].branchId ==Row.branchId && i != index)
  //       {
  //         this.alert.ShowAlert("UcantAddSameGroupToSameUser", 'error');
  //         this.tabelData[index].groupId =0;
  //         this.tabelData[index] = { ...Row };
  //       }
  // }

  // }

}
