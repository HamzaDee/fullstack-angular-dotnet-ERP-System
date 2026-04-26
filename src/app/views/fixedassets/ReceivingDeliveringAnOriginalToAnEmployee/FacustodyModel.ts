export class FacustodyModel {
    id: number;
    companyId: number;
    transTypeId: number;
    transNo: number;
    transDate: Date;
    transNote: string;
    assetId: number;
    employeeId: number;
    note: string;
    receiptStatus: number;
    deliveryStatus: number;
}

export class ReceivingDeliveringModel {
    id: number;
    companyId: number;
    transTypeId: number;
    transNo: number;
    transDate: Date;
    transNote: string;
    assetId: number;
    employeeId: number;
    note: string;
    receiptStatus: number;
    deliveryStatus: number;
    assetName: string;
    employeeName: string;
    transTypeName: string;
}