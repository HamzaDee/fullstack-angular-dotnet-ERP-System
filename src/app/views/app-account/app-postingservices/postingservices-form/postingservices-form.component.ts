import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,AbstractControl } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { postServingService } from '../postingservice.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-postingservices-form',
  templateUrl: './postingservices-form.component.html',
  styleUrls: ['./postingservices-form.component.scss']
})
export class PostingservicesFormComponent implements OnInit {
  PostingServiceAddForm: FormGroup;
  selectedtype: any;
  selectedbranch: any;
  voucherstypeList: any;
  userbranchList: any;
  DateNow : Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  isHidden: boolean = true;
  isPost: number = 1;
  voucherData: any;
  newVouchersList : any ;
  selectAll: boolean = false;
  isAnyRowChecked: boolean = false;
  public TitlePage: string;


  constructor(  private title: Title,
    private formbulider: FormBuilder,
    private translateService: TranslateService ,
    private postServingService: postServingService,
    private alert: sweetalert,
    public ValidatorsService:ValidatorsService,
    private jwtAuth: JwtAuthService,) 
    { }



  ngOnInit(): void {
    debugger
    this.SetTitlePage();
    this.GetpostServiceForm();
    this.GetpostServiceInitialForm();
    this.updateIsAnyRowChecked()
  }


  SetTitlePage() {
    this.TitlePage = this.translateService.instant('postingServiceform');
    this.title.setTitle(this.TitlePage);
  }
  
  GetpostServiceForm() {
    debugger
      this.PostingServiceAddForm = this.formbulider.group({
        id: [0],
        companyId: [0],
        voucherTypeId:[0],
        voucherNoFrom:[0],
        voucherNoTo:[0],
        fromDate:[''],
        toDate:[''],
        isPosted:[false],
        branchId:[0],
        note:[null],
        voucherNo:[0],
        voucherDate:[''],
        voucherName:[''],
        newVouchersList:[],
        post: [0]
      });
    }
  
    GetpostServiceInitialForm() {
      this.postServingService.GetPostingServiceForm().subscribe((result) => {
        debugger
        if(result.isSuccess == false && result.message =="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
      this.voucherstypeList = result.voucherTypesList;
      this.userbranchList = result.userCompanyBranchList;
      this.newVouchersList =result.newVouchersList;
      debugger
      this.PostingServiceAddForm.patchValue(result);
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.PostingServiceAddForm.patchValue(result); 
       
      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        if(result.VoucherTypeId == null || result.VoucherTypeId == undefined)
          {
            result.VoucherTypeId = 0;
          }
        if(result.branchId == null || result.branchId == undefined)
          {
            result.branchId = 0;
          }
      this.selectedtype = result.VoucherTypeId;
      this.selectedbranch = result.branchId;
      this.isPost = 1 ; 
      this.PostingServiceAddForm.value.post = this.isPost; 
        });
      });
      
    }


    GetVouchers() {
      debugger
      
      const formValues = this.PostingServiceAddForm.value;
      if(formValues.branchId == null){
        formValues.branchId = 0;
      }
      this.postServingService.GetVouchers(
        formValues.id,
        formValues.post,
        formValues.voucherTypeId,
        formValues.voucherNoFrom,
        formValues.voucherNoTo,
        formValues.fromDate,
        formValues.toDate, 
        formValues.branchId,
        formValues.note
      ).subscribe((result) => {
        debugger
        // Handle the response from the API here
        // result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
        this.voucherData = result;
        
      });
      
    }

    toggleAllCheckboxes(event: any) {
      const isChecked = event.target.checked;
      for (let row of this.voucherData) {
        row.isChecked = isChecked;
      }
      this.updateIsAnyRowChecked()
    }

    OnSaveForms() {
    debugger

      if (this.isPost == 1 )
      {
        this.PostingServiceAddForm.value.post = 1
      }
      else
      (
        this.PostingServiceAddForm.value.post = 0
      );

      this.PostingServiceAddForm.value.companyId = this.jwtAuth.getCompanyId();
      this.PostingServiceAddForm.value.newVouchersList = this.gatherCheckedRows(); 
      this.postServingService.SavePostingVoucher(this.PostingServiceAddForm.value)
        .subscribe(() => {
          debugger
          this.alert.SaveSuccess()
          // this.GetpostServiceForm();
          // this.GetpostServiceInitialForm();
          this.clearFormData();
          
          
          this.PostingServiceAddForm.value.GetpostServiceFromParent()
          
        })
     
    }




gatherCheckedRows() {
  const checkedRows = this.voucherData.filter((row) => row.isChecked === true);
  return checkedRows;
}




    clearFormData() {
      this.PostingServiceAddForm.reset(); // Reset the form
      this.voucherData = []; // Clear the table data
      this.GetpostServiceInitialForm();
      this.updateIsAnyRowChecked()
    }

    updateIsAnyRowChecked() {
      this.isAnyRowChecked = this.voucherData.some((row) => row.isChecked);
    }

}
