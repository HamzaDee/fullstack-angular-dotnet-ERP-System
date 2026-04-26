import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DeprecationServiceService } from '../deprecation-service.service';
import { sweetalert } from 'sweetalert';

@Component({
  providers: [DatePipe],
  selector: 'app-depreciation-sheet',
  templateUrl: './depreciation-sheet.component.html',
  styleUrls: ['./depreciation-sheet.component.scss']
})
export class DepreciationSheetComponent implements OnInit {
  data: any;
  dateNow: Date;
  faTransDTModelList: any;
  AssetAmount: any;
  depreciationPersantage: any;
  additions: any;
  decreases: any;
  depreciationComplex: any;
  tfTotal: any;


  constructor(private route: ActivatedRoute,
    private alert: sweetalert,
    private DeprecationServiceService: DeprecationServiceService) { }

  async ngOnInit() {
    debugger
    $(".mat-checkbox-input").removeClass("cdk-visually-hidden");
    this.dateNow = new Date();
    let id = this.route.snapshot.params.id;
     await (await this.DeprecationServiceService.printAssetDepreciation(id)).toPromise().then((results) => {
      debugger
      if(results.isSuccess == false && results.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          return;
        }  
      this.data = results;
      this.faTransDTModelList = results.faTransDTModelList;
      var sumTotal = 0;
      for (let i = 0; i < this.faTransDTModelList.length; i++) {  
        this.AssetAmount = results.faTransDTModelList[i].assetAmount;
        this.depreciationPersantage = results.faTransDTModelList[i].depreciationPersantage;
        this.additions = results.faTransDTModelList[i].additions;
        this.decreases = results.faTransDTModelList[i].decreases;
        this.depreciationComplex = results.faTransDTModelList[i].depreciationComplex;

        if (this.faTransDTModelList[i].depreciationComplex == null) {
          this.faTransDTModelList[i].depreciationComplex = 0;
        }
        else {
          this.faTransDTModelList[i].depreciationComplex;
        }

        var sum1 = (this.AssetAmount * this.depreciationPersantage / 100) / 12;
        var sum2 = (this.additions * this.depreciationPersantage / 100) / 12;
        var sum3 = (this.decreases * this.depreciationPersantage / 100) / 12;

        var depreciationValue = sum1 + sum2 - sum3;
        this.faTransDTModelList[i].total = depreciationValue.toFixed(3);
        sumTotal += parseFloat(depreciationValue.toFixed(3));
      }
      this.tfTotal = sumTotal;

      setTimeout(function () {
        window.focus();
        window.print();
      }, 100); 
    }); 

  }


  async Print(id) {
    debugger
    await window.open("/FixedAssetDepreciation/DepreciationSheet/" + id, "PrintWindow",
      "width=900,height=750,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=no");
  }

}
