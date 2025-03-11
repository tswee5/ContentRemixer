import { useState } from 'react'
import './App.css'
import RemixOptions from './components/RemixOptions'
import { remixContent, tweetsFromPost, emailFromContent, blogPostFromContent, socialMediaFromContent } from './api/claude'

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
  const [selectedOption, setSelectedOption] = useState('summarize')

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
    } catch (error) {
      console.error('Error remixing content:', error)
      // More detailed error message
      if (error instanceof Error) {
        setOutputText(`Error: ${error.message}. Please check the console for more details.`)
      } else {
        setOutputText('Error remixing content. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Content Remixer</h1>
        
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
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {remixDescriptions[selectedOption] || 'Output'}
          </h2>
          <div className="w-full min-h-40 p-3 border border-gray-300 rounded-md bg-gray-50 whitespace-pre-line">
            {outputText || 'Remixed content will appear here...'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 