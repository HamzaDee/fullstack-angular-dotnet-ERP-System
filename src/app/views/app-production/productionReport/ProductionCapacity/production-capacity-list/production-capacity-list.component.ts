import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductionReportService } from '../../production-report.service';
import { sweetalert } from 'sweetalert';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-production-capacity-list',
  templateUrl: './production-capacity-list.component.html',
  styleUrls: ['./production-capacity-list.component.scss']
})
export class ProductionCapacityListComponent implements OnInit {
  ProdCapacityForm: FormGroup;
  public Data: any;
  public TitlePage: string;
  disableSave:boolean=false;
  constructor(    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private productionReportService: ProductionReportService,
    private alert: sweetalert,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();

    this.ProdCapacityForm = this.formbulider.group({
      id: [0],
      pharmaLine: [0, [Validators.required]],
      cosmeticLine: [0, [Validators.required]],
      fluidLine : [0, [Validators.required]],
      foamLine: [0, [Validators.required]],
    });
    this.GetProdCapacity();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProductionCapacityList');
    this.title.setTitle(this.TitlePage);
  }

  GetProdCapacity(){
    this.productionReportService.GetProdCapacity().subscribe(result => {      
      // this.Data = result      
      if(result.isSuccess === false || result.message === "msNoPermission"){
        this.alert.ShowAlert("msNoPermission","error");
        this.disableSave = true;
        return
      } 
      this.ProdCapacityForm.patchValue(result);
    })
  }

  OnSaveForms(){
    this.productionReportService.SaveProdCapacity(this.ProdCapacityForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();
        }
        else {
          this.alert.SaveFaild();
        }
      })
  }

  isEmpty(input) {
    return input === '' || input === null;
  }
}
