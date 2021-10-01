---
title: デバッグ
description: Guide to debugging in Azure ML.
keywords:
  - debug
  - log files
---

## Azure ML ログファイル

Azure ML のログファイルは Azure ML ワークロード のデバッグを行う上で必須の情報です。

| ログファイル | 説明 |
| - | - |
| `20_image_build_log*.txt` | Docker ビルドログ。環境を更新した時のみ該当。それ以外の場合 Azure ML はキャッシュされたイメージを再利用する。 <br/><br/> もしも成功した場合、関連するイメージのレジストリ詳細情報を含む。 |
| `55_azureml-execution*.txt` | コンピューティングターゲットに対するイメージのプル。このログはコンピューティングリソースが確保された時点で一度だけ作成される。 |
| `65_job_prep*.txt` | ジョブ準備: コンピューティングターゲットやデータストアへのコードのダウンロード。(もしも操作が行われた場合) |
| **`70_driver_log.txt`** | **スクリプトの標準出力。(e.g. コード中の print ステートメント)** <br/><br/> 多くの場合、ユーザーはこのログを確認する。 |
| `75_job_post*.txt` | ジョブのリリース: コンピューティングリソースが Azure へ返された際のログ。 |

:::info
実行のたびにすべてのログファイルを確認する必要はありません。例えば、`20_image_build_log*.txt`は新しいイメージがビルドされた時のみ作成されます。(e.g. 環境変更時)
:::

### Studio からログを確認する

これらのログファイルは Studio UI (https://ml.azure.com) の ワークスペース > 実験 > 実行 > 出力とログ から確認できます。

![](img/log-files.png)

### ストリーミングログ

`Run`オブジェクトを使うことで、ストリームログをローカルターミナルに直接流し込むことができます。以下がその例です:

```python
from azureml.core import Workspace, Experiment, ScriptRunConfig
ws = Workspace.from_config()
config = ScriptRunConfig(...)
run = Experiment(ws, 'my-amazing-experiment').submit(config)
run.wait_for_completion(show_output=True)
```

## SSH

デバッグの一環として、使用中のコンピューティングに対して SSH 接続することも有用な場合があります。

:::warning コンピューティング作成時の SSH 有効化
SSH はコンピューティングインスタンス / コンピューティングターゲット 作成時に有効にする必要があります。詳細は [Compute Targets](compute-targets#with-ssh) を参照してください。
:::

1. コンピューティングの**パブリック IP アドレス**と**ポート番号**を取得します。

  Studio [ml.azure.com](https://ml.azure.com/) の コンピューティングタブから、コンピューティングインスタンスもしくはコンピューティングターゲットを選択します。

  **Note** 接続時にコンピューティングは実行中である必要があります。
    - コンピューティングインスタンスの場合は単に実行中であれば良いです。
    - コンピューティングターゲットの場合は何かのジョブがクラスター上で実行中されている必要があります。このとき、クラスターのノードタブから、各ノードのパブリック IP アドレスとポート番号を確認することができます。([ml.azure.com](https://ml.azure.com/) > コンピューティング > _対象のコンピューティングターゲット_ > ノード)

2. 任意のシェルで下記を実行します:

  ```bash
  ssh azureuser@<public-ip> -p <port-number>
  ```


:::info RSA を使った SSH キーペア
SSH パブリック-プライベートキーペアが推奨されています。詳細は[こちら](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/mac-create-ssh-keys)を参照してください。
:::

