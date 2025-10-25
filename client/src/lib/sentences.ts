import { insertSentenceSchema, type Sentence } from '@shared/schema';

export interface SentenceData {
  id: string;
  sentenceText: string;
  idealPhoneme: string;
}

// Predefined sentences with their ideal phonemes
export const predefinedSentences: SentenceData[] = [
  {
    id: 'sentence-1',
    sentenceText: 'Kenny drank a tiny tin of coke',
    idealPhoneme: 'k ɛ n i d ɹ æ ŋ k ə t a j n i t ə n ʌ v k o w k'
  },
  {
    id: 'sentence-2', 
    sentenceText: 'Sean the sheep was on the ship',
    idealPhoneme: "'ʂ ɑ n ð ə ʃ i p w ɑ z ɑ n ð ə ʃ ɪ p'"
  },
  {
    id: 'sentence-3',
    sentenceText: 'Funny Sean was washing a dirty dish',
    idealPhoneme: 'ʌ n i ʂ æ n w ɑ z w ɑ ʃ ɪ ŋ ə d ɹ̩ ɾ i d ɪ ʃ'
  },
  {
    id: 'sentence-4',
    sentenceText: "Cheeky Charlie's watching a football match",
    idealPhoneme: 't͡ʃʲ i k iː t ɹ̩ ɹ l i ɛ z w ɑ t͡ʃʲ ɪ ŋ ə f ə b̥ ɑ l̪ m æ dʒ'
  },
  {
    id: 'sentence-5',
    sentenceText: 'My granny Maggie got a golden gown',
    idealPhoneme: "'m a j g ɹ æ n i m æ g iː g ɑ ɾ ə g o w l d ə n ɟ a w n'"
  }
];

class SentenceService {
  async getSentenceById(id: string): Promise<SentenceData | undefined> {
    return predefinedSentences.find(sentence => sentence.id === id);
  }

  async getAllSentences(): Promise<SentenceData[]> {
    return predefinedSentences;
  }

  async getSentenceByText(text: string): Promise<SentenceData | undefined> {
    return predefinedSentences.find(sentence => sentence.sentenceText === text);
  }
}

export const sentenceService = new SentenceService();
