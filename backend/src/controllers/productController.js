const { store } = require('../db');

const getProducts = (req, res) => {
  try {
    const { search, companyName, stockStatus } = req.query;
    const products = store.getProducts({ search, companyName, stockStatus });

    // Enrich with computed status badge
    const enriched = products.map(p => {
      let status = 'IN_STOCK';
      if (p.stockQuantity === 0) {
        status = 'OUT_OF_STOCK';
      } else if (p.stockQuantity <= 20) {
        status = 'LOW_STOCK';
      }
      return {
        ...p,
        stockStatus: status
      };
    });

    return res.json({
      count: enriched.length,
      products: enriched
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to fetch products: ' + error.message });
  }
};

const getProductById = (req, res) => {
  try {
    const product = store.findProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    let stockStatus = 'IN_STOCK';
    if (product.stockQuantity === 0) stockStatus = 'OUT_OF_STOCK';
    else if (product.stockQuantity <= 20) stockStatus = 'LOW_STOCK';

    return res.json({ product: { ...product, stockStatus } });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve product.' });
  }
};

const createProduct = (req, res) => {
  try {
    const {
      brandName,
      genericName,
      companyName,
      description,
      pricePerBox,
      pricePerStrip,
      stockQuantity,
      batchNumber,
      expiryDate,
      hsnCode,
      gstRate
    } = req.body;

    if (!brandName || !genericName || !companyName || !pricePerBox || !pricePerStrip) {
      return res.status(400).json({
        error: 'Brand Name, Generic Name, Company Name, Price per Box, and Price per Strip are required.'
      });
    }

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newProduct = store.createProduct({
      brandName,
      genericName,
      companyName,
      description,
      imageUrl,
      pricePerBox,
      pricePerStrip,
      stockQuantity,
      batchNumber,
      expiryDate,
      hsnCode,
      gstRate
    });

    return res.status(201).json({
      message: 'Medicine added to Sakthimurugan wholesale catalog successfully.',
      product: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Failed to create product: ' + error.message });
  }
};

const updateProduct = (req, res) => {
  try {
    const productId = req.params.id;
    const existing = store.findProductById(productId);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    let updates = { ...req.body };
    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }

    if (updates.pricePerBox) updates.pricePerBox = Number(updates.pricePerBox);
    if (updates.pricePerStrip) updates.pricePerStrip = Number(updates.pricePerStrip);
    if (updates.stockQuantity !== undefined) updates.stockQuantity = Number(updates.stockQuantity);
    if (updates.gstRate) updates.gstRate = Number(updates.gstRate);

    const updated = store.updateProduct(productId, updates);
    return res.json({
      message: 'Product updated successfully.',
      product: updated
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update product: ' + error.message });
  }
};

const deleteProduct = (req, res) => {
  try {
    const success = store.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.json({ message: 'Product removed from wholesale catalog.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
