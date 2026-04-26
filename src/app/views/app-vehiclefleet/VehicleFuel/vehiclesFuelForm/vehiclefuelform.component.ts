import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { VehicleFuelService } from '../vehicleFuel.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-vehiclefuelform',
  templateUrl: './vehiclefuelform.component.html',
  styleUrl: './vehiclefuelform.component.scss'
})
export class VehiclefuelformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  CheckUpsAddForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  opType: string;
  voucherId: any;
  isdisabled: boolean = false;
  showLoader = false;
  decimalPlaces: number;
  disableAll: boolean;
  disableSave: boolean;
  lang: string;
  NewDate: any;
  showsave: boolean;
  vehiclesList: any;
  fuelTypesList: any;
  vehiclesFuelList: any[] = [];
  skipModelChange: boolean = false;

  headers = [
    { field: 'MechanismNo', label: this.translateService.instant('MechanismNo') },
    { field: 'FromDate', label: this.translateService.instant('FromDate') },
    { field: 'ToDate', label: this.translateService.instant('ToDate') },
    { field: 'DistanceTraveled', label: this.translateService.instant('DistanceTraveled') },
    { field: 'AmountOfFuelConsumed', label: this.translateService.instant('AmountOfFuelConsumed') },
    { field: 'PricePerLiter', label: this.translateService.instant('PricePerLiter') },
    { field: 'Value', label: this.translateService.instant('Value') },
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
      private Service: VehicleFuelService,
      private cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    debugger
    this.disableSave = false;


    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
      this.voucherId = queryParams.get('GuidToEdit');
      this.opType = 'Show';
      this.showsave = true;
    }
    else {
      this.voucherId = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
      this.showsave = this.routePartsService.Guid3ToEdit;
    }
    if (this.route.snapshot.queryParamMap.has('opType')) {
      this.opType = this.route.snapshot.queryParamMap.get('opType');
      this.voucherId = 0;
    }
    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['VehicleFuel/VehiclefuelList']);
    }
    this.InitiailVehicleFuelForm();
    this.GetInitailVehicleFuel();
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
    this.TitlePage = this.translateService.instant('VehiclefuelForm');
    this.title.setTitle(this.TitlePage);
  }
  InitiailVehicleFuelForm() {
    this.CheckUpsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherDate: ["", [Validators.required]],
      voucherNo: [0, [Validators.required, Validators.min(1)]],
      vehicleFuelModels: [null, [Validators.required, Validators.min(1)]],
      generalAttachModelList: [null],
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetInitailVehicleFuel() {
    this.Service.GetInitailVehicleFuel(this.voucherId, this.opType).subscribe(result => {
      if (!result.isSuccess && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['VehicleFuel/VehiclefuelList']);
        return;
      }
      debugger
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US");
      this.fuelTypesList = result.fuelTypesList;
      this.vehiclesList = result.vehiclesList.map((item) => ({
        id: item.id,
        text: item.notes,
        plateNo: item.plateNo,
        fuelTypeId: item.fuelTypeId,
      }));

      if (result.vehicleFuelModels != null && result.vehicleFuelModels.length > 0) {
        this.vehiclesFuelList = result.vehicleFuelModels;
        this.vehiclesFuelList.forEach(element => {
          element.transFromDate = formatDate(element.transFromDate, "yyyy-MM-dd", "en-US");
          element.transToDate = formatDate(element.transToDate, "yyyy-MM-dd", "en-US");
          this.onPriceOrQtyChange(element);
        });
        this.CheckUpsAddForm.get("vehicleFuelModels").setValue(this.vehiclesFuelList);
      }
      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.CheckUpsAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
      this.CheckUpsAddForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        this.CheckUpsAddForm.get("id").setValue(result.id);
        this.CheckUpsAddForm.get("voucherDate").setValue(result.voucherDate);
        this.CheckUpsAddForm.get("voucherNo").setValue(result.voucherNo);
      });
    })
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    if (this.vehiclesFuelList.length > 0) {
      for (let i = 0; i < this.vehiclesFuelList.length; i++) {
        const element = this.vehiclesFuelList[i];
        if (element.vehicleId == 0 || element.vehicleId == undefined || element.vehicleId == null) {
          this.alert.ShowAlert("msgEnterAllData", 'error');
          this.disableSave = false;
          return false;
        }
        if (element.plateNo == "" || element.plateNo == undefined || element.plateNo == null) {
          this.alert.ShowAlert("msgEnterAllData", 'error');
          this.disableSave = false;
          return false;
        }
        if (element.fuelTypeId == 0 || element.fuelTypeId == undefined || element.fuelTypeId == null) {
          this.alert.ShowAlert("msgEnterAllData", 'error');
          this.disableSave = false;
          return false;
        }
        if (element.price == 0 || element.price == undefined || element.price == null) {
          this.alert.ShowAlert("msgEnterAllData", 'error');
          this.disableSave = false;
          return false;
        }
        if (element.qty == 0 || element.qty == undefined || element.qty == null) {
          this.alert.ShowAlert("msgEnterAllData", 'error');
          this.disableSave = false;
          return false;
        }
        if (element.total == 0 || element.total == undefined || element.total == null) {
          this.alert.ShowAlert("msgEnterAllData", 'error');
          this.disableSave = false;
          return false;
        }
        if (!this.isValidDate(element.transFromDate)) {
          this.alert.ShowAlert("Please enter a valid transaction date.", 'error');
          this.disableSave = false;
          return false;
        }
        if (!this.isValidDate(element.transToDate)) {
          this.alert.ShowAlert("Please enter a valid transaction date.", 'error');
          this.disableSave = false;
          return false;
        }
        if (element.transFromDate > element.transToDate) {
          this.alert.ShowAlert("TheFromdateofthemechanismmustbegreaterthantheTodate", 'error');
          this.disableSave = false;
          return false;
        }
        element.i = i.toString();
      }
    }

    debugger
    this.CheckUpsAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.CheckUpsAddForm.value.userId = this.jwtAuth.getUserId();
    this.CheckUpsAddForm.value.vehicleFuelModels = this.vehiclesFuelList;
    if (this.opType == 'Add') {
      this.CheckUpsAddForm.get("id").setValue(0);
    }
    debugger
    this.CheckUpsAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    this.Service.SaveVehiclesFuel(this.CheckUpsAddForm.value)
      .subscribe((result) => {
        debugger

        if (result) {
          this.alert.SaveSuccess();
          this.disableSave = false;
          this.clearFormdata();
          if (this.opType == 'Edit') {
            this.router.navigate(['VehicleFuel/VehiclefuelList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ngOnInit();
        }
        else {
          this.alert.SaveFaild();
        }
      })
  }

  AddNewLine() {
    debugger
    if (this.disableAll == true) {
      return;
    }

    this.vehiclesFuelList ??= [];
    this.vehiclesFuelList.push(
      {
        id: 0,
        vehicleId: 0,
        plateNo: "",
        fuelTypeId: 0,
        transFromDate: "",
        transToDate: "",
        millage: 0,
        station: "",
        price: "",
        qty: "",
        total: "",
        index: "",
        totalKM20:0
      });
    this.CheckUpsAddForm.get("vehicleFuelModels").setValue(this.vehiclesFuelList);
  }

  calculateSum() {
    return this.formatCurrency(
      this.vehiclesFuelList.reduce((sum, item) => {
        const tot = parseFloat(item.total);
        const validTot = isNaN(tot) ? 0 : tot;
        return sum + (validTot);
      }, 0)
    );
  }

  deleteRow(rowIndex: number) {
    this.vehiclesFuelList.splice(rowIndex, 1);
    this.CheckUpsAddForm.get("vehicleFuelModels").setValue(this.vehiclesFuelList);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  formatAmt(row: any) {
    row.price = row.price.toFixed(this.decimalPlaces);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  DeleteVoucher(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.Service.DeleteVoucherVehicleFuel(this.CheckUpsAddForm.value.voucherNo).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['VehicleFuel/VehiclefuelList']);
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
        // No action needed if the user cancels
      }
    })
  }

  PrintPurchaseRequest(id: number) {
    this.lang = this.jwtAuth.getLang();
    if (this.lang == 'ar') {
      const reportUrl = `RptPurchaseRequestAr?VId=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptPurchaseRequestEn?VId=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  clearFormdata() {
    this.NewDate = new Date;
    this.CheckUpsAddForm.get("id").setValue(0);
    this.CheckUpsAddForm.get("voucherNo").setValue(0);
    this.CheckUpsAddForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.vehiclesFuelList = [];
    this.CheckUpsAddForm.get("vehicleFuelModels").setValue([]);
    this.CheckUpsAddForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
  }

  getVehicleDetails(event: any, index: number): void {
    debugger
    const vehicle = this.vehiclesList.find(x => x.id == event.value);
    if (vehicle) {
      this.vehiclesFuelList[index].plateNo = vehicle.plateNo;
      this.vehiclesFuelList[index].fuelTypeId = vehicle.fuelTypeId;
      this.cdr.detectChanges();
    } else {
      this.vehiclesFuelList[index].PlateNo = null;
      this.vehiclesFuelList[index].FuelTypeId = 0;
    }
  }

  isDateInvalid(dateStr: string | Date | null): boolean {
    if (!dateStr) return true;

    const date = new Date(dateStr);
    return isNaN(date.getTime()); // Invalid if not a valid date
  }


  onPriceOrQtyChange(vFuel: any): void {
    const price = parseFloat(vFuel.price) || 0;
    const qty = parseFloat(vFuel.qty) || 0;

    // Format price and qty
    vFuel.price = parseFloat(price.toFixed(3));
    vFuel.qty = parseFloat(qty.toFixed(3));

    // حساب total
    vFuel.total = parseFloat((price * qty).toFixed(3));


    vFuel.totalKM20 = parseFloat(((vFuel.millage / vFuel.qty) * 20).toFixed(3));
  }


  isValidDate(date: any): boolean {
    return !!date && !isNaN(Date.parse(date));
  }

  exportHeadersToExcel() {
    const headerNames = this.headers.map(h => h.label);
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headerNames]);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Headers');
    XLSX.writeFile(wb, 'VehicleFuelList.xlsx');
  }

  ImportFromExcel(event: any): void {
    debugger
    const target: DataTransfer = <DataTransfer>event.target;
    const fileInput = event.target as HTMLInputElement;

    if (target.files.length !== 1) {
      console.error('Cannot use multiple files');
      return;
    }

    const file: File = target.files[0];
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const binaryStr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryStr, { type: 'binary' });
      const firstSheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];

    const excelData = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });

      this.Service.ImportFromExcel(excelData).subscribe(
        (response) => {
          debugger
          if (response.length > 0) {
            this.vehiclesFuelList = response;
            this.vehiclesFuelList.forEach(element => {
              element.transFromDate = formatDate(element.transFromDate, "yyyy-MM-dd", "en-US");
              element.transToDate = formatDate(element.transToDate, "yyyy-MM-dd", "en-US");
            });

            this.vehiclesFuelList.forEach(element => {
              element.vehicleId = element.vehicleId;
              const vehicle = this.vehiclesList.find(x => x.id == element.vehicleId);
              if (vehicle) {
                element.plateNo = vehicle.plateNo;
                element.fuelTypeId = vehicle.fuelTypeId;
              }
              // element.dividerValue = parseFloat(((element.millage / element.qty) * 20).toFixed(3));

            });

            this.CheckUpsAddForm.get("vehicleFuelModels").setValue(this.vehiclesFuelList);
          }
          else {
            this.alert.ShowAlert('Import failed', 'error')
            fileInput.value = "";
          }

        },
        (error) => { this.alert.ShowAlert('Import failed', 'error'); fileInput.value = ""; }
      );
    };

    reader.readAsBinaryString(file);
  }


  onImportClick(fileInput: HTMLInputElement) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('PleaseMakeSurePlateNoAndFuelTypeUenteredInTheExcelAlreadyExistsInTheSystem'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        fileInput.click();
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
        return false;
      }
    })
  }

  onDividerValueChange() {
    this.vehiclesFuelList.forEach(vFuel => {
      this.calculateResult(vFuel);
    });
  }

  calculateResult(vFuel: any) {
    // debugger
    // if (this.dividerValue && this.dividerValue !== 0) {
    //   this.dividerValue = (vFuel.qty / this.dividerValue) * 20;
    // } else {
    //   this.dividerValue = 0;
    // }
  }
}