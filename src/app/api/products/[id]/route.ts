import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }
    let stockStatus = 'IN_STOCK';
    if (product.stockQuantity === 0) stockStatus = 'OUT_OF_STOCK';
    else if (product.stockQuantity <= 20) stockStatus = 'LOW_STOCK';

    return NextResponse.json({ product: { ...product, stockStatus } });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve product.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await verifyAuth(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const id = Number(params.id);
    const contentType = req.headers.get('content-type') || '';
    const data: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      if (formData.has('brandName')) data.brandName = (formData.get('brandName') as string).trim();
      if (formData.has('genericName')) data.genericName = (formData.get('genericName') as string).trim();
      if (formData.has('companyName')) data.companyName = (formData.get('companyName') as string).trim();
      if (formData.has('description')) data.description = ((formData.get('description') as string) || '').trim();
      if (formData.has('batchNumber')) data.batchNumber = (formData.get('batchNumber') as string).trim();
      if (formData.has('expiryDate')) data.expiryDate = (formData.get('expiryDate') as string).trim();
      if (formData.has('hsnCode')) data.hsnCode = (formData.get('hsnCode') as string).trim();

      const stockRaw = formData.get('stockQuantity');
      const boxPriceRaw = formData.get('pricePerBox');
      const stripPriceRaw = formData.get('pricePerStrip');
      const gstRateRaw = formData.get('gstRate');

      if (stockRaw !== null) data.stockQuantity = parseInt(String(stockRaw), 10) || 0;
      if (boxPriceRaw !== null) data.pricePerBox = parseFloat(String(boxPriceRaw)) || 0;
      if (stripPriceRaw !== null) data.pricePerStrip = parseFloat(String(stripPriceRaw)) || 0;
      if (gstRateRaw !== null) data.gstRate = parseFloat(String(gstRateRaw)) || 12.0;

      const imageField = formData.get('image');
      const imageUrlField = formData.get('imageUrl');
      if (imageField && typeof imageField === 'object' && 'arrayBuffer' in imageField && (imageField as File).size > 0) {
        try {
          const buffer = Buffer.from(await (imageField as File).arrayBuffer());
          const base64 = buffer.toString('base64');
          const mimeType = (imageField as File).type || 'image/jpeg';
          data.imageUrl = `data:${mimeType};base64,${base64}`;
        } catch {
          // ignore if failed
        }
      } else if (imageUrlField && typeof imageUrlField === 'string' && imageUrlField.trim()) {
        data.imageUrl = imageUrlField.trim();
      }
    } else {
      const updates = await req.json();
      if (updates.brandName !== undefined) data.brandName = String(updates.brandName).trim();
      if (updates.genericName !== undefined) data.genericName = String(updates.genericName).trim();
      if (updates.companyName !== undefined) data.companyName = String(updates.companyName).trim();
      if (updates.description !== undefined) data.description = String(updates.description).trim();
      if (updates.imageUrl !== undefined && typeof updates.imageUrl === 'string') data.imageUrl = updates.imageUrl.trim();
      if (updates.pricePerBox !== undefined) data.pricePerBox = parseFloat(String(updates.pricePerBox)) || 0;
      if (updates.pricePerStrip !== undefined) data.pricePerStrip = parseFloat(String(updates.pricePerStrip)) || 0;
      if (updates.stockQuantity !== undefined) data.stockQuantity = parseInt(String(updates.stockQuantity), 10) || 0;
      if (updates.batchNumber !== undefined) data.batchNumber = String(updates.batchNumber).trim();
      if (updates.expiryDate !== undefined) data.expiryDate = String(updates.expiryDate).trim();
      if (updates.hsnCode !== undefined) data.hsnCode = String(updates.hsnCode).trim();
      if (updates.gstRate !== undefined) data.gstRate = parseFloat(String(updates.gstRate)) || 12.0;
    }

    const updated = await prisma.product.update({
      where: { id },
      data
    });

    return NextResponse.json({
      message: 'Product updated successfully.',
      product: updated
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update product: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await verifyAuth(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const id = Number(params.id);
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: 'Product removed from wholesale catalog.' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete product.' }, { status: 500 });
  }
}
