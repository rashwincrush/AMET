import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


const REQUIRED_COLUMNS = {
  'two_factor_enabled': {
    type: 'boolean',
    default: false,
    nullable: false
  },
  'two_factor_secret': {
    type: 'text',
    nullable: true
  },
  'mentor_topics': {
    type: 'text',
    nullable: true
  }
};

export async function GET() {
  try {
    // First, check if the columns exist
    const { data: profileColumns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public');

    if (columnsError) {
      console.error('Error getting table columns:', columnsError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to check table columns' 
      }, { status: 500 });
    }

    // Get existing column names
    const existingColumns = profileColumns?.map(col => col.column_name) || [];
    const missingColumns = Object.keys(REQUIRED_COLUMNS).filter(col => !existingColumns.includes(col));

    if (missingColumns.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'All required columns already exist' 
      });
    }

    // Add missing columns
    for (const column of missingColumns) {
      const columnConfig = REQUIRED_COLUMNS[column];
      
      // Use raw SQL through Supabase's RPC
      const { error: alterError } = await supabase
        .rpc('execute_sql', {
          query: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${column} ${columnConfig.type}${columnConfig.nullable ? '' : ' NOT NULL'}${columnConfig.default ? ` DEFAULT ${columnConfig.default}` : ''}`
        });

      if (alterError) {
        console.error(`Error adding column ${column}:`, alterError);
        return NextResponse.json({ 
          success: false, 
          error: `Failed to add column ${column}` 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully added missing columns' 
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Migration failed' 
    }, { status: 500 });
  }
}
