import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { sweetalert } from 'sweetalert';
import { formatDate } from '@angular/common';
import { delay, of } from 'rxjs';
import Swal from 'sweetalert2';
import { MaintenanceRequestsService } from '../maintenance-requests.service';

@Component({
  selector: 'app-maintenance-requests-form',
  templateUrl: './maintenance-requests-form.component.html',
  styleUrl: './maintenance-requests-form.component.scss'
})
export class MaintenanceRequestsFormComponent {
  MaintenanceForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  opType: string;
  Id: any;
  isdisabled: boolean = false;
  showLoader = false;
  decimalPlaces: number;
  disableAll: boolean;
  disableSave: boolean;
  lang: string;
  NewDate: any;
  showsave: boolean;
  UseTax: boolean;
  showLeadList = false;
  showCustomerList = false;
  fTotal: string | number = 0;
  fDiscount: string | number = 0;
  fTaxTotal: string | number = 0;
  fNetTotal: string | number = 0;
  //List
  MaintRequestDTsList: any[] = [];
  BranchList: any;
  SalesRequestList: any;
  AreaList: any;
  SalesEmployeeList: any;
  TechnicianList: any;
  SuppliersList: any;
  ItemsList: any;
  DamageList: any;
  PriorityList: any;
  RequestTypeList: any;
  CustomerTypes: { id: number; text: string }[] = [
    { id: 0, text: this.jwtAuth.getLang() === 'ar' ? 'اختر' : 'Select' },
    { id: 1, text: this.jwtAuth.getLang() === 'ar' ? 'عميل محتمل' : 'Potential Client' },
    { id: 2, text: this.jwtAuth.getLang() === 'ar' ? 'عميل' : 'Client' },
  ];

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private MaintenanceService: MaintenanceRequestsService,
      private cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    debugger
    this.disableSave = false;
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
      this.Id = queryParams.get('GuidToEdit');
      this.opType = 'Show';
      this.showsave = true;
    }
    else {
      this.Id = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
      this.showsave = this.routePartsService.Guid3ToEdit;
    }
    if (this.route.snapshot.queryParamMap.has('opType')) {
      this.opType = this.route.snapshot.queryParamMap.get('opType');
      this.Id = 0;
    }
    this.SetTitlePage();
    if (this.Id == null || this.Id == undefined || this.Id === "") {
      this.router.navigate(['MaintenanceRequests/MaintenanceRequestsList']);
    }

    this.MaintenanceForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      inRequest: [false, [Validators.required]],
      requestNo: [0, [Validators.required, Validators.min(1)]],
      requestDate: [new Date],
      requestType: [0, [Validators.required, Validators.min(1)]],
      deliveryDate: [new Date],
      branchId: [0],
      areaId: [0],
      technicianId: [0],
      customerId: [0],
      salesRequestId: [0],
      tel1: [""],
      tel2: [""],
      address: [""],
      note: [""],
      visitDate: [new Date],
      informVisitDate: [false],
      delivered: [false],
      status: [0],
      priorityId: [0, [Validators.required, Validators.min(1)]],
      MaintRequestDTsList: [null],
    });

    this.GetInitailMaintenanceRequest();

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('MaintenanceRequestsList');
    this.title.setTitle(this.TitlePage);
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  GetInitailMaintenanceRequest() {
    debugger
    this.MaintenanceService.GetInitailMaintenanceRequest(this.Id, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['MaintenanceRequests/MaintenanceRequestsList']);
        return;
      }

      debugger
      result.requestDate = formatDate(result.requestDate, "yyyy-MM-dd", "en-US");
      result.deliveryDate = formatDate(result.deliveryDate, "yyyy-MM-dd", "en-US");
      result.visitDate = formatDate(result.visitDate, "yyyy-MM-dd", "en-US");
      this.BranchList = result.branchList;
      this.SalesRequestList = result.salesRequestList;
      this.AreaList = result.areaList;
      this.TechnicianList = result.technicianList;
      this.SuppliersList = result.suppliersList;
      this.ItemsList = result.itemsList;
      this.DamageList = result.damageList;
      this.PriorityList = result.priorityList;
      this.RequestTypeList = result.requestTypeList;

      if (result.maintRequestDTsList) {
        this.MaintRequestDTsList = result.maintRequestDTsList;
        debugger
        this.MaintRequestDTsList.forEach(element => {
          debugger
          this.onItemChange(element);
          this.MaintenanceService.CheckSerialIsExist(element.serialNo).subscribe(res => {
            debugger
            element.disableFields = res === true;

            if (element.disableFields == true) {
              element.lastRequestNo = element.lastRequestNo ?? null;
              element.lastRequestDate = element.lastRequestDate
                ? formatDate(element.lastRequestDate, "yyyy-MM-dd", "en-US")
                : null;
              element.maintenanceCount = element.maintenanceCount ?? 0;
            }
            else {
              element.lastRequestNo = 0
              element.lastRequestDate = null

              element.maintenanceCount = 0;
            }


          });
        });
      }


      this.MaintenanceForm.patchValue(result);



      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.disableSave = false;

        if (this.Id > 0) {
          this.MaintenanceForm.get("inRequest").setValue(result.inRequest);
          this.MaintenanceForm.get("branchId").setValue(result.branchId);
          this.MaintenanceForm.get("areaId").setValue(result.areaId);
          this.MaintenanceForm.get("technicianId").setValue(result.technicianId);
          this.MaintenanceForm.get("customerId").setValue(result.customerId);
          this.MaintenanceForm.get("salesRequestId").setValue(result.salesRequestId);
          this.MaintenanceForm.get("priorityId").setValue(result.priorityId);
          this.MaintenanceForm.get("requestType").setValue(result.requestType);


          if (result.inRequest == 1) {
            this.MaintenanceForm.get("inRequest").setValue(1);
          }
          else if (result.inRequest == 0) {
            this.MaintenanceForm.get("inRequest").setValue(0);
          }

          if (result.informVisitDate == true) {
            const formattedDate = formatDate(result.visitDate, 'yyyy-MM-dd', 'en-US');

            this.MaintenanceForm.patchValue({
              visitDate: formattedDate,
              informVisitDate: true
            });
          }
        }
        else {
          this.MaintenanceForm.get("inRequest").setValue(1);
          this.MaintenanceForm.get("branchId").setValue(0);
          this.MaintenanceForm.get("areaId").setValue(0);
          this.MaintenanceForm.get("technicianId").setValue(0);
          this.MaintenanceForm.get("customerId").setValue(0);
          this.MaintenanceForm.get("salesRequestId").setValue(0);
          this.MaintenanceForm.get("priorityId").setValue(0);
          this.MaintenanceForm.get("note").setValue("");
          this.MaintenanceForm.get("tel1").setValue("");
          this.MaintenanceForm.get("tel2").setValue("");
          this.MaintenanceForm.get("address").setValue("");
          this.MaintenanceForm.get("requestType").setValue(0);
        }
      });
    });
  }

  AddNewLine() {
    if (this.disableAll == true) {
      return;
    }
    this.MaintRequestDTsList.push(
      {
        id: 0,
        requestHDId: 0,
        itemId: 0,
        serialNo: "",
        underWarranty: false,
        damageDecr: "",
        damageId: 0,
        model: "",
        disableFields: false,
        lastRequestNo: 0,
        lastRequestDate: new Date,
        maintenanceCount: 0,
        invoiceNo : "",
        invoicedate : ""
      });
    this.MaintenanceForm.get("MaintRequestDTsList").setValue(this.MaintRequestDTsList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.MaintRequestDTsList.splice(rowIndex, 1);
    }
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let isValid = true;

    if (this.MaintRequestDTsList.length <= 0) {
      isValid = false;
      this.alert.ShowAlert("msgEnterAllData", 'error');
      this.disableSave = false;
      return;
    }

    this.MaintRequestDTsList.forEach(element => {
      if ((element.itemId == null || element.itemId <= 0) || (element.damageId == null || element.damageId <= 0)) {
        isValid = false;
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        return;
      }
    });

    if (isValid) {
      this.MaintenanceForm.value.id = this.Id;
      this.MaintenanceForm.value.MaintRequestDTsList = this.MaintRequestDTsList;
      this.MaintenanceForm.value.companyId = this.jwtAuth.getCompanyId();
      this.MaintenanceForm.value.userId = this.jwtAuth.getUserId();

      this.MaintenanceService.saveMaintenanceRequest(this.MaintenanceForm.value).subscribe((result) => {
        debugger;
        if (result.isSuccess == true) {
          this.alert.SaveSuccess();
          debugger
          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['MaintenanceRequests/MaintenanceRequestsList']);
          }
          this.Id = 0;
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
    this.MaintRequestDTsList = [];
    this.MaintenanceForm.get("inRequest").setValue(1);
    this.MaintenanceForm.get("branchId").setValue(0);
    this.MaintenanceForm.get("areaId").setValue(0);
    this.MaintenanceForm.get("technicianId").setValue(0);
    this.MaintenanceForm.get("customerId").setValue(0);
    this.MaintenanceForm.get("salesRequestId").setValue(0);
    this.MaintenanceForm.get("priorityId").setValue(0);
    this.MaintenanceForm.get("note").setValue("");
    this.MaintenanceForm.get("tel1").setValue("");
    this.MaintenanceForm.get("tel2").setValue("");
    this.MaintenanceForm.get("address").setValue("");
    this.MaintenanceForm.get("requestType").setValue(0);
  }

  PrintMaintenanceRequest(Lead: number) {
    debugger
    this.lang = this.jwtAuth.getLang();
    if (this.lang == "ar") {
      const reportUrl = `RptMaintenanceRequestAR?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptMaintenanceRequestEN?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  DeleteMaintenanceRequest(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      debugger
      if (result.value) {
        this.MaintenanceService.CancelMaintenanceRequest(id).subscribe((results) => {
          debugger
          if (results == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['Opportunities/OpportunitiesList']);
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {

            this.alert.DeleteFaild();
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  onRadioChange(value: number) {
    debugger
    this.MaintenanceForm.get("requestNo").setValue(0);
    this.MaintenanceForm.get("branchId").setValue(0);
    this.MaintenanceForm.get("areaId").setValue(0);
    this.MaintenanceForm.get("technicianId").setValue(0);
    this.MaintenanceForm.get("customerId").setValue(0);
    this.MaintenanceForm.get("salesRequestId").setValue(0);
    this.MaintenanceForm.get("note").setValue('');
    this.MaintenanceForm.get("MaintRequestDTsList").setValue([]);

    this.MaintenanceService.getNextRequestNo(value).subscribe(res => {
      debugger
      this.MaintenanceForm.get("requestNo")?.setValue(res);
    });
  }
  onSalesRequestChange(event: any){
    debugger
    const requestId = event.value;
    var custId = this.SalesRequestList.find(c=> c.id == requestId).data1;
    this.MaintenanceForm.get("customerId").setValue(Number(custId));
    this.onCustomerChange({ value: custId });
  }

  onCustomerChange(event: any) {
    debugger
    const dealerId = event.value;
    this.MaintenanceService.getDealerInfo(dealerId).subscribe(res => {
      debugger
      if (res != null) {
        this.MaintenanceForm.get('tel1')?.setValue(res.tel1);
        this.MaintenanceForm.get('tel2')?.setValue(res.tel2);
        this.MaintenanceForm.get('address')?.setValue(res.address);
      }
      else {
        this.MaintenanceForm.get('tel1')?.setValue("");
        this.MaintenanceForm.get('tel2')?.setValue("");
        this.MaintenanceForm.get('address')?.setValue("");
      }
    });
  }

  onSerialChange(rowOrSerial: any) {
    let row: any;

    if (typeof rowOrSerial === 'string') {
      row = { serialNo: rowOrSerial };
    } else if (typeof rowOrSerial === 'object' && rowOrSerial !== null) {
      row = rowOrSerial;
    } else {
      return;
    }

    row.itemId = null;

    if (!row.serialNo) {
      return;
    }


    this.MaintenanceService.getSerialInfo(row.serialNo).subscribe(res => {
      debugger
      if (res && res.exists) {
        row.itemId = res.itemId;
        row.materialName = res.materialName;
        row.model = res.model;
        row.invoiceNo = res.invoiceNo;
        row.underWarranty = res.isUnderWarranty;
        row.invoicedate = formatDate(res.invoicedate, "yyyy-MM-dd", "en-US");
        row.lastRequestNo = res.lastMaintenance?.requestNo;
        row.lastRequestDate = res.lastMaintenance?.requestDate
            ? formatDate(res.lastMaintenance.requestDate, "yyyy-MM-dd", "en-US")
            : null;
        row.maintenanceCount = res.maintenanceCount ?? 0;
        row.disableFields = true;
      } else {
        row.disableFields = false;
        row.itemId = 0;
        row.materialName = null;
        row.model = null;

        this.alert.ShowAlert("SerialNotFound", 'error');
      }
    });
  }

  onItemChange(row: any) {
    if (row.itemId != 0) {
      row.model = this.ItemsList.find(c=> c.id == row.itemId).model;
    }
    else {
      row.model = "";
    }
  }

  RequesNoBlur(requestNo, inRequest) {
    debugger
    if (!requestNo) return;

    let inReq = inRequest == 1 ? true : false;

    this.MaintenanceService.IsValidRequestNo(requestNo, inReq).subscribe(res => {
      debugger
      if (res.id && res.id > 0) {

        this.Id = res.id;

        if (res.status == 66) {
          this.opType = "Edit";
          this.showsave = false;
          this.disableAll = false;
        }
        else if (res.status == 67 || res.status == 68) {
          this.opType = "Show";
          this.showsave = true;
        }

        this.GetInitailMaintenanceRequest();

      } else {
        this.Id = 0;
        this.opType = "Add";
        this.showsave = false;
        this.disableAll = false;
        this.ClearAfterSave();
      }
    });
  }
  loadLazyOptions(event: any) {
    const { first, last } = event;

    if (!this.ItemsList) {
      this.ItemsList = [];
    }

    while (this.ItemsList.length < last) {
      this.ItemsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.ItemsList[i] = this.ItemsList[i];
    }

    this.loading = false;
  }
}
