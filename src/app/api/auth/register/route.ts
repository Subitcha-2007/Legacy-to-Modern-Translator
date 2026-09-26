import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let bodyData: any = {};
    let dlDocumentUrl: string | null = null;
    let gstDocumentUrl: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        if (typeof value === 'string') {
          bodyData[key] = value;
        }
      });

      // Handle uploads
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const dlFile = formData.get('dlDocument') as File | null;
      if (dlFile && typeof dlFile.arrayBuffer === 'function') {
        const buffer = Buffer.from(await dlFile.arrayBuffer());
        const filename = `dl-${Date.now()}-${dlFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        fs.writeFileSync(path.join(uploadsDir, filename), buffer);
        dlDocumentUrl = `/uploads/${filename}`;
      }

      const gstFile = formData.get('gstDocument') as File | null;
      if (gstFile && typeof gstFile.arrayBuffer === 'function') {
        const buffer = Buffer.from(await gstFile.arrayBuffer());
        const filename = `gst-${Date.now()}-${gstFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        fs.writeFileSync(path.join(uploadsDir, filename), buffer);
        gstDocumentUrl = `/uploads/${filename}`;
      }
    } else {
      bodyData = await req.json();
    }

    const {
      shopName,
      ownerName,
      email,
      phone,
      password,
      dlNumber,
      gstNumber,
      bankAccount,
      bankIfsc,
      address,
      pincode,
      termsAccepted
    } = bodyData;

    const terms = String(termsAccepted) === 'true';
    if (!terms) {
      return NextResponse.json(
        { error: 'You must accept Sakthimurugan Medical Agencies Wholesale Terms & Conditions.' },
        { status: 400 }
      );
    }

    if (!email || !password || !ownerName || !shopName || !phone || !dlNumber) {
      return NextResponse.json(
        { error: 'Please fill all mandatory fields: Shop Name, Owner Name, Email, Phone, Password, and Drug License (DL) Number.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        role: 'RETAILER',
        shopName,
        ownerName,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        dlNumber,
        dlDocumentUrl: dlDocumentUrl || '/uploads/sample_dl.pdf',
        gstNumber: gstNumber || null,
        gstDocumentUrl: gstDocumentUrl || null,
        bankAccount: bankAccount || null,
        bankIfsc: bankIfsc || null,
        isApproved: false, // Pending KYC approval by SMM admin
        creditLimit: 0,
        currentBalance: 0,
        address: address || '',
        pincode: pincode || '638001'
      }
    });

    return NextResponse.json(
      {
        message: 'Retailer registration submitted successfully. Your account is pending verification by Sakthimurugan Medical Agencies.',
        user: {
          id: newUser.id,
          shopName: newUser.shopName,
          ownerName: newUser.ownerName,
          email: newUser.email,
          phone: newUser.phone,
          dlNumber: newUser.dlNumber,
          isApproved: newUser.isApproved,
          createdAt: newUser.createdAt
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed: ' + error.message }, { status: 500 });
  }
}
