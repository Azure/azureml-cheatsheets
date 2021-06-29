---
title: Workspace
description: Azure ML ワークスペースの概要
keywords:
  - workspace
---

ワークスペースは、Azure ML で用いられる基本的なオブジェクトであり、他の多くのクラスのコンストラクタの中で使用されます。
このドキュメントを通して、私たちは頻繁にワークスペース・オブジェクトのインスタンス化を省略し、単純に `ws` を参照します。

新規ワークスペースの作成についての説明が必要でしたら、[インストール](installation)を見てください。

## ワークスペースを取得する

AMLアセットへの接続に用いられる `Workspace` オブジェクトをインスタンス化します。

```python title="run.py"
from azureml.core import Workspace
ws = Workspace(
    subscription_id="<subscription_id>",
    resource_group="<resource_group>",
    workspace_name="<workspace_name>",
)
```

利便性のために、ワークスペースのメタデータを `config.json` 内に保存します。

```json title=".azureml/config.json"
{
    "subscription_id": <subscription-id>,
    "resource_group": <resource-group>,
    "workspace_name": <workspace-name>
}
```

### 役立つメソッド

- `ws.write_config(path, file_name)` : あなたの代わりに `config.json` を書き出します。 `path` はデフォルトでカレントワーキングディレクトリ内の '.azureml/' 、 `file_name` はデフォルトで 'config.json' です。
- `Workspace.from_config(path, _file_name)`: コンフィグからワークスペースの設定を読み込みます。そのパラメーターは、カレントディレクトリで検索を開始するのがデフォルトです。

:::info
これらを `.azureml/` ディレクトリに格納するのが推奨されます。 `Workspace.from_config` メソッドでは _デフォルトで_ このパスが検索されるためです。
:::

## ワークスペースのアセットを取得する

ワークスペースは、以下の Azure ML アセットへのハンドラを提供します。

### Compute Targets

ワークスペースにアタッチされた全ての Compute ターゲットを取得します。

```python
ws.compute_targets: Dict[str, ComputeTarget]
```

### Datastores

ワークスペースに登録された全てのデータストアを取得します。

```python
ws.datastores: Dict[str, Datastore]
```

ワークスペースのデフォルトのデータストアを取得します。

```python
ws.get_default_datastore(): Datastore
```

### Keyvault

ワークスペースのデフォルトの Keyvault を取得します。

```python
ws.get_default_keyvault(): Keyvault
```

### Environments

ワークスペースに登録された Environments を取得します。

```python
ws.environments: Dict[str, Environment]
```

### MLFlow

MLFlow の tracking URI を取得します。

```python
ws.get_mlflow_tracking_uri(): str
```