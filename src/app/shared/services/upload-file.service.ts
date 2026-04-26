import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Observable, ReplaySubject } from "rxjs";

@Injectable({
    providedIn: "root"
  })
export class UplodeFileService {

  constructor(
    private sanitizer: DomSanitizer
  ) { }


  
  convertFileToSafeUrl(Files: BlobPart[],FileType: any)
  {
    const blob = new Blob(Files, { type: FileType });
    const url = window.URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  convertFileToBase64(file : File) : Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  convertBase64ToFile(Base64: string,FileType: string) {
    const byteString = window.atob(Base64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: FileType });    
    const url = window.URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustUrl(url);
   }

}
