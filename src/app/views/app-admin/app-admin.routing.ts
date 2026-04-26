
import { Routes } from "@angular/router";
import { UserPermissionComponent } from "./user-permission/user-permission.component";
import { TranslateService } from '@ngx-translate/core';

export const AppAdminRoutes: Routes = [
  
   
      {
        path: "user-permission",
        component: UserPermissionComponent,
        data: { title: "user-permission",breadcrumb: 'user-permission'  }
      }
    
  
];
