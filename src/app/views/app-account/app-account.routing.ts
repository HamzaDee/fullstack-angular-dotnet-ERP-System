
import { Routes } from "@angular/router";
import { NotFoundComponent } from "./not-found/not-found.component";
import { ErrorComponent } from "./error/error.component";
import { LoginComponent } from "./login/login.component";


export const AppAccountRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: "Login",
        component: LoginComponent,
        data: { title: "Login" }
      },


      {
        path: "404",
        component: NotFoundComponent,
        data: { title: "Not Found" }
      },
      {
        path: "error",
        component: ErrorComponent,
        data: { title: "Error" }
      }
    ]
  }
];
