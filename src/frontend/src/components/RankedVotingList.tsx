import { useState } from 'react';
import { Presentation } from '../api/presentationApi';

export interface RankedVotingListItem {
  presentation: Presentation;
  notes: string;
}

interface RankedVotingListProps {
  items: RankedVotingListItem[];
  onChange: (items: RankedVotingListItem[]) => void;
  disabled?: boolean;
}

export default function RankedVotingList({ items, onChange, disabled = false }: RankedVotingListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const moveUp = (index: number) => {
    if (index === 0 || disabled) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1 || disabled) return;
    const next = [...items];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    onChange(next);
  };

  const handleNotesChange = (index: number, notes: string) => {
    if (disabled) return;
    onChange(items.map((item, i) => (i === index ? { ...item, notes } : item)));
  };

  const handleDragStart = (index: number) => {
    if (disabled) return;
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (disabled) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || disabled) return;
    const next = [...items];
    const [removed] = next.splice(dragIndex, 1);
    next.splice(index, 0, removed);
    onChange(next);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        const isDragging = dragIndex === index;
        const isDropTarget = dragOverIndex === index && dragIndex !== index;

        return (
          <li
            key={item.presentation.id}
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragOver={e => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={[
              'bg-gray-900 border rounded-xl p-4 transition-all',
              isDragging ? 'opacity-40 border-gray-600' : 'border-gray-700',
              isDropTarget ? 'border-indigo-500 ring-1 ring-indigo-500' : '',
            ].join(' ')}
          >
            <div className="flex items-start gap-3">
              {/* Drag handle */}
              <span
                className="text-gray-500 cursor-grab text-xl leading-none pt-0.5 select-none"
                aria-hidden="true"
              >
                ⠿
              </span>

              {/* Rank badge */}
              <span className="shrink-0 bg-indigo-700 text-white font-bold text-sm rounded-full w-7 h-7 flex items-center justify-center">
                {index + 1}
              </span>

              {/* Presentation info + notes */}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-100">{item.presentation.title}</h2>
                <p className="text-sm text-indigo-300 mt-0.5">{item.presentation.presenterName}</p>
                {item.presentation.description && (
                  <p className="text-sm text-gray-400 mt-1">{item.presentation.description}</p>
                )}
                <textarea
                  value={item.notes}
                  onChange={e => handleNotesChange(index, e.target.value)}
                  placeholder="Add notes or feedback..."
                  maxLength={500}
                  disabled={disabled}
                  rows={2}
                  aria-label={`Notes for ${item.presentation.title}`}
                  className="mt-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 text-sm p-2 w-full resize-y disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Arrow buttons */}
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0 || disabled}
                  aria-label={`Move ${item.presentation.title} up`}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === items.length - 1 || disabled}
                  aria-label={`Move ${item.presentation.title} down`}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ↓
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
