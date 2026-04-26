import { Component, Inject, OnInit } from '@angular/core';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProdordersService } from '../prodorders.service'; 

@Component({
  selector: 'app-raw-materials',
  templateUrl: './raw-materials.component.html',
  styleUrls: ['./raw-materials.component.scss']
})
export class RawMaterialsComponent implements OnInit {
  public TitlePage: string;
  RawMaterialList: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    public routePartsService: RoutePartsService,
    public router: Router,
    private title: Title,
    private translateService: TranslateService,
    private prodordersService: ProdordersService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.InitiailRawMaterialForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('addCompany');
    this.title.setTitle(this.TitlePage);
  }

  InitiailRawMaterialForm() { 
    debugger
    this.prodordersService.GetItemRawMaterials(this.data.itemNo).subscribe(result => {
      this.RawMaterialList = result;
    })
  }

  calculateSum(){
      return this.RawMaterialList.reduce((sum, item) => sum + parseFloat(item.amount), 0); 
  }
}

