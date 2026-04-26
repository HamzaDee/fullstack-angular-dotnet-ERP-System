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
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-accountbranchform',
  templateUrl: './accountbranchform.component.html',
  styleUrls: ['./accountbranchform.component.scss']
})
export class AccountbranchformComponent implements OnInit {

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
  userList: any;
  showLoader = false;
  showUsers: boolean;
  showClosingAcc: number;
  hasChild: boolean;
  hasTransAction:boolean;
  accountModelList: any[];
  newAccNo: string;
  isExistAccNo: boolean = true;
  useCostCenter: boolean;
  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private accountTreeService: AccountTreeService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
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
        accLevel:[0],
        accOrder:[""],
        hasChild:[false],
        hasTransAction:[false],
        accTypeName:[""],
        accNatureName:[""],
        lastChild:[0],
        noAndName:[""],
        accountsModelList: [null]
      });
    }

    GetInitailAccount() {
      debugger
      this.accountTreeService.GetInitialAccountBranch(this.RequstId).subscribe(result => {
        if (result.isSuccess || result.isSuccess == undefined) {
          this.accountsList = result.accountsList;
          this.currencyList = result.currencyList;
          this.accountTypeList = result.accountTypeList;
          this.closingAccountsList = result.closingAccountsList;
          this.userList = result.userList;
          this.costCenterPolicyList = result.costCenterPolicyList;
          this.AccountAddForm.patchValue(result);
          this.hasChild = result.hasChild;
          this.hasTransAction = result.hasTransAction;
          this.accountModelList= result.accountsModelList;


          this.useCostCenter = result.useCostCenter;


          const source$ = of(1, 2);
          source$.pipe(delay(0)).subscribe(() => {
            this.AccountAddForm.get("parentAccId").setValue(result.parentAccId);
            this.AccountAddForm.get("accType").setValue(result.accType);
            this.AccountAddForm.get("currencyId").setValue(result.currencyId);
            this.AccountAddForm.get("costCenterPolicy").setValue(result.costCenterPolicy);
            this.AccountAddForm.get("closingAccount").setValue(result.closingAccount);
            this.AccountAddForm.get("usersId").setValue(result.usersId);
          });        
        }
        else {
          this.alert.ShowAlert(result.message,'error');
          this.router.navigate(['Account/AccountTreeList']);
        }        
      })
    }

    GetAccountsList(event) {
      debugger
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.tabelData = [];
        this.accountTreeService.GetAccountsList(0,1).subscribe(result => {
          this.tabelData = result.map(result => ({
            data: result,
            leaf: !result.isMain
          }));
        })
      });
    }
  
    SetTitlePage() {
      this.TitlePage = this.translateService.instant('BranchAccountScreen');
      this.title.setTitle(this.TitlePage);
    }

    OnSaveForms() {
      debugger
      let stopExecution = false;
      this.accountModelList.forEach(element=> {
        if(element.accNo == "" || element.accNameA == "" || element.accNameE == "" ){
          this.alert.ShowAlert("msgEnterAllData",'error');
          stopExecution = true;
          return;
        }
      })
      if (stopExecution) {
        return; 
      }      
      this.AccountAddForm.value.accountsModelList = this.accountModelList
      this.accountTreeService.PostAccountBranch(this.AccountAddForm.value).subscribe(res => {
        if(res){
          this.alert.SaveSuccess();
          this.router.navigate(['Account/AccountTreeList']);
        }
        else{
          this.alert.SaveFaild();
        }        
      }, err => {
        this.alert.SaveFaild()
      })
    }

    GetAccountNo(event){
      this.accountTreeService.GetAccountNo(this.AccountAddForm.get("id").value).subscribe(res => {
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

    IsValidAccNameA(event){
      if(event.target.value == ""){
        return;
      }
      var accId = this.AccountAddForm.get("id").value;
      this.accountTreeService.IsValidAccountName(accId, event.target.value).subscribe(res => {
        if(res){
          event.target.value = "";
          this.alert.ShowAlert("msgAccountNameExist",'error');
        }         
      }, err => {
        this.alert.SaveFaildFieldRequired()
      })
    }

    IsValidAccNameE(event){
      if(event.target.value == ""){
        return;
      }
      var accId = this.AccountAddForm.get("id").value;
      this.accountTreeService.IsValidAccountName(accId, event.target.value).subscribe(res => {
        if(res){
          event.target.value = "";
          this.alert.ShowAlert("msgAccountNameExist",'error');
        }         
      }, err => {
        this.alert.SaveFaildFieldRequired()
      })
    }

    IsValidAccNo(event){
      if(event.target.value == ""){
        return;
      }
      var accId = this.AccountAddForm.get("id").value;
      this.accountTreeService.IsValidAccountNo(accId, event.target.value).subscribe(res => {
        if(res){
          event.target.value = "";
          this.alert.ShowAlert("msgAccountNoExist",'error');
        }
          
      }, err => {
        this.alert.SaveFaildFieldRequired()
      })
    }

    IsValidAccountNo(newAccNo): Observable<any> {
      return this.http.get<any>(`${environment.apiURL_Main + '/api/Account/IsValidAccountNo/' +
      this.jwtAuth.getCompanyId() + '/0/' + newAccNo}`).pipe(
        switchMap(response => {
          if (response === false) {
            this.newAccNo = newAccNo;
            return of(response);
          } else {
            newAccNo = (Number(newAccNo) + 1).toString();
            return timer(1000).pipe(switchMap(() => this.IsValidAccountNo(newAccNo)));
          }
        })
      );
    }

    AddNewLine(){    
      debugger
      if(this.newAccNo != undefined){
        this.newAccNo = (Number(this.newAccNo) + 1).toString();
        this.IsValidAccountNo(this.newAccNo);
        this.accountModelList.push(
          {
            accNo: this.newAccNo,
            accNameA: "",
            accNameE: "",
            currencyId: 0,
            CostCenterPolicy: 0,
            isMain:false
          });
      }
      else{
        this.accountTreeService.GetAccountNo(this.AccountAddForm.get("id").value).subscribe(res => {
          this.newAccNo = res.accNo;
          this.accountModelList.push(
            {
              accNo: res.accNo,
              accNameA: "",
              accNameE: "",
              currencyId: 0,
              CostCenterPolicy: 0,
              isMain:false
            });
          }, err => {
            this.alert.SaveFaildFieldRequired()
        })
      }
      
      
    }

    DeleteAccount(rowIndex: number) {
      debugger
      if (rowIndex !== -1) {
        this.accountModelList.splice(rowIndex, 1);
        //this. claculateAllAmount(); 
      }
    }

    handleF4Key(event: KeyboardEvent) {
    if (event.key === 'F4') {
      this.AddNewLine();
    }
   
  }

   UpdateVlaue(event: any, index: number) {
     const isChecked = event.target.checked;
     this.accountModelList[index].isMain = isChecked;      
    }


}
