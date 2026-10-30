
import bcrypt from 'bcrypt';
import postgres from 'postgres';
import {
  invoices,
  customers,
  revenue,
  users,
} from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedUsers(db: typeof sql) {
  await db`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `;

  await db`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await db`
      INSERT INTO users (id, name, email, password)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
      ON CONFLICT DO NOTHING;
    `;
  }
}

async function seedInvoices(db: typeof sql) {
  await db`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await db`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  for (const invoice of invoices) {
    await db`
      INSERT INTO invoices (customer_id, amount, status, date)
      SELECT
        ${invoice.customer_id},
        ${invoice.amount},
        ${invoice.status},
        ${invoice.date}
      WHERE NOT EXISTS (
        SELECT 1
        FROM invoices
        WHERE customer_id = ${invoice.customer_id}
          AND amount = ${invoice.amount}
          AND status = ${invoice.status}
          AND date = ${invoice.date}
      );
    `;
  }
}

async function seedCustomers(db: typeof sql) {
  await db`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await db`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  for (const customer of customers) {
    await db`
      INSERT INTO customers (id, name, email, image_url)
      VALUES (
        ${customer.id},
        ${customer.name},
        ${customer.email},
        ${customer.image_url}
      )
      ON CONFLICT DO NOTHING;
    `;
  }
}

async function seedRevenue(db: typeof sql) {
  await db`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  for (const rev of revenue) {
    await db`
      INSERT INTO revenue (month, revenue)
      VALUES (${rev.month}, ${rev.revenue})
      ON CONFLICT (month) DO NOTHING;
    `;
  }
}

export async function GET() {
  try {
    await sql.begin(async (tx) => {
      await seedUsers(tx);
      await seedCustomers(tx);
      await seedInvoices(tx);
      await seedRevenue(tx);
    });

    return Response.json({
      message: 'Database seeded successfully',
    });
  } catch (error) {
    console.error('Database seeding failed:', error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An unknown database error occurred',
      },
      { status: 500 },
    );
  }
}
