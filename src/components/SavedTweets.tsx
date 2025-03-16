import React, { useEffect, useState } from 'react';
import { SavedTweet, deleteSavedTweet, updateTweet } from '../api/supabase';

interface SavedTweetsProps {
  isOpen: boolean;
  onClose: () => void;
  refreshTrigger?: number;
  tweets: SavedTweet[];
  setTweets: React.Dispatch<React.SetStateAction<SavedTweet[]>>;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const SavedTweets: React.FC<SavedTweetsProps> = ({ 
  isOpen, 
  onClose, 
  refreshTrigger = 0,
  tweets,
  setTweets,
  isLoading = false,
  onRefresh
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [editingTweetId, setEditingTweetId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Log when tweets change
  useEffect(() => {
    console.log('SavedTweets component received updated tweets:', tweets);
  }, [tweets]);

  // Force re-render when tweets change
  useEffect(() => {
    // This is just to ensure the component re-renders when tweets change
    console.log('Tweets updated, forcing re-render');
  }, [tweets.length]);

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteSavedTweet(id);
      if (success) {
        // Update the tweets list immediately
        setTweets(prevTweets => prevTweets.filter(tweet => tweet.id !== id));
      }
    } catch (error) {
      console.error('Error deleting tweet:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTweet = (content: string) => {
    const encodedTweet = encodeURIComponent(content);
    window.open(`https://twitter.com/intent/tweet?text=${encodedTweet}`, '_blank');
  };

  const handleEdit = (tweet: SavedTweet) => {
    setEditingTweetId(tweet.id!);
    setEditedContent(tweet.content);
  };

  const handleCancelEdit = () => {
    setEditingTweetId(null);
    setEditedContent('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!id || !editedContent.trim()) return;
    
    setIsUpdating(true);
    try {
      // Assuming you have an updateTweet function in your API
      const updatedTweet = await updateTweet(id, editedContent);
      if (updatedTweet) {
        // Update the tweets list immediately
        setTweets(prevTweets => 
          prevTweets.map(tweet => 
            tweet.id === id ? { ...tweet, content: editedContent } : tweet
          )
        );
        setEditingTweetId(null);
        setEditedContent('');
      }
    } catch (error) {
      console.error('Error updating tweet:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="h-full w-full bg-white shadow-lg flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold pl-2">Saved Tweets</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading saved tweets...</p>
          </div>
        ) : tweets.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p>No saved tweets yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tweets.map((tweet) => (
              <div key={tweet.id} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                {editingTweetId === tweet.id ? (
                  <div className="mb-3">
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md transition-colors"
                        disabled={isUpdating}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(tweet.id!)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors flex items-center"
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-800 mb-3">{tweet.content}</p>
                )}
                
                {!editingTweetId && (
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(tweet.id!)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-colors flex items-center"
                        disabled={isDeleting}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                      <button
                        onClick={() => handleEdit(tweet)}
                        className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    </div>
                    <button
                      onClick={() => handleTweet(tweet.content)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                      </svg>
                      Tweet
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedTweets; 