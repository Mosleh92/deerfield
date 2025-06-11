'use client';

import { useEffect, useState } from 'react';
import { getMemos, addMemo } from '@/lib/firestore';
import { Memo } from '@/types';
import { Button } from './ui/button';

const MemoBoard = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [text, setText] = useState('');

  const loadMemos = async () => {
    const data = await getMemos();
    setMemos(data);
  };

  const sendMemo = async () => {
    if (!text) return;
    await addMemo({
      message: text,
      from: 'operations',
      to: 'all',
      createdAt: new Date().toISOString(),
    });
    setText('');
    loadMemos();
  };

  useEffect(() => {
    loadMemos();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow space-y-4">
      <h2 className="font-bold text-xl">Memo Board</h2>

      <div className="space-y-2">
        {memos.map((memo, i) => (
          <div key={i} className="bg-gray-100 p-2 rounded">
            <p>{memo.message}</p>
            <span className="text-sm text-gray-500">{memo.createdAt.slice(0, 16)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="border p-2 flex-1 rounded"
          placeholder="Write a memo..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <Button onClick={sendMemo}>Send</Button>
      </div>
    </div>
  );
};

export default MemoBoard;
