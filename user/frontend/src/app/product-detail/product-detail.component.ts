import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map, switchMap, throwError } from "rxjs";
import { formatMoney } from "../money";
import type { Product } from "../models";
import { ShopApiService } from "../shop-api.service";

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./product-detail.component.html",
  styleUrl: "./product-detail.component.css",
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ShopApiService);

  readonly product = signal<Product | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);
  readonly formatMoney = formatMoney;

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((params) => params.get("slug")?.trim()),
      switchMap((slug) => {
        if (!slug) {
          return throwError(() => new Error("missing slug"));
        }
        return this.api.getProduct(slug);
      })
    )
      .subscribe({
        next: (p) => {
          this.product.set(p);
          this.error.set(null);
          this.loading.set(false);
        },
        error: () => {
          this.error.set("Product not found or unavailable.");
          this.loading.set(false);
        },
      });
  }
}
