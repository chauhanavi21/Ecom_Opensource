import "./env.js";
import cors from "cors";
import express from "express";
import { prisma } from "./db.js";

const app = express();
const PORT = Number(process.env.USER_API_PORT) || 3001;

app.use(
  cors({
    origin: [
      "http://localhost:4200",
      "http://127.0.0.1:4200",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());

function now() {
  return new Date();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "user-api" });
});

app.get("/api/products", async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const where = {
    isActive: true,
    ...(category ? { category } : {}),
  };
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      promotions: {
        where: {
          isActive: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now() } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: now() } }] },
          ],
        },
      },
    },
  });
  res.json(products);
});

app.get("/api/products/:slug", async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { slug: req.params.slug, isActive: true },
    include: {
      promotions: {
        where: {
          isActive: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now() } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: now() } }] },
          ],
        },
      },
    },
  });
  if (!product) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(product);
});

app.get("/api/promotions", async (_req, res) => {
  const t = now();
  const promotions = await prisma.promotion.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: t } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: t } }] },
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { product: true },
  });
  res.json(promotions);
});

app.get("/api/categories", async (_req, res) => {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  res.json(rows.map((r) => r.category));
});

app.listen(PORT, () => {
  console.log(`User API http://localhost:${PORT}`);
});
