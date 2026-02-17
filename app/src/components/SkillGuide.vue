<script setup>
import { computed } from 'vue'

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
        name: '成果報告書の型',
        description: '調査・実装の成果を【目的→手法→結果→考察→次のアクション】で報告',
        example: '【目的】AI導入の実現可能性検証\n【手法】GPT-4 + RAGでFAQ50件を対象にPoC\n【結果】正答率78%、応答1.2秒、コスト0.8円/件\n【考察】定型FAQは実用レベル、複合質問は要改善\n【次のアクション】プロンプト改善＋低精度カテゴリ特定',
        tip: '「いい感じでした」は禁止。数値で語り、考察で解釈を加える'
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
        <div class="example-content">{{ item.example }}</div>
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
  white-space: pre-wrap;
  line-height: 1.5;
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
