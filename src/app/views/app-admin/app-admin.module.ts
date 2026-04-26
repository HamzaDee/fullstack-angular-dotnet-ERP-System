import { PerfectScrollbarModule } from 'app/shared/components/perfect-scrollbar';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { AppAdminRoutes } from './app-admin.routing';
import { UserPermissionComponent } from './user-permission/user-permission.component';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
// import { NgxMatSelectSearchModule ,MatSelectSearchClearDirective} from 'app/shared/components/mat-select-search/ngx-mat-select-search.module';
import { AppAdminService } from './app-admin.service';
import { NgSelect2Module } from 'ng-select2';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {ToolbarModule} from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    SharedMaterialModule,
    FlexLayoutModule,
    PerfectScrollbarModule,
    SharedComponentsModule,
    NgSelect2Module,
    DragDropModule,
    DropdownModule,
    ButtonModule,
    ToolbarModule,
    TableModule,
    TreeTableModule,
    RouterModule.forChild(AppAdminRoutes)
  ],
  declarations: [UserPermissionComponent] ,
  providers: [AppAdminService]

})
export class AppAdminModule { }