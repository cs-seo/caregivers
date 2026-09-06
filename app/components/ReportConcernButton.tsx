'use client';

import { useRef, useState } from 'react';

const REASONS = [
  { value: 'safety', label: 'Safety concern' },
  { value: 'conduct', label: 'Inappropriate conduct' },
  { value: 'inaccurate-profile', label: 'Inaccurate profile / credentials' },
  { value: 'other', label: 'Other' },
] as const;

type Submission = 'idle' | 'submitting' | 'success' | 'error';

interface ReportConcernButtonProps {
  caregiverId: string;
  caregiverName: string;
}

export default function ReportConcernButton({
  caregiverId,
  caregiverName,
}: ReportConcernButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<Submission>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const open = () => {
    setState('idle');
    setErrorMessage(null);
    dialogRef.current?.showModal();
  };

  const close = () => {
    dialogRef.current?.close();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const reason = String(formData.get('reason') ?? '');
    const details = String(formData.get('details') ?? '');

    setState('submitting');
    setErrorMessage(null);
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId, reason, details }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? 'Unable to submit report');
      }
      setState('success');
      form.reset();
    } catch (error) {
      setState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to submit report',
      );
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800"
      >
        <span aria-hidden="true">⚑</span>
        Report a concern
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="report-title"
        className="m-auto w-full max-w-md rounded-lg bg-white p-0 backdrop:bg-black/50 dark:bg-zinc-900"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div>
            <h2
              id="report-title"
              className="text-lg font-semibold text-black dark:text-white"
            >
              Report a concern
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Flag a safety or quality issue about {caregiverName}. Our
              trust &amp; safety team reviews every report.
            </p>
          </div>

          {state === 'success' ? (
            <div
              role="status"
              className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200"
            >
              Thank you. Your report has been received and will be reviewed.
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="report-reason"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Reason
                </label>
                <select
                  id="report-reason"
                  name="reason"
                  required
                  defaultValue="safety"
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  {REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="report-details"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Details (optional)
                </label>
                <textarea
                  id="report-details"
                  name="details"
                  rows={4}
                  maxLength={2000}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="Describe what happened…"
                />
              </div>

              {state === 'error' && errorMessage && (
                <p
                  role="alert"
                  className="text-sm text-red-700 dark:text-red-300"
                >
                  {errorMessage}
                </p>
              )}
            </>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
            >
              {state === 'success' ? 'Close' : 'Cancel'}
            </button>
            {state !== 'success' && (
              <button
                type="submit"
                disabled={state === 'submitting'}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {state === 'submitting' ? 'Submitting…' : 'Submit report'}
              </button>
            )}
          </div>
        </form>
      </dialog>
    </>
  );
}
