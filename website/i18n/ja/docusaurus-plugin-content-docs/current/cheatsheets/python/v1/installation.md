---
title: インストール
description: Guide to installing Azure ML Python SDK and setting up key resources.
keywords:
  - azureml-sdk
  - installation
  - workspace
  - compute
  - cpu
  - gpu
---

Azure ML Python SDK のインストール:

```console
pip install azureml-sdk
```

### ワークスペースの作成

Azure MLの`Workspace`作成のため、Azureサブスクリプション、リソースグループをご用意頂き、`Workspace`の名前を予め決めておいて下さい。
もしAzureサブスクリプションをお持ちでない場合は[当サイトから無料でご利用頂けます](https://azure.microsoft.com/ja-jp/free/)。

```python
from azureml.core import Workspace

ws = Workspace.create(name='<my_workspace_name>', # 任意のワークスペース名
                      subscription_id='<azure-subscription-id>', # サブスクリプションID
                      resource_group='<myresourcegroup>', # 任意のリソースグループ名
                      create_resource_group=True,
                      location='<NAME_OF_REGION>') # リソースを作成するリージョン e.g. 'japaneast'

# ワークスペースの情報を設定ファイルに書き出し: azureml/config.json
ws.write_config(path='.azureml')
```

:::info
次回からは以下のように簡単にワークスペースにアクセスすることができます。
```python
from azureml.core import Workspace
ws = Workspace.from_config()
```
:::

### コンピューティングターゲットの作成

以下の例はワークスペースにコンピューティングターゲットを作成します。

- VM の種類: CPU
- VM のサイズ: STANDARD_D2_V2
- VM クラスターの最大ノード数: 4
- VM クラスターのノードが自動的にスケールインするまでのアイドル時間: 2400秒

GPU を使用したり VM のサイズを変更する場合は以下のコードを変更してください。

```python
from azureml.core import Workspace
from azureml.core.compute import ComputeTarget, AmlCompute
from azureml.core.compute_target import ComputeTargetException

ws = Workspace.from_config() # 自動的に .azureml/ ディレクトリを参照

# 任意のクラスター名
cpu_cluster_name = "cpu-cluster"

try:
    # クラスターが既に存在するかどうかのチェック
    cpu_cluster = ComputeTarget(workspace=ws, name=cpu_cluster_name)
    print('Found existing cluster, use it.')
except ComputeTargetException:
    # もし無ければ作成する
    compute_config = AmlCompute.provisioning_configuration(
        vm_size='STANDARD_D2_V2',
        max_nodes=4,
        idle_seconds_before_scaledown=2400,)
    cpu_cluster = ComputeTarget.create(ws, cpu_cluster_name, compute_config)
    cpu_cluster.wait_for_completion(show_output=True)
```

:::info
次回からは以下のように簡単にコンピューティングターゲットにアクセスすることができます。

```python
from azureml.core import ComputeTarget
cpu_cluster = ComputeTarget(ws, 'cpu-cluster')
```
:::