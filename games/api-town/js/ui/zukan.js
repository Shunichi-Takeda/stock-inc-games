/**
 * API TOWN — ステータスコード図鑑
 * 一度でも受け取ったステータスコードがコレクションされていく
 */
window.AT = window.AT || {};

AT.zukan = (function () {
  let modal, gridEl, countEl;

  function init() {
    modal = document.getElementById("zukanModal");
    gridEl = document.getElementById("zukanGrid");
    countEl = document.getElementById("zukanCount");
    document.getElementById("btnZukan").addEventListener("click", open);
    modal.querySelector(".modal-close").addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
  }

  /**
   * レスポンスで受け取ったコードを図鑑に登録する
   * @returns {boolean} 新規登録だったか
   */
  function collect(code) {
    if (!AT.statusCodes.some((c) => c.code === code)) return false;
    const save = AT.save.get();
    if (save.codes.includes(code)) return false;
    save.codes.push(code);
    save.codes.sort((a, b) => a - b);
    AT.save.write();
    const entry = AT.statusCodes.find((c) => c.code === code);
    AT.main.toast(`📕 図鑑に登録: ${code} ${entry.name}`);
    return true;
  }

  function classOf(code) {
    if (code < 300) return "s2xx";
    if (code < 400) return "s3xx";
    if (code < 500) return "s4xx";
    return "s5xx";
  }

  function open() {
    const save = AT.save.get();
    gridEl.innerHTML = "";
    let collected = 0;

    AT.statusCodes.forEach((c) => {
      const has = save.codes.includes(c.code);
      if (has) collected++;
      const card = document.createElement("div");
      card.className = `zukan-card ${has ? "collected " + classOf(c.code) : "unknown"}`;
      if (has) {
        card.innerHTML = `
          <div class="zukan-code">${c.code}</div>
          <div class="zukan-name"></div>
          <div class="zukan-jp"></div>
          <p class="zukan-desc"></p>
          <p class="zukan-scene"></p>`;
        card.querySelector(".zukan-name").textContent = c.name;
        card.querySelector(".zukan-jp").textContent = c.jp;
        card.querySelector(".zukan-desc").textContent = c.desc;
        card.querySelector(".zukan-scene").textContent = `💼 ${c.scene}`;
      } else {
        card.innerHTML = `
          <div class="zukan-code">${c.secret ? "???" : c.code}</div>
          <div class="zukan-name">？？？</div>
          <p class="zukan-desc">${c.secret ? "どこかに隠されたレアコード…" : "まだ出会っていないコード。いつかレスポンスで受け取ると登録される。"}</p>`;
      }
      gridEl.appendChild(card);
    });

    countEl.textContent = `${collected} / ${AT.statusCodes.length}`;
    modal.classList.remove("hidden");
  }

  function close() {
    modal.classList.add("hidden");
  }

  return { init, collect, open };
})();
