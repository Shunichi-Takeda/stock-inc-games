/**
 * API TOWN — SNS「Pecker社」の API 定義
 * 学習テーマ: ページネーション（limit / offset）・ソート・レート制限の復習
 */
window.AT = window.AT || {};

AT.peckerState = { trendCalls: [] };

AT.companies.pecker = {
  id: "pecker",
  name: "Pecker社",
  emoji: "🐦",
  tagline: "街いちばんのSNS。投稿データは膨大",
  baseUrl: "https://api.pecker.example",
  character: { name: "分析部長 ペック", emoji: "🐦" },
  docs: [
    {
      method: "GET",
      path: "/posts",
      summary: "投稿の一覧を取得する（ページネーション対応）",
      desc: "投稿データは大量にあるため、一度に全部は返しません。limit（1ページの件数、最大10）と offset（何件目から取るか）でページをめくります。next_offset が null になったら最後のページです。",
      params: [
        { name: "limit", kind: "query", required: false, desc: "1回で取得する件数（1〜10、省略時は5）" },
        { name: "offset", kind: "query", required: false, desc: "何件目から取得するか（省略時は0＝先頭から）" },
        { name: "sort", kind: "query", required: false, desc: "likes を指定すると、いいねが多い順に並ぶ" },
      ],
      example: {
        total: 25,
        limit: 5,
        offset: 0,
        next_offset: 5,
        posts: [{ id: 1, user: "mina_chan", text: "…", likes: 40 }],
      },
    },
    {
      method: "GET",
      path: "/trends",
      summary: "トレンドを取得する（レート制限あり）",
      desc: "いま話題のハッシュタグを返します。負荷が高いAPIのため、10秒間に3回までの利用制限があります（超えると 429）。",
      params: [],
      example: { trends: ["#APITOWN", "#ブロッコリー"] },
    },
  ],
};

AT.server.register("pecker", "GET", "/posts", ({ query, db }) => {
  let limit = 5;
  if (query.limit !== undefined) {
    limit = Number(query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 10) {
      return {
        status: 400,
        body: { error: "invalid_limit", message: "limit は 1〜10 の整数で指定してください。一度に全部は渡せません（サーバーを守るためです）。" },
      };
    }
  }
  let offset = 0;
  if (query.offset !== undefined) {
    offset = Number(query.offset);
    if (!Number.isInteger(offset) || offset < 0) {
      return { status: 400, body: { error: "invalid_offset", message: "offset は 0 以上の整数で指定してください。" } };
    }
  }
  let list = db.posts.slice();
  if (query.sort !== undefined) {
    if (query.sort !== "likes") {
      return { status: 400, body: { error: "invalid_sort", message: "sort に指定できるのは likes だけです。" } };
    }
    list.sort((a, b) => b.likes - a.likes);
  }
  const page = list.slice(offset, offset + limit);
  const nextOffset = offset + limit < list.length ? offset + limit : null;
  return {
    status: 200,
    body: { total: list.length, limit, offset, next_offset: nextOffset, posts: page },
  };
});

AT.server.register("pecker", "GET", "/trends", () => {
  const now = Date.now();
  const st = AT.peckerState;
  st.trendCalls = st.trendCalls.filter((t) => now - t < 10000);
  st.trendCalls.push(now);
  if (st.trendCalls.length > 3) {
    return {
      status: 429,
      headers: { "retry-after": "10" },
      body: {
        error: "too_many_requests",
        message: "トレンドAPIは10秒間に3回までです。Retry-After のぶんだけ待ってから再試行してください（ガーディアンで学んだレート制限ですね）。",
      },
    };
  }
  return {
    status: 200,
    body: { trends: ["#APITOWN", "#ブロッコリー", "#迷子のぬいぐるみ感動", "#Cafe201の新作"] },
  };
});
