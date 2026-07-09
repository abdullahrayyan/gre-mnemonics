import { describe, expect, it } from 'vitest';
import { Difficulty, PartOfSpeech } from '../words/enums.js';
import { Word, type CreateWordInput } from '../words/word.entity.js';
import { QuizQuestionKind } from './enums.js';
import { generateQuizQuestions } from './quiz-generator.js';

let seq = 0;
function w(word: string, meaning: string, extra: Partial<CreateWordInput> = {}): Word {
  seq += 1;
  return Word.create(
    { word, meaning, difficulty: Difficulty.MEDIUM, partOfSpeech: PartOfSpeech.VERB, ...extra },
    { id: `w${seq}` },
  );
}

const rng = () => 0.42; // constant → deterministic shuffling

const WORDS = [
  w('bolster', 'to support', { synonyms: ['reinforce'], antonyms: ['undermine'] }),
  w('mitigate', 'to make less severe', { synonyms: ['alleviate'] }),
  w('candid', 'frank and honest', { synonyms: ['forthright'] }),
  w('venerate', 'to revere', { synonyms: ['esteem'] }),
];

describe('generateQuizQuestions', () => {
  it('builds word-to-meaning questions with the correct answer among the options', () => {
    const questions = generateQuizQuestions(WORDS, {
      types: [QuizQuestionKind.WORD_TO_MEANING],
      random: rng,
    });
    expect(questions).toHaveLength(4);
    for (const q of questions) {
      expect(q.type).toBe(QuizQuestionKind.WORD_TO_MEANING);
      expect(q.options).toContain(q.correctAnswer);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options.length).toBeLessThanOrEqual(4);
    }
  });

  it('honors the requested count', () => {
    const questions = generateQuizQuestions(WORDS, { count: 2, random: rng });
    expect(questions).toHaveLength(2);
  });

  it('makes synonym questions whose answer is a synonym', () => {
    const questions = generateQuizQuestions(WORDS, {
      types: [QuizQuestionKind.SYNONYM],
      random: rng,
    });
    const bolster = questions.find((q) => q.wordId === 'w1');
    expect(bolster?.type).toBe(QuizQuestionKind.SYNONYM);
    expect(bolster?.correctAnswer).toBe('reinforce');
    expect(bolster?.options).toContain('reinforce');
  });

  it('makes meaning-to-word questions answered by the word', () => {
    const [first] = generateQuizQuestions(WORDS, {
      types: [QuizQuestionKind.MEANING_TO_WORD],
      count: 1,
      random: rng,
    });
    expect(first?.type).toBe(QuizQuestionKind.MEANING_TO_WORD);
    expect(first?.correctAnswer).toBe('bolster');
  });

  it('is deterministic for a fixed RNG', () => {
    const a = generateQuizQuestions(WORDS, { random: () => 0.3 });
    const b = generateQuizQuestions(WORDS, { random: () => 0.3 });
    expect(a).toEqual(b);
  });
});
