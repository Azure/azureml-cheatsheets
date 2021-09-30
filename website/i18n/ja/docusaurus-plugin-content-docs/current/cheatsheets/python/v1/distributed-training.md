---
title: 分散 GPU トレーニング
id: distributed-training
description: Guide to distributed training in Azure ML.
keywords:
  - distributed training
  - mpi
  - process group
  - pytorch
  - horovod
  - tensorflow
---

## 基本的なコンセプト

このガイドの読者は _data parallelism、distributed data parallelism、model parallelism_ などの分散 GPU トレーニングに対する基本的なコンセプトを理解していると想定しています。

:::info
どの parallelism を使うべきか判断できない場合: 90% 以上の場合で __Distributed Data Parallelism__ が使われます。
:::

## MPI (Message Passing Interface)

Azure ML は各ノードで与えられたプロセッサー数の MPI ジョブを提供します。利用者は、`process_count_per_node`が 1 に設定されている場合 (デフォルト) は per-node-launcher、デバイス/ GPU の数に等しい場合は per-process-launcher を使って分散トレーニングを実行することができます。Azure ML は裏側で完全な MPI 実行コマンド (`mpirun`) を構築して処理します。

:::note
Azure ML は今のところユーザーからの完全な`mpirun`のような head-node-launcher コマンドや DeepSpeed ランチャーを受け取ることができません。この機能は将来のリリースで追加される可能性があります。
:::

:::caution
Azure ML の MPI ジョブを使うために、ベースとなる Docker イメージには MPI ライブラリがインストールされている必要があります。[Open MPI](https://www.open-mpi.org/) はすべての [AzureML GPU ベースイメージ](https://github.com/Azure/AzureML-Containers)に含まれています。もしもカスタム Docker イメージを使う場合にはユーザーが責任を持って MPI ライブラリをインストールする必要があります。Open MPI が推奨ですが、Intel MPI などの他の MPI 実装を使うこともできます。Azure ML はこの他にも[人気のあるフレームワークのキュレーションされた環境](https://docs.microsoft.com/en-us/azure/machine-learning/resource-curated-environments)も提供します。
:::

MPIを使って分散トレーニングを実行するには下記のステップに従います:
1. Azure ML 環境、好みのディープラーニングフレームワーク、MPI を使います。AzureML は人気のあるフレームワーク環境を提供します。[キュレーションされた環境](https://docs.microsoft.com/en-us/azure/machine-learning/resource-curated-environments)
2. `MpiConfiguration`を定義して望ましい`process_count_per_node`と`node_count`を設定します。per-process-launch の場合は`process_count_per_node`はノードあたりのGPU数と同じにする必要があります。もしもユーザースクリプトがノードあたりの実行プロセス数に責任を持つ場合、per-node-launch は 1 (デフォルト値)に設定します。
3. `MpiConfiguration`オブジェクトを`ScriptRunConfig`のパラメータである`distributed_job_config`に渡します。

```python
from azureml.core import Workspace, ScriptRunConfig, Environment, Experiment
from azureml.core.runconfig import MpiConfiguration

curated_env_name = 'AzureML-PyTorch-1.6-GPU'
pytorch_env = Environment.get(workspace=ws, name=curated_env_name)
distr_config = MpiConfiguration(process_count_per_node=4, node_count=2)

run_config = ScriptRunConfig(
  source_directory= './src',
  script='train.py',
  compute_target=compute_target,
  environment=pytorch_env,
  distributed_job_config=distr_config,
)

# ジョブを開始するために構成情報をサブミットする
run = Experiment(ws, "experiment_name").submit(run_config)
```

### Horovod

もしもユーザーが選択したディープラーニングフレームワークと共に [Horovod](https://horovod.readthedocs.io/en/stable/index.html) を分散トレーニングに使う場合、MPI ジョブ構成を使うことで Azure ML 上で分散トレーニングを実行することができます。

下記が行われていることを確認してください:
* トレーニングコードが正しく Horovod で実装されていること。
* コードを実行する Azure ML 環境に Horovod と MPI を含んでいること。PyTorch と TensorFlow のキュレーションされた GPU 環境には Horovod とその設定情報が付属しています。
* 任意の分散を指定した`MpiConfiguration`が作成されていること。

#### 例
* [azureml-examples: TensorFlow distributed training using Horovod](https://github.com/Azure/azureml-examples/tree/main/workflows/train/tensorflow/mnist-distributed-horovod)

### DeepSpeed

Azure ML 上で [DeepSpeed](https://www.deepspeed.ai/) を使って分散トレーニングを行うには、DeepSpeed のカスタムランチャーを使わないでください。代わりに、[MPI](https://www.deepspeed.ai/getting-started/#mpi-and-azureml-compatibility) を使ってトレーニングジョブを実行してください。

下記が行われていることを確認してください:
* ジョブを実行する Azure ML 環境が DeepSpeed とその依存関係、Open MPI、mpi4py を含んでいること。
* 任意の分散を指定した`MpiConfiguration`が作成されていること。

#### 例
* [azureml-examples: Distributed training with DeepSpeed on CIFAR-10](https://github.com/Azure/azureml-examples/tree/main/workflows/train/deepspeed/cifar)

### Open MPI の環境変数

MPI ジョブを Open MPI イメージで実行する時、実行されたそれぞれのプロセスに対して下記の環境変数が作成されます。
1. OMPI_COMM_WORLD_RANK - プロセスのランク
2. OMPI_COMM_WORLD_SIZE - ワールドのサイズ (プロセスが含まれるMPI_COMM_WORLD内に存在するプロセス数)
3. AZ_BATCH_MASTER_NODE - マスターアドレスとポート、MASTER_ADDR:MASTER_PORT
4. OMPI_COMM_WORLD_LOCAL_RANK - ノード上でのプロセスのローカルランク
5. OMPI_COMM_WORLD_LOCAL_SIZE - ノード上のプロセス数

:::caution
名前にもかかわらず、OMPI_COMM_WORLD_NODE_RANK は NODE_RANK と対応していません。per-node-launcher を使うには、単に`process_count_per_node=1`を設定して、OMPI_COMM_WORLD_RANK を NODE_RANKとして使います。
:::

## PyTorch

Azure ML は PyTorch の分散トレーニング機能 (`torch.distributed`) を使った分散ジョブ実行もサポートしています。

:::tip torch.nn.parallel.DistributedDataParallel 対 torch.nn.DataParallel / torch.multiprocessing の比較
シングルノード、マルチノード分散トレーニングどちらの場合も、並列処理については [PyTorch の公式ガイド](https://pytorch.org/tutorials/intermediate/ddp_tutorial.html#comparison-between-dataparallel-and-distributeddataparallel)では DistributedDataParallel (DDP) を DataParallel よりも優先して使っています。さらに、PyTorch は [multiprocessing パッケージよりも DistributedDataParallel を推奨しています](https://pytorch.org/docs/stable/notes/cuda.html#use-nn-parallel-distributeddataparallel-instead-of-multiprocessing-or-nn-dataparallel)。よって、Azure ML のドキュメントとサンプルも DistributedDataParallel に注目します。
:::

### プロセスグループ初期化

分散トレーニングのバックボーンは、互いの存在を知っていてコミュニケーションを取り合うプロセスのグループによって成り立っています。PyTorch の場合、そのプロセスのグループは __すべての分散プロセス__ の中で [torch.distributed.init_process_group](https://pytorch.org/docs/stable/distributed.html#torch.distributed.init_process_group) を呼ぶことで作成されます。

```
torch.distributed.init_process_group(backend='nccl', init_method='env://', ...)
```

最も一般的に使われるコミュニケーションバックエンドは __mpi__、__nccl__、__gloo__ です。GPU ベースのトレーニングでは、パフォーマンスの観点から __nccl__ が強く推奨されており、可能な場合はこれを使用すべきです。

`init_method`は、コミュニケーションバックエンドを使ってプロセスグループを確認するだけではなく、各プロセスが互いを見つける方法を指定したり、初期化を行います。デフォルトでは、`init_method`が指定されていない場合、PyTorchは環境変数の初期化メソッド (`env://`) を使います。Azure ML 上で分散 PyTorch を実行するためのトレーニングコードでも、この初期化メソッドを使うことが推奨されています。環境変数の初期化のために PyTorch は下記の環境変数を探します:

- **MASTER_ADDR** - ランク 0 のプロセスをホストするマシンの IP アドレス。
- **MASTER_PORT** - ランク 0 のプロセスをホストするマシンのフリーポート。
- **WORLD_SIZE** - プロセスの合計数。この数は分散トレーニングで使用されるデバイス (GPU) の数と同じにすべきです。
- **RANK** - 現在のプロセスのグローバルランク。考えられる値は 0 からワールドサイズ -1 までです。

プロセスグループの初期化に関するより詳細な情報は次のリンク先を参照してください。 [PyTorch documentation](https://pytorch.org/docs/stable/distributed.html#torch.distributed.init_process_group)

これより先に記載する多くのアプリケーションが同じく下記の環境変数を必要とします:
- **LOCAL_RANK** - ノード上のプロセスのローカル (相対) ランク。考えられる値は 0 からノード上のプロセス数 -1 までです。データ準備のような様々なオペレーションがノードごとに 1 回ずつ実行されるため、この情報は有用です。 --- 通常 local_rank = 0 を使用します。
- **NODE_RANK** - マルチノードトレーニングで使われるノードのランクです。考えられる値は 0 からノード数の合計 -1 までです。

### 実行オプション

Azure ML の PyTorch ジョブは分散トレーニングを実行する 2 種類のオプションをサポートしています。

1. __Per-process-launcher__: システムはユーザーのために、プロセスグループをセットアップする関連情報 (e.g. 環境変数) と共に、すべての分散プロセスを実行します。
2. __Per-node-launcher__: ユーザーは Azure ML に対して、各ノードでの実行を受け取るユーティリティランチャーを与えます。このユーティリティランチャーは与えられたノード上での各プロセスの実行を管理します。各ローカルノードでは、ユーティリティランチャーによって RANK と LOCAL_RANK が設定されます。**torch.distributed.launch** ユーティリティと PyTorch Lightning の両方がこちらに該当します。

これらの実行オプションの間に根本的な差はありません。ほとんどユーザーの好み、もしくは Lightning や Hugging Face などのよく見る PyTorch フレームワーク・ライブラリのしきたりによるものです。

以下のシナリオは、それぞれの実行オプションにおける Azure ML PyTorch ジョブの構成方法のより詳細な情報に踏み込みます。

### DistributedDataParallel (per-process-launch)

Azure ML は`torch.distributed.launch`のようなランチャーユーティリティを使うことなくプロセスを実行することをサポートしています。

分散 PyTorch ジョブを実行するためには、下記のことをするだけです:
1. トレーニングスクリプトと引数を指定します。
2. `PyTorchConfiguration`を作成し、`node_count`と`process_count`を指定します。`process_count`は実行したいジョブにおける合計プロセス数と一致します。この値は一般的に`ノードあたりの GPU 数 x ノード数`と同じです。`process_count`が指定されない場合、Azure ML はデフォルトで各ノードにつき 1 プロセスずつ実行します。

Azure ML はプロセスレベルで RANK と LOCAL_RANK の環境変数を設定した上で、各ノードで MASTER_ADDR、MASTER_PORT、WORLD_SIZE、NODE_RANK の環境変数を設定します。

:::caution
各ノード上でマルチプロセスのトレーニングを実行するためにこのオプションを使用するためには、Azure ML Python SDK `>= 1.22.0`を使用する必要があります。これは、process_count がバージョン 1.22.0 で導入されたためです。
:::

```python
from azureml.core import ScriptRunConfig, Environment, Experiment
from azureml.core.runconfig import PyTorchConfiguration

curated_env_name = 'AzureML-PyTorch-1.6-GPU'
pytorch_env = Environment.get(workspace=ws, name=curated_env_name)
distr_config = PyTorchConfiguration(process_count=8, node_count=2)

run_config = ScriptRunConfig(
  source_directory='./src',
  script='train.py',
  arguments=['--epochs', 50],
  compute_target=compute_target,
  environment=pytorch_env,
  distributed_job_config=distr_config,
)

run = Experiment(ws, 'experiment_name').submit(run_config)
```

:::tip
もしもトレーニングスクリプトがローカルランクランクやランクをスクリプト引数として受け取る場合、引数の中でこのように環境変数を参照することができます: `arguments=['--epochs', 50, '--local_rank', $LOCAL_RANK]`
:::

#### 例
- [azureml-examples: Distributed training with PyTorch on CIFAR-10](https://github.com/Azure/azureml-examples/tree/main/workflows/train/pytorch/cifar-distributed)

### `torch.distributed.launch` (per-node-launch) の使用

PyTorch は各ノード上でマルチプロセスを実行するためのするためのユーティリティとして [torch.distributed.launch](https://pytorch.org/docs/stable/distributed.html#launch-utility) を提供します。この`torch.distributed.launch`モジュールは各ノード上で複数のトレーニングプロセスを生成します。

以下のステップはどのように Azure ML 上で per-node-launcher により PyTorch ジョブを構成するかというデモンストレーションです。これは以下のコマンドを実行することと同等のことです。

    python -m torch.distributed.launch --nproc_per_node <num processes per node> \
      --nnodes <num nodes> --node_rank $NODE_RANK --master_addr $MASTER_ADDR \
      --master_port $MASTER_PORT --use_env \
      <your training script> <your script arguments>

1. `torch.distributed.launch`コマンドを`ScriptRunConfig`コンストラクタの`command` パラメータに与えます。Azure ML はユーザーが指定したクラスター上の各ノード上でこのコマンドを実行します。`--nproc_per_node`は各ノードで利用可能な GPU 数と同じかそれ以下に設定します。MASTER_ADDR、MASTER_POR、NODE_RANK のすべては Azure ML によって設定されるため、ユーザーはコマンド中でこれらの環境変数を参照するだけで済みます。Azure ML は MASTER_PORT を`6105` に設定しますが、ユーザーは必要に応じて異なる値を torch.distributed.launch コマンドの`--master_port`引数に渡すこともできます。(その時、実行ユーティリティは環境変数を再設定します。)
2. `PyTorchConfiguration`を作成し、`node_count`を指定します。

```python
from azureml.core import ScriptRunConfig, Environment, Experiment
from azureml.core.runconfig import PyTorchConfiguration

curated_env_name = 'AzureML-PyTorch-1.6-GPU'
pytorch_env = Environment.get(workspace=ws, name=curated_env_name)
distr_config = PyTorchConfiguration(node_count=2)
launch_cmd = "python -m torch.distributed.launch --nproc_per_node 4 --nnodes 2 --node_rank $NODE_RANK --master_addr $MASTER_ADDR --master_port $MASTER_PORT --use_env train.py --epochs 50".split()

run_config = ScriptRunConfig(
  source_directory='./src',
  command=launch_cmd,
  compute_target=compute_target,
  environment=pytorch_env,
  distributed_job_config=distr_config,
)

run = Experiment(ws, 'experiment_name').submit(run_config)
```

:::tip: シングルノードマルチ GPU トレーニング
もしもシングルノードマルチ GPU の PyTorch トレーニングを実行するためにこの実行ユーティリティを使用する場合は、ScriptRunConfig の`distributed_job_config`を指定する必要はありません。

```python
launch_cmd = "python -m torch.distributed.launch --nproc_per_node 4 --use_env train.py --epochs 50".split()

run_config = ScriptRunConfig(
  source_directory='./src',
  command=launch_cmd,
  compute_target=compute_target,
  environment=pytorch_env,
)
```
:::

#### 例
- [azureml-examples: Distributed training with PyTorch on CIFAR-10](https://github.com/Azure/azureml-examples/tree/main/workflows/train/pytorch/cifar-distributed)

### PyTorch Lightning

[PyTorch Lightning](https://pytorch-lightning.readthedocs.io/en/stable/) は軽量のオープンソースライブラリで、PyTorch のハイレベルなインターフェースを提供します。Lightning を使うことで、素の PyTorch により必要とされる低レベルの分散トレーニング構成の大部分を抽象化して、シングル GPU、シングルノードマルチ GPU、マルチノードマルチ GPU 設定のトレーニングスクリプトを実行することができます。この裏側では`torch.distributed.launch`のようにマルチプロセスが実行されます。

シングルノードトレーニング (シングルノードマルチ GPU トレーニングを含む) では、`distributed_job_config`を指定することなく Azure ML 上でコードを実行することができます。Lightning でマルチノードトレーニングを行う場合は、ユーザーが指定したトレーニングクラスター上の各ノードで下記の環境変数が設定されている必要があります。

- MASTER_ADDR
- MASTER_PORT
- NODE_RANK

マルチノード Lightning トレーニングを Azure ML 上で実行する場合は [per-node-launch guide](#using-distributedddataparallel-per-node-launch) を参考にしてください:

- `PyTorchConfiguration`を定義して望ましい`node_count`を指定します。Lightning は内部的に各ノードのワーカープロセス実行を管理するため、`process_count`を指定してはいけません。
- PyTorch ジョブのために、Azure ML は Lightning が必要とする MASTER_ADDR、MASTER_PORT、and NODE_RANK 環境変数の制御を行います。
- Lightning は`--gpus`や`--num_nodes`などのトレーナーフラグからコンピューティングのワールドサイズを制御し、内部的にランクやローカルランクを管理します。

```python
from azureml.core import ScriptRunConfig, Experiment
from azureml.core.runconfig import PyTorchConfiguration

nnodes = 2
args = ['--max_epochs', 50, '--gpus', 2, '--accelerator', 'ddp', '--num_nodes', nnodes]
distr_config = PyTorchConfiguration(node_count=nnodes)

run_config = ScriptRunConfig(
  source_directory='./src',
  script='train.py',
  arguments=args,
  compute_target=compute_target,
  environment=pytorch_env,
  distributed_job_config=distr_config,
)

run = Experiment(ws, 'experiment_name').submit(run_config)
```

#### 例
* [azureml-examples: Multi-node training with PyTorch Lightning](https://github.com/Azure/azureml-examples/blob/main/tutorials/using-pytorch-lightning/4.train-multi-node-ddp.ipynb)

### Hugging Face Transformers

Hugging Face は、`torch.distributed.launch`を使って分散トレーニングを実行する Transformers を使う際の多くの [サンプル](https://github.com/huggingface/transformers/tree/master/examples) を提供しています。Hugging Face Transformers Trainer API を使ってこれらのサンプルや任意のカスタムトレーニングスクリプトを実行するためには、[torch.distributed.launch の使用](#torchdistributedlaunch-per-node-launch-の使用) のセクションを参考にしてください。

8 つの GPU を搭載したノード上で`run_glue.py`というスクリプトによりテキスト分類 MNLI タスクを解く BERT の巨大モデルのファインチューニングジョブを構成するコードの例:

```python
from azureml.core import ScriptRunConfig
from azureml.core.runconfig import PyTorchConfiguration

distr_config = PyTorchConfiguration() # デフォルト node_count は 1
launch_cmd = "python -m torch.distributed.launch --nproc_per_node 8 text-classification/run_glue.py --model_name_or_path bert-large-uncased-whole-word-masking --task_name mnli --do_train --do_eval --max_seq_length 128 --per_device_train_batch_size 8 --learning_rate 2e-5 --num_train_epochs 3.0 --output_dir /tmp/mnli_output".split()

run_config = ScriptRunConfig(
  source_directory='./src',
  command=launch_cmd,
  compute_target=compute_target,
  environment=pytorch_env,
  distributed_job_config=distr_config,
)
```

`torch.distributed.launch`を使わずに、[per-process-launch](#distributeddataparallel-per-process-launch) オプションを使用して分散トレーニングを実行することもできます。このメソッドを使う際に気をつけることは、Transformers [TrainingArguments](https://huggingface.co/transformers/main_classes/trainer.html?highlight=launch#trainingarguments) は引数中のローカルランク (`--local_rank`) を除外することです。`torch.distributed.launch`は`--use_env=False`が設定されているときこれを管理しますが、Azure ML は LOCAL_RANK 環境変数のみを設定するため、per-process-launch を使うときは明示的に`--local_rank=$LOCAL_RANK`引数をトレーニングスクリプトに渡す必要があります。

## TensorFlow

もしもトレーニングコードで TensorFlow 2.x の `tf.distribute.Strategy` API のような [native distributed TensorFlow](https://www.tensorflow.org/guide/distributed_training) を使っている場合は Azure ML の`TensorflowConfiguration`を介して分散ジョブを実行することができます。

そのためには、`ScriptRunConfig`コンストラクタの`distributed_job_config`パラメータに`TensorflowConfiguration`オブジェクトを指定する必要があります。もしも`tf.distribute.experimental.MultiWorkerMirroredStrategy`を使っている場合は、トレーニングジョブで使用するノード数を`TensorflowConfiguration`の`worker_count`で指定します。

```python
from azureml.core import ScriptRunConfig, Environment, Experiment
from azureml.core.runconfig import TensorflowConfiguration

curated_env_name = 'AzureML-TensorFlow-2.3-GPU'
tf_env = Environment.get(workspace=ws, name=curated_env_name)
distr_config = TensorflowConfiguration(worker_count=2, parameter_server_count=0)

run_config = ScriptRunConfig(
  source_directory='./src',
  script='train.py',
  compute_target=compute_target,
  environment=tf_env,
  distributed_job_config=distr_config,
)

# ジョブを開始するために構成情報をサブミットします。
run = Experiment(ws, "experiment_name").submit(run_config)
```

分散トレーニングのスクリプトが parameter server strategy を使用する場合 (i.e. レガシーな TensorFlow 1.x を使う場合) は、合わせてジョブの中で使用する parameter server の数を指定する必要があります。 (e.g. `tf_config = TensorflowConfiguration(worker_count=2, parameter_server_count=1)`)

### TF_CONFIG

TensofFlow を使って複数のマシン上でのトレーニングを実行するには **TF_CONFIG** 環境変数が必要になります。TensorFlow ジョブを実行するために、Azure ML はトレーニングスクリプトを実行する前に各ワーカーに対して適切な TF_CONFIG 変数を設定します。

もし必要な場合は、トレーニングスクリプトから`os.environ['TF_CONFIG']`によって TF_CONFIG にアクセスすることができます。

チーフワーカーノードで TF_CONFIG を設定する例:
```json
TF_CONFIG='{
    "cluster": {
        "worker": ["host0:2222", "host1:2222"]
    },
    "task": {"type": "worker", "index": 0},
    "environment": "cloud"
}'
```

#### 例
- [azureml-examples: Distributed TensorFlow training with MultiWorkerMirroredStrategy](https://github.com/Azure/azureml-examples/tree/main/workflows/train/tensorflow/mnist-distributed)

## InfiniBand による GPU トレーニングのアクセラレーション

Azureには、SR-IOV と InfiniBand をサポートする RDMA 対応の VM シリーズがあります (NC、ND、H-シリーズ)。これらの VM は、Ethernet ベースの接続性よりもはるかに高性能の、低遅延で高帯域幅の InfiniBand ネットワークを介してコミュニケーションを行います。SR-IOV for InfiniBand は、MPI ライブラリ (MPI は NVIDIA の NCCL ソフトウェアを含む分散トレーニングフレームワークやツールによって利用されます) に対してニアベアメタルパフォーマンスを提供します。これらの SKU は 高計算負荷ワークロードや、GPU によりアクセラレートされる機械学習ワークロードのニーズを満たすことを目的としています。より詳細な情報は [Accelerating Distributed Training in Azure Machine Learning with SR-IOV](https://techcommunity.microsoft.com/t5/azure-ai/accelerating-distributed-training-in-azure-machine-learning/ba-p/1059050) を参照してください。

もしも`AmlCompute`クラスターを`Standard_ND40rs_v2`などの RDMA 対応で InfiniBand が有効化された VM サイズで作成している場合は、OS イメージには InfiniBand を有効にするために必要な Mellanox OFED ドライバー のインストールと構築が事前に行われています。
