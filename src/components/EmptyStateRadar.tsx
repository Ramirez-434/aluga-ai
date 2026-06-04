'use client';

import { motion } from 'framer-motion';
import { Ghost, Crosshair, Map } from 'lucide-react';

export default function EmptyStateRadar() {
  const triggerRadar = () => {
    window.dispatchEvent(new CustomEvent('trigger-radar'));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center h-full"
    >
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center shadow-inner">
          <Map size={40} className="text-indigo-300 dark:text-indigo-700 absolute" />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="z-10"
          >
            <Ghost size={48} className="text-indigo-500 drop-shadow-lg" />
          </motion.div>
        </div>
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 border-2 border-indigo-400 rounded-full"
        />
      </div>

      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
        Nenhum imóvel encontrado
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
        Não achamos o imóvel exato agora... Mas o Aluga AI nunca dorme. Ative o radar e seja o primeiro a saber quando ele aparecer.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={triggerRadar}
        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50"
      >
        <Crosshair size={18} />
        Ativar Radar Pessoal
      </motion.button>
    </motion.div>
  );
}
