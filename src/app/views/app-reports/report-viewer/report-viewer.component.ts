import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { DxReportViewerModule } from 'devexpress-reporting-angular';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-report-viewer',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
  CommonModule, 
  RouterOutlet,
  DxReportViewerModule
  ],
  templateUrl: './report-viewer.component.html',
  // styleUrls: [
  //   "../../../../../node_modules/devextreme/dist/css/dx.light.css",
  //   "../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.common.css",
  //   "../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.light.css",
  //   "../../../../../node_modules/devexpress-reporting/dist/css/dx-webdocumentviewer.css"
  // ]
})
export class ReportViewerComponent implements OnInit {
  reportUrl: string;
  hostUrl: string = environment.apiURL_Main;
  invokeAction: string = '/DXXRDV';
  queryParams: { [key: string]: any } = {};

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get the reportUrl from the query parameters
    debugger
    this.route.queryParams.subscribe(params => {
      this.reportUrl = params['reportUrl'] || 'defaultReportUrl';
      console.log("Report URL:", this.reportUrl);
    });
  }
}
