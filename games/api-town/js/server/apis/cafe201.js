/**
 * API TOWN — カフェ「Cafe 201」の API 定義
 * 学習テーマ: POST / JSONボディ / 201 Created / 400 バリデーションエラー
 */
window.AT = window.AT || {};

AT.cafe201Menu = [
  { id: "blend", name: "ブレンドコーヒー", price: 450 },
  { id: "latte", name: "カフェラテ", price: 520 },
  { id: "broccoli-smoothie", name: "ブロッコリースムージー", price: 580 },
  { id: "cheesecake", name: "チーズケーキ", price: 490 },
];

AT.companies.cafe201 = {
  id: "cafe201",
  name: "Cafe 201",
  emoji: "☕",
  tagline: "201 Created が店名の由来のカフェ",
  baseUrl: "https://api.cafe201.example",
  character: { name: "マスター クリタ", emoji: "☕" },
  docs: [
    {
      method: "GET",
      path: "/menu",
      summary: "メニューを取得する",
      desc: "注文できるメニューの一覧を返します。注文時は id をメニューIDとして使います。",
      params: [],
      example: {
        count: 4,
        menu: [{ id: "latte", name: "カフェラテ", price: 520 }],
      },
    },
    {
      method: "POST",
      path: "/orders",
      summary: "注文を作成する",
      desc: "リクエストボディ（JSON）で注文を受け付けます。item は必須（メニューID）、quantity は任意（1以上の整数、省略時は1）。成功すると 201 Created を返します。",
      params: [
        { name: "item", kind: "arg", required: true, desc: "メニューID（例: latte）。GET /menu で確認できる" },
        { name: "quantity", kind: "arg", required: false, desc: "個数（1以上の整数、省略時は1）。JSONでは引用符なしの数値で書く" },
      ],
      example: {
        message: "ご注文ありがとうございます！",
        order: { id: "ORD-1001", item: "latte", quantity: 1, total: 520, status: "received" },
      },
    },
    {
      method: "GET",
      path: "/orders",
      summary: "注文の一覧を取得する",
      desc: "これまでにあなたが作成した注文を返します。POST した注文が本当に記録されたか、ここで確認できます。",
      params: [],
      example: { count: 1, orders: [{ id: "ORD-1001", item: "latte", quantity: 1 }] },
    },
    {
      method: "GET",
      path: "/orders/{id}",
      summary: "注文を1件取得する",
      desc: "注文ID（例: ORD-1001）を指定して詳細を返します。",
      params: [{ name: "id", kind: "path", required: true, desc: "注文ID" }],
      example: { id: "ORD-1001", item: "latte", quantity: 1, total: 520, status: "received" },
    },
  ],
};

AT.server.register("cafe201", "GET", "/menu", () => ({
  status: 200,
  body: { count: AT.cafe201Menu.length, menu: AT.cafe201Menu },
}));

AT.server.register("cafe201", "POST", "/orders", ({ body, db }) => {
  if (!body || body.item === undefined) {
    return {
      status: 400,
      body: {
        error: "missing_item",
        message:
          "注文には item が必須です。「📦 リクエストボディ（JSON）」に { \"item\": \"メニューID\" } の形で書いてください。メニューIDは GET /menu で確認できます。",
      },
    };
  }
  const item = AT.cafe201Menu.find((m) => m.id === body.item);
  if (!item) {
    return {
      status: 400,
      body: {
        error: "unknown_item",
        message: `メニュー「${body.item}」はありません。GET /menu で正しいメニューIDを確認してください。`,
      },
    };
  }
  const qty = body.quantity === undefined ? 1 : body.quantity;
  if (!Number.isInteger(qty) || qty < 1) {
    return {
      status: 400,
      body: {
        error: "invalid_quantity",
        message:
          "quantity は 1 以上の整数で指定してください。JSON では数値を引用符なしで書きます（例: \"quantity\": 3）。",
      },
    };
  }
  const order = {
    id: "ORD-" + (1000 + db.orders.length + 1),
    item: item.id,
    item_name: item.name,
    quantity: qty,
    total: item.price * qty,
    status: "received",
  };
  db.orders.push(order);
  return {
    status: 201,
    headers: { location: "/orders/" + order.id },
    body: { message: "ご注文ありがとうございます！ 新しい注文を作成しました。", order },
  };
});

AT.server.register("cafe201", "GET", "/orders", ({ db }) => ({
  status: 200,
  body: { count: db.orders.length, orders: db.orders },
}));

AT.server.register("cafe201", "GET", "/orders/:id", ({ params, db }) => {
  const order = db.orders.find((o) => o.id === params.id);
  if (!order) {
    return {
      status: 404,
      body: { error: "order_not_found", message: `注文「${params.id}」は見つかりませんでした。` },
    };
  }
  return { status: 200, body: order };
});
