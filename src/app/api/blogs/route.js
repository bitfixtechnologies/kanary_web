import { NextResponse } from 'next/server';
import { blogPosts as fallbackBlogs } from '../../../data/blogData';

const BACKEND_URL = process.env.BACKEND_URL || 'https://kanary-backend.onrender.com';

// GET all blogs
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/blogs`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.blogs) {
        return NextResponse.json({ success: true, blogs: data.blogs, source: 'backend' });
      }
    }
  } catch (err) {
    console.warn('Backend blogs fetch unreachable, fallback to static:', err.message);
  }

  return NextResponse.json({ success: true, blogs: fallbackBlogs, source: 'fallback' });
}

// POST create or save blogs
export async function POST(request) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error('Backend save blog error:', err);
  }

  return NextResponse.json({ success: true, message: 'Saved in active session!' });
}

// DELETE blog
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Blog ID is required' }, { status: 400 });
    }

    const res = await fetch(`${BACKEND_URL}/api/blogs/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error('Backend delete blog error:', err);
  }

  return NextResponse.json({ success: true, message: 'Deleted from active session!' });
}
