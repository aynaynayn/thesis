import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

async function getCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) cart = await Cart.create({ user: userId });
  return cart.populate("items.product");
}

function publicCart(cart) {
  return {
    id: cart._id,
    items: cart.items.filter((item) => item.product).map((item) => ({ id: item._id, product: item.product, breed: item.breed, petBreed: item.petBreed, size: item.size, quantity: item.quantity })),
  };
}

export async function getCurrentCart(req, res, next) {
  try { res.json({ cart: publicCart(await getCart(req.user._id)) }); } catch (error) { next(error); }
}

export async function addCartItem(req, res, next) {
  try {
    const { productId, size, petBreed, quantity = 1 } = req.body;
    if (!productId || !size || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ message: "Product, size, and a quantity from 1 to 20 are required" });
    const product = await Product.findOne({ _id: productId, isActive: true });
    const normalizedSize = size.trim().toUpperCase();
    const variant = product?.inventory.find((item) => item.size === normalizedSize && item.stock >= quantity);
    if (!variant || variant.stock < quantity) return res.status(409).json({ message: "The selected product variant is unavailable" });
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id, "items.product": productId, "items.breed": variant.breed, "items.size": normalizedSize },
      { $inc: { "items.$.quantity": quantity } },
      { new: true },
    );
    const updated = cart || await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $push: { items: { product: productId, breed: variant.breed, petBreed: String(petBreed || "").trim(), size: normalizedSize, quantity } } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    const current = await updated.populate("items.product");
    const item = current.items.find((cartItem) => String(cartItem.product._id) === String(productId) && cartItem.breed === variant.breed && cartItem.size === normalizedSize);
    if (!item || item.quantity > variant.stock) {
      await Cart.updateOne({ _id: current._id }, { $set: { "items.$[item].quantity": variant.stock } }, { arrayFilters: [{ "item.product": product._id, "item.breed": variant.breed, "item.size": normalizedSize }] });
      return res.status(409).json({ message: "Only the currently available quantity can be added" });
    }
    res.status(201).json({ cart: publicCart(current) });
  } catch (error) { next(error); }
}

export async function updateCartItem(req, res, next) {
  try {
    const { quantity } = req.body;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ message: "Quantity must be from 1 to 20" });
    const cart = await getCart(req.user._id);
    const item = cart.items.id(req.params.itemId);
    if (!item || !item.product) return res.status(404).json({ message: "Cart item not found" });
    const variant = item.product.inventory.find((entry) => entry.breed === item.breed && entry.size === item.size);
    if (!variant || variant.stock < quantity) return res.status(409).json({ message: "Requested quantity is unavailable" });
    item.quantity = quantity;
    await cart.save();
    res.json({ cart: publicCart(cart) });
  } catch (error) { next(error); }
}

export async function removeCartItem(req, res, next) {
  try {
    const cart = await getCart(req.user._id);
    cart.items.pull(req.params.itemId);
    await cart.save();
    res.json({ cart: publicCart(await cart.populate("items.product")) });
  } catch (error) { next(error); }
}

export async function clearCart(req, res, next) {
  try { await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } }); res.status(204).end(); } catch (error) { next(error); }
}
