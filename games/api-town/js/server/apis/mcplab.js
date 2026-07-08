/**
 * API TOWN — 番外編「MCPラボ」
 * ここは HTTP の API ではなく、AI アシスタントが使う「ツール（MCP）」を研究する施設。
 * ドキュメントには MCP のツール定義を表示する（APIドキュメントとの類似性を見せるため）。
 */
window.AT = window.AT || {};

AT.companies.mcplab = {
  id: "mcplab",
  name: "MCPラボ",
  emoji: "🤖",
  tagline: "番外編: AIと道具の研究所",
  baseUrl: "mcp://ai-lab.example",
  character: { name: "研究員 ラボ", emoji: "🧑‍🔬" },
  docs: [
    {
      method: "TOOL",
      path: "list_parcels",
      summary: "荷物一覧を取得するツール",
      desc: "AIアシスタントに公開されている「道具」の定義です。AIがこのツールを呼ぶと、中では ハトポスト便の GET /parcels が実行されます。書き方がAPIドキュメントとそっくりなことに注目！",
      params: [
        { name: "status", kind: "arg", required: false, desc: "荷物の状態で絞り込む（delivered / in_transit / lost）" },
      ],
      example: { count: 1, parcels: ["…GET /parcels と同じ返事…"] },
    },
    {
      method: "TOOL",
      path: "get_parcel",
      summary: "荷物を1件取得するツール",
      desc: "AIがこのツールを呼ぶと、中では ハトポスト便の GET /parcels/{id} が実行されます。",
      params: [
        { name: "id", kind: "arg", required: true, desc: "荷物の追跡番号（例: HP-1004）" },
      ],
      example: { id: "HP-1004", item: "…GET /parcels/{id} と同じ返事…" },
    },
  ],
};
