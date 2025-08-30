import {describe,it,expect} from 'vitest';
import {RegisterAnon} from './index';

describe('RegisterAnon', () => {
  it('validates', () => {
    const data = {username: 'u', password: 'p', secret_word: 's'};
    expect(RegisterAnon.parse(data)).toEqual(data);
  });
});
