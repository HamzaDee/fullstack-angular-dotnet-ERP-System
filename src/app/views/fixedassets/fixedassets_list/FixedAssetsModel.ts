export class FixedAssetsModel {
    id: number;
    companyId: number;
    typeId: number;
    fano: string;
    fanameA: string;
    fanameE: string;
    isDepreciable: boolean;
    depreciationMethod: number;
    depreciationPercentage: number;
    assetAccId: number;
    depreriationAccId: number;
    accumulatedDeprAccId: number;
    expensesAccId: number;
    profitLossAccId: number;
    branchId: number;
    locationId: number;
    buildingId: number;
    departmentId: number;
    sectionId: number;
    floorNo: number;
    employeeId: number;
    startDateUse: Date;
    status: number;
    amount: number;
    salvageValue: number;
    purchaseDate: Date;
    purchaseInvNo: number;
    barcode: string;
    image: string;
    note: string;
    startDepreciationDate: Date;
    previousDeprBalance: number;
    constructorategoryId: number;
    brandId: number;
    modelId: number;
    serialNo: string;
    fASource: number;
    hasWarranty: boolean;
    warrantyEndDate: Date;
    lanMacAddress: string;
    wiFiMacAddress: string;
    obQty: number;
}


