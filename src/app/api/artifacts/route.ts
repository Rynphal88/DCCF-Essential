// src/app/api/artifacts/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, title, description } = body ?? {};

    if (!type || !title || !description) {
      return NextResponse.json(
        { error: 'type, title, and description are required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        '[API /artifacts] Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars.'
      );
      return NextResponse.json(
        { error: 'Server configuration error.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('artifacts')
      .insert({ type, title, description })
      .select('id')
      .single();

    if (error) {
      console.error('[API /artifacts] Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create artifact.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { id: data?.id },
      { status: 201 }
    );
  } catch (err) {
    console.error('[API /artifacts] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500 }
    );
  }
}
