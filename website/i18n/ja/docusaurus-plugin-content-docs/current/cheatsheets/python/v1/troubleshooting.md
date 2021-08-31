---
title: トラブルシューティング
id: troubleshooting
description: A cheat sheet for Azure ML.
keywords:
  - azure machine learning
  - aml
  - troubleshooting
---

### エラー: az acr login- APIVersion 2020-11-01-preview is not available.
**説明**:
az acr を使ってイメージをビルドすると NotImplementedError が発生する。
```bash
az acr build --image $image_name --subscription $ws.subscription_id --registry $cr --file docker/Dockerfile docker/
```
エラー表示:
```text
NotImplementedError: APIVersion 2020-11-01-preview is not available.
```

**解決策**:
az cli のバージョンに依存する問題です。下記コマンドを実行して az cli の更新を行ってください。
```bash
az upgrade --yes
```



