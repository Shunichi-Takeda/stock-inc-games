/**
 * API TOWN — 用語辞典モーダル
 */
window.AT = window.AT || {};

AT.glossaryUI = (function () {
  let modal, listEl;

  function init() {
    modal = document.getElementById("glossaryModal");
    listEl = document.getElementById("glossaryList");
    document.getElementById("btnGlossary").addEventListener("click", open);
    modal.querySelector(".modal-close").addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
  }

  function open() {
    listEl.innerHTML = "";
    AT.glossary.forEach((g) => {
      const item = document.createElement("div");
      item.className = "glossary-item";
      item.innerHTML = `
        <div class="glossary-term"></div>
        <p class="glossary-desc"></p>
        <p class="glossary-analogy"></p>`;
      item.querySelector(".glossary-term").textContent = g.term;
      item.querySelector(".glossary-desc").textContent = g.desc;
      item.querySelector(".glossary-analogy").textContent = g.analogy;
      listEl.appendChild(item);
    });
    modal.classList.remove("hidden");
  }

  function close() {
    modal.classList.add("hidden");
  }

  return { init, open };
})();
