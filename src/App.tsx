import React, { useState } from 'react'
import './App.css'
import RemixOptions from './components/RemixOptions'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState('summarize')

  const handleRemix = async () => {
    if (!inputText.trim()) return
    
    setIsLoading(true)
    
    try {
      // This is a placeholder for the actual API call
      // In a real app, you would replace this with your Claude API endpoint
      const response = await fetch('https://api.example.com/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: inputText,
          option: selectedOption 
        }),
      })
      
      const data = await response.json()
      setOutputText(data.remixedText || 'Error: No response from API')
    } catch (error) {
      console.error('Error remixing content:', error)
      setOutputText('Error remixing content. Please try again.')
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
          <h2 className="text-xl font-semibold mb-4">Output</h2>
          <div className="w-full min-h-40 p-3 border border-gray-300 rounded-md bg-gray-50">
            {outputText || 'Remixed content will appear here...'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 