
import Image from 'next/image';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import { FormattedCustomersTable } from '@/app/lib/definitions';
import DeleteCustomerButton from '@/app/ui/customers/delete-button';

export default function CustomersTable({
  customers,
}: {
  customers: FormattedCustomersTable[];
}) {
  return (
    <div className="w-full">
      {/* Page heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className={`${lusitana.className} text-2xl font-bold`}>
            Customers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your customers and track their invoices.
          </p>
        </div>

        <Link
          href="/dashboard/customers/create"
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          <span className="text-lg">+</span>
          Add Customer
        </Link>
      </div>

      {/* Customer summary */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-500">Total customers</p>
        <p className="mt-2 text-3xl font-semibold">
          {customers.length}
        </p>
      </div>

      {/* Search */}
      <Search placeholder="Search customers by name or email..." />

      {/* Customer table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            All Customers
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            A list of your registered customers and their invoice activity.
          </p>
        </div>

        {/* Mobile layout */}
        <div className="divide-y divide-gray-200 md:hidden">
          {customers.map((customer) => (
            <div key={customer.id} className="p-5">
              <div className="flex items-center gap-3">
                <Image
  src={customer.image_url}
  className="rounded-full object-cover"
  alt={`${customer.name}'s profile picture`}
  width={44}
  height={44}
  unoptimized
/>

                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">
                    {customer.name}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {customer.email}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total invoices</p>
                  <p className="mt-1 font-medium">
                    {customer.total_invoices}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Total paid</p>
                  <p className="mt-1 font-medium text-green-600">
                    {customer.total_paid}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="mt-1 font-medium text-orange-500">
                    {customer.total_pending}
                  </p>
                </div>
              </div>

              {/* Mobile actions */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/dashboard/invoices?query=${encodeURIComponent(customer.name)}`}
                  className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View invoices →
                </Link>

                <DeleteCustomerButton
                  customerId={customer.id}
                  customerName={customer.name}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop layout */}
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Invoices</th>
                <th className="px-6 py-4 font-semibold">Total paid</th>
                <th className="px-6 py-4 font-semibold">Pending</th>
                <th className="px-6 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-5">
                    <div className="flex items-center gap-3">
                      <Image
  src={customer.image_url}
  className="rounded-full object-cover"
  alt={`${customer.name}'s profile picture`}
  width={40}
  height={40}
  unoptimized
/>

                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.name}
                        </p>
                        <p className="mt-1 text-gray-500">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-6 py-5">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {customer.total_invoices} invoices
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-6 py-5 font-medium text-green-600">
                    {customer.total_paid}
                  </td>

                  <td className="whitespace-nowrap px-6 py-5 font-medium text-orange-500">
                    {customer.total_pending}
                  </td>

                  {/* Desktop actions */}
                  <td className="whitespace-nowrap px-6 py-5">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/invoices?query=${encodeURIComponent(customer.name)}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        View invoices →
                      </Link>

                      <DeleteCustomerButton
                        customerId={customer.id}
                        customerName={customer.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {customers.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-gray-900">
              No customers found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Try another search or add a new customer.
            </p>

            <Link
              href="/dashboard/customers/create"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              + Add Customer
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
