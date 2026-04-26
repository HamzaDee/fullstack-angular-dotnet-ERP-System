import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ReceivingDeliveringAnOriginalToAnEmployeeService } from '../receiving-delivering-an-original-to-an-employee.service';
import { FacustodyModel } from '../FacustodyModel';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-receiving-delivering-an-original-to-an-employee-form',
  templateUrl: './receiving-delivering-an-original-to-an-employee-form.component.html',
  styleUrls: ['./receiving-delivering-an-original-to-an-employee-form.component.scss']
})
export class ReceivingDeliveringAnOriginalToAnEmployeeFormComponent implements OnInit {
  public showLoader = false;
  public id: any;
  public opType: string;
  loading: boolean;
  ReceivingDeliveringForm: FormGroup;
  ReceivingList: any[];
  public Data: FacustodyModel = new FacustodyModel();
  public EmployeeList: any;
  public selectedEmployee: Number = 0;
  public AssestList: any;
  public selectedAssest: Number = 0;
  public StatusList: any;
  public selectedStatus: Number = 0;
  isDropdownDisabled: boolean = true;
  unitsList: Array<any> = [];
  EmployeesList: Array<any> = [];
  public disabled = false;
  showsave: boolean;
  Type: string;
  disableAll: boolean = false;
  public TitlePage: string;
  disableSave:boolean;

  constructor(
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private ReceivingDeliveringAnOriginalToAnEmployeeService: ReceivingDeliveringAnOriginalToAnEmployeeService,
    private router: Router,
    private routePartsService: RoutePartsService,
    private cdRef: ChangeDetectorRef,
    private title: Title,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    debugger
    this.SetTitlePage();

    this.id = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.showsave = this.routePartsService.Guid3ToEdit;
    //this.Flag = this.routePartsService.Guid2ToEdit;

    this.ReceivingDeliveringForm = this.formbulider.group({
      id: [0 || this.id],
      companyId: [0],
      transTypeId: [105],
      transNo: [0],
      transDate: [new Date()],
      transNote: [''],
      assetId: [0],
      employeeId: [0],
      receiptStatus: [0],
      deliveryStatus: [0],
      ReceivingList: [null],
    });
    debugger
    if (this.id > 0) {
      this.id = this.id;
      this.opType = this.opType;

    }
    else if (this.id == 0) {
      this.id = 0;
      this.opType = 'Add';
    }
    else {
      this.id = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
      this.showsave = this.routePartsService.Guid3ToEdit;
    }

    // Check for valid voucherId values
    if (this.id > 0 || this.id) {
      this.id = this.id;
      this.opType = this.opType;
    } else {
      // Assign values from routePartsService if conditions aren't met
      this.id = this.routePartsService.GuidToEdit || 0;
      this.opType = this.routePartsService.Guid2ToEdit || null;
    }


    if (this.id == undefined)
      this.router.navigate(['ReceivingDeliveringAnOriginalToAnEmployee/ReceivingDeliveringAnOriginalToAnEmployee']);


    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });


    this.GetReceivingDeliveringAnOriginalInfo();

  }


  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ReceivingDeliveringAnOriginalToAnEmployeeForm');
    this.title.setTitle(this.TitlePage);
  }

  GetReceivingDeliveringAnOriginalInfo() {
    debugger
    this.disableSave = false;
    this.ReceivingDeliveringAnOriginalToAnEmployeeService.getReceivingDeliveringAnOriginalInfo(this.id, this.opType).subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['ReceivingDeliveringAnOriginalToAnEmployee/ReceivingDeliveringAnOriginalToAnEmployee']);
          return;
        }
      this.EmployeeList = result.employeeList;
      this.AssestList = result.assestList;
      this.StatusList = result.statusList;

      //List For Insert Table 
      this.ReceivingList = result.receivingList;
      result.transDate = formatDate(result.transDate, "yyyy-MM-dd", "en-US");
      this.Data = result;
      this.ReceivingDeliveringForm.patchValue(result);

      if (result.receivingList != null) {
        this.ReceivingList = result.receivingList;
        var i = 0;
        this.ReceivingList.forEach(element => {
          this.unitsList[i] = this.StatusList;
          //  this.EmployeesList[i] = this.EmployeeList;
          i++;
        })
      }
      else {
        this.ReceivingList = [
          {
            employeeId: 0,
            assetId: 0,
            receiptStatus: 0,
            deliveryStatus: 0,
            note: "",
          }
        ]
      }
    });
  }

  AddNewLine() {
    debugger
    if(this.disableAll == true)
      {
        return;
      } 
    this.disabled = true;
    let maxId = 0;
    if (this.ReceivingList.length > 0) {
      debugger
      this.ReceivingList.forEach(elements => {
        if (elements.id > maxId) {
          maxId = elements.id;
        }
      });
    }
    const newRow = {
      employeeId: 0,
      assetId: 0,
      receiptStatus: 0,
      deliveryStatus: 0,
      note: "",
    };
    this.ReceivingList.push(newRow);
  }

  deleteRow(rowIndex: number) {
    if(this.disableAll == true)
      {
        return;
      } 
    this.disabled = false;
    if (rowIndex !== -1) {
      this.ReceivingList.splice(rowIndex, 1);
    }
  }

  GetOriginalConditionUponReceipt(i, row) {
    debugger
    this.ReceivingDeliveringAnOriginalToAnEmployeeService.getOriginalConditioReceipt(this.ReceivingList[i].assetId).subscribe((result) => {
      debugger
      this.disabled = false;
      if (result.employeeId != null && this.ReceivingDeliveringForm.value.transTypeId == 105) {
        this.disabled = true;
        this.alert.ShowAlert('DoNotDuplicateForSameEmployee', 'error');
        this.ReceivingList[i].assetId = 0;
        return;
      }
      else {
        if (result.employeeId !== this.ReceivingList[i].employeeId && this.ReceivingDeliveringForm.value.transTypeId == 106) {
          this.alert.ShowAlert('AssetNotWithEmp', 'error');
          this.ReceivingList[i].assetId = 0;
          return;
        }

        this.unitsList[i] = this.StatusList;
        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(value => {
          debugger
          //this.ReceivingList[i].employeeId = result.employeeId;
          this.ReceivingList[i].deliveryStatus = result.status;
        });
      }
    });
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    this.disabled = false;
    let isValid = true;

    if (this.ReceivingList.length == 0) {
      this.alert.ShowAlert('msgEnterAllData', 'error')
      isValid = false;
      return;
    }
    for (let i = 0; i < this.ReceivingList.length; i++) {
      const element = this.ReceivingList[i];
      debugger

      if (element.assetId == null || element.assetId <= 0) {
        isValid = false;
        this.disableSave = false;
        this.alert.PleaseEnterAssest();
        break;
      } else if (element.employeeId <= 0) {
        isValid = false;
        this.disableSave = false;
        this.alert.MustEnterEmployeeID();
        break;
      }
      /*  else if (element.transTypeId  == 106) {
        isValid = false;
          this.alert.MustSelectOriginalconditionuponreceipt();
          break;  
      }  */
      else if (this.ReceivingDeliveringForm.value.transTypeId == 106) {
        if (element.receiptStatus == 0) {
          isValid = false;
          this.disableSave = false;
          this.alert.MustSelectOriginalconditionuponreceipt();
          break;
        }
      }
    }


    if (isValid) {
      this.ReceivingDeliveringForm.value.ReceivingList = this.ReceivingList;
      debugger

      this.ReceivingDeliveringAnOriginalToAnEmployeeService.saveReceivingDeliveringAnOriginal(this.ReceivingDeliveringForm.value).subscribe((result) => {
        debugger;
        if (result == true) {
          this.alert.SaveSuccess();
          this.disabled = false;
          if(this.opType == 'Edit')
            {
              this.router.navigate(['ReceivingDeliveringAnOriginalToAnEmployee/ReceivingDeliveringAnOriginalToAnEmployee']);
            }
            this.id = 0;
            this.opType = 'Add'; 
            this.ngOnInit();
        } else {
          this.alert.SaveFaild();
          this.disabled = false;
        }
        this.disableSave = false;
      });
    }
  }


}
