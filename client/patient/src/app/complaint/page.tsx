"use client";

import { motion } from 'framer-motion';
import { LargeTouchButton } from '../../components/LargeTouchButton';
import { useRouter } from 'next/navigation';

export default function ComplaintScreen() {
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full justify-center items-center gap-12"
    >
      <h1 className="text-5xl font-bold">Chief Complaint</h1>
      <p className="text-2xl text-slate-600">Select what is bothering you today.</p>
      <LargeTouchButton onClick={() => router.push('/interview')} className="w-96">
        Continue
      </LargeTouchButton>
    </motion.div>
  );
}
