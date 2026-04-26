import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AccountTreeService } from '../app-accounttree.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { TreeNode } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { min } from 'date-fns';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.scss']
})
export class AccountFormComponent implements OnInit {
  AccountAddForm: FormGroup;
  public TitlePage: string;
  tabelData: TreeNode[];
  cols: any[];
  loading: boolean;
  RequstId: any;
  accountsList: any;
  currencyList: any;
  selectedCompanyActivity: any;
  selectedGroup: any;
  companyImage: string;
  accountTypeList: any;
  closingAccountsList: any;
  costCenterPolicyList: any;
  ProjectPolicyList: any;
  userList: any;
  showLoader = false
  showUsers: boolean;
  showClosingAcc: number;
  hasChild: boolean;
  hasTransAction: boolean;
  useCostCenter: boolean;
  useProjects: boolean;
  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private accountTreeService: AccountTreeService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.RequstId = this.routePartsService.GuidToEdit;
    if (this.RequstId == null || this.RequstId == undefined || this.RequstId === "") {
      this.router.navigate(['Account/AccountTreeList']);
    }
    this.InitiailAccountForm();
    this.GetInitailAccount();
  }

  InitiailAccountForm() {
    this.AccountAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      accNo: ["", [Validators.required]],
      accNameA: ["", [Validators.required]],
      accNameE: ["", [Validators.required]],
      parentAccId: [null],
      accNature: [null, [Validators.required, Validators.min(1)]],
      accType: [null, [Validators.required, Validators.min(1)]],
      isMain: [false],
      isActive: [true],
      currencyId: [null],
      note: [""],
      hasPermission: [false],
      costCenterPolicy: [null],
      closingAccount: [null],
      usersId: [""],
      accLevel: [0],
      accOrder: [""],
      hasChild: [false],
      hasTransAction: [false],
      projectPolicy: [false],
    });
  }

  GetInitailAccount() {
    debugger
    this.accountTreeService.GetInitialAccount(this.RequstId).subscribe(result => {
      debugger
      if (result.isSuccess || result.isSuccess == undefined) {
        this.accountsList = result.accountsList;
        this.currencyList = result.currencyList;
        this.accountTypeList = result.accountTypeList;
        this.closingAccountsList = result.closingAccountsList;
        this.userList = result.userList;
        this.costCenterPolicyList = result.costCenterPolicyList;
        this.ProjectPolicyList = result.projectPolicyList;

        this.AccountAddForm.patchValue(result);
        this.hasChild = result.hasChild;
        this.hasTransAction = result.hasTransAction;
        this.useCostCenter = result.useCostCenter;
        this.useProjects = result.useProjects;
        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(() => {
          debugger
          if (result.parentAccId == null) {
            result.parentAccId = 0;
          }
          if (result.currencyId == null) {
            result.currencyId = 0;
          }
          if (result.projectPolicy == null) {
            result.projectPolicy = 0;
          }
          if (result.costCenterPolicy == null) {
            result.costCenterPolicy = 0;
          }
          this.AccountAddForm.get("parentAccId").setValue(result.parentAccId);
          this.AccountAddForm.get("accType").setValue(result.accType);
          this.AccountAddForm.get("currencyId").setValue(result.currencyId);
          this.AccountAddForm.get("costCenterPolicy").setValue(result.costCenterPolicy);
          this.AccountAddForm.get("closingAccount").setValue(result.closingAccount);
          this.AccountAddForm.get("usersId").setValue(result.usersId);
          this.AccountAddForm.get("projectPolicy").setValue(result.projectPolicy);
        });
      }
      else {
        this.alert.ShowAlert(result.message, 'error');
        this.router.navigate(['Account/AccountTreeList']);
      }
    })
  }

  GetAccountsList(event) {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.tabelData = [];
      this.accountTreeService.GetAccountsList(0, 1).subscribe(result => {
        this.tabelData = result.map(result => ({
          data: result,
          leaf: !result.isMain
        }));
      })
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AccountTree');
    this.title.setTitle(this.TitlePage);
  }

  onNodeExpand(event) {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      const node = event.node;
      //this.tabelData = [];
      this.accountTreeService.GetAccountsList(node.data.id, 0).subscribe(result => {
        const childs: TreeNode[] = result.map(account => ({
          data: account,
          leaf: !account.isMain
        }));
        node.children = childs;
        this.tabelData = [...this.tabelData];
      })
    });
  }

  OnSaveForms() {
    const formData = new FormData();
    formData.append('id', this.AccountAddForm.value.id)
    formData.append("accNo", this.AccountAddForm.value.accNo)
    formData.append("accNameA", this.AccountAddForm.value.accNameA)
    formData.append("accNameE", this.AccountAddForm.value.accNameE)
    formData.append("parentAccId", this.AccountAddForm.value.parentAccId)
    formData.append("accNature", this.AccountAddForm.value.accNature)
    formData.append("accType", this.AccountAddForm.value.accType)
    formData.append("isMain", this.AccountAddForm.value.isMain)
    formData.append("isActive", this.AccountAddForm.value.isActive)
    formData.append("currencyId", this.AccountAddForm.value.currencyId)
    formData.append("note", this.AccountAddForm.value.note)
    formData.append("hasPermission", this.AccountAddForm.value.hasPermission)
    formData.append("costCenterPolicy", this.AccountAddForm.value.costCenterPolicy)
    formData.append("closingAccount", this.AccountAddForm.value.closingAccount ?? "0")
    formData.append("usersId", this.AccountAddForm.value.usersId)
    formData.append("accLevel", this.AccountAddForm.value.accLevel)
    formData.append("accOrder", this.AccountAddForm.value.accOrder)
    formData.append("projectPolicy", this.AccountAddForm.value.projectPolicy)
    formData.append("companyId", this.jwtAuth.getCompanyId())

    debugger

    if(this.useCostCenter == true)
    {
      if(this.AccountAddForm.value.costCenterPolicy == 0 || this.AccountAddForm.value.costCenterPolicy == null || this.AccountAddForm.value.costCenterPolicy == undefined)
        {
          this.alert.ShowAlert('PleaseInsertCostCenterPolicy','error');
          return;
        } 
    }


    if(this.useProjects == true)
      {
        if(this.AccountAddForm.value.projectPolicy == 0 || this.AccountAddForm.value.projectPolicy == null || this.AccountAddForm.value.projectPolicy == undefined)
          {
            this.alert.ShowAlert('PleaseInsertprojectPolicy','error');
            return;
          } 
      }


    this.accountTreeService.PostAccount(formData).subscribe(res => {
      this.alert.SaveSuccess()
      this.router.navigate(['Account/AccountTreeList']);
    }, err => {
      this.alert.SaveFaildFieldRequired()
    })
  }

  GetAccountNo(event) {
    debugger
    if (this.AccountAddForm.get("id").value > 0) {
      if (this.AccountAddForm.get("id").value == event.value) {
        this.alert.ShowAlert('WrongParentAcc', 'error');
        this.AccountAddForm.get("parentAccId").setValue(0);
      }
      else {
        this.accountTreeService.GetAccountNo(event.value).subscribe(res => {
          if (res.accOrder.startsWith(this.AccountAddForm.get("accOrder").value + '-')) {
            this.alert.ShowAlert('WrongParentAcc', 'error');
            this.AccountAddForm.get("parentAccId").setValue(0);
          }
        });
      }
      return;
    }
    this.accountTreeService.GetAccountNo(event.value).subscribe(res => {
      this.AccountAddForm.get("accNo").setValue(res.accNo);
      this.AccountAddForm.get("accType").setValue(res.accType);
      this.AccountAddForm.get("accNature").setValue(res.accNature);
      this.AccountAddForm.get("closingAccount").setValue(res.closingAccount);
      this.AccountAddForm.get("accLevel").setValue(res.accLevel);
      this.AccountAddForm.get("accOrder").setValue(res.accOrder);
      this.showClosingAcc = res.accNature;
    }, err => {
      this.alert.SaveFaildFieldRequired()
    })
  }

  IsValidAccNameA(event) {
    if (event.target.value == "") {
      return;
    }
    var accId = this.AccountAddForm.get("id").value;
    this.accountTreeService.IsValidAccountName(accId, event.target.value).subscribe(res => {
      if (res) {
        this.AccountAddForm.get("accNameA").setValue("");
        this.alert.ShowAlert("msgAccountNameExist", 'error');
      }
    }, err => {
      this.alert.SaveFaildFieldRequired()
    })
  }

  IsValidAccNameE(event) {
    if (event.target.value == "") {
      return;
    }
    var accId = this.AccountAddForm.get("id").value;
    this.accountTreeService.IsValidAccountName(accId, event.target.value).subscribe(res => {
      if (res) {
        this.AccountAddForm.get("accNameE").setValue("");
        this.alert.ShowAlert("msgAccountNameExist", 'error');
      }
    }, err => {
      this.alert.SaveFaildFieldRequired()
    })
  }

  IsValidAccNo(event) {
    if (event.target.value == "") {
      return;
    }
    var accId = this.AccountAddForm.get("id").value;
    this.accountTreeService.IsValidAccountNo(accId, event.target.value).subscribe(res => {
      if (res) {
        this.AccountAddForm.get("accNo").setValue("");
        this.alert.ShowAlert("msgAccountNoExist", 'error');
      }

    }, err => {
      this.alert.SaveFaildFieldRequired()
    })
  }
}
