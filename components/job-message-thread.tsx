import { sendJobMessageAction } from "@/lib/actions";
import { JOB_MESSAGE_LIMIT } from "@/lib/job-messages";
import { formatDateTime } from "@/lib/format";

type JobMessage = {
  id: string;
  body: string;
  createdAt: Date;
  sender: { id: string; name: string };
};

export function JobMessageThread({
  slug,
  caregiverId,
  counterpartName,
  messages,
  currentUserId,
  canSend,
  newIds,
  compact = false,
}: {
  slug: string;
  caregiverId: string;
  counterpartName: string;
  messages: JobMessage[];
  currentUserId: string;
  canSend: boolean;
  newIds?: Set<string>;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "mt-3" : "mt-4"}>
      <p className={compact ? "text-xs text-stone-500" : "text-sm text-stone-500"}>
        Only you and {counterpartName} can see this thread.
      </p>
      <ul className="mt-2 space-y-2">
        {messages.length === 0 ? (
          <li className="text-sm text-stone-500">No messages yet. Ask about hours, start time or what the sit needs.</li>
        ) : (
          messages.map((message) => (
            <li key={message.id} className="rounded-xl border border-line bg-card px-3 py-2">
              <p className="text-sm font-medium text-ink">
                {message.sender.id === currentUserId ? "You" : message.sender.name}
                {newIds?.has(message.id) ? (
                  <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-clay">
                    New
                  </span>
                ) : null}
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-stone-700">{message.body}</p>
              <p className="mt-1 text-xs text-stone-500">{formatDateTime(message.createdAt)}</p>
            </li>
          ))
        )}
      </ul>
      {canSend ? (
        <form action={sendJobMessageAction} className="mt-3 space-y-2">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="caregiverId" value={caregiverId} />
          <label className="block text-xs text-stone-500">
            Message {counterpartName.split(" ")[0]}
            <textarea
              name="body"
              required
              rows={compact ? 2 : 3}
              maxLength={JOB_MESSAGE_LIMIT}
              placeholder="Ask a question before you hire or apply."
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink"
            />
          </label>
          <button className="rounded-lg bg-teal px-3 py-1.5 text-sm font-medium text-white" type="submit">
            Send message
          </button>
        </form>
      ) : messages.length ? (
        <p className="mt-2 text-xs text-stone-500">Messaging is closed on this request. Use the escrow booking thread.</p>
      ) : null}
    </div>
  );
}
