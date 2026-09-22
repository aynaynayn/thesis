import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

async function getCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) cart = await Cart.create({ user: userId });
  return cart.populate("items.product");
}

function stockForSize(product, size) {
  return product.inventory
    .filter((item) => item.size === size)
    .reduce((total, item) => total + item.stock, 0);
}

function publicCart(cart) {
  return {
    id: cart._id,
    items: cart.items
      .filter((item) => item.product)
      .map((item) => ({
        id: item._id,
        product: item.product,
        petBreed: item.petBreed,
        size: item.size,
        quantity: item.quantity,
      })),
  };
}

export async function getCurrentCart(req, res, next) {
  try {
    res.json({ cart: publicCart(await getCart(req.user._id)) });
  } catch (error) {
    next(error);
  }
}

export async function addCartItem(req, res, next) {
  try {
    const { productId, size, petBreed, quantity = 1 } = req.body;
    if (!productId || !size || !Number.isInteger(quantity) || quantity < 1 || quantity > 20)
      return res.status(400).json({ message: "Product, size, and a quantity from 1 to 20 are required" });

    const product = await Product.findOne({ _id: productId, isActive: true });
    const normalizedSize = size.trim().toUpperCase();
    const stock = product ? stockForSize(product, normalizedSize) : 0;
    if (!product || stock < quantity)
      return res.status(409).json({ message: "The selected size is unavailable" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    const item = cart.items.find(
      (entry) => String(entry.product) === String(productId) && entry.size === normalizedSize,
    );
    const requestedQuantity = (item?.quantity || 0) + quantity;
    if (requestedQuantity > stock)
      return res.status(409).json({ message: "Only the currently available quantity can be added" });

    if (item) {
      item.quantity = requestedQuantity;
      if (petBreed) item.petBreed = String(petBreed).trim();
    } else {
      cart.items.push({
        product: productId,
        petBreed: String(petBreed || "").trim(),
        size: normalizedSize,
        quantity,
      });
    }
    await cart.save();
    res.status(201).json({ cart: publicCart(await cart.populate("items.product")) });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const { quantity } = req.body;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20)
      return res.status(400).json({ message: "Quantity must be from 1 to 20" });
    const cart = await getCart(req.user._id);
    const item = cart.items.id(req.params.itemId);
    if (!item || !item.product)
      return res.status(404).json({ message: "Cart item not found" });
    if (stockForSize(item.product, item.size) < quantity)
      return res.status(409).json({ message: "Requested quantity is unavailable" });
    item.quantity = quantity;
    await cart.save();
    res.json({ cart: publicCart(cart) });
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(req, res, next) {
  try {
    const cart = await getCart(req.user._id);
    cart.items.pull(req.params.itemId);
    await cart.save();
    res.json({ cart: publicCart(await cart.populate("items.product")) });
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req, res, next) {
  try {
    await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
