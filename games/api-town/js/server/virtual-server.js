/**
 * API TOWN — 仮想サーバー
 * ブラウザ内で HTTP のやりとりを忠実にシミュレートする。
 * fetch 互換の考え方（メソッド＋URL → ステータス＋ヘッダー＋ボディ）で作り、
 * 将来 Service Worker 実装に差し替えられるようにしておく。
 */
window.AT = window.AT || {};

AT.companies = {};

AT.server = (function () {
  // companyId -> [{ method, pattern, segments, handler }]
  const routes = {};

  function register(companyId, method, pattern, handler) {
    if (!routes[companyId]) routes[companyId] = [];
    routes[companyId].push({
      method: method.toUpperCase(),
      pattern,
      segments: pattern.split("/").filter(Boolean),
      handler,
    });
  }

  /** "/parcels?status=lost" → { path: "/parcels", query: {status:"lost"} } */
  function parseUrl(url) {
    const [rawPath, rawQuery = ""] = url.split("?");
    const path = rawPath.replace(/\/+$/, "") || "/";
    const query = {};
    for (const pair of rawQuery.split("&")) {
      if (!pair) continue;
      const [k, v = ""] = pair.split("=");
      query[decodeURIComponent(k)] = decodeURIComponent(v);
    }
    return { path, query };
  }

  /** ルートのセグメントとリクエストパスを突き合わせ、:param を抽出する */
  function matchRoute(route, path) {
    const segs = path.split("/").filter(Boolean);
    if (segs.length !== route.segments.length) return null;
    const params = {};
    for (let i = 0; i < segs.length; i++) {
      const rs = route.segments[i];
      if (rs.startsWith(":")) {
        params[rs.slice(1)] = segs[i];
      } else if (rs !== segs[i]) {
        return null;
      }
    }
    return params;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** ヘッダー名を小文字に正規化する（HTTPのヘッダー名は大文字小文字を区別しない） */
  function normalizeHeaders(headers) {
    const out = {};
    for (const [k, v] of Object.entries(headers || {})) {
      if (k.trim()) out[k.trim().toLowerCase()] = String(v).trim();
    }
    return out;
  }

  /**
   * ゲートウェイ企業: パスの先頭セグメントを会社IDにマップして転送する
   * （卒業制作: /hatopost/parcels → hatopost 社の /parcels）
   */
  const GATEWAYS = {
    graduation: {
      hatopost: "hatopost",
      cafe201: "cafe201",
      library: "library",
      apibank: "apibank",
      pecker: "pecker",
      stormworks: "stormworks",
    },
  };

  /**
   * リクエストを処理してレスポンスを返す
   * @param {object} [opts] { headers: {名前: 値}, body: 送信するJSONオブジェクト }
   * @returns {Promise<{status, statusText, headers, body, timeMs}>}
   */
  async function send(companyId, method, url, opts = {}) {
    // ゲートウェイ: レイテンシ二重取りを避けるため、転送は最初に解決する
    const gw = GATEWAYS[companyId];
    if (gw) {
      const m = url.match(/^\/([^/?]+)([^?]*)(\?.*)?$/);
      const target = m && gw[m[1]];
      if (target) {
        const restPath = (m[2] && m[2] !== "" ? m[2] : "/") + (m[3] || "");
        return send(target, method, restPath, opts);
      }
    }

    const started = performance.now();
    // 通信の実感を出すための擬似レイテンシ
    await delay(60 + Math.random() * 240);

    const { path, query } = parseUrl(url);
    const reqHeaders = normalizeHeaders(opts.headers);
    const list = routes[companyId] || [];
    let result = null;
    let pathExists = false;

    for (const route of list) {
      const params = matchRoute(route, path);
      if (params === null) continue;
      pathExists = true;
      if (route.method !== method.toUpperCase()) continue;
      result = route.handler({ params, query, headers: reqHeaders, body: opts.body, db: AT.db });
      break;
    }

    if (!result) {
      if (pathExists) {
        result = {
          status: 405,
          body: {
            error: "method_not_allowed",
            message: `このエンドポイントは ${method.toUpperCase()} には対応していません。ドキュメントで対応メソッドを確認しましょう。`,
          },
        };
      } else {
        result = {
          status: 404,
          body: {
            error: "not_found",
            message: `エンドポイント「${path}」は存在しません。ドキュメントでパス（URL）を確認しましょう。`,
          },
        };
      }
    }

    const timeMs = Math.round(performance.now() - started);
    return {
      status: result.status,
      statusText: AT.statusText[result.status] || "",
      headers: Object.assign(
        {
          "content-type": "application/json; charset=utf-8",
          "x-powered-by": "API TOWN VirtualServer/1.0",
          date: new Date().toUTCString(),
        },
        result.headers || {}
      ),
      body: result.body,
      timeMs,
    };
  }

  return { register, send, parseUrl };
})();
