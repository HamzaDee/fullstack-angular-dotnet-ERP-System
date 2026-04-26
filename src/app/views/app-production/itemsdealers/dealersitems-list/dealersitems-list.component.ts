import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ItemsdealersService } from '../itemsdealers.service'; 
import { AppCommonserviceService } from 'app/views/app-commonservice.service'

@Component({
  selector: 'app-dealersitems-list',
  templateUrl: './dealersitems-list.component.html',
  styleUrls: ['./dealersitems-list.component.scss']
})
export class DealersitemsListComponent implements OnInit {

  selectedMainTable: number;
  DealerItemsForm: FormGroup;
  showLoader = false;
  titlePage: string;
  dealersItemsList: any[] = [];
  itemsList: any[];
  allUnitsList: any[];
  unitsList: Array<any> = [];
  origCountryList : any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private ItemsdealersService: ItemsdealersService,
    private appCommonserviceService : AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.InitialDealerItemsForm();
    this.data.GetDealersList();
    this.GetInitialForm();
  }

  InitialDealerItemsForm() {
    this.DealerItemsForm = this.formbulider.group({
      id: [0],
      no: [0],
      dealersItems: [null],
    });
  }

  GetInitialForm() {
    this.ItemsdealersService.GetDealersList(this.data.itemNo).subscribe((result) => {
      debugger
      this.dealersItemsList = result;
    });
  }
  
}


