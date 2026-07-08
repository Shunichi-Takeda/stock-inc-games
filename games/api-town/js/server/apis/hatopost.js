/**
 * API TOWN — 宅配便「ハトポスト便」の API 定義
 * 学習テーマ: GET / パスパラメータ / クエリパラメータ / 404
 */
window.AT = window.AT || {};

AT.companies.hatopost = {
  id: "hatopost",
  name: "ハトポスト便",
  emoji: "📦",
  tagline: "街じゅうの荷物を運ぶ宅配会社",
  baseUrl: "https://api.hatopost.example",
  character: { name: "ハトリ部長", emoji: "🕊️" },
  docs: [
    {
      method: "GET",
      path: "/parcels",
      summary: "荷物の一覧を取得する",
      desc: "お預かり中の荷物をすべて返します。クエリパラメータ status で状態による絞り込みができます。",
      params: [
        {
          name: "status",
          kind: "query",
          required: false,
          desc: "荷物の状態で絞り込む。delivered（配達済み）/ in_transit（配達中）/ lost（紛失中）",
        },
      ],
      example: {
        count: 2,
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
        ],
      },
    },
    {
      method: "GET",
      path: "/parcels/{id}",
      summary: "荷物を1件取得する",
      desc: "追跡番号（id）を指定して、荷物1件の詳細を返します。見つからない場合は 404 を返します。",
      params: [
        {
          name: "id",
          kind: "path",
          required: true,
          desc: "荷物の追跡番号（例: HP-1002）",
        },
      ],
      example: {
        id: "HP-1002",
        item: "コーヒー豆 5kg",
        status: "in_transit",
        from: "山のむこう焙煎所",
        to: "Cafe 201",
        location: "API TOWN 配送センター",
        updated_at: "2026-07-08 08:15",
      },
    },
  ],
};

AT.server.register("hatopost", "GET", "/parcels", ({ query, db }) => {
  let list = db.parcels;
  if (query.status !== undefined) {
    const valid = ["delivered", "in_transit", "lost"];
    if (!valid.includes(query.status)) {
      return {
        status: 400,
        body: {
          error: "invalid_status",
          message: `status は ${valid.join(" / ")} のいずれかで指定してください。（受け取った値: 「${query.status}」）`,
        },
      };
    }
    list = list.filter((p) => p.status === query.status);
  }
  return { status: 200, body: { count: list.length, parcels: list } };
});

AT.server.register("hatopost", "GET", "/parcels/:id", ({ params, db }) => {
  const parcel = db.parcels.find((p) => p.id === params.id);
  if (!parcel) {
    return {
      status: 404,
      body: {
        error: "parcel_not_found",
        message: `追跡番号「${params.id}」の荷物は見つかりませんでした。番号が正しいか確認してください。`,
      },
    };
  }
  return { status: 200, body: parcel };
});
