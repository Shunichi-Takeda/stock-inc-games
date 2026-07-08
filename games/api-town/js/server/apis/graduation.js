/**
 * API TOWN — 卒業制作「マイタウンアプリ」
 * 街のゲートウェイAPI経由で、これまでの全社のAPIを組み合わせる総合演習。
 * ルート定義は持たない（virtual-server.js の GATEWAYS が /会社名/... を各社へ転送する）。
 */
window.AT = window.AT || {};

AT.companies.graduation = {
  id: "graduation",
  name: "卒業制作スタジオ",
  emoji: "🎓",
  tagline: "総合演習: 街のAPIを組み合わせて「マイタウンアプリ」を作る",
  baseUrl: "https://gateway.apitown.example",
  character: { name: "GET市長", emoji: "🎩" },
  docs: [
    {
      method: "GET",
      path: "/hatopost/parcels",
      summary: "ハトポスト便のAPIへ転送（荷物一覧）",
      desc: "街のゲートウェイは「/会社名/パス」の形で各社のAPIへ転送します。パラメータや動きは各社のドキュメントと同じです（status での絞り込みも可能）。",
      params: [{ name: "status", kind: "query", required: false, desc: "delivered / in_transit / lost で絞り込み" }],
      example: { count: 1, parcels: ["…ハトポスト便と同じ返事…"] },
    },
    {
      method: "POST",
      path: "/cafe201/orders",
      summary: "Cafe 201 のAPIへ転送（注文作成）",
      desc: "ボディ（JSON）で item（必須）と quantity（任意）を指定します。メニューは /cafe201/menu で確認できます。",
      params: [
        { name: "item", kind: "arg", required: true, desc: "メニューID（例: blend）" },
        { name: "quantity", kind: "arg", required: false, desc: "個数（1以上の整数）" },
      ],
      example: { message: "ご注文ありがとうございます！", order: { id: "ORD-1002" } },
    },
    {
      method: "PATCH",
      path: "/library/books/{id}",
      summary: "メソッド図書館のAPIへ転送（蔵書更新）",
      desc: "返却は { \"status\": \"available\" }、貸出は { \"status\": \"borrowed\" } をボディに書きます。",
      params: [{ name: "id", kind: "path", required: true, desc: "蔵書ID（例: BK-003）" }],
      example: { message: "更新しました", book: { id: "BK-003", status: "available" } },
    },
    {
      method: "GET",
      path: "/apibank/balance",
      summary: "API BANK のAPIへ転送（残高照会）",
      desc: "認証もそのまま必要です。ヘッダー X-API-Key にAPIキー（API BANKのドキュメント参照）を設定してください。",
      auth: "ヘッダー X-API-Key に APIキー が必要",
      params: [],
      example: { account: "あなた", balance: 123456 },
    },
    {
      method: "GET",
      path: "/pecker/posts",
      summary: "Pecker社のAPIへ転送（投稿一覧）",
      desc: "limit / offset / sort がそのまま使えます。いいね順は sort=likes。",
      params: [
        { name: "limit", kind: "query", required: false, desc: "1〜10" },
        { name: "sort", kind: "query", required: false, desc: "likes（いいね順）" },
      ],
      example: { total: 25, posts: ["…Pecker社と同じ返事…"] },
    },
    {
      method: "GET",
      path: "/stormworks/status",
      summary: "Stormworks のAPIへ転送（稼働状況）",
      desc: "マイタウンアプリの「システム監視画面」用。各社の稼働状況を確認します。",
      params: [],
      example: { service: "Storm API", status: "degraded" },
    },
  ],
};
