'use client';

import type { CommentDto } from '@mnemonic/types';

function CommentNode({ comment, depth }: { comment: CommentDto; depth: number }) {
  return (
    <div className={depth > 0 ? 'ml-4 border-l border-slate-200 pl-3 dark:border-white/10' : ''}>
      <div className="py-2">
        <p className="text-sm">
          <span className="font-medium">{comment.authorName}</span>{' '}
          <span className="text-slate-600 dark:text-slate-300">{comment.content}</span>
        </p>
        {comment.replies.map((reply) => (
          <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
}

/** Renders a threaded comment list. */
export function CommentThread({ comments }: { comments: CommentDto[] }) {
  if (comments.length === 0) {
    return <p className="py-2 text-sm text-slate-400">No comments yet — start the thread.</p>;
  }
  return (
    <div className="divide-y divide-slate-100 dark:divide-white/5">
      {comments.map((comment) => (
        <CommentNode key={comment.id} comment={comment} depth={0} />
      ))}
    </div>
  );
}
