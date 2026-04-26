import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ItemsEntryVoucherTemplatComponent } from "../component/items-entry-voucher-templat/items-entry-voucher-templat.component";

@Injectable({
    providedIn: 'root',
})
export class PrintService {
    constructor(private dialog: MatDialog,
    ) {

    }
    openItemsEntryVoucherTemplate(data) {
        const dialogRef = this.dialog.open(ItemsEntryVoucherTemplatComponent, {
            width: '1000px',
            data: data
        });

        // {
        //     voucherNumber: '123',
        //     date: '2023-01-01',
        //     enteredBy: 'John Doe',
        //     items: []
        // }
    }
}