import "./env.js";
import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "./db.js";
import { authMiddleware, signToken } from "./auth.js";

const app = express();
const PORT = Number(process.env.ADMIN_API_PORT) || 3002;

app.use(
  cors({
    origin: [
      "http://localhost:4300",
      "http://127.0.0.1:4300",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "admin-api" });
});

app.post("/api/auth/login", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password) {
    res.status(400).json({ error: "email and password required" });
    return;
  }
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken({ sub: user.id, email: user.email });
  res.json({ token, email: user.email });
});

app.use(authMiddleware);

app.get("/api/products", async (_req, res) => {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: { promotions: true },
  });
  res.json(products);
});

app.post("/api/products", async (req, res) => {
  const b = req.body as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  const slug = String(b.slug ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const description = String(b.description ?? "");
  const priceCents = Number(b.priceCents);
  const category = String(b.category ?? "General");
  const stock = Number(b.stock ?? 0);
  if (!name || !slug || !Number.isFinite(priceCents)) {
    res.status(400).json({ error: "name, slug, priceCents required" });
    return;
  }
  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        priceCents: Math.round(priceCents),
        compareAtPriceCents:
          b.compareAtPriceCents != null ? Math.round(Number(b.compareAtPriceCents)) : null,
        imageUrl: b.imageUrl != null ? String(b.imageUrl) : null,
        category,
        stock: Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0,
        isActive: b.isActive !== false,
      },
    });
    res.status(201).json(product);
  } catch (e: unknown) {
    const code = typeof e === "object" && e && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2002") {
      res.status(409).json({ error: "slug already exists" });
      return;
    }
    throw e;
  }
});

app.patch("/api/products/:id", async (req, res) => {
  const b = req.body as Record<string, unknown>;
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(b.name != null ? { name: String(b.name) } : {}),
        ...(b.slug != null
          ? {
              slug: String(b.slug)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-"),
            }
          : {}),
        ...(b.description != null ? { description: String(b.description) } : {}),
        ...(b.priceCents != null ? { priceCents: Math.round(Number(b.priceCents)) } : {}),
        ...(b.compareAtPriceCents !== undefined
          ? {
              compareAtPriceCents:
                b.compareAtPriceCents === null
                  ? null
                  : Math.round(Number(b.compareAtPriceCents)),
            }
          : {}),
        ...(b.imageUrl !== undefined
          ? { imageUrl: b.imageUrl === null ? null : String(b.imageUrl) }
          : {}),
        ...(b.category != null ? { category: String(b.category) } : {}),
        ...(b.stock != null ? { stock: Math.max(0, Math.floor(Number(b.stock))) } : {}),
        ...(b.isActive != null ? { isActive: Boolean(b.isActive) } : {}),
      },
    });
    res.json(product);
  } catch (e: unknown) {
    const code = typeof e === "object" && e && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2025") {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (code === "P2002") {
      res.status(409).json({ error: "slug already exists" });
      return;
    }
    throw e;
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e: unknown) {
    const code = typeof e === "object" && e && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2025") {
      res.status(404).json({ error: "Not found" });
      return;
    }
    throw e;
  }
});

app.get("/api/promotions", async (_req, res) => {
  const list = await prisma.promotion.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { product: true },
  });
  res.json(list);
});

app.post("/api/promotions", async (req, res) => {
  const b = req.body as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  const discountType = String(b.discountType ?? "PERCENT") === "FIXED" ? "FIXED" : "PERCENT";
  if (!title) {
    res.status(400).json({ error: "title required" });
    return;
  }
  const row = await prisma.promotion.create({
    data: {
      title,
      description: b.description != null ? String(b.description) : null,
      discountType,
      discountPercent:
        discountType === "PERCENT" && b.discountPercent != null
          ? Number(b.discountPercent)
          : null,
      fixedDiscountCents:
        discountType === "FIXED" && b.fixedDiscountCents != null
          ? Math.round(Number(b.fixedDiscountCents))
          : null,
      productId: b.productId != null && b.productId !== "" ? String(b.productId) : null,
      startsAt: b.startsAt ? new Date(String(b.startsAt)) : null,
      endsAt: b.endsAt ? new Date(String(b.endsAt)) : null,
      isActive: b.isActive !== false,
      bannerImageUrl: b.bannerImageUrl != null ? String(b.bannerImageUrl) : null,
      sortOrder: b.sortOrder != null ? Math.floor(Number(b.sortOrder)) : 0,
    },
  });
  res.status(201).json(row);
});

app.patch("/api/promotions/:id", async (req, res) => {
  const b = req.body as Record<string, unknown>;
  const discountType =
    b.discountType != null
      ? String(b.discountType) === "FIXED"
        ? "FIXED"
        : "PERCENT"
      : undefined;
  try {
    const row = await prisma.promotion.update({
      where: { id: req.params.id },
      data: {
        ...(b.title != null ? { title: String(b.title) } : {}),
        ...(b.description !== undefined
          ? { description: b.description === null ? null : String(b.description) }
          : {}),
        ...(discountType != null ? { discountType } : {}),
        ...(b.discountPercent !== undefined
          ? { discountPercent: b.discountPercent === null ? null : Number(b.discountPercent) }
          : {}),
        ...(b.fixedDiscountCents !== undefined
          ? {
              fixedDiscountCents:
                b.fixedDiscountCents === null ? null : Math.round(Number(b.fixedDiscountCents)),
            }
          : {}),
        ...(b.productId !== undefined
          ? { productId: b.productId === null || b.productId === "" ? null : String(b.productId) }
          : {}),
        ...(b.startsAt !== undefined
          ? { startsAt: b.startsAt ? new Date(String(b.startsAt)) : null }
          : {}),
        ...(b.endsAt !== undefined ? { endsAt: b.endsAt ? new Date(String(b.endsAt)) : null } : {}),
        ...(b.isActive != null ? { isActive: Boolean(b.isActive) } : {}),
        ...(b.bannerImageUrl !== undefined
          ? { bannerImageUrl: b.bannerImageUrl === null ? null : String(b.bannerImageUrl) }
          : {}),
        ...(b.sortOrder != null ? { sortOrder: Math.floor(Number(b.sortOrder)) } : {}),
      },
    });
    res.json(row);
  } catch (e: unknown) {
    const code = typeof e === "object" && e && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2025") {
      res.status(404).json({ error: "Not found" });
      return;
    }
    throw e;
  }
});

app.delete("/api/promotions/:id", async (req, res) => {
  try {
    await prisma.promotion.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e: unknown) {
    const code = typeof e === "object" && e && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2025") {
      res.status(404).json({ error: "Not found" });
      return;
    }
    throw e;
  }
});

app.listen(PORT, () => {
  console.log(`Admin API http://localhost:${PORT}`);
});
