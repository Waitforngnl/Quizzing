export interface MediaData {
  url: string;
  type: 'image' | 'video' | 'audio';
  caption?: string; 
}

export interface BaseQuestionData {
  media?: MediaData;
  explanation?: string;
}

interface ChoiceData extends BaseQuestionData {
  options: string[];
  correctIndex: number;
}

interface MatchingPair { left: string; right: string; }
interface MatchingData extends BaseQuestionData {
  pairs: MatchingPair[];
}

interface TextData extends BaseQuestionData {
  correctAnswers: string[];
  caseSensitive?: boolean;
}

export type QuestionData = ChoiceData | MatchingData | TextData | any;

export interface QuestionRow {
  id: number;
  quiz_id: number;
  content: string;
  type: string;
  data: QuestionData;
  created_at: Date;
  updated_at: Date;
}