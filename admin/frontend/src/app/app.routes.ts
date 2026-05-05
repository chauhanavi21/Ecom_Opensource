import { Routes } from "@angular/router";
import { authGuard } from "./auth.guard";
import { LoginComponent } from "./login/login.component";
import { ShellComponent } from "./shell/shell.component";
import { ProductsComponent } from "./products/products.component";
import { PromotionsComponent } from "./promotions/promotions.component";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "",
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: "", pathMatch: "full", redirectTo: "products" },
      { path: "products", component: ProductsComponent },
      { path: "promotions", component: PromotionsComponent },
    ],
  },
  { path: "**", redirectTo: "" },
];
