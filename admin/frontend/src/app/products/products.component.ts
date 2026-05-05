import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AdminApiService } from "../admin-api.service";
import { formatMoney } from "../money";
import type { Product } from "../models";

@Component({
  selector: "app-products",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./products.component.html",
  styleUrl: "./products.component.css",
})
export class ProductsComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly items = signal<Product[]>([]);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);
  readonly editingId = signal<string | null>(null);

  readonly formatMoney = formatMoney;

  form = {
    name: "",
    slug: "",
    description: "",
    priceCents: "",
    compareAtPriceCents: "",
    imageUrl: "",
    category: "General",
    stock: "0",
    isActive: true,
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.getProducts().subscribe({
      next: (list) => {
        this.items.set(list);
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
      name: "",
      slug: "",
      description: "",
      priceCents: "",
      compareAtPriceCents: "",
      imageUrl: "",
      category: "General",
      stock: "0",
      isActive: true,
    };
    this.editingId.set(null);
  }

  startEdit(p: Product): void {
    this.editingId.set(p.id);
    this.form = {
      name: p.name,
      slug: p.slug,
      description: p.description,
      priceCents: String(p.priceCents),
      compareAtPriceCents: p.compareAtPriceCents != null ? String(p.compareAtPriceCents) : "",
      imageUrl: p.imageUrl ?? "",
      category: p.category,
      stock: String(p.stock),
      isActive: p.isActive,
    };
  }

  save(): void {
    const id = this.editingId();
    const body = {
      name: this.form.name,
      slug: this.form.slug,
      description: this.form.description,
      priceCents: Number(this.form.priceCents),
      compareAtPriceCents: this.form.compareAtPriceCents
        ? Number(this.form.compareAtPriceCents)
        : null,
      imageUrl: this.form.imageUrl || null,
      category: this.form.category,
      stock: Number(this.form.stock),
      isActive: this.form.isActive,
    };
    if (id) {
      this.api.updateProduct(id, body).subscribe({
        next: () => {
          this.resetForm();
          this.load();
        },
        error: (e: unknown) => this.error.set(e instanceof Error ? e.message : "Save failed"),
      });
    } else {
      this.api.createProduct(body).subscribe({
        next: () => {
          this.resetForm();
          this.load();
        },
        error: (e: unknown) => this.error.set(e instanceof Error ? e.message : "Create failed"),
      });
    }
  }

  toggleActive(p: Product): void {
    this.api.updateProduct(p.id, { isActive: !p.isActive }).subscribe({
      next: () => this.load(),
      error: (e: unknown) => this.error.set(e instanceof Error ? e.message : "Update failed"),
    });
  }

  delete(p: Product): void {
    if (!confirm("Delete this product?")) return;
    this.api.deleteProduct(p.id).subscribe({
      next: () => this.load(),
      error: (e: unknown) => this.error.set(e instanceof Error ? e.message : "Delete failed"),
    });
  }
}
