import { HttpClient } from '@angular/common/http';
import { Component, input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UplodeFileModel } from 'app/shared/models/UplodeFileModel';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AssetsContractsHDModel } from 'app/views/fixedassets/FixedAssetsContracts/AssetsContractsHD';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { sweetalert } from 'sweetalert';
import { AccountsGroupsService } from '../accounts-groups.service';
import { of, delay, isEmpty } from 'rxjs';

@Component({
  selector: 'app-accounts-groups-form',
  templateUrl: './accounts-groups-form.component.html',
  styleUrl: './accounts-groups-form.component.scss'
})
export class AccountsGroupsFormComponent {
  public showLoader: boolean;
  public AccountsGroupsForm: FormGroup;
  public loading: boolean;
  public id: any;
  public opType: string;
  exportData: any[];
  showsave: boolean;
  disableAll: boolean = false;
  public TitlePage: string;
  currentLang: string;
  AccInGroupsModelList: any[] = [];
  disableSave: boolean;
  AccountList: any;
  public disabled = false;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private accountsGroupsService: AccountsGroupsService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.currentLang = this.jwtAuth.getLang();
    this.id = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.showsave = this.routePartsService.Guid3ToEdit;
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
    this.AccountsGroupsForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      groupNo: [0, Validators.required],
      groupNameA: ['', Validators.required],
      groupNameE: ['', Validators.required],
      //groupId: [0, Validators.required],
      accountId: [0],
      AccInGroupsModelList: [null],
    });

    if (this.id == undefined)
      this.router.navigate(['AccountsGroup/AccountsGroupsList']);

    this.GetAccountsGroupsFormInfo();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AccountsGroupsForm');
    this.title.setTitle(this.TitlePage);
  }

  GetAccountsGroupsFormInfo() {
    debugger
    this.accountsGroupsService.GetAAccountGroupsForm(this.id, this.opType).subscribe((result) => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['AccountsGroup/AccountsGroupsList']);
        return;
      }
      debugger
      this.AccountList = result.accountList;

        if (result.accInGroupsModelList != null) {
        debugger
        this.AccInGroupsModelList = result.accInGroupsModelList;
      }

      this.AccountsGroupsForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        if (this.id > 0) {
          this.AccountsGroupsForm.get("accountId").setValue(result.accountId);
        }
      });
    });
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  AddNewLine() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    this.AccInGroupsModelList.push(
      {
        accountId: 0
      });
    this.AccountsGroupsForm.get("AccInGroupsModelList").setValue(this.AccInGroupsModelList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.AccInGroupsModelList.splice(rowIndex, 1);
    }
  }

OnSaveForms() {
  debugger
  let isValid = true;
  this.disableSave = true;

  if (this.AccInGroupsModelList.length <= 0) {
    this.alert.ShowAlert("msgEnterAllData", 'error');
    this.disableSave = false;
    return;
  }

  for (let element of this.AccInGroupsModelList) {
    if (element.accountId == null || element.accountId <= 0) {
      isValid = false;
      this.alert.ShowAlert("msgEnterAllData", 'error');
      this.disableSave = false;
      return;
    }
  }

  if (isValid) {
    this.disabled = true;
    this.AccountsGroupsForm.value.AccInGroupsModelList = this.AccInGroupsModelList;

    this.accountsGroupsService.saveAccountsGroupsForm(this.AccountsGroupsForm.value)
      .subscribe((result) => {
        if (result.isSuccess == true) {
          debugger
          this.alert.SaveSuccess();
          this.ClearAfterSave();
          this.disabled = false;

          if (this.opType == 'Edit') {
            this.router.navigate(['AccountsGroup/AccountsGroupsList']);
          }

          this.id = 0;
          this.opType = 'Add';
          this.ngOnInit();
        } else {
          this.alert.SaveFaild();
        }

        this.disableSave = false;
      });
  }
}


  ClearAfterSave() {
    this.AccountsGroupsForm.value.groupNameA = '';
    this.AccountsGroupsForm.value.groupNameE = '';
    this.AccountsGroupsForm.value.AccInGroupsModelList = [];
  }
}
