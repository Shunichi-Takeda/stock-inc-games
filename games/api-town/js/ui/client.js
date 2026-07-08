/**
 * API TOWN — APIクライアント（リクエストビルダー＋レスポンスビューア）
 */
window.AT = window.AT || {};

AT.client = (function () {
  let company = null;
  let els = {};

  function init() {
    els = {
      method: document.getElementById("reqMethod"),
      baseUrl: document.getElementById("baseUrlChip"),
      path: document.getElementById("reqPath"),
      send: document.getElementById("btnSend"),
      error: document.getElementById("clientError"),
      response: document.getElementById("responseArea"),
      headersEditor: document.getElementById("headersEditor"),
      headerRows: document.getElementById("headerRows"),
      bodyEditor: document.getElementById("bodyEditor"),
      body: document.getElementById("reqBody"),
    };
    els.send.addEventListener("click", onSend);
    els.path.addEventListener("keydown", (e) => {
      if (e.key === "Enter") onSend();
    });
    document.getElementById("btnAddHeader").addEventListener("click", () => addHeaderRow());
  }

  /* ---------- ヘッダーエディタ ---------- */

  function addHeaderRow(key = "", value = "") {
    const row = document.createElement("div");
    row.className = "header-row";
    row.innerHTML = `
      <input type="text" class="h-key" placeholder="名前（例: X-API-Key）" autocomplete="off" spellcheck="false">
      <input type="text" class="h-val" placeholder="値" autocomplete="off" spellcheck="false">
      <button type="button" class="h-del" aria-label="このヘッダーを削除">✕</button>`;
    row.querySelector(".h-key").value = key;
    row.querySelector(".h-val").value = value;
    row.querySelector(".h-del").addEventListener("click", () => row.remove());
    els.headerRows.appendChild(row);
    return row;
  }

  function getHeaders() {
    const headers = {};
    els.headerRows.querySelectorAll(".header-row").forEach((row) => {
      const k = row.querySelector(".h-key").value.trim();
      const v = row.querySelector(".h-val").value.trim();
      if (k) headers[k] = v;
    });
    return headers;
  }

  function setCompany(c) {
    company = c;
    els.baseUrl.textContent = c.baseUrl;
    els.path.value = "";
    els.method.value = "GET";
    els.headerRows.innerHTML = "";
    els.headersEditor.open = false;
    els.body.value = "";
    els.bodyEditor.open = false;
    hideError();
    els.response.innerHTML = `
      <div class="response-empty">
        <div class="response-empty-icon">📡</div>
        <p>まだレスポンスはありません。<br>リクエストを送信すると、ここに「返事」が表示されます。</p>
      </div>`;
  }

  /** ドキュメントの「試してみる」から呼ばれる */
  function fillRequest(method, path) {
    els.method.value = method;
    els.path.value = path;
    els.path.focus();
    hideError();
  }

  function showError(msg) {
    els.error.textContent = msg;
    els.error.classList.remove("hidden");
  }
  function hideError() {
    els.error.classList.add("hidden");
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /** JSON文字列の簡易シンタックスハイライト */
  function highlightJson(jsonStr) {
    return escapeHtml(jsonStr).replace(
      /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?/g,
      (match, str, colon, keyword) => {
        if (str) {
          return colon
            ? `<span class="j-key">${str}</span>${colon}`
            : `<span class="j-str">${str}</span>`;
        }
        if (keyword) return `<span class="j-kw">${keyword}</span>`;
        return `<span class="j-num">${match}</span>`;
      }
    );
  }

  function statusClass(status) {
    if (status < 300) return "s2xx";
    if (status < 400) return "s3xx";
    if (status < 500) return "s4xx";
    return "s5xx";
  }

  function buildCodeSnippets(method, pathWithQuery, headers, body) {
    const fullUrl = company.baseUrl + pathWithQuery;
    const allHeaders = Object.assign(
      body !== undefined ? { "Content-Type": "application/json" } : {},
      headers
    );
    const headerKeys = Object.keys(allHeaders);
    const opts = [];
    if (method !== "GET") opts.push(`method: "${method}"`);
    if (headerKeys.length) {
      const h = headerKeys.map((k) => `"${k}": "${allHeaders[k]}"`).join(", ");
      opts.push(`headers: { ${h} }`);
    }
    if (body !== undefined) opts.push(`body: JSON.stringify(${JSON.stringify(body)})`);
    const fetchOpts = opts.length ? `, {\n  ${opts.join(",\n  ")}\n}` : "";
    const fetchCode = `const res = await fetch("${fullUrl}"${fetchOpts});\nconst data = await res.json();\nconsole.log(data);`;
    const curlParts = ["curl"];
    if (method !== "GET") curlParts.push(`-X ${method}`);
    headerKeys.forEach((k) => curlParts.push(`-H "${k}: ${allHeaders[k]}"`));
    if (body !== undefined) curlParts.push(`-d '${JSON.stringify(body)}'`);
    curlParts.push(`"${fullUrl}"`);
    return { fetchCode, curlCode: curlParts.join(" ") };
  }

  function renderResponse(res, method, pathWithQuery, reqHeaders, reqBody) {
    // 204 No Content などボディが無いレスポンスへの対応
    const bodyHtml =
      res.body === undefined || res.body === null
        ? '<p class="response-nobody">（ボディなし — 204 No Content などでは、これが正常です）</p>'
        : `<pre class="json-view">${highlightJson(JSON.stringify(res.body, null, 2))}</pre>`;
    const headerRows = Object.entries(res.headers)
      .map(
        ([k, v]) =>
          `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(String(v))}</td></tr>`
      )
      .join("");
    const { fetchCode, curlCode } = buildCodeSnippets(method, pathWithQuery, reqHeaders, reqBody);

    els.response.innerHTML = `
      <div class="response-status">
        <span class="status-pill ${statusClass(res.status)}">${res.status} ${res.statusText}</span>
        <span class="response-time">⏱ ${res.timeMs}ms</span>
      </div>
      <div class="response-tabs">
        <button class="response-tab active" data-tab="body">ボディ</button>
        <button class="response-tab" data-tab="headers">ヘッダー</button>
      </div>
      <div class="response-panel" data-panel="body">
        ${bodyHtml}
      </div>
      <div class="response-panel hidden" data-panel="headers">
        <table class="headers-table"><tbody>${headerRows}</tbody></table>
      </div>
      <details class="code-peek">
        <summary>👩‍💻 この操作をコードで書くと…</summary>
        <div class="code-peek-block"><div class="code-peek-label">JavaScript (fetch)</div><pre>${escapeHtml(fetchCode)}</pre></div>
        <div class="code-peek-block"><div class="code-peek-label">curl</div><pre>${escapeHtml(curlCode)}</pre></div>
      </details>`;

    els.response.querySelectorAll(".response-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        els.response
          .querySelectorAll(".response-tab")
          .forEach((t) => t.classList.toggle("active", t === tab));
        els.response.querySelectorAll(".response-panel").forEach((p) => {
          p.classList.toggle("hidden", p.dataset.panel !== tab.dataset.tab);
        });
      });
    });
  }

  async function onSend() {
    if (!company) return;
    const method = els.method.value;
    const raw = els.path.value.trim();

    if (!raw) {
      showError("URL欄にパスを入力してください（例: /parcels）");
      return;
    }
    if (!raw.startsWith("/")) {
      showError("パスは「/」から始めてください（例: /parcels）");
      return;
    }
    hideError();

    const headers = getHeaders();

    // リクエストボディ（JSON）。GET では送らない（fetch と同じ挙動）
    let body;
    const bodyRaw = els.body.value.trim();
    if (bodyRaw && method !== "GET") {
      try {
        body = JSON.parse(bodyRaw);
      } catch (e) {
        showError('リクエストボディの JSON が正しくありません。例: { "item": "latte" }（項目名は "二重引用符" で囲みます）');
        return;
      }
    }

    els.send.disabled = true;
    els.send.textContent = "送信中…";
    try {
      const res = await AT.server.send(company.id, method, raw, { headers, body });
      renderResponse(res, method, raw, headers, body);
      const { path, query } = AT.server.parseUrl(raw);
      const normHeaders = {};
      Object.entries(headers).forEach(([k, v]) => (normHeaders[k.toLowerCase()] = v));
      AT.main.onResponse(
        { companyId: company.id, method, path, query, headers: normHeaders, body, status: res.status },
        res
      );
    } finally {
      els.send.disabled = false;
      els.send.textContent = "🚀 送信";
    }
  }

  return { init, setCompany, fillRequest };
})();
