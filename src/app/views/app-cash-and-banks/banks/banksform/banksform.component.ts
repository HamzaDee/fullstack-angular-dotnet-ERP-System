import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { BankssService } from '../banks.service';
@Component({
  selector: 'app-banksform',
  templateUrl: './banksform.component.html',
  styleUrls: ['./banksform.component.scss']
})
export class BanksformComponent implements OnInit {
  BankAddForm: FormGroup;
  selectedType:any;
  selectedcardType:any;
  accountsList: any;
  accountTypeList:any;
  accountlist1:any;
  accountlist2:any;
  cardTypeList:any;
  DateNow : Date = new Date();
  isActive: number = 0;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  disableAll:boolean=false;

  constructor
            (
              @Inject(MAT_DIALOG_DATA) public data: any,
              private formbulider: FormBuilder,
              public dialogRef: MatDialogRef<any>,
              private BankssService: BankssService,
              private alert: sweetalert,
              private jwtAuth: JwtAuthService,
            ) 
            {}

  ngOnInit(): void {

    setTimeout(() => {
      this.disableAll = this.data.ishidden;
    });


    this.GetBanksInitialForm()   
    this.GetBanks();
  }
  
  GetBanksInitialForm() {
    this.BankAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],   
      bankNameA:['',[Validators.required, Validators.min(1)]],
      bankNameE:['',[Validators.required, Validators.min(1)]],
      accBankNo:[''],
      bankTypeId:[0,[Validators.required, Validators.min(1)]],
      accId:[0],
      ibanCode:[''],
      swiftCode:[''],
      contactPerson:[''],
      email:['',[Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      tel:[''],
      mobile:[''],
      website:[''],
      address:[''],
      deferredCheqAccId:[0],
      underCollectionCheqAccId:[0],
      creditCardNo:[''],
      cardExpiryDate:[''],
      cardTypeId:[0],
      note:[''],
      active:[0],
    });
  }


  private customEmailValidator(control) {
    if (control.value && Validators.email(control)) {
      return { invalidEmailFormat: true };
    }
    return null;
  }

   GetBanks() {
    debugger
if(this.data.id !==0 && this.data.id !== null)
{
  this.BankssService.GetBanksFormById(this.data.id, this.data.ishidden).subscribe((result) => {
    debugger      
    if(result.isSuccess == false && result.message =="msNoPermission")
      {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.dialogRef.close(false)
        return;
      }
    this.accountsList = result.accountList;
    this.accountTypeList = result.bankTypeList;
    this.accountlist1 = result.accountList;
    this.accountlist2 = result.accountList;
    this.cardTypeList = result.creditCardList;

    this.BankAddForm.patchValue(result); 
    const source$ = of(1, 2);
    source$.pipe(delay(0)).subscribe(value => {
      debugger
    //      
    this.BankAddForm.get("bankNameA").setValue(result.bankNameA)
    this.BankAddForm.get("bankNameE").setValue(result.bankNameE)
    this.BankAddForm.get("accBankNo").setValue(result.accBankNo)
    this.BankAddForm.get("bankTypeId").setValue(result.bankTypeId)
    this.BankAddForm.get("accId").setValue(result.accId)
    this.BankAddForm.get("ibanCode").setValue(result.iBanCode)
    this.BankAddForm.get("swiftCode").setValue(result.swiftCode)
    this.BankAddForm.get("contactPerson").setValue(result.contactPerson)
    this.BankAddForm.get("email").setValue(result.email)  
    this.BankAddForm.get("tel").setValue(result.tel)
    this.BankAddForm.get("mobile").setValue(result.mobile)
    this.BankAddForm.get("website").setValue(result.website)
    this.BankAddForm.get("address").setValue(result.address)
    this.BankAddForm.get("deferredCheqAccId").setValue(result.deferredCheqAccId)
    this.BankAddForm.get("underCollectionCheqAccId").setValue(result.underCollectionCheqAccId)        
    this.BankAddForm.get("creditCardNo").setValue(result.creditCardNo)
    if(result.cardExpiryDate !== null)
    {
      this.BankAddForm.get("cardExpiryDate").setValue(formatDate( result.cardExpiryDate , "yyyy-MM-dd" ,"en-US"))  
    }    
    this.BankAddForm.get("cardTypeId").setValue(result.cardTypeId)
    this.BankAddForm.get("note").setValue(result.note)
    this.BankAddForm.get("active").setValue(result.active)
 debugger
  if(result.accId == null || result.accId == undefined) 
    {
      result.accId = 0;
    }
  if(result.bankTypeId == null || result.bankTypeId == undefined) 
    {
      result.acbankTypeIdcId = 0;
    }
  if(result.deferredCheqAccId == null || result.deferredCheqAccId == undefined) 
    {
      result.deferredCheqAccId = 0;
    }
  if(result.underCollectionCheqAccId == null || result.underCollectionCheqAccId == undefined) 
    {
      result.underCollectionCheqAccId = 0;
    }

    this.selectedType=result.bankTypeId;
    if(result.cardTypeId == null)
    {
      this.selectedcardType=0;  
    }
    else
    {
      this.selectedcardType=result.cardTypeId;
    }
    
    this.isActive = result.active;
    });                  
  });  
}
else
{
  this.BankssService.GetBanksForm(this.data.id).subscribe((result) => {
    debugger      
    if(result.isSuccess == false && result.message =="msNoPermission")
      {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.dialogRef.close(false)
        return;
      }
    this.accountsList = result.accountList;
    this.accountTypeList = result.bankTypeList;
    this.accountlist1 = result.accountList;
    this.accountlist2 = result.accountList;
    this.cardTypeList = result.creditCardList;

    this.BankAddForm.patchValue(result); 
    const source$ = of(1, 2);
    source$.pipe(delay(0)).subscribe(value => {
      debugger
    this.isActive =0;
    if(result.accId == null || result.accId == undefined) 
      {
        result.accId = 0;
      }
    if(result.bankTypeId == null || result.bankTypeId == undefined) 
      {
        result.acbankTypeIdcId = 0;
      }
    if(result.accId1 == null || result.accId1 == undefined) 
      {
        result.accId1 = 0;
      }
    if(result.accId2 == null || result.accId2 == undefined) 
      {
        result.accId2 = 0;
      }
    this.selectedType=result.bankTypeId;
    this.selectedcardType=0;
    });                  
  });  
}
      
  }


  validatePhoneNumber(phone: string): boolean {
    const pattern = /^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    return pattern.test(phone);
  }

  OnSaveForms() {
    debugger  
    const tel1 = this.BankAddForm.value.tel || '';
    const tel2 = this.BankAddForm.value.mobile || '';

    if (tel1 !== '' && !this.validatePhoneNumber(tel1)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return;
    }

    if (tel2 !== '' && !this.validatePhoneNumber(tel2)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return;
    }
    

    const formValues = this.BankAddForm.value;
    if(this.isActive == 1)
    {
      formValues.active = true;
    }
    else
    {
      formValues.active = false;
    }
    if(formValues.deferredCheqAccId == 0 )
    {      
      formValues.deferredCheqAccId = null;
    }
    if(formValues.underCollectionCheqAccId == 0 )
    {      
      formValues.underCollectionCheqAccId = null;
    }
    if(this.selectedcardType==0)
    {
      formValues.cardTypeId = null;
    }

    this.BankAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.BankssService.PostBanks(this.BankAddForm.value)
      .subscribe((result) => { 
        debugger
        if(result.isSuccess == false)
        {
          this.alert.ShowAlert(result.message,'error');
          
        }
        else
        {
          this.alert.SaveSuccess()
          this.dialogRef.close(this.data.GetVoucheriterationListFromParent());    
              
        }
          
      })
  }

  

   validateEndDate(control: AbstractControl): ValidationErrors | null {
    const endDateValue = control.value;
    if (endDateValue === null || endDateValue === '') {
      return null; // Allow empty endDate
    }
  
    if (isNaN(Date.parse(endDateValue))) {
      return { invalidDate: true };
    }
  
    return null;
  }
  
}
// function websiteUrlValidator(control) {
//   const pattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
//   if (control.value && !pattern.test(control.value)) {
//     return { invalidWebsiteUrl: true };
//   }
//   return null;
// }