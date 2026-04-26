import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AccountTreeService } from '../app-accounttree.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-accountlist',
  templateUrl: './accountlist.component.html',
  styleUrls: ['./accountlist.component.scss']
})
export class AccountlistComponent implements OnInit {
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  showLoader: boolean;


  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private accountTreeService: AccountTreeService,
    private translateService: TranslateService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAccountsList();
    
  }

  GetAccountsList() {
    this.showLoader = true;
    setTimeout(() => {
      this.accountTreeService.GetAccountsList(0,1).subscribe(result => {
        this.tabelData = result;
        this.showLoader = false;
      })
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AccountTree');
    this.title.setTitle(this.TitlePage);
  }

  DeleteAccount(id: any) {
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
        this.accountTreeService.DeleteAccount(id).subscribe((results) => {
          debugger
          if (results) {
            this.alert.DeleteSuccess();
            this.GetAccountsList();
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

 

}
