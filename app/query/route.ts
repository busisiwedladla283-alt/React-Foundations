import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!);

export async function GET() {
  const data = await sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `;

  return Response.json(data);
}

