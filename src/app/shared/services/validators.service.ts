import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})

export class ValidatorsService {
  
  constructor() { }

    compareDates(fromDate,toDate){
        //debugger
        if(toDate < fromDate){
          return false;
        }
        else
        {
          return true;
        }
    }

    


}