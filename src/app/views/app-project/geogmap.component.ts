import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-external-redirect',
  template: ''
})
export class ExternalRedirectComponent implements OnInit {
    
    constructor(private route: ActivatedRoute) {}
    pageNo: number = 0;
  
    ngOnInit() {
        this.pageNo = this.route.snapshot.data['pageno'];
        if(this.pageNo == 1){
            window.open('http://192.168.1.9:1985', '_blank');
        }
        else if(this.pageNo == 2){
            window.open('http://192.168.1.9:1994', '_blank');
        }
        else{
            window.open('http://192.168.1.9:1993', '_blank');
        }
    }
}
