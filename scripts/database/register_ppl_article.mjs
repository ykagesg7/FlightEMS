/**
 * Register a PPL lesson article in Supabase learning_contents table.
 * Usage: node scripts/database/register_ppl_article.mjs [filename]
 * Example: node scripts/database/register_ppl_article.mjs PPL-1-1-9_FlightPerformance
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

let supabaseUrl, supabaseKey;
try {
  const envPath = path.join(projectRoot, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1]?.trim();
      else if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1]?.trim();
      else if (line.startsWith('VITE_SUPABASE_ANON_KEY=') && !supabaseKey) supabaseKey = line.split('=')[1]?.trim();
    });
  }
} catch (e) {
  console.error('Failed to read .env.local:', e.message);
}

supabaseUrl = supabaseUrl || process.env.VITE_SUPABASE_URL;
supabaseKey = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function extractMetaFromMDX(content) {
  const title = content.match(/title:\s*['"]([^'"]+)['"]/)?.[1];
  const excerpt = content.match(/excerpt:\s*['"]([^'"]+)['"]/)?.[1];
  const order = parseInt(content.match(/order:\s*(\d+)/)?.[1] || '0', 10);
  return { title, excerpt, order };
}

async function registerArticle(articleId) {
  const mdxPath = path.join(projectRoot, 'src', 'content', 'lessons', `${articleId}.mdx`);
  if (!fs.existsSync(mdxPath)) {
    console.error(`File not found: ${mdxPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(mdxPath, 'utf-8');
  const meta = extractMetaFromMDX(content);
  if (!meta?.title) {
    console.error('Could not extract meta from MDX');
    process.exit(1);
  }

  const record = {
    id: articleId,
    title: meta.title,
    category: 'PPL',
    sub_category: '航空工学',
    description: meta.excerpt || null,
    order_index: meta.order,
    parent_id: null,
    content_type: 'text',
    is_published: true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('learning_contents')
    .upsert(record, { onConflict: 'id', returning: 'representation' });

  if (error) {
    console.error('Upsert failed:', error);
    process.exit(1);
  }

  console.log(`Registered: ${articleId} - ${meta.title}`);
  return data;
}

const articleId = process.argv[2] || 'PPL-1-1-9_FlightPerformance';
registerArticle(articleId).then(() => {
  console.log('Done.');
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
