/* UI glue for index.html
 * - Depends on window.ECardSpec (ecardspec.js)
 */

(function () {
  "use strict";

  const Spec = window.ECardSpec;
  if (!Spec) {
    alert("ECardSpec が読み込めませんでした（ecardspec.js）");
    return;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const $ = (sel) => document.querySelector(sel);

  const cardJP = {
    [Spec.CardType.EMPEROR]: "皇帝",
    [Spec.CardType.CITIZEN]: "市民",
    [Spec.CardType.SLAVE]: "奴隷",
  };

  const sideJP = {
    [Spec.Side.EMPEROR_SIDE]: "皇帝側",
    [Spec.Side.SLAVE_SIDE]: "奴隷側",
  };

  const decisiveJP = {
    [Spec.DecisivePair.EMPEROR_VS_CITIZEN]: "皇帝 vs 市民（皇帝勝ち）",
    [Spec.DecisivePair.CITIZEN_VS_SLAVE]: "市民 vs 奴隷（市民勝ち）",
    [Spec.DecisivePair.SLAVE_VS_EMPEROR]: "奴隷 vs 皇帝（奴隷勝ち）",
  };

  function fmtCard(ct) {
    return cardJP[ct] || ct;
  }

  function fmtDecisive(dp) {
    return dp ? (decisiveJP[dp] || dp) : "-";
  }

  function fmtWinnerSide(w) {
    return w ? (sideJP[w] || w) : "-";
  }

  function htmlEscape(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function createBadge(label, count) {
    const div = document.createElement("div");
    div.className = "badge";
    div.innerHTML = `<b>${htmlEscape(label)}</b><span class="muted">× ${count}</span>`;
    return div;
  }

  function pushLog(el, line) {
    el.textContent += line + "\n";
    el.scrollTop = el.scrollHeight;
  }

  function showToast(title, message, ok) {
    const area = $("#toastArea");
    const div = document.createElement("div");
    div.className = "toast " + (ok ? "ok" : "bad");
    div.innerHTML = `<div class="title">${htmlEscape(title)}</div><div>${htmlEscape(message)}</div>`;
    area.prepend(div);
    // auto-remove
    setTimeout(() => div.remove(), 5000);
  }

  // ---------------------------------------------------------------------------
  // Bout UI
  // ---------------------------------------------------------------------------

  const emperorSelect = $("#emperorSelect");
  const slaveSelect = $("#slaveSelect");
  const boutStepBtn = $("#boutStepBtn");
  const boutResetBtn = $("#boutResetBtn");
  const illegalNotInHandBtn = $("#illegalNotInHandBtn");
  const illegalAfterTerminalBtn = $("#illegalAfterTerminalBtn");

  const emperorHandView = $("#emperorHandView");
  const slaveHandView = $("#slaveHandView");

  const boutStatusText = $("#boutStatusText");
  const boutDrawCount = $("#boutDrawCount");
  const boutDecisivePair = $("#boutDecisivePair");
  const boutWinner = $("#boutWinner");
  const boutHistory = $("#boutHistory");
  const boutLog = $("#boutLog");

  const boutRunner = new Spec.BoutRunner();

  function rebuildCardSelect(selectEl, hand, allowed) {
    const prev = selectEl.value;
    selectEl.innerHTML = "";

    for (const cardType of allowed) {
      const count = hand.remaining(cardType);
      const opt = document.createElement("option");
      opt.value = cardType;
      opt.textContent = `${fmtCard(cardType)}（残 ${count}）`;
      opt.disabled = count <= 0;
      selectEl.appendChild(opt);
    }

    // try keep selection
    if (prev) {
      const found = Array.from(selectEl.options).find((o) => o.value === prev && !o.disabled);
      if (found) selectEl.value = prev;
    }
    // fallback to first enabled
    if (selectEl.selectedOptions.length === 0 || selectEl.selectedOptions[0].disabled) {
      const firstEnabled = Array.from(selectEl.options).find((o) => !o.disabled);
      if (firstEnabled) selectEl.value = firstEnabled.value;
    }
  }

  function renderHandView(el, hand) {
    el.innerHTML = "";
    const entries = [
      { ct: Spec.CardType.EMPEROR, label: "皇帝" },
      { ct: Spec.CardType.CITIZEN, label: "市民" },
      { ct: Spec.CardType.SLAVE, label: "奴隷" },
    ];
    for (const e of entries) {
      const c = hand.remaining(e.ct);
      if (c > 0) el.appendChild(createBadge(e.label, c));
    }
  }

  function renderHistory(state) {
    boutHistory.innerHTML = "";
    if (!state.rounds.length) {
      const div = document.createElement("div");
      div.className = "history-item";
      div.innerHTML = `<b>まだ履歴がありません</b><div class="meta">カードを選んで step してください</div>`;
      boutHistory.appendChild(div);
      return;
    }

    for (const rr of state.rounds) {
      const div = document.createElement("div");
      div.className = "history-item";
      const outcome = rr.outcome === Spec.RoundOutcome.DRAW ? "DRAW" : "決着";
      const dpText = rr.decisivePair ? fmtDecisive(rr.decisivePair) : "-";
      div.innerHTML = `
        <b>Round ${rr.roundIndex + 1}: ${fmtCard(rr.emperorCard)} vs ${fmtCard(rr.slaveCard)} → ${outcome}</b>
        <div class="meta">decisivePair: ${htmlEscape(dpText)}</div>
      `;
      boutHistory.appendChild(div);
    }
  }

  function updateBoutUI() {
    const s = boutRunner.state;

    rebuildCardSelect(emperorSelect, s.emperorHand, [Spec.CardType.EMPEROR, Spec.CardType.CITIZEN]);
    rebuildCardSelect(slaveSelect, s.slaveHand, [Spec.CardType.SLAVE, Spec.CardType.CITIZEN]);

    renderHandView(emperorHandView, s.emperorHand);
    renderHandView(slaveHandView, s.slaveHand);

    boutDrawCount.textContent = String(s.drawCount);
    boutDecisivePair.textContent = fmtDecisive(s.decisivePair);
    boutWinner.textContent = fmtWinnerSide(s.winner);

    boutStatusText.textContent = s.terminal ? "決着（terminal=true）" : "進行中（terminal=false）";

    renderHistory(s);

    illegalAfterTerminalBtn.disabled = !s.terminal;
  }

  function safeStep(emperorCard, slaveCard, label) {
    try {
      boutRunner.step(emperorCard, slaveCard);
      pushLog(boutLog, `[OK] ${label}: ${emperorCard} vs ${slaveCard}`);
      showToast("OK", label, true);
    } catch (e) {
      if (e instanceof Spec.IllegalMoveError) {
        const msg = `${e.illegalType}: ${e.message}`;
        pushLog(boutLog, `[ILLEGAL] ${label}: ${msg}`);
        showToast("ILLEGAL", msg, false);
      } else {
        pushLog(boutLog, `[ERROR] ${label}: ${String(e)}`);
        showToast("ERROR", String(e), false);
      }
    } finally {
      updateBoutUI();
    }
  }

  boutStepBtn.addEventListener("click", () => {
    const emperorCard = emperorSelect.value;
    const slaveCard = slaveSelect.value;
    safeStep(emperorCard, slaveCard, "step");
  });

  boutResetBtn.addEventListener("click", () => {
    boutRunner.reset();
    boutLog.textContent = "";
    $("#toastArea").innerHTML = "";
    showToast("RESET", "Bout をリセットしました", true);
    updateBoutUI();
  });

  illegalNotInHandBtn.addEventListener("click", () => {
    // 皇帝側に SLAVE は無い
    safeStep(Spec.CardType.SLAVE, Spec.CardType.CITIZEN, "NOT_IN_HAND テスト");
  });

  illegalAfterTerminalBtn.addEventListener("click", () => {
    // ここは terminal 後のみ有効
    try {
      boutRunner.tryStepAfterTerminal(Spec.CardType.CITIZEN, Spec.CardType.CITIZEN);
      pushLog(boutLog, `[UNEXPECTED] AFTER_TERMINAL did not throw`);
      showToast("UNEXPECTED", "AFTER_TERMINAL が投げられませんでした", false);
    } catch (e) {
      if (e instanceof Spec.IllegalMoveError) {
        const msg = `${e.illegalType}: ${e.message}`;
        pushLog(boutLog, `[ILLEGAL] AFTER_TERMINAL テスト: ${msg}`);
        showToast("ILLEGAL", msg, false);
      } else {
        pushLog(boutLog, `[ERROR] AFTER_TERMINAL テスト: ${String(e)}`);
        showToast("ERROR", String(e), false);
      }
    } finally {
      updateBoutUI();
    }
  });

  updateBoutUI();

  // ---------------------------------------------------------------------------
  // Match UI
  // ---------------------------------------------------------------------------

  const numBoutsInput = $("#numBoutsInput");
  const swapIntervalInput = $("#swapIntervalInput");
  const startingEmperorSelect = $("#startingEmperorSelect");
  const strategyA = $("#strategyA");
  const strategyB = $("#strategyB");
  const runMatchBtn = $("#runMatchBtn");
  const matchClearBtn = $("#matchClearBtn");
  const matchTableBody = $("#matchTableBody");
  const matchSummary = $("#matchSummary");

  function makeStrategy(kind) {
    if (kind === "citizenFirst") {
      return function (role, hand, rng) {
        if (hand.has(Spec.CardType.CITIZEN)) return Spec.CardType.CITIZEN;
        // special
        if (role === Spec.Side.EMPEROR_SIDE) return Spec.CardType.EMPEROR;
        return Spec.CardType.SLAVE;
      };
    }
    if (kind === "specialFirst") {
      return function (role, hand, rng) {
        const special = role === Spec.Side.EMPEROR_SIDE ? Spec.CardType.EMPEROR : Spec.CardType.SLAVE;
        if (hand.has(special)) return special;
        return Spec.CardType.CITIZEN;
      };
    }
    // random
    return function (role, hand, rng) {
      const avail = hand.availableCards();
      return rng.choice(avail);
    };
  }

  function renderMatchResult(sim) {
    matchTableBody.innerHTML = "";

    let winsA = 0;
    let winsB = 0;
    let draws = 0;

    for (const b of sim.bouts) {
      const s = b.state;
      const emperorP = b.emperorPlayer === 0 ? "A" : "B";
      const slaveP = b.slavePlayer === 0 ? "A" : "B";

      let winnerText = "-";
      if (s.terminal) {
        if (s.winner === Spec.Side.EMPEROR_SIDE) {
          winnerText = `皇帝側(${emperorP})`;
          if (b.emperorPlayer === 0) winsA++; else winsB++;
        } else {
          winnerText = `奴隷側(${slaveP})`;
          if (b.slavePlayer === 0) winsA++; else winsB++;
        }
      } else {
        draws++;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${b.boutIndex + 1}</td>
        <td>プレイヤー${emperorP}</td>
        <td>プレイヤー${slaveP}</td>
        <td>${htmlEscape(winnerText)}</td>
        <td>${s.drawCount}</td>
        <td>${htmlEscape(s.decisivePair || "-")}</td>
      `;
      matchTableBody.appendChild(tr);
    }

    const stopped = sim.stoppedByIllegal ? `（不正で中断: ${sim.stoppedByIllegal}）` : "";
    matchSummary.textContent = `結果: A勝ち=${winsA}, B勝ち=${winsB}, 実行bout数=${sim.bouts.length}/${sim.config.numBouts} ${stopped}`;
  }

  runMatchBtn.addEventListener("click", () => {
    try {
      const cfg = new Spec.MatchConfig(
        Number(numBoutsInput.value),
        Number(swapIntervalInput.value),
        Number(startingEmperorSelect.value)
      );
      const rng = Spec.makeRng(Date.now() >>> 0);

      const players = [
        { name: "A", chooseCard: makeStrategy(strategyA.value) },
        { name: "B", chooseCard: makeStrategy(strategyB.value) },
      ];

      const sim = Spec.runMatchSim(cfg, players, rng);
      renderMatchResult(sim);
    } catch (e) {
      alert("Match 実行に失敗: " + e.message);
    }
  });

  matchClearBtn.addEventListener("click", () => {
    matchTableBody.innerHTML = "";
    matchSummary.textContent = "";
  });

  // ---------------------------------------------------------------------------
  // DTD UI
  // ---------------------------------------------------------------------------

  const seedInput = $("#seedInput");
  const nRandomInput = $("#nRandomInput");
  const overheadInput = $("#overheadInput");
  const perRoundInput = $("#perRoundInput");
  const budgetInput = $("#budgetInput");

  const generateSuiteBtn = $("#generateSuiteBtn");
  const dtdClearBtn = $("#dtdClearBtn");

  const universeList = $("#universeList");
  const suiteSummary = $("#suiteSummary");
  const suiteList = $("#suiteList");
  const suiteJsonPreview = $("#suiteJsonPreview");
  const downloadSuiteBtn = $("#downloadSuiteBtn");

  const candidateTableBody = $("#candidateTableBody");

  const universe = Spec.OBLIGATIONS_UNIVERSE.slice();
  const universeChip = new Map();
  let lastSuiteJson = null;

  function renderUniverseChips() {
    universeList.innerHTML = "";
    universeChip.clear();
    for (const ob of universe) {
      const chip = document.createElement("div");
      chip.className = "chip off";
      chip.innerHTML = `<code>${htmlEscape(ob)}</code>`;
      universeList.appendChild(chip);
      universeChip.set(ob, chip);
    }
  }

  function setUniverseCoverage(coveredSet) {
    for (const ob of universe) {
      const chip = universeChip.get(ob);
      if (!chip) continue;
      const on = coveredSet.has(ob);
      chip.className = "chip " + (on ? "on" : "off");
    }
  }

  function renderCandidateTable(rows) {
    candidateTableBody.innerHTML = "";
    for (const r of rows) {
      const tr = document.createElement("tr");
      const top = r.coveredPreview.join(", ");
      tr.innerHTML = `
        <td><code>${htmlEscape(r.id)}</code></td>
        <td>${r.cost.toFixed(2)}</td>
        <td>${r.coveredCount}</td>
        <td>${htmlEscape(top)}</td>
      `;
      candidateTableBody.appendChild(tr);
    }
  }

  function renderSuite(selected, totalCost, uncovered) {
    suiteList.innerHTML = "";

    const coveredAll = uncovered.length === 0;
    suiteSummary.textContent = coveredAll
      ? `✅ 完全被覆（${universe.length} / ${universe.length}） / totalCost=${totalCost.toFixed(2)} / シナリオ数=${selected.length}`
      : `⚠️ 未被覆あり（未被覆=${uncovered.length}） / totalCost=${totalCost.toFixed(2)} / シナリオ数=${selected.length}`;

    for (const item of selected) {
      const div = document.createElement("div");
      div.className = "history-item";
      const coveredArr = Array.from(item.covered).sort();
      div.innerHTML = `
        <b>${htmlEscape(item.id)}</b>
        <div class="meta">cost=${item.cost.toFixed(2)} / covered=${coveredArr.length}</div>
        <div class="meta">${htmlEscape(coveredArr.join(", "))}</div>
      `;
      suiteList.appendChild(div);
    }

    if (!coveredAll) {
      const warn = document.createElement("div");
      warn.className = "history-item";
      warn.innerHTML = `<b>未被覆</b><div class="meta">${htmlEscape(uncovered.join(", "))}</div>`;
      suiteList.appendChild(warn);
    }
  }

  function makeDownload(filename, text) {
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function buildSuiteJson(selectedItems, universeCovered) {
    return {
      generated_at: new Date().toISOString(),
      universe: universe,
      expected_covered: Array.from(universeCovered).sort(),
      scenarios: selectedItems.map((it) => ({
        id: it.id,
        cost: it.cost,
        covered: Array.from(it.covered).sort(),
        scenario: it.payload.scenario,
      })),
    };
  }

  generateSuiteBtn.addEventListener("click", () => {
    try {
      const seed = Number(seedInput.value);
      const nRandom = Number(nRandomInput.value);
      const overhead = Number(overheadInput.value);
      const perRound = Number(perRoundInput.value);
      const budget = budgetInput.value === "" ? null : Number(budgetInput.value);

      const costParams = { overhead, perRound };

      const base = Spec.generateBaseCandidates();
      const random = Spec.generateRandomCandidates(seed, nRandom);
      const all = base.concat(random);

      // Execute all candidates => compute covered + cost
      const executed = all.map((sc) => Spec.executeScenario(sc, costParams));

      const candidateObjs = executed.map((ex) => ({
        id: ex.scenario.id,
        cost: ex.cost,
        covered: new Set(ex.covered),
        payload: ex,
      }));

      const setcover = Spec.greedySetCover(universe, candidateObjs, budget);

      const coveredSet = new Set();
      for (const s of setcover.selected) {
        for (const ob of s.covered) coveredSet.add(ob);
      }

      setUniverseCoverage(coveredSet);

      // suite render
      renderSuite(setcover.selected, setcover.totalCost, setcover.uncovered);

      // candidate table (top 40 by coverage/cost for readability)
      const rows = candidateObjs
        .map((c) => {
          const arr = Array.from(c.covered);
          const preview = arr.filter((x) => x.startsWith("BOUT:")).slice(0, 2).concat(arr.filter((x) => x.startsWith("ILLEGAL:")).slice(0, 1));
          return { id: c.id, cost: c.cost, coveredCount: arr.length, coveredPreview: preview.length ? preview : arr.slice(0, 2) };
        })
        .sort((a, b) => (b.coveredCount - a.coveredCount) || (a.cost - b.cost))
        .slice(0, 40);
      renderCandidateTable(rows);

      // JSON preview + download
      const suiteJson = buildSuiteJson(setcover.selected, coveredSet);
      lastSuiteJson = JSON.stringify(suiteJson, null, 2);
      suiteJsonPreview.value = lastSuiteJson;
      downloadSuiteBtn.disabled = false;

      showToast("DTD", "スイート生成が完了しました", true);
    } catch (e) {
      console.error(e);
      showToast("DTD ERROR", e.message || String(e), false);
      alert("DTD 生成に失敗: " + (e.message || String(e)));
    }
  });

  downloadSuiteBtn.addEventListener("click", () => {
    if (!lastSuiteJson) return;
    makeDownload("generated_suite.json", lastSuiteJson);
  });

  dtdClearBtn.addEventListener("click", () => {
    suiteSummary.textContent = "";
    suiteList.innerHTML = "";
    suiteJsonPreview.value = "";
    candidateTableBody.innerHTML = "";
    downloadSuiteBtn.disabled = true;
    lastSuiteJson = null;
    setUniverseCoverage(new Set());
  });

  renderUniverseChips();
  setUniverseCoverage(new Set());
})();
