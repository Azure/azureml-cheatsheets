---
title: Developing on Azure ML
description: Guide to developing your code on Azure ML.
keywords:
  - ssh
  - development
  - compute
---

This guide gives some pointers on developing your code on Azure ML. A typical
scenario might be testing your distributed training code, or some other aspect
of your code that isn't well represented on your local devbox.

A common pain-point in these scenarios is that iteration on Azure ML can feel
slow - especially when compared to developing on a VM.

**Learning objective.** To improve the development experience on Azure ML
to match - or even exceed - that of a "bare" VM.

## 🚧 The hurdles

Two main reasons developing on Azure ML can feel slow as compared to a VM are:

- Any changes to my Python environment force Docker image rebuild which can
    take >5 minutes.

- Compute resources are _released_ between iterations, forcing me to wait for
    new compute to warm up (e.g. pulling Docker images).

Below we provide some techniques to address these issues, as well as some advantages
to working with Azure ML compute directly. We also provide a [example](#example) applying these
techniques.

## 🕰️ Prepare compute for development

When creating your _compute instance / cluster_ there are a fews things you can
do to prepare for development:

1. **Enable SSH on compute.**

    Supported on both _compute instance_ and _compute targets_. This will allow you to
    use your compute just like you would a VM.

    :::tip VS Code Remote Extension.
    VS Code's [remote extension](https://code.visualstudio.com/docs/remote/ssh)
    allows you to connect to your Azure ML compute resources via SSH.
    This way you can develop directly in the cloud.
    :::

2. **Increase "Idle seconds before scale down".**

    For compute targets you can increase this parameter e.g. to 30 minutes. This means
    the cluster won't be released between runs while you iterate.

    :::warning
    Don't forget to roll this back when you're done iterating.
    :::

## 🏃‍♀️ Commands

Typically you will submit your code to Azure ML via a `ScriptRunConfig` a little like this:

```python
config = ScriptRunConfig(
    source_directory='<path/to/source_directory>',
    script='script.py',
    compute_target=target,
    environment=env,
    ...
)
```

:::info
For more details on using `ScriptRunConfig` to submit your code see
[Running Code in the cloud](script-run-config).
:::

By using the [`command`](script-run-config#commands) argument you can improve your agility.
Commands allow you to chain together several steps in one e.g.:

```python
command = "pip install torch && python script.py --learning_rate 2e-5".split()
```

Another example would be to include a setup script:

```bash title="setup.sh"
echo "Running setup script"
pip install torch
pip install -r requirements.txt
export PYTHONPATH=$PWD
```

and then calling it in your command

```python
command = "bash setup.sh && python script.py --learning_rate 2e-5".split()
```

This way Azure ML doesn't have to rebuild the docker image with incremental changes.

## Advantages

In addition to matching the development experience on a VM, there are certain benefits to
developing on Azure ML compute directly.

- **Production-ready.** By developing directly in Azure ML you avoid the additional step of porting your
    VM-developed code to Azure ML later. This is particularly relevant if you intend to
    run your production code on Azure ML.
- **Data access.** If your training script makes use of data in Azure you can use the Azure ML
    Python SDK to read it (see [Data](data) for examples). The alternative is that you might have to
    find some way of getting your data onto the VM you are developing on.
- **Notebooks.** Azure ML's _compute insances_ come with Jupyter notebooks which can help with quick
    debugging. Moreover, these notebooks can easily be run against different compute infrastructure
    and can be a great way to collaborate. 

## Example

We provide a simple example demonstrating the mechanics of the above steps. Consider the following
setup:

```bash
src/
    .azureml/
        config.json  # workspace connection config
    train.py  # python script we are developing
    azureml_run.py  # submit job to azure
```

```bash title="setup.sh"
echo "Running setup script"
pip install numpy
```

```python title="train.py"
import numpy as np
print(np.random.rand())
```

Now from your local machine you can use the Azure ML Python SDK
to execute your command in the cloud:

```python title="azureml_run.py"
from azureml.core import Workspace, Experiment, ScriptRunConfig

# get workspace
ws = Workspace.from_config()
target = ws.compute_targets['cpucluster']
exp = Experiment(ws, 'dev-example')

command = "bash setup.sh && python script.py".split()

# set up script run configuration
config = ScriptRunConfig(
    source_directory='.',
    command=command,
    compute_target=target,
)

# submit script to AML
run = exp.submit(config)
print(run.get_portal_url()) # link to ml.azure.com
run.wait_for_completion(show_output=True)
```

Now if you needed to update your Python environment for example you can simply
add commands to `setup.sh`:

```bash title="setup.sh"
echo "Running setup script"
pip install numpy
pip install pandas
```

without having to rebuild any Docker images.