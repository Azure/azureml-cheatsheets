---
title: Installation and setup
titleSuffix: Azure Machine Learning
description: Learn how to install and setup the CLIv2 (preview).
services: machine-learning
ms.service: machine-learning
ms.subservice: core
ms.topic: conceptual
ms.author: copeters
author: lostmygithubaccount
ms.date: 04/30/2021
---

# Installation

The Azure Machine Learning CLIv2 (preview) is an extension to the [Azure CLI](/cli/azure/?preserve-view=true&view=azure-cli-latest), a cross-platform command-line interface for the Azure platform. This extension provides commands for working with Azure Machine Learning. It allows you to automate your machine learning activities. The following list provides some example actions that you can do with the CLI extension:

- Create and register machine learning assets like Models, Datasets, Environments, Compute Targets, ...
- Run command jobs for single or multinode training on Azure compute
- Easily modify existing jobs to sweep hyperparameters
- Track usage...
- Package, deploy, and track the lifecycle of your machine learning models

## Prerequisites

- To use the CLI, you must have an Azure subscription. If you don't have an Azure subscription, create a free account before you begin. Try the [free or paid version of Azure Machine Learning](https://aka.ms/AMLFree) today.
- To use the CLI commands in this document from your **local environment**, you need the [Azure CLI](/cli/azure/install-azure-cli?preserve-view=true&view=azure-cli-latest).

> [!TIP]
> If you use the [Azure Cloud Shell](https://azure.microsoft.com//features/cloud-shell/), the CLI is accessed through the browser and lives in the cloud. You can try it to run through all the training and scoring tutorials in this documentation!

## Full reference docs

Find the [full reference docs for the ml extension of Azure CLI](/cli/azure/ext/ml/?preserve-view=true&view=azure-cli-latest).

## Connect the CLI to your Azure subscription

> [!IMPORTANT]
> If you are using the Azure Cloud Shell, you can skip this section. The cloud shell automatically authenticates you using the account you log into your Azure subscription.

There are several ways that you can authenticate to your Azure subscription from the CLI. The most basic is to interactively authenticate using a browser. To authenticate interactively, open a command line or terminal and use the following command:

```azurecli-interactive
az login
```

If the CLI can open your default browser, it will do so and load a sign-in page. Otherwise, you need to open a browser and follow the instructions on the command line. The instructions involve browsing to [https://aka.ms/devicelogin](https://aka.ms/devicelogin) and entering an authorization code.

For other methods of authenticating, see [Sign in with Azure CLI](/cli/azure/authenticate-azure-cli?preserve-view=true&view=azure-cli-latest).

## Install the extension

To install the Machine Learning CLIv2 (preview) extension, use the following command:

```azurecli-interactive
az extension add -n ml
```

When prompted, select `y` to install the extension.

To verify that the extension has been installed, use the following command to display a list of ML-specific subcommands:

```azurecli-interactive
az ml -h
```

## Update the extension

To update the Machine Learning CLIv2 (preview) extension, use the following command:

```azurecli-interactive
az extension update -n ml
```


## Remove the extension

To remove the CLIv2 (preview) extension, use the following command:

```azurecli-interactive
az extension remove -n ml
```

## Configure Azure settings

If you have access to multiple subscriptions, you may want to set a default:

```azurecli-interactive
az account set -s $SUBSCRIPTION_ID
```

## Create or connect to a workspace

To use an existing workspace...


To create a new workspace:

```azurecli-interactive
az ml workspace create
```

## Next steps

- [Train models (create jobs) with the CLIv2 (preview)](training.md)
- [Deploy models (create endpoints) with the CLIv2 (preview)](scoring.md)
- [Manage machine learning assets with the CLIv2 (preview)](assets.md)
- [Find out more about Azure Machine Learning's v2 developer experience](information.md)
