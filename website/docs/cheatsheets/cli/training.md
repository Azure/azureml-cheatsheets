---
title: Train models (create jobs)
titleSuffix: Azure Machine Learning
description: Learn how to train models (create jobs) with the CLIv2 (preview).
services: machine-learning
ms.service: machine-learning
ms.subservice: core
ms.topic: conceptual
ms.author: copeters
author: lostmygithubaccount
ms.date: 04/30/2021
---

# Train models (create jobs)

A job is a resource that specifies all aspects of a computation job, aggregating:

- what to run
- how to run it
- where to run it

Jobs are tracking in the workspace and can be viewed in the studio.

## Prerequisites

- To use the CLI, you must have an Azure subscription. If you don't have an Azure subscription, create a free account before you begin. Try the [free or paid version of Azure Machine Learning](https://aka.ms/AMLFree) today.
- To use the CLI commands in this document from your **local environment**, you need the [Azure CLI](/cli/azure/install-azure-cli?preserve-view=true&view=azure-cli-latest).

> [!TIP]
> If you use the [Azure Cloud Shell](https://azure.microsoft.com//features/cloud-shell/), the CLI is accessed through the browser and lives in the cloud. You can try it to run through all the training and scoring tutorials in this documentation!

## Hello world!

To run more complex workflows, you can provide YAML files specifying a job. For instance, consider a simple Python script:

```python
print("Hello world!")
```

## Basics

## Distributed

## Sweep

## Next steps

- [Deploy models (create endpoints) with the CLIv2 (preview)](scoring.md)
- [Manage machine learning assets with the CLIv2 (preview)](assets.md)
- [Find out more about Azure Machine Learning's v2 developer experience](information.md)
