---
title: 'Azure ML Containers'
description: Guide to containers in Azure ML.
keywords:
  - containers
  - dockerfile
  - docker
  - environment
---

本ガイドでは Azure ML でコードを実行するのに利用されるコンテナをビルドする方法を説明します。


## Dockerfile

Azure ML の各ジョブは `環境` に紐づいて実行されます。実質、各環境は Docker Image に該当します。

環境を設定する方法はさまざまで、Python パッケージのセットを指定する方法から、カスタム Docker イメージを直接提供する方法などがあります。いずれの場合も、関連する Dockerfile の内容は環境のオブジェクトから直接利用できます。

詳細はこちら : [環境](environment)


#### 例

環境を作成します。この例では Conda を使っていきます。:

```yml title="env.yml"
name: pytorch
channels:
    - defaults
    - pytorch
dependencies:
    - python=3.7
    - pytorch
    - torchvision
```

次のようにワークスペース `ws` に `環境` を作成し登録することができます。

```python
from azureml.core import Environment
env = Environment.from_conda_specification('pytorch', 'env.yml')
env.register(ws)
```

この環境をリモート実行時に利用するためには、Azure ML は対応する python 環境の docker image をビルドします。

ビルドで利用された Dockerfile は環境のオブジェクトから直接利用できます。

```python
details = env.get_image_details(ws)
print(details['ingredients']['dockerfile'])
```

Dockerfile の中身を見てみます。 :

```docker title="Dockerfile" {1,7-12}
FROM mcr.microsoft.com/azureml/intelmpi2018.3-ubuntu16.04:20200821.v1@sha256:8cee6f674276dddb23068d2710da7f7f95b119412cc482675ac79ba45a4acf99
USER root
RUN mkdir -p $HOME/.cache
WORKDIR /
COPY azureml-environment-setup/99brokenproxy /etc/apt/apt.conf.d/
RUN if dpkg --compare-versions `conda --version | grep -oE '[^ ]+$'` lt 4.4.11; then conda install conda==4.4.11; fi
COPY azureml-environment-setup/mutated_conda_dependencies.yml azureml-environment-setup/mutated_conda_dependencies.yml
RUN ldconfig /usr/local/cuda/lib64/stubs && conda env create -p /azureml-envs/azureml_7459a71437df47401c6a369f49fbbdb6 -
f azureml-environment-setup/mutated_conda_dependencies.yml && rm -rf "$HOME/.cache/pip" && conda clean -aqy && CONDA_ROO
T_DIR=$(conda info --root) && rm -rf "$CONDA_ROOT_DIR/pkgs" && find "$CONDA_ROOT_DIR" -type d -name __pycache__ -exec rm
 -rf {} + && ldconfig
# AzureML Conda environment name: azureml_7459a71437df47401c6a369f49fbbdb6
ENV PATH /azureml-envs/azureml_7459a71437df47401c6a369f49fbbdb6/bin:$PATH
ENV AZUREML_CONDA_ENVIRONMENT_PATH /azureml-envs/azureml_7459a71437df47401c6a369f49fbbdb6
ENV LD_LIBRARY_PATH /azureml-envs/azureml_7459a71437df47401c6a369f49fbbdb6/lib:$LD_LIBRARY_PATH
COPY azureml-environment-setup/spark_cache.py azureml-environment-setup/log4j.properties /azureml-environment-setup/
RUN if [ $SPARK_HOME ]; then /bin/bash -c '$SPARK_HOME/bin/spark-submit  /azureml-environment-setup/spark_cache.py'; fi
ENV AZUREML_ENVIRONMENT_IMAGE True
CMD ["bash"]
```

注意:

- ベースイメージは Azure ML で管理されている標準的なイメージです。全ベースイメージの Dockerfile は github (https://github.com/Azure/AzureML-Containers) で利用可能です。
- Dockerfile は `mutated_conda_dependencies.yml` を参照し Conda 経由で Python 環境を構築します。

`mutated_conda_dependencies.yml` の内容は環境から取得できます。:

```python
print(env.python.conda_dependencies.serialize_to_string())
```

以下のようになっています。

```bash title="mutated_conda_dependencies.yml"
channels:
    - defaults
    - pytorch
dependencies:
    - python=3.7
    - pytorch
    - torchvision
name: azureml_7459a71437df47401c6a369f49fbbdb6
```