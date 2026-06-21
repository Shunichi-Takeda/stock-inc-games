/**
 * Stock Inc. Games — Common Utilities
 *
 * ゲーム間で使い回すユーティリティ関数
 */

/**
 * 指定範囲のランダムな整数を返す（min, max 含む）
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 指定範囲のランダムな浮動小数点数を返す
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 2つの矩形の衝突判定
 * @param {{ x: number, y: number, width: number, height: number }} a
 * @param {{ x: number, y: number, width: number, height: number }} b
 * @returns {boolean}
 */
function rectsCollide(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * 2点間の距離を計算
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * 値を指定範囲にクランプ
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
