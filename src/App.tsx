import { useState, useEffect, useCallback } from 'react'
import './App.css'
import RemixOptions from './components/RemixOptions'
import SavedTweets from './components/SavedTweets'
import { remixContent, tweetsFromPost, emailFromContent, blogPostFromContent, socialMediaFromContent } from './api/claude'
import { saveTweet, getSavedTweets, SavedTweet } from './api/supabase'

// Map of remix options to descriptions for the UI
const remixDescriptions: Record<string, string> = {
  summarize: "Summarized content:",
  simplify: "Simplified content:",
  professional: "Professional version:",
  casual: "Casual version:",
  tweets: "Generated tweets:",
  email: "Email version:",
  blogPost: "Blog post version:",
  socialMedia: "Social media posts:"
};

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState('tweets')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [savingTweetIndex, setSavingTweetIndex] = useState<number | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [savedTweets, setSavedTweets] = useState<SavedTweet[]>([])
  const [isLoadingTweets, setIsLoadingTweets] = useState(false)
  const [editingTweetIndex, setEditingTweetIndex] = useState<number | null>(null)
  const [editedTweetContent, setEditedTweetContent] = useState('')
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false)

  // Load saved tweets when component mounts
  const loadSavedTweets = useCallback(async () => {
    setIsLoadingTweets(true);
    try {
      const tweets = await getSavedTweets();
      setSavedTweets(tweets);
    } catch (error) {
      console.error('Error loading saved tweets:', error);
    } finally {
      setIsLoadingTweets(false);
    }
  }, []);

  // Load saved tweets on initial mount only
  useEffect(() => {
    loadSavedTweets();
  }, [loadSavedTweets]);

  // Separate effect for manual refresh trigger if needed
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadSavedTweets();
    }
  }, [refreshTrigger, loadSavedTweets]);

  const handleTweet = (tweet: string) => {
    // Encode the tweet text for URL
    const encodedTweet = encodeURIComponent(tweet);
    // Open Twitter with the pre-filled tweet
    window.open(`https://twitter.com/intent/tweet?text=${encodedTweet}`, '_blank');
  }

  const handleSaveTweet = async (tweet: string, index: number) => {
    setSavingTweetIndex(index);
    try {
      const savedTweet = await saveTweet(tweet);
      console.log('Tweet saved successfully:', savedTweet);
      
      if (savedTweet) {
        // Show a brief visual feedback
        setTimeout(() => {
          setSavingTweetIndex(null);
        }, 1000);
        
        // Directly load the latest tweets from the server
        await loadSavedTweets();
        
        // Also increment the refresh trigger to ensure the component re-renders
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error saving tweet:', error);
      setSavingTweetIndex(null);
    }
  }

  const handleEditTweet = (tweet: string, index: number) => {
    setEditingTweetIndex(index);
    setEditedTweetContent(tweet);
  };

  const handleCancelEdit = () => {
    setEditingTweetIndex(null);
    setEditedTweetContent('');
  };

  const handleSaveEdit = () => {
    if (editingTweetIndex === null || !editedTweetContent.trim()) return;
    
    // Get all tweets
    const tweets = outputText.split('|||TWEET|||').filter(tweet => tweet.trim());
    
    // Replace the edited tweet
    tweets[editingTweetIndex] = editedTweetContent;
    
    // Join them back together
    setOutputText(tweets.join('|||TWEET|||'));
    
    // Reset editing state
    setEditingTweetIndex(null);
    setEditedTweetContent('');
  };

  const handleRemix = async () => {
    if (!inputText.trim()) return
    
    setIsLoading(true)
    
    try {
      let result = '';
      
      // Use the appropriate specialized function based on the selected option
      switch (selectedOption) {
        case 'tweets':
          result = await tweetsFromPost(inputText);
          break;
        case 'email':
          result = await emailFromContent(inputText);
          break;
        case 'blogPost':
          result = await blogPostFromContent(inputText);
          break;
        case 'socialMedia':
          result = await socialMediaFromContent(inputText);
          break;
        default:
          // Use the generic remixer for other options
          result = await remixContent(inputText, selectedOption);
      }
      
      setOutputText(result || 'Error: No response from API')
      // Set hasGeneratedContent to true after successful generation
      setHasGeneratedContent(true)
    } catch (error) {
      console.error('Error remixing content:', error)
      // More detailed error message
      if (error instanceof Error) {
        setOutputText(`Error: ${error.message}. Please check the console for more details.`)
      } else {
        setOutputText('Error remixing content. Please try again.')
      }
      // Still set hasGeneratedContent to true even if there's an error message
      setHasGeneratedContent(true)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleRefreshTweets = () => {
    // Increment the refresh trigger to force a reload
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Main Content - with fixed width and centered */}
      <div className={`p-4 md:p-8 ${isSidebarOpen ? 'pr-96' : ''} transition-all duration-300`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Content Remixer</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Input</h2>
            <textarea
              className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your content here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
          
          <RemixOptions 
            selectedOption={selectedOption}
            onOptionChange={setSelectedOption}
          />
          
          <div className="flex justify-center mb-6">
            <button
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              onClick={handleRemix}
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? 'Remixing...' : 'Remix Content'}
            </button>
          </div>
          
          {/* Only show the output container when content has been generated */}
          {hasGeneratedContent && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 pl-4">
                {remixDescriptions[selectedOption] || 'Output'}
              </h2>
              {selectedOption === 'tweets' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {outputText.split('|||TWEET|||').filter(tweet => tweet.trim()).map((tweet, index) => {
                    const tweetText = tweet.trim();
                    const charCount = tweetText.length;
                    const isOverLimit = charCount > 280;
                    const isSaving = savingTweetIndex === index;
                    const isEditing = editingTweetIndex === index;
                    
                    return (
                      <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-64">
                        {isEditing ? (
                          <div className="flex-1 flex flex-col">
                            <textarea
                              className="w-full h-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 flex-1"
                              value={editedTweetContent}
                              onChange={(e) => setEditedTweetContent(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                              <span className={`text-sm ${editedTweetContent.length > 280 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                {editedTweetContent.length}/280
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveEdit}
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
                                  disabled={editedTweetContent.length > 280}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-800 overflow-y-auto mb-auto">{tweetText}</p>
                            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                              <span className={`text-sm ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                {charCount}/280
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditTweet(tweetText, index)}
                                  className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md transition-colors flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleSaveTweet(tweetText, index)}
                                  className={`px-3 py-1 ${isSaving ? 'bg-green-500' : 'bg-gray-500 hover:bg-gray-600'} text-white text-sm rounded-md transition-colors flex items-center`}
                                  disabled={isOverLimit || isSaving}
                                >
                                  {isSaving ? (
                                    <>
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Saved
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                      </svg>
                                      Save
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleTweet(tweetText)}
                                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors flex items-center"
                                  disabled={isOverLimit}
                                >
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                                  </svg>
                                  Tweet
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full min-h-40 p-3 border border-gray-300 rounded-md bg-gray-50 whitespace-pre-line">
                  {outputText || 'Remixed content will appear here...'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Sidebar for Saved Tweets - Only render when isSidebarOpen is true */}
      <div className={`fixed right-0 top-0 h-full z-10 transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-12'}`}>
        {/* Toggle sidebar button - positioned to the left of the sidebar */}
        <div className="absolute top-0 left-0 h-14 flex items-center z-20">
          <button
            onClick={toggleSidebar}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md transform -translate-x-14"
            aria-label={isSidebarOpen ? 'Hide Saved Tweets' : 'Show Saved Tweets'}
          >
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {isSidebarOpen && (
          <div className="h-full w-full overflow-hidden">
            <SavedTweets 
              key={`saved-tweets-${savedTweets.length}-${refreshTrigger}`}
              isOpen={true} 
              onClose={toggleSidebar}
              refreshTrigger={refreshTrigger}
              tweets={savedTweets}
              setTweets={setSavedTweets}
              isLoading={isLoadingTweets}
              onRefresh={handleRefreshTweets}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App 