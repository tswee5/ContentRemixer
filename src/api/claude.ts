// Prompt for summarizing content
const summarizePrompt = `
You are a professional content summarizer.
Your task is to create a concise summary of the provided text while preserving the key points and main message.
Please keep the summary clear, accurate, and to the point.
`;

// Prompt for simplifying content
const simplifyPrompt = `
You are an expert at simplifying complex content.
Your task is to rewrite the provided text to make it easier to understand for a general audience.
Use simpler vocabulary, shorter sentences, and clear explanations while preserving the original meaning.
`;

// Prompt for professional tone conversion
const professionalPrompt = `
You are a business writing consultant.
Your task is to rewrite the provided text in a professional business tone.
The result should be clear, formal, and appropriate for a business context while preserving the original message.
`;

// Prompt for casual tone conversion
const casualPrompt = `
You are a conversational writing expert.
Your task is to rewrite the provided text in a casual, friendly tone.
The result should feel natural, approachable, and conversational while preserving the original message.
`;

// Prompt for tweet generation
const tweetPrompt = `
You are a social media expert and ghostwriter.
You work for a popular blogger, and your job is to take their blog post and come up with a variety of tweets to share ideas from the post.

Since you are a ghostwriter, you need to make sure to follow the style, tone, and voice of the blog post as closely as possible.

Remember: Tweets cannot be longer than 280 characters.

Please return the tweets in a list format, with each tweet on a new line.
IMPORTANT: Each tweet should be separated by the exact delimiter: "|||TWEET|||"
Do not use any hashtags or emojis.
`;

// Prompt for email generation
const emailPrompt = `
You are an email writing assistant.
Your task is to convert the provided content into a professional email format.
Include an appropriate subject line, greeting, body, and closing.
Maintain a professional tone while clearly communicating the key points from the original content.
`;

// Prompt for blog post generation
const blogPostPrompt = `
You are a professional blog writer.
Your task is to expand the provided content into a well-structured blog post.
Include an engaging introduction, well-organized body paragraphs with subheadings, and a conclusion.
The blog post should be informative, engaging, and maintain the key points from the original content.
`;

// Prompt for social media post generation
const socialMediaPrompt = `
You are a social media content creator.
Your task is to convert the provided content into engaging social media posts.
Create 3-5 different posts suitable for platforms like LinkedIn, Facebook, or Instagram.
Each post should be concise, engaging, and highlight different aspects of the original content.
`;

// Generic remixer function that handles all remix types
export async function remixContent(content: string, remixType: string): Promise<string> {
  try {
    // Select the appropriate prompt based on remix type
    let promptTemplate = "";
    
    switch (remixType) {
      case 'summarize':
        promptTemplate = summarizePrompt;
        break;
      case 'simplify':
        promptTemplate = simplifyPrompt;
        break;
      case 'professional':
        promptTemplate = professionalPrompt;
        break;
      case 'casual':
        promptTemplate = casualPrompt;
        break;
      case 'tweets':
        promptTemplate = tweetPrompt;
        break;
      case 'email':
        promptTemplate = emailPrompt;
        break;
      case 'blogPost':
        promptTemplate = blogPostPrompt;
        break;
      case 'socialMedia':
        promptTemplate = socialMediaPrompt;
        break;
      default:
        promptTemplate = "Please remix the following content:";
    }

    // Use our custom middleware endpoint
    const response = await fetch('/api/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ 
          role: "user", 
          content: `${promptTemplate}\n\nHere is the content:\n${content}` 
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Extract text content from the response
    const textContent = data.content && Array.isArray(data.content) 
      ? data.content.map((block: any) => block.type === 'text' ? block.text : '').join('')
      : 'Error: Unexpected response format';
    
    return textContent || 'Error: No response from API';
  } catch (error) {
    console.error('Error remixing content:', error);
    throw new Error('Failed to remix content');
  }
}

// Specialized function for generating tweets from a blog post
export async function tweetsFromPost(content: string): Promise<string> {
  try {
    // Use our custom middleware endpoint
    const response = await fetch('/api/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ 
          role: "user", 
          content: `${tweetPrompt}\n\nHere is the blog post:\n${content}` 
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Extract text content from the response
    const textContent = data.content && Array.isArray(data.content) 
      ? data.content.map((block: any) => block.type === 'text' ? block.text : '').join('')
      : 'Error: Unexpected response format';
    
    return textContent || 'Error: No response from API';
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to generate tweets');
  }
}

// Specialized function for generating an email from content
export async function emailFromContent(content: string): Promise<string> {
  try {
    // Use our custom middleware endpoint
    const response = await fetch('/api/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ 
          role: "user", 
          content: `${emailPrompt}\n\nHere is the content:\n${content}` 
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Extract text content from the response
    const textContent = data.content && Array.isArray(data.content) 
      ? data.content.map((block: any) => block.type === 'text' ? block.text : '').join('')
      : 'Error: Unexpected response format';
    
    return textContent || 'Error: No response from API';
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to generate email');
  }
}

// Specialized function for generating a blog post from content
export async function blogPostFromContent(content: string): Promise<string> {
  try {
    // Use our custom middleware endpoint
    const response = await fetch('/api/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2048, // Increased token limit for longer blog posts
        messages: [{ 
          role: "user", 
          content: `${blogPostPrompt}\n\nHere is the content:\n${content}` 
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Extract text content from the response
    const textContent = data.content && Array.isArray(data.content) 
      ? data.content.map((block: any) => block.type === 'text' ? block.text : '').join('')
      : 'Error: Unexpected response format';
    
    return textContent || 'Error: No response from API';
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to generate blog post');
  }
}

// Specialized function for generating social media posts from content
export async function socialMediaFromContent(content: string): Promise<string> {
  try {
    // Use our custom middleware endpoint
    const response = await fetch('/api/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ 
          role: "user", 
          content: `${socialMediaPrompt}\n\nHere is the content:\n${content}` 
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Extract text content from the response
    const textContent = data.content && Array.isArray(data.content) 
      ? data.content.map((block: any) => block.type === 'text' ? block.text : '').join('')
      : 'Error: Unexpected response format';
    
    return textContent || 'Error: No response from API';
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to generate social media posts');
  }
} 