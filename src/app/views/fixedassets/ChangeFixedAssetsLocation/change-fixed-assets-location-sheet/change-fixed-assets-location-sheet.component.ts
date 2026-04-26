import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChangeFixedAssetsLocationService } from '../change-fixed-assets-location.service';
import { DatePipe } from '@angular/common';
import { sweetalert } from 'sweetalert';

@Component({
  providers: [DatePipe],
  selector: 'app-change-fixed-assets-location-sheet',
  templateUrl: './change-fixed-assets-location-sheet.component.html',
  styleUrls: ['./change-fixed-assets-location-sheet.component.scss']
})
export class ChangeFixedAssetsLocationSheetComponent implements OnInit {
  data: any;
  dateNow:Date;
  TransNo: any;
  transDate: any;
  note:any;

  constructor( private route: ActivatedRoute,
               private ChangeFixedAssetsLocationService: ChangeFixedAssetsLocationService,
               private alert: sweetalert,) { }



  async ngOnInit() {
    debugger
                $( ".mat-checkbox-input" ).removeClass( "cdk-visually-hidden" );
                  this.dateNow =new Date();
                  let id = this.route.snapshot.params.id;
                   await(await this.ChangeFixedAssetsLocationService.getFixedAssetLocationChangePrint(id)).toPromise().then((results) =>  {
                    if(results.isSuccess == false && results.message ==="msNoPermission")
                      {
                        this.alert.ShowAlert("msNoPermission",'error');
                        return;
                      }               
                    this.data=results
                    this.TransNo = results[0].transNo;
                    this.transDate = results[0].transDate;
                    this.note = results[0].note;
                    
                    setTimeout(function () {
                      window.focus();
                      window.print();
                    }, 100);
                }); 
              }


  async Print(id){  
  debugger
  
  await window.open("/ChangeFixedAssetsLocation/ChangeFixedAssetsLocationSheet/"+ id, "PrintWindow",
  "width=900,height=750,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=no");
  }

}
