/**
 * API TOWN — 「メソッド図書館」の API 定義
 * 学習テーマ: PUT / PATCH / DELETE / 204 No Content / 409 Conflict / 冪等性
 */
window.AT = window.AT || {};

AT.companies.library = {
  id: "library",
  name: "メソッド図書館",
  emoji: "📚",
  tagline: "すべてのHTTPメソッドが揃う街の図書館",
  baseUrl: "https://api.method-library.example",
  character: { name: "司書 シオリ", emoji: "📖" },
  docs: [
    {
      method: "GET",
      path: "/books",
      summary: "蔵書の一覧を取得する",
      desc: "図書館の蔵書をすべて返します。",
      params: [],
      example: { count: 4, books: [{ id: "BK-001", title: "はじめてのAPI", status: "available" }] },
    },
    {
      method: "GET",
      path: "/books/{id}",
      summary: "蔵書を1件取得する",
      desc: "蔵書ID（例: BK-001）を指定して詳細を返します。",
      params: [{ name: "id", kind: "path", required: true, desc: "蔵書ID" }],
      example: { id: "BK-001", title: "はじめてのAPI", status: "available", borrower: null },
    },
    {
      method: "PATCH",
      path: "/books/{id}",
      summary: "蔵書を部分的に更新する（貸出・返却など）",
      desc: "変えたい項目だけをボディに書きます。貸出は { \"status\": \"borrowed\" }、返却は { \"status\": \"available\" }。すでに貸出中の本を借りようとすると 409 Conflict になります。",
      params: [
        { name: "id", kind: "path", required: true, desc: "蔵書ID" },
        { name: "status", kind: "arg", required: false, desc: "available（在架）/ borrowed（貸出中）" },
        { name: "location", kind: "arg", required: false, desc: "保管場所" },
      ],
      example: { message: "更新しました", book: { id: "BK-003", status: "borrowed", borrower: "あなた" } },
    },
    {
      method: "PUT",
      path: "/books/{id}",
      summary: "蔵書を丸ごと置き換える",
      desc: "1件のデータを丸ごと置き換えます。title / status / location をすべてボディに書く必要があります（不足すると 400）。一部だけ変えたいときは PATCH を使いましょう。",
      params: [
        { name: "id", kind: "path", required: true, desc: "蔵書ID" },
        { name: "title", kind: "arg", required: true, desc: "タイトル" },
        { name: "status", kind: "arg", required: true, desc: "available / borrowed" },
        { name: "location", kind: "arg", required: true, desc: "保管場所" },
      ],
      example: { message: "置き換えました", book: { id: "BK-001", title: "はじめてのAPI 第2版" } },
    },
    {
      method: "DELETE",
      path: "/books/{id}",
      summary: "蔵書を廃棄する",
      desc: "蔵書を削除します。成功すると 204 No Content（ボディなし）を返します。もう一度同じIDに送ると、すでに無いので 404 になります。",
      params: [{ name: "id", kind: "path", required: true, desc: "蔵書ID" }],
      example: {},
    },
  ],
};

function atLibFindBook(db, id) {
  return db.books.find((b) => b.id === id);
}

AT.server.register("library", "GET", "/books", ({ db }) => ({
  status: 200,
  body: { count: db.books.length, books: db.books },
}));

AT.server.register("library", "GET", "/books/:id", ({ params, db }) => {
  const book = atLibFindBook(db, params.id);
  if (!book) {
    return { status: 404, body: { error: "book_not_found", message: `蔵書「${params.id}」は見つかりませんでした。` } };
  }
  return { status: 200, body: book };
});

AT.server.register("library", "PATCH", "/books/:id", ({ params, body, db }) => {
  const book = atLibFindBook(db, params.id);
  if (!book) {
    return { status: 404, body: { error: "book_not_found", message: `蔵書「${params.id}」は見つかりませんでした。` } };
  }
  if (!body || Object.keys(body).length === 0) {
    return {
      status: 400,
      body: { error: "empty_body", message: "PATCH は「変えたい項目だけ」をボディ（JSON）に書きます。例: { \"status\": \"borrowed\" }" },
    };
  }
  if (body.status !== undefined) {
    if (!["available", "borrowed"].includes(body.status)) {
      return {
        status: 400,
        body: { error: "invalid_status", message: "status は available / borrowed のいずれかで指定してください。" },
      };
    }
    if (body.status === "borrowed" && book.status === "borrowed") {
      return {
        status: 409,
        body: {
          error: "conflict",
          message: `「${book.title}」はすでに ${book.borrower} が借りています。現在の状態と矛盾する操作なので 409 Conflict です。`,
        },
      };
    }
    book.status = body.status;
    book.borrower = body.status === "borrowed" ? body.borrower || "あなた" : null;
    if (body.location === undefined) {
      book.location = body.status === "borrowed" ? "貸出中" : "3F 技術書コーナー";
    }
  }
  if (body.title !== undefined) book.title = body.title;
  if (body.location !== undefined) book.location = body.location;
  return { status: 200, body: { message: "更新しました。", book } };
});

AT.server.register("library", "PUT", "/books/:id", ({ params, body, db }) => {
  const book = atLibFindBook(db, params.id);
  if (!book) {
    return { status: 404, body: { error: "book_not_found", message: `蔵書「${params.id}」は見つかりませんでした。` } };
  }
  const required = ["title", "status", "location"];
  const missing = required.filter((k) => !body || body[k] === undefined);
  if (missing.length) {
    return {
      status: 400,
      body: {
        error: "missing_fields",
        message: `PUT はデータ丸ごとの置き換えなので全項目が必須です（不足: ${missing.join(", ")}）。一部だけ変えたいときは PATCH を使いましょう。`,
      },
    };
  }
  book.title = body.title;
  book.status = body.status;
  book.location = body.location;
  book.borrower = body.status === "borrowed" ? body.borrower || "あなた" : null;
  return { status: 200, body: { message: "丸ごと置き換えました。", book } };
});

AT.server.register("library", "DELETE", "/books/:id", ({ params, db }) => {
  const idx = db.books.findIndex((b) => b.id === params.id);
  if (idx === -1) {
    return {
      status: 404,
      body: {
        error: "book_not_found",
        message: `蔵書「${params.id}」はもうありません。（すでに削除済みでも「無い」という結果は同じ——これが冪等性です）`,
      },
    };
  }
  db.books.splice(idx, 1);
  return { status: 204 };
});
