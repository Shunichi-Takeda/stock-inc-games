/**
 * API TOWN — 仮想データベース
 * ゲーム内世界のデータ。M1 では読み取り専用のため永続化はしない。
 * （POST/DELETE を導入する M2 で localStorage への差分保存を追加する）
 */
window.AT = window.AT || {};

AT.db = {
  /* Cafe 201: プレイヤーの注文が POST で追加されていく */
  orders: [],

  /* メソッド図書館の蔵書 */
  books: [
    {
      id: "BK-001",
      title: "はじめてのAPI",
      author: "案内係 アイ",
      status: "available",
      borrower: null,
      location: "3F 技術書コーナー",
    },
    {
      id: "BK-002",
      title: "ステータス・コードの謎",
      author: "ミステリー作家X",
      status: "borrowed",
      borrower: "ハトリ部長",
      location: "貸出中",
    },
    {
      id: "BK-003",
      title: "RESTってなんだ",
      author: "司書 シオリ",
      status: "available",
      borrower: null,
      location: "3F 技術書コーナー",
    },
    {
      id: "BK-004",
      title: "古い電話帳（1985年版）",
      author: "-",
      status: "available",
      borrower: null,
      location: "地下書庫（廃棄予定）",
    },
  ],

  /* Pecker社の投稿（25件、決定的に生成） */
  posts: (function () {
    const users = ["mina_chan", "hatori_bucho", "cafe201_master", "broccoli_fan", "ai_guide"];
    const texts = [
      "今日もAPI TOWNは平和です",
      "ブレンドコーヒーうますぎる @Cafe201",
      "荷物の追跡ってAPIでできるんだ",
      "図書館で『RESTってなんだ』借りた",
      "残高照会が一瞬で終わった。API BANKすごい",
      "エラー404と友達になった",
      "ブロッコリー畑なう",
      "レート制限に引っかかった…反省",
      "JSONって伝票みたいなものらしい",
      "天気APIによると明日は快晴",
    ];
    const posts = [];
    for (let i = 1; i <= 25; i++) {
      posts.push({
        id: i,
        user: users[i % users.length],
        text: i === 17 ? "ハトポスト便さん、迷子の誕生日プレゼントを届けてくれて本当にありがとう！！" : texts[i % texts.length],
        likes: i === 17 ? 999 : ((i * 37) % 300) + 3,
        posted_at: `2026-07-${String((i % 7) + 1).padStart(2, "0")}`,
      });
    }
    return posts;
  })(),

  parcels: [
    {
      id: "HP-1001",
      item: "ブロッコリー 1箱",
      status: "delivered",
      from: "モリモリ農園",
      to: "Cafe 201",
      location: "配達完了",
      updated_at: "2026-07-07 10:30",
    },
    {
      id: "HP-1002",
      item: "コーヒー豆 5kg",
      status: "in_transit",
      from: "山のむこう焙煎所",
      to: "Cafe 201",
      location: "API TOWN 配送センター",
      updated_at: "2026-07-08 08:15",
    },
    {
      id: "HP-1003",
      item: "小説『ステータス・コードの謎』",
      status: "in_transit",
      from: "メソッド図書館",
      to: "Pecker社 資料室",
      location: "トラック3号車で配達中",
      updated_at: "2026-07-08 09:40",
    },
    {
      id: "HP-1004",
      item: "誕生日プレゼントのくまのぬいぐるみ",
      status: "lost",
      from: "ミナのおばあちゃん",
      to: "タウン小学校前 ミナ",
      location: "不明（最後の記録: 第3倉庫）",
      updated_at: "2026-07-06 17:00",
    },
    {
      id: "HP-1005",
      item: "かさ 30本",
      status: "delivered",
      from: "アメフラシ商店",
      to: "API TOWN 案内所",
      location: "配達完了",
      updated_at: "2026-07-05 14:20",
    },
  ],
};
