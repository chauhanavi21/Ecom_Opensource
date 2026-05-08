import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@demo.local" },
    update: {},
    create: {
      email: "admin@demo.local",
      passwordHash,
    },
  });

  const products = [
    {
      name: "Minimal Desk Lamp",
      slug: "minimal-desk-lamp",
      description: "Adjustable LED lamp with warm and cool modes.",
      priceCents: 4999,
      compareAtPriceCents: 6499,
      category: "Home",
      stock: 40,
      imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600",
    },
    {
      name: "Wireless Earbuds",
      slug: "wireless-earbuds",
      description: "Noise-cancelling earbuds with 24h case battery.",
      priceCents: 12900,
      compareAtPriceCents: 15900,
      category: "Electronics",
      stock: 120,
      imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
    },
    {
      name: "Organic Cotton Tee",
      slug: "organic-cotton-tee",
      description: "Soft crew neck tee, unisex fit.",
      priceCents: 2900,
      category: "Apparel",
      stock: 200,
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  const lamp = await prisma.product.findUnique({ where: { slug: "minimal-desk-lamp" } });
  await prisma.promotion.deleteMany({});
  await prisma.promotion.createMany({
    data: [
      {
        title: "Spring sale",
        description: "15% off everything this week",
        discountType: "PERCENT",
        discountPercent: 15,
        productId: null,
        isActive: true,
        sortOrder: 0,
        bannerImageUrl:
          "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200",
      },
      ...(lamp
        ? [
            {
              title: "Lamp spotlight",
              description: "$10 off the Minimal Desk Lamp",
              discountType: "FIXED",
              fixedDiscountCents: 1000,
              productId: lamp.id,
              isActive: true,
              sortOrder: 1,
            },
          ]
        : []),
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
