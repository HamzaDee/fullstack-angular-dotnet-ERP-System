import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { formatDate } from '@angular/common';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { MmangerService } from '../marketmanger.service';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-mmangerform',
  templateUrl: './mmangerform.component.html',
  styleUrl: './mmangerform.component.scss'
})
export class MmangerformComponent {
  MarketMangerForm: FormGroup;
  selectedaccount: any;
  accountsList: any;
  DateNow : Date = new Date();
  active: number;
  closed: number;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  disable:boolean;
  disableCloseYear:boolean;
  marketsList:any;
  agentsList:any;
  filteredAgentsList: any[] = [];
  disableSave:boolean;
  disable2:boolean;
  disableAll:boolean;
  optype:any;
  constructor( 
  @Inject(MAT_DIALOG_DATA) public data: any,
  private formbulider: FormBuilder,
  public dialogRef: MatDialogRef<any>,  
  public validatorsService:ValidatorsService,
  private alert: sweetalert,  
  private jwtAuth: JwtAuthService,
  private Mservice: MmangerService,
  ) { } 

  ngOnInit(): void {
    debugger
  this.optype = this.data.optype;
  this.MarketMangerForms()
  this.GetMarketMangerInitialForm();
  if(this.data.id > 0)
    {
      this.disable2 = true;
    }
  else
    {
      this.disable2 = false;
    }
  if(this.data.optype == 'Show')
      {
        this.MarketMangerForm.get('email')?.disable();
        this.MarketMangerForm.get('nameA')?.disable();
        this.MarketMangerForm.get('nameE')?.disable();
        this.MarketMangerForm.get('mobile')?.disable();
        this.MarketMangerForm.get('password')?.disable();
        this.MarketMangerForm.get('sendMail')?.disable();
        this.MarketMangerForm.get('marketId')?.disable();
        this.MarketMangerForm.get('agentId')?.disable();
        this.disableAll = true;
    }
  else
      {
        this.disableAll = false;
    }     
  }

  MarketMangerForms() {
    this.MarketMangerForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      nameA: ["",[Validators.required, Validators.min(1)]],
      nameE: ["",[Validators.required, Validators.min(1)]],
      marketId:["",[Validators.required, Validators.min(1)]],
      agentId:[""],
      password: ["",[Validators.required, Validators.min(1)]],
      mobile: [""],
      email: ["", [Validators.required, Validators.email]],      
      sendMail: [0],      
    });
  }

  GetMarketMangerInitialForm() {    
    this.Mservice.GetMarketMangersForm(this.data.id , this.optype).subscribe((result) => {
      if (result.isSuccess === false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.dialogRef.close(false);
        return;
      }     
      this.marketsList = result.marketsList;
      this.agentsList = result.agentsList;
      this.filteredAgentsList = [...this.agentsList];
      if (this.data.isNew === false) {
        this.disable = true;
      } else {
        this.disable = false;
      }
      if (this.data.isNew === false) 
        {
          const agentIds = result.agentId ? result.agentId.split(',').map(id => +id.trim()): [];
          const marketIds = result.marketId ? result.marketId.split(',').map(id => +id.trim()): [];
          this.MarketMangerForm.patchValue({
            ...result,
            agentId: agentIds,
            marketId: marketIds,
          });
        }
        else
        {
          this.MarketMangerForm.get("marketId").setValue("");
          this.MarketMangerForm.get("agentId").setValue("");
        }     
    });
  }
  
  OnSaveForms() {
    debugger
    this.disableSave = true;
    if (this.active == 1) {
      this.MarketMangerForm.value.sendMail = 1;
    }
    else {
      this.MarketMangerForm.value.sendMail = 0;
    }
    let AgentsArray = this.MarketMangerForm.value.agentId;
    if (Array.isArray(AgentsArray)) {
      let validAgent = AgentsArray
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let AgentsssString = validAgent.join(',');
      this.MarketMangerForm.get("agentId").setValue(AgentsssString);
      console.log('Filtered paymentMethod:', AgentsssString);
    } else {
      console.error('paymentMethod is not an array');
    }


    let CountriesArray = this.MarketMangerForm.value.marketId;
    if (Array.isArray(CountriesArray)) {
      let validCountry = CountriesArray
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let CountriesString = validCountry.join(',');
      this.MarketMangerForm.get("marketId").setValue(CountriesString);
      console.log('Filtered paymentMethod:', CountriesString);
    } else {
      console.error('paymentMethod is not an array');
    }
      this.MarketMangerForm.value.companyId = this.jwtAuth.getCompanyId();
      this.Mservice.SaveMarketManger(this.MarketMangerForm.value)
        .subscribe((result) => {
          debugger
          if (!this.data.isNew) {
            debugger            
            this.data.isNew = true
            this.data.id = 0
            this.alert.SaveSuccess();
            this.dialogRef.close(false)
            this.data.GetFiscalYearListFromParent()
            
          }
          else {
            if(result.isSuccess ==false && result.message =="msNoPermission")
              {
                this.alert.ShowAlert("msNoPermission",'error');
                return;
              }
            this.alert.SaveSuccess()
            this.dialogRef.close(false)           
            this.data.GetGetMareketMangerFormParent()
          }
          this.disableSave = false;
        })
     
  }

  isEmpty(input) {
        return input === '' || input === null;
  }

  CheckIfExistEmail(Id:any,email:any)
  {
    this.Mservice.CheckEmail(Id,email).subscribe(res =>{
      if(res != null)
        {
          debugger
          if(res.nameA == "ExistManger" )
            {
              this.alert.ShowAlert("ThisEmailHasBeenUsedBeforePleaseTryAnother","error")
              this.MarketMangerForm.get("email").setValue("");
              return
            }
            else
            {
              this.MarketMangerForm.get("nameA").setValue(res.nameA);
              this.MarketMangerForm.get("nameE").setValue(res.nameE);
              this.MarketMangerForm.get("password").setValue(res.password);
              this.MarketMangerForm.get("mobile").setValue(res.mobile);        
            }
          
         }
    })

  }

  removeReadonly(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    input.removeAttribute('readonly');
  }

  onCountryChange(selectedCountries: number[]) {
    console.log('selectedCountries:', selectedCountries);
    if (!selectedCountries || selectedCountries.length === 0) {
      // If no countries are selected, show all agents
      this.filteredAgentsList = [...this.agentsList];
      return;
    }

    // Filter agents based on selected countries (data2 matches selected country IDs)
    this.filteredAgentsList = this.agentsList.filter(agent =>
      selectedCountries.includes(agent.data2)
    );
  }
  
  SelectAllAgents(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);
    if (hasSelectAll) {
      const allIds = this.filteredAgentsList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.MarketMangerForm.get("agentId")?.setValue(allIds);
      } else {
        this.MarketMangerForm.get("agentId")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.MarketMangerForm.get("agentId")?.setValue(cleaned);
    }
  }
}

