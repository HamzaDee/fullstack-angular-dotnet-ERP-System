import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { FixedAssetsContractsService } from '../fixed-assets-contracts.service';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { AssetsContractsHDModel } from '../AssetsContractsHD';
import { environment } from 'environments/environment';
import { UplodeFileModel } from 'app/shared/models/UplodeFileModel';
import { UplodeFileService } from 'app/shared/services/upload-file.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { formatDate } from '@angular/common';
import { error } from 'console';


@Component({
  selector: 'app-fixed-assets-contracts-form',
  templateUrl: './fixed-assets-contracts-form.component.html',
  styleUrls: ['./fixed-assets-contracts-form.component.scss']
})
export class FixedAssetsContractsFormComponent implements OnInit {
public showLoader: boolean;
public ContractsForm: FormGroup;
public loading: boolean;
imagePath = "assets/images/defualt-upload.png";
file: File;
cardImageBase64: string;
public id: any;
public opType: string;
public assetsContractsList: any[] = [];
public CompanyBranchList: any;
public CurrenciesList: any;
public DealersList: any;
public FixedAssetsList: any;
public SelectCompanyBranch: number = 0;
public SelectCurrencies: number = 0;
public SelectDealers: number = 0;
public SelectFixedAssets: number = 0;
public Data: AssetsContractsHDModel = new AssetsContractsHDModel();
public data : Array<UplodeFileModel> =new Array<UplodeFileModel>();
exportData : any[];
@ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
showsave: boolean;
disableAll:boolean=false;
public TitlePage: string;
disableCurrRate:boolean;
defaultCurrencyId:number;
currentLang: string;
disableSave:boolean;

constructor(
  private title: Title,
  private jwtAuth: JwtAuthService,
  private alert: sweetalert,
  private translateService: TranslateService,
  public router: Router,
  private formbulider: FormBuilder,
  public routePartsService: RoutePartsService,
  private http: HttpClient,
  private FixedAssetsContractsService: FixedAssetsContractsService,
  private dialog: MatDialog,
  private route: ActivatedRoute,
  private changeDetectorRef: ChangeDetectorRef,
  private uplodeFileService: UplodeFileService) {}

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
  this.ContractsForm = this.formbulider.group({
    id                  : [0],
    companyId           : [0],
    contractNo          : [''],
    contractDate        : [new Date()],
    dealerId            : [0 , [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
    amount              : [0, Validators.required],
    branchId            : [0 ],    
    currencyId          : [0 , [Validators.required, Validators.pattern('^[1-9][0-9]*')]],    
    currRate            : [0],
    startDate           : [new Date()],
    endDate             : [new Date()],
    referenceNo         : [0],
    referenceDate       : [new Date()],
    noteHd              : [''],
    image               : [''],
    satus               : [0],
    assetId             : [0],  
    note                : [''],
    assetsContractsList : [null],
    assetsContractsDocModelList: [null], 
    ContractsDocList:[""], 
  });

  if (this.id  == undefined)
  this.router.navigate(['FixedAssetsContracts/AssetsContractsList']); 

  this.GetAssetsContractsFormInfo();
}

SetTitlePage() {
  this.TitlePage = this.translateService.instant('FixedAssetsContractsForm');
  this.title.setTitle(this.TitlePage);
}

GetAssetsContractsFormInfo() {
  debugger

  this.FixedAssetsContractsService.GetAssetsContractsForm(this.id, this.opType).subscribe((result) => {
    if(result.isSuccess == false && result.message ==="msNoPermission")
      {
        this.alert.ShowAlert("msNoPermission",'error');
        this.router.navigate(['FixedAssetsContracts/AssetsContractsList']); 
        return;
      }
      debugger
    this.CompanyBranchList = result.companyBranchList;
    this.CurrenciesList = result.currenciesList;
    this.DealersList = result.dealersList;
    this.FixedAssetsList = result.assestLists;
    this.assetsContractsList = result.assetsContractsDTList;
    this.defaultCurrencyId =result.defaultCurrId;

    if(result.id == 0){
      result.contractDate = formatDate(result.contractDate, "yyyy-MM-dd", "en-US")
      result.startDate = formatDate(result.startDate, "yyyy-MM-dd", "en-US")
      result.endDate = formatDate(result.endDate, "yyyy-MM-dd", "en-US")
      result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US")
    }

    this.Data = result;
    this.ContractsForm.patchValue(result);
    this.file = result.image;

    if (result.assetsContractsDTList != null){
      this.assetsContractsList.forEach(element => {
        this.assetsContractsList = result.assetsContractsDTList;   
      });
    }
    else{
      this.assetsContractsList = [
        {                    
          assetId :0,   
          note    :'',                
        }
      ]
    } 
  debugger
    const source$ = of(1, 2);
    source$.pipe(delay(0)).subscribe(value => {
    debugger
    this.disableSave = false;
    if (this.id > 0) {
      debugger
      this.ContractsForm.get("currencyId").setValue(result.currencyId);
      this.ContractsForm.get("branchId").setValue(result.branchId); 
      this.ContractsForm.get("dealerId").setValue(result.dealerId); 


      if(result.branchId == null) 
        {
          this.ContractsForm.get("branchId").setValue(0); 
        } 
        
      //this.SelectDealers = result.dealerId;
      if(this.Data.noteHd != null){
        this.Data.noteHd = result.note; 
      }
      else{
        this.Data.noteHd = ''; 
      }

      if (result.allowMultiCurrency == false) {
        const defaultCurrency = result.currenciesList.find(currency => currency.id === result.currencyId);
        this.CurrenciesList = [defaultCurrency]; 
        this.ContractsForm.get("currencyId").setValue(result.currencyId);          
      }

      if (result.allowMultiBranch == false) {
        const defaultBranche = result.companyBranchList.find(branche => branche.id === result.branchId);
        this.CompanyBranchList = [defaultBranche]; 
        this.ContractsForm.get("branchId").setValue(result.branchId); 
      }

      if(this.ContractsForm.value.currencyId == this.defaultCurrencyId)
        {
          this.disableCurrRate = true;
        }
      else
        {
          this.disableCurrRate = false;
        }
    }
    else{
      debugger
      this.ContractsForm.get("amount").setValue(""); 
      this.ContractsForm.get("branchId").setValue(result.defaultBranchId);        
      this.Data.contractDate = new Date();
      this.Data.startDate = new Date();
      this.Data.endDate = new Date();
      this.Data.referenceDate = new Date();
      this.ContractsForm.get("currencyId").setValue(result.defaultCurrId);
        var currRate = result.currenciesList.find(option => option.id === result.defaultCurrId).data1;
      this.ContractsForm.get("currRate").setValue(currRate);

      if(this.ContractsForm.value.currencyId == this.defaultCurrencyId)
        {
          this.disableCurrRate = true;
        }
      else
        {
          this.disableCurrRate = false;
        }

      if (result.allowMultiCurrency == false) {
        const defaultCurrency = result.currenciesList.find(currency => currency.id === result.defaultCurrId);
        this.CurrenciesList = [defaultCurrency]; 
        this.ContractsForm.get("currencyId").setValue(defaultCurrency.id); 
      }

      if (result.allowMultiBranch == false) {
        const defaultBranche = result.companyBranchList.find(branche => branche.id === result.defaultBranchId);
        this.CompanyBranchList = [defaultBranche]; 
        this.ContractsForm.get("branchId").setValue(defaultBranche.id);
      }
    }

  });
  debugger
    if (result.contractsAttachments !== undefined && result.contractsAttachments !== null)
    {
      this.ContractsForm.get("assetsContractsDocModelList").setValue(result.contractsAttachments);
      this.childAttachment.data = result.contractsAttachments;
      this.childAttachment.ngOnInit();
    }


  });
}

isDisabled(assetId: any): boolean {
  const selectedAsset = this.FixedAssetsList.find(asset => asset.id === assetId);
  return selectedAsset ? selectedAsset.status == 97 : false;
}

CheckContractNo(contractNo: string){
  debugger
  const ContractNo = Number(contractNo);
  this.FixedAssetsContractsService.CheckContractNo(ContractNo).subscribe((result) => {
    debugger

    if(result >0){

      this.alert.ShowAlert("thevaluecontractnoisexist","error");
      this.ContractsForm.get("contractNo").setValue(result);
    }
  });
}

getCurrencyRate(event: any) {
  const selectedValue = event.value;
  var currRate = this.CurrenciesList.find(option => option.id === selectedValue).data1;
  this.ContractsForm.get("currRate").setValue(currRate);
  if(event.value == this.defaultCurrencyId)
    {
      this.disableCurrRate=true;
    }
  else
    {
      this.disableCurrRate = false;
    }
}

/*  onUploadIamge(event) {
  if (event) {
    this.file = event[0];
    var reader = new FileReader();
    reader.readAsDataURL(event[0]);
    reader.onload = (event: any) => {
      this.imagePath = event.target.result;
      const imgBase64Path = event.target.result;
      this.cardImageBase64 = imgBase64Path;
    }
  }
}

ClearImagePath(image): void {
  image.value = "";
  this.imagePath = "assets/images/defualt-upload.png";
} */

AddNewLine(){ 
  if(this.disableAll ==true)
    {
      return;
    }  
    debugger
  if (this.assetsContractsList === null || this.assetsContractsList === undefined) {
    this.assetsContractsList = [];
  }

    const newRow = {         
    assetId :0,   
    note    :'',   		
    };
  this.assetsContractsList.push(newRow);
}

deleteRow(rowIndex: number) {
  if (rowIndex !== -1) {
    this.assetsContractsList.splice(rowIndex, 1);
  }
}

OnSaveForms(){
  debugger
  let isValid = true;
  this.disableSave = true;
  if (this.assetsContractsList.length <= 0) {
    this.alert.ShowAlert("msgEnterAllData", 'error');
    isValid = false;
    this.disableSave = false;
    return;
  }

  if(this.ContractsForm.value.startDate > this.ContractsForm.value.endDate){
    isValid = false;
    this.disableSave = false;
    this.alert.ShowAlert("StartDateGratterThanEndDate",'error');
    return;
  }

  this.assetsContractsList.forEach(element => {
    if (element.assetId == null || element.assetId <= 0)
    {
      isValid = false;
      this.disableSave = false;
      this.alert.ShowAlert("msgEnterAllData",'error');
      return;
    } 
  });

  if (isValid) {
  debugger
  this.changeDetectorRef.detectChanges();
  const formData = new FormData();
  this.ContractsForm.value.assetsContractsList     = this.assetsContractsList;
  this.ContractsForm.value.assetsContractsDocModelList = this.childAttachment.getVoucherAttachData();

  formData.append('Id', this.ContractsForm.value.id);
  formData.append('contractNo',this.ContractsForm.value.contractNo);
  formData.append('contractDate',this.ContractsForm.value.contractDate);
  formData.append('amount',this.ContractsForm.value.amount);
  formData.append('branchId',this.ContractsForm.value.branchId);
  formData.append('currencyId',this.ContractsForm.value.currencyId);
  formData.append('currRate',this.ContractsForm.value.currRate);
  formData.append('dealerId',this.ContractsForm.value.dealerId);
  formData.append('startDate',this.ContractsForm.value.startDate);
  formData.append('endDate',this.ContractsForm.value.endDate);
  formData.append('referenceNo',this.ContractsForm.value.referenceNo ?? 0);
  formData.append('referenceDate',this.ContractsForm.value.referenceDate);
  formData.append('note',this.ContractsForm.value.noteHd ?? '');
  formData.append("assetsContractsList", JSON.stringify(this.assetsContractsList));
  formData.append("ContractsDocList", JSON.stringify(this.ContractsForm.value.assetsContractsDocModelList));

  /*  if(this.file == undefined){
    formData.append("file", null)
    formData.append("image", null)
  }
  else{
    formData.append("file", this.file)
    formData.append("image", this.file.type)
  } */

  this.FixedAssetsContractsService.saveAssetContractsForm(formData).subscribe((result) => {

    if (result.isSuccess== true) {
      this.alert.SaveSuccess();
      this.ClearAfterSave();
      if(this.opType == 'Edit' || this.opType == 'Copy')
        { 
          this.router.navigate(['FixedAssetsContracts/AssetsContractsList']);
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

ClearAfterSave()
{
  debugger
  this.ContractsForm.value.generalAttachModelList = [];
  this.childAttachment.data =[];
}

CheckIfChooseSameAssest(i, row) {
  debugger
  for (let j = 0; j < this.assetsContractsList.length; j++) {
      if (i !== j && this.assetsContractsList[i].assetId === this.assetsContractsList[j].assetId) {

          this.alert.CanntSameAssestID();
          this.assetsContractsList[i].assetId = [];
          break; 
      }

  }
}

CopyRow(row,index)
  {
  debugger

  this.assetsContractsList.push(
    {
      assetId :0,   
      note    :row.note,  
    });
    return false;
  }

  handleF3Key(event: KeyboardEvent, row, index) {   
     
    if (event.key === 'F4') {
      this.CopyRow(row,index);
    }
  }
}
