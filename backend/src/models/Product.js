import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    breed: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true, uppercase: true },
    sku: { type: String, required: true, trim: true, uppercase: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 3 },
  },
  { _id: true },
);

const sizeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, uppercase: true },
    neckCm: { type: Number, required: true, min: 0 },
    chestCm: { type: Number, required: true, min: 0 },
    backCm: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const sizeChartSchema = new mongoose.Schema(
  {
    breed: { type: String, required: true },
    sizes: { type: [sizeSchema], default: [] },
  },
  { _id: false },
);

const sizeSpecSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true, uppercase: true },
    neckMinCm: { type: Number, required: true, min: 0 },
    neckMaxCm: { type: Number, required: true, min: 0 },
    chestMinCm: { type: Number, required: true, min: 0 },
    chestMaxCm: { type: Number, required: true, min: 0 },
    backMinCm: { type: Number, required: true, min: 0 },
    backMaxCm: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const modelSchema = new mongoose.Schema(
  {
    breed: { type: String, required: true, trim: true },
    modelPath: { type: String, required: true, trim: true },
    cloudinaryPublicId: { type: String, trim: true },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true },
    imageCloudinaryPublicId: { type: String, trim: true },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    availableBreeds: { type: [String], default: [] },
    sizeCharts: { type: [sizeChartSchema], default: [] },
    sizeSpecs: { type: [sizeSpecSchema], default: [] },
    models: {
      type: [modelSchema],
      default: [],
      validate: {
        validator(models) {
          const breeds = models.map((model) => model.breed.toLowerCase());
          return new Set(breeds).size === breeds.length;
        },
        message: "A product can only have one 3D model per breed",
      },
    },
    inventory: { type: [inventorySchema], default: [] },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text", category: "text" });
productSchema.index({ "inventory.sku": 1 }, { unique: true });

export default mongoose.model("Product", productSchema);
