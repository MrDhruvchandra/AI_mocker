// const API_ENDPOINT = 'https://my-app.dhruvmaorya298.workers.dev/chat';

// export interface AIResponse {
//   response: string;
// }

// export const generateQuestions = async (formData: {
//   topic: string;
//   experience: string;
//   duration: number;
//   difficulty: string;
// }): Promise<string[]> => {
//   const prompt = `Generate 5 interview questions for a ${formData.difficulty} level candidate with ${formData.experience} experience in ${formData.topic}. 
//   The interview should last ${formData.duration} minutes. 
//   Include a mix of technical, behavioral, and problem-solving questions.
//   Return the questions as a JSON array of strings.`;

//   try {
//     const response = await fetch(API_ENDPOINT, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ prompt }),
//     });

//     const data: AIResponse = await response.json();
//     return JSON.parse(data.response);
//   } catch (error) {
//     console.error('Error generating questions:', error);
//     throw error;
//   }
// };

// export const evaluateAnswer = async (question: string, answer: string): Promise<string> => {
//   const prompt = `Evaluate this answer for the following interview question:
  
//   Question: ${question}
//   Answer: ${answer}
  
//   Provide constructive feedback on:
//   1. Technical accuracy
//   2. Clarity and structure
//   3. Areas for improvement
//   4. Overall assessment
  
//   Keep the feedback professional and helpful.`;

//   try {
//     const response = await fetch(API_ENDPOINT, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ prompt }),
//     });

//     const data: AIResponse = await response.json();
//     return data.response;
//   } catch (error) {
//     console.error('Error evaluating answer:', error);
//     throw error;
//   }
// }; 

const API_ENDPOINT = 'http://127.0.0.1:8000'; // Change this to your FastAPI backend URL

export interface AIResponse {
  questions?: string[];  // For question generation
  evaluation?: string;   // For answer evaluation
}

export const generateQuestions = async (formData: {
  topic: string;
  experience: string;
  duration: number;
  difficulty: string;
}): Promise<string[]> => {
  const prompt = `Generate 5 interview questions for a ${formData.difficulty} level candidate with ${formData.experience} experience in ${formData.topic}. 
  The interview should last ${formData.duration} minutes. 
  Include a mix of technical, behavioral, and problem-solving questions.
  Return the questions as a JSON array of strings.`;

  try {
    const response = await fetch(`${API_ENDPOINT}/generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData), // Send the whole formData, which will be parsed by backend
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: AIResponse = await response.json();
    if (data.questions) {
      return data.questions;  // The response will be the list of questions
    }

    throw new Error('Invalid response from API');
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};

export const evaluateAnswer = async (question: string, answer: string): Promise<string> => {
  const prompt = `Evaluate this answer for the following interview question:

Question: ${question}
Answer: ${answer}

Provide constructive feedback on:

1. Technical accuracy
2. Clarity and structure
3. Areas for improvement
4. Overall assessment

Keep the feedback professional and helpful.`;

  try {
    const response = await fetch(`${API_ENDPOINT}/evaluate-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, answer }), // Send question and answer to the backend
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: AIResponse = await response.json();
    if (data.evaluation) {
      return data.evaluation;  // The response will be the evaluation feedback
    }

    throw new Error('Invalid response from API');
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw error;
  }
};
