-- Required extensions
CREATE SCHEMA IF NOT EXISTS extensions;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
WITH SCHEMA extensions;

CREATE EXTENSION IF NOT EXISTS pgcrypto
WITH SCHEMA extensions;

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL
);

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL,
    amount INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    date DATE NOT NULL
);

-- Revenue table
CREATE TABLE IF NOT EXISTS public.revenue (
    month VARCHAR(4) NOT NULL UNIQUE,
    revenue INT NOT NULL
);

-- Preserve the existing Row Level Security configuration
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue ENABLE ROW LEVEL SECURITY;
