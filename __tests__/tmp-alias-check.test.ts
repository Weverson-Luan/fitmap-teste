/**
 * Verificação temporária dos aliases de import (@config, @libs, @common,
 * @data) — cobre resolução no TypeScript (tsc), no Jest (moduleNameMapper) e
 * no Babel (babel-plugin-module-resolver, mesmo transform usado pelo Metro).
 * Arquivo removido após a checagem.
 */
import { API_BASE_URL } from '@config/env';
import { queryClient } from '@libs/react-query/query-client';
import { GENDER_CODES } from '@common/constants/gender';
import type { HttpErrorCode } from '@data/http/http-error';

test('aliases de import resolvem em runtime e em tipos', () => {
  expect(typeof API_BASE_URL).toBe('string');
  expect(queryClient).toBeDefined();
  expect(GENDER_CODES).toContain('MASCULINO');

  const code: HttpErrorCode = 'network';
  expect(code).toBe('network');
});
