<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

marked.setOptions({
  breaks: true,
  gfm: true
})

function renderMarkdown(text) {
  if (!text) return ''
  return marked.parse(text)
}

const props = defineProps({
  skillId: { type: String, required: true }
})

const skillData = {
  'concretization-abstraction': {
    title: '具体化・抽象化',
    description: '要件を適切な粒度に分解し、共通点を抽出して再構成するスキル',
    items: [
      {
        name: '粒度調整',
        description: '相手や目的に応じて情報の詳細レベルを変える',
        example: 'マネージャーには「認証基盤の移行完了」、開発者には「OAuth 2.0 + PKCE 移行完了、Session Cookie は 3/1 廃止」',
        tip: '報告先のロールと意思決定に必要な情報量を意識する'
      },
      {
        name: 'MECE分解',
        description: '漏れなくダブりなく要素を分解する',
        example: '障害調査を【ネットワーク層】【アプリ層】【DB層】【インフラ層】で切る',
        tip: '分解した要素同士に重複がないか、抜けている観点がないか確認する'
      },
      {
        name: '抽象化による共通化',
        description: '個別事象から共通パターンを抽出して再利用可能にする',
        example: '3つの障害事例から「外部API依存サービスの耐障害性不足」という共通課題を抽出',
        tip: '具体→抽象→具体 のサイクルで思考する'
      },
      {
        name: 'タスク分解',
        description: '大きな作業を実行可能な小さい単位に分割し、依存関係と優先度を明確にする',
        example: '「認証機能の実装」→\n1. DBテーブル作成（ブロッカーなし）\n2. 認証APIエンドポイント（1に依存）\n3. JWT検証ミドルウェア（2に依存）\n4. ログインUI（ブロッカーなし、2と並行可）\n5. E2Eテスト（3,4に依存）',
        tip: '1タスク = 1PR にできる粒度が目安。依存関係を明示して並行作業を可能にする'
      },
      {
        name: 'WBS（作業分解構成図）',
        description: '成果物ベースでツリー構造に分解し、末端をアクション可能な粒度にする',
        example: '認証機能\n├── バックエンド（DB設計, API, ミドルウェア）\n├── フロントエンド（ログイン画面, 状態管理, ガード）\n└── テスト・運用（単体, E2E, 監視）',
        tip: '「設計→実装→テスト」ではなく、成果物（機能単位）で分解する'
      },
      {
        name: '完了条件の定義',
        description: 'タスクが「完了」と言える状態を事前に明文化し、曖昧な「できた」を防ぐ',
        example: '【完了条件】\n1. 仕様通り動作（手動確認済み）\n2. テスト追加（カバレッジ80%以上）\n3. ドキュメント更新済み\n4. レビュー承認済み',
        tip: 'タスク作成時に完了条件を書く習慣をつける。後から追加すると認識ずれが起きる'
      },
      {
        name: '調査設計',
        description: '未知の領域を調べる前に、調査の目的・範囲・期限・成果物を定義する',
        example: '【目的】AI導入の実現可能性評価\n【範囲】1.課題整理 2.技術選択肢 3.コスト 4.リスク\n【期限】2週間（中間報告: 1週目金曜）\n【成果物】調査報告書 + Go/No-Go判断材料',
        tip: '調査も「タスク」。ゴールなき調査は時間の浪費になる'
      },
      {
        name: '段階的ゴール具体化',
        description: '曖昧なゴールを調査の進行に合わせて段階的に具体化する。最初から完璧を目指さない',
        example: 'Week0:「AI導入で改善したい」（抽象）\n→ Week1:「問い合わせの一次回答を自動化」（具体化）\n→ Week2:「FAQ200件に正答率80%のチャットボットを3ヶ月で導入」（定量化）',
        tip: '各段階で関係者と合意を取る。独りで具体化しすぎると手戻りになる'
      },
      {
        name: '未知領域の調査フレームワーク',
        description: '何も知らない分野を【現状把握→選択肢→評価軸→比較→推奨案】の順で調査する',
        example: 'Phase1: 現状把握（ヒアリング・データ収集）\nPhase2: 選択肢洗い出し（3案以上）\nPhase3: 評価軸設定（コスト/精度/運用負荷等）\nPhase4: 比較表作成→推奨案提示',
        tip: '「ChatGPTがいいらしい」で飛びつかない。必ず複数案を比較する'
      },
      {
        name: 'EOL（End of Life）管理',
        description: '使用中の言語・ライブラリのサポート終了日を把握し、計画的に移行する',
        example: '【EOL管理台帳】\n緊急: Node.js 18（2025/4 EOL超過）→ 今月中に22へ\n計画: Python 3.9（2025/10 EOL）→ 8月までに3.12へ\n安定: PostgreSQL 16（2028/11 EOL）→ 対応不要',
        tip: 'EOL管理は「気づいてから慌てる」ではなく、四半期ごとに棚卸しする仕組みを作る'
      },
      {
        name: '要件定義の書き方',
        description: '機能要件（何ができるか）と非機能要件（性能/セキュリティ/可用性）を要件IDつきで明文化する',
        example: '【機能要件】\nFR-001: メール+パスワードでログイン\nFR-002: 5回失敗で30分ロック\n【非機能要件】\nNFR-001: 応答500ms以内\nNFR-002: bcrypt（コスト12）でハッシュ化',
        tip: '要件IDを振ることでトレーサビリティの起点になる。IDがないと追跡できない'
      },
      {
        name: '工程移行レビュー',
        description: '次工程に進む前に、前工程の成果物が完成しておりインプットとして十分かを確認する',
        example: '【要件定義→基本設計】全要件にIDあり、非機能要件定義済み、承認済み\n【基本設計→概要設計】アーキテクチャ図あり、IF仕様定義済み、全要件が対応づけ済み\n【概要設計→詳細設計】処理フロー定義済み、エラー方針統一済み\n【詳細設計→実装】入出力定義済み、境界条件明記済み',
        tip: '「だいたいできたので次に進む」は禁物。工程移行チェックリストを必ず使う'
      },
      {
        name: 'コードリーディング',
        description: '既存コードを効率的に読み解き、全体構造と変更箇所を特定する',
        example: '1. README/ドキュメントで全体像把握\n2. ディレクトリ構成でモジュール分割理解\n3. エントリポイントから処理フロー追跡\n4. テストコードで期待動作を確認\n5. git blame で変更履歴と意図を確認',
        tip: 'いきなり修正を始めない。最初に「読む」時間を確保する方が結果的に早い'
      },
      {
        name: 'AI活用のワークフロー設計',
        description: 'AIが得意なタスクと人間がすべきタスクを使い分け、開発プロセスに組み込む',
        example: '【AIに任せる】ボイラープレート生成、テストケース洗い出し、エラー解析、リファクタ提案\n【人間がやる】要件定義、アーキテクチャ判断、セキュリティレビュー、AI出力のレビュー',
        tip: '「何でもAIに聞く」は非効率。AIは「下書き」、人間は「判断と検証」が最適な分担'
      }
    ]
  },
  'reporting': {
    title: '報告・連絡',
    description: '正確で過不足のない報告・連絡を行うスキル',
    items: [
      {
        name: '障害報告の型',
        description: '発生日時・影響範囲・原因・対応・再発防止の5要素で構成',
        example: '【発生】2/18 14:03\n【影響】API 2台中1台停止\n【原因】OOM\n【対応】再起動\n【防止】メモリ上限追加',
        tip: '推測と事実を明確に分ける。「たぶん」「おそらく」は根拠と共に使う'
      },
      {
        name: '進捗報告の構造化',
        description: '完了・進行中・未着手・ブロッカーの4区分で報告',
        example: '【完了】3/3タスク\n【進行中】2/5タスク\n【未着手】E2E\n【ブロッカー】権限待ち',
        tip: '数値（n/m タスク）を入れることで客観的な進捗度が伝わる'
      },
      {
        name: 'エスカレーション',
        description: '判断を仰ぐべき状況を適切に上位者に報告',
        example: '【状況】+ 【影響】+ 【判断依頼】の3要素セット',
        tip: '「どうしましょう？」ではなく、選択肢を提示して判断を仰ぐ'
      },
      {
        name: 'サマリー（要約）',
        description: '情報を圧縮して要点だけ伝える。事実の整理が目的で、考察・提案は含まない',
        example: '【会議サマリー】\n・議題: 認証基盤の移行方針\n・決定: OAuth 2.0 + PKCE を採用\n・宿題: 佐藤→手順書を金曜まで\n・次回: 2/25 14:00',
        tip: 'サマリーに自分の意見や提案を混ぜない。事実と意見を分離する'
      },
      {
        name: '成果報告書の型',
        description: '調査・実装の成果を【目的→手法→結果→考察→次のアクション】で報告',
        example: '【目的】AI導入の実現可能性検証\n【手法】GPT-4 + RAGでFAQ50件を対象にPoC\n【結果】正答率78%、応答1.2秒、コスト0.8円/件\n【考察】定型FAQは実用レベル、複合質問は要改善\n【次のアクション】プロンプト改善＋低精度カテゴリ特定',
        tip: '「いい感じでした」は禁止。数値で語り、考察で解釈を加える'
      },
      {
        name: 'サマリー vs 成果報告の使い分け',
        description: 'サマリーは「事実の圧縮」、成果報告は「事実＋解釈＋次の行動」。目的で切り替える',
        example: '【サマリーが適切な場面】\n・会議議事録、Slackでの共有、日報\n→ 読み手は「何があったか」だけ知りたい\n\n【成果報告が適切な場面】\n・PoC報告、プロジェクト完了、四半期レビュー\n→ 読み手は「どう判断すべきか」を知りたい',
        tip: '迷ったら「読み手はこの報告で何を判断するか？」を考える。判断不要ならサマリー、判断が必要なら成果報告'
      },
      {
        name: '報告の目的別分類',
        description: '報告を4タイプに分類し、構成を使い分ける',
        example: '1. 情報共有型（サマリー）→ 事実を圧縮\n2. 判断依頼型（エスカレーション）→ 状況＋選択肢\n3. 成果報告型 → 結果＋考察＋次アクション\n4. 提案型 → 課題＋解決策＋根拠＋コスト',
        tip: '書き始める前に「この報告のタイプは？」を1秒考える'
      },
      {
        name: '日報・週報・月報の粒度設計',
        description: '頻度に応じて粒度と目的を変える。日報=事実記録、週報=傾向把握、月報=成果評価',
        example: '【日報】やったこと・明日の予定・困りごと（2分で書ける量）\n【週報】進捗サマリー・来週計画・リスク（傾向が見える粒度）\n【月報】目標達成度・数値成果・学び・来月方針（評価と振り返り）',
        tip: '日報に月報レベルの振り返りは書かない。重すぎて続かない'
      },
      {
        name: '報連相（ホウレンソウ）',
        description: '報告・連絡・相談を適切なタイミングと粒度で行う。「聞かれる前に報告」「困ったら早めに相談」',
        example: '報告: 「タスクA完了、次にBに着手します」\n連絡: 「明日15時退勤です」\n相談: 「方針で2案あり迷っています。A案は○○、B案は△△」',
        tip: '3日間一人で悩むより、30分で質問する方がチームの生産性は圧倒的に高い'
      },
      {
        name: '見積もりの伝え方',
        description: '作業を分解して積み上げた根拠を示す。「だいたい2日」ではなく内訳を出す',
        example: '【内訳】DB設計1h + API実装3h + テスト2h + レビュー対応1h = 7h\n【前提】SQLのLIKE検索で実装\n【リスク】全文検索が必要になった場合+2日',
        tip: '見積もりは「正確さ」より「根拠と前提の明示」が大事。ずれたら原因を振り返る'
      },
      {
        name: 'ステークホルダー調整',
        description: '自分の変更が影響する関係者に事前連絡する。API変更→フロント、DB変更→他チーム',
        example: '1. API仕様変更 → フロントに事前連絡\n2. DBスキーマ変更 → DBA・他チームに確認\n3. テスト環境利用 → QAとスケジュール調整',
        tip: '「変更後に報告」ではなく「変更前に相談」。巻き込みが早いほど手戻りが減る'
      },
      {
        name: 'マイルストーン付きスケジュール',
        description: '期間を区切り各区間の成果物を明示。中間判断ポイント（Go/No-Go）を設ける',
        example: 'M1 (Week2末): 調査完了→技術選定レビュー\nM2 (Week3末): PoC完了→精度レポート\nM3 (Week6末): MVP完成→社内テスト\nM4 (Week8末): 本番リリース\n※各Mで No-Go の場合の撤退基準あり',
        tip: '「3ヶ月後にリリース」ではなく、中間成果物を置いて進捗を可視化する'
      },
      {
        name: '調査→実行の一気通貫管理',
        description: '未知課題に対して調査設計→実行→PoC→実装計画→報告→振り返りを一貫管理',
        example: 'Week1: 調査設計・ヒアリング\nWeek2: 選択肢比較→中間報告\nWeek3: PoC実施\nWeek4: 最終報告 + 本実装WBS',
        tip: '中間報告を入れることで「2ヶ月調べたけどダメでした」を防ぐ'
      },
      {
        name: 'EOL管理台帳',
        description: '技術スタック全体のEOL状況を一覧管理し、緊急/計画/安定の3段階で優先度を可視化',
        example: '【緊急（EOL超過）】Node.js 18 → 今月中に22へ\n【計画（6ヶ月以内）】Python 3.9 → 8月までに3.12へ\n【安定（1年以上猶予）】PostgreSQL 16 → 対応不要',
        tip: '四半期ごとにEOL台帳を更新する。セキュリティ監査で慌てない体制を作る'
      },
      {
        name: '移行計画書の型',
        description: 'ライブラリ・言語移行時に【背景→影響調査→手順→テスト→ロールバック】を記述',
        example: '【背景】Node.js 18 EOL超過\n【影響】非互換パッケージ3件（具体名と修正方針）\n【手順】5ステップ（見積もり1人日）\n【テスト】unit + E2E全件通過\n【ロールバック】Docker前バージョン即時切り戻し',
        tip: 'ロールバック計画なしの移行は危険。「ダメだったら戻せる」を必ず担保する'
      }
    ]
  },
  'explanation': {
    title: '説明・提案',
    description: '技術的内容を相手に正確に伝え、提案を通すスキル',
    items: [
      {
        name: '仕様説明の型',
        description: '目的→入力→処理→出力→制約の順で説明',
        example: '【目的】セッション管理\n【入力】email, password\n【処理】JWT発行\n【出力】access_token + refresh_token\n【制約】同時5セッション',
        tip: '相手が「で、何をすればいいの？」と思わない説明を目指す'
      },
      {
        name: 'レビューコメントの型',
        description: '指摘レベル＋理由＋改善案の3要素',
        example: '[must] N+1クエリ発生。includes(:posts) を追加してください。',
        tip: '[must] [want] [nits] でレベルを明示すると優先度が伝わる'
      },
      {
        name: '技術選定の提案',
        description: '比較軸を明示した上で推奨案を提示',
        example: '【比較軸】パフォーマンス / 学習コスト / コミュニティ\n【候補】A / B / C\n【推奨】Bを推奨。理由は...',
        tip: '結論と根拠をセットにし、反論への事前対応も入れる'
      },
      {
        name: 'PoC（概念実証）の設計',
        description: '本格実装前に最小限の実装で技術的実現可能性を検証する',
        example: '【PoC目的】GPT-4でFAQ自動回答が実用レベルか検証\n【検証項目】正答率 / 応答速度 / コスト\n【範囲】FAQ上位50件（全体の25%）\n【期間】3日間\n【成功基準】正答率70%以上 かつ 応答3秒以内',
        tip: 'PoCは「小さく・早く・判断基準を事前に決めて」が鉄則'
      },
      {
        name: 'エグゼクティブサマリー',
        description: '意思決定者向けに結論と推奨アクションを冒頭1ページにまとめる',
        example: '【結論】AI FAQ導入を推奨\n【根拠】正答率78%、コスト95%削減\n【投資】初期100万 + 月5万（12ヶ月で回収）\n【リスク】複合質問の精度 → 段階導入で対応\n【推奨】来月からPhase1開始\n※詳細は本文p.3〜',
        tip: '詳細を読まなくても判断できるようにする。「全部読んでください」は禁止'
      },
      {
        name: '読み手別の構成切り替え',
        description: '同じ内容でも読み手のロールに応じて構成・粒度・強調点を変える',
        example: '経営層: 結論→ビジネスインパクト→コスト→リスク\n技術リーダー: 結論→技術選定理由→アーキテクチャ→性能\nメンバー: 概要→タスク分解→担当→スケジュール',
        tip: '「この人は何を知れば判断/行動できるか」を考えてから書き始める'
      },
      {
        name: 'ライブラリ調査の型',
        description: 'ライブラリ導入・移行時に【現状→候補→比較軸→比較表→推奨＋フォールバック】で構造化する',
        example: '【現状】moment.js EOL済み、142ファイルで使用\n【候補】date-fns / dayjs / Temporal\n【比較軸】サイズ、API互換性、移行コスト、長期安定性\n【推奨】dayjs（互換性高・コスト最小）\n【フォールバック】問題時はdate-fnsへ',
        tip: '「○○がいいらしい」で選ばない。必ず3案以上を同じ評価軸で比較する'
      },
      {
        name: '言語・ランタイム調査',
        description: '新バージョンの新機能・破壊的変更・互換性を体系的に調査し、移行判断材料を整理する',
        example: '【対象】Python 3.12\n【新機能】型パラメータ簡略化、パフォーマンス改善\n【破壊的変更】distutils完全削除\n【影響】自社コードでdistutils使用3件→setuptools置換\n【判断】移行推奨（工数0.5日、リスク低）',
        tip: '新機能だけでなく、破壊的変更と依存パッケージの互換性を必ず調査する'
      },
      {
        name: 'バージョンアップ影響調査',
        description: 'バージョンアップ前に新機能→破壊的変更→依存互換性→手順→ロールバックを網羅する',
        example: '【調査結果】全187パッケージ中、非互換3件\n1. node-sass → sass に置換\n2. sharp v0.30 → v0.33 更新\n3. bcrypt v5.0 → v5.1 更新\n【手順】5ステップ（見積もり1人日）\n【ロールバック】Docker前バージョン即時切り戻し',
        tip: '「テスト通ったから大丈夫」ではなく、非互換パッケージを事前に全件調査する'
      },
      {
        name: '基本設計の書き方',
        description: 'システム全体のアーキテクチャ・外部IF・DB構成を定義。結合テストの検証基準になる',
        example: '【システム構成】3層アーキテクチャ（フロント/API/DB）\n【外部IF】REST API 15本、OAuth2.0連携\n【DB】ER図（テーブル12、リレーション8）\n【非機能】CDN + LB + レプリケーション',
        tip: '基本設計のIF仕様がそのまま結合テストの検証項目になる。曖昧に書くとテスト設計で困る'
      },
      {
        name: '概要設計の書き方',
        description: '機能単位の入出力・処理フロー・エラー処理を定義。機能テストの検証基準になる',
        example: '【機能】ログイン\n【処理フロー】\n1. バリデーション（メール形式/PW 8文字以上）\n2. DB照合 → ロック判定 → JWT発行\n【エラー】認証失敗/ロック/入力不正の3パターン',
        tip: '概要設計のエラーパターン数 = 機能テストの異常系ケース数。ここが一致していなければずれている'
      },
      {
        name: '詳細設計の書き方',
        description: 'クラス・関数・アルゴリズムレベルの設計。単体テストの検証基準になる',
        example: '【メソッド】authenticate(email, pw) → TokenPair\n【条件分岐】user不在→Error / PW不一致→Error / ロック済→Error / 正常→Token\n【境界値】ロック回数 4（通過）/ 5（ロック）',
        tip: '詳細設計の条件分岐数 = 単体テストケース数。分岐を書き忘れるとテスト漏れに直結する'
      },
      {
        name: 'プルリクエストの書き方',
        description: '概要・変更理由・変更内容・テスト結果・レビューポイントを構造化して書く',
        example: '## 概要\nページネーション追加\n## 変更理由\n1000件超でタイムアウト\n## 変更内容\npage/per_pageパラメータ追加、後方互換あり\n## テスト\n新規5件、既存全件パス\n## レビューポイント\nカーソルvsオフセットの判断（L45-60）',
        tip: 'PR本文が空は最悪。レビュアーの時間を尊重し「何を見ればいいか」を明示する'
      },
      {
        name: '会議での発言の型',
        description: '状況報告・質問・提案の3パターンを使い分ける。会議前にアジェンダ確認と質問準備をする',
        example: '報告: 「○○は予定通り完了しています」\n質問: 「確認ですが、△△という理解で合っていますか？」\n提案: 「□□の方法もあると思います。理由は〜」',
        tip: '会議で黙っているのは参加していないのと同じ。事前準備すれば発言のハードルは下がる'
      },
      {
        name: 'スコープ管理と合意形成',
        description: '「やること」と「やらないこと」を明確にし、関係者と合意する',
        example: '【In Scope】検索API、ページネーション、CSV出力\n【Out of Scope】全文検索、サジェスト、検索履歴\n【理由】MVPとして最小機能に絞り2週間でリリース',
        tip: 'スコープを曖昧にすると「あれもこれも」で工期が倍になる。最初に線を引く'
      },
      {
        name: 'プロンプトエンジニアリング',
        description: 'AIに意図した回答を得るため【役割→文脈→要件→制約→出力形式】で指示を構造化する',
        example: '【役割】Node.jsバックエンドエンジニア\n【文脈】Express v4でJWT認証を実装中\n【要件】access_token検証、refresh_tokenエンドポイント\n【制約】TypeScript、エラー時401/403\n【出力形式】コードブロック + JSDoc付き',
        tip: '「コード書いて」は最悪のプロンプト。文脈と要件を具体的に指定するほど回答品質が上がる'
      },
      {
        name: 'トークンとコンテキストウィンドウ',
        description: 'AIが一度に処理できるテキスト量の上限を理解し、効率的に情報を渡す',
        example: '日本語は英語の2〜3倍のトークンを消費\n→ 長いコードは関連部分だけ貼る\n→ 「前の会話を踏まえて」ではなく要点を再記載\n→ 長い会話は要約して新セッションに引き継ぐ',
        tip: 'プロジェクト全ファイルを貼り付けない。AIに渡す情報は「必要最小限」が最強'
      },
      {
        name: 'AIコーディング支援ツールの選び方',
        description: 'Copilot/Continue/Cursor/Cline等の特性を理解し、用途に応じて使い分ける',
        example: '補完メイン → Copilot（安定・手軽）\nカスタマイズ・ローカルLLM → Continue（OSS・柔軟）\nAI中心の開発 → Cursor（プロジェクト全体理解）\n自律タスク → Cline（ファイル操作・コマンド実行）',
        tip: 'ツールを入れるだけでは生産性は上がらない。「どの場面で何に使うか」をチームで決める'
      },
      {
        name: 'AI出力の検証と責任',
        description: 'AI生成コードは必ず自分で検証する。セキュリティ・正確性・ライセンスを確認。最終責任は開発者',
        example: '【検証チェック】\n- [ ] ローカルで動作確認済み\n- [ ] セキュリティ問題なし（SQLi, XSS等）\n- [ ] 非推奨API使っていない\n- [ ] ハルシネーション（存在しないAPI）なし\n- [ ] 自分がこのコードを説明できる',
        tip: '「AIが書いたから正しい」は通用しない。理解できないコードはコミットしない'
      },
      {
        name: '実装時ログと本番ログの違い',
        description: 'デバッグ用の一時ログと本番運用ログは目的・形式・寿命が全く異なる。リリース前に切り替えが必要',
        example: '| 観点 | 実装時 | 本番 |\n|---|---|---|\n| 目的 | 動作確認・バグ特定 | 障害検知・監視・監査 |\n| 形式 | console.log（自由テキスト） | 構造化JSON（機械処理向け） |\n| レベル | DEBUG含む全レベル | INFO以上（DEBUGは原則OFF） |\n| 機密情報 | 開発環境なら許容 | 絶対NG（マスキング必須） |',
        tip: '`console.log` が本番コードに残っていたらレビューで即指摘。リリース前チェックリストに含める'
      },
      {
        name: 'ログレベル設計',
        description: 'ERROR/WARN/INFO/DEBUGの使い分け基準をチームで統一する',
        example: 'ERROR: 処理不能（DB接続断、決済失敗）→ 即時アラート\nWARN: 想定外だが継続（応答遅延、リトライ成功）→ 監視\nINFO: 正常イベント（ログイン、注文完了）→ 監査・統計\nDEBUG: 詳細動作（キャッシュヒット、SQL）→ 開発時のみ',
        tip: '「迷ったらINFO」はNG。基準を文書化し、コードレビューで統一を保つ'
      },
      {
        name: '構造化ログとセキュリティ',
        description: 'JSON形式の構造化ログで検索性を確保し、機密情報は絶対にログに出力しない',
        example: '```javascript\n// 良い例: 構造化 + 機密情報なし\nlogger.info(\'User login\', {\n  userId: user.id,\n  method: \'oauth\',\n  requestId: req.id\n});\n// 悪い例: 非構造化 + 機密情報あり\nconsole.log(\'Login:\', email, password);\n```',
        tip: 'パスワード・トークン・個人情報は絶対NG。`req.body` の丸ごと出力も危険'
      }
    ]
  },
  'logical-writing': {
    title: '論理的思考・文章構成',
    description: '論理の飛躍なく、読み手が追いやすい文章を構成するスキル',
    items: [
      {
        name: '結論ファースト',
        description: '最初に結論、次に理由・詳細を展開',
        example: '【結論】リリース可能です。【理由】全テスト通過、レビュー完了済み。',
        tip: '特に Slack やメールの1行目は結論にする'
      },
      {
        name: '因果関係の明示',
        description: '原因→結果の連鎖を省略せず書く',
        example: 'メモリリーク → GC頻度増加 → レスポンス悪化 → タイムアウト多発',
        tip: '「なので」「したがって」の前後で論理が繋がっているか確認する'
      },
      {
        name: 'PREP法',
        description: 'Point（結論）→ Reason（理由）→ Example（具体例）→ Point（再結論）',
        example: '【P】Redis を推奨します【R】レイテンシ要件を満たすため【E】ベンチマークで p99 < 5ms【P】よって Redis が最適です',
        tip: '短い文章でも PREP の流れを意識すると説得力が増す'
      },
      {
        name: 'TODOチェックリスト設計',
        description: 'カテゴリ分類＋完了条件明示で、抜け漏れのないチェックリストを作る',
        example: '## PR マージ前チェックリスト\n### コード品質\n- [ ] Lintエラーなし\n- [ ] 型エラーなし\n### テスト\n- [ ] 新規テスト追加済み\n- [ ] 既存テスト全件通過\n### ドキュメント\n- [ ] API仕様書更新済み',
        tip: '「確認した」ではなく「○○が△△の状態であることを確認」と書く。検証可能な表現にする'
      },
      {
        name: 'チェックリストのアンチパターン',
        description: 'よくある悪いチェックリストのパターンを知り、回避する',
        example: '✕ 曖昧項目: 「テストした」→ ○「unit/integration/E2E 全件 pass」\n✕ 巨大項目: 「実装完了」→ ○ 機能ごとに分割\n✕ 形骸化: 全部チェックして終わり → ○ 各項目にエビデンス（URL/スクショ）を添付',
        tip: 'チェックリストは「作って終わり」ではなく、定期的に項目の過不足を見直す'
      },
      {
        name: 'ナレッジ蓄積と再利用',
        description: '調査・実装で得た知見を再利用可能な形で文書化し、車輪の再発明を防ぐ',
        example: '【知見の分類】\n1. 技術知見: RAGのチャンクサイズは500トークンが最適\n2. プロセス知見: PoCは3日以内に区切ると判断が早い\n3. 失敗知見: embedding検索だけでは複合質問に対応不可\n【蓄積先】Wiki > AI導入 > FAQ自動応答',
        tip: '「成功した方法」だけでなく「失敗した方法とその理由」も記録する'
      },
      {
        name: '振り返り→次アクション変換',
        description: '成果の振り返りを【事実→解釈→具体的アクション】の3段階で変換する',
        example: '【事実】正答率78%\n【解釈】定型FAQ(92%)は実用レベル、複合質問(40%)が課題\n【アクション】\n1. 複合質問パターン分類（来週）\n2. プロンプト改善PoC（再来週）\n3. 低精度カテゴリは人間エスカレーション設計',
        tip: '「頑張ります」「次も気をつけます」は行動ではない。5W1Hで書く'
      },
      {
        name: '依存パッケージ監査',
        description: '外部パッケージの脆弱性・非推奨・EOLを定期チェックし、リスクを管理する',
        example: '【ツール】npm audit / pip-audit / bundler-audit\n【運用】CIに組み込み週次チェック\n【トリアージ】Critical→即日 / Medium→1週間 / Low→次スプリント\n【レポート例】脆弱性2件(High1,Low1)、非推奨5件、対応PR作成済み',
        tip: 'npm audit の警告を放置しない。CIで自動チェックし、溜まる前に対応する習慣をつける'
      },
      {
        name: 'V字モデル（工程対応）',
        description: '設計（左）とテスト（右）の対応関係。各設計の成果物が対応するテストの検証基準になる',
        example: '要件定義 ←→ システムテスト（業務シナリオ検証）\n基本設計 ←→ 結合テスト（モジュール間連携検証）\n概要設計 ←→ 機能テスト（正常系/異常系検証）\n詳細設計 ←→ 単体テスト（条件分岐/境界値検証）',
        tip: '「このテストの検証基準はどの設計書か」を常に意識する。対応がないテストは根拠が曖昧'
      },
      {
        name: 'トレーサビリティマトリクス',
        description: '要件→設計→実装→テストの追跡関係を行列で可視化し、漏れを検出する',
        example: '| 要件 | 基本設計 | 概要設計 | 詳細設計 | UT | FT | IT |\n|---|---|---|---|---|---|---|\n| FR-001 | BD-3.1 | OD-3.1.1 | DD-Auth-01 | UT-A01〜07 | FT-L01〜08 | IT-Auth-01 |\n→ 空欄があれば漏れ。要件変更時に影響範囲が即座にわかる',
        tip: '面倒でも最初に作っておくと、要件変更時に「どのテストを直すか」が一瞬でわかる'
      },
      {
        name: '設計→テスト観点の導出ルール',
        description: '設計書の記載内容からテスト観点を体系的に導出するルール',
        example: '詳細設計の条件分岐 → UTで全分岐をテスト\n概要設計のエラー処理 → FTで全エラーパターンをテスト\n基本設計のIF仕様 → ITでリクエスト/レスポンス形式を検証\n設計に書いてない観点 → テストすべきか設計に追記すべきか判断',
        tip: 'テストレビューでは「この観点は設計書のどこに対応するか」を必ず確認する'
      },
      {
        name: 'タイムボックスと優先度管理',
        description: '作業に時間上限を設け、優先度で取捨選択する。完璧より制限時間内のベスト',
        example: '調査: 2時間で区切る → 結論出なければ相談\nバグ調査: 30分で先輩に聞く\n優先度: 緊急+重要→即対応 / 重要→計画的 / 緊急のみ→次スプリント',
        tip: '1つのタスクに没頭しすぎない。タイマーを使って「ここまでで相談」の習慣をつける'
      },
      {
        name: 'ドキュメント習慣',
        description: '作業・学び・決定を文書化して残す。口頭の情報は消えるが文書は残り資産になる',
        example: '【残すべきもの】\n1. 作業ログ（何をやって何がわかったか）\n2. 手順書（環境構築・デプロイ）\n3. ADR（なぜこの設計にしたか）\n4. トラブルシューティング（このエラーはこう解決）',
        tip: 'Slack = フロー情報（一時的）、Wiki = ストック情報（永続的）。使い分ける'
      },
      {
        name: 'ログ設計チェックリスト',
        description: 'リリース前にログ出力を点検。デバッグログ残存・レベル設定・セキュリティ・構造化を網羅確認',
        example: '### デバッグログ除去\n- [ ] console.log/print 残っていないか\n- [ ] TODO付きの一時ログがないか\n### ログレベル\n- [ ] ERROR: 処理不能のみ / WARN: 想定外 / INFO: 業務イベント\n### セキュリティ\n- [ ] パスワード・トークン・PII が含まれていないか\n### 運用\n- [ ] 構造化JSON形式か / requestIdで追跡可能か',
        tip: '「console.log が残ってないか」はPRレビューの必須チェック項目。CI で検出する仕組みも有効'
      }
    ]
  },
  'questioning': {
    title: '質問・確認',
    description: '的確な質問で認識齟齬を防ぎ、議論を前に進めるスキル',
    items: [
      {
        name: '質問の型',
        description: '前提共有＋自分の理解＋具体的質問の3要素',
        example: '【前提】仕様書v2.1を読みました\n【理解】refresh_tokenは30日で期限切れ\n【質問】自動延長しない設計は意図的ですか？',
        tip: '相手が「何を聞きたいのかわからない」と思わない質問を目指す'
      },
      {
        name: '曖昧さの指摘',
        description: '「適切に」「なるべく」を具体的条件に置き換える',
        example: '「なるべく早く」→「今週金曜17:00まで」\n「適切に処理」→「400を返しerrorsに格納」',
        tip: '曖昧ワード検出リスト: 適切に / なるべく / 必要に応じて / 等'
      },
      {
        name: 'クローズドクエスチョンの活用',
        description: 'Yes/No や選択式で回答しやすい質問にする',
        example: '✕「認証どうしますか？」\n○「認証は A.JWT B.Session C.OAuth のどれにしますか？」',
        tip: 'オープン→クローズドの順で絞り込むと効率的'
      },
      {
        name: '設計レビューの観点',
        description: '設計レビューで「下流工程で困らないか」を確認する質問パターン',
        example: '【基本設計レビュー】\n・全要件が設計のどこかに対応しているか？\n・IF仕様は結合テスト可能な粒度で書かれているか？\n【概要設計レビュー】\n・処理フローのエラーパターンは網羅されているか？\n・機能テストのケースはこの設計から導出できるか？\n【詳細設計レビュー】\n・条件分岐と境界値は明記されているか？\n・この設計から単体テストを書ける粒度か？',
        tip: '「この設計書から対応するテスト仕様書を書けるか？」が最強のレビュー観点'
      },
      {
        name: 'テスト観点の整合性チェック',
        description: '設計変更がテストに反映されているか、テスト漏れがないかを確認する',
        example: '✅ 詳細設計の分岐5パターン → UT 5ケース（OK）\n✅ 概要設計のエラー4種 → FT 4ケース（OK）\n❌ 基本設計API 15本 → IT 12本（3本漏れ！）\n❌ FR-003 → どのテストにも未対応（トレーサビリティ欠落！）',
        tip: '設計変更があったら「対応するテストはどれか」を必ず確認する。変更漏れがバグの温床'
      },
      {
        name: '助けを求める技術',
        description: '「全くわかりません」ではなく「ここまで理解したがここで詰まっている」と構造化して質問する',
        example: '【やったこと】ドキュメントを読み、サンプルを動かした\n【わかったこと】基本CRUDは理解\n【わからないこと】トランザクションのネスト時のロールバック\n【試したこと】savepointを使ったがエラー（メッセージ添付）\n【質問】使い方の問題？別アプローチ？',
        tip: '「30分調べて→質問の型で聞く」を習慣にすれば、先輩の時間を奪わず効率的に学べる'
      },
      {
        name: 'フィードバックの受け取り方',
        description: 'レビュー指摘を建設的に受け止める。感情的に反応せず「何を学べるか」に集中する',
        example: '正しい指摘 → 修正して「ありがとうございます」\n意図不明 → 「この指摘は○○という理解で合っていますか？」\n別意見あり → 「こちらの理由は○○です。△△の観点ではいかがでしょうか？」',
        tip: '「でも」「だって」で反論しない。指摘は成長の機会。感情と事実を分離する'
      }
    ]
  }
}

const currentSkill = computed(() => skillData[props.skillId] || null)
</script>

<template>
  <div class="skill-guide" v-if="currentSkill">
    <h1 class="guide-title">{{ currentSkill.title }}</h1>
    <p class="guide-description">{{ currentSkill.description }}</p>

    <div class="skill-card" v-for="(item, index) in currentSkill.items" :key="index">
      <h2 class="skill-name">{{ item.name }}</h2>
      <p class="skill-description">{{ item.description }}</p>
      <div class="skill-example">
        <div class="example-label">具体例</div>
        <div class="example-content markdown-body" v-html="renderMarkdown(item.example)"></div>
      </div>
      <div class="skill-tip">
        <span class="tip-label">ポイント:</span> {{ item.tip }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-guide {
  max-width: 800px;
}

.guide-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.guide-description {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 24px;
}

.skill-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.skill-name {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.skill-description {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 12px;
}

.skill-example {
  margin-bottom: 12px;
}

.example-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #777;
  margin-bottom: 4px;
}

.example-content {
  font-size: 0.9rem;
  background: #f5f5f5;
  padding: 10px 12px;
  border-radius: 6px;
  line-height: 1.5;
}

.example-content.markdown-body :deep(h2) {
  font-size: 1rem;
  font-weight: 700;
  margin: 12px 0 6px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.example-content.markdown-body :deep(h2:first-child) {
  margin-top: 0;
}

.example-content.markdown-body :deep(h3) {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 10px 0 4px 0;
}

.example-content.markdown-body :deep(p) {
  margin: 4px 0;
}

.example-content.markdown-body :deep(ul),
.example-content.markdown-body :deep(ol) {
  margin: 4px 0;
  padding-left: 20px;
}

.example-content.markdown-body :deep(li) {
  margin: 2px 0;
}

.example-content.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
  font-size: 0.85rem;
}

.example-content.markdown-body :deep(th),
.example-content.markdown-body :deep(td) {
  padding: 4px 8px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  text-align: left;
}

.example-content.markdown-body :deep(th) {
  font-weight: 600;
  background: rgba(0, 0, 0, 0.04);
}

.example-content.markdown-body :deep(code) {
  background: rgba(0, 0, 0, 0.06);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.85em;
}

.example-content.markdown-body :deep(pre) {
  background: rgba(0, 0, 0, 0.06);
  padding: 8px 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 6px 0;
}

.example-content.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

.example-content.markdown-body :deep(strong) {
  font-weight: 700;
}

.example-content.markdown-body :deep(input[type="checkbox"]) {
  margin-right: 4px;
}

.skill-tip {
  font-size: 0.85rem;
  color: #1565c0;
  background: #e3f2fd;
  padding: 8px 12px;
  border-radius: 6px;
}

.tip-label {
  font-weight: 600;
}
</style>
