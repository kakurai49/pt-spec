# S-GP（導線 / UI）

```md
TITLE: [SIRIUS][S-GP][P0] ホームにRLコース（SIRIUS）を追加 + rl/ の scope/index/overview/spec を作成
LABELS: course:sirius, S-GP, priority:P0
S_COLUMN: S-GP
DEPENDS_ON: Issue00（推奨）
EST_SIZE: M
A(S) COVERED: gp.01, gp.02

## S（Spec）/ 仕様
目的：
- index.html に RLコース（SIRIUS）のカードを追加し、既存の世界観/導線（Scope→Index→Overview→Spec）に合流させる。
- rl/ 配下に最低限の4ページを作り、以後の環境/課題/デモを載せる土台を作る。

変更対象：
- index.html
  - COURSESセクションに新コースカード追加（見た目は既存コースに合わせる）
  - Shortcuts（右側）に SIRIUS を追加（任意だが推奨）
- 新規:
  - rl/scope.html
  - rl/index.html
  - rl/overview.html
  - rl/spec.html

受け入れ基準（Acceptance Criteria）：
- [ ] index.html のコース一覧に SIRIUS が表示される
- [ ] SIRIUSカードから4リンクが全て相対パスで開ける
- [ ] 各 rl/*.html に「Homeへ戻る」導線と、4ページ間のナビがある
- [ ] モバイル表示でも崩れない（既存CSS/レイアウト踏襲）

## H（How）/ Codex Prompt（実装指示）
~~~text
あなたはこの静的サイトに新コースを追加します。既存のHTML/CSS/雰囲気を崩さずに、SIRIUS（強化学習）コース導線を作ってください。

手順：
1) リポジトリ直下の index.html を開き、既存の <article class="course"> を1つ選び、同じ構造で新コースカードを追加する。
   - コース名: SIRIUS
   - 目安: 「1日1時間 / 14日」（暫定）
   - 説明: 「強化学習（Bandit→MDP→Q-learning）を、GitHub(PR)/テスト採点で攻略するコース」程度
   - 4リンク: rl/scope.html, rl/index.html, rl/overview.html, rl/spec.html
   - 見た目: 既存のcourseカードと同じクラス/構造を踏襲。色は既存変数を使い新規CSS変数を増やさない。
2) Shortcuts（右側の<ul>）にも SIRIUS を追加（可能なら）。リンクは rl/index.html。
3) rl/ ディレクトリを作成し、4ファイルを追加する。
   - 既存コースの各ページ（bt7/scope.html, qr/index.html 等）があるなら、同じ骨格（header/nav/section）をコピーしてタイトル/本文だけ差し替える。
   - 4ページ共通で上部にナビ（Scope/Index/Overview/Spec）と Home リンクを置く。
4) rl/index.html には GitHub運用（Issue→PR→テスト採点）を短く説明し、Mission一覧（プレースホルダ）を置く。
5) すべてのリンクが相対パスで正しいことを確認する。

注意：
- 既存コース（VEGA/ALTAIR/DENEB/SPICA/RIGEL）やCSSを壊さない。
- まずはプレースホルダでOKだが、見出し構造（h1/h2）と導線は必須。
~~~ 

## Definition of Done
- [ ] index.html にSIRIUSカード追加
- [ ] rl/ に4ページ追加（最低限の内容 + ナビ）
- [ ] リンク動作OK
```

```md
TITLE: [SIRIUS][S-GP][P1] rl/spec.html に “動く仕様書” デモ（Bandit推奨）を追加
LABELS: course:sirius, S-GP, priority:P1
S_COLUMN: S-GP
DEPENDS_ON: Issue01（+ Issue04/05 推奨）
EST_SIZE: M
A(S) COVERED: gp.03, env.ux.01

## S（Spec）/ 仕様
目的：
- 既存の「Specで動くものを手に入れる」体験を、RLコースでも成立させる。
- “学習の見える化” をブラウザ単体で提供する（ビルド不要）。

デモ要件（Bandit推奨）：
- 腕数Kと確率pをUIで設定
- アルゴリズムを選べる（最低2種類以上：random/ε-greedy/UCB/TS など）
- 実行すると cumulative reward / cumulative regret が見える（簡易チャート）

受け入れ基準：
- [ ] rl/spec.html をローカルで開くだけで動く（外部CDNなし）
- [ ] UI操作→実行→結果が画面に出る
- [ ] 上部ナビ（Scope/Index/Overview/Spec）と Home リンクがある
- [ ] 動作が重くない（1回実行が短時間）

## H（How）/ Codex Prompt（実装指示）
~~~text
あなたは rl/spec.html にブラウザデモを実装します。外部ライブラリ/CDNは禁止。静的HTML+JSのみ。

手順：
1) rl/spec.html を開き、既存サイトの雰囲気（ダーク/ネオン/カード）に馴染むUI領域を作る。
2) Banditデモを実装する（推奨）：
   - seedable RNG（例：mulberry32など）をJS内で実装
   - Bernoulli bandit：K本の腕、p[i]で 0/1 報酬
   - 方策：random と epsilon-greedy（最低2種類）。余裕があればUCB/Thompsonも追加。
   - step数：既定 500（UIで変更可）
3) 出力：
   - cumulative reward
   - cumulative regret（best_p - chosen_p の累積）
   - 可能なら「どの腕を何回引いたか」のカウントも表示
4) 描画は canvas か、divで簡易棒グラフでもOK（見やすさ優先）。
5) 既存導線：
   - 上部ナビ（Scope/Index/Overview/Spec）と Home リンクを必ず置く。
6) ブラウザで動作確認：pを変えると結果が変わること。

注意：
- ページは軽量にする（ループは500〜2000程度）。
- コードはページ内に完結（将来分離できるよう関数化はする）。
~~~ 

## Definition of Done
- [ ] rl/spec.html に動くデモ
- [ ] UI操作で結果が変わる
- [ ] 導線OK
```
