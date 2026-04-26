export class AccVouchersHdModel {
    id: number;
    companyId: number;
    voucherTypeId: number;
    voucherNo: string;
    voucherDate: Date;
    currencyId: number;
    currRate: number;
    isCanceled: boolean;
    isPosted: boolean;
    note: string;
    branchId: number;
    amount: number;
    status: number;
    paymentMethod: string;
    referenceNo: string;
    referenceDate: Date;
    representId: number;
    commissionAmt: number;
    commissionAccId: number;
    cashAmount: number;
    cashAccId: number;
    accountType: number;
    stampDate: Date;
    userId: number;
    transTypeName: string;
    branchName: string;
    currencyName: string;
    statusName: string;
    dealerName: string;
    isCash:boolean;
    priceWithTax:boolean;
    creditAccountId: number;
    depreciationMonth:Date;
}


