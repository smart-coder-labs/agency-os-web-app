'use client';

import { useState } from 'react';
import { deleteTaskById } from '@/app/(admin)/tasks/_actions/task-actions';

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const [confirming, setConfirming] = useState(false);
  const action = deleteTaskById.bind(null, taskId);

  if (confirming) {
    return (
      <form action={action} className="flex items-center gap-2">
        <span className="text-sm text-red-600">Delete this task?</span>
        <button type="submit" className="text-sm text-red-600 font-semibold underline">
          Yes, delete
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-sm text-gray-500"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-red-500 hover:text-red-700"
    >
      Delete task
    </button>
  );
}
