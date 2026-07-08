/**
 * API TOWN — 街マップ（パビリオン選択）
 */
window.AT = window.AT || {};

AT.map = (function () {
  let grid = null;

  function init() {
    grid = document.getElementById("buildingGrid");
  }

  function stageCleared(stage, save) {
    return stage.quests.every((q) => save.clearedQuests.includes(q.id));
  }

  function stageProgress(stage, save) {
    const done = stage.quests.filter((q) => save.clearedQuests.includes(q.id)).length;
    return { done, total: stage.quests.length };
  }

  function isStageClearedById(id, save) {
    const stage = AT.stages.find((s) => s.id === id);
    return stage ? stageCleared(stage, save) : false;
  }

  function renderStageCard(stage, unlocked, save, lockedLabelOverride) {
    const company = AT.companies[stage.company];
    const cleared = stageCleared(stage, save);
    const { done, total } = stageProgress(stage, save);

    const card = document.createElement("button");
    card.type = "button";
    card.className =
      "building-card" +
      (cleared ? " cleared" : unlocked ? " unlocked" : " locked") +
      (unlocked && !cleared ? " next" : "") +
      (stage.bonus ? " bonus" : "");

    const lockedMsg =
      stage.lockedLabel || lockedLabelOverride || "🔒 前の職場をクリアで解放";
    card.innerHTML = `
      ${stage.bonus ? `<div class="bonus-ribbon">${stage.ribbonLabel || "番外編"}</div>` : ""}
      <div class="building-emoji">${company.emoji}</div>
      <div class="building-name">${company.name}</div>
      <div class="building-theme">${stage.theme}</div>
      <div class="building-status">${
        cleared
          ? `✅ クリア済み <span class="building-badge">${stage.badge.emoji} ${stage.badge.name}</span>`
          : unlocked
            ? done > 0
              ? `▶ 仕事 ${done}/${total} 完了`
              : "▶ ここで働く"
            : lockedMsg
      }</div>`;

    if (unlocked) {
      card.addEventListener("click", () => AT.main.enterCompany(stage.id));
    } else {
      card.disabled = true;
    }
    grid.appendChild(card);
  }

  function renderSoonCard(c) {
    const card = document.createElement("div");
    card.className = "building-card coming-soon";
    card.innerHTML = `
      <div class="building-emoji">${c.emoji}</div>
      <div class="building-name">${c.name}</div>
      <div class="building-theme">${c.theme}</div>
      <div class="building-status">🚧 準備中（次回アップデート）</div>`;
    grid.appendChild(card);
  }

  function render() {
    const save = AT.save.get();
    grid.innerHTML = "";

    // カリキュラム順に描画。実装済みステージのアンロックは
    // 「直前の"実装済み"ステージをクリア」で連鎖する（準備中は進行をブロックしない）。
    let prevStageCleared = true; // 最初のステージは常に解放
    let prevStageName = null;

    AT.curriculum.forEach((item) => {
      if (item.soon) {
        renderSoonCard(item.soon);
        return;
      }
      const stage = AT.stages.find((s) => s.id === item.stage);
      if (!stage) return;

      if (stage.bonus) {
        // 番外編: 指定ステージ（例: 卒業制作）クリアで解放。進行ラインには影響しない
        const unlocked = stage.unlockAfterStage
          ? isStageClearedById(stage.unlockAfterStage, save)
          : true;
        renderStageCard(stage, unlocked, save);
        return;
      }

      const unlocked = prevStageCleared;
      const lockedLabel = prevStageName ? `🔒 ${prevStageName}をクリアで解放` : null;
      renderStageCard(stage, unlocked, save, lockedLabel);
      prevStageCleared = stageCleared(stage, save);
      prevStageName = AT.companies[stage.company].name;
    });
  }

  return { init, render, stageCleared };
})();
