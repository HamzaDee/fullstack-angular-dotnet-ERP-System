import { Injectable } from "@angular/core";
import { Router, NavigationStart } from "@angular/router";
import { filter } from "rxjs/operators";
import { JwtAuthService } from "./auth/jwt-auth.service";
import { LayoutService } from "./layout.service";

@Injectable({
  providedIn: "root"
})
export class DataTableService {
    dtOptions: any = {};

    constructor(
         private jwtAuthService: JwtAuthService
      ) { }

      SHOW_ENTRIES_LABEL =(this.jwtAuthService.getLang()=='en'?"show":"عرض");
      SEARCH_LABEL =(this.jwtAuthService.getLang()=='en'?"Search":"بحث");
      PREVIOUS_LABEL =(this.jwtAuthService.getLang()=='en'?"previous":"السابق");
      NEXT_LABEL =(this.jwtAuthService.getLang()=='en'?"next":"التالي");
      LAST_LABEL =(this.jwtAuthService.getLang()=='en'?"last":"الاخير")
      FIRST_LABEL =(this.jwtAuthService.getLang()=='en'?"first":"الاول")
      INFO_EMPTY_LABEL =(this.jwtAuthService.getLang()=='en'?"No Result Found":"لم يتم العثور على نتائج")
      SEARCH_PLACEHOLDER =(this.jwtAuthService.getLang()=='en'?"Type to filter":"اكتب للبحث")
      SHOW_PLACEHOLDER =(this.jwtAuthService.getLang()=='en'?"Show":"اظهار")
      TO_PLACEHOLDER =(this.jwtAuthService.getLang()=='en'?"to":"إلى")
      OF_PLACEHOLDER =(this.jwtAuthService.getLang()=='en'?"of":" من اصل ")
      ENTRIES_PLACEHOLDER =(this.jwtAuthService.getLang()=='en'?"entries":"مدخل")
      INFO_FILTERED =(this.jwtAuthService.getLang()=='en'?"filtered from":"منتقاه من ")
      ERROR =(this.jwtAuthService.getLang()=='en'?"ERROR":"خطأ ")
      PRINT =(this.jwtAuthService.getLang()=='en'?"print":"طباعة ")
      EXCEL =(this.jwtAuthService.getLang()=='en'?"excel":"أكسل")
       COPY=(this.jwtAuthService.getLang()=='en'?"copy":"نسخ")

     
      initialDatatableOptions(pageLength,showInfo,processing,enableSort):any{
          try{
       
            this.dtOptions = {
            "pagingType": 'full_numbers',
            "pageLength": pageLength,
            "info" : showInfo,
            "processing": processing,
            dom: '<"dt-top-container"<l><"dt-center-in-div"B><f>r>t<"dt-filter-spacer"><ip>',
            buttons: [  
              {
                extend: 'print',
                text: this.PRINT
            },
            {
                extend: 'excel',
                text: this.EXCEL
            },
            {
                extend: 'csv',
                text: 'csv'
            },
            {
                extend: 'copy',
                text: this.COPY,
            }
        ],
        "destroy": true,
        "bSort":enableSort,
                "language": {
                    "infoFiltered": "("+this.INFO_FILTERED+ "_MAX_ "+this.ENTRIES_PLACEHOLDER+")",
                    "infoEmpty":this.SHOW_PLACEHOLDER+" 0 "+this.TO_PLACEHOLDER+" 0 "+this.ENTRIES_PLACEHOLDER,
                    "info":this.SHOW_PLACEHOLDER+" _START_ "+this.TO_PLACEHOLDER+" _END_ "+this.OF_PLACEHOLDER+" _TOTAL_ "+this.ENTRIES_PLACEHOLDER,
                    "sLengthMenu":this.SHOW_ENTRIES_LABEL+"_MENU_",
                    "sZeroRecords": this.INFO_EMPTY_LABEL,
                    "search": '&nbsp;&nbsp;<span class="control-label ">'+this.SEARCH_LABEL+':</span>',
                    "searchPlaceholder":this.SEARCH_PLACEHOLDER,
                    "sSearch": this.SEARCH_LABEL,
                    "paginate": {
                      "previous": this.PREVIOUS_LABEL,
                      "next": this.NEXT_LABEL,
                      "last": this.LAST_LABEL,
                      "first": this.FIRST_LABEL,
                      
                    },
                
                  },
                
              };
              return this.dtOptions;
          }
          catch(e){
              alert(this.ERROR);
              return  this.dtOptions;
          }
      
      
      
         
    }   
    initialDatatableWithoutFeatures(pageLength,showInfo,processing,enableSort):any{ //without Export buttons and Paging
    
    
        this.dtOptions = {
            paging:false ,
            dom: '<"dt-top-container"<l><"dt-center-in-div"B><f>r>t<"dt-filter-spacer"><ip>',
            buttons: [  
          
        ],
      
        "info" : showInfo,

        "bSort":enableSort,
                "language": {
                  "sZeroRecords": this.INFO_EMPTY_LABEL,
                    "search": '&nbsp;&nbsp;<span class="control-label ">'+this.SEARCH_LABEL+':</span>',
                    "searchPlaceholder":this.SEARCH_PLACEHOLDER,
                    "sSearch": this.SEARCH_LABEL,
                  
                
                  },
                
              }; 
              return this.dtOptions;
          }
          catch(e){
              alert(this.ERROR);
              return  this.dtOptions;
          }
    
       
  
}