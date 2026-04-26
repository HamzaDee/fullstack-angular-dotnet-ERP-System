import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-items-entry-voucher-templat',
  templateUrl: './items-entry-voucher-templat.component.html',
  styleUrls: ['./items-entry-voucher-templat.component.scss']
})

export class ItemsEntryVoucherTemplatComponent implements OnInit {
  voucherNumber: string;
  date: string;
  enteredBy: string;
  items: any[]; // Replace 'any[]' with the actual type of your items

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>
  ) {
  }
  ngOnInit(): void {
    this.assignDataToComponentProperties();
  }

  assignDataToComponentProperties() {
    // Assign data to component properties
    this.voucherNumber = this.data.voucherNumber;
    this.date = this.data.date;
    this.enteredBy = this.data.enteredBy;
    this.items = this.data.items;

  }
  getTotalItems(): number {
    return this.items.length;
  }

  getTotalQuantity(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  print(): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContainer = document.getElementById('printContainer');
      if (printContainer) {
        printWindow.document.write(printContainer.innerHTML);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  }

}