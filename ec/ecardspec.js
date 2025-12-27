/*!
 * Eカード（カイジ）カードゲーム - ブラウザ実装（コアロジック）
 * - 仕様書: Eカード（カイジ）カードゲーム実装仕様書（2025-12-26）
 * - Domain / Application / DTD を意識し、DOM に依存しない純粋ロジックを提供します。
 *
 * UMD 形式: ブラウザでは window.ECardSpec、Node.js では module.exports を提供します。
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ECardSpec = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Domain: enums / errors / data structures
  // ---------------------------------------------------------------------------

  const CardType = Object.freeze({
    EMPEROR: "EMPEROR",
    CITIZEN: "CITIZEN",
    SLAVE: "SLAVE",
  });

  const Side = Object.freeze({
    EMPEROR_SIDE: "EMPEROR_SIDE",
    SLAVE_SIDE: "SLAVE_SIDE",
  });

  const DecisivePair = Object.freeze({
    EMPEROR_VS_CITIZEN: "EMPEROR_VS_CITIZEN", // E vs C
    CITIZEN_VS_SLAVE: "CITIZEN_VS_SLAVE",     // C vs S
    SLAVE_VS_EMPEROR: "SLAVE_VS_EMPEROR",     // S vs E
  });

  const RoundOutcome = Object.freeze({
    DRAW: "DRAW",
    EMPEROR_WIN: "EMPEROR_WIN",
    SLAVE_WIN: "SLAVE_WIN",
  });

  const IllegalType = Object.freeze({
    NOT_IN_HAND: "NOT_IN_HAND",
    AFTER_TERMINAL: "AFTER_TERMINAL",
  });

  class IllegalMoveError extends Error {
    /**
     * @param {string} illegalType - one of IllegalType
     * @param {string} message
     * @param {object} details
     */
    constructor(illegalType, message, details) {
      super(message);
      this.name = "IllegalMoveError";
      this.illegalType = illegalType;
      this.details = details || {};
    }
  }

  /**
   * Hand: マルチセット（カード残数）
   */
  class Hand {
    constructor(counts) {
      this._counts = {
        [CardType.EMPEROR]: 0,
        [CardType.CITIZEN]: 0,
        [CardType.SLAVE]: 0,
        ...(counts || {}),
      };
    }

    static emperorSideHand() {
      return new Hand({ [CardType.EMPEROR]: 1, [CardType.CITIZEN]: 4 });
    }

    static slaveSideHand() {
      return new Hand({ [CardType.SLAVE]: 1, [CardType.CITIZEN]: 4 });
    }

    copy() {
      return new Hand({ ...this._counts });
    }

    remaining(cardType) {
      return this._counts[cardType] || 0;
    }

    has(cardType) {
      return this.remaining(cardType) > 0;
    }

    remove(cardType) {
      if (!this.has(cardType)) {
        throw new Error("Hand.remove called but card is not present: " + cardType);
      }
      this._counts[cardType] -= 1;
    }

    /**
     * @returns {Array<string>} - legal card types with remaining > 0
     */
    availableCards() {
      return Object.keys(this._counts).filter((k) => this._counts[k] > 0);
    }

    toJSON() {
      return { ...this._counts };
    }
  }

  /**
   * decisive_pair_from_cards(emperor_card, slave_card) -> DecisivePair|null
   * - 仕様書の定義: (E vs C), (C vs S), (S vs E) の場合のみ decisive pair を返す。
   */
  function decisivePairFromCards(emperorCard, slaveCard) {
    if (emperorCard === CardType.EMPEROR && slaveCard === CardType.CITIZEN) return DecisivePair.EMPEROR_VS_CITIZEN;
    if (emperorCard === CardType.CITIZEN && slaveCard === CardType.SLAVE) return DecisivePair.CITIZEN_VS_SLAVE;
    if (emperorCard === CardType.EMPEROR && slaveCard === CardType.SLAVE) return DecisivePair.SLAVE_VS_EMPEROR;
    return null; // DRAW や、仕様外（通常は NOT_IN_HAND で弾かれる）
  }

  /**
   * resolve_round(emperor_card, slave_card) -> {outcome, decisivePair}
   */
  function resolveRound(emperorCard, slaveCard) {
    // 仕様: 市民 vs 市民は DRAW（頑健性のため同種はDRAW扱い）
    if (emperorCard === slaveCard) {
      return { outcome: RoundOutcome.DRAW, decisivePair: null };
    }

    const dp = decisivePairFromCards(emperorCard, slaveCard);
    if (!dp) {
      // 仕様外の組み合わせ。通常は NOT_IN_HAND で到達しない想定だが、
      // ここでは三すくみを一般化して勝敗を返す（デバッグ/拡張用）。
      // EMPEROR > CITIZEN, CITIZEN > SLAVE, SLAVE > EMPEROR
      const beats = new Map([
        [CardType.EMPEROR, CardType.CITIZEN],
        [CardType.CITIZEN, CardType.SLAVE],
        [CardType.SLAVE, CardType.EMPEROR],
      ]);
      const emperorWins = beats.get(emperorCard) === slaveCard;
      return {
        outcome: emperorWins ? RoundOutcome.EMPEROR_WIN : RoundOutcome.SLAVE_WIN,
        decisivePair: null,
      };
    }

    // dp がある場合は勝者は一意に決まる
    if (dp === DecisivePair.SLAVE_VS_EMPEROR) {
      return { outcome: RoundOutcome.SLAVE_WIN, decisivePair: dp };
    }
    return { outcome: RoundOutcome.EMPEROR_WIN, decisivePair: dp };
  }

  /**
   * BoutState（Domain）
   */
  function createInitialBoutState(args) {
    return {
      emperorHand: (args && args.emperorHand ? args.emperorHand.copy() : Hand.emperorSideHand()),
      slaveHand: (args && args.slaveHand ? args.slaveHand.copy() : Hand.slaveSideHand()),
      terminal: false,
      winner: null,          // Side.* (決着時)
      decisivePair: null,    // DecisivePair.* (決着時)
      drawCount: 0,
      rounds: [],            // RoundRecord[]
    };
  }

  /**
   * step(state, emperor_card, slave_card) -> new_state
   * - AFTER_TERMINAL: state.terminal==True
   * - NOT_IN_HAND: 提出カードが手札にない
   * - 正常: カード消費 -> 判定 -> 履歴追加 -> 非DRAWなら terminal/winner
   */
  function stepBout(state, emperorCard, slaveCard) {
    if (state.terminal) {
      throw new IllegalMoveError(
        IllegalType.AFTER_TERMINAL,
        "AFTER_TERMINAL: bout is already terminal",
        { terminal: true }
      );
    }
    if (!state.emperorHand.has(emperorCard) || !state.slaveHand.has(slaveCard)) {
      throw new IllegalMoveError(
        IllegalType.NOT_IN_HAND,
        "NOT_IN_HAND: submitted card is not in hand",
        {
          emperorCard,
          slaveCard,
          emperorHand: state.emperorHand.toJSON(),
          slaveHand: state.slaveHand.toJSON(),
        }
      );
    }

    const next = {
      ...state,
      emperorHand: state.emperorHand.copy(),
      slaveHand: state.slaveHand.copy(),
      rounds: state.rounds.slice(),
    };

    // consume
    next.emperorHand.remove(emperorCard);
    next.slaveHand.remove(slaveCard);

    // resolve
    const { outcome, decisivePair } = resolveRound(emperorCard, slaveCard);

    // record
    const roundIndex = next.rounds.length;
    next.rounds.push({
      roundIndex,
      emperorCard,
      slaveCard,
      outcome,
      decisivePair,
    });

    if (outcome === RoundOutcome.DRAW) {
      next.drawCount += 1;
      return next;
    }

    next.terminal = true;
    next.winner = outcome === RoundOutcome.EMPEROR_WIN ? Side.EMPEROR_SIDE : Side.SLAVE_SIDE;
    next.decisivePair = decisivePair || null;
    return next;
  }

  /**
   * Application: BoutRunner（逐次実行）
   */
  class BoutRunner {
    constructor() {
      this.state = createInitialBoutState();
    }

    reset() {
      this.state = createInitialBoutState();
      return this.state;
    }

    step(emperorCard, slaveCard) {
      this.state = stepBout(this.state, emperorCard, slaveCard);
      return this.state;
    }

    /**
     * moves: [{emperorCard, slaveCard}, ...]
     */
    runUntilTerminal(moves) {
      for (const mv of moves) {
        if (this.state.terminal) break;
        this.step(mv.emperorCard, mv.slaveCard);
      }
      return this.state;
    }

    /**
     * 決着後提出（テスト用）
     */
    tryStepAfterTerminal(emperorCard, slaveCard) {
      // this.state.terminal が true であることを期待
      this.state = stepBout(this.state, emperorCard, slaveCard);
      return this.state;
    }
  }

  // ---------------------------------------------------------------------------
  // Application: match engine（役割交代を含む）
  // ---------------------------------------------------------------------------

  class MatchConfig {
    constructor(numBouts, swapInterval, startingEmperorPlayer) {
      this.numBouts = Number(numBouts);
      this.swapInterval = Number(swapInterval);
      this.startingEmperorPlayer = Number(startingEmperorPlayer); // 0 or 1
      if (!Number.isFinite(this.numBouts) || this.numBouts < 1) throw new Error("num_bouts must be >= 1");
      if (!Number.isFinite(this.swapInterval) || this.swapInterval < 1) throw new Error("swap_interval must be >= 1");
      if (this.startingEmperorPlayer !== 0 && this.startingEmperorPlayer !== 1) {
        throw new Error("starting_emperor_player must be 0 or 1");
      }
    }
  }

  /**
   * role_assignment_for_bout(boutIndex) -> {emperorPlayer, slavePlayer}
   * swap_interval 回ごとに皇帝側/奴隷側が入れ替わる。
   */
  function roleAssignmentForBout(config, boutIndex) {
    const block = Math.floor(boutIndex / config.swapInterval);
    const swapped = block % 2 === 1;
    const emperorPlayer = swapped ? 1 - config.startingEmperorPlayer : config.startingEmperorPlayer;
    return { emperorPlayer, slavePlayer: 1 - emperorPlayer };
  }

  /**
   * run_match() 相当の簡易シミュレーション（ブラウザデモ用）
   * - players: [{name, chooseCard(role, hand, rng)}, ...]
   */
  function runMatchSim(config, players, rng) {
    const bouts = [];
    let stoppedByIllegal = null;

    for (let i = 0; i < config.numBouts; i++) {
      const assign = roleAssignmentForBout(config, i);
      const emperorPlayer = players[assign.emperorPlayer];
      const slavePlayer = players[assign.slavePlayer];

      const runner = new BoutRunner();
      let safety = 20;
      try {
        while (!runner.state.terminal && safety-- > 0) {
          const emperorCard = emperorPlayer.chooseCard(Side.EMPEROR_SIDE, runner.state.emperorHand.copy(), rng);
          const slaveCard = slavePlayer.chooseCard(Side.SLAVE_SIDE, runner.state.slaveHand.copy(), rng);
          runner.step(emperorCard, slaveCard);
        }
      } catch (e) {
        if (e instanceof IllegalMoveError) {
          stoppedByIllegal = e.illegalType;
        } else {
          throw e;
        }
      }

      bouts.push({
        boutIndex: i,
        emperorPlayer: assign.emperorPlayer,
        slavePlayer: assign.slavePlayer,
        state: runner.state,
      });

      if (stoppedByIllegal) break;
    }

    return { config, bouts, stoppedByIllegal };
  }

  // ---------------------------------------------------------------------------
  // DTD: obligations / scenario execution / set cover
  // ---------------------------------------------------------------------------

  /**
   * Universe（仕様 10.2）
   */
  function buildUniverse() {
    const u = [];
    for (let k = 0; k <= 3; k++) u.push(`BOUT:${DecisivePair.EMPEROR_VS_CITIZEN}:${k}`);
    for (let k = 0; k <= 3; k++) u.push(`BOUT:${DecisivePair.CITIZEN_VS_SLAVE}:${k}`);
    for (let k = 0; k <= 4; k++) u.push(`BOUT:${DecisivePair.SLAVE_VS_EMPEROR}:${k}`);
    u.push(`ILLEGAL:${IllegalType.NOT_IN_HAND}`);
    u.push(`ILLEGAL:${IllegalType.AFTER_TERMINAL}`);
    u.push(`MATCH:TOTAL12`);
    u.push(`MATCH:TOTAL3`);
    u.push(`MATCH:SWAP_AFTER_3`);
    return u;
  }

  const OBLIGATIONS_UNIVERSE = Object.freeze(buildUniverse());

  function isValidK(decisivePair, k) {
    if (decisivePair === DecisivePair.SLAVE_VS_EMPEROR) return k >= 0 && k <= 4;
    return k >= 0 && k <= 3;
  }

  function makeBoutMovesFor(decisivePair, k) {
    if (!isValidK(decisivePair, k)) throw new Error("Invalid k for decisivePair: " + decisivePair + " k=" + k);
    const moves = [];
    for (let i = 0; i < k; i++) {
      moves.push({ emperorCard: CardType.CITIZEN, slaveCard: CardType.CITIZEN });
    }
    if (decisivePair === DecisivePair.EMPEROR_VS_CITIZEN) {
      moves.push({ emperorCard: CardType.EMPEROR, slaveCard: CardType.CITIZEN });
    } else if (decisivePair === DecisivePair.CITIZEN_VS_SLAVE) {
      moves.push({ emperorCard: CardType.CITIZEN, slaveCard: CardType.SLAVE });
    } else if (decisivePair === DecisivePair.SLAVE_VS_EMPEROR) {
      moves.push({ emperorCard: CardType.EMPEROR, slaveCard: CardType.SLAVE });
    } else {
      throw new Error("Unknown decisivePair: " + decisivePair);
    }
    return moves;
  }

  /**
   * Scenario（X の実体）
   * @typedef {{
   *   id: string,
   *   title: string,
   *   config: {numBouts:number, swapInterval:number, startingEmperorPlayer:number},
   *   bouts: Array<{
   *     moves: Array<{emperorCard:string, slaveCard:string}>,
   *     afterTerminalMove?: {emperorCard:string, slaveCard:string} | null,
   *     note?: string
   *   }>,
   * }} Scenario
   */

  function computeSwapOk(config) {
    // swap_interval ごとの役割交代が "実際に発生する" こと（num_bouts が 충분に大きい）
    if (config.numBouts <= config.swapInterval) return false;
    const mc = new MatchConfig(config.numBouts, config.swapInterval, config.startingEmperorPlayer);
    const a0 = roleAssignmentForBout(mc, 0).emperorPlayer;
    const a1 = roleAssignmentForBout(mc, config.swapInterval).emperorPlayer;
    return a0 !== a1;
  }

  /**
   * execute_scenario(): シナリオ実行 + 被覆計算
   * @param {Scenario} scenario
   * @param {{overhead:number, perRound:number}} costParams
   */
  function executeScenario(scenario, costParams) {
    const overhead = Number(costParams && costParams.overhead != null ? costParams.overhead : 1);
    const perRound = Number(costParams && costParams.perRound != null ? costParams.perRound : 0.2);

    const configObj = {
      numBouts: Number(scenario.config.numBouts),
      swapInterval: Number(scenario.config.swapInterval),
      startingEmperorPlayer: Number(scenario.config.startingEmperorPlayer),
    };

    const covered = new Set();
    let totalSteps = 0;

    // match structure obligations
    if (configObj.numBouts === 12) covered.add("MATCH:TOTAL12");
    if (configObj.numBouts === 3) covered.add("MATCH:TOTAL3");

    const swapOk = computeSwapOk(configObj);
    if (configObj.swapInterval === 3 && swapOk) covered.add("MATCH:SWAP_AFTER_3");

    const boutResults = [];

    for (let i = 0; i < scenario.bouts.length; i++) {
      const boutDef = scenario.bouts[i];
      const runner = new BoutRunner();
      let illegalType = null;

      try {
        for (const mv of boutDef.moves) {
          totalSteps += 1;
          runner.step(mv.emperorCard, mv.slaveCard);
          if (runner.state.terminal) break;
        }
        if (boutDef.afterTerminalMove) {
          // Force AFTER_TERMINAL
          totalSteps += 1;
          runner.tryStepAfterTerminal(boutDef.afterTerminalMove.emperorCard, boutDef.afterTerminalMove.slaveCard);
        }
      } catch (e) {
        if (e instanceof IllegalMoveError) {
          illegalType = e.illegalType;
          covered.add(`ILLEGAL:${illegalType}`);
        } else {
          throw e;
        }
      }

      // bout obligation（決着がある場合）
      if (runner.state.terminal) {
        const dp = runner.state.decisivePair;
        const k = runner.state.drawCount;
        if (dp && Number.isFinite(k)) {
          covered.add(`BOUT:${dp}:${k}`);
        }
      }

      boutResults.push({
        boutIndex: i,
        terminal: runner.state.terminal,
        winner: runner.state.winner,
        decisivePair: runner.state.decisivePair,
        drawCount: runner.state.drawCount,
        illegalType,
        rounds: runner.state.rounds,
      });

      if (illegalType) break; // 仕様: 不正が出たら中断
    }

    const cost = overhead + perRound * totalSteps;

    return {
      scenario,
      cost,
      totalSteps,
      covered: Array.from(covered).sort(),
      boutResults,
      matchObservation: { ...configObj, swapOk },
    };
  }

  // ---------------------------------------------------------------------------
  // Candidate generation (base + random)
  // ---------------------------------------------------------------------------

  // seeded RNG utilities
  function fnv1a32(str) {
    // https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  function makeRng(seed) {
    const s = typeof seed === "number" ? (seed >>> 0) : fnv1a32(String(seed));
    let a = s || 0x12345678;

    function random() {
      // mulberry32
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    function int(min, max) {
      // inclusive min, inclusive max
      const r = random();
      return Math.floor(r * (max - min + 1)) + min;
    }

    function choice(arr) {
      if (!arr.length) throw new Error("choice() on empty array");
      return arr[int(0, arr.length - 1)];
    }

    function normal() {
      // Box-Muller
      let u = 0, v = 0;
      while (u === 0) u = random();
      while (v === 0) v = random();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    return { seed: s, random, int, choice, normal };
  }

  function makeScenarioId(prefix, index) {
    const pad = String(index).padStart(3, "0");
    return `${prefix}_${pad}`;
  }

  function generateBaseCandidates() {
    /** @type {Array<any>} */
    const candidates = [];

    // (1) match12 + swap3: 12 bouts で 12 個の BOUT obligation をまとめて被覆
    const match12 = {
      id: "base_match12_swap3",
      title: "Base: match12 / swap3（複数 obligation をまとめて被覆）",
      config: { numBouts: 12, swapInterval: 3, startingEmperorPlayer: 0 },
      bouts: [],
    };

    const targetPairs = [
      { dp: DecisivePair.EMPEROR_VS_CITIZEN, ks: [0, 1, 2, 3] },
      { dp: DecisivePair.CITIZEN_VS_SLAVE, ks: [0, 1, 2, 3] },
      { dp: DecisivePair.SLAVE_VS_EMPEROR, ks: [0, 1, 2, 3] }, // k=4 は別 candidate で
    ];
    for (const g of targetPairs) {
      for (const k of g.ks) {
        match12.bouts.push({
          moves: makeBoutMovesFor(g.dp, k),
          note: `Cover BOUT:${g.dp}:${k}`,
        });
      }
    }
    // 4 + 4 + 4 = 12
    candidates.push(match12);

    // (2) BOUT:SLAVE_VS_EMPEROR:4 + AFTER_TERMINAL（1 candidate でまとめる）
    candidates.push({
      id: "base_k4_and_after_terminal",
      title: "Base: S vs E (k=4) + AFTER_TERMINAL",
      config: { numBouts: 3, swapInterval: 3, startingEmperorPlayer: 0 },
      bouts: [
        {
          moves: makeBoutMovesFor(DecisivePair.SLAVE_VS_EMPEROR, 4),
          afterTerminalMove: { emperorCard: CardType.CITIZEN, slaveCard: CardType.CITIZEN },
          note: "Cover BOUT:S vs E:k=4 and ILLEGAL:AFTER_TERMINAL",
        },
      ],
    });

    // (3) NOT_IN_HAND
    candidates.push({
      id: "base_not_in_hand",
      title: "Base: NOT_IN_HAND（皇帝側が奴隷を提出）",
      config: { numBouts: 3, swapInterval: 3, startingEmperorPlayer: 0 },
      bouts: [
        {
          moves: [{ emperorCard: CardType.SLAVE, slaveCard: CardType.CITIZEN }], // emperor side has no SLAVE
          note: "Expect ILLEGAL:NOT_IN_HAND",
        },
      ],
    });

    // (4) match3 only（match obligation を単体で確実に被覆）
    candidates.push({
      id: "base_match3_quick",
      title: "Base: match3（TOTAL3 を単体で被覆）",
      config: { numBouts: 3, swapInterval: 3, startingEmperorPlayer: 0 },
      bouts: [
        { moves: makeBoutMovesFor(DecisivePair.EMPEROR_VS_CITIZEN, 0), note: "quick bout" },
        { moves: makeBoutMovesFor(DecisivePair.CITIZEN_VS_SLAVE, 0), note: "quick bout" },
        { moves: makeBoutMovesFor(DecisivePair.SLAVE_VS_EMPEROR, 0), note: "quick bout" },
      ],
    });

    return candidates;
  }

  function simulateRandomBoutMoves(rng) {
    const runner = new BoutRunner();
    const moves = [];
    let safety = 20;
    while (!runner.state.terminal && safety-- > 0) {
      const eChoices = runner.state.emperorHand.availableCards();
      const sChoices = runner.state.slaveHand.availableCards();
      const emperorCard = rng.choice(eChoices);
      const slaveCard = rng.choice(sChoices);
      moves.push({ emperorCard, slaveCard });
      runner.step(emperorCard, slaveCard);
    }
    return { moves, endState: runner.state };
  }

  function generateRandomCandidates(seed, n) {
    const rng = makeRng(seed);
    /** @type {Array<any>} */
    const candidates = [];

    for (let i = 0; i < n; i++) {
      const id = makeScenarioId("rand", i);
      const gaussian = rng.normal(); // stub "noise"
      const pick12 = gaussian > 0; // ざっくり二分
      const numBouts = pick12 ? 12 : 3;
      const swapInterval = rng.choice([1, 2, 3, 4]);
      const startingEmperorPlayer = rng.choice([0, 1]);

      const sc = {
        id,
        title: `Random: noise=${gaussian.toFixed(2)} / num_bouts=${numBouts}`,
        config: { numBouts, swapInterval, startingEmperorPlayer },
        bouts: [],
      };

      // with some probability, inject illegal
      const illegalRoll = rng.random();
      const injectIllegal = illegalRoll < 0.18;
      const illegalType = injectIllegal ? rng.choice([IllegalType.NOT_IN_HAND, IllegalType.AFTER_TERMINAL]) : null;

      const nBoutsToGenerate = injectIllegal ? 1 : rng.int(1, Math.min(numBouts, 6)); // keep it light
      for (let b = 0; b < nBoutsToGenerate; b++) {
        if (illegalType === IllegalType.NOT_IN_HAND) {
          sc.bouts.push({
            moves: [{ emperorCard: CardType.SLAVE, slaveCard: CardType.CITIZEN }], // invalid for emperor side
            note: "Injected ILLEGAL:NOT_IN_HAND",
          });
          break;
        }
        if (illegalType === IllegalType.AFTER_TERMINAL) {
          const { moves } = simulateRandomBoutMoves(rng);
          sc.bouts.push({
            moves,
            afterTerminalMove: { emperorCard: CardType.CITIZEN, slaveCard: CardType.CITIZEN },
            note: "Injected ILLEGAL:AFTER_TERMINAL",
          });
          break;
        }

        const { moves, endState } = simulateRandomBoutMoves(rng);
        sc.bouts.push({
          moves,
          note: `Random bout: ${endState.decisivePair || "?"}, draws=${endState.drawCount}`,
        });
      }

      candidates.push(sc);
    }
    return candidates;
  }

  /**
   * greedy weighted set cover
   * @param {Array<string>} universe
   * @param {Array<{id:string, cost:number, covered:Set<string>, payload:any}>} candidates
   * @param {number|null} budget
   */
  function greedySetCover(universe, candidates, budget) {
    const uncovered = new Set(universe);
    let selected = [];
    let totalCost = 0;

    const remaining = candidates.slice();

    while (uncovered.size > 0) {
      let best = null;
      let bestScore = Infinity;

      for (const c of remaining) {
        let gain = 0;
        for (const ob of c.covered) {
          if (uncovered.has(ob)) gain += 1;
        }
        if (gain === 0) continue;

        const score = c.cost / gain; // lower is better
        if (score < bestScore) {
          bestScore = score;
          best = c;
        }
      }

      if (!best) break;

      if (budget != null && totalCost + best.cost > budget) {
        // remove best from remaining and continue searching
        const idx = remaining.indexOf(best);
        if (idx >= 0) remaining.splice(idx, 1);
        continue;
      }

      selected.push(best);
      totalCost += best.cost;
      for (const ob of best.covered) uncovered.delete(ob);

      // remove it from remaining
      const idx = remaining.indexOf(best);
      if (idx >= 0) remaining.splice(idx, 1);
    }


    // Optional pruning: remove redundant scenarios (keeps coverage, reduces cost)
    function coversAll(sel) {
      const cov = new Set();
      for (const it of sel) {
        for (const ob of it.covered) cov.add(ob);
      }
      for (const ob of universe) {
        if (!cov.has(ob)) return false;
      }
      return true;
    }

    if (uncovered.size === 0) {
      let changed = true;
      while (changed) {
        changed = false;
        for (let i = 0; i < selected.length; i++) {
          const trial = selected.slice(0, i).concat(selected.slice(i + 1));
          if (coversAll(trial)) {
            selected = trial;
            totalCost = selected.reduce((sum, it) => sum + it.cost, 0);
            changed = true;
            break;
          }
        }
      }
    }

    // Recompute uncovered (for consistency after pruning)
    const uncoveredAfter = new Set(universe);
    for (const it of selected) {
      for (const ob of it.covered) uncoveredAfter.delete(ob);
    }

    return { selected, totalCost, uncovered: Array.from(uncoveredAfter).sort() };
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  return Object.freeze({
    // Domain
    CardType,
    Side,
    DecisivePair,
    RoundOutcome,
    IllegalType,
    IllegalMoveError,
    Hand,
    decisivePairFromCards,
    resolveRound,
    createInitialBoutState,
    stepBout,

    // Application
    BoutRunner,
    MatchConfig,
    roleAssignmentForBout,
    runMatchSim,

    // DTD
    OBLIGATIONS_UNIVERSE,
    makeBoutMovesFor,
    executeScenario,
    generateBaseCandidates,
    generateRandomCandidates,
    greedySetCover,

    // Utils
    makeRng,
  });
});
