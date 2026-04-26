import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { PriceOffersService } from '../PriceOffers.Service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

interface QuotationsAdvanceSearch {
  VoucherTypeId: number;
  StatusId: number;
  BranchId: number;
  SalesManId: number;
  DealerId: number;
  FromVoucherNo: string;
  ToVoucherNo: string;
  DateFrom: string | null;
  DateTo: string | null;
  Note: string | null;
}

@Component({
  selector: 'app-price-offers-advanced-search',
  templateUrl: './price-offers-advanced-search.component.html',
  styleUrl: './price-offers-advanced-search.component.scss'
})
export class PriceOffersAdvancedSearchComponent implements OnInit {

  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter<any>();

  @Input() vTypeList: any[] = [];
  @Input() vStatusList: any[] = [];
  @Input() vBranchList: any[] = [];
  @Input() vEmployeeList: any[] = [];
  @Input() vDealerList: any[] = [];
  @Input() vfromDate: any;
  @Input() vtoDate: any;

  typeList: any[] = [];
  statusList: any[] = [];
  branchList: any[] = [];
  employeeList: any[] = [];
  dealerList: any[] = [];

  searchCriteria: QuotationsAdvanceSearch;

  constructor(
    private readonly priceOffersService: PriceOffersService,
    private readonly jwtAuth: JwtAuthService,
    private readonly egretLoader: AppLoaderService,
    private readonly translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.GetSearchFormValues();
  }

  GetSearchFormValues(): void {
    debugger
    this.typeList = this.vTypeList || [];
    this.statusList = this.vStatusList || [];
    this.branchList = this.vBranchList || [];
    this.employeeList = this.vEmployeeList || [];
    this.dealerList = this.vDealerList || [];

    this.searchCriteria = {
      VoucherTypeId: 0,
      StatusId: 0,
      BranchId: 0,
      SalesManId: 0,
      DealerId: 0,
      FromVoucherNo: '',
      ToVoucherNo: '',
      DateFrom: this.vfromDate ? formatDate(this.vfromDate, 'yyyy-MM-dd', 'en-US') : null,
      DateTo: this.vtoDate ? formatDate(this.vtoDate, 'yyyy-MM-dd', 'en-US') : null,
      Note: null
    };
  }

  getData(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));

    this.priceOffersService.SearchQuotationsList(this.searchCriteria).subscribe(
      (result: any) => {
        this.searchResultEvent.emit(result);
        this.egretLoader.close();
      },
      (error) => {
        console.error('Error occurred:', error);
        this.egretLoader.close();
      }
    );
  }

  GetMainData(): void {
    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));

    this.priceOffersService.GetQuotationsList().subscribe(
      (result: any) => {
        this.searchResultEvent.emit(result);
        this.egretLoader.close();
      },
      (error) => {
        console.error('Error occurred:', error);
        this.egretLoader.close();
      }
    );
  }

  EmptySearch(): void {
    this.searchCriteria.VoucherTypeId = 0;
    this.searchCriteria.StatusId = 0;
    this.searchCriteria.BranchId = 0;
    this.searchCriteria.SalesManId = 0;
    this.searchCriteria.DealerId = 0;

    this.GetSearchFormValues();
    this.GetMainData();
  }
}