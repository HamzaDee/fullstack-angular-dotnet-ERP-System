export enum UserLookupsEnum
    {
        GroupCompany = 1,
        DocTypes = 2,
        CompanyActivities = 3,
        Countries = 4,
        UsersGroups = 5,
        Cities = 6,
        Areas = 7,
        CostCenters = 8,
        Sections = 9,
        CreditCardTypes = 10,
        Locations = 11,
        Buildings = 12,
        Departments = 13,
        DealersCategories = 14,
        DealersClasses = 15,
        ItemsCategories = 16,
        ItemsBrands = 17,
        ItemsModels = 18,
        Colors = 19,
        ItemsUnits = 20,
        PriceCategories = 21,
        Projects = 22,
        PriorityLevel = 23,
        Size = 24,
        DeliveredTo = 25
    }
    
    export enum SystemLookupsEnum
    {
        ScreenActions = 1,
        TaxType = 2,
        AccountNature = 3,
        AccountsTypes = 4,
        VoucherTypes = 5,
        PoliciesTypes = 6,
        SerialTypes = 7,
        TermsTypes = 8,
        VoucherStatus = 9,
        BankTypes = 10,
        PaymentMethod = 11,
        TransferType = 12,
        InChequesStatus = 13,
        DepreciationMethod = 14,
        AssetStatus=15,
        OutChequesStatus = 16,
        AssetsTransTypes = 17,
        ClosingAccounts = 18,
        InventoryTypes = 19,
        MessagePriority = 20,
        PriceChangeType = 21,
        VoucherAccountType = 22,
        VoucherIterationTypes = 23,
        TransConfirmMethod = 24,
        ItemsSegmentation = 25,
        CostingMethod =26
    }

    export enum ScreenActionsEnum
    {
        Open = 1,
        Add = 2,
        Edit = 3,
        Delete = 4,
        Print = 5,
        Login = 6,
        Logout = 7
    }

    export enum TaxTypeEnum
    {
        General = 8,
        Sales = 9,
        Purchase = 135
    }

    export enum AccountNatureEnum
    {
        BalanceSheet = 10,
        IncomeList = 11,
        Both = 12
    }

    export enum AccountTypesEnum
    {
        Assets = 13,
        Liabilities = 14,
        Equity = 15,
        Revenue = 16,
        Expenses = 17
    }

    export enum VoucherTypesEnum
    {
        Generallendger = 18,
        Receiptvoucher = 19,
        PaymentVoucher = 20,
        TransferAndCashDepositVoucher = 21,
        BankTransferVoucher = 22,
        DepositVouchers = 23,
        Obtainedtobank = 24,
        CollectionCheques = 25,
        ReturendCheques = 26,
        ReDepositRetCheques = 27,
        DrawInCheques = 28,
        BegInwardCheques = 29,
        BegOutWardCheques = 30,
        TakeOutcheques = 31,
        AssetsDepreciation = 32,
        InputStockVoucher = 33,
        OutPutStockVoucher = 34,
        DamageStockVoucher = 35,
        TransferStockVoucher = 36,
        InventorySettlement = 37,
        ItemsReceiptvoucher = 38,
        Purchaseinvoice = 39,
        PurchaseOrder = 40,
        ReturnPurchaseInvoice = 41,
        PurchaseExpenses = 42,
        SalesOrder = 43,
        SalesInvoice = 44,
        RetSalesInvoice = 45,
        StockTakingSales = 46,
        StockTakingReturninvoice = 47,
        ServicesInvoice = 48,
        ProductionVo = 49,
        SalesVoucherReconciliations = 50,
        ReconciliationClose = 51,
        CreditCardsCollection = 52,
        CloseSubCash = 53,
        AssetsTransferVoucher = 54,
        CloseYear = 55,
        PayrollEntry = 56,
        MaintenanceVoucher = 57,
        AccountOpeningBalances = 58,
        AssetsPurchaseInvoice = 99,
        SuppliersOpeningBalance = 100,
        CustomersOpeningBalance = 101,
        AssetsSalesInvoice = 102,
        AdditionAssets = 107,
        ReductionAssets = 108,
        MaintenanceAssets = 109,
        DisposalAssets = 110,
        SupplierPaymentVoucher = 125,
        SupplierReceiptVoucher = 126,
        ServicePurchaseInvoice = 127,
        SuppliersDebitNote = 128,
        SuppliersCreditNote = 129,
        CustomersPaymentVoucher = 130,
        CustomersReceiptVoucher = 131,
        CustomersDebitNote = 132,
        CustomersCreditNote = 133,
        ServiceSalesInvoice = 134,
        PostponementDueCheques = 146,
        ReturnChequeFromSupplier = 147,
        ReturnChequeFromBankToSupplier = 148,
        ReissueReturnedCheque = 149,
        ItemsReservationVoucher = 165
    }

    export enum PoliciesTypesEnum
    {
        Allow = 59,
        Warning = 60,
        Prevent = 61
    }

    export enum SerialTypesEnum
    {
        Independent = 62,
        IsContinues = 63,
        IndependentYearly = 160,
        IsContinuesYearly = 161
    }

    export enum TermsTypesEnum
    {
        PaymentTerms = 64,
        DeliveryTerms = 65
    }

    export enum VoucherStatusEnum
    {
        Saved = 66,
        Canceled = 67,
        Posted = 68,
        Accepted = 69,
        Rejected = 70,
        TemporarySaved = 71
    }
    export enum RptVoucherStatusEnum
    {
      Both = -1 ,
      Posted = 1 ,
      UnPosted= 0 
    }
    export enum GeneralStatusEnum
    {
        Active = 1,
        InActive = 2
    }

    export enum BankTypesEnum
    {
        Bank = 72,
        Cash = 73,
        CreditCard = 74
    }

    export enum PaymentMethodEnum
    {
        Cash = 76,
        Cheque = 77,
        CreditCard = 78,
        BankTransfer = 79
    }

   export enum TransferTypeEnum
    {
        Incoming = 80,
        Outgoing = 81
    }

    //ActionName enum && ControllerName enum should have the same number ^-^
    export enum ActionName
    {
        VoucherBondList = 1,
        TransferVoucherList = 2,
        ReceiptVoucherList = 3,
        PaymentVoucherList = 4,
        BankTransferList = 5,
        TransactionsVouchersReport=6,
        ServicesInvList = 7,
        ChequesReport =8,
        ProcessingIncomingChequeList = 9,
        ProcessingOutcomingChequeList=10,
        FirstTermChequeList  = 11,
    }

    export enum ControllerName
    {
        VoucherBond = 1,
        TransferVoucher = 2,
        ReceiptVoucher = 3,
        PaymentVoucher = 4,
        BankTransferVoucher = 5,
        AccReport=6,
        ServicesInv = 7,
        ProcessingIncomingCheque = 8,
        ProcessingOutcomingCheque= 9,
        FirstTermCheque = 10,
    }
    export enum PeriodName
    {
        Period1 = 1,
        Period2 = 2,
        Period3 = 3,
        Period4 = 4,
        Period5 = 5,
        Period6 = 6,
        Period7 = 7,
        Period8 = 8,
        Period9 = 9,
        Period10 = 10,
        Period11 = 11,
        Period12 = 12
    }

    export enum GeneralAttachmentTypesEnum 
    { 
        Dealers = 1,
        FixedAssetscontracts = 2
    }

    export enum DealersTypesEnum
    {        
        Customer = 1,
        Supplier = 2
    }

    export enum AssetsTransTypesEnum
    {
        Delivery = 105,
        Receipt = 106
    }
    export enum InventoryTypeEnum
    {
        Periodic = 123,
        Continuous = 124
    }

    export enum AssetStatusEnum
    {
        New = 94,
        Consumed = 95,
        Scrap = 96,
        Sold = 97,
        Damaged = 98 
    }
    export enum ImportFromOtherCompanyTypeEnum
    {
      Currecny=19,
      Tax = 20,
      CostCenter= 21,
      VoucherType =30 , 
      PaymentAndDeliveryTerms=32,
      UsersGroups = 9
    }

    export enum VoucherAccountTypeEnum
    {
        Account = 143,
        Customer = 144,
        Supplier = 145
    }

    export enum InChequesStatusEnum
    {
        Receipt = 82,
        Undercollection = 83,
        Collected = 84,
        Rejected = 85,
        Drawn = 86,
        Endorsed = 87,
        Redeposit = 88,
    }

    export enum OutChequesStatusEnum
    {
        Issue = 89,
        Pay = 90,
        UnderPayment = 91,
        Rejected = 103,
        Drawn = 104,
    }

    export enum VoucherIterationTypesEnum
    {
        Day = 150,
        Week = 151,
        Month = 152,
        Year = 153
    }

    //نوع قيود حركات المستودعات: تجميعي او تفصيلي
    export enum InventoryEntryVoucherTypesEnum
    {
        Cumulative = 1, //تجميعي
        Detailed = 2, //تفصيلي
    }
    export enum ReportFilterOperators
    {
        emptyOperator = -1,
        lessThan = 1,
        greaterThan = 0,
        lessThanOrEqual = 2,
        greaterThanOrEqual = 3,
        equalS = 4,
        containS = 5
    }

    export enum CostingMethodEnum
    {
        WeightedAverage = 162,
        MovingAverage = 163,
        FIFO = 164
    }

    export enum CalculationMethodEnum
    {
        FixedValuePerUnit = 228,
        Ofxperminutewage = 229,
        Percentageofmaterialcost = 230,
        Perproductionorder = 231
    }

export enum ScreenMenu {
   
}
