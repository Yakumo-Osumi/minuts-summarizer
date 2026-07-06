---
name: branch-naming
description: Issue番号・タイトルから、命名規則に沿ったブランチ名を提案し、承認後にブランチを作成（または切り替え）する。新しい作業ブランチを切りたいときに使う。
disable-model-invocation: true
---

# Branch Naming

Issue番号とタイトルから、`CONTRIBUTING.md`のブランチ運用規則に沿ったブランチ名を提案し、ユーザーが承認した後にブランチの作成（または切り替え）まで行う。

## 情報の取得

まず会話内に対象Issueの番号・タイトルが既に出ているかを確認する。出ていればそれを使う。出ていなければ、Issue番号やURLを手がかりに `gh issue view <番号>` （失敗する場合は `gh api repos/<owner>/<repo>/issues/<番号>`）でタイトルを取得する。

## prefixの決定

prefixの対応表は `CONTRIBUTING.md` の「ブランチ運用」テーブルを参照する（ここでは重複定義しない）。Issueの内容から `feat/fix/docs/style/refactor/chore` のどれに当たるかを判断してprefix案（`feat`は`feature/`に変換）を提示するが、必ずユーザーに確認を取る（`feat`と`fix`等の境界は曖昧なことが多いため）。

## スラッグの生成

`{Issue番号}-{英語スラッグ}` の形式とする。英語スラッグは日本語タイトルのローマ字転写ではなく、内容を要約した**意訳**とする。目安は2〜4単語、kebab-case（小文字・ハイフン区切り）。

例：Issue #11「Issueからブランチ名を提案するSkillを追加」→ `11-branch-naming-skill`

## 提案の提示

`{prefix}/{Issue番号}-{英語スラッグ}` の形式で1つ提案する。ユーザーが承認するまでブランチの作成は行わない。

## 既存ブランチとの衝突

提案前に `git branch --list <ブランチ名>` で同名ローカルブランチの有無を確認する。既に存在する場合は「作成」ではなく「切り替え（`git checkout <ブランチ名>`）」を提案する旨をユーザーに伝える。

## 作成の実行

ユーザーが明示的に承認した後にのみ、以下を実行する：

```bash
# 存在しない場合
git checkout -b <ブランチ名>

# 既に存在する場合
git checkout <ブランチ名>
```

ユーザーの明示的な承認前に `git checkout` を実行してはいけない。

## issue-writing skillとの連携

このSkillは独立して動作し、`issue-writing` skill完了後に自動連鎖はしない。ユーザーが別途明示的に呼び出す。
