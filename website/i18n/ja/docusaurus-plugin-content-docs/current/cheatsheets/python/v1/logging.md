---
title: メトリック
description: Guide to metric logging in Azure ML.
keywords:
  - metric
  - logging
---

## メトリックの記録

メトリックは Azure ML の各実行に紐付けて記録され、複数の実行は一つの実験に紐付けられて記録されます。
メトリックの履歴の保存と可視化を行います。

### `log`

あるメトリックの 1 つの値を実行に記録します。

```python
from azureml.core import Run
run = Run.get_context()
run.log('metric-name', metric_value)
```

あるメトリックを同一の実行に対して複数回記録することもできます。その場合、記録されたメトリックはチャートで表示されます。

### `log_row`

あるメトリックを複数の列として記録します。

```python
from azureml.core import Run
run = Run.get_context()
run.log_row("Y over X", x=1, y=0.4)
```

:::info その他の記録オプション
メトリックの記録に使われる一般的な API は含まれていますが、完全なリストについては[こちら](https://docs.microsoft.com/azure/machine-learning/how-to-log-view-metrics#data-types)を参照してください。
:::

## メトリックを表示する

メトリックは Azure ML Studio の中で自動的に表示可能になります。[こちら](https://ml.azure.com)のリンク先か、SDK から見ることができます:

```
run.get_workspace_url()
```

"メトリック"タブを選択し、表示したいメトリックを選択します。

![](/img/view-metrics.png)


また、サマリページではメトリック間の比較をすることも可能です。
`Experimets`タブから比較したい図表を選択して下さい。


![](/img/custom-view.png)


:::info Custom views
図表の追加後、実行結果を選択してテーブル内のカラムを更新して下さい。
該当の図表は保存、複数作成に加え、他の方との共有もできます！
:::


### SDK からメトリックを表示する

実行に記録されたメトリックを確認します。(詳細: [実験と実行](run))


```python
metrics = run.get_metrics()
# メトリックは Dict[str, List[float]] 形式になっており、
# メトリック名と list 形式の値がマッピングされて実行に保存されています。

metrics.get('metric-name')
# 記録された順に並んだメトリックのリスト
```

実験`my-experiment`のメトリック`my-metric`のすべてのレコードを表示する:

```python
experiments = ws.experiments
# 実験名と実験オブジェクトのリスト

exp = experiments['my-experiment']
for run in exp.get_runs():
    metrics = run.get_metrics()

    my_metric = metrics.get('my-metric')
    if my_metric:
        print(my_metric)
```

## 例

### MLFlow を使って記録する

[MLFlow](https://mlflow.org/) を使って Azure ML にメトリックを記録します。

```python
from azureml.core import Run

# コードから実行中の実験や実行が含まれるワークスペースに接続する
run = Run.get_context()
ws = run.experiment.workspace

# ワークスペースを ml-flow-tracking-uri に関連付ける
mlflow_url = ws.get_mlflow_tracking_uri()
```

### PyTorch Lightning を使って記録する

この例は:
- Lightning の`TensorBoardLogger`を含みます。
- Azure ML の`Run.get_context()`を使って Lightning の`MLFlowLogger`を設定します。
  - Azure ML の実行の一部として使うときはこのロガーを追加するだけです。

```python
import pytorch_lightning as pl

run = None
try:
    from azureml.core.run import Run, _OfflineRun
    run = Run.get_context()
    if isinstance(run, _OfflineRun):
        run = None
except ImportError:
    print("Couldn't import azureml.core.run.Run")

def get_logger():
    tb_logger = pl.loggers.TensorBoardLogger('logs/')
    logger = [tb_logger]

    if run is not None:
        mlflow_url = run.experiment.workspace.get_mlflow_tracking_uri()
        mlf_logger = pl.loggers.MLFlowLogger(
          experiment_name=run.experiment.name,
          tracking_uri=mlflow_url,
          )
        mlf_logger._run_id = run.id
        logger.append(mlf_logger)

    return logger
```

ここでこのロガーを lightning の`Trainer`クラスに含めます:

```python
logger = get_logger()

trainer = pl.Trainer.from_argparse_args(
    args=args,
    logger=logger,
    )
trainer.fit(model)
```