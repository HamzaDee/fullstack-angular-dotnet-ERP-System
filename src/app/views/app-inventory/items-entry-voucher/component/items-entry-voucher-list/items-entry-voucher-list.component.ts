import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ItemsEntryVoucherService } from '../../service/items-entry-voucher.service';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { DropDownModel } from 'app/shared/models/DropDownModel';
import Swal from 'sweetalert2';
import { sweetalert } from 'sweetalert';
import { MatDialog } from '@angular/material/dialog';
import { ItemsEntryVoucherTemplatComponent } from '../items-entry-voucher-templat/items-entry-voucher-templat.component';
import { PrintService } from '../../service/print.service';

@Component({
  selector: 'app-items-entry-voucher-list',
  templateUrl: './items-entry-voucher-list.component.html',
  styleUrls: ['./items-entry-voucher-list.component.scss']
})

export class ItemsEntryVoucherListComponent implements OnInit {

  public TitlePage: string;
  tabelData: any[];
  searchForm: FormGroup
  loading: boolean;

  voucherTypeList: DropDownModel[] = [];
  statusList: DropDownModel[] = [];
  branchsList: DropDownModel[] = [];
  constructor(
    private title: Title,
    private formbulider: FormBuilder,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private itemsEntryVoucherService: ItemsEntryVoucherService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private alert: sweetalert,
    private printService: PrintService,

  ) {
  }

  ngOnInit(): void {
    this.setTitlePage();
    this.getInitialAdvancedSearchForm();
    this.initialAdvanceSearchForm();
    this.getItemEntryVoucherslist();
  }

  setTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsEntryVoucherList');
    this.title.setTitle(this.TitlePage);
  }

  navigateItemEntryVoucherForm(id: any, isViewMode = false, isCopied = false) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = isViewMode;
    this.routePartsService.Guid3ToEdit = isCopied;
    this.router.navigate(['ItemsEntryVoucherList/EntryVoucherForm']);
  }

  deleteItemEntryVoucher(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.itemsEntryVoucherService.DeleteItemEntryVoucher(id).subscribe((results) => {
          if (results) {
            this.alert.DeleteSuccess();
            this.getItemEntryVoucherslist();
          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  openItemsEntryVoucherTemplate(itemEntryVoucher) {
    this.printService.openItemsEntryVoucherTemplate(itemEntryVoucher);
  }

  getInitialAdvancedSearchForm() {
    this.itemsEntryVoucherService.GetInitialAdvancedSearchForm().subscribe(result => {
      this.branchsList = result.branchsList;
      this.statusList = result.statusList;
      this.voucherTypeList = result.voucherTypeList;
    })
  }

  initialAdvanceSearchForm() {
    this.searchForm = this.formbulider.group({
      voucherTypeId: [0],
      status: [0],
      branchId: [0],
      startVoucherNo: [null],
      endVoucherNo: [null],
      startVoucherDate: [null],
      endVoucherDate: [null],
      note: [null]
    });
  }

  getItemEntryVoucherslist() {
    debugger
    this.loading = true;
    this.itemsEntryVoucherService.getItemEntryVoucherslist(this.searchForm.value).subscribe(result => {
      debugger
      this.tabelData = result;
      this.loading = false;
    })
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.getItemEntryVoucherslist();
  }

  checkStartDate() {
    const startDate = this.searchForm.get('startVoucherDate').value;
    const endDate = this.searchForm.get('endVoucherDate').value;

    if (startDate && endDate) {
      const startDateTime = new Date(startDate).getTime();
      const endDateTime = new Date(endDate).getTime();

      if (startDateTime > endDateTime) {
        this.searchForm.get('endVoucherDate').setValue(startDate);
      }
    }
  }

  checkEndDate() {
    const startDate = this.searchForm.get('startVoucherDate').value;
    const endDate = this.searchForm.get('endVoucherDate').value;

    if (startDate && endDate) {
      const startDateTime = new Date(startDate).getTime();
      const endDateTime = new Date(endDate).getTime();

      if (endDateTime < startDateTime) {
        this.searchForm.get('startVoucherDate').setValue(endDate);
      }
    }
  }

}