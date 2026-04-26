import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FixedAssetOperationService } from '../fixed-asset-operation.service';
import { ActivatedRoute } from '@angular/router';
import { sweetalert } from 'sweetalert';

@Component({
  providers: [DatePipe],
  selector: 'app-fixed-asset-operation-sheet',
  templateUrl: './fixed-asset-operation-sheet.component.html',
  styleUrls: ['./fixed-asset-operation-sheet.component.scss']
})
export class FixedAssetOperationSheetComponent implements OnInit {
  data: any;
  dateNow: Date;
  faTransDTModelList: any;
  PrevUpdate: any;
  BookValue: any;
  assestAmount: any;
  additionsAmt: any;
  decreasesAmt: any;
  tfTotal: any;


  
  constructor(private route: ActivatedRoute,
    private alert: sweetalert,
    private FixedAssetOperationService: FixedAssetOperationService) { }

   async ngOnInit() {
    debugger
    this.dateNow = new Date();
    let id = this.route.snapshot.params.id;
    var sumTotal = 0;

     await (await this.FixedAssetOperationService.printAssetOperation(id)).toPromise().then((results) => {
      debugger
      if(results.isSuccess == false && results.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          return;
        } 
      this.data = results;
      this.faTransDTModelList = results.faTransDTModelList;

      for (let i = 0; i < this.faTransDTModelList.length; i++) {  
        this.assestAmount = results.faTransDTModelList[i].assetAmount;
        this.additionsAmt = results.faTransDTModelList[i].additions;
        this.decreasesAmt = results.faTransDTModelList[i].decreases;
  
      if ( this.additionsAmt == undefined) {
        this.additionsAmt = 0;
      }
      if (this.decreasesAmt == undefined) {
        this.decreasesAmt = 0;
      }
    
      this.faTransDTModelList.assetAmount = this.assestAmount;
      this.PrevUpdate  =  this.additionsAmt - this.decreasesAmt;
       this.BookValue =  this.assestAmount + this.additionsAmt - this.decreasesAmt;
      var tot = this.faTransDTModelList[i].total;
      sumTotal += parseFloat(tot);
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
    await window.open("/FixedAssetOperation/FixedAssetOperationSheet/" + id, "PrintWindow",
      "width=900,height=750,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=no");
  }

}
