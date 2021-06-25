---
title: Metrics
description: Guide to metric logging in Azure ML.
keywords:
  - metric
  - logging
---

:::note
このコンテンツはお使いの言語では利用できません。
:::

## Logging metrics

Logging a metric to a run causes that metric to be stored in the run record in the experiment.
Visualize and keep a history of all logged metrics.


### `log`

Log a single metric value to a run.

```python
from azureml.core import Run
run = Run.get_context()
run.log('metric-name', metric_value)
```

You can log the same metric multiple times within a run; the results will be displayed as a chart.

### `log_row`

Log a metric with multiple columns.

```python
from azureml.core import Run
run = Run.get_context()
run.log_row("Y over X", x=1, y=0.4)
```

:::info More logging options
These are probably the most common APIs used for logging metrics, but see [here](https://docs.microsoft.com/azure/machine-learning/how-to-log-view-metrics#data-types) for a complete
list, including logging lists, tables and images.
:::

## Viewing metrics

Metrics will be automatically available in the Azure ML Studio. Locate your run, e.g., either
by visiting [ml.azure.com](https://ml.azure.com), or using the SDK:

```
run.get_workspace_url()
```

Select the "Metrics" tab and select the metric(s) to view:

![](/img/view-metrics.png)

### Via the SDK

Viewing metrics in a run (for more details on runs: [Run](run))

```python
metrics = run.get_metrics()
# metrics is of type Dict[str, List[float]] mapping mertic names
# to a list of the values for that metric in the given run.

metrics.get('metric-name')
# list of metrics in the order they were recorded
```

To view all recorded values for a given metric `my-metric` in a
given experiment `my-experiment`:

```python
experiments = ws.experiments
# of type Dict[str, Experiment] mapping experiment names the
# corresponding Experiment

exp = experiments['my-experiment']
for run in exp.get_runs():
    metrics = run.get_metrics()
    
    my_metric = metrics.get('my-metric')
    if my_metric:
        print(my_metric)
```

## Examples

### Logging with MLFlow

Use [MLFlow](https://mlflow.org/) to log metrics in Azure ML.

```python
from azureml.core import Run

# connect to the workspace from within your running code
run = Run.get_context()
ws = run.experiment.workspace

# workspace has associated ml-flow-tracking-uri
mlflow_url = ws.get_mlflow_tracking_uri()
```

### Logging with PyTorch Lightning

This examples:
- Includes Lightning's `TensorBoardLogger`
- Sets up Lightning's `MLFlowLogger` using AzureML `Run.get_context()`
  - Only adds this logger when used as part of an Azure ML run

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

Now include this logger in the lightning `Trainer` class:

```python
logger = get_logger()

trainer = pl.Trainer.from_argparse_args(
    args=args,
    logger=logger,
    )
trainer.fit(model)
```