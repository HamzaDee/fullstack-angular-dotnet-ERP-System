import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FixedAssetsContractsService } from '../fixed-assets-contracts.service';
import { sweetalert } from 'sweetalert';

@Component({
  selector: 'app-fixed-assets-contracts-sheet',
  templateUrl: './fixed-assets-contracts-sheet.component.html',
  styleUrls: ['./fixed-assets-contracts-sheet.component.scss']
})
export class FixedAssetsContractsSheetComponent implements OnInit {
  data: any;
  dateNow:Date;
 public AssetsContractsDTList: any;


  constructor( private route: ActivatedRoute,
    private alert: sweetalert,
               private FixedAssetsContractsService: FixedAssetsContractsService) { }



  async ngOnInit() {
    debugger
                $( ".mat-checkbox-input" ).removeClass( "cdk-visually-hidden" );
                  this.dateNow =new Date();
                  let id = this.route.snapshot.params.id;
                    await(await this.FixedAssetsContractsService.printAssetContract(id)).toPromise().then((results) =>  {
                      if(results.isSuccess == false && results.message ==="msNoPermission")
                        {
                          this.alert.ShowAlert("msNoPermission",'error');
                          return;
                        } 
                    
                    this.data=results
                    this.AssetsContractsDTList = results.assetsContractsDTList;
                    
                    setTimeout(function () {
                      window.focus();
                      window.print();
                    }, 100);
                });  
              }


  async Print(id){  
  debugger
  await window.open("/FixedAssetsContracts/FixedAssetsContractsSheet/"+ id, "PrintWindow",
  "width=900,height=750,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=no");
  }

}
