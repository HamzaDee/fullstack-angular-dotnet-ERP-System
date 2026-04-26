import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ItemsGroupService } from '../items-group.service'; 

@Component({
  selector: 'app-items-group-unpacking',
  templateUrl: './items-group-branching.component.html',
  styleUrls: ['./items-group-branching.component.scss']
})
export class ItemsGroupBranchingComponent implements OnInit {
  dataRecevied: any
  ItemsGroupsForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  id: any;
  showLoader = false
  itemsModelList: any[];
  mainId: string;
  maxId: any;
  receivedData: any;
  mainItemData: any;
  GetAllItemsGroups: any;
  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private itemsGroupService: ItemsGroupService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.route.params.subscribe((params) => {
      this.GetAllItemsGroups = params['GetAllItemsGroups'];
      // Use receivedData as needed
    });
    this.receivedData = this.routePartsService.Guid2ToEdit;
    this.id = this.receivedData.id;
    this.GetInitailItemsGroups();
    if (this.id == null || this.id == undefined || this.id === "") {
      this.router.navigate(['ItemsGroups/ItemsGroupsList']);
    }
    this.InitiailAccountForm();
    this.getMaxId();
  }

  InitiailAccountForm() {
    this.ItemsGroupsForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      mainGroupId: [0],
      groupNameA: ['', Validators.required],
      groupNameE: ['', Validators.required],
      categoryId: [0],
      discountId: [0],
      taxId: [0],
      storeAccNo: [0],
      costGoodsSoldAccNo: [0],
      purchaseAccNo: [0],
      salesAccNo: [0],
      note: [""],
      active: true,
      isMain: false,
      mainGroupNames: [null],
      categorys: [null],
      discouns: [null],
      taxs: [null],
      storeAccs: [null],
      costGoodsSoldAccs: [null],
      purchaseAccs: [null],
      salesAccs: [null],
    });
  }
  GetInitailItemsGroups() {
    this.itemsGroupService.GetItemsGroupsBranchs(this.id).subscribe(result => {
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['ItemsGroups/ItemsGroupsList']);
          return;
        }
      this.itemsModelList = result;
      this.mainItemData = result[0]
      this.itemsModelList.forEach(e => {
        e.isExist = true
      })
    })
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('BranchItemsGroupScreen');
    this.title.setTitle(this.TitlePage);
  }



  DeleteItem(id) {
    this.itemsModelList = this.itemsModelList.filter(item => item.id !== id);
    var i = 0;
    this.mainId = this.maxId
    this.itemsModelList.forEach(e => {
      if (!e.isExist) {
        e.id = this.maxId + i;
        i++;
      }
    });
  }


  getMaxId() {
    this.itemsGroupService.GetMaxIdItemsGroups(this.id).subscribe(res => {
      this.maxId = res;
    })
  }

  OnSaveForms() {
    debugger
    var insertRows = this.itemsModelList.filter(e => e.isExist == false);
    var stopExecution = false;
    insertRows.forEach(element => {
      if (element.id == "" || element.groupNameA == "" || element.groupNameE == "") {
        this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        return;
      }
    })
    if (stopExecution) {
      return;
    }
    try {
      this.itemsGroupService.PostItemsGroupsBranches(insertRows).subscribe(res => {
        this.alert.SaveSuccess();
        this.GetAllItemsGroups()
      });
    } catch {
      this.alert.SaveFaild();
    }
    this.router.navigate(['ItemsGroups/ItemsGroupsList']);

  }



  AddNewLine() {
    debugger
    if (this.mainId != undefined) {
      this.mainId = (Number(this.mainId) + 1).toString();
      this.itemsModelList.push(
        {
          id: this.mainId,
          groupNameA: "",
          groupNameE: "",
          mainGroupId: this.receivedData.id,
          // categoryId: this.mainItemData.categoryId,
          // discountId: this.mainItemData.discountId,
          // taxId: this.mainItemData.taxId,
          // storeAccNo: this.mainItemData.storeAccNo,
          // costGoodsSoldAccNo: this.mainItemData.costGoodsSoldAccNo,
          // purchaseAccNo: this.mainItemData.purchaseAccNo,
          // salesAccNo: this.mainItemData.salesAccNo,
          note: "",
          isMain: false,
          isExist: false
        });
    }
    else {
      this.itemsGroupService.GetMaxIdItemsGroups(this.id).subscribe(res => {
        this.mainId = res;
        this.itemsModelList.push(
          {
            id: this.mainId,
            groupNameA: "",
            groupNameE: "",
            mainGroupId: this.receivedData.id,
            // categoryId: this.mainItemData.categoryId,
            // discountId: this.mainItemData.discountId,
            // taxId: this.mainItemData.taxId,
            // storeAccNo: this.mainItemData.storeAccNo,
            // costGoodsSoldAccNo: this.mainItemData.costGoodsSoldAccNo,
            // purchaseAccNo: this.mainItemData.purchaseAccNo,
            // salesAccNo: this.mainItemData.salesAccNo,
            note: "",
            isMain: false,
            isExist: false
          });
      }, err => {
        this.alert.SaveFaildFieldRequired()
      })
    }
  }
}
