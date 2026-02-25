---
title: "AIコーディング支援のプロンプト設計"
tags: ["読み物", "初級"]
created: "2026-02-18"
updated: "2026-02-26"
---

## 概要

出典: チーム開発ガイドライン / レベル: 初級

## 悪い例

認証のコード書いて。Typescriptで。あとテストも。

## 良い例

## プロンプト

**役割**: あなたはTypeScriptとExpress.jsに精通したバックエンドエンジニアです。

**文脈**:
- Express.js v4 + TypeScript のAPIサーバー
- 認証はJWT方式（access_token 15分 + refresh_token 30日）
- ユーザー情報は PostgreSQL の users テーブル
- パスワードは bcrypt でハッシュ化済み

**要件**:
1. `POST /auth/login` - メール+パスワードでログイン、JWT発行
2. `POST /auth/refresh` - refresh_tokenで新しいaccess_token発行
3. `authMiddleware` - access_tokenを検証するミドルウェア

**制約**:
- エラー時は適切なHTTPステータス（401/403）を返却
- 環境変数: `JWT_SECRET`, `JWT_REFRESH_SECRET`
- 既存の `UserRepository.findByEmail()` を使用

**出力形式**:
- TypeScriptコードブロック
- 各関数にJSDocコメント
- Jestのユニットテスト付き

## 解説

- **改善点**: 「認証のコード書いて」 -- 「認証」が広すぎる。JWT? Session? OAuth? 何のフレームワーク? 要件が全く不明
- **改善点**: 「あとテストも」 -- テストフレームワーク未指定、テスト対象未指定。Jest? Vitest? 何をテストする?
- **スキル**: 「役割」 -- AIに「何の専門家として回答するか」を指定。回答の技術レベルと方向性が安定する
- **スキル**: 「既存の UserRepository.findByEmail() を使用」 -- 既存コードとの接続点を明示。AIが勝手に別のDB接続コードを生成するのを防ぐ
- **スキル**: 「出力形式」 -- 出力の形式を指定することで、そのまま使えるコードが得られる。「JSDoc付き」で品質も担保
