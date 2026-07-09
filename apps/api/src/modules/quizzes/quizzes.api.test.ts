import { Difficulty, PartOfSpeech, User, Word, WordStatus } from '@mnemonic/core';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { createContainer } from '../../container/container.js';
import { StubAuthVerifier } from '../auth/stub-auth-verifier.js';
import {
  InMemoryProfileRepository,
  InMemoryUserRepository,
} from '../users/infrastructure/in-memory-repositories.js';
import { InMemoryWordRepository } from '../words/infrastructure/in-memory-word.repository.js';
import { InMemoryQuizStore } from './infrastructure/in-memory-quiz.store.js';

const USER = 'Bearer user-token';

const SAMPLE: [string, string, string][] = [
  ['bolster', 'to support', 'reinforce'],
  ['mitigate', 'to make less severe', 'alleviate'],
  ['candid', 'frank and honest', 'forthright'],
];

async function buildApp(wordCount = SAMPLE.length) {
  const words = new InMemoryWordRepository();
  for (let i = 0; i < wordCount; i += 1) {
    const [word, meaning, synonym] = SAMPLE[i]!;
    await words.create(
      Word.create(
        {
          word,
          meaning,
          synonyms: [synonym],
          difficulty: Difficulty.MEDIUM,
          partOfSpeech: PartOfSpeech.VERB,
          status: WordStatus.PUBLISHED,
        },
        { id: `w${i}` },
      ),
    );
  }

  const users = new InMemoryUserRepository();
  await users.create(
    User.create({ clerkId: 'clerk_user', email: 'user@example.com' }, { id: 'u_user' }),
  );

  const container = createContainer({
    wordRepository: words,
    userRepository: users,
    profileRepository: new InMemoryProfileRepository(),
    authVerifier: new StubAuthVerifier({ 'user-token': { clerkUserId: 'clerk_user' } }),
    quizStore: new InMemoryQuizStore(),
    redis: null,
    mnemonicEngine: null,
  });
  return createApp({ container });
}

describe('Quiz API', () => {
  it('401 without auth', async () => {
    const app = await buildApp();
    expect(
      (await request(app).post('/api/v1/quizzes').send({ type: 'WORD_TO_MEANING' })).status,
    ).toBe(401);
  });

  it('starts a quiz without leaking answers', async () => {
    const app = await buildApp();
    const res = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', USER)
      .send({ type: 'WORD_TO_MEANING', count: 2 });

    expect(res.status).toBe(201);
    expect(res.body.data.totalQuestions).toBe(2);
    expect(res.body.data.questions).toHaveLength(2);
    const question = res.body.data.questions[0];
    expect(question.attemptId).toBeTruthy();
    expect(Array.isArray(question.options)).toBe(true);
    expect(question).not.toHaveProperty('correctAnswer');
  });

  it('grades answers and completes the quiz on the last one', async () => {
    const app = await buildApp();
    const start = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', USER)
      .send({ type: 'WORD_TO_MEANING', count: 2 });
    const { quizId, questions } = start.body.data;

    const first = await request(app)
      .post(`/api/v1/quizzes/${quizId}/answers`)
      .set('Authorization', USER)
      .send({ attemptId: questions[0].attemptId, userAnswer: questions[0].options[0] });
    expect(first.status).toBe(200);
    expect(typeof first.body.data.isCorrect).toBe('boolean');
    expect(first.body.data.correctAnswer).toBeTruthy();
    expect(first.body.data.completed).toBe(false);

    const second = await request(app)
      .post(`/api/v1/quizzes/${quizId}/answers`)
      .set('Authorization', USER)
      .send({ attemptId: questions[1].attemptId, userAnswer: questions[1].options[0] });
    expect(second.body.data.completed).toBe(true);
    expect(second.body.data.summary.totalQuestions).toBe(2);
    expect(second.body.data.summary.scorePercent).toBeGreaterThanOrEqual(0);
  });

  it('422 when there are not enough words', async () => {
    const app = await buildApp(1);
    const res = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', USER)
      .send({ type: 'WORD_TO_MEANING' });
    expect(res.status).toBe(422);
  });
});
