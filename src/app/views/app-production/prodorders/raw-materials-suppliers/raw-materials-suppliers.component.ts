import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProdordersService } from '../prodorders.service'; 
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Component({
  selector: 'app-raw-materials-suppliers',
  templateUrl: './raw-materials-suppliers.component.html',
  styleUrls: ['./raw-materials-suppliers.component.scss']
})
export class RawMaterialsSuppliersComponent implements OnInit {
  RawMaterialForm: FormGroup;
  public TitlePage: string;
  vendorsList: any[];
  suppliersList: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    public routePartsService: RoutePartsService,
    public router: Router,
    private title: Title,
    private translateService: TranslateService,
    private prodordersService: ProdordersService,
    private dialog: MatDialog,
    private jwtAuth: JwtAuthService,
  ) { }

  ngOnInit(): void {
    this.InitiailRawMaterialForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('addCompany');
    this.title.setTitle(this.TitlePage);
  }

  InitiailRawMaterialForm() { 
    debugger
    this.prodordersService.GetItemSuppliers(this.data.itemNo).subscribe(result => {
      this.suppliersList = result;
    })
  }

  SelectSupplier(itemList){
    debugger
    this.dialogRef.close(itemList);
  }
}


