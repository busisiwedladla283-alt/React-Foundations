
'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createCustomer, CustomerState } from '@/app/lib/actions';

const initialState: CustomerState = {
  message: null,
  errors: {},
};

export default function CreateCustomerForm() {
  const [state, formAction, pending] = useActionState(
    createCustomer,
    initialState,
  );

  return (
    <form action={formAction} className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-5">
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Customer Name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter customer name"
          required
          maxLength={100}
          aria-describedby="name-error"
          className="block w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />

        <div id="name-error" aria-live="polite">
          {state.errors?.name?.map((error) => (
            <p key={error} className="mt-2 text-sm text-red-500">
              {error}
            </p>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter customer email"
          required
          maxLength={255}
          aria-describedby="email-error"
          className="block w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />

        <div id="email-error" aria-live="polite">
          {state.errors?.email?.map((error) => (
            <p key={error} className="mt-2 text-sm text-red-500">
              {error}
            </p>
          ))}
        </div>
      </div>

      {state.message && (
        <p aria-live="polite" className="mb-4 text-sm text-red-500">
          {state.message}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Link
          href="/dashboard/customers"
          className="rounded-md border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-teal-600 px-5 py-3 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Creating...' : 'Create Customer'}
        </button>
      </div>
    </form>
  );
}
