// Replaced during the Medusa port — the real HTTP layer now lives in
// `@lib/medusa` (the Medusa JS SDK) and is invoked via `CoreApi` in
// `core-api.ts`. Any remaining direct callers of this module receive benign
// empty responses so components don't throw.

type EmptyResponse = { data: any; status: number; statusText: string };

const ok = (data: any = {}): Promise<EmptyResponse> =>
  Promise.resolve({ data, status: 200, statusText: "OK" });

const request = {
  get: (_url: string, _config?: any) => ok({ data: [] }),
  post: (_url: string, _body?: any, _config?: any) => ok({}),
  put: (_url: string, _body?: any, _config?: any) => ok({}),
  patch: (_url: string, _body?: any, _config?: any) => ok({}),
  delete: (_url: string, _config?: any) => ok({}),
  interceptors: {
    request: { use: (_ok: any, _err?: any) => {} },
    response: { use: (_ok: any, _err?: any) => {} },
  },
};

export default request;
