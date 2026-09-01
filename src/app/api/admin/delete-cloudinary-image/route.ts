import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { publicId } = await request.json();
    if (!publicId) {
      return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary credentials are not configured on the server' }, { status: 500 });
    }

    // Load Node.js crypto module dynamically
    const crypto = await import('crypto');
    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    
    // Sort parameters alphabetically to sign: public_id, timestamp
    const signatureStr = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp);
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json({ success: true, result: result.result });
    } else {
      console.error('Cloudinary destroy failed:', result);
      return NextResponse.json({ error: result.error?.message || 'Failed to delete asset from Cloudinary' }, { status: 500 });
    }

  } catch (err: any) {
    console.error('Error in Cloudinary destroy route:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
