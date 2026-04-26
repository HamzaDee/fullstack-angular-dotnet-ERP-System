export class AssetsContractsHDModel {
    id              : number;
    companyId       : number;
    contractNo      : string
    contractDate    : Date;
    dealerId        : number;
    amount          : number;
    branchId        : number;
    currencyId      : number;
    currRate        : number;
    startDate       : Date;
    endDate         : Date;
    referenceNo     : number;
    referenceDate   : Date;
    note            : string;
    image           : string;
    satus           : number;
    allowEditDelete : boolean;
    noteHd          : string;
}