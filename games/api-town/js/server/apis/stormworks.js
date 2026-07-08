/**
 * API TOWN — 開発会社「Stormworks」の API 定義
 * 学習テーマ: 5xx エラー・リトライ・障害の切り分け（4xx=こちら / 5xx=あちら）
 */
window.AT = window.AT || {};

AT.stormState = { reportAttempts: 0 };

AT.companies.stormworks = {
  id: "stormworks",
  name: "Stormworks",
  emoji: "🌩️",
  tagline: "障害対応で鍛えられた開発会社",
  baseUrl: "https://api.stormworks.example",
  character: { name: "CTO アラシ", emoji: "⚡" },
  docs: [
    {
      method: "GET",
      path: "/status",
      summary: "サービスの稼働状況を取得する",
      desc: "システムの健康状態を返す監視用エンドポイント。障害対応の第一歩は「まず現状を確認する」ことです。",
      params: [],
      example: { service: "Storm API", status: "degraded", message: "一部機能が不安定です" },
    },
    {
      method: "GET",
      path: "/reports",
      summary: "レポート一覧を取得する（現在不安定）",
      desc: "月次レポートを返します。ただいま障害調査中のため、失敗することがあります。5xx が返っても、あなたのリクエストは間違っていません。少し待ってリトライしてみてください。",
      params: [],
      example: { count: 2, reports: [{ id: "RPT-1", title: "月次アクセスレポート" }] },
    },
    {
      method: "GET",
      path: "/old-address",
      summary: "旧本社の窓口（移転済み）",
      desc: "昔の窓口。会社が移転したため、いまは新しい場所への案内だけを返します。",
      params: [],
      example: { message: "……" },
    },
  ],
};

AT.server.register("stormworks", "GET", "/status", () => ({
  status: 200,
  body: {
    service: "Storm API",
    status: "degraded",
    uptime: "99.2%",
    message: "一部レポート機能が不安定です（調査中）。詳細は /reports をお試しください。",
  },
}));

AT.server.register("stormworks", "GET", "/reports", () => {
  AT.stormState.reportAttempts++;
  // 500 → 503 → 200 を繰り返す「不安定なAPI」。
  // 周期式にしておくことで、余分に送ってもクエスト（500/503/200体験）が必ず成立する
  const n = ((AT.stormState.reportAttempts - 1) % 3) + 1;
  if (n === 1) {
    return {
      status: 500,
      body: {
        error: "internal_server_error",
        message:
          "サーバー内部でエラーが発生しました。あなたのリクエストは正しいです（500はサーバー側の問題）。少し待って、もう一度送って（リトライして）みてください。",
      },
    };
  }
  if (n === 2) {
    return {
      status: 503,
      headers: { "retry-after": "3" },
      body: {
        error: "service_unavailable",
        message: "復旧作業中です（503）。Retry-After の秒数だけ待ってから、もう一度お試しください。",
      },
    };
  }
  return {
    status: 200,
    body: {
      message: "復旧しました！ リトライ成功です。あきらめずに再試行した、あなたの勝ちです。（※このAPIはデモ用に、しばらくするとまた不安定になります）",
      count: 2,
      reports: [
        { id: "RPT-1", title: "月次アクセスレポート", status: "ready" },
        { id: "RPT-2", title: "障害ふりかえりレポート", status: "ready" },
      ],
    },
  };
});

// 隠し要素: 301 Moved Permanently（図鑑コンプ用）
AT.server.register("stormworks", "GET", "/old-address", () => ({
  status: 301,
  headers: { location: "https://api.stormworks.example/status" },
  body: {
    message: "この窓口は引っ越しました。新しい場所はレスポンスヘッダーの location を見てください（301 Moved Permanently）。",
  },
}));
