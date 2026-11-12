
'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const sql = postgres(process.env.POSTGRES_URL!);

// State returned by the invoice actions
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

// Invoice validation schema
const FormSchema = z.object({
  id: z.string(),

  customerId: z
    .string()
    .min(1, { message: 'Please select a customer.' }),

  amount: z.coerce
    .number()
    .finite({ message: 'Please enter a valid amount.' })
    .gt(0, { message: 'Please enter an amount greater than $0.' })
    .refine(
      (amount) => Number.isSafeInteger(Math.round(amount * 100)),
      { message: 'The invoice amount is too large.' }
    ),

  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),

  date: z.string(),
});

// Schema for creating an invoice
const CreateInvoice = FormSchema.omit({
  id: true,
  date: true,
});

// Schema for updating an invoice
const UpdateInvoice = FormSchema.omit({
  id: true,
  date: true,
});

// Convert dollars to cents safely
function convertAmountToCents(amount: number): number | null {
  const amountInCents = Math.round(amount * 100);

  if (!Number.isSafeInteger(amountInCents)) {
    return null;
  }

  return amountInCents;
}

// Create a new invoice
export async function createInvoice(
  prevState: State,
  formData: FormData,
) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // Return errors if validation fails
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = convertAmountToCents(amount);

  if (amountInCents === null) {
    return {
      errors: {
        amount: ['The invoice amount is too large.'],
      },
      message: 'Invalid invoice amount.',
    };
  }

  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.error('Create Invoice Error:', error);

    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// Update an existing invoice
export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // Return errors if validation fails
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = convertAmountToCents(amount);

  if (amountInCents === null) {
    return {
      errors: {
        amount: ['The invoice amount is too large.'],
      },
      message: 'Invalid invoice amount.',
    };
  }

  try {
    await sql`
      UPDATE invoices
      SET
        customer_id = ${customerId},
        amount = ${amountInCents},
        status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Update Invoice Error:', error);

    return {
      message: 'Database Error: Failed to Update Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// Delete an invoice
export async function deleteInvoice(id: string) {
  await sql`
    DELETE FROM invoices
    WHERE id = ${id}
  `;

  revalidatePath('/dashboard/invoices');
}

// Authenticate user
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }

    throw error;
  }
}

// State returned by the customer actions
export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
  };
  message?: string | null;
};

// Customer validation schema
const CustomerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Please enter the customer name.' })
    .max(100, { message: 'Name must be 100 characters or fewer.' }),

  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address.' })
    .max(255, { message: 'Email must be 255 characters or fewer.' }),
});

// Create a new customer
export async function createCustomer(
  prevState: CustomerState,
  formData: FormData,
) {
  const validatedFields = CustomerFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please correct the errors below.',
    };
  }

  const { name, email } = validatedFields.data;

  // Neutral default avatar for newly created customers
  const imageUrl = '/customers/default-avatar.svg';

  try {
    await sql`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, ${imageUrl})
    `;
  } catch (error) {
    console.error('Create Customer Error:', error);

    return {
      message: 'Database Error: Failed to Create Customer.',
    };
  }

  // Refresh pages that display customer information
  revalidatePath('/dashboard/customers');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard/invoices/create');

  redirect('/dashboard/customers');
}

export type DeleteCustomerState = {
  message?: string | null;
  success?: boolean;
};

export async function deleteCustomer(
  prevState: DeleteCustomerState,
  formData: FormData,
): Promise<DeleteCustomerState> {
  const validatedId = z.string().uuid().safeParse(formData.get('id'));

  if (!validatedId.success) {
    return {
      message: 'Invalid customer ID.',
    };
  }

  const customerId = validatedId.data;

  try {
    // Delete only if the customer has no associated invoices.
    const deleted = await sql`
      DELETE FROM customers
      WHERE id = ${customerId}
        AND NOT EXISTS (
          SELECT 1
          FROM invoices
          WHERE invoices.customer_id = customers.id
        )
      RETURNING id
    `;

    if (deleted.length === 0) {
      const existingCustomer = await sql`
        SELECT id
        FROM customers
        WHERE id = ${customerId}
        LIMIT 1
      `;

      if (existingCustomer.length === 0) {
        return {
          message: 'Customer not found.',
        };
      }

      return {
        message:
          'This customer has invoices and cannot be deleted. Handle their invoices first.',
      };
    }

    revalidatePath('/dashboard/customers');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Customer deleted successfully.',
    };
  } catch (error) {
    console.error('Delete Customer Error:', error);

    return {
      message: 'Database Error: Failed to Delete Customer.',
    };
  }
}
