import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ⚠️ use SERVICE ROLE (não anon)

async function seed() {
    console.log('🌱 Seeding database...');

    // Exemplo: inserir produto
    await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
        },
        body: JSON.stringify([
            {
                name: 'Produto Teste',
                price: 100
            }
        ])
    });

    console.log('✅ Seed finalizado');
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});