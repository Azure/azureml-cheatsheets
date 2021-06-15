---
title: Troubleshooting
id: troubleshooting
description: A cheat sheet for Azure ML.
keywords:
  - azure machine learning
  - aml
  - troubleshooting
---

### Error: az acr login- APIVersion 2020-11-01-preview is not available. 
**Description**
NotImplementedError occurred when building image using az acr.
```bash
az acr build --image $image_name --subscription $ws.subscription_id --registry $cr --file docker/Dockerfile docker/
```
The error: 
```text
NotImplementedError: APIVersion 2020-11-01-preview is not available. 
```

**Solution** This is a problem related with the version of az cli. Please update az cli by running
```bash
az upgrade --yes
```



