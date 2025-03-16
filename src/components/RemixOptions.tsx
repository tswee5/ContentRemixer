import React, { useState, useRef, useEffect } from 'react';

type RemixOption = {
  id: string;
  name: string;
  description: string;
};

type RemixOptionsProps = {
  selectedOption: string;
  onOptionChange: (optionId: string) => void;
};

const remixOptions: RemixOption[] = [
  {
    id: 'tweets',
    name: 'Generate Tweets',
    description: 'Create tweets from blog post content'
  },
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Create a concise summary of the text'
  },
  {
    id: 'simplify',
    name: 'Simplify',
    description: 'Make the text easier to understand'
  },
  {
    id: 'professional',
    name: 'Professional Tone',
    description: 'Convert to a professional business tone'
  },
  {
    id: 'casual',
    name: 'Casual Tone',
    description: 'Convert to a casual, friendly tone'
  },
  {
    id: 'email',
    name: 'Generate Email',
    description: 'Convert content into a professional email'
  },
  {
    id: 'blogPost',
    name: 'Generate Blog Post',
    description: 'Expand content into a structured blog post'
  },
  {
    id: 'socialMedia',
    name: 'Social Media Posts',
    description: 'Create posts for various social platforms'
  }
];

const RemixOptions: React.FC<RemixOptionsProps> = ({ selectedOption, onOptionChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find the currently selected option
  const currentOption = remixOptions.find(option => option.id === selectedOption) || remixOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionSelect = (optionId: string) => {
    onOptionChange(optionId);
    setIsOpen(false);
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Remix Options</h2>
      <div className="relative" ref={dropdownRef}>
        <button
          className="w-full p-3 bg-white border border-gray-300 rounded-md flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="pl-1">
            <div className="font-medium text-lg">{currentOption.name}</div>
            <div className="text-sm text-gray-600">{currentOption.description}</div>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
            {remixOptions.map((option) => (
              <div 
                key={option.id}
                className={`p-3 cursor-pointer hover:bg-gray-50 ${
                  selectedOption === option.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="font-medium text-lg">{option.name}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemixOptions; 