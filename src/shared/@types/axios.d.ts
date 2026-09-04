// `export {}` força este arquivo a ser tratado como módulo (não como script
// global) — sem isso, o `declare module 'axios'` abaixo passa a ser lido
// como a declaração completa e exclusiva do módulo (substitui os tipos reais
// do pacote em vez de só aumentá-los com `skipAuth`/`_retry`).
export {};

declare module 'axios' {
  // D e P só existem aqui para casar com a assinatura genérica original de
  // `AxiosRequestConfig` (module augmentation exige os mesmos parâmetros);
  // nenhum dos dois é usado nos campos adicionados abaixo.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface AxiosRequestConfig<D = any, P = any> {
    /** Não injeta o header `Authorization` nesta requisição (rotas públicas: signin, refresh, etc). */
    skipAuth?: boolean;
    /** Uso interno do `ApiService`: marca que a requisição já foi reexecutada uma vez após renovar o token. */
    _retry?: boolean;
  }
}
