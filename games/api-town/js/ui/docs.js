/**
 * API TOWN — APIドキュメントビューア
 * 「ドキュメントを読んで仕事を進める」実務体験のためのパネル
 */
window.AT = window.AT || {};

AT.docs = (function () {
  let container = null;

  function init() {
    container = document.getElementById("docsList");
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function render(company) {
    container.innerHTML = "";
    const intro = document.createElement("p");
    intro.className = "docs-intro";
    intro.textContent = `${company.name} API リファレンス — 注文できる「メニュー表」です。`;
    container.appendChild(intro);

    company.docs.forEach((ep) => {
      const item = document.createElement("div");
      item.className = "doc-item";

      const kindLabel = { path: "パス", query: "クエリ", arg: "引数" };
      const paramsHtml = ep.params.length
        ? `<div class="doc-section-title">パラメータ</div>
           <table class="doc-params"><tbody>
           ${ep.params
             .map(
               (p) => `<tr>
                 <td><code>${escapeHtml(p.name)}</code></td>
                 <td><span class="param-kind">${kindLabel[p.kind] || p.kind}</span>${p.required ? '<span class="param-req">必須</span>' : '<span class="param-opt">任意</span>'}</td>
                 <td>${escapeHtml(p.desc)}</td>
               </tr>`
             )
             .join("")}
           </tbody></table>`
        : "";
      const authHtml = ep.auth
        ? `<div class="doc-auth">🔐 認証: ${escapeHtml(ep.auth)}</div>`
        : "";
      const isTool = ep.method === "TOOL";

      item.innerHTML = `
        <button class="doc-head" type="button">
          <span class="method-chip m-${ep.method.toLowerCase()}">${ep.method}</span>
          <code class="doc-path">${escapeHtml(ep.path)}</code>
          <span class="doc-toggle">▾</span>
        </button>
        <div class="doc-body hidden">
          <p class="doc-summary">${escapeHtml(ep.summary)}</p>
          <p class="doc-desc">${escapeHtml(ep.desc)}</p>
          ${authHtml}
          ${paramsHtml}
          <div class="doc-section-title">レスポンス例</div>
          <pre class="doc-example">${escapeHtml(JSON.stringify(ep.example, null, 2))}</pre>
          ${isTool ? "" : '<button class="btn-try" type="button">📮 クライアントに入力する</button>'}
        </div>`;

      item.querySelector(".doc-head").addEventListener("click", () => {
        const body = item.querySelector(".doc-body");
        body.classList.toggle("hidden");
        item.querySelector(".doc-toggle").textContent = body.classList.contains("hidden") ? "▾" : "▴";
      });

      const tryBtn = item.querySelector(".btn-try");
      if (tryBtn) {
        tryBtn.addEventListener("click", () => {
          AT.client.fillRequest(ep.method, ep.path);
          AT.main.focusClientPane();
        });
      }

      container.appendChild(item);
    });
  }

  return { init, render };
})();
