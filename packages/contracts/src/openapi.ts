import { z } from 'zod';
import { extendZodWithOpenApi, OpenAPIGenerator } from '@asteasolutions/zod-to-openapi';
import fs from 'fs';
import path from 'path';
import {
  RegisterAnon,
  LoginUsername,
  RecoverBySecretWord,
  RegisterRegular,
  LoginRegular,
  Refresh,
  Logout,
  ConversationCreate,
  MessageCreate,
  FeedbackCreate
} from './index';

extendZodWithOpenApi(z);

const generator = new OpenAPIGenerator(
  [
    ['RegisterAnon', RegisterAnon],
    ['LoginUsername', LoginUsername],
    ['RecoverBySecretWord', RecoverBySecretWord],
    ['RegisterRegular', RegisterRegular],
    ['LoginRegular', LoginRegular],
    ['Refresh', Refresh],
    ['Logout', Logout],
    ['ConversationCreate', ConversationCreate],
    ['MessageCreate', MessageCreate],
    ['FeedbackCreate', FeedbackCreate]
  ],
  '3.0.0'
);

const document = generator.generateDocument({
  openapi: '3.0.0',
  info: { title: 'Aidvokat API', version: '0.1.0' }
});

fs.writeFileSync(
  path.resolve(__dirname, '..', 'openapi.json'),
  JSON.stringify(document, null, 2)
);
