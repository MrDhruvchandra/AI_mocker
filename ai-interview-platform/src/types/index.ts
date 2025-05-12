export interface InterviewFormData {
  topic: string;
  experience: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'technical' | 'behavioral' | 'problem-solving';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface InterviewState {
  currentQuestion: number;
  questions: InterviewQuestion[];
  answers: Record<string, string>;
  isComplete: boolean;
} 