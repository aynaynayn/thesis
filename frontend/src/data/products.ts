export type Breed = "Labrador" | "Pomeranian" | "Dachshund" | "Aspin";

export type SizeChart = {
  breed: Breed;
  sizes: { label: string; neckCm: number; chestCm: number; backCm: number }[];
};

export type InventoryItem = {
  _id?: string;
  breed: Breed;
  size: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
};

export type ProductModel = {
  breed: string;
  modelPath: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  description: string;
  image: string;
  images: string[];
  availableBreeds: Breed[];
  sizeCharts: SizeChart[];
  models: ProductModel[];
  inventory: InventoryItem[];
  stock: number;
  featured: boolean;
  isActive: boolean;
};

export const BREEDS: Breed[] = ["Labrador", "Pomeranian", "Dachshund", "Aspin"];
