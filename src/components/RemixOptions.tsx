import React from 'react';

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
  }
];

const RemixOptions: React.FC<RemixOptionsProps> = ({ selectedOption, onOptionChange }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Remix Options</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {remixOptions.map((option) => (
          <div 
            key={option.id}
            className={`p-3 border rounded-md cursor-pointer transition-colors ${
              selectedOption === option.id 
                ? 'bg-blue-100 border-blue-500' 
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onOptionChange(option.id)}
          >
            <div className="font-medium">{option.name}</div>
            <div className="text-sm text-gray-600">{option.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemixOptions; 