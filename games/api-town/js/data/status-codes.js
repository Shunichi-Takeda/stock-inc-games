/**
 * API TOWN — ステータスコード図鑑データ
 * ゲーム中に一度でも受け取ったコードが図鑑に登録される
 */
window.AT = window.AT || {};

AT.statusCodes = [
  {
    code: 200, name: "OK", jp: "せいこう",
    desc: "ご注文どおり、うまくいきました！ 一番よく見る成功の返事。",
    scene: "データの取得や更新が成功したとき、ほぼ毎回これが返ってくる。",
  },
  {
    code: 201, name: "Created", jp: "つくったよ",
    desc: "新しいデータを作りました、という成功の返事。",
    scene: "POST で注文やアカウントを新規登録したときに返ってくる。",
  },
  {
    code: 204, name: "No Content", jp: "なかみは無いよ",
    desc: "成功したけど、返す中身は特にありません、という返事。",
    scene: "DELETE で削除に成功したときによく返ってくる。",
  },
  {
    code: 301, name: "Moved Permanently", jp: "ひっこしました",
    desc: "その窓口は別の場所に引っ越しました、という案内。",
    scene: "古いURLにアクセスすると、新しいURLへ案内される。",
  },
  {
    code: 400, name: "Bad Request", jp: "注文がへん",
    desc: "注文の書き方に問題があります。message を読んで直そう。",
    scene: "必須項目が抜けていたり、値の形式が間違っているとき。",
  },
  {
    code: 401, name: "Unauthorized", jp: "だれ？",
    desc: "あなたが誰だか確認できません。ログインや鍵（トークン）が必要。",
    scene: "認証が必要なAPIに、鍵を持たずにアクセスしたとき。",
  },
  {
    code: 402, name: "Payment Required", jp: "お支払いが必要",
    desc: "この操作にはお金（支払い）が必要です、という返事。",
    scene: "残高不足や未課金のとき。定義されたのに長く使われなかった珍しいコードで、近年は決済系APIで復活中。",
  },
  {
    code: 403, name: "Forbidden", jp: "権限がないよ",
    desc: "あなたが誰かは分かったけど、その操作をする権限がありません。",
    scene: "一般ユーザーが管理者専用のAPIを呼んだとき。",
  },
  {
    code: 404, name: "Not Found", jp: "見つからないよ",
    desc: "探したけど、そんなものはありませんでした。",
    scene: "URLの打ち間違いや、削除済みデータへのアクセスで頻出。",
  },
  {
    code: 405, name: "Method Not Allowed", jp: "その頼み方はダメ",
    desc: "その窓口は、そのメソッド（頼み方）に対応していません。",
    scene: "GET 専用の窓口に POST を送ってしまったときなど。",
  },
  {
    code: 418, name: "I'm a teapot", jp: "わたしはティーポット",
    desc: "「ティーポットなのでコーヒーは淹れられません」という伝説のジョーク返事。",
    scene: "エイプリルフールに生まれた公式ジョーク。見つけたあなたはラッキー！",
    secret: true,
  },
  {
    code: 429, name: "Too Many Requests", jp: "注文しすぎ！",
    desc: "短時間に注文を送りすぎです。少し待ってからもう一度。",
    scene: "レート制限。Retry-After ヘッダーに待ち時間が書いてあることも。",
  },
  {
    code: 500, name: "Internal Server Error", jp: "厨房で事故発生",
    desc: "あなたは悪くない。サーバー側（厨房）で問題が起きた。",
    scene: "サーバーのバグや障害。エンジニアが青ざめるやつ。",
  },
  {
    code: 503, name: "Service Unavailable", jp: "いま忙しいの",
    desc: "サーバーが混雑やメンテナンスで一時的に応答できない。",
    scene: "アクセス集中やメンテナンス中。時間をおいて再挑戦。",
  },
];

AT.statusText = {
  200: "OK", 201: "Created", 204: "No Content", 301: "Moved Permanently",
  400: "Bad Request", 401: "Unauthorized", 402: "Payment Required", 403: "Forbidden", 404: "Not Found",
  405: "Method Not Allowed", 418: "I'm a teapot", 429: "Too Many Requests",
  500: "Internal Server Error", 503: "Service Unavailable",
};
