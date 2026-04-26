import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { DxReportDesignerModule } from 'devexpress-reporting-angular';
import 'devexpress-reporting/dx-richedit';
import * as ko from 'knockout';
import { fetchSetup } from '@devexpress/analytics-core/analytics-utils';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-report-designer',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
	CommonModule, 
	RouterOutlet,
	DxReportDesignerModule],
  templateUrl: './report-designer.component.html',
  styleUrls: [
    "../../../../../node_modules/ace-builds/css/ace.css",
    "../../../../../node_modules/ace-builds/css/theme/dreamweaver.css",
    "../../../../../node_modules/ace-builds/css/theme/ambiance.css",
    "../../../../../node_modules/devextreme/dist/css/dx.light.css",
    "../../../../../node_modules/devexpress-richedit/dist/dx.richedit.css",
    "../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.common.css",
    "../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.light.css",
    "../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-querybuilder.css",
    "../../../../../node_modules/devexpress-reporting/dist/css/dx-webdocumentviewer.css",
    "../../../../../node_modules/devexpress-reporting/dist/css/dx-reportdesigner.css"
]
})
export class ReportDesignerComponent implements OnInit{
	title = 'DXReportDesignerSample';
	getDesignerModelAction = "/DXXRD/GetDesignerModel"
	// The report name.
	reportName = "TestReport";
	// The backend application URL.
  hostUrl: string = environment.apiURL_Main;

  constructor(private activateRoute: ActivatedRoute) {}

  ngOnInit() {
    debugger
    if(this.activateRoute.snapshot.queryParams['reportName']) {
      this.reportName = this.activateRoute.snapshot.queryParams['reportName'];
    }
  }

}



// export class ReportDesignerComponent implements OnInit {
//   //getDesignerModelAction = "api/CustomReportDesigner/GetReportDesignerModel";
//   getDesignerModelAction = this.hostUrl + "/api/ReportDesignerSetup/GetReportDesignerModel";
//   //getDesignerModelAction = "/DXXRD/GetReportDesignerModel";
//   get reportUrl() {
//     return this.koReportUrl();
//   };
//   set reportUrl(newUrl) {
//     this.koReportUrl(newUrl);
//   }
//   koReportUrl = ko.observable('');
//   constructor(
//     @Inject('BASE_URL') public hostUrl: string,  
//     private activateRoute: ActivatedRoute){};
//   // constructor(@Inject('BASE_URL') public hostUrl: string,  private activateRoute: ActivatedRoute) {
//   //   this.authorize.getAccessToken()
//   //     .subscribe(x => {
//   //       fetchSetup.fetchSettings = {
//   //         headers: {
//   //           'Authorization': 'Bearer ' + x
//   //         }
//   //       };
//   //     });
//   // }

//   ngOnInit() {
//     debugger
//     let tt=this.hostUrl;
//     if(this.activateRoute.snapshot.queryParams['reportId']) {
//       this.reportUrl = this.activateRoute.snapshot.queryParams['reportId'];
//     }
//   }
//   // title = 'DXReportDesignerSample';
// 	// // If you use the ASP.NET Core backend:
// 	// getDesignerModelAction = "/DXXRD/GetDesignerModel"
// 	// // The report name.
// 	// reportName = "TestReport";
// 	// // The backend application URL.
// 	// host = 'https://localhost:58236/';
// }
