/**
 * API TOWN — レッスンプレイヤー（紙芝居＋クイズのモーダル）
 */
window.AT = window.AT || {};

AT.lessonUI = (function () {
  let modal, titleEl, sceneEl, textEl, choicesEl, explainEl, nextBtn, dotsEl;
  let lesson = null;
  let index = 0;
  let onComplete = null;
  let quizSolved = false;

  function init() {
    modal = document.getElementById("lessonModal");
    titleEl = document.getElementById("lessonTitle");
    sceneEl = document.getElementById("lessonScene");
    textEl = document.getElementById("lessonText");
    choicesEl = document.getElementById("lessonChoices");
    explainEl = document.getElementById("lessonExplain");
    nextBtn = document.getElementById("lessonNext");
    dotsEl = document.getElementById("lessonDots");
    nextBtn.addEventListener("click", next);
  }

  function start(lessonId, done) {
    lesson = AT.lessons[lessonId];
    if (!lesson) return;
    index = 0;
    onComplete = done;
    modal.classList.remove("hidden");
    renderSlide();
  }

  function renderDots() {
    dotsEl.innerHTML = lesson.slides
      .map((_, i) => `<span class="dot${i === index ? " active" : i < index ? " done" : ""}"></span>`)
      .join("");
  }

  function renderSlide() {
    const slide = lesson.slides[index];
    titleEl.textContent = `👩‍🏫 ${lesson.title}`;
    renderDots();
    explainEl.classList.add("hidden");
    explainEl.textContent = "";

    if (slide.type === "talk") {
      quizSolved = true; // talk スライドは常に進める
      sceneEl.textContent = slide.scene;
      textEl.textContent = slide.text;
      choicesEl.innerHTML = "";
      choicesEl.classList.add("hidden");
      nextBtn.disabled = false;
    } else {
      quizSolved = false;
      sceneEl.textContent = "❓";
      textEl.textContent = slide.question;
      choicesEl.classList.remove("hidden");
      choicesEl.innerHTML = "";
      slide.choices.forEach((choice, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lesson-choice";
        btn.textContent = choice;
        btn.addEventListener("click", () => answer(i, btn, slide));
        choicesEl.appendChild(btn);
      });
      nextBtn.disabled = true;
    }
    nextBtn.textContent = index === lesson.slides.length - 1 ? "🎓 レッスン修了！" : "つぎへ ▸";
  }

  function answer(i, btn, slide) {
    if (quizSolved) return;
    if (i === slide.answer) {
      quizSolved = true;
      btn.classList.add("correct");
      choicesEl.querySelectorAll(".lesson-choice").forEach((b) => (b.disabled = true));
      explainEl.textContent = `⭕ ${slide.explain}`;
      explainEl.classList.remove("hidden");
      nextBtn.disabled = false;
    } else {
      btn.classList.add("wrong");
      btn.disabled = true;
      explainEl.textContent = "❌ おしい！ もう一度考えてみよう。";
      explainEl.classList.remove("hidden");
    }
  }

  function next() {
    if (!quizSolved) return;
    if (index >= lesson.slides.length - 1) {
      modal.classList.add("hidden");
      const done = onComplete;
      lesson = null;
      onComplete = null;
      if (done) done();
      return;
    }
    index++;
    renderSlide();
  }

  return { init, start };
})();
