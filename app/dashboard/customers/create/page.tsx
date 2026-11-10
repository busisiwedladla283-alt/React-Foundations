
import { Metadata } from 'next';
import Link from 'next/link';
import CreateCustomerForm from '@/app/ui/customers/create-form';

export const metadata: Metadata = {
  title: 'Create Customer',
};

export default function Page() {
  return (
    <main className="w-full">
      <div className="mb-6">
        <Link
          href="/dashboard/customers"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to customers
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-semibold text-gray-900">
        Create Customer
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Add a new customer to your customer directory.
      </p>

      <CreateCustomerForm />
    </main>
  );
}
