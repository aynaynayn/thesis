export type Breed = string;

export type SizeChart = {
  breed: Breed;
  sizes: { label: string; neckCm: number; chestCm: number; backCm: number }[];
};
export type SizeSpec = { size: string; neckMinCm: number; neckMaxCm: number; chestMinCm: number; chestMaxCm: number; backMinCm: number; backMaxCm: number };

export type InventoryItem = {
  _id?: string;
  size: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  price?: number;
};

export type ProductModel = {
  breed: string;
  modelPath: string;
  cloudinaryPublicId?: string;
};
export type ColorVariant = { _id?: string; name: string; hex: string; models: ProductModel[] };

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
  availableBreeds: string[];
  sizeCharts: SizeChart[];
  sizeSpecs: SizeSpec[];
  models: ProductModel[];
  colorVariants: ColorVariant[];
  inventory: InventoryItem[];
  stock: number;
  featured: boolean;
  isActive: boolean;
};

export function priceForSize(product: Product, size?: string | null) {
  const override = product.inventory.find((item) => item.size === size)?.price;
  return typeof override === "number" ? override : product.price;
}
