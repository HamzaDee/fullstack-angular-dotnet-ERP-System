import { NgModule } from "@angular/core";
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { FileUploadModule } from 'primeng/fileupload';
import { ToolbarModule } from 'primeng/toolbar';
import { TabViewModule } from 'primeng/tabview';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SkeletonModule } from 'primeng/skeleton';
import { HttpClientModule } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { TreeTableModule } from 'primeng/treetable';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  exports: [
    AutoCompleteModule,
    DropdownModule,
    MessageModule,
    DividerModule,
    PasswordModule,
    MultiSelectModule,
    MessagesModule,
    FileUploadModule,
    TableModule,
    ButtonModule,
    CheckboxModule,
    TabViewModule,
    ToolbarModule,
    HttpClientModule,
    CardModule,
    InputTextareaModule,
    SkeletonModule,
    TreeTableModule,
    DialogModule
  ]
})
export class SharedPrimengModule { }
