/**
 * API TOWN — トリビアカードアルバム（カプセルAPIのコレクション一覧）
 */
window.AT = window.AT || {};

AT.album = (function () {
  let modal, gridEl, countEl, ticketEl;

  function init() {
    modal = document.getElementById("albumModal");
    gridEl = document.getElementById("albumGrid");
    countEl = document.getElementById("albumCount");
    ticketEl = document.getElementById("albumTickets");
    document.getElementById("btnAlbum").addEventListener("click", open);
    modal.querySelector(".modal-close").addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
  }

  function open() {
    const save = AT.save.get();
    const owned = save.cards || [];
    gridEl.innerHTML = "";

    // レアリティ順（SR → R → N）、同レアリティ内はID順で並べる
    const order = { SR: 0, R: 1, N: 2 };
    const cards = AT.triviaCards.slice().sort((a, b) => order[a.rarity] - order[b.rarity] || a.id.localeCompare(b.id));

    cards.forEach((c) => {
      const has = owned.includes(c.id);
      const el = document.createElement("div");
      el.className = `album-card rarity-${c.rarity.toLowerCase()}${has ? "" : " unknown"}`;
      if (has) {
        el.innerHTML = `
          <div class="album-rarity">${c.rarity}</div>
          <div class="album-title"></div>
          <p class="album-text"></p>`;
        el.querySelector(".album-title").textContent = c.title;
        el.querySelector(".album-text").textContent = c.text;
      } else {
        el.innerHTML = `
          <div class="album-rarity">${c.rarity}</div>
          <div class="album-title">？？？</div>
          <p class="album-text">まだ持っていないカード。カプセルAPIで POST /gacha を回すか、チケット5枚で POST /exchange！</p>`;
      }
      gridEl.appendChild(el);
    });

    countEl.textContent = `${owned.length} / ${AT.triviaCards.length}`;
    ticketEl.textContent = `🎟️ チケット: ${save.tickets || 0} 枚（5枚で未入手カードと確定交換）`;
    modal.classList.remove("hidden");
  }

  function close() {
    modal.classList.add("hidden");
  }

  return { init, open };
})();
