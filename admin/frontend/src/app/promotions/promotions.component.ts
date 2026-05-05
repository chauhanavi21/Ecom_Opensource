import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { forkJoin } from "rxjs";
import { AdminApiService } from "../admin-api.service";
import type { Product, Promotion } from "../models";

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

@Component({
  selector: "app-promotions",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./promotions.component.html",
  styleUrl: "./promotions.component.css",
})
export class PromotionsComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly products = signal<Product[]>([]);
  readonly items = signal<Promotion[]>([]);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);
  readonly editingId = signal<string | null>(null);

  form = {
    title: "",
    description: "",
    discountType: "PERCENT" as "PERCENT" | "FIXED",
    discountPercent: "",
    fixedDiscountCents: "",
    productId: "",
    startsAt: "",
    endsAt: "",
    bannerImageUrl: "",
    sortOrder: "0",
    isActive: true,
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    forkJoin({ products: this.api.getProducts(), promotions: this.api.getPromotions() }).subscribe({
      next: (res) => {
        this.products.set(res.products);
        this.items.set(res.promotions);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (e: unknown) => {
        this.error.set(e instanceof Error ? e.message : "Failed to load");
        this.loading.set(false);
      },
    });
  }

  resetForm(): void {
    this.form = {
      title: "",
      description: "",
      discountType: "PERCENT",
      discountPercent: "",
      fixedDiscountCents: "",
      productId: "",
      startsAt: "",
      endsAt: "",
      bannerImageUrl: "",
      sortOrder: "0",
      isActive: true,
    };
    this.editingId.set(null);
  }

  startEdit(p: Promotion): void {
    this.editingId.set(p.id);
    this.form = {
      title: p.title,
      description: p.description ?? "",
      discountType: p.discountType === "FIXED" ? "FIXED" : "PERCENT",
      discountPercent: p.discountPercent != null ? String(p.discountPercent) : "",
      fixedDiscountCents: p.fixedDiscountCents != null ? String(p.fixedDiscountCents) : "",
      productId: p.productId ?? "",
      startsAt: toLocalInput(p.startsAt),
      endsAt: toLocalInput(p.endsAt),
      bannerImageUrl: p.bannerImageUrl ?? "",
      sortOrder: String(p.sortOrder),
      isActive: p.isActive,
    };
  }

  save(): void {
    const id = this.editingId();
    const body = {
      title: this.form.title,
      description: this.form.description || null,
      discountType: this.form.discountType,
      discountPercent:
        this.form.discountType === "PERCENT" && this.form.discountPercent
          ? Number(this.form.discountPercent)
          : null,
      fixedDiscountCents:
        this.form.discountType === "FIXED" && this.form.fixedDiscountCents
          ? Math.round(Number(this.form.fixedDiscountCents))
          : null,
      productId: this.form.productId || null,
      startsAt: this.form.startsAt ? new Date(this.form.startsAt).toISOString() : null,
      endsAt: this.form.endsAt ? new Date(this.form.endsAt).toISOString() : null,
      bannerImageUrl: this.form.bannerImageUrl || null,
      sortOrder: Number(this.form.sortOrder) || 0,
      isActive: this.form.isActive,
    };
    if (id) {
      this.api.updatePromotion(id, body).subscribe({
        next: () => {
          this.resetForm();
          this.load();
        },
        error: (e: unknown) => this.error.set(e instanceof Error ? e.message : "Save failed"),
      });
    } else {
      this.api.createPromotion(body).subscribe({
        next: () => {
          this.resetForm();
          this.load();
        },
        error: (e: unknown) => this.error.set(e instanceof Error ? e.message : "Create failed"),
      });
    }
  }

  delete(p: Promotion): void {
    if (!confirm("Delete this promotion?")) return;
    this.api.deletePromotion(p.id).subscribe({
      next: () => this.load(),
      error: (e: unknown) => this.error.set(e instanceof Error ? e.message : "Delete failed"),
    });
  }
}
