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

Azure ML Environments are used to define the containers where your code will run. In the simplest case you can add custom Python libraries using pip, Conda or directly via the Azure ML Python SDK. If more customization is necessary you can use custom docker images.

This page provides examples creating environments:

- From pip `requirements.txt` file
- From Conda `env.yml` file
- Directly via the Azure ML Python SDK
- From custom Docker image


## Azure ML Managed Python Environments

### From pip

Create Environment from pip `requirements.txt` file

```python
from azureml.core import Environment
env = Environment.from_pip_requirements('<env-name>', '<path/to/requirements.txt>')
```

### From Conda

Create Environment from Conda `env.yml` file

```python
from azureml.core import Environment
env = Environment.from_conda_specification('<env-name>', '<path/to/env.yml>')
```

### In Azure ML SDK

Use the `CondaDependencies` class to create a Python environment in directly with the Azure ML
Python SDK:

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

## Custom docker image / dockerfile

To create an `Environment` from a custom docker image:

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

For example Azure Container Registry addresses are of the form `"<acr-name>.azurecr.io"`.

**Never check in passwords**. In this example we provide the password via an environment variable.

To create an `Environment` from a dockerfile:

```python
env = Environment('<env-name>')
env.docker.base_dockerfile = './Dockerfile' # path to your dockerfile
# optional
env.python.user_managed_dependencies = True
env.python.interpreter_path = '/opt/miniconda/envs/example/bin/python'
```
**Remarks.**

- `user_managed_dependencies = True`: You are responsible for installing all necessary Python
libraries, typically in your docker image.
- `interpreter_path`: Only used when `user_managed_dependencies=True` and sets the Python interpreter
path (e.g. `which python`).


It is possible to have Azure ML manage your Python installation when providing a custom base image. For example, using pip `requirements.txt`:

```python
env = Environment.from_pip_requirements('<env-name>', '<path/to/requirements.txt>')
env.docker.base_dockerfile = './Dockerfile'
```

**Note.** In this case Python libraries installed in `Dockerfile` will **not** be available.

### Build custom docker image for Azure ML

We **strongly** recommend building your docker image from one of the Azure ML base images available
here: [AzureML-Containers GitHub Repo](https://github.com/Azure/AzureML-Containers) - like this:

```dockerfile title="Dockerfile"
FROM mcr.microsoft.com/azureml/openmpi3.1.2-ubuntu18.04
...
```

These images come configured with all the requirements to run on Azure ML.

If user wants to build from scratch, here are a list of requirements and recommendations to keep in mind:
- **Conda**: Azure ML uses Conda to manage python environments by default. If you intend to allow Azure ML to manage the Python environment, Conda is required.
- **libfuse**: Required when using `Dataset`
- **Openmpi**: Required for distributed runs
- **nvidia/cuda**: (Recommended) For GPU-based training build image from [nvidia/cuda](https://hub.docker.com/r/nvidia/cuda)
- **Mellanox OFED user space drivers** (Recommend) For SKUs with Infiniband 

We suggest users to look at the [dockerfiles of Azure ML base images](https://github.com/Azure/AzureML-Containers) as references.

### Use custom image from a private registry

Azure ML can use a custom image from a private registry as long as login information are provided. 

```python
env = Environment('<env-name>')
env.docker.base_image = "/my/private/img:tag",  # image repository path
env.docker.base_image_registry.address = "myprivateacr.azurecr.io"  # private registry

# Retrieve username and password from the workspace key vault
env.docker.base_image_registry.username = ws.get_default_keyvault().get_secret("username")  
env.docker.base_image_registry.password = ws.get_default_keyvault().get_secret("password")
```

## Environment Management

### Registered Environments

Register an environment `env: Environment` to your workspace `ws` to reuse/share with your team.

```python
env.register(ws)
```

Registered environments can be obtained directly from the workspace handle `ws`:

```python
envs: Dict[str, Environment] = ws.environments
```

This dictionary contains custom environments that have been registered to the workspace as well as a
collection of _curated environments_ maintained by Azure ML.

#### Example.

```python
# create / update, register environment
env = Environment.from_pip_requirements('my-env', 'requirements.txt')
env.register(ws)

# use later
env = ws.environments['my-env']

# get a specific version
env = Environment.get(ws, 'my-env', version=6)
```

### Save / Load Environments

Save an environment to a local directory:

```python
env.save_to_directory('<path/to/local/directory>', overwrite=True)
```

This will generate a directory with two (human-understandable and editable) files:

- `azureml_environment.json` : Metadata including name, version, environment variables and Python and Docker configuration
- `conda_dependencies.yml` : Standard conda dependencies YAML (for more details see [Conda docs](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#creating-an-environment-from-an-environment-yml-file)).

Load this environment later with

```python
env = Environment.load_from_directory('<path/to/local/directory>')
```

### Environment Variables

To set environment variables use the `environment_variables: Dict[str, str]` attribute. Environment variables
are set on the process where the user script is executed.

```python
env = Environment('example')
env.environment_variables['EXAMPLE_ENV_VAR'] = 'EXAMPLE_VALUE'
```

## Hints and tips

When the conda dependencies are managed by Azure ML (`user_managed_dependencies=False`, by default), Azure ML will check whether the same environment has already been materialized into a docker image in the Azure Container Registry associated with the Azure ML workspace. If it is a new environment, Azure ML will have a job preparation stage to build a new docker image for the new environment. You will see a image build log file in the logs and monitor the image build progress. The job won't start until the image is built and pushed to the container registry. 

This image building process can take some time and delay your job start. To avoid unnecessary image building, consider:

1. Register an environment that contains most packages you need and reuse when possible.
2. If you only need a few extra packages on top of an existing environment, 
    1. If the existing environment is a docker image, use a dockerfile from this docker image so you only need to add one layer to install a few extra packagers. 
    2. Install extra python packages in your user script so the package installation happens in the script run as part of your code instead of asking Azure ML to treat them as part of a new environment. Consider using a [setup script](#advanced-shell-initialization-script).

Due to intricacy of the python package dependencies and potential version conflict, we recommend use of custom docker image and dockerfiles (based on Azure ML base images) to manage your own python environment. This practice not only gives users full transparency of the environment, but also saves image building times at agile development stage. 

### Build docker images locally and push to Azure Container Registry

If you have docker installed locally, you can build the docker image from Azure ML environment locally with option to push the image to workspace ACR directly. This is recommended when users are iterating on the dockerfile since local build can utilize cached layers. 

```python
from azureml.core import Environment
myenv = Environment(name='<env-name>')
registered_env = myenv.register(ws)
registered_env.build_local(ws, useDocker=True, pushImageToWorkspaceAcr=True)
```

### Bootstrap Script

It can be useful to invoke a `bootstrap.sh` script for faster development. One typical example
would be to modify the Python installation _at runtime_ to avoid frequent image rebuilding.

This can be done quite simply with _commands_. First set up your `bootstrap.sh` script.

```bash title="bootstrap.sh"
echo "Running bootstrap.sh"
pip install torch==1.8.0+cu111
...
```

To have this run ahead of your training script `train.py` make use of the command:

```python
cmd = "bash bootstrap.sh && python train.py --learning_rate 1e-5".split()

config = ScriptRunConfig(
    source_directory='<path/to/code>',
    command=command,
    compute_target=compute_target,
    environment=environment,
)
```

See [Running Code in the Cloud](script-run-config) for more details on `ScriptRunConfig`.

### Distributed bootstrapping

In some cases you may wish to run certain parts of your `bootstrap.sh` script
on certain ranks in a distributed setup. This can be achieved with a little care
as follows:

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

This script will wait for local rank 0 (`$AZ_BATCHAI_TASK_INDEX`) to create its `MARKER` file
before the other processes continue.
