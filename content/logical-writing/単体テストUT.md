---
title: "単体テスト（UT）"
tags: ["用語"]
created: "2026-02-18"
updated: "2026-02-26"
---

## 意味

詳細設計で定義したクラス・関数単位の動作を検証するテスト。条件分岐・境界値・異常系を網羅する。検証基準は詳細設計書

## 具体例

【対応する詳細設計】DD-Auth-01: AuthService.authenticate()
【テスト観点】
UT-A01: 正常系 - 正しいemail/passwordでTokenPairが返る
UT-A02: 異常系 - 存在しないemailでAuthenticationError
UT-A03: 異常系 - パスワード不一致でAuthenticationError
UT-A04: 境界値 - ロック回数4回（ロックされない）
UT-A05: 境界値 - ロック回数5回（AccountLockedError）
UT-A06: 異常系 - email=null でバリデーションエラー
UT-A07: 異常系 - 削除済みユーザーでAuthenticationError

## アンチパターン

「ログインできることを確認」だけで、境界値・異常系・エラーケースのテストがない

## 使いどころ

実装完了後の品質確認、CI/CDパイプライン、リグレッション防止
