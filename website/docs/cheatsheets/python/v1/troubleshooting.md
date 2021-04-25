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
I built a mlnet image successfully using Azure Machine Learning compute instance last week. However, I got the error when rerun the same notebook. 

The command I run:
```python
!az acr build --image $image_name --subscription $ws.subscription_id --registry $cr --file docker/Dockerfile docker/
```
The error I got: 
```text
NotImplementedError: APIVersion 2020-11-01-preview is not available. 
```

**Solution** This is a problem related with the version of az cli. Please update az cli by running
```python
!az upgrade --yes
```



