---
title: Cheat Sheet
id: cheatsheet
slug: /cheatsheet/
description: A cheat sheet for Azure ML.
keywords:
  - azure machine learning
  - aml
  - cheatsheet
  - overview
---

## Basic setup

### Connect to workspace.

```python
from azureml.core import Workspace
ws = Workspace.from_config()
```

The workspace object is the fundamental handle on your Azure ML assets and is used
throughout (often simply referred to by `ws`).

For more details: [Workspaces](workspace)

### Connect to compute target.

```python
compute_target = ws.compute_targets['<compute-target-name>']
```

**Sample usage.**

```python
compute_target = ws.compute_targets['powerful-gpu']

config = ScriptRunConfig(
    compute_target=compute_target,  # compute target used to run train.py script
    source_directory='.',
    script='train.py',
)
```

For more details: [Compute Target](compute-targets)

### Prepare Python environment

You can use a pip `requirements.txt` file or a Conda `env.yml` file to define a Python environment on your compute.

```python
from azureml.core import Environment
# Option 1. From pip
environment = Environment.from_pip_requirements('<env-name>', '<path/to/requirements.txt>')
# Option 2. From Conda
environment = Environment.from_conda_specification('<env-name>', '<path/to/env.yml>')
```

You can also use docker images to prepare your environments.

**Sample usage.**

```python
environment = Environment.from_pip_requirements('<env-name>', '<path/to/requirements.txt>')

config = ScriptRunConfig(
    environment=environment,  # set the python environment
    source_directory='.',
    script='train.py',
)
```

For more details: [Environment](environment)


## Submit code

To run code in Azure ML you need to:

1. **Configure**: Configuration includes specifying the code to run, the compute
target to run on and the Python environment to run in.
2. **Submit**: Create or reuse an Azure ML Experiment and submit the run.

### ScriptRunConfig

A typical directory may have the following structure:

```bash
source_directory/
    script.py    # entry point to your code
    module1.py   # modules called by script.py     
    ...
```

To run `$ (env) python <path/to/code>/script.py [arguments]` on a remote compute
cluster `target: ComputeTarget` with an environment `env: Environment` we can use
the `ScriptRunConfig` class.

```python
from azureml.core import ScriptRunConfig

config = ScriptRunConfig(
    source_directory='<path/to/code>',  # relative paths okay
    script='script.py',
    compute_target=compute_target,
    environment=environment,
    arguments=arguments,
)
```

For more details on arguments: [Command line arguments](script-run-config#command-line-arguments)

:::info
- `compute_target`: If not provided the script will run on your local machine.
- `environment`: If not provided, uses a default Python environment managed by Azure ML. See [Environment](environment) for more details.
:::

#### Commands

It is possible to provide the explicit command to run.

```python
command = 'echo cool && python script.py'.split()

config = ScriptRunConfig(
    source_directory='<path/to/code>',  # relative paths okay
    command=command,
    compute_target=compute_target,
    environment=environment,
    arguments=arguments,
)
```

For more details: [Commands](script-run-config#commands)

### Experiment

To submit this code, create an `Experiment`: a light-weight container that helps to
organize our submissions and keep track of code (See [Run History](run-history)).

```python
exp = Experiment(ws, '<experiment-name>')
run = exp.submit(config)
print(run.get_portal_url())
```

This link will take you to the Azure ML Studio where you can monitor your run.

For more details: [ScriptRunConfig](script-run-config)

### Sample usage

Here is a fairly typical example using a Conda environment to run a training
script `train.py` on our local machine from the command line.

```bash
$ conda env create -f env.yml  # create environment called pytorch
$ conda activate pytorch
(pytorch) $ cd <path/to/code>
(pytorch) $ python train.py --learning_rate 0.001 --momentum 0.9
```

Suppose you want to run this on a GPU in Azure.

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

## Distributed GPU Training

Adapt your `ScriptRunConfig` to enable distributed GPU training.

```python {3,8-9,12,19}
from azureml.core import Workspace, Experiment, ScriptRunConfig
from azureml.core import Environment
from azureml.core.runconfig import MpiConfiguration

ws = Workspace.from_config()
compute_target = ws.compute_targets['powerful-gpu']
environment = Environment.from_conda_specification('pytorch', 'env.yml')
environment.docker.enabled = True
environment.docker.base_image = 'mcr.microsoft.com/azureml/openmpi3.1.2-cuda10.1-cudnn7-ubuntu18.04'

# train on 2 nodes each with 4 GPUs
mpiconfig = MpiConfiguration(process_count_per_node=4, node_count=2)

config = ScriptRunConfig(
    source_directory='<path/to/code>',  # directory containing train.py
    script='train.py',
    environment=environment,
    arguments=['--learning_rate', 0.001, '--momentum', 0.9],
    distributed_job_config=mpiconfig,   # add the distributed configuration
)

run = Experiment(ws, 'PyTorch model training').submit(config)
```

:::info
- `mcr.microsoft.com/azureml/openmpi3.1.2-cuda10.1-cudnn7-ubuntu18.04` is a docker image
    with OpenMPI. This is required for distributed training on Azure ML.
- `MpiConfiguration` is where you specify the number of nodes and GPUs (per node) you
    want to train on.
:::

For more details: [Distributed GPU Training](distributed-training)

## Connect to data

To work with data in your training scripts using your workspace `ws` and its default datastore:

```python
datastore = ws.get_default_datastore()
dataset = Dataset.File.from_files(path=(datastore, '<path/on/datastore>'))
```
For more details see: [Data](data)

Pass this to your training script as a command line argument.

```python
arguments=['--data', dataset.as_mount()]
```
