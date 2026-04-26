import { Form } from "@angular/forms";

export class RepricingItemsSaveForm {
    id: number;
    transDate: Date;
    changeType: number;
    amount: number;
    increase: boolean;
    note: string;
    repricingItemsFilter: FormData;
    repricingItemsDts: any[];
}