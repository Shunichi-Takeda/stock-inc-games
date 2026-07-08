/**
 * API TOWN — api型クエストの完了判定
 */
window.AT = window.AT || {};

AT.validator = (function () {
  /** goal.path とリクエストパスの一致判定（"*" セグメントは任意値にマッチ） */
  function pathMatches(goalPath, actualPath) {
    const g = goalPath.split("/").filter(Boolean);
    const a = actualPath.split("/").filter(Boolean);
    if (g.length !== a.length) return false;
    for (let i = 0; i < g.length; i++) {
      if (g[i] === "*") continue;
      if (g[i] !== a[i]) return false;
    }
    return true;
  }

  /**
   * @param {object} goal    クエストの完了条件
   * @param {object} attempt { method, path, query, status }
   * @returns {boolean}
   */
  function check(goal, attempt) {
    if (!goal) return false;
    if (goal.method && goal.method !== attempt.method) return false;
    if (goal.path && !pathMatches(goal.path, attempt.path)) return false;
    if (goal.noQuery && Object.keys(attempt.query).length > 0) return false;
    if (goal.query) {
      for (const [k, v] of Object.entries(goal.query)) {
        if (attempt.query[k] !== v) return false;
      }
    }
    if (goal.headers) {
      const h = attempt.headers || {};
      for (const [k, v] of Object.entries(goal.headers)) {
        if ((h[k.toLowerCase()] || "").trim() !== v) return false;
      }
    }
    if (goal.body) {
      const b = attempt.body || {};
      for (const [k, v] of Object.entries(goal.body)) {
        if (JSON.stringify(b[k]) !== JSON.stringify(v)) return false;
      }
    }
    if (goal.status !== undefined && goal.status !== attempt.status) return false;
    return true;
  }

  return { check };
})();
