---
title: Debugging
description: Guide to debugging in Azure ML.
keywords:
  - debug
  - log files
---

## TODO

- [ ] Delete this TODO when complete!
- [ ] Question: where does 20_image_build_log*.txt run? It does not run on customer compute as far as I can tell.
- [ ] Review with AML-DS team


## Azure ML Log Files

Azure ML's log files are an essential resource for debugging your Azure ML workloads.

The following log files are available via the Studio UI at https://ml.azure.com under Workspace > Experiment >
Run > "Outputs and logs".

| Log file | Description |
| - | - |
| `20_image_build_log*.txt` | Docker build logs. |
| `55_azureml-execution*.txt` | Pulls image to compute target. Note, this log only appears once you have secured compute resources.|
| `65_job_prep*.txt` | Job preparation: Download your code to compute target and datastores (if requested). |
| **`70_driver_log.txt`** | **The standard output from your script. This is where your code's logs (e.g. print statements) show up.** |
| `75_job_post*.txt` | Job release: Send logs, release the compute resources back to Azure. |

:::info
In the majority of cases you will monitor the logs in `70_driver_log.txt` which is the standard output
coming from your source code e.g. the logs related to your main training loop.
:::

:::note
You will not necessarily see every file for every run, for example, the `20_image_build_log*.txt` only appear when a new
image is built (e.g. when you change you environment).
:::