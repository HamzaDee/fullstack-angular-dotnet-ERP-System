import { Component, Input, Output, EventEmitter } from '@angular/core';


interface CliqVoucherDetail {
  id?: number;              // hidden
  voucherHDId?: number;     // hidden
  cliqType: number;         // dropdown (required)
  cliqName?: string;        // readonly text (edit mode)
  providerName?: string;    // optional
  amount: number;           // required, 3 decimals
  accId: number;            // dropdown (required)
  transNo?: string;         // optional
}


@Component({
  selector: 'app-cliqvoucherdtl',
  templateUrl: './cliqvoucherdtl.component.html',
  styleUrl: './cliqvoucherdtl.component.scss'
})
export class CliqvoucherdtlComponent {
@Input() voucherId!: number;
@Input() voucherType!: number;
@Input() readonly = false;
@Input() cliqAccId!: number;
// dropdowns from parent or services
@Input() cliqTypeList: any[] = [];
@Input() accountList: any[] = [];
public loading = false;
// edit mode data
@Input() set data(value: CliqVoucherDetail[] | null) {
  if (!value || value.length === 0) {
    this.cliqList = [];
    this.totalAmount = 0;
    return;
  }

  this.cliqList = [...value];
  this.calculateTotal();
}

@Output() cliqListChange = new EventEmitter<CliqVoucherDetail[]>();

cliqList: CliqVoucherDetail[] = [];
totalAmount = 0;

addRow() {
  this.cliqList.push({
    cliqType: 0,
    accId: this.cliqAccId,
    amount: 0
  });

  this.emitChange();
}

deleteRow(index: number) {
  this.cliqList.splice(index, 1);
  this.emitChange();
}

emitChange() {
  this.calculateTotal();
  this.cliqListChange.emit([...this.cliqList]);
}

calculateTotal() {
  this.totalAmount = this.cliqList
    .reduce((sum, x) => sum + (x.amount || 0), 0);
}

  onAmountChange() {
    this.emitChange();
  }



  loadLazyAccountss(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.accountList) {
        this.accountList = [];
    }

    // Make sure the array is large enough
    while (this.accountList.length < last) {
        this.accountList.push(null);
    }

    for (let i = first; i < last; i++) {
        this.accountList[i] = this.accountList[i];
    }

    this.loading = false;
  }
}
