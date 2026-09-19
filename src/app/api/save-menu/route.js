export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = process.env.BACKEND_URL || 'https://kanary-backend.onrender.com';

export async function GET() {
  // 1. Try fetching from Backend Server first
  try {
    const res = await fetch(`${BACKEND_URL}/api/menu`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.menuData) {
        return NextResponse.json({ success: true, menuData: data.menuData, source: 'backend' });
      }
    }
  } catch (err) {
    // Backend offline fallback
  }

  // 2. Fallback to local menuData.js
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'menuData.js');
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const start = fileContent.indexOf('{');
      const end = fileContent.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const jsonStr = fileContent.substring(start, end + 1);
        const menuData = JSON.parse(jsonStr);
        return NextResponse.json({ success: true, menuData, source: 'local' });
      }
    }
  } catch (err) {
    console.error('GET menu error:', err);
  }
  return NextResponse.json({ success: false, error: 'Could not read menu file' }, { status: 500 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { menuData } = body;
    if (!menuData) {
      return NextResponse.json({ success: false, error: 'No menuData provided' }, { status: 400 });
    }

    // 1. Send update to Backend Server
    let backendSaved = false;
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuData }),
      });
      if (backendRes.ok) {
        const resData = await backendRes.json();
        if (resData.success) {
          backendSaved = true;
        }
      }
    } catch (backendErr) {
      console.warn('Backend server offline during save, falling back to local file:', backendErr.message);
    }

    // 2. Also write locally to src/data/menuData.js
    const filePath = path.join(process.cwd(), 'src', 'data', 'menuData.js');
    const tempPath = path.join(process.cwd(), 'src', 'data', 'menuData.js.tmp');
    const content = 'export const menuData = ' + JSON.stringify(menuData, null, 2) + ';\n';
    
    try {
      fs.writeFileSync(tempPath, content, 'utf8');
      fs.renameSync(tempPath, filePath);
    } catch (fsError) {
      try {
        fs.writeFileSync(filePath, content, 'utf8');
      } catch (err2) {}
    }

    return NextResponse.json({ 
      success: true, 
      backendSaved, 
      message: backendSaved ? 'Saved to backend server & local file!' : 'Saved to local file!' 
    });
  } catch (error) {
    console.error('Error saving menuData:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
