import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const companyName = searchParams.get('companyName') || 'ALL';
    const stockStatus = searchParams.get('stockStatus') || 'ALL';

    const where: any = {};

    if (search.trim()) {
      where.OR = [
        { brandName: { contains: search.trim() } },
        { genericName: { contains: search.trim() } },
        { companyName: { contains: search.trim() } }
      ];
    }

    if (companyName !== 'ALL') {
      where.companyName = companyName;
    }

    if (stockStatus === 'in_stock') {
      where.stockQuantity = { gt: 20 };
    } else if (stockStatus === 'low_stock') {
      where.stockQuantity = { gt: 0, lte: 20 };
    } else if (stockStatus === 'out_of_stock') {
      where.stockQuantity = 0;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { id: 'asc' }
    });

    const enriched = products.map(p => {
      let status = 'IN_STOCK';
      if (p.stockQuantity === 0) status = 'OUT_OF_STOCK';
      else if (p.stockQuantity <= 20) status = 'LOW_STOCK';
      return { ...p, stockStatus: status };
    });

    return NextResponse.json({
      count: enriched.length,
      products: enriched
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products: ' + error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const contentType = req.headers.get('content-type') || '';
    const defaultImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';

    let brandName = '';
    let genericName = '';
    let companyName = '';
    let description = '';
    let imageUrl = defaultImage;
    let pricePerBox = 0;
    let pricePerStrip = 0;
    let stockQuantity = 0;
    let batchNumber = '';
    let expiryDate = '';
    let hsnCode = '3004';
    let gstRate = 12.0;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      brandName = (formData.get('brandName') as string) || '';
      genericName = (formData.get('genericName') as string) || '';
      companyName = (formData.get('companyName') as string) || '';
      description = (formData.get('description') as string) || '';
      batchNumber = (formData.get('batchNumber') as string) || '';
      expiryDate = (formData.get('expiryDate') as string) || '';
      hsnCode = (formData.get('hsnCode') as string) || '3004';

      const stockRaw = formData.get('stockQuantity');
      const boxPriceRaw = formData.get('pricePerBox');
      const stripPriceRaw = formData.get('pricePerStrip');
      const gstRateRaw = formData.get('gstRate');

      stockQuantity = stockRaw !== null ? parseInt(String(stockRaw), 10) || 0 : 0;
      pricePerBox = boxPriceRaw !== null ? parseFloat(String(boxPriceRaw)) || 0 : 0;
      pricePerStrip = stripPriceRaw !== null ? parseFloat(String(stripPriceRaw)) || 0 : 0;
      gstRate = gstRateRaw !== null ? parseFloat(String(gstRateRaw)) || 12.0 : 12.0;

      // Handle image file or string URL
      const imageField = formData.get('image');
      const imageUrlField = formData.get('imageUrl');

      if (imageField && typeof imageField === 'object' && 'arrayBuffer' in imageField && (imageField as File).size > 0) {
        try {
          const buffer = Buffer.from(await (imageField as File).arrayBuffer());
          const base64 = buffer.toString('base64');
          const mimeType = (imageField as File).type || 'image/jpeg';
          imageUrl = `data:${mimeType};base64,${base64}`;
        } catch {
          imageUrl = defaultImage;
        }
      } else if (imageUrlField && typeof imageUrlField === 'string' && imageUrlField.trim()) {
        imageUrl = imageUrlField.trim();
      }
    } else {
      // Standard application/json payload
      const data = await req.json();
      brandName = data.brandName || '';
      genericName = data.genericName || '';
      companyName = data.companyName || '';
      description = data.description || '';
      batchNumber = data.batchNumber || '';
      expiryDate = data.expiryDate || '';
      hsnCode = data.hsnCode || '3004';

      stockQuantity = data.stockQuantity !== undefined ? parseInt(String(data.stockQuantity), 10) || 0 : 0;
      pricePerBox = data.pricePerBox !== undefined ? parseFloat(String(data.pricePerBox)) || 0 : 0;
      pricePerStrip = data.pricePerStrip !== undefined ? parseFloat(String(data.pricePerStrip)) || 0 : 0;
      gstRate = data.gstRate !== undefined ? parseFloat(String(data.gstRate)) || 12.0 : 12.0;

      if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.trim()) {
        imageUrl = data.imageUrl.trim();
      }
    }

    if (!brandName.trim() || !genericName.trim() || !companyName.trim() || pricePerBox <= 0 || pricePerStrip <= 0) {
      return NextResponse.json(
        { error: 'Brand Name, Generic Name, Company Name, and valid wholesale Box & Strip prices (> 0) are required.' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        brandName: brandName.trim(),
        genericName: genericName.trim(),
        companyName: companyName.trim(),
        description: description.trim(),
        imageUrl: imageUrl || defaultImage,
        pricePerBox,
        pricePerStrip,
        stockQuantity,
        batchNumber: batchNumber.trim() || `SMM-BT-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: expiryDate.trim() || '12/2027',
        hsnCode: hsnCode.trim() || '3004',
        gstRate
      }
    });

    return NextResponse.json(
      {
        message: 'Medicine added to Sakthimurugan wholesale catalog successfully.',
        product: newProduct
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product: ' + error.message }, { status: 500 });
  }
}
