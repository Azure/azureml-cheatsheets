---
title: チートシート
id: cheatsheet
description: A cheat sheet for Azure ML.
keywords:
  - azure machine learning
  - aml
  - cheatsheet
  - overview
---


## 基本セットアップ

### ワークスペースへの接続

```python
from azureml.core import Workspace
ws = Workspace.from_config()
```

この Workspace オブジェクトは Azure ML 操作における基本的なオブジェクトで、一連のコードを通して共有されます。(`ws`という変数名で参照されることが多いです。)

ワークスペースの詳細: [Workspaces](./workspace.md)

### コンピューティングターゲットへの接続

```python
compute_target = ws.compute_targets['<compute-target-name>']
```

**使用例**

```python
compute_target = ws.compute_targets['powerful-gpu']

config = ScriptRunConfig(
    compute_target=compute_target,  # train.py スクリプトを実行するために使用されるコンピューティングターゲット
    source_directory='.',
    script='train.py',
)
```

コンピューティングターゲットの詳細: [コンピューティングターゲット](./compute-targets.md)

### Python 環境の準備

pip の`requirements.txt`ファイルや Conda の`env.yml`ファイルを使い、コンピューティング環境の Python 環境を Environment オブジェクトとして定義することができます。

```python
from azureml.core import Environment
# 選択肢 1: pip
environment = Environment.from_pip_requirements('<env-name>', '<path/to/requirements.txt>')
# 選択肢 2: Conda
environment = Environment.from_conda_specification('<env-name>', '<path/to/env.yml>')
```

docker イメージを使って環境を準備することもできます。

**使用例**

```python
environment = Environment.from_pip_requirements('<env-name>', '<path/to/requirements.txt>')

config = ScriptRunConfig(
    environment=environment,  # Python 環境を設定する
    source_directory='.',
    script='train.py',
)
```

環境の詳細: [環境](./environment.md)


## コードをサブミットする

Azure ML 上でコードを実行するためには:

1. エントリーポイントとなるコードのパス、コードを実行するコンピューティングターゲット、そしてコードを実行する Python 環境の**設定情報を作成**します。
2. Azure ML の実験を新規作成または再利用して**サブミット**します。

### ScriptRunConfig

典型的なディレクトリ構成例:

```bash
source_directory/
    script.py    # エントリーポイントとなるコード
    module1.py   # script.py により呼ばれるモジュール
    ...
```

リモートコンピューティングクラスター`target: ComputeTarget`上の、Python 環境`env: Environment`で、`$ (env) python <path/to/code>/script.py [arguments]`を実行するには、 `ScriptRunConfig`クラスを使用します。

```python
from azureml.core import ScriptRunConfig

config = ScriptRunConfig(
    source_directory='<path/to/code>',  # 相対パスでも OK
    script='script.py',
    compute_target=compute_target,
    environment=environment,
    arguments=arguments,
)
```

ScriptRunConfig の引数の詳細: [Command line arguments](./script-run-config.md#command-line-arguments)

:::info
- `compute_target`: もし引数が与えられなかった場合は、スクリプトはローカルマシン上で実行されます。
- `environment`: もし引数が与えられなかった場合、Azure ML のデフォルトPython 環境が使用されます。環境の詳細: [Environment](./environment.md)
:::

#### コマンド

もしも明示的なコマンドを与える場合。

```python
command = 'echo cool && python script.py'.split()

config = ScriptRunConfig(
    source_directory='<path/to/code>',  # 相対パスも OK
    command=command,
    compute_target=compute_target,
    environment=environment,
    arguments=arguments,
)
```

コマンドの詳細: [コマンドライン引数](./script-run-config.md#コマンドライン引数)

### 実験

コードをサブミットするには`実験`を作成します。実験は、サブミットされた一連のコードをグルーピングしてコードの実行履歴を追跡する軽量のコンテナです。 (参照: [Run History](./run-history.md)).


```python
exp = Experiment(ws, '<experiment-name>')
run = exp.submit(config)
print(run.get_portal_url())
```

上記コードで返される Azure ML Studio へのリンクにより、実験の実行をモニタリングすることができます。

詳細: [ScriptRunConfig](./script-run-config.md)

### 使用例

以下はコマンドラインから Conda 環境を使ってトレーニングスクリプト`train.py`をローカルマシン上で実行する典型的な例です。

```bash
$ conda env create -f env.yml  # pythorch という名前の conda env を作成
$ conda activate pytorch
(pytorch) $ cd <path/to/code>
(pytorch) $ python train.py --learning_rate 0.001 --momentum 0.9
```

このスクリプトを Azure 上の GPU を使って実行したいと仮定します。

```python
ws = Workspace.from_config()
compute_target = ws.compute_targets['powerful-gpu']
environment = Environment.from_conda_specification('pytorch', 'env.yml')

config = ScriptRunConfig(
    source_directory='<path/to/code>',
    script='train.py',
    environment=environment,
    arguments=['--learning_rate', 0.001, '--momentum', 0.9],
)

run = Experiment(ws, 'PyTorch model training').submit(config)
```

## 分散 GPU 学習

分散 GPU 学習を有効にするために`ScriptRunConfig`を変更します。

```python {3,8-9,12,19}
from azureml.core import Workspace, Experiment, ScriptRunConfig
from azureml.core import Environment
from azureml.core.runconfig import MpiConfiguration

ws = Workspace.from_config()
compute_target = ws.compute_targets['powerful-gpu']
environment = Environment.from_conda_specification('pytorch', 'env.yml')
environment.docker.enabled = True
environment.docker.base_image = 'mcr.microsoft.com/azureml/openmpi3.1.2-cuda10.1-cudnn7-ubuntu18.04'

# それぞれ 4 つの GPU を搭載した 2 つのノード上でトレーニングを行う
mpiconfig = MpiConfiguration(process_count_per_node=4, node_count=2)

config = ScriptRunConfig(
    source_directory='<path/to/code>',  # train.py が含まれるディレクトリ
    script='train.py',
    environment=environment,
    arguments=['--learning_rate', 0.001, '--momentum', 0.9],
    distributed_job_config=mpiconfig,   # 分散学習のための設定を追加
)

run = Experiment(ws, 'PyTorch model training').submit(config)
```

:::info
- `mcr.microsoft.com/azureml/openmpi3.1.2-cuda10.1-cudnn7-ubuntu18.04`は OpenMPI の docker イメージです。このイメージは Azure ML 上で分散学習を実行する際に必要となります。
- `MpiConfiguration`はトレーニングを行うノード数とノードあたりの GPU 数を指定するために使います。
:::

詳細: [Distributed GPU Training](./distributed-training.md)

## データへの接続

ワークスペース`ws`のデフォルトデータストアにあるデータをトレーニングスクリプトから扱うためには:

```python
datastore = ws.get_default_datastore()
dataset = Dataset.File.from_files(path=(datastore, '<path/on/datastore>'))
```
詳細: [Data](./data.md)

コマンドライン引数に以下を渡すことで上記の`dataset`を使用できます。

```python
arguments=['--data', dataset.as_mount()]
```
