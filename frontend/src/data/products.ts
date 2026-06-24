export type Breed = "Labrador" | "Pomeranian" | "Dachshund" | "Aspin";

export type SizeChart = {
  breed: Breed;
  sizes: { label: string; neckCm: number; chestCm: number; backCm: number }[];
};

export type Product = {
  id: string;
  name: string;
  category: "Shirt" | "Hoodie" | "Raincoat" | "Costume" | "Dress";
  price: number;
  description: string;
  image: string;
  colors: string[];
  availableBreeds: Breed[];
  sizeCharts: SizeChart[];
  stock: number;
  featured: boolean;
};

export const BREEDS: Breed[] = ["Labrador", "Pomeranian", "Dachshund", "Aspin"];

export const PRODUCTS: Product[] = [
  {
    id: "p001",
    name: "Classic Polo Tee",
    category: "Shirt",
    price: 349,
    description:
      "A breathable cotton polo designed for everyday walks. Tailored to fit breed-specific body proportions for maximum comfort and a clean silhouette.",
    image: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&h=600&fit=crop&auto=format",
    colors: ["#E8D5B7", "#A8C4D6", "#C4D6A8"],
    availableBreeds: ["Labrador", "Aspin"],
    sizeCharts: [
      {
        breed: "Labrador",
        sizes: [
          { label: "M", neckCm: 34, chestCm: 60, backCm: 40 },
          { label: "L", neckCm: 38, chestCm: 68, backCm: 46 },
          { label: "XL", neckCm: 42, chestCm: 76, backCm: 52 },
        ],
      },
      {
        breed: "Aspin",
        sizes: [
          { label: "S", neckCm: 26, chestCm: 46, backCm: 30 },
          { label: "M", neckCm: 30, chestCm: 54, backCm: 36 },
          { label: "L", neckCm: 34, chestCm: 62, backCm: 42 },
        ],
      },
    ],
    stock: 24,
    featured: true,
  },
  {
    id: "p002",
    name: "Fluffy Cloud Hoodie",
    category: "Hoodie",
    price: 598,
    description:
      "A cozy fleece hoodie perfect for cool Baguio evenings or air-conditioned malls. Shaped for the Pomeranian's distinctive fluffy build.",
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600&h=600&fit=crop&auto=format",
    colors: ["#F5E6D3", "#D6C4E8", "#A8C4D6"],
    availableBreeds: ["Pomeranian"],
    sizeCharts: [
      {
        breed: "Pomeranian",
        sizes: [
          { label: "XS", neckCm: 18, chestCm: 28, backCm: 18 },
          { label: "S", neckCm: 20, chestCm: 32, backCm: 22 },
        ],
      },
    ],
    stock: 18,
    featured: true,
  },
  {
    id: "p003",
    name: "Sausage Stretch Raincoat",
    category: "Raincoat",
    price: 720,
    description:
      "Waterproof and snug, engineered for the Dachshund's elongated frame. Velcro belly strap ensures a secure fit during rainy season walks.",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop&auto=format",
    colors: ["#FFD166", "#A8C4D6", "#FF6B6B"],
    availableBreeds: ["Dachshund"],
    sizeCharts: [
      {
        breed: "Dachshund",
        sizes: [
          { label: "S", neckCm: 22, chestCm: 36, backCm: 38 },
          { label: "M", neckCm: 24, chestCm: 40, backCm: 44 },
        ],
      },
    ],
    stock: 12,
    featured: true,
  },
  {
    id: "p004",
    name: "Barong Tagalog Costume",
    category: "Costume",
    price: 850,
    description:
      "A festive Barong Tagalog-inspired costume for special occasions. Let your pup dress up for family events, photoshoots, or town fiestas.",
    image: "https://images.unsplash.com/photo-1583512603806-077998240c7a?w=600&h=600&fit=crop&auto=format",
    colors: ["#F5F5DC", "#E8D5B7"],
    availableBreeds: ["Labrador", "Aspin", "Pomeranian"],
    sizeCharts: [
      {
        breed: "Labrador",
        sizes: [
          { label: "L", neckCm: 38, chestCm: 68, backCm: 46 },
          { label: "XL", neckCm: 42, chestCm: 76, backCm: 52 },
        ],
      },
      {
        breed: "Aspin",
        sizes: [
          { label: "S", neckCm: 26, chestCm: 46, backCm: 30 },
          { label: "M", neckCm: 30, chestCm: 54, backCm: 36 },
        ],
      },
      {
        breed: "Pomeranian",
        sizes: [
          { label: "XS", neckCm: 18, chestCm: 28, backCm: 18 },
        ],
      },
    ],
    stock: 8,
    featured: false,
  },
  {
    id: "p005",
    name: "Pawprint Graphic Shirt",
    category: "Shirt",
    price: 299,
    description:
      "A fun casual shirt with an embroidered paw print chest detail. Lightweight cotton that stays cool in Philippine heat.",
    image: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&h=600&fit=crop&auto=format",
    colors: ["#A8C4D6", "#C8A06A", "#F5E6D3"],
    availableBreeds: ["Labrador", "Aspin", "Dachshund"],
    sizeCharts: [
      {
        breed: "Labrador",
        sizes: [
          { label: "M", neckCm: 34, chestCm: 60, backCm: 40 },
          { label: "L", neckCm: 38, chestCm: 68, backCm: 46 },
        ],
      },
      {
        breed: "Aspin",
        sizes: [
          { label: "S", neckCm: 26, chestCm: 46, backCm: 30 },
          { label: "M", neckCm: 30, chestCm: 54, backCm: 36 },
        ],
      },
      {
        breed: "Dachshund",
        sizes: [
          { label: "S", neckCm: 22, chestCm: 36, backCm: 38 },
        ],
      },
    ],
    stock: 30,
    featured: false,
  },
  {
    id: "p006",
    name: "Floral Summer Dress",
    category: "Dress",
    price: 480,
    description:
      "A lightweight floral dress for girl dogs. Adjustable straps and open back design keep smaller breeds cool and stylish.",
    image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=600&fit=crop&auto=format",
    colors: ["#FFB3C6", "#B3D9FF", "#D4F5C4"],
    availableBreeds: ["Pomeranian", "Aspin"],
    sizeCharts: [
      {
        breed: "Pomeranian",
        sizes: [
          { label: "XS", neckCm: 18, chestCm: 28, backCm: 20 },
          { label: "S", neckCm: 20, chestCm: 32, backCm: 24 },
        ],
      },
      {
        breed: "Aspin",
        sizes: [
          { label: "S", neckCm: 26, chestCm: 46, backCm: 30 },
        ],
      },
    ],
    stock: 15,
    featured: true,
  },
];

export const CATEGORIES = ["All", "Shirt", "Hoodie", "Raincoat", "Costume", "Dress"] as const;
