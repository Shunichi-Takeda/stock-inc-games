/**
 * API TOWN — セーブデータ管理（localStorage）
 */
window.AT = window.AT || {};

AT.save = (function () {
  const KEY = "apitown-save-v1";

  function fresh() {
    return {
      version: 1,
      coins: 0,
      clearedQuests: [],   // クエストID
      badges: [],          // バッジID
      codes: [],           // 図鑑に登録済みのステータスコード
      cards: [],           // カプセルAPIで集めたトリビアカードID
      tickets: 0,          // カプセルチケット（ダブり救済・5枚で確定交換）
      startedAt: new Date().toISOString(),
    };
  }

  let state = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.version === 1) {
          state = data;
          return state;
        }
      }
    } catch (e) {
      console.warn("セーブデータの読み込みに失敗しました", e);
    }
    state = null;
    return null;
  }

  function exists() {
    return load() !== null;
  }

  function startNew() {
    state = fresh();
    write();
    return state;
  }

  function write() {
    if (!state) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("セーブに失敗しました", e);
    }
  }

  function get() {
    if (!state) load();
    if (!state) state = fresh();
    return state;
  }

  function reset() {
    localStorage.removeItem(KEY);
    state = null;
  }

  return { load, exists, startNew, write, get, reset };
})();
