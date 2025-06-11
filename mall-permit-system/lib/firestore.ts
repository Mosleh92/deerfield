import { db } from '@/firebase/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { Memo } from '@/types';

export const addMemo = async (memo: Memo) => {
  await addDoc(collection(db, 'memos'), memo);
};

export const getMemos = async () => {
  const q = query(collection(db, 'memos'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Memo[];
};
