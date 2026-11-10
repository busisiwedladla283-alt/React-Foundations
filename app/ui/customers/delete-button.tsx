
'use client';

import { useActionState } from 'react';
import {
  deleteCustomer,
  DeleteCustomerState,
} from '@/app/lib/actions';

const initialState: DeleteCustomerState = {
  message: null,
  success: false,
};

export default function DeleteCustomerButton({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const [state, formAction, pending] = useActionState(
    deleteCustomer,
    initialState,
  );

  return (
    <div>
      <form
        action={formAction}
        onSubmit={(event) => {
          const confirmed = window.confirm(
            `Are you sure you want to delete ${customerName}?`,
          );

          if (!confirmed) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={customerId} />

        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Deleting...' : 'Delete'}
        </button>
      </form>

      {state.message && (
        <p
          aria-live="polite"
          className={`mt-2 max-w-52 text-xs ${
            state.success ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
