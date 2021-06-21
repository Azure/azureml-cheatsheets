---
title: Issue Triage Process
id: issues
description: GitHub issue triage process for Azure Machine Learning.
keywords:
  - azure machine learning
  - aml
  - azure
---

## Overview

This page defines the triage process for Azure Machine Learning (AML) repositories.

## Repositories

AML examples:

- https://github.com/Azure/MachineLearningNotebooks
- https://github.com/Azure/azureml-examples

Azure core:

- https://github.com/Azure/azure-cli
- https://github.com/Azure/azure-cli-extensions
- https://github.com/Azure/azure-powershell
- https://github.com/Azure/azure-rest-api-specs
- https://github.com/Azure/azure-sdk-for-js
- https://github.com/Azure/azure-sdk-for-python

> To request a repository to be added, [open an issue](https://github.com/Azure/azureml-web/issues)

## Code of Conduct

All interactions on GitHub must follow the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).

## Priority

GitHub user experience.

## Metrics

- FQR: first quality response
- TTC: time to close

## Goals

- triage issue area and type in <3 hrs
- FQR <8 hrs
- TTC for questions <5 days
- TTC for bugs <30 days

## SLA

- triage <1 day
- FQR <3 days

## Labels

### Areas

#### Foundations

- `Foundations/Data`
- `Foundations/Compute`
- `Foundations/Infrastructure`
- `Foundations/Admin`

#### Experiences

- `Experiences/UI`
- `Experiences/Lifecycle`
- `Experiences/Intelligence`
- `Experiences/Inference`

#### Pipelines

- `Pipelines/UI`
- `Pipelines/Aether`

### Issue types

- `bug`
- `question`
- `feature-request`

### Other

- `needs-details`: additional details needed from author
- `v2`: planned for AMLv2

## Process

### Triage

Initial triage will be performed by the GitHub v-team. On initial triage, assign the correct area label and issue type.  

If the issue needs obvious clarification before this can be done, kindly ask the user. If the issue has no path to closing without user response, mark it as `needs-details`.

After initial triage, it is up to each area (Experiences, Foundations, Pipelines) to further triage as necessary to the correct engineering team members.  

One type of issue may be changed to another, i.e. for an issue like “can I do X” could end up as a feature request for X. Simply change the issue labels as appropriate. In some cases, it might make sense to open a new issue and close the original instead of changing the label.

Once the issue is understood, it is up to each area to appropriately route through internal tools such as ADO, maintaining the GitHub issue as the point of communication with the user. Major developments should be communicated back to the user.

### Closing

Issues may be closed by their creator at anytime, which is preferred, **especially for questions**.

Additionally, issues may be closed once:

- `needs-details`: user/author has not responded for 5+ days with no other path to closure
- `question`: the question has been thoroughly answered with relevant links, documentation, and examples and has no follow-up questions from user(s) in 48 hrs
- `bug`: the bug fix has been released, tested, and the user confirms the solution or does not respond for 48 hrs after being made aware of the fix
- `feature-request`: the feature has been released, tested, and the user confirms the solution or does not respond for 48 hrs after being made aware of the release
