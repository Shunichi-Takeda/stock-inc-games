/**
 * API TOWN — 施設「カプセルAPI」
 * 給料（コイン）の使い道。POST /gacha でWebトリビアカードを収集する。
 * 学習おまけ: 402 Payment Required / 排出率の確認（仕様を読む習慣）
 */
window.AT = window.AT || {};

AT.gachaCost = 100;
AT.gachaDupRefund = 20;
AT.gachaExchangeCost = 5; // ダブり救済: チケット5枚で未入手カードと確定交換

AT.companies.gacha = {
  id: "gacha",
  name: "カプセルAPI",
  emoji: "🎰",
  tagline: "稼いだコインでWebトリビアカードを集めよう",
  baseUrl: "https://api.capsule.example",
  character: { name: "店主 ガチャポン", emoji: "🤹" },
  docs: [
    {
      method: "GET",
      path: "/rates",
      summary: "排出率を確認する",
      desc: "カプセル1回の料金と、レアリティごとの排出率を返します。回す前に仕様を確認するのがプロ（実世界のガチャも確率表記が義務です）。",
      params: [],
      example: { cost: 100, rates: { N: "70%", R: "25%", SR: "5%" }, total_cards: 20 },
    },
    {
      method: "POST",
      path: "/gacha",
      summary: "カプセルを1回まわす",
      desc: "1回100コイン。所持コインから支払い、Webトリビアカードが1枚出てきます。新規カードなら 201 Created。コインが足りないと 402 Payment Required。ダブったら20コイン返金＋カプセルチケット1枚（救済用）がもらえます。",
      params: [],
      example: {
        card: { id: "TR-002", rarity: "N", title: "Cookieの語源はお菓子", text: "…" },
        is_new: true,
        coins_left: 900,
        capsule_tickets: 2,
      },
    },
    {
      method: "POST",
      path: "/exchange",
      summary: "チケットで未入手カードと確定交換する（天井）",
      desc: "カプセルチケット5枚を消費して、まだ持っていないカードから必ず1枚を入手します（レアリティはランダム）。運が悪くてもコンプリートできる救済窓口です。チケットが足りないと 400。すでにコンプ済みなら 409。",
      params: [],
      example: {
        card: { id: "TR-018", rarity: "SR", title: "418 I'm a teapot", text: "…" },
        capsule_tickets: 0,
      },
    },
    {
      method: "GET",
      path: "/collection",
      summary: "集めたカードの一覧を取得する",
      desc: "あなたのコレクションを返します。集めたカードの全文もここで読めます。コンプリートを目指しましょう。",
      params: [],
      example: { owned: 3, total: 20, cards: [{ id: "TR-002", rarity: "N", title: "…" }] },
    },
  ],
};

function atGachaPickCard() {
  const roll = Math.random();
  let rarity = "N";
  if (roll < AT.gachaRates.SR) rarity = "SR";
  else if (roll < AT.gachaRates.SR + AT.gachaRates.R) rarity = "R";
  const pool = AT.triviaCards.filter((c) => c.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

AT.server.register("gacha", "GET", "/rates", () => ({
  status: 200,
  body: {
    cost: AT.gachaCost,
    currency: "APIコイン",
    rates: { N: "70%", R: "25%", SR: "5%" },
    total_cards: AT.triviaCards.length,
    duplicate_refund: AT.gachaDupRefund,
    pity: `ダブり1回につきカプセルチケット1枚。${AT.gachaExchangeCost}枚集めて POST /exchange すると、未入手カードと確定交換（天井）`,
    message: "排出率は正直に表記しています。実世界のガチャも確率表記がルールです。",
  },
}));

AT.server.register("gacha", "POST", "/gacha", () => {
  const save = AT.save.get();
  if (save.coins < AT.gachaCost) {
    return {
      status: 402,
      body: {
        error: "payment_required",
        message: `コインが足りません（1回 ${AT.gachaCost} コイン、所持 ${save.coins} コイン）。街で仕事をして稼いできてください。`,
      },
    };
  }
  save.coins -= AT.gachaCost;
  save.cards = save.cards || [];
  save.tickets = save.tickets || 0;
  const card = atGachaPickCard();
  const isNew = !save.cards.includes(card.id);
  let refund = 0;
  if (isNew) {
    save.cards.push(card.id);
  } else {
    refund = AT.gachaDupRefund;
    save.coins += refund;
    save.tickets += 1;
  }
  AT.save.write();
  return {
    status: 201,
    body: {
      message: isNew
        ? `カプセル、ポンッ！ ${card.rarity}カード「${card.title}」を入手しました！`
        : `カプセル、ポンッ！ …おっと「${card.title}」はダブりです。${refund}コイン返金＋チケット1枚を進呈しました（${AT.gachaExchangeCost}枚で確定交換）。`,
      card,
      is_new: isNew,
      duplicate_refund: refund,
      capsule_tickets: save.tickets,
      coins_left: save.coins,
    },
  };
});

AT.server.register("gacha", "POST", "/exchange", () => {
  const save = AT.save.get();
  save.cards = save.cards || [];
  save.tickets = save.tickets || 0;
  const unowned = AT.triviaCards.filter((c) => !save.cards.includes(c.id));
  if (unowned.length === 0) {
    return {
      status: 409,
      body: {
        error: "already_complete",
        message: "すでに全カードをコンプリートしています！ 交換できるカードはありません。",
      },
    };
  }
  if (save.tickets < AT.gachaExchangeCost) {
    return {
      status: 400,
      body: {
        error: "not_enough_tickets",
        message: `カプセルチケットが足りません（必要 ${AT.gachaExchangeCost} 枚、所持 ${save.tickets} 枚）。チケットはダブりが出ると1枚もらえます。`,
      },
    };
  }
  save.tickets -= AT.gachaExchangeCost;
  const card = unowned[Math.floor(Math.random() * unowned.length)];
  save.cards.push(card.id);
  AT.save.write();
  return {
    status: 201,
    body: {
      message: `交換成立！ 未入手の ${card.rarity}カード「${card.title}」を確定入手しました。`,
      card,
      is_new: true,
      capsule_tickets: save.tickets,
    },
  };
});

AT.server.register("gacha", "GET", "/collection", () => {
  const save = AT.save.get();
  const owned = save.cards || [];
  const cards = AT.triviaCards.filter((c) => owned.includes(c.id));
  return {
    status: 200,
    body: {
      owned: cards.length,
      total: AT.triviaCards.length,
      complete: cards.length === AT.triviaCards.length,
      capsule_tickets: save.tickets || 0,
      cards,
      message:
        cards.length === AT.triviaCards.length
          ? "コンプリートおめでとうございます！ あなたはもう歩くWeb雑学辞典です。"
          : `コレクション ${cards.length} / ${AT.triviaCards.length}。コンプリートを目指しましょう！`,
    },
  };
});
