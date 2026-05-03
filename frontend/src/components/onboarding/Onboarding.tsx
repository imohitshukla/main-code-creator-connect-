import React, { useState } from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: 'easeOut' 
    },
  },
};

export default function Onboarding() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission logic
    console.log('Submitted:', email);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-zinc-950 overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        className="relative z-10 w-full max-w-md p-8 mx-4 bg-zinc-900/60 backdrop-blur-xl border border-fuchsia-500/20 rounded-2xl shadow-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Icon/Logo Placeholder */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center border border-fuchsia-500/30 shadow-[0_0_15px_rgba(192,38,211,0.15)]">
            <svg 
              className="w-7 h-7 text-fuchsia-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1 
          variants={itemVariants}
          className="text-3xl font-semibold text-center text-zinc-50 mb-3 tracking-tight"
        >
          Welcome to the Platform
        </motion.h1>

        {/* Subtext */}
        <motion.p 
          variants={itemVariants}
          className="text-zinc-400 text-center mb-8 text-sm leading-relaxed"
        >
          Enter your details to get started and experience the future of seamless digital connectivity.
        </motion.p>

        {/* Form Elements */}
        <motion.form 
          variants={itemVariants} 
          className="space-y-5"
          onSubmit={handleSubmit}
        >
          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-zinc-950/50 border border-fuchsia-500/20 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 transition-all duration-200"
              required
            />
          </motion.div>

          <motion.button
            variants={itemVariants}
            type="submit"
            className="w-full py-3 px-4 mt-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-medium rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(192,38,211,0.25)] hover:shadow-[0_0_25px_rgba(192,38,211,0.4)] active:scale-[0.98]"
          >
            Continue
          </motion.button>
        </motion.form>
        
        {/* Footer Text */}
        <motion.p 
          variants={itemVariants}
          className="text-center text-xs text-zinc-500 mt-6"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </motion.p>
      </motion.div>
    </div>
  );
}
