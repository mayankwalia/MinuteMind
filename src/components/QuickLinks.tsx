import React from 'react';
import { QuickLink } from '../types/Task';
import { Plus, X } from 'lucide-react';

interface QuickLinksProps {
  links: QuickLink[];
  onAddLink: (link: QuickLink) => void;
  onRemoveLink: (linkId: string) => void;
}

export function QuickLinks({ links, onAddLink, onRemoveLink }: QuickLinksProps) {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newLink, setNewLink] = React.useState({ title: '', url: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLink.title && newLink.url) {
      onAddLink({
        id: crypto.randomUUID(),
        ...newLink,
      });
      setNewLink({ title: '', url: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Quick Links</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-2">
          <input
            type="text"
            placeholder="Link Title"
            value={newLink.title}
            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="url"
            placeholder="URL"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Link
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {link.title}
            <button
              onClick={(e) => {
                e.preventDefault();
                onRemoveLink(link.id);
              }}
              className="ml-1 p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </a>
        ))}
      </div>
    </div>
  );
}