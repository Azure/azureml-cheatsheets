Create custom plugins for the cheatsheet.

See here for more details: https://v2.docusaurus.io/docs/using-plugins/#configuring-plugins

## AppInsights

Following this [microsoft.docs](https://docs.microsoft.com/en-us/azure/azure-monitor/app/website-monitoring)
guide, and modifying the google analytics plugin from docusaurus ([github](https://github.com/facebook/docusaurus/blob/master/packages/docusaurus-plugin-google-analytics/src/index.js))

Note: There was a bug in the javascript provided in the microsoft docs:

- No logs were being sent to appinsights
- Using F12 > Sources, saw a format error
- Guessed and removed this line, and it worked!

```diff
...
o.baseData.exceptions=[
    {
        typeName : "SDKLoadFailed",
        message : n.replace(/\./g,"-"),
        hasFullStack : !1,
-       stack:n+"\nSnippet failed to load ["+a+"] -- Telemetry is disabled\nHelp Link: https://go.microsoft.com/fwlink/?linkid=2128109\nHost: "+(S&&S.pathname||"_unknown_")+"\nEndpoint: "+i
+       stack : n,
        parsedStack:[]
        }
    ]
...
```