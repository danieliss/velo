import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function seed() {
    console.log('🌱 Seeding database...');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('❌ Variáveis SUPABASE não definidas');
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
        },
        body: JSON.stringify([
            {
                order_number: `TEST-${Date.now()}`, // evita duplicação
                color: 'red',
                wheel_type: 'standard',
                customer_name: 'Teste CI',
                customer_email: 'teste@ci.com',
                customer_phone: '11999999999',
                customer_cpf: '12345678900',
                payment_method: 'credit_card',
                total_price: 100,
                status: 'pending'
            }
        ])
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao inserir dados: ${errorText}`);
    }

    console.log('✅ Seed finalizado');
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});