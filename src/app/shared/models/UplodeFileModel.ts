import { SafeUrl } from "@angular/platform-browser";

export class UplodeFileModel
{
    id :number;
    voucherHDId: number;
    docName:string;
    attachname:string;
    docExt:string;
    docPath:SafeUrl
    base64:string;
    docType :string;
    typeId : number;
    docId :number;
    fullName:string;
    attache_Name:string;
    url:SafeUrl;
}
