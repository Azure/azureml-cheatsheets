---
title: Distributed GPU Training
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

## Basic Concepts

We assume readers already understand the basic concept of distributed GPU training such as _data parallelism, distributed data parallelism, and model parallelism_. This guide aims at helping readers running existing distributed training code on Azure ML. 

:::info 
If you don't know which type of parallelism to use, for >90% of the time you should use __Distributed Data Parallelism__.
:::

## MPI

Azure ML offers an MPI job to launch a given number of processes in each node. Users can adopt this approach to run distributed training using either per-process-launcher or per-node-launcher, depending on whether `process_count_per_node` is set to 1 (the default) for per-node-launcher, or equal to the number of devices/GPUs for per-process-launcher. Azure ML handles constructing the full MPI launch command (`mpirun`) behind the scenes.

:::note
Azure ML currently does not allow users to provide the full head-node-launcher command like `mpirun` or the DeepSpeed launcher. This functionality may be added in a future release.
:::

:::caution
To use the Azure ML MPI job, the base Docker image used by the job needs to have an MPI library installed. [Open MPI](https://www.open-mpi.org/) is included in all the [AzureML GPU base images](https://github.com/Azure/AzureML-Containers). If you are using a custom Docker image, you are responsible for making sure the image includes an MPI library. Open MPI is recommended, but you can also use a different MPI implementation such as Intel MPI. Azure ML also provides [curated environments](https://docs.microsoft.com/en-us/azure/machine-learning/resource-curated-environments) for popular frameworks. 
:::

To run distributed training using MPI, follow these steps:
1. Use an Azure ML environment with the preferred deep learning framework and MPI. AzureML provides [curated environment](https://docs.microsoft.com/en-us/azure/machine-learning/resource-curated-environments) for popular frameworks.
2. Define `MpiConfiguration` with the desired `process_count_per_node` and `node_count`. `process_count_per_node` should be equal to the number of GPUs per node for per-process-launch, or set to 1 (the default) for per-node-launch if the user script will be responsible for launching the processes per node.
3. Pass the `MpiConfiguration` object to the `distributed_job_config` parameter of `ScriptRunConfig`.

```python
from azureml.core import Workspace, ScriptRunConfig, Environment, Experiment
from azureml.core.runconfig import MpiConfiguration

curated_env_name = 'AzureML-PyTorch-1.6-GPU'
pytorch_env = Environment.get(workspace=ws, name=curated_env_name)
distr_config = MpiConfiguration(process_count_per_node=4, node_count=2)

run_config = ScriptRunConfig(source_directory= './src',
                             script='train.py',
                             compute_target=compute_target,
                             environment=pytorch_env,
                             distributed_job_config=distr_config)

# submit the run configuration to start the job
run = Experiment(ws, "experiment_name").submit(run_config)
```

### Horovod

If you are using [Horovod](https://horovod.readthedocs.io/en/stable/index.html) for distributed training with the deep learning framework of your choice, you can run distributed training on Azure ML using the MPI job configuration.

Simply ensure that you have taken care of the following:
* The training code is instrumented correctly with Horovod.
* The Azure ML environment contains Horovod and MPI. The PyTorch and TensorFlow curated GPU environments come pre-configured with Horovod and its dependencies.
* Create an `MpiConfiguration` with your desired distribution.

#### Example
* [azureml-examples: TensorFlow distributed training using Horovod](https://github.com/Azure/azureml-examples/tree/main/workflows/train/tensorflow/mnist-distributed-horovod)

### DeepSpeed

To run distributed training with the [DeepSpeed](https://www.deepspeed.ai/) library on Azure ML, do not use DeepSpeed's custom launcher. Instead, configure an MPI job to launch the training job [with MPI](https://www.deepspeed.ai/getting-started/#mpi-and-azureml-compatibility).

Take care of the following:
* The Azure ML environment contains DeepSpeed and its dependencies, Open MPI, and mpi4py.
* Create an `MpiConfiguration` with your desired distribution.

#### Example
* [azureml-examples: Distributed training with DeepSpeed on CIFAR-10](https://github.com/Azure/azureml-examples/tree/main/workflows/train/deepspeed/cifar)

### Environment variables from Open MPI

When running MPI jobs with Open MPI images, the following environment variables for each process launched:
1. OMPI_COMM_WORLD_RANK - the rank of the process
2. OMPI_COMM_WORLD_SIZE - the world size
3. AZ_BATCH_MASTER_NODE - master address with port, MASTER_ADDR:MASTER_PORT
4. OMPI_COMM_WORLD_LOCAL_RANK - the local rank of the process on the node
5. OMPI_COMM_WORLD_LOCAL_SIZE - number of processes on the node

:::caution
Despite the name, environment variable OMPI_COMM_WORLD_NODE_RANK does not corresponds to the NODE_RANK. To use per-node-launcher, simply set `process_count_per_node=1` and use OMPI_COMM_WORLD_RANK as the NODE_RANK. 
:::

## PyTorch

Azure ML also supports running distributed jobs using PyTorch's native distributed training capabilities (`torch.distributed`).

:::tip torch.nn.parallel.DistributedDataParallel vs torch.nn.DataParallel and torch.multiprocessing
For data parallelism, the [official PyTorch guidance](https://pytorch.org/tutorials/intermediate/ddp_tutorial.html#comparison-between-dataparallel-and-distributeddataparallel) is to use DistributedDataParallel (DDP) over DataParallel for both single-node and multi-node distributed training. PyTorch also [recommends using DistributedDataParallel over the multiprocessing package](https://pytorch.org/docs/stable/notes/cuda.html#use-nn-parallel-distributeddataparallel-instead-of-multiprocessing-or-nn-dataparallel). Azure ML documentation and examples will therefore focus on DistributedDataParallel training.
:::

### Process group initialization

The backbone of any distributed training is based on a group of processes that know each other and can communicate with each other using a backend. For PyTorch, the process group is created by calling [torch.distributed.init_process_group](https://pytorch.org/docs/stable/distributed.html#torch.distributed.init_process_group) in __all distributed processes__ to collectively form a process group.

```
torch.distributed.init_process_group(backend='nccl', init_method='env://', ...)
```

The most common communication backends used are __mpi__, __nccl__ and __gloo__. For GPU-based training __nccl__ is strongly recommended for best performance and should be used whenever possible. 

`init_method` specifies how each process can discover each other and initialize as well as verify the process group using the communication backend. By default if `init_method` is not specified PyTorch will use the environment variable initialization method (`env://`). This is also the recommended the initialization method to use in your training code to run distributed PyTorch on Azure ML. For environment variable initialization, PyTorch will look for the following environment variables:

- **MASTER_ADDR** - IP address of the machine that will host the process with rank 0.
- **MASTER_PORT** - A free port on the machine that will host the process with rank 0.
- **WORLD_SIZE** - The total number of processes. This should be equal to the total number of devices (GPU) used for distributed training.
- **RANK** - The (global) rank of the current process. The possible values are 0 to (world size - 1).

For more information on process group initialization, see the [PyTorch documentation](https://pytorch.org/docs/stable/distributed.html#torch.distributed.init_process_group).

Beyond these, many applications will also need the following environment variables:
- **LOCAL_RANK** - The local (relative) rank of the process within the node. The possible values are 0 to (# of processes on the node - 1). This information is useful because many operations such as data preparation only should be performed once per node --- usually on local_rank = 0.
- **NODE_RANK** - The rank of the node for multi-node training. The possible values are 0 to (total # of nodes - 1).

### Launch options

The Azure ML PyTorch job supports two types of options for launching distributed training:

1. __Per-process-launcher__: The system will launch all distributed processes for the user, with all the relevant information (e.g. environment variables) to set up the process group.
2. __Per-node-launcher__: The user provides Azure ML with the utility launcher that will get run on each node. The utility launcher will handle launching each of the processes on a given node. Locally within each node, RANK and LOCAL_RANK is set up by the launcher. The **torch.distributed.launch** utility and PyTorch Lightning both belong in this category.

There are no fundamental differences between these launch options; it is largely up to the user's preference or the conventions of the frameworks/libraries built on top of vanilla PyTorch (such as Lightning or Hugging Face).

The following sections go into more detail on how to configure Azure ML PyTorch jobs for each of the launch options.

### DistributedDataParallel (per-process-launch)

Azure ML supports launching each process for the user without the user needing to use a launcher utility like `torch.distributed.launch`.

To run a distributed PyTorch job, you will just need to do the following:
1. Specify the training script and arguments
2. Create a `PyTorchConfiguration` and specify the `process_count` as well as the `node_count`. The `process_count` corresponds to the total number of processes you want to run for your job. This should typically equal `# GPUs per node x # nodes`. If `process_count` is not specified, Azure ML will by default launch one process per node.

Azure ML will set the MASTER_ADDR, MASTER_PORT, WORLD_SIZE, and NODE_RANK environment variables on each node, in addition to setting the process-level RANK and LOCAL_RANK environment variables.

:::caution
In order to use this option for multi-process-per-node training, you will need to use Azure ML Python SDK `>= 1.22.0`, as process_count was introduced in 1.22.0.
:::

```python
from azureml.core import ScriptRunConfig, Environment, Experiment
from azureml.core.runconfig import PyTorchConfiguration

curated_env_name = 'AzureML-PyTorch-1.6-GPU'
pytorch_env = Environment.get(workspace=ws, name=curated_env_name)
distr_config = PyTorchConfiguration(process_count=8, node_count=2)

run_config = ScriptRunConfig(source_directory='./src',
                             script='train.py',
                             arguments=['--epochs', 50],
                             compute_target=compute_target,
                             environment=pytorch_env,
                             distributed_job_config=distr_config)

run = Experiment(ws, 'experiment_name').submit(run_config)
```

:::tip
If your training script passes information like local rank or rank as script arguments, you can reference the environment variable(s) in the arguments:
`arguments=['--epochs', 50, '--local_rank', $LOCAL_RANK]`. 
:::

#### Example

### Using `torch.distributed.launch` (per-node-launch)

PyTorch provides a launch utility in [torch.distributed.launch](https://pytorch.org/docs/stable/distributed.html#launch-utility) that users can use to launch multiple processes per node. The `torch.distributed.launch` module will spawn multiple training processes on each of the nodes.


To configure a PyTorch job with a per-node-launcher, do the following:
1. Provide the `torch.distributed.launch` command to the `command` parameter of the `ScriptRunConfig` constructor. Azure ML will run this command on each node of your training cluster. `--nproc_per_node` should be less than or equal to the number of GPUs available on each node. MASTER_ADDR, MASTER_PORT, and NODE_RANK are all set by Azure ML, so you can just reference the environment variables in the command. Azure ML sets MASTER_PORT to `6105`, but you can pass a different value to the `--master_port` argument of torch.distributed.launch command if you wish. (The launch utility will reset the environment variables.)
    ```shell
    python -m torch.distributed.launch --nproc_per_node <num processes per node> \
      --nnodes <num nodes> --node_rank $NODE_RANK --master_addr $MASTER_ADDR \
      --master_port $MASTER_PORT --use_env \
      <your training script> <your script arguments>
    ```
2. Create a `PyTorchConfiguration` and specify the `node_count`.

```python
from azureml.core import ScriptRunConfig, Environment, Experiment
from azureml.core.runconfig import PyTorchConfiguration

curated_env_name = 'AzureML-PyTorch-1.6-GPU'
pytorch_env = Environment.get(workspace=ws, name=curated_env_name)
distr_config = PyTorchConfiguration(node_count=2)
launch_cmd = ['python -m torch.distributed.launch --nproc_per_node 4 --nnodes 2 ' \
               '--node_rank $NODE_RANK --master_addr $MASTER_ADDR --master_port $MASTER_PORT ' \
               '--use_env train.py --epochs 50']

run_config = ScriptRunConfig(source_directory='./src',
                             command=launch_cmd,
                             compute_target=compute_target,
                             environment=pytorch_env,
                             distributed_job_config=distr_config)

run = Experiment(ws, 'experiment_name').submit(run_config)
```

:::tip Single-node multi-GPU training
If you are using the launch utility to run single-node multi-GPU PyTorch training, you do not need to specify the `distributed_job_config` parameter of ScriptRunConfig.

```python
launch_cmd = ['python -m torch.distributed.launch --nproc_per_node 4 ' \
              '--use_env train.py --epochs 50']

run_config = ScriptRunConfig(source_directory='./src',
                             command=launch_cmd,
                             compute_target=compute_target,
                             environment=pytorch_env)
```
:::

#### Example
- [azureml-examples: Distributed training with PyTorch on CIFAR-10](https://github.com/Azure/azureml-examples/tree/main/workflows/train/pytorch/cifar-distributed)

### PyTorch Lightning

[PyTorch Lightning](https://pytorch-lightning.readthedocs.io/en/stable/) is a lightweight open-source library that provides a high-level interface for PyTorch. Lightning abstracts away much of the lower-level distributed training configurations required for vanilla PyTorch from the user, and allows users to run their training scripts in single GPU, single-node multi-GPU, and multi-node multi-GPU settings. Behind the scene it launches multiple processes for user similar to `torch.distributed.launch`.

For single-node training (including single-node multi-GPU), you can run your code on Azure ML without needing to specify a `distributed_job_config`. For multi-node training, Lightning requires the following environment variables to be set on each node of your training cluster:

- MASTER_ADDR
- MASTER_PORT
- NODE_RANK

To run multi-node Lightning training on Azure ML, you can largely follow the [per-node-launch guide](#using-distributedddataparallel-per-node-launch):

- Define the `PyTorchConfiguration` and specify the desired `node_count`. Do not specify `process_count` as Lightning internally handles launching the worker processes for each node.
- For PyTorch jobs, Azure ML handles setting the MASTER_ADDR, MASTER_PORT, and NODE_RANK envirnment variables required by Lightning.
- Lightning will handle computing the world size from the Trainer flags `--gpus` and `--num_nodes` and manage rank and local rank internally.

```python
from azureml.core import ScriptRunConfig, Experiment
from azureml.core.runconfig import PyTorchConfiguration

nnodes = 2
args = ['--max_epochs', 50, '--gpus', 2, '--accelerator', 'ddp', '--num_nodes', nnodes]
distr_config = PyTorchConfiguration(node_count=nnodes)

run_config = ScriptRunConfig(source_directory='./src',
                             script='train.py',
                             arguments=args,
                             compute_target=compute_target,
                             environment=pytorch_env,
                             distributed_job_config=distr_config)

run = Experiment(ws, 'experiment_name').submit(run_config)
```

#### Example
* [azureml-examples: Multi-node training with PyTorch Lightning](https://github.com/Azure/azureml-examples/blob/main/tutorials/using-pytorch-lightning/4.train-multi-node-ddp.ipynb)

### Hugging Face Transformers

Hugging Face provides many [examples](https://github.com/huggingface/transformers/tree/master/examples) for using its Transformers library with `torch.distributed.launch` to run distributed training. To run these examples and your own custom training scripts using the Transformers Trainer API, follow the [Using `torch.distributed.launch`](#using-torchdistributedlaunch-per-node-launch) section.

Sample job configuration code to fine-tune the BERT large model on the text classification MNLI task using the `run_glue.py` script on one node with 8 GPUs:
```python
from azureml.core import ScriptRunConfig
from azureml.core.runconfig import PyTorchConfiguration

distr_config = PyTorchConfiguration() # node_count defaults to 1
launch_cmd = ['python -m torch.distributed.launch --nproc_per_node 8 ' \
               'text-classification/run_glue.py ' \
               '--model_name_or_path bert-large-uncased-whole-word-masking ' \
               '--task_name mnli --do_train --do_eval ' \
               '--max_seq_length 128 --per_device_train_batch_size 8 ' \
               '--learning_rate 2e-5 --num_train_epochs 3.0 ' \
               '--output_dir /tmp/mnli_output']

run_config = ScriptRunConfig(source_directory='./src',
                             command=launch_cmd,
                             compute_target=compute_target,
                             environment=pytorch_env,
                             distributed_job_config=distr_config)
```

You can also use the [per-process-launch](#distributeddataparallel-per-process-launch) option to run distributed training without using `torch.distributed.launch`. One thing to keep in mind if using this method is that the transformers [TrainingArguments](https://huggingface.co/transformers/main_classes/trainer.html?highlight=launch#trainingarguments) expects the local rank to be passed in as an argument (`--local_rank`). `torch.distributed.launch` takes care of this when `--use_env=False`, but if you are using per-process-launch you will need to explicitly pass this in as an argument to the training script `--local_rank=$LOCAL_RANK` as Azure ML only sets the LOCAL_RANK environment variable.

## TensorFlow

If you are using [native distributed TensorFlow](https://www.tensorflow.org/guide/distributed_training) in your training code, such as TensorFlow 2.x's `tf.distribute.Strategy` API, you can launch the distributed job via Azure ML using the `TensorflowConfiguration`.

To do so, specify a `TensorflowConfiguration` object to the `distributed_job_config` parameter of the `ScriptRunConfig` constructor. If you are using `tf.distribute.experimental.MultiWorkerMirroredStrategy`, specify the `worker_count` in the `TensorflowConfiguration` corresponding to the number of nodes for your training job.

```python
from azureml.core import ScriptRunConfig, Environment, Experiment
from azureml.core.runconfig import TensorflowConfiguration

curated_env_name = 'AzureML-TensorFlow-2.3-GPU'
tf_env = Environment.get(workspace=ws, name=curated_env_name)
distr_config = TensorflowConfiguration(worker_count=2, parameter_server_count=0)

run_config = ScriptRunConfig(source_directory='./src',
                             script='train.py',
                             compute_target=compute_target,
                             environment=tf_env,
                             distributed_job_config=distr_config)

# submit the run configuration to start the job
run = Experiment(ws, "experiment_name").submit(run_config)
```

If your training script uses the parameter server strategy for distributed training, i.e. for legacy TensorFlow 1.x, you will also need to specify the number of parameter servers to use in the job, e.g. `tf_config = TensorflowConfiguration(worker_count=2, parameter_server_count=1)`.

### TF_CONFIG

In TensorFlow, the **TF_CONFIG** environment variable is required for training on multiple machines. For TensorFlow jobs, Azure ML will configure and set the TF_CONFIG variable appropriately for each worker before executing your training script.

You can access TF_CONFIG from your training script if you need to: `os.environ['TF_CONFIG']`.

Example TF_CONFIG set on a chief worker node:
```json
TF_CONFIG='{
    "cluster": {
        "worker": ["host0:2222", "host1:2222"]
    },
    "task": {"type": "worker", "index": 0},
    "environment": "cloud"
}'
```

#### Example
- [azureml-examples: Distributed TensorFlow training with MultiWorkerMirroredStrategy](https://github.com/Azure/azureml-examples/tree/main/workflows/train/tensorflow/mnist-distributed)

## Accelerating GPU training with InfiniBand

Certain Azure VM series, specifically the NC, ND, and H-series, now have RDMA-capable VMs with SR-IOV and Infiniband support. These VMs communicate over the low latency and high bandwidth InfiniBand network, which is much more performant than Ethernet-based connectivity. SR-IOV for InfiniBand enables near bare-metal performance for any MPI library (MPI is leveraged by many distributed training frameworks and tooling, including NVIDIA's NCCL software.) These SKUs are intended to meet the needs of computationally-intensive, GPU-acclerated machine learning workloads. For more information, see [Accelerating Distributed Training in Azure Machine Learning with SR-IOV](https://techcommunity.microsoft.com/t5/azure-ai/accelerating-distributed-training-in-azure-machine-learning/ba-p/1059050).

If you create an `AmlCompute` cluster of one of these RDMA-capable, InfiniBand-enabled sizes, such as `Standard_ND40rs_v2`, the OS image will come with the Mellanox OFED driver required to enable InfiniBand preinstalled and preconfigured.
