import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReceivingDeliveringAnOriginalToAnEmployeeService } from '../receiving-delivering-an-original-to-an-employee.service';
import { DatePipe } from '@angular/common';
import { sweetalert } from 'sweetalert';

@Component({
  providers: [DatePipe],
  selector: 'app-eceiving-delivering-an-original-employee-sheet',
  templateUrl: './eceiving-delivering-an-original-employee-sheet.component.html',
  styleUrls: ['./eceiving-delivering-an-original-employee-sheet.component.scss']
})
export class EceivingDeliveringAnOriginalEmployeeSheetComponent implements OnInit {
  data: any;
  dateNow:Date;
  TransNo: any;
  transDate: any;
  note:any;
  transTypeIdName:any;

  constructor( private route: ActivatedRoute,
               private ReceivingDeliveringAnOriginalToAnEmployeeService: ReceivingDeliveringAnOriginalToAnEmployeeService,
               private alert: sweetalert,
              ) { }



  async ngOnInit() {
    debugger
                $( ".mat-checkbox-input" ).removeClass( "cdk-visually-hidden" );
                  this.dateNow =new Date();
                  let id = this.route.snapshot.params.id;
                    await(await this.ReceivingDeliveringAnOriginalToAnEmployeeService.getReceivingDeliveringAnOriginalToAnEmployeePrint(id)).toPromise().then((results) =>  {
                    debugger
                    if(results.isSuccess == false && results.message ==="msNoPermission")
                      {
                        this.alert.ShowAlert("msNoPermission",'error');
                        return;
                      } 
                    this.data=results
                    this.TransNo = results[0].transNo;
                    this.transDate = results[0].transDate;
                    this.note = results[0].note;
                    this.transTypeIdName = results[0].transTypeIdName;

                    setTimeout(function () {
                      window.focus();
                      window.print();
                    }, 100);
                });  
              
              }


  async Print(id){  
  debugger
  await window.open("/ReceivingDeliveringAnOriginalToAnEmployee/EceivingDeliveringAnOriginalEmployeeSheet/"+ id, "PrintWindow",
  "width=900,height=750,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=no");
  }

}
