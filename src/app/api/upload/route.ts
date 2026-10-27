import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseClient';

async function getActiveBucket(client: any): Promise<string> {
  try {
    const { data: buckets } = await client.storage.listBuckets();
    if (buckets?.some((b: any) => b.name === 'bike-images')) return 'bike-images';
    if (buckets?.some((b: any) => b.name === 'bikes')) return 'bikes';
    await client.storage.createBucket('bike-images', {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    });
    return 'bike-images';
  } catch (err) {
    console.warn('Bucket detect warning:', err);
    return 'bike-images';
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const client = supabaseAdmin || supabase;

    // 1. SUPABASE STORAGE UPLOAD (PRIMARY)
    if (isSupabaseConfigured && client) {
      const bucketName = await getActiveBucket(client);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const buffer = Buffer.from(await file.arrayBuffer());
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `bike_${Date.now()}_${i}_${cleanName}`;
        const contentType = file.type || 'image/jpeg';

        const { data, error } = await client.storage
          .from(bucketName)
          .upload(fileName, buffer, {
            contentType,
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = client.storage
            .from(bucketName)
            .getPublicUrl(fileName);

          if (publicUrlData?.publicUrl) {
            uploadedUrls.push(publicUrlData.publicUrl);
            continue;
          }
        } else {
          console.warn('Supabase image upload failed for file, falling back to local:', error);
        }

        // Local fallback if single file upload fails
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);
        uploadedUrls.push(`/uploads/${fileName}`);
      }

      return NextResponse.json({ urls: uploadedUrls, provider: 'supabase' });
    }

    // 2. LOCAL DISK FALLBACK (DEV / OFFLINE)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `bike_${Date.now()}_${i}_${cleanName}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);
      uploadedUrls.push(`/uploads/${fileName}`);
    }

    return NextResponse.json({ urls: uploadedUrls, provider: 'local' });
  } catch (err: any) {
    console.error('File upload route error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
