---
title: Environment
description: Guide to working with Python environments in Azure ML.
keywords:
  - environment
  - python
  - conda
  - pip
  - docker
  - environment variables
---

Azure ML Environments は、コードを実行するコンテナを定義するために用いられます。最もシンプルなケースとしては、pip、Conda、または Azure ML Python SDK 経由で直接、カスタムの Python ライブラリを追加することができます。もっとカスタムが必要であれば、カスタムの Docker イメージを使うことができます。

このページでは、Environment の作成について例示します:

- pip の `requirements.txt` ファイルから作成
- Conda の `env.yml` ファイルから作成
- Azure ML Python SDK 経由で直接作成
- カスタム Docker イメージから作成


## Azure ML Managed Python Environments

### pip から作成

pip の `requirements.txt` ファイルから Environment を作成します。

```python
from azureml.core import Environment
env = Environment.from_pip_requirements('<env-name>', '<path/to/requirements.txt>')
```

### Conda から作成

Conda の `env.yml` ファイルから　Environment を作成します。

```python
from azureml.core import Environment
env = Environment.from_conda_specification('<env-name>', '<path/to/env.yml>')
```

### Azure ML SDK で作成

Azure ML Python SDK を使って直接 Python Environment を作成するために、 `CondaDependencies` クラスを使います:

```python
from azureml.core import Environment
from azureml.core.conda_dependencies import CondaDependencies

conda = CondaDependencies()

# add channels
conda.add_channel('pytorch')

# add conda packages
conda.add_conda_package('python=3.7')
conda.add_conda_package('pytorch')
conda.add_conda_package('torchvision')

# add pip packages
conda.add_pip_package('pyyaml')
conda.add_pip_package('mpi4py')
conda.add_pip_package('deepspeed')

# create environment
env = Environment('pytorch')
env.python.conda_dependencies = conda
```

## カスタム Docker イメージ または Dockerfile で作成

カスタム Docker イメージから `Environment` を作成するには、以下のように定義します:

```python
env = Environment('<env-name>')
env.docker.base_image = '<image-name>'
env.docker.base_image_registry.address = '<container-registry-address>'
env.docker.base_image_registry.username = '<acr-username>'
env.docker.base_image_registry.password = os.environ.get("CONTAINER_PASSWORD")
# optional
env.python.user_managed_dependencies = True
env.python.interpreter_path = '/opt/miniconda/envs/example/bin/python'
```

例えば、 Azure Container Registry のアドレスは、 `"<acr-name>.azurecr.io"` という形式です。

**パスワードは絶対に入力しないでください。** この例では、環境変数を経由してパスワードを渡しています。

Dockerfile から `Environment` を作成するには、以下のように定義します:

```python
env = Environment('<env-name>')
env.docker.base_dockerfile = './Dockerfile' # path to your dockerfile
# optional
env.python.user_managed_dependencies = True
env.python.interpreter_path = '/opt/miniconda/envs/example/bin/python'
```
**備考**

- `user_managed_dependencies = True`: 必要となるすべての Python ライブラリをインストールする必要があります。 Docker イメージの中で実行するのが典型です。
- `interpreter_path`: `user_managed_dependencies=True` のときにのみ使用され、 Python インタプリタのパスを設定します。 (例: `which python`)


カスタムのベースイメージを用いることで、Azure ML に Python のインストールを管理させることができます。例えば、 pip の `requirements.txt` を使って、以下のように定義します:

```python
env = Environment.from_pip_requirements('<env-name>', '<path/to/requirements.txt>')
env.docker.base_dockerfile = './Dockerfile'
```

**メモ:** このケースでは、 `Dockerfile` でインストールされた Python ライブラリは、利用 **できなく** なります。

### Azure ML 用にカスタムの Docker イメージをビルドする

こちらで入手可能な Azure ML ベースイメージ から Docker イメージをビルドすることを **強く** 推奨します: [AzureML-Containers GitHub Repo](https://github.com/Azure/AzureML-Containers) - このように定義してください:

```dockerfile title="Dockerfile"
FROM mcr.microsoft.com/azureml/openmpi3.1.2-ubuntu18.04
...
```

これらのイメージには、 Azure ML 上で動作するために必要となるすべての設定がなされています。

スクラッチでビルドしたい方は、留意すべき要件と推奨のリストを以下に示しますので、ご覧ください:
- **Conda**: デフォルトでは、 Azure ML は Python 環境を管理するために Conda を使用します。 Azure ML に Python 環境の管理をさせるつもりであれば、 Conda が必須となります。
- **libfuse**: `Dataset` を使う際に必須となります。
- **Openmpi**: 分散実行をする際に必須となります。
- **nvidia/cuda**: (推奨) GPU ベースの学習をするためには、 [nvidia/cuda](https://hub.docker.com/r/nvidia/cuda) からイメージをビルドしてください。
- **Mellanox OFED user space drivers**: (推奨) Infiniband のある SKU が対象です。

参考として [dockerfiles of Azure ML base images](https://github.com/Azure/AzureML-Containers) をご覧ください。

### プライベート・レジストリにあるカスタムイメージを使用する

ログイン情報があれば、プライベート・レジストリにあるカスタムイメージを Azure ML で利用することができます。

```python
env = Environment('<env-name>')
env.docker.base_image = "/my/private/img:tag",  # image repository path
env.docker.base_image_registry.address = "myprivateacr.azurecr.io"  # private registry

# Retrieve username and password from the workspace key vault
env.docker.base_image_registry.username = ws.get_default_keyvault().get_secret("username")  
env.docker.base_image_registry.password = ws.get_default_keyvault().get_secret("password")
```

## Environment の管理

### 登録された Environment

チームで再利用したり共有したりするために、 Environment `env: Environment` をワークスペース `ws` に登録します。

```python
env.register(ws)
```

登録された Environemnt は、ワークスペースのハンドラ `ws` から直接取得することができます:

```python
envs: Dict[str, Environment] = ws.environments
```

このディクショナリには、ワークスペースに登録されているカスタムの Environment が含まれています。これは、 Azure ML によって管理される _curated environments_ のコレクションと同様です。

#### 例

```python
# create / update, register environment
env = Environment.from_pip_requirements('my-env', 'requirements.txt')
env.register(ws)

# use later
env = ws.environments['my-env']

# get a specific version
env = Environment.get(ws, 'my-env', version=6)
```

### Environment の保存と読み出し

ローカルのディレクトリに Environment を保存します:

```python
env.save_to_directory('<path/to/local/directory>', overwrite=True)
```

これによって、(人間が理解し編集することができる) 2つのファイルを含むディレクトリが生成されます:

- `azureml_environment.json` : 名前、バージョン、環境変数、 Python と Docker の設定を含むメタデータです。
- `conda_dependencies.yml` : Conda で標準の、依存関係を表す YAML です。 (詳細は以下をご覧ください。 [Conda docs](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#creating-an-environment-from-an-environment-yml-file))

この Environment を後で以下の要領で読み出します。

```python
env = Environment.load_from_directory('<path/to/local/directory>')
```

### 環境変数

環境変数をセットするためには、 `environment_variables: Dict[str, str]` アトリビュートを使用してください。環境変数は、スクリプトが実行されるプロセスにてセットされます。

```python
env = Environment('example')
env.environment_variables['EXAMPLE_ENV_VAR'] = 'EXAMPLE_VALUE'
```

## ヒントと Tips

Azure ML が Conda の依存関係を管理する場合 (デフォルトでは `user_managed_dependencies=False`)、Azure ML ワークスペースと関連付けられた Azure Container Registry にある Docker イメージにて同じ Environment が実現されているかどうかを、 Azure ML がチェックします。新規 Environment の場合、Azure ML には、新しい Environment 用の新しい Docker イメージを構築するためのジョブ準備段階があります。 logs にあるイメージ・ビルドのログファイルをみて、その進捗を監視しましょう。このジョブは、イメージがビルドされ、コンテナ・レジストリに push されるまで開始しません。

イメージをビルドするプロセスには少し時間がかかり、ジョブの開始が遅れます。不必要なビルドを避けるために、以下を検討してください:

1. 必要となる多くのパッケージを含む Environment を登録し、可能であれば再利用してください。
2. 既存の Environment に対して少しの追加パッケージを上乗せする必要があるというだけであれば、
    1. 既存の Environment が Docker イメージである場合、この Docker イメージの Dockerfile を使ってください。追加パッケージをインストールするためのレイヤーを1つ追加するだけで済みます。
    2. ユーザースクリプトにて追加の Python パッケージをインストールするようにしてください。スクリプト内で発生するパッケージのインストールは、あなたのコードの一部として実行されます。これは新規の Environment の一部として Azure ML に取り扱いを依頼することの代わりとなります。[setup script](#advanced-shell-initialization-script) を使うことを検討してください。

Python パッケージの依存関係が複雑で、バージョンが競合する可能性があるため、カスタムの Docker イメージと Dockerfile (Azure ML のベースイメージをベースにしたもの) を使用することをお勧めします。この方法により、 Environment の透明性が完全なものとなるだけでなく、アジャイル開発段階でイメージをビルドする時間を節約することができます。

### Docker イメージをローカルでビルドし、 Azure Container Registry にプッシュする

Docker をローカルにインストールしている場合、 Workspace の ACR に直接イメージをプッシュするオプションを利用して、 Azure ML の Environment からの Docker イメージをローカルでビルドすることができます。ローカル・ビルドではキャッシュされたレイヤーを利用できるため、 Dockerfile を反復処理する場合にお勧めです。

```python
from azureml.core import Environment
myenv = Environment(name='<env-name>')
registered_env = myenv.register(ws)
registered_env.build_local(ws, useDocker=True, pushImageToWorkspaceAcr=True)
```

### ブートストラップ・スクリプト

開発を高速化するには、 `bootstrap.sh` を呼び出すと便利です。イメージの再ビルドが頻繁に発生することを避けるために、 _実行時に_ Python をインストールするよう変更するのが1つの典型例です。

_コマンド_ を使うことでとてもシンプルに実行できます。まずは `bootstrap.sh` スクリプトをセットアップしてください。

```bash title="bootstrap.sh"
echo "Running bootstrap.sh"
pip install torch==1.8.0+cu111
...
```

学習用スクリプトである `train.py` の前にこれが実行されるよう、次のコマンドを使用します:

```python
cmd = "bash bootstrap.sh && python train.py --learning_rate 1e-5".split()

config = ScriptRunConfig(
    source_directory='<path/to/code>',
    command=command,
    compute_target=compute_target,
    environment=environment,
)
```

`ScriptRunConfig` についてより詳しく知りたい場合は、[クラウド上でコードを実行する](script-run-config) をご覧ください。

### 分散ブートストラッピング

場合によっては、 `bootstrap.sh` スクリプトの特定の部分を、分散セットアップの特定のランクで実行したいことがあり得ます。これは、次に示すように少し注意をすることで実現可能です:

```bash title="bootstrap.sh"
MARKER="/tmp/.azureml_bootstrap_complete"

if [[ $AZ_BATCHAI_TASK_INDEX = 0 ]] ; then    
    echo "Running bootstrap.sh"
    echo "Installing transformers from source"
    pip install git+https://github.com/huggingface/transformers
    python -c "from transformers import pipeline; print(pipeline('sentiment-analysis')('we love you'))"
    pip install datasets
    pip install tensorflow
    echo "Installation complete"
    touch $MARKER
fi
echo "Barrier..."
while [[ ! -f $MARKER ]]
do
    sleep 1
done
echo "Bootstrap complete!"
```

このスクリプトは、他のプロセスが続行するよりも前に、ローカルランク0 (`$AZ_BATCHAI_TASK_INDEX`) が `MARKER` ファイルを作成するのを待ちます。

### シークレットを渡すために Keyvault を使う

#### Workspace のデフォルトの Keyvault

Azure の各 Workspace には Keyvault が付属しています。(これは Azure Portal 内で Workspace と同じリソースグループ配下にあります。)

```python
from azureml.core import Workspace

ws = Workspace.from_config()
kv = ws.get_default_keyvault()
```

これは、シークレットの get と set の両方に使うことができます。

```python
import os
from azureml.core import Keyvault

# add a secret to keyvault
kv.set_secret(name="<my-secret>", value=os.environ.get("MY_SECRET"))

# get a secret from the keyvault
secret = kv.get_secret(name="<my-secret>")

# equivalently
secret = run.get_secret(name="<my-secret>")
```

#### 汎用の Azure Keyvault

もちろん、Azure 内にある他の Keyvault を使うこともできます。

```python
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

credential = DefaultAzureCredential()
client = SecretClient(vault_url=kv_url, credential=credential)
my_secret = client.get_secret(secret_name).value

env = Environment('example')
env.environment_variables['POWERFUL_SECRET'] = my_secret
```

この場合、 `azure-identity` と `azure-keyvault` をプロジェクトの requirements に追加してください。

```bash
pip install azure-identity azure-keyvault
```