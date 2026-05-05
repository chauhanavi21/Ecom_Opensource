import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../environments/environment";
import type { Product, Promotion } from "./models";

@Injectable({ providedIn: "root" })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.adminApiUrl.replace(/\/$/, "");

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/api/products`);
  }

  createProduct(body: Record<string, unknown>): Observable<Product> {
    return this.http.post<Product>(`${this.base}/api/products`, body);
  }

  updateProduct(id: string, body: Record<string, unknown>): Observable<Product> {
    return this.http.patch<Product>(`${this.base}/api/products/${encodeURIComponent(id)}`, body);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/products/${encodeURIComponent(id)}`);
  }

  getPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.base}/api/promotions`);
  }

  createPromotion(body: Record<string, unknown>): Observable<Promotion> {
    return this.http.post<Promotion>(`${this.base}/api/promotions`, body);
  }

  updatePromotion(id: string, body: Record<string, unknown>): Observable<Promotion> {
    return this.http.patch<Promotion>(
      `${this.base}/api/promotions/${encodeURIComponent(id)}`,
      body
    );
  }

  deletePromotion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/promotions/${encodeURIComponent(id)}`);
  }
}
