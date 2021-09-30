---
title: データ
description: Guide to working with data in Azure ML.
keywords:
  - data
  - dataset
  - datastore
---

## 基本的な概念

Azure ML にはデータを扱うための 2 つの概念が存在します:

- データストア
- データセット

### データストア

Azure ML から多数のストレージアカウントへのインターフェースを提供します。

各 Azure ML ワークスペースには 1 つのデフォルトデータストアが付属しています:

```python
from azureml.core import Workspace
ws = Workspace.from_config()
datastore = ws.get_default_datastore()
```

このデータストアには [Azure Portal](https://portal.azure.com) からもアクセスすることができます。 (Azure ML ワークスペースと同じリソースグループに存在します)

データストアはワークスペースに追加され、Azure ストレージサービスとの接続情報を保持するために使用されます。そのため、ユーザーはストレージサービスの接続情報やシークレットを覚えることなく、データストアの名前で参照をすることができます。

上記コードで取得した Datastore クラスからは、データストアの登録、リスト、取得、削除などの管理を行うことができます。


### データセット

データセットはデータへの参照です。これはデータストア、パブリックURL上の両方のデータを含みます。

データセットはデータ管理を強化する機能を提供します (データセットのバージョン管理)。

## データストアの取得

### デフォルトデータストア

各ワークスペースにはデフォルトデータストアが付属しています。

```python
datastore = ws.get_default_datastore()
```

### データストアの登録

Azure が提供する様々なデータストアに対して、データストアの作成と接続が行えます。例として:

- Azure Blob Container
- Azure Data Lake (Gen1 or Gen2)
- Azure File Share
- Azure MySQL
- Azure PostgreSQL
- Azure SQL
- Azure Databricks File System

データストアの種類のリストと認証オプションの包括的な情報は [Datastores (SDK)](https://docs.microsoft.com/python/api/azureml-core/azureml.core.datastore(class)?view=azure-ml-py) を参照してください。

#### 新たなデータストアを登録する

- **アカウントキー** でデータストアを登録する:

    ```python
    datastores = Datastore.register_azure_blob_container(
        workspace=ws,
        datastore_name='<datastore-name>',
        container_name='<container-name>',
        account_name='<account-name>',
        account_key='<account-key>',
    )
    ```

- **SAS トークン**でデータストアを登録する:

    ```python
    datastores = Datastore.register_azure_blob_container(
        workspace=ws,
        datastore_name='<datastore-name>',
        container_name='<container-name>',
        account_name='<account-name>',
        sas_token='<sas-token>',
    )
    ```

### データストアへの接続

ワークスペースオブジェクト`ws`からは下記のようにデータストアのリストを取得することができます:

```python
ws.datastores: Dict[str, Datastore]
```

ワークスペースに登録済みのデータストアに対しては名前でアクセスすることができます:

```python
datastore = ws.datastores['<name-of-registered-datastore>']
```

### Azure Storage Explorer とデータストアを接続する

ワークスペースオブジェクト`ws`はワークスペースがアクセス可能なデータアセットを管理する際の強力なハンドルです。例えば、Azure Storage Explorer を使ってデータストアに接続する際にもワークスペースを使うことができます。

```python
from azureml.core import Workspace
ws = Workspace.from_config()
datastore = ws.datastores['<name-of-datastore>']
```

- **アカウントキー**を使って作成したデータストアの場合:

    ```python
    account_name, account_key = datastore.account_name, datastore.account_key
    ```

- **SAS トークン**を使って作成したデータストアの場合:

    ```python
    sas_token = datastore.sas_token
    ```

この account_name と account_key は Azure Storage Explorer を使ってデータストアに接続する際に使用できます。

## Blob データストア

[AzureBlobDatastore](https://docs.microsoft.com/python/api/azureml-core/azureml.data.azure_storage_datastore.azureblobdatastore?view=azure-ml-py) データストアを使ったデータのダウンロードとアップロード。

### Blob データストアへのアップロード

AzureBlobDatastore はデータをアップロードするためのAPIを提供します:

```python
datastore.upload(
    src_dir='./data',
    target_path='<path/on/datastore>',
    overwrite=True,
    )
```

別々の場所に存在する複数のファイルをアップロードする場合:

```python
datastore.upload_files(
    files, # アップロードするファイルの絶対パスのリスト (List[str] 形式)
    target_path='<path/on/datastore>',
    overwrite=False,
    )
```

### Blob データストアからのダウンロード

Blob コンテナからローカルファイルシステムへデータをダウンロードする:

```python
datastore.download(
    target_path, # str: ダウンロードするローカルディレクトリ
    prefix='<path/on/datastore>',
    overwrite=False,
    )
```

### Storage Explorer 経由

Azure Storage Explorer は Azure クラウドストレージ上のデータを簡単に扱うことができる Windows、macOS、Linux 向けのツールです。[こちら](https://azure.microsoft.com/features/storage-explorer/)からダウンロードすることができます。

Azure Storage Explorer は GUI のファイルエクスプローラです。そのため、ファイルをドラッグアンドドロップすることでダウンロードやアップロードを行うことができます。

詳細は [Azure Storage Explorer とデータストアを接続する](#azure-storage-explorer-とデータストアを接続する) のセクションを参照してください。

## データストアからの読み込み

コードの中から`Datastore`のデータを参照します。例えばリモート設定を使用する場合です。

### DataReference

最初に、基本的なオブジェクトである`Workspace`、`ComputeTarget`、`Datastore`に接続します。

```python
from azureml.core import Workspace
ws: Workspace = Workspace.from_config()
compute_target: ComputeTarget = ws.compute_targets['<compute-target-name>']
ds: Datastore = ws.get_default_datastore()
```

`DataReference`を作成してマウントする場合:

```python
data_ref = ds.path('<path/on/datastore>').as_mount()
```

ダウンロードする場合:

```python
data_ref = ds.path('<path/on/datastore>').as_download()
```
:::info
データストアを`as_mount`するためには、ワークスペースは対象のストレージに対する read と write アクセスが必要になります。readonly のデータストアの場合は`as_download`が唯一のオプションです。
:::

#### ScriptRunConfig から DataReference を使用する

以下のようにして ScriptRunConfig に DataReference を追加します。

```python
config = ScriptRunConfig(
    source_directory='.',
    script='script.py',
    arguments=[str(data_ref)],  # 環境変数 $AZUREML_DATAREFERENCE_example_data を返します
    compute_target=compute_target,
)

config.run_config.data_references[data_ref.data_reference_name] = data_ref.to_config()
```

コマンドライン引数`str(data_ref)`は、環境変数`$AZUREML_DATAREFERENCE_example_data`を返します。
最終的に`data_ref.to_config()`は、Azure ML の実行に対してデータをコンピューティングターゲットにマウントすることと、上記の環境変数を適切に設定することの指示を出します。


#### 引数を指定しないとき

コマンドライン引数を指定せずに、`path_on_compute`を指定してデータを参照する場合:

```python
data_ref = ds.path('<path/on/datastore>').as_mount()
data_ref.path_on_compute = '/tmp/data'

config = ScriptRunConfig(
    source_directory='.',
    script='script.py',
    compute_target=compute_target,
)

config.run_config.data_references[data_ref.data_reference_name] = data_ref.to_config()
```

## データセットの作成

### ローカルデータから

#### データストアへのアップロード

ローカルディレクトリ`./data/`をアップロードする場合:

```python
datastore = ws.get_default_datastore()
datastore.upload(src_dir='./data', target_path='<path/on/datastore>', overwrite=True)
```

このコードはローカルディレクトリ`./data`をまるごとワークスペース`ws`に関連付けられたデフォルトデータストアにアップロードします。

#### データストア内のファイルからデータセットを作成する

データストアの`<path/on/datastore>`ディレクトリに存在するデータからデータセットを作成する場合:

```python
datastore = ws.get_default_datastore()
dataset = Dataset.File.from_files(path=(datastore, '<path/on/datastore>'))
```

## データセットの使用

### ScriptRunConfig


データセットを ScriptRunConfig から参照してマウントしたりダウンロードしたい時、下記のようにして行えます:

- `dataset.as_mount(path_on_compute)` : リモート実行時にデータセットをマウントする
- `dataset.as_download(path_on_compute)` : リモート実行時にデータセットをダウンロードする

**Path on compute**: `as_mount`と`as_download`の両方がオプションパラメータの`path_on_compute`を受け取ります。このパラメータはコンピューティングターゲット上で利用できるデータセットのパスを定義します。

- `指定しない`場合、データは一時ディレクトリにダウンロードされます。
- `path_on_compute`が`/`始まる場合は**絶対パス**として扱われます。(もしも絶対パスを指定した場合は実行するジョブがそのディレクトリに対する書き込み権限を持っている必要があります)
- それ以外は、ワーキングディレクトリからの相対パスとして扱われます。

マウントモードでリモート実行時にデータを参照する例:

```python title="run.py"
arguments=[dataset.as_mount()]
config = ScriptRunConfig(source_directory='.', script='train.py', arguments=arguments)
experiment.submit(config)
```

`train.py`から参照する例:

```python title="train.py"
import sys
data_dir = sys.argv[1]

print("===== DATA =====")
print("DATA PATH: " + data_dir)
print("LIST FILES IN DATA DIR...")
print(os.listdir(data_dir))
print("================")
```

より詳細は [クラウド上でコードを実行する](script-run-config) を参照してください。
