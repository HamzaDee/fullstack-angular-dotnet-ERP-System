export class SalesRequestHDModel {
    id: number;
    companyId: number;
    voucherTypeId: number;
    voucherNo: string;
    voucherDate: Date;
    currencyId: number;
    currRate: number;
    note: string;
    branchId: number;
    amount: number;
    status: number;
    storeId: number;
    stampDate: Date;
    userId: number;
    dealerId: number;
    salesManId: number;
    paymentTerm: number;
    deliveryPeriod: number;
    requestType: number;
    allowEditDelete: boolean;
}