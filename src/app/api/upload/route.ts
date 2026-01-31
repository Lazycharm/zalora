import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { supabaseAdmin } from '@/lib/supabase'

// Bucket name for Supabase Storage. Created automatically if missing.
const UPLOAD_BUCKET = 'uploads'

async function ensureUploadBucketExists() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets()
  const exists = buckets?.some((b) => b.name === UPLOAD_BUCKET)
  if (exists) return
  const { error } = await supabaseAdmin.storage.createBucket(UPLOAD_BUCKET, {
    public: true,
  })
  if (error) {
    console.error('Failed to create uploads bucket:', error)
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${originalName}`
    const storagePath = `${folder}/${filename}`

    // Prefer Supabase Storage (works on Netlify/serverless; filesystem is read-only there)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      let uploadData: { path: string } | null = null
      let uploadError: { message: string } | null = null

      const doUpload = () =>
        supabaseAdmin.storage
          .from(UPLOAD_BUCKET)
          .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: false,
          })

      const result = await doUpload()
      uploadData = result.data
      uploadError = result.error

      // If bucket missing, create it and retry once
      if (uploadError && (uploadError.message?.toLowerCase().includes('bucket') || uploadError.message?.toLowerCase().includes('not found'))) {
        await ensureUploadBucketExists()
        const retry = await doUpload()
        uploadData = retry.data
        uploadError = retry.error
      }

      if (uploadError || !uploadData) {
        console.error('Supabase storage upload error:', uploadError)
        return NextResponse.json(
          { error: uploadError?.message || 'Storage upload failed. Create an "uploads" bucket in Supabase Dashboard → Storage (public).' },
          { status: 500 }
        )
      }

      const { data: urlData } = supabaseAdmin.storage
        .from(UPLOAD_BUCKET)
        .getPublicUrl(uploadData.path)

      return NextResponse.json({
        success: true,
        url: urlData.publicUrl,
        filename,
      })
    }

    // Fallback: local filesystem (only works in dev; Netlify/serverless is read-only)
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)
    const url = `/uploads/${folder}/${filename}`

    return NextResponse.json({ success: true, url, filename })
  } catch (error: unknown) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
}
