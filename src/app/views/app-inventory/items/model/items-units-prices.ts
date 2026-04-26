import { ItemsPrices } from "./items-prices";

export class ItemsUnitsPrices {
    id: number;
    unitId: number;
    convertRate: number;
    barcode: string;
    price: number;
    isSmall: boolean;
    isDefault: boolean;
    itemsPricesSub: ItemsPrices[];
}