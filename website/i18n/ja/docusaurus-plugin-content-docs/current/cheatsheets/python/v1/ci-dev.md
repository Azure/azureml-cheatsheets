---
title: Azure ML 上での開発
description: Guide to developing your code on Azure ML.
keywords:
  - ssh
  - development
  - compute
---

本ガイドでは、Azure ML 上でのコード開発をするためのポイントを紹介します。典型的なシナリオとしては、分散学習のコードのテストやローカルの開発環境での再現が難しいものを対象にします。

これらのシナリオの共通のペインポイントは、特に VM 上での開発と比較して、Azure ML での繰り返し作業が遅く感じられる点です。


**本ガイドの目的** Azure ML 上での開発体験をベアメタルの VM と同等もしくはそれ以上に改善することです。

## 🚧 ハードル

Azure ML での開発が遅く感じられる主な理由は 2 つあります。
- Python 環境の変更には Docker イメージの再構築が必須となり、通常 5 分以上かかる。
- 計算リソースはイテレーションの間に _解放される_ ために、(Docker イメージの Pull などの) ウォームアップの待機時間が発生する。

下記にてこれらの問題に対応するためのいくつかのテクニックと、Azure ML Compute を直接利用するメリットを紹介します。またこれらのテクニックを利用したい[例](#例)もいくつか提供します。


## 🕰️ 開発用計算環境の準備

_コンピューティングインスタンス / コンピューティングクラスター_ を作成するときに、何点か設定事項があります : 


1. **SSH の有効化**

    SSH は、_コンピューティングインスタンス_ と _コンピューティングクラスター_ の両方でサポートされています。VM のように操作することが出来るようになります。

    :::tip VS Code Remote Extension.
    VS Code の [remote extension](https://code.visualstudio.com/docs/remote/ssh)
    は SSH 経由で Azure ML への計算リソースへの接続ができます。クラウド上で直接開発できるようになります。
    :::

2. **"スケールダウンする前のアイドル時間 (秒)" の増加**

    コンピューティングクラスターはこのパラメータを例えば 30 分に増やすことができます。これは開発のイテレーションをしている間に計算環境がリリースされないようにするためです。

    :::warning
    開発のイテレーション終了後に元に戻すことを忘れないようにしてください。
    :::

## 🏃‍♀️ コマンド

通常 コードは以下のような `ScriptRunConfig` を利用して Azure ML へ送信されます : 

```python
config = ScriptRunConfig(
    source_directory='<path/to/source_directory>',
    script='script.py',
    compute_target=target,
    environment=env,
    ...
)
```

:::info
コードを送信するのに利用する `ScriptRunConfig` に関するより詳細な情報は [クラウド上でコードを実行する](script-run-config) を参照ください。
:::
[`コマンド`](script-run-config#commands) の引数を用いることでアジリティを向上することができます。以下のように、コマンドを用いて複数のステップを連結されることができます : 

```python
command = "pip install torch && python script.py --learning_rate 2e-5".split()
```

他の例として下記のようなセットアップスクリプトを含めることもできます :

```bash title="setup.sh"
echo "Running setup script"
pip install torch
pip install -r requirements.txt
export PYTHONPATH=$PWD
```

を作成し、コマンドで呼び出します。

```python
command = "bash setup.sh && python script.py --learning_rate 2e-5".split()
```

この方法であれば、Azure ML は追加分について Docker Image をリビルドする必要がありません。

## メリット

VM 上での開発ができるだけでなく、Azure ML の計算環境を直接利用することによるメリットもあります。

- **本番にすぐに展開可能.** Azure ML 上で直接開発することで、VM で開発したコードを Azure ML に移植する手間を削減できます。これは本番コードをAzure ML 上で稼働される場合に該当します。
- **データアクセス.** 学習スクリプトが Azure 上のデータを利用する際、Azure ML Python SDK を用いていることができます (例としては[Data](data) を参照のこと)。それ以外の方法となるとユーザ自身で、開発している VM 上でデータが取得できる方法を探す必要があります。
- **ノートブック.** Azure ML の _コンピューティングインスタンス_ は Jupyter notebook を提供しておりクイックにデバッグすることできます。加えて、ノートブックは異なる計算基盤に対して実行できますし、コラボレーションの機能も提供しています。


## 例

ここでは、簡易的なデモンストレーションで上記の仕組みを説明します。次のような設定を考えます。:

```bash
src/
    .azureml/
        config.json     # workspace への接続設定
    train.py            # 開発している Python スクリプト
    setup.sh            # train.py の前に実行するスクリプト
    azureml_run.py      # azure への job 実行
```

```bash title="setup.sh"
echo "Running setup script"
pip install numpy
```

```python title="train.py"
import numpy as np
print(np.random.rand())
```

Azure ML Python SDK を用いて、ローカル端末からクラウド上でコマンドを実行できます。

```python title="azureml_run.py"
from azureml.core import Workspace, Experiment, ScriptRunConfig

# workspace の取得
ws = Workspace.from_config()
target = ws.compute_targets['cpucluster']
exp = Experiment(ws, 'dev-example')

command = "bash setup.sh && python script.py".split()

# script run 構成設定
config = ScriptRunConfig(
    source_directory='.',
    command=command,
    compute_target=target,
)

# AML への script 送信
run = exp.submit(config)
print(run.get_portal_url()) # link to ml.azure.com
run.wait_for_completion(show_output=True)
```

Python 環境の更新が必要な場合は、`setup.sh` にコマンドを追加するだけです。:

```bash title="setup.sh"
echo "Running setup script"
pip install numpy
pip install pandas                  # 追加のライブラリ
export CUDA_VISIBLE_DEVICES="0,1"   # 環境変数の設定
nvidia-smi                          # 便利なコマンドラインツールの実行
```

Docker イメージを再構築する必要はありません。
