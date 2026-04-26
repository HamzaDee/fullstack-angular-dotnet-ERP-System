import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { CostCenterService } from '../cost-center.service';
import { delay, of } from 'rxjs';

@Component({
  selector: 'app-costcenterbranchform',
  templateUrl: './costcenterbranchform.component.html',
  styleUrl: './costcenterbranchform.component.scss'
})
export class CostcenterbranchformComponent {
  public TitlePage: string;
  showLoader = false;
  loading: boolean;
  id: any;
  CostcenterAddForm: FormGroup;
  CostCenterModelList: any[];
  isdisabled: boolean = true;
  newCostNo: string;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private costCenterService: CostCenterService) { }

  ngOnInit(): void {
    debugger
    this.SetTitlePage();
    this.id = this.routePartsService.GuidToEdit;
    if (this.id == null || this.id == undefined || this.id === "") {
      this.router.navigate(['CostCenter/CostCenterTree']);
    }

    this.CostcenterAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      tableNo: [0],
      parentTableNo: [0],
      itemNo: [0],
      descrA: ["", [Validators.required]],
      descrE: ["", [Validators.required]],
      note: [""],
      status: [""],
      noAndName: [""],
      isMain: [false],
      CostCenterModelList: [null],
    });
    this.GetInitailAccount();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Costcenterbranchform');
    this.title.setTitle(this.TitlePage);
  }

  GetInitailAccount() {
    debugger
    this.costCenterService.GetMainBranchCostCenterForm(this.id).subscribe(result => {
      if (result.isSuccess || result.isSuccess == undefined) {
        debugger

        this.CostcenterAddForm.patchValue(result);
        this.CostCenterModelList = result.costCenterModelList;

      }
      else {
        this.alert.ShowAlert(result.message, 'error');
        this.router.navigate(['CostCenter/CostCenterTree']);
      }
    })
  }

  AddNewLine() {
    debugger;

    if (this.CostCenterModelList && this.CostCenterModelList.length > 0) {
      debugger;

      const maxItemNo = Math.max(...this.CostCenterModelList.filter(element => element.itemNo !== undefined).map(element => Number(element.itemNo)));

      const newItemNo = (maxItemNo + 1).toString();

      const exists = this.CostCenterModelList.some(item => item.itemNo === newItemNo);

      if (!exists) {
        this.CostCenterModelList.push({
          itemNo: "",
          descrA: "",
          descrE: "",
          status: true
        });
      }
    } else {
      this.costCenterService.GetCostCenterNo(this.CostcenterAddForm.value.id).subscribe(res => {
        debugger;

        const newRecord = {
          itemNo: "",
          descrA: "",
          descrE: "",
          status: true
        };

        this.CostCenterModelList = this.CostCenterModelList || [];
        this.CostCenterModelList.push(newRecord);

        this.CostcenterAddForm.get("CostCenterModelList").setValue(this.CostCenterModelList);
      });
    }
  }

  deleteRow(itemNo: string) {
    debugger
    const rowIndex = this.CostCenterModelList.findIndex(item => item.itemNo === itemNo);

    if (rowIndex !== -1) {
      this.CostCenterModelList.splice(rowIndex, 1);
    }
  }

  OnSaveForms() {
    debugger
    let stopExecution = true;
    if (this.CostCenterModelList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      stopExecution = false;
      return;
    }

    this.CostCenterModelList.forEach(element => {
      if ((element.itemNo == "" || element.itemNo == 0) || element.descrA == "" || element.descrE == "") {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = false;
        return;
      }
    });

    if (stopExecution) {
      this.CostCenterModelList.forEach(element => {
        if (element.status == true) {
          element.status = 1;
        }
        else if (element.status == false) {
          element.status = 0;
        }
      });
      this.CostcenterAddForm.value.CostCenterModelList = this.CostCenterModelList;
      this.costCenterService.PostCostCenterBranch(this.CostcenterAddForm.value).subscribe(res => {
        if (res) {
          this.alert.SaveSuccess();
          this.router.navigate(['CostCenter/CostCenterTree']);
        }
        else {
          this.alert.SaveFaild();
        }
      }, err => {
        this.alert.SaveFaild()
      })
    }
  }

  onCheckboxChange(event: Event, accountList: any) {
    debugger
    const checkbox = event.target as HTMLInputElement;
    accountList.status = checkbox.checked;
  }


  CheckIfChooseSameAccNo(event: any, rowIndex: number) {
    const value = event.target.value;

    for (let i = 0; i < this.CostCenterModelList.length; i++) {
      if (i !== rowIndex && this.CostCenterModelList[i].itemNo == value) {

        this.alert.ShowAlert("CantSameItemNo", 'error');
        this.CostCenterModelList[rowIndex].itemNo = "";

        return;
      }
    }

    this.costCenterService.CheckIfChooseSameAccNo(value).subscribe(res => {
      if (res === false) {

        this.alert.ShowAlert("CantSameItemNo", 'error');

        this.CostCenterModelList[rowIndex].itemNo = "";

        return;
      }
    });
  }

}
