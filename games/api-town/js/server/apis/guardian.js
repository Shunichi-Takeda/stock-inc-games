/**
 * API TOWN — セキュリティ会社「ガーディアン」の API 定義
 * 学習テーマ: API を狙う脅威（不正アクセス・総当たり/Bot・情報漏洩・入力攻撃）と、
 *             簡易的な守り方（レート制限 429・入力検証 400）
 */
window.AT = window.AT || {};

// 総当たり検知用: 直近のログイン試行タイムスタンプ（メモリ上、リロードで消える）
AT.guardianState = { loginAttempts: [] };

AT.companies.guardian = {
  id: "guardian",
  name: "ガーディアン",
  emoji: "🛡️",
  tagline: "APIを攻撃から守るセキュリティ会社",
  baseUrl: "https://api.guardian.example",
  character: { name: "隊長 マモル", emoji: "🦾" },
  docs: [
    {
      method: "POST",
      path: "/secure-login",
      summary: "ログインを試みる（監視つき）",
      desc: "ログイン用の窓口。総当たり攻撃（Botが何度もパスワードを試す攻撃）を防ぐため、短時間に何度も呼ぶと 429 でブロックされます。",
      params: [],
      example: { message: "ログイン失敗（デモ）。ただし正しく監視されています。" },
    },
    {
      method: "GET",
      path: "/members",
      summary: "会員を検索する（入力検証つき）",
      desc: "会員名で検索します。クエリ q に危険な文字列（スクリプトや命令の注入）が含まれると、サーバーが 400 でブロックします。",
      params: [
        { name: "q", kind: "query", required: false, desc: "検索する会員名。危険な文字を含むと弾かれる" },
      ],
      example: { count: 1, members: [{ name: "山田", plan: "Pro" }] },
    },
  ],
};

/* ---------- 総当たり/Bot対策: レート制限 (429) ---------- */

AT.server.register("guardian", "POST", "/secure-login", () => {
  const now = Date.now();
  const st = AT.guardianState;
  // 直近10秒の試行だけ残す
  st.loginAttempts = st.loginAttempts.filter((t) => now - t < 10000);
  st.loginAttempts.push(now);

  if (st.loginAttempts.length > 3) {
    return {
      status: 429,
      headers: { "retry-after": "10" },
      body: {
        error: "too_many_requests",
        message:
          "短時間にログインを試しすぎです。総当たり攻撃とみなして一時ブロックしました（Retry-After: 10秒）。これがBot対策の基本、レート制限です。",
      },
    };
  }
  return {
    status: 401,
    body: {
      error: "login_failed",
      message: "ログイン失敗（デモ）。あと数回すばやく送ると、総当たり攻撃とみなされてブロックされます。試してみましょう。",
    },
  };
});

/* ---------- 入力攻撃対策: 入力検証 (400) ---------- */

AT.server.register("guardian", "GET", "/members", ({ query }) => {
  const q = query.q;
  if (q !== undefined) {
    // スクリプトやSQL命令の注入っぽい文字列を検知（簡易）
    const dangerous = /[<>'";]|script|drop|select|delete\s|union/i;
    if (dangerous.test(q)) {
      return {
        status: 400,
        body: {
          error: "invalid_input",
          message:
            "危険な入力を検知したためブロックしました。ユーザーの入力をそのまま信用せず検査する——これが「入力検証」。注入攻撃（インジェクション）を防ぐ基本です。",
        },
      };
    }
  }
  const members = [
    { name: "山田", plan: "Pro" },
    { name: "佐藤", plan: "Free" },
    { name: "鈴木", plan: "Enterprise" },
  ];
  const list = q ? members.filter((m) => m.name.includes(q)) : members;
  return { status: 200, body: { count: list.length, members: list } };
});
