import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

interface JWTPayload {
  userId: string
  email: string
}

function verifyAuth(request: NextRequest): JWTPayload {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Not authenticated')
  }

  const token = authHeader.substring(7)

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret'
    return jwt.verify(token, secret) as JWTPayload
  } catch {
    throw new Error('Invalid token')
  }
}

export async function POST(request: NextRequest) {
  try {
    verifyAuth(request)

    const dropboxToken = process.env.DROPBOX_ACCESS_TOKEN
    if (!dropboxToken) {
      return NextResponse.json(
        { error: 'Dropbox access token not configured' },
        { status: 500 }
      )
    }

    const body = await request.json().catch(() => null) as {
      filename?: string
      content?: string
    } | null

    if (!body || typeof body.content !== 'string' || !body.content.trim()) {
      return NextResponse.json(
        { error: 'Backup content is required' },
        { status: 400 }
      )
    }

    const filename = body.filename?.trim() || 'mantra-tracker-backup'
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const dropboxPath = `/mantra-tracker/${filename}-${timestamp}.json`

    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${dropboxToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: dropboxPath,
          mode: 'add',
          autorename: true,
          mute: false,
          strict_conflict: false
        })
      },
      body: Buffer.from(body.content, 'utf-8')
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Dropbox upload failed:', errorText)
      return NextResponse.json(
        { error: 'Dropbox upload failed', details: errorText },
        { status: response.status }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      message: 'Backup uploaded to Dropbox',
      path: dropboxPath,
      result
    })
  } catch (error) {
    console.error('Dropbox sync error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('authenticated') || message.includes('Invalid token') ? 401 : 500

    return NextResponse.json({ error: message }, { status })
  }
}
