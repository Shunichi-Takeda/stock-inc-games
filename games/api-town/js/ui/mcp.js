/**
 * API TOWN — AIアシスタント・シミュレーター（MCP体験）
 * AIがツールを呼び、その中身が Web API であることを可視化する
 */
window.AT = window.AT || {};

AT.mcpUI = (function () {
  let chatEl, actionsEl;
  let quest = null;
  let onComplete = null;
  let stepIdx = 0;

  function init() {
    chatEl = document.getElementById("mcpChat");
    actionsEl = document.getElementById("mcpActions");
  }

  function scroll() {
    chatEl.scrollTop = chatEl.scrollHeight;
    const last = chatEl.lastElementChild;
    if (last) last.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function addBubble(cls, text) {
    const el = document.createElement("div");
    el.className = "mcp-bubble " + cls;
    el.textContent = text;
    chatEl.appendChild(el);
    scroll();
    return el;
  }

  function setAction(label, handler) {
    actionsEl.innerHTML = "";
    if (!label) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-primary";
    btn.textContent = label;
    btn.addEventListener("click", handler);
    actionsEl.appendChild(btn);
  }

  function start(q, done) {
    quest = q;
    onComplete = done;
    stepIdx = 0;
    chatEl.innerHTML = "";
    addBubble("mcp-ai", "🤖 " + q.scenario.intro);
    showNextPrompt();
  }

  function showNextPrompt() {
    const step = quest.scenario.steps[stepIdx];
    if (!step) {
      finish();
      return;
    }
    setAction(`🗣️ 「${step.prompt}」と頼む`, () => runStep(step));
  }

  function runStep(step) {
    setAction(null);
    addBubble("mcp-user", step.prompt);
    setTimeout(() => {
      addBubble("mcp-ai", "🤖 " + step.ai);
      showToolCard(step);
    }, 700);
  }

  function showToolCard(step) {
    const card = document.createElement("div");
    card.className = "mcp-tool-card";
    card.innerHTML = `
      <div class="mcp-tool-head">🧰 ツール呼び出しのリクエスト</div>
      <pre class="mcp-tool-body">${step.tool.name}(${JSON.stringify(step.tool.args)})</pre>
      <div class="mcp-tool-api">中身: <code>${step.tool.api.method} ${step.tool.api.url}</code>（${AT.companies[step.tool.api.company].name} のAPI）</div>
      <button type="button" class="btn btn-primary mcp-approve">✅ 実行を許可する</button>`;
    chatEl.appendChild(card);
    scroll();

    card.querySelector(".mcp-approve").addEventListener("click", async () => {
      const btn = card.querySelector(".mcp-approve");
      btn.disabled = true;
      btn.textContent = "⏳ APIを呼び出し中…";
      const res = await AT.server.send(step.tool.api.company, step.tool.api.method, step.tool.api.url);
      AT.zukan.collect(res.status);
      btn.remove();
      const resultLine = document.createElement("div");
      resultLine.className = "mcp-tool-result";
      resultLine.innerHTML = `↳ <code>${step.tool.api.method} ${step.tool.api.url}</code> → <strong class="ok">${res.status} ${res.statusText}</strong>（${res.timeMs}ms）`;
      card.appendChild(resultLine);
      scroll();
      setTimeout(() => {
        addBubble("mcp-ai", "🤖 " + step.result);
        stepIdx++;
        showNextPrompt();
      }, 800);
    });
  }

  function finish() {
    addBubble("mcp-ai", "🤖 " + quest.scenario.outro);
    setAction("✅ 体験を終える", () => {
      setAction(null);
      const done = onComplete;
      onComplete = null;
      if (done) done();
    });
  }

  return { init, start };
})();
