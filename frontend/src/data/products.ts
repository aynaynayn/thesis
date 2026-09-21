export type Breed = "Labrador" | "Pomeranian" | "Dachshund" | "Aspin";

export type SizeChart = {
  breed: Breed;
  sizes: { label: string; neckCm: number; chestCm: number; backCm: number }[];
};
export type SizeSpec = { size: string; neckMinCm: number; neckMaxCm: number; chestMinCm: number; chestMaxCm: number; backMinCm: number; backMaxCm: number };

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
  cloudinaryPublicId?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  description: string;
  image: string;
  imageCloudinaryPublicId?: string;
  images: string[];
  availableBreeds: Breed[];
  sizeCharts: SizeChart[];
  sizeSpecs: SizeSpec[];
  models: ProductModel[];
  inventory: InventoryItem[];
  stock: number;
  featured: boolean;
  isActive: boolean;
};

export const BREEDS: Breed[] = ["Labrador", "Pomeranian", "Dachshund", "Aspin"];
