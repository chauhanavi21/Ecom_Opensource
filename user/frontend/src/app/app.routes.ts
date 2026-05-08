import { Routes } from "@angular/router";
import { ShopComponent } from "./shop/shop.component";
import { ProductDetailComponent } from "./product-detail/product-detail.component";

export const routes: Routes = [
  { path: "", component: ShopComponent },
  { path: "product/:slug", component: ProductDetailComponent },
  { path: "**", redirectTo: "" },
];
