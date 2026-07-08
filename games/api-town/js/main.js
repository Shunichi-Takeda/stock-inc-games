/**
 * API TOWN — 起動・画面遷移・クエスト進行エンジン
 */
window.AT = window.AT || {};

AT.main = (function () {
  let currentStage = null;
  let currentQuest = null;
  let hintsUsed = 0;
  let failCount = 0;
  let hintNudged = false;
  let pendingBadge = null;

  const RANKS = [
    "研修生", "アシスタント", "いちにんまえ", "ベテラン", "エース",
    "エキスパート", "シニア", "マイスター", "グランドマイスター", "街の英雄", "街の伝説",
  ];

  /* ---------- 画面遷移 ---------- */

  function showScreen(name) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    document.getElementById(name + "Screen").classList.add("active");
    document.getElementById("gameHeader").classList.toggle("hidden", name === "title");
  }

  function showMap() {
    AT.map.render();
    updateHeader();
    showScreen("map");
  }

  /* ---------- ヘッダー ---------- */

  function rankName() {
    const badges = AT.save.get().badges.length;
    return RANKS[Math.min(badges, RANKS.length - 1)];
  }

  function updateHeader() {
    const save = AT.save.get();
    document.getElementById("coinCount").textContent = save.coins.toLocaleString();
    document.getElementById("rankChip").textContent = `💼 ${rankName()}`;
  }

  /* ---------- トースト ---------- */

  function toast(msg) {
    const box = document.getElementById("toastBox");
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => el.classList.add("show"), 30);
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 400);
    }, 3200);
  }

  /* ---------- 職場（ワーク画面） ---------- */

  function character() {
    return AT.companies[currentStage.company].character;
  }

  function enterCompany(stageId) {
    currentStage = AT.stages.find((s) => s.id === stageId);
    const company = AT.companies[currentStage.company];

    document.getElementById("workCompany").textContent = `${company.emoji} ${company.name}`;
    document.getElementById("workTagline").textContent = company.tagline;
    AT.client.setCompany(company);
    AT.docs.render(company);
    AT.chat.clear();
    document.getElementById("missionBox").classList.add("hidden");
    setMobilePane("chat");
    showScreen("work");

    const save = AT.save.get();
    const next = currentStage.quests.find((q) => !save.clearedQuests.includes(q.id));
    if (next) {
      startQuest(next);
    } else {
      // クリア済みの職場は自由に触れる
      currentQuest = null;
      const mcpQuest = currentStage.quests.find((q) => q.type === "mcp");
      if (mcpQuest) {
        setCenterMode("mcp");
        AT.mcpUI.start(mcpQuest, () => {});
        AT.chat.push(character(), [
          "また来てくれたんですね！ シミュレーターは何度でも動かせますよ。AIとツールの動き、じっくり観察していってください。",
        ]);
      } else {
        setCenterMode("client");
        AT.chat.push(
          character(),
          currentStage.freeplay || [
            "おっ、また来てくれたのか。ここの仕事はもう全部クリア済みだ。",
            "APIクライアントは自由に使ってくれ。ドキュメントに載っている窓口を、好きなだけ試すといい。",
          ]
        );
      }
    }
  }

  function setCenterMode(mode) {
    document.getElementById("lessonPane").classList.toggle("hidden", mode !== "lesson");
    document.getElementById("clientPane").classList.toggle("hidden", mode !== "client");
    document.getElementById("mcpPane").classList.toggle("hidden", mode !== "mcp");
    // モバイルの中央タブ名を、いま表示している道具に合わせる
    const centerTab = document.querySelector('.work-tab[data-pane="client"]');
    centerTab.textContent =
      mode === "mcp" ? "🤖 AIシミュレーター" : mode === "lesson" ? "👩‍🏫 レッスン" : "📮 クライアント";
  }

  function setMobilePane(pane) {
    document.getElementById("workPanes").dataset.pane = pane;
    document.querySelectorAll(".work-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.pane === pane);
    });
    // ドキュメントタブを開いたら注意喚起の点滅を止める
    if (pane === "docs") {
      document.querySelector('.work-tab[data-pane="docs"]').classList.remove("attention");
    }
  }

  function focusClientPane() {
    setMobilePane("client");
  }

  /* ---------- クエスト進行 ---------- */

  function startQuest(quest) {
    currentQuest = quest;
    hintsUsed = 0;
    failCount = 0;
    hintNudged = false;
    setCenterMode(quest.type === "lesson" ? "lesson" : quest.type === "mcp" ? "mcp" : "client");

    if (quest.type === "lesson") {
      const lesson = AT.lessons[quest.lessonId];
      document.getElementById("lessonPaneTitle").textContent = lesson.title;
    }
    if (quest.type === "mcp") {
      AT.mcpUI.start(quest, () => completeQuest(quest));
    }

    document.getElementById("missionBox").classList.add("hidden");
    AT.chat.push(character(), quest.brief, () => showMission(quest));
  }

  function showMission(quest) {
    // 依頼チャットの表示中にクエストを先回りでクリアした場合は出さない
    if (AT.save.get().clearedQuests.includes(quest.id)) return;
    const box = document.getElementById("missionBox");
    box.classList.remove("hidden");
    box.innerHTML = `
      <div class="mission-label">🎯 いまの仕事</div>
      <div class="mission-title"></div>
      <p class="mission-text"></p>
      <div class="mission-actions"></div>
      <div class="mission-hints"></div>`;
    box.querySelector(".mission-title").textContent = quest.title;
    box.querySelector(".mission-text").textContent = quest.mission;

    const actions = box.querySelector(".mission-actions");
    if (quest.type === "lesson") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-primary";
      btn.textContent = "👩‍🏫 レッスンを始める";
      btn.addEventListener("click", () => {
        AT.lessonUI.start(quest.lessonId, () => completeQuest(quest));
      });
      actions.appendChild(btn);
      // 中央ペインの開始ボタンも同じ動作に
      const paneBtn = document.getElementById("btnLessonStart");
      paneBtn.onclick = () => AT.lessonUI.start(quest.lessonId, () => completeQuest(quest));
    } else if (quest.type === "mcp") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-primary";
      btn.textContent = "🤖 シミュレーターを開く";
      btn.addEventListener("click", focusClientPane);
      actions.appendChild(btn);
    } else if (quest.hints && quest.hints.length) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-ghost btn-hint";
      btn.textContent = `💡 ヒントを見る（${quest.hints.length}回まで）`;
      btn.addEventListener("click", () => {
        if (hintsUsed >= quest.hints.length) return;
        const hint = quest.hints[hintsUsed];
        hintsUsed++;
        const p = document.createElement("p");
        p.className = "mission-hint";
        p.textContent = `💡 ヒント${hintsUsed}: ${hint}`;
        box.querySelector(".mission-hints").appendChild(p);
        if (hintsUsed >= quest.hints.length) {
          btn.disabled = true;
          btn.textContent = "💡 ヒントは出しきりました";
        } else {
          btn.textContent = `💡 ヒントを見る（あと${quest.hints.length - hintsUsed}回）`;
        }
      });
      actions.appendChild(btn);
    }

    // ミッションがドキュメント参照を求めるときは、タブを点滅させて気づけるようにする
    const docsTab = document.querySelector('.work-tab[data-pane="docs"]');
    docsTab.classList.toggle("attention", quest.type === "api" && /ドキュメント/.test(quest.mission));

    box.scrollIntoView({ block: "nearest", behavior: "smooth" });
    AT.chat.scrollToBottom();
  }

  /** APIクライアントの送信結果を受け取る（AT.client から呼ばれる） */
  function onResponse(attempt, res) {
    AT.zukan.collect(res.status);
    // ガチャなどサーバー側でコインが動くAPIがあるため、常に表示を更新する
    updateHeader();
    if ((attempt.path === "/gacha" || attempt.path === "/exchange") && res.status === 201 && res.body && res.body.card) {
      const c = res.body.card;
      toast(
        res.body.is_new
          ? `🎴 ${c.rarity}カード「${c.title}」を入手！`
          : `🎰 「${c.title}」はダブり… +${res.body.duplicate_refund}コイン返金＆🎟️チケット+1`
      );
    }

    if (!currentQuest || currentQuest.type !== "api") return;
    if (AT.save.get().clearedQuests.includes(currentQuest.id)) return;

    if (AT.validator.check(currentQuest.goal, attempt)) {
      completeQuest(currentQuest);
    } else {
      failCount++;
      if (failCount >= 2 && !hintNudged) {
        hintNudged = true;
        AT.chat.push(character(), [
          "うまくいかないときは、「🎯 いまの仕事」のヒントボタンや、「📖 ドキュメント」を見てみるといいぞ。エラーの message も大事な手がかりだ。",
        ]);
      }
    }
  }

  function completeQuest(quest) {
    const save = AT.save.get();
    if (save.clearedQuests.includes(quest.id)) return;
    save.clearedQuests.push(quest.id);

    // 給料計算（ヒントを使うと少し減る）
    const base = quest.reward.coins;
    const deduction = Math.min(hintsUsed, 3) * Math.round(base * 0.15);
    const pay = base - deduction;
    save.coins += pay;

    // ステージコンプリート判定
    const stageDone = currentStage.quests.every((q) => save.clearedQuests.includes(q.id));
    pendingBadge = null;
    if (stageDone && !save.badges.includes(currentStage.badge.id)) {
      save.badges.push(currentStage.badge.id);
      pendingBadge = currentStage.badge;
    }
    AT.save.write();
    updateHeader();

    currentQuest = null;
    document.getElementById("missionBox").classList.add("hidden");
    document.querySelector('.work-tab[data-pane="docs"]').classList.remove("attention");

    AT.chat.push(character(), quest.success, () => {
      if (quest.learn) AT.chat.addCard("📝 今日のまとめ", quest.learn);
      setTimeout(() => showReward(quest, base, deduction, pay, stageDone), 600);
    });
  }

  /* ---------- 報酬（給料明細）モーダル ---------- */

  function showReward(quest, base, deduction, pay, stageDone) {
    const modal = document.getElementById("rewardModal");
    document.getElementById("rewardQuest").textContent = quest.title;
    document.getElementById("rewardRows").innerHTML = `
      <tr><td>基本給</td><td>🪙 ${base}</td></tr>
      ${deduction > 0 ? `<tr class="reward-minus"><td>ヒント利用</td><td>−🪙 ${deduction}</td></tr>` : ""}
      <tr class="reward-total"><td>支給額</td><td>🪙 ${pay}</td></tr>`;

    const badgeEl = document.getElementById("rewardBadge");
    if (pendingBadge) {
      badgeEl.classList.remove("hidden");
      badgeEl.innerHTML = `<div class="reward-badge-emoji">${pendingBadge.emoji}</div>
        <div>資格バッジ獲得！<br><strong>${pendingBadge.name}</strong></div>`;
    } else {
      badgeEl.classList.add("hidden");
    }

    const okBtn = document.getElementById("btnRewardOk");
    okBtn.onclick = () => {
      modal.classList.add("hidden");
      afterReward(stageDone);
    };
    modal.classList.remove("hidden");
  }

  function afterReward(stageDone) {
    const save = AT.save.get();
    if (stageDone) {
      AT.chat.push(character(), currentStage.complete, () => {
        const box = document.getElementById("missionBox");
        box.classList.remove("hidden");
        box.innerHTML = `<div class="mission-actions"></div>`;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-primary";
        btn.textContent = "🗺️ マップへ戻る";
        btn.addEventListener("click", showMap);
        box.querySelector(".mission-actions").appendChild(btn);
        AT.chat.scrollToBottom();
      });
    } else {
      const next = currentStage.quests.find((q) => !save.clearedQuests.includes(q.id));
      if (next) startQuest(next);
    }
  }

  /* ---------- タイトル画面 ---------- */

  function refreshTitleButtons() {
    const hasSave = AT.save.exists();
    document.getElementById("btnContinue").classList.toggle("hidden", !hasSave);
    document.getElementById("btnNew").textContent = hasSave ? "はじめから" : "🏙️ 街に入る";
  }

  /* ---------- 初期化 ---------- */

  function init() {
    AT.chat.init();
    AT.client.init();
    AT.docs.init();
    AT.map.init();
    AT.lessonUI.init();
    AT.mcpUI.init();
    AT.glossaryUI.init();
    AT.zukan.init();
    AT.album.init();

    document.getElementById("btnNew").addEventListener("click", () => {
      if (AT.save.exists() && !confirm("セーブデータを消して、最初から始めますか？")) return;
      AT.save.reset();
      AT.save.startNew();
      showMap();
    });
    document.getElementById("btnContinue").addEventListener("click", () => {
      AT.save.load();
      showMap();
    });
    document.getElementById("btnBackMap").addEventListener("click", showMap);
    document.getElementById("btnHeaderMap").addEventListener("click", showMap);

    document.querySelectorAll(".work-tab").forEach((tab) => {
      tab.addEventListener("click", () => setMobilePane(tab.dataset.pane));
    });

    refreshTitleButtons();
    showScreen("title");
  }

  document.addEventListener("DOMContentLoaded", init);

  return { enterCompany, onResponse, toast, focusClientPane, showMap };
})();
