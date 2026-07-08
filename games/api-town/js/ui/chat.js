/**
 * API TOWN — 依頼チャット UI
 * キャラクターからのメッセージをタイピング演出つきで順番に表示する
 */
window.AT = window.AT || {};

AT.chat = (function () {
  let container = null;

  function init() {
    container = document.getElementById("chatMessages");
  }

  function clear() {
    container.innerHTML = "";
  }

  function scrollToBottom() {
    container.scrollTop = container.scrollHeight;
    // ペイン自体が伸びるレイアウト（モバイル等）ではページ側もスクロールして追従する
    const last = container.lastElementChild;
    if (last) last.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function makeMsgEl(character, text) {
    const wrap = document.createElement("div");
    wrap.className = "chat-msg";
    wrap.innerHTML = `
      <div class="chat-avatar">${character.emoji}</div>
      <div class="chat-body">
        <div class="chat-name">${character.name}</div>
        <div class="chat-bubble"></div>
      </div>`;
    wrap.querySelector(".chat-bubble").textContent = text;
    return wrap;
  }

  /** システムカード（まとめ・お知らせ） */
  function addCard(title, lines) {
    const el = document.createElement("div");
    el.className = "chat-card";
    const ul = lines.map((l) => `<li></li>`).join("");
    el.innerHTML = `<div class="chat-card-title">${title}</div><ul>${ul}</ul>`;
    const items = el.querySelectorAll("li");
    lines.forEach((l, i) => (items[i].textContent = l));
    container.appendChild(el);
    scrollToBottom();
  }

  /**
   * キャラクターのメッセージを1件ずつ、タイピング演出つきで表示する
   * @param {object} character {name, emoji}
   * @param {string[]} texts
   * @param {function} [done]
   */
  function push(character, texts, done) {
    const queue = texts.slice();

    function next() {
      if (queue.length === 0) {
        if (done) done();
        return;
      }
      const text = queue.shift();
      // タイピングインジケーター
      const typing = document.createElement("div");
      typing.className = "chat-msg";
      typing.innerHTML = `
        <div class="chat-avatar">${character.emoji}</div>
        <div class="chat-body">
          <div class="chat-name">${character.name}</div>
          <div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>
        </div>`;
      container.appendChild(typing);
      scrollToBottom();

      const delay = Math.min(1600, 350 + text.length * 12);
      setTimeout(() => {
        typing.replaceWith(makeMsgEl(character, text));
        scrollToBottom();
        setTimeout(next, 250);
      }, delay);
    }
    next();
  }

  return { init, clear, push, addCard, scrollToBottom };
})();
