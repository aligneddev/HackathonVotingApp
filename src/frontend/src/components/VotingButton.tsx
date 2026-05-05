import { useState } from 'react';
import { votingApi } from '../api/votingApi';

interface VotingButtonProps {
  presentationId: string;
}

export default function VotingButton({ presentationId }: VotingButtonProps) {
  const storageKey = `voted-${presentationId}`;
  const [voted, setVoted] = useState(() => !!localStorage.getItem(storageKey));

  const handleVote = async () => {
    try {
      await votingApi.castVote(presentationId);
      localStorage.setItem(storageKey, 'true');
      setVoted(true);
    } catch {
      // silently fail for now — future: show error state
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={voted}
      className={voted
        ? 'bg-gray-600 text-gray-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed'
        : 'bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors'
      }
    >
      {voted ? 'Voted!' : 'Vote'}
    </button>
  );
}
