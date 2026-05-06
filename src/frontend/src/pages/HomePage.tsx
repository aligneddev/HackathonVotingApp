import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div data-testid="engineering-motif" className="mb-8 opacity-70">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="60" cy="60" r="24" stroke="#6366f1" strokeWidth="3" />
          <circle cx="60" cy="60" r="10" fill="#6366f1" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <rect
              key={angle}
              x="56"
              y="28"
              width="8"
              height="14"
              rx="2"
              fill="#6366f1"
              transform={`rotate(${angle} 60 60)`}
            />
          ))}
          <line x1="10" y1="60" x2="32" y2="60" stroke="#818cf8" strokeWidth="2" />
          <line x1="88" y1="60" x2="110" y2="60" stroke="#818cf8" strokeWidth="2" />
          <line x1="60" y1="10" x2="60" y2="32" stroke="#818cf8" strokeWidth="2" />
          <line x1="60" y1="88" x2="60" y2="110" stroke="#818cf8" strokeWidth="2" />
          <circle cx="10" cy="60" r="3" fill="#818cf8" />
          <circle cx="110" cy="60" r="3" fill="#818cf8" />
          <circle cx="60" cy="10" r="3" fill="#818cf8" />
          <circle cx="60" cy="110" r="3" fill="#818cf8" />
        </svg>
      </div>

      <motion.h1
        className="text-4xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Hackathon Voting
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl text-gray-400 text-center max-w-md mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Engineering Innovation Awards
      </motion.p>

      <motion.p
        className="text-sm text-gray-500 text-center max-w-sm mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Vote for the top 3 presentations. Build something extraordinary.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Link
          to="/vote"
          className="px-8 py-4 rounded-xl text-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          Start Voting
        </Link>
      </motion.div>
    </div>
  );
}

