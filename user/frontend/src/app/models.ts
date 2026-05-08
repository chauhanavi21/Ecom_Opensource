export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  imageUrl: string | null;
  category: string;
  stock: number;
  isActive: boolean;
  promotions?: Promotion[];
};

export type Promotion = {
  id: string;
  title: string;
  description: string | null;
  discountType: string;
  discountPercent: number | null;
  fixedDiscountCents: number | null;
  productId: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  bannerImageUrl: string | null;
  sortOrder: number;
  product?: Product | null;
};
