/**
 * API TOWN — 案内所（チュートリアル用の練習API）
 */
window.AT = window.AT || {};

AT.companies.annaijo = {
  id: "annaijo",
  name: "API TOWN 案内所",
  emoji: "🏢",
  tagline: "新人研修と練習用APIの窓口",
  baseUrl: "https://api.guide.example",
  character: { name: "案内係 アイ", emoji: "👩‍💼" },
  docs: [
    {
      method: "GET",
      path: "/welcome",
      summary: "あいさつメッセージを取得する",
      desc: "API TOWN からのあいさつを返す、練習用のエンドポイントです。はじめてのリクエストにどうぞ。",
      params: [],
      example: {
        message: "ようこそ、API TOWNへ！",
        town: "API TOWN",
        weather: "快晴",
      },
    },
    {
      method: "GET",
      path: "/town",
      summary: "街の情報を取得する",
      desc: "API TOWN の基本情報を返します。ドキュメントを読んで注文する練習にどうぞ。",
      params: [],
      example: {
        name: "API TOWN",
        population: 2026,
        weather: "快晴",
        todays_news: "……",
      },
    },
    {
      method: "GET",
      path: "/teapot",
      summary: "？？？",
      desc: "案内所の隅に置かれた、あやしいティーポット。",
      params: [],
      example: { message: "……？" },
    },
  ],
};

AT.server.register("annaijo", "GET", "/welcome", () => ({
  status: 200,
  body: {
    message: "ようこそ、API TOWNへ！ あなたの最初のリクエストは大成功です 🎉",
    town: "API TOWN",
    weather: "快晴",
  },
}));

AT.server.register("annaijo", "GET", "/town", () => ({
  status: 200,
  body: {
    name: "API TOWN",
    population: 2026,
    weather: "快晴",
    mayor: "GET市長",
    todays_news: "ハトポスト便、迷子の荷物を無事お届け",
  },
}));

// 隠し要素: 418 I'm a teapot
AT.server.register("annaijo", "GET", "/teapot", () => ({
  status: 418,
  body: {
    error: "im_a_teapot",
    message: "わたしはティーポットなので、コーヒーは淹れられません。（おめでとう！超レアなステータスコードを発見しました）",
  },
}));
