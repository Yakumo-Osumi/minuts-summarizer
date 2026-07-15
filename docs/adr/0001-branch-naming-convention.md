# ブランチ命名規則を `{prefix}/{Issue番号}-{英語スラッグ}` に統一する

Issue #11（ブランチ名提案Skillの追加）対応にあたり、ブランチ命名規則を決定した。ブランチprefixはコミットメッセージprefix（`feat/fix/docs/style/refactor/chore`）と1:1で対応させ6種に拡張し（`feat:`のみ`feature/`に変換）、CONTRIBUTING.mdの「ブランチ運用」テーブルに反映した。続く`{英語スラッグ}`部分は、Issue番号を先頭に必須で付与し、日本語タイトルをローマ字転写ではなく**意訳**した2〜4単語程度のkebab-caseとする（例: `feature/11-branch-naming-skill`）。

これにより、`feature/backend-api`のようなIssue番号なしのブランチ名は今後作らない運用に切り替える。

## Considered Options

- 英語化方針：ローマ字転写／意訳／Issue番号のみ（スラッグなし） → 意訳を採用。ローマ字は英語圏レビュアーに情報量が少なく、番号のみは可読性が落ちるため。
- ブランチprefix：feature/fixの2種のみ／コミットprefixと同じ6種 → 6種を採用。既に`chore/setup-claude-skills`が実在し、CONTRIBUTING.md側が実態に追いついていなかったため。
