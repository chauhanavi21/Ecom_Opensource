import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { catchError, forkJoin, of } from "rxjs";
import { formatMoney } from "../money";
import type { Product, Promotion } from "../models";
import { ShopApiService } from "../shop-api.service";

@Component({
  selector: "app-shop",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./shop.component.html",
  styleUrl: "./shop.component.css",
})
export class ShopComponent implements OnInit {
  private readonly api = inject(ShopApiService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly categories = signal<string[]>([]);
  readonly products = signal<Product[]>([]);
  readonly promotions = signal<Promotion[]>([]);
  readonly category = signal<string | undefined>(undefined);

  readonly formatMoney = formatMoney;

  ngOnInit(): void {
    this.load();
  }

  setCategory(c: string | undefined): void {
    this.category.set(c);
    this.load();
  }

  bestDealLabel(p: Product): string | null {
    const promos = p.promotions ?? [];
    if (promos.length === 0) return null;
    const top = promos[0];
    if (top.discountType === "PERCENT" && top.discountPercent != null) {
      return `${top.discountPercent}% off`;
    }
    if (top.discountType === "FIXED" && top.fixedDiscountCents != null) {
      return `${formatMoney(top.fixedDiscountCents)} off`;
    }
    return "On sale";
  }

  private load(): void {
    this.loading.set(true);
    forkJoin({
      categories: this.api.getCategories().pipe(catchError(() => of([] as string[]))),
      products: this.api.getProducts(this.category()).pipe(catchError(() => of([] as Product[]))),
      promotions: this.api.getPromotions().pipe(catchError(() => of([] as Promotion[]))),
    }).subscribe({
      next: (res) => {
        this.categories.set(res.categories);
        this.products.set(res.products);
        this.promotions.set(res.promotions);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (e: unknown) => {
        this.error.set(e instanceof Error ? e.message : "Failed to load");
        this.loading.set(false);
      },
    });
  }
}
