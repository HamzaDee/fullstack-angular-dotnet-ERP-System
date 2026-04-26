export class FachangeLocationModel {
    id: number;
    companyId: number;
    transNo: number;
    transDate: Date;
    transNote: string;
    assetId: number;
    fromLocationId: number;
    toLocationId: number;
    note: string;
    assetName: string;
    fromLocationName: string;
}


export class FixedAssetLocationChange {
    id: number;
    companyId: number;
    transNo: number;
    transDate: Date;
    transNote: string
    nullable: true
    note: string;
    assetId: number;
    fromLocationId: number;
    toLocationId: number;
    assetName: string;
    fromLocName: string;
    toLocName: string;
}
