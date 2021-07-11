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

<!-- :::note
このコンテンツはお使いの言語では利用できません。
::: -->

<!-- Azure ML Environments are used to define the containers where your code will run. In the simplest case you can add custom Python libraries using pip, Conda or directly via the Azure ML Python SDK. If more customization is necessary you can use custom docker images. -->
Azure ML Environments は、コードを実行するコンテナを定義するために用いられます。最もシンプルなケースとしては、pip、Conda、または Azure ML Python SDK 経由で直接、カスタムの Python ライブラリを追加することができます。もっとカスタムが必要であれば、カスタムの Docker イメージを使うことができます。

<!-- This page provides examples creating environments: -->
このページでは、Environment の作成について例示します:

<!-- 
- From pip `requirements.txt` file
- From Conda `env.yml` file
- Directly via the Azure ML Python SDK
- From custom Docker image
-->
- pip の `requirements.txt` ファイルから作成
- Conda の `env.yml` ファイルから作成
- Azure ML Python SDK 経由で直接作成
- カスタム Docker イメージから作成


## Azure ML Managed Python Environments

<!-- ### From pip -->
### pip から作成

<!-- Create Environment from pip `requirements.txt` file -->
pip の `requirements.txt` ファイルから Environment を作成します。

```python
from azureml.core import Environment
env = Environment.from_pip_requirements('<env-name>', '<path/to/requirements.txt>')
```

<!-- ### From Conda -->
### Conda から作成

<!-- Create Environment from Conda `env.yml` file -->
Conda の `env.yml` ファイルから　Environment を作成します。

```python
from azureml.core import Environment
env = Environment.from_conda_specification('<env-name>', '<path/to/env.yml>')
```

<!-- ### In Azure ML SDK -->
### Azure ML SDK で作成

<!-- Use the `CondaDependencies` class to create a Python environment in directly with the Azure ML
Python SDK: -->
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

<!-- ## Custom docker image / dockerfile -->
## カスタム Docker イメージ または Dockerfile で作成

<!-- To create an `Environment` from a custom docker image: -->
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

<!-- For example Azure Container Registry addresses are of the form `"<acr-name>.azurecr.io"`. -->
例えば、 Azure Container Registry のアドレスは、 `"<acr-name>.azurecr.io"` という形式です。

<!-- **Never check in passwords**. In this example we provide the password via an environment variable. -->
**パスワードは絶対に入力しないでください。** この例では、環境変数を経由してパスワードを渡しています。

<!-- To create an `Environment` from a dockerfile: -->
Dockerfile から `Environment` を作成するには、以下のように定義します:

```python
env = Environment('<env-name>')
env.docker.base_dockerfile = './Dockerfile' # path to your dockerfile
# optional
env.python.user_managed_dependencies = True
env.python.interpreter_path = '/opt/miniconda/envs/example/bin/python'
```
<!-- **Remarks.** -->
**備考**

<!-- - `user_managed_dependencies = True`: You are responsible for installing all necessary Python
libraries, typically in your docker image.
- `interpreter_path`: Only used when `user_managed_dependencies=True` and sets the Python interpreter
path (e.g. `which python`). -->
- `user_managed_dependencies = True`: 必要となるすべての Python ライブラリをインストールする必要があります。 Docker イメージの中で実行するのが典型です。
- `interpreter_path`: `user_managed_dependencies=True` のときにのみ使用され、 Python インタプリタのパスを設定します。 (例: `which python`)


<!-- It is possible to have Azure ML manage your Python installation when providing a custom base image. For example, using pip `requirements.txt`: -->
カスタムのベースイメージを用いることで、Azure ML に Python のインストールを管理させることができます。例えば、 pip の `requirements.txt` を使って、以下のように定義します:

```python
env = Environment.from_pip_requirements('<env-name>', '<path/to/requirements.txt>')
env.docker.base_dockerfile = './Dockerfile'
```

<!-- **Note.** In this case Python libraries installed in `Dockerfile` will **not** be available. -->
**メモ:** このケースでは、 `Dockerfile` でインストールされた Python ライブラリは、利用 **できなく** なります。

<!-- ### Build custom docker image for Azure ML -->
### Azure ML 用にカスタムの Docker イメージをビルドする

<!-- We **strongly** recommend building your docker image from one of the Azure ML base images available
here: [AzureML-Containers GitHub Repo](https://github.com/Azure/AzureML-Containers) - like this: -->
こちらで入手可能な Azure ML ベースイメージ から Docker イメージをビルドすることを **強く** 推奨します: [AzureML-Containers GitHub Repo](https://github.com/Azure/AzureML-Containers) - このように定義してください:

```dockerfile title="Dockerfile"
FROM mcr.microsoft.com/azureml/openmpi3.1.2-ubuntu18.04
...
```

<!-- These images come configured with all the requirements to run on Azure ML. -->
これらのイメージには、 Azure ML 上で動作するために必要となるすべての設定がなされています。

<!-- If user wants to build from scratch, here are a list of requirements and recommendations to keep in mind:
- **Conda**: Azure ML uses Conda to manage python environments by default. If you intend to allow Azure ML to manage the Python environment, Conda is required.
- **libfuse**: Required when using `Dataset`
- **Openmpi**: Required for distributed runs
- **nvidia/cuda**: (Recommended) For GPU-based training build image from [nvidia/cuda](https://hub.docker.com/r/nvidia/cuda)
- **Mellanox OFED user space drivers** (Recommend) For SKUs with Infiniband  -->
スクラッチでビルドしたい方は、留意すべき要件と推奨のリストを以下に示しますので、ご覧ください:
- **Conda**: デフォルトでは、 Azure ML は Python 環境を管理するために Conda を使用します。 Azure ML に Python 環境の管理をさせるつもりであれば、 Conda が必須となります。
- **libfuse**: `Dataset` を使う際に必須となります。
- **Openmpi**: 分散実行をする際に必須となります。
- **nvidia/cuda**: (推奨) GPU ベースの学習をするためには、 [nvidia/cuda](https://hub.docker.com/r/nvidia/cuda) からイメージをビルドしてください。
- **Mellanox OFED user space drivers**: (推奨) Infiniband のある SKU が対象です。

<!-- We suggest users to look at the [dockerfiles of Azure ML base images](https://github.com/Azure/AzureML-Containers) as references. -->
参考として [dockerfiles of Azure ML base images](https://github.com/Azure/AzureML-Containers) をご覧ください。

<!-- ### Use custom image from a private registry -->
### プライベート・レジストリにあるカスタムイメージを使用する

<!-- Azure ML can use a custom image from a private registry as long as login information are provided.  -->
ログイン情報があれば、プライベート・レジストリにあるカスタムイメージを Azure ML で利用することができます。

```python
env = Environment('<env-name>')
env.docker.base_image = "/my/private/img:tag",  # image repository path
env.docker.base_image_registry.address = "myprivateacr.azurecr.io"  # private registry

# Retrieve username and password from the workspace key vault
env.docker.base_image_registry.username = ws.get_default_keyvault().get_secret("username")  
env.docker.base_image_registry.password = ws.get_default_keyvault().get_secret("password")
```

<!-- ## Environment Management -->
## Environment の管理

<!-- ### Registered Environments -->
### 登録された Environment

<!-- Register an environment `env: Environment` to your workspace `ws` to reuse/share with your team. -->
チームで再利用したり共有したりするために、 Environment `env: Environment` をワークスペース `ws` に登録します。

```python
env.register(ws)
```

<!-- Registered environments can be obtained directly from the workspace handle `ws`: -->
登録された Environemnt は、ワークスペースのハンドラ `ws` から直接取得することができます:

```python
envs: Dict[str, Environment] = ws.environments
```

<!-- This dictionary contains custom environments that have been registered to the workspace as well as a
collection of _curated environments_ maintained by Azure ML. -->
このディクショナリには、ワークスペースに登録されているカスタムの Environment が含まれています。これは、 Azure ML によって管理される _curated environments_ のコレクションと同様です。

<!-- #### Example. -->
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

<!-- ### Save / Load Environments -->
### Environment の保存と読み出し

<!-- Save an environment to a local directory: -->
ローカルのディレクトリに Environment を保存します:

```python
env.save_to_directory('<path/to/local/directory>', overwrite=True)
```

<!-- This will generate a directory with two (human-understandable and editable) files: -->
これによって、(人間が理解し編集することができる) 2つのファイルを含むディレクトリが生成されます:

<!-- - `azureml_environment.json` : Metadata including name, version, environment variables and Python and Docker configuration
- `conda_dependencies.yml` : Standard conda dependencies YAML (for more details see [Conda docs](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#creating-an-environment-from-an-environment-yml-file)). -->
- `azureml_environment.json` : 名前、バージョン、環境変数、 Python と Docker の設定を含むメタデータです。
- `conda_dependencies.yml` : Conda で標準の、依存関係を表す YAML です。 (詳細は以下をご覧ください。 [Conda docs](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#creating-an-environment-from-an-environment-yml-file))

<!-- Load this environment later with -->
この Environment を後で以下の要領で読み出します。

```python
env = Environment.load_from_directory('<path/to/local/directory>')
```

<!-- ### Environment Variables -->
### 環境変数

<!-- To set environment variables use the `environment_variables: Dict[str, str]` attribute. Environment variables
are set on the process where the user script is executed. -->
環境変数をセットするためには、 `environment_variables: Dict[str, str]` アトリビュートを使用してください。環境変数は、スクリプトが実行されるプロセスにてセットされます。

```python
env = Environment('example')
env.environment_variables['EXAMPLE_ENV_VAR'] = 'EXAMPLE_VALUE'
```

<!-- ## Hints and tips -->
## ヒントと Tips

<!-- When the conda dependencies are managed by Azure ML (`user_managed_dependencies=False`, by default), Azure ML will check whether the same environment has already been materialized into a docker image in the Azure Container Registry associated with the Azure ML workspace. If it is a new environment, Azure ML will have a job preparation stage to build a new docker image for the new environment. You will see a image build log file in the logs and monitor the image build progress. The job won't start until the image is built and pushed to the container registry.  -->
Azure ML が Conda の依存関係を管理する場合 (デフォルトでは `user_managed_dependencies=False`)、Azure ML ワークスペースと関連付けられた Azure Container Registry にある Docker イメージにて同じ Environment が実現されているかどうかを、 Azure ML がチェックします。新規 Environment の場合、Azure ML には、新しい Environment 用の新しい Docker イメージを構築するためのジョブ準備段階があります。 logs にあるイメージ・ビルドのログファイルをみて、その進捗を監視しましょう。このジョブは、イメージがビルドされ、コンテナ・レジストリに push されるまで開始しません。

<!-- This image building process can take some time and delay your job start. To avoid unnecessary image building, consider: -->
イメージをビルドするプロセスには少し時間がかかり、ジョブの開始が遅れます。不必要なビルドを避けるために、以下を検討してください:

<!-- 1. Register an environment that contains most packages you need and reuse when possible.
2. If you only need a few extra packages on top of an existing environment, 
    1. If the existing environment is a docker image, use a dockerfile from this docker image so you only need to add one layer to install a few extra packagers. 
    2. Install extra python packages in your user script so the package installation happens in the script run as part of your code instead of asking Azure ML to treat them as part of a new environment. Consider using a [setup script](#advanced-shell-initialization-script). -->
1. 必要となる多くのパッケージを含む Environment を登録し、可能であれば再利用してください。
2. 既存の Environment に対して少しの追加パッケージを上乗せする必要があるというだけであれば、
    1. 既存の Environment が Docker イメージである場合、この Docker イメージの Dockerfile を使ってください。追加パッケージをインストールするためのレイヤーを1つ追加するだけで済みます。
    2. ユーザースクリプトにて追加の Python パッケージをインストールするようにしてください。スクリプト内で発生するパッケージのインストールは、あなたのコードの一部として実行されます。これは新規の Environment の一部として Azure ML に取り扱いを依頼することの代わりとなります。[setup script](#advanced-shell-initialization-script) を使うことを検討してください。

<!-- Due to intricacy of the python package dependencies and potential version conflict, we recommend use of custom docker image and dockerfiles (based on Azure ML base images) to manage your own python environment. This practice not only gives users full transparency of the environment, but also saves image building times at agile development stage.  -->
Python パッケージの依存関係が複雑で、バージョンが競合する可能性があるため、カスタムの Docker イメージと Dockerfile (Azure ML のベースイメージをベースにしたもの) を使用することをお勧めします。この方法により、 Environment の透明性が完全なものとなるだけでなく、アジャイル開発段階でイメージをビルドする時間を節約することができます。

<!-- ### Build docker images locally and push to Azure Container Registry -->
### Docker イメージをローカルでビルドし、 Azure Container Registry にプッシュする

<!-- If you have docker installed locally, you can build the docker image from Azure ML environment locally with option to push the image to workspace ACR directly. This is recommended when users are iterating on the dockerfile since local build can utilize cached layers.  -->
Docker をローカルにインストールしている場合、 Workspace の ACR に直接イメージをプッシュするオプションを利用して、 Azure ML の Environment からの Docker イメージをローカルでビルドすることができます。ローカル・ビルドではキャッシュされたレイヤーを利用できるため、 Dockerfile を反復処理する場合にお勧めです。

```python
from azureml.core import Environment
myenv = Environment(name='<env-name>')
registered_env = myenv.register(ws)
registered_env.build_local(ws, useDocker=True, pushImageToWorkspaceAcr=True)
```

<!-- ### Bootstrap Script -->
### ブートストラップ・スクリプト

<!-- It can be useful to invoke a `bootstrap.sh` script for faster development. One typical example
would be to modify the Python installation _at runtime_ to avoid frequent image rebuilding. -->
開発を高速化するには、 `bootstrap.sh` を呼び出すと便利です。イメージの再ビルドが頻繁に発生することを避けるために、 _実行時に_ Python をインストールするよう変更するのが1つの典型例です。

<!-- This can be done quite simply with _commands_. First set up your `bootstrap.sh` script. -->
_コマンド_ を使うことでとてもシンプルに実行できます。まずは `bootstrap.sh` スクリプトをセットアップしてください。

```bash title="bootstrap.sh"
echo "Running bootstrap.sh"
pip install torch==1.8.0+cu111
...
```

<!-- To have this run ahead of your training script `train.py` make use of the command: -->
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

<!-- See [Running Code in the Cloud](script-run-config) for more details on `ScriptRunConfig`. -->
`ScriptRunConfig` についてより詳しく知りたい場合は、[Running Code in the Cloud](script-run-config) をご覧ください。

<!-- ### Distributed bootstrapping -->
### 分散ブートストラッピング

<!-- In some cases you may wish to run certain parts of your `bootstrap.sh` script
on certain ranks in a distributed setup. This can be achieved with a little care
as follows: -->
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

<!-- This script will wait for local rank 0 (`$AZ_BATCHAI_TASK_INDEX`) to create its `MARKER` file
before the other processes continue. -->
このスクリプトは、他のプロセスが続行するよりも前に、ローカルランク0 (`$AZ_BATCHAI_TASK_INDEX`) が `MARKER` ファイルを作成するのを待ちます。

<!-- ### Use Keyvault to pass secrets -->
### シークレットを渡すために Keyvault を使う

<!-- #### Workspace Default Keyvault -->
#### Workspace のデフォルトの Keyvault

<!-- Each Azure workspace comes with a keyvault (you can find this in the Azure Portal under the same resource
group as your Workspace). -->
Azure の各 Workspace には Keyvault が付属しています。(これは Azure Portal 内で Workspace と同じリソースグループ配下にあります。)

```python
from azureml.core import Workspace

ws = Workspace.from_config()
kv = ws.get_default_keyvault()
```

<!-- This can be used both to get and set secrets: -->
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

<!-- #### Generic Azure Keyvault -->
#### 汎用の Azure Keyvault

<!-- Of course you can also make use of other keyvaults you might have in Azure. -->
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

<!-- Be sure to add `azure-identity` and `azure-keyvault` to your projects requirements in
this case. -->
この場合、 `azure-identity` と `azure-keyvault` をプロジェクトの requirements に追加してください。

```bash
pip install azure-identity azure-keyvault
```