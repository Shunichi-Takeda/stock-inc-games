/**
 * API TOWN — 銀行「API BANK」の API 定義
 * 学習テーマ: 認証（APIキー / Bearerトークン）・401 / 403
 */
window.AT = window.AT || {};

AT.apibank = {
  API_KEY: "demo-key-2026",
  TOKEN: "tkn-777-owl",
};

AT.companies.apibank = {
  id: "apibank",
  name: "API BANK",
  emoji: "🏦",
  tagline: "セキュリティに厳しい、街いちばんの銀行",
  baseUrl: "https://api.apibank.example",
  character: { name: "頭取 オース", emoji: "🦉" },
  docs: [
    {
      method: "GET",
      path: "/balance",
      summary: "残高を取得する",
      desc: "あなたの口座残高を返します。デモ用APIキー: demo-key-2026（実務では、お客様自身がサービスの管理画面からAPIキーを発行します）。",
      auth: "ヘッダー X-API-Key に APIキー が必要",
      params: [],
      example: { account: "あなた", balance: 123456, currency: "APIコイン" },
    },
    {
      method: "POST",
      path: "/login",
      summary: "アクセストークンを発行する",
      desc: "APIキーで本人確認を行い、期限付きのアクセストークン（当日入館証）を発行します。",
      auth: "ヘッダー X-API-Key に APIキー が必要",
      params: [],
      example: {
        access_token: "tkn-777-owl",
        token_type: "Bearer",
        expires_in: 3600,
      },
    },
    {
      method: "GET",
      path: "/transactions",
      summary: "入出金履歴を取得する",
      desc: "口座の入出金履歴を返します。トークンは「Bearer 」を頭につけて Authorization ヘッダーに設定します（例: Bearer tkn-777-owl）。",
      auth: "ヘッダー Authorization に Bearer トークン が必要",
      params: [],
      example: {
        count: 3,
        transactions: [
          { date: "2026-07-07", description: "給料（ハトポスト便）", amount: 650 },
        ],
      },
    },
    {
      method: "GET",
      path: "/admin/vault",
      summary: "金庫室の状況を取得する（管理者専用）",
      desc: "銀行の金庫室情報。管理者権限を持つトークンでのみアクセスできます。",
      auth: "Bearer トークン ＋ 管理者権限が必要",
      params: [],
      example: { error: "forbidden", message: "……" },
    },
  ],
};

/* ---------- 認証ミドルウェア ---------- */

function atBankRequireKey(headers) {
  if (headers["x-api-key"] !== AT.apibank.API_KEY) {
    return {
      status: 401,
      body: {
        error: "unauthorized",
        message:
          "APIキーが確認できません。「🔧 リクエストヘッダー」で 名前: X-API-Key、値: あなたのAPIキー（ドキュメント参照）を設定してください。",
      },
    };
  }
  return null;
}

function atBankRequireToken(headers) {
  const auth = headers["authorization"] || "";
  if (auth !== "Bearer " + AT.apibank.TOKEN) {
    return {
      status: 401,
      body: {
        error: "unauthorized",
        message:
          "トークンが確認できません。POST /login でトークンを発行し、ヘッダー Authorization に「Bearer あなたのトークン」の形式で設定してください（Bearer と トークンの間は半角スペース）。",
      },
    };
  }
  return null;
}

/* ---------- エンドポイント ---------- */

AT.server.register("apibank", "GET", "/balance", ({ headers }) => {
  const denied = atBankRequireKey(headers);
  if (denied) return denied;
  return {
    status: 200,
    body: { account: "あなた", balance: 123456, currency: "APIコイン" },
  };
});

AT.server.register("apibank", "POST", "/login", ({ headers }) => {
  const denied = atBankRequireKey(headers);
  if (denied) return denied;
  return {
    status: 200,
    body: {
      access_token: AT.apibank.TOKEN,
      token_type: "Bearer",
      expires_in: 3600,
      message: "ログイン成功！ このトークンを Authorization ヘッダーで使ってください。",
    },
  };
});

AT.server.register("apibank", "GET", "/transactions", ({ headers }) => {
  const denied = atBankRequireToken(headers);
  if (denied) return denied;
  return {
    status: 200,
    body: {
      count: 3,
      transactions: [
        { date: "2026-07-05", description: "給料（案内所 研修手当）", amount: 400 },
        { date: "2026-07-07", description: "給料（ハトポスト便）", amount: 650 },
        { date: "2026-07-08", description: "カフェ代", amount: -201 },
      ],
    },
  };
});

AT.server.register("apibank", "GET", "/admin/vault", ({ headers }) => {
  const denied = atBankRequireToken(headers);
  if (denied) return denied;
  return {
    status: 403,
    body: {
      error: "forbidden",
      message:
        "認証はできています（あなたが誰かは分かりました）。しかしこの操作には管理者権限が必要です。あなたの権限: 一般。これが 401 との違いです。",
    },
  };
});
