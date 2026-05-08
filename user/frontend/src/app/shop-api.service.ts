import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../environments/environment";
import type { Product, Promotion } from "./models";

@Injectable({ providedIn: "root" })
export class ShopApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.userApiUrl.replace(/\/$/, "");

  getProducts(category?: string): Observable<Product[]> {
    const q = category ? `?category=${encodeURIComponent(category)}` : "";
    return this.http.get<Product[]>(`${this.base}/api/products${q}`);
  }

  getProduct(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/api/products/${encodeURIComponent(slug)}`);
  }

  getPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.base}/api/promotions`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/api/categories`);
  }
}
