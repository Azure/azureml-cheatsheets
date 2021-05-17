(self.webpackChunkaml_cheatsheet=self.webpackChunkaml_cheatsheet||[]).push([[629],{3905:function(e,n,t){"use strict";t.d(n,{Zo:function(){return s},kt:function(){return g}});var r=t(7294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function c(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var u=r.createContext({}),p=function(e){var n=r.useContext(u),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},s=function(e){var n=p(e.components);return r.createElement(u.Provider,{value:n},e.children)},l={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},m=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,o=e.originalType,u=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),m=p(t),g=i,d=m["".concat(u,".").concat(g)]||m[g]||l[g]||o;return t?r.createElement(d,a(a({ref:n},s),{},{components:t})):r.createElement(d,a({ref:n},s))}));function g(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=t.length,a=new Array(o);a[0]=m;var c={};for(var u in n)hasOwnProperty.call(n,u)&&(c[u]=n[u]);c.originalType=e,c.mdxType="string"==typeof e?e:i,a[1]=c;for(var p=2;p<o;p++)a[p]=t[p];return r.createElement.apply(null,a)}return r.createElement.apply(null,t)}m.displayName="MDXCreateElement"},6671:function(e,n,t){"use strict";t.r(n),t.d(n,{frontMatter:function(){return a},metadata:function(){return c},toc:function(){return u},default:function(){return s}});var r=t(4034),i=t(9973),o=(t(7294),t(3905)),a={title:"Experiment and Run",description:"Guide to running code with Azure ML",keywords:["run","experiment","submit","remote","ScriptRunConfig"]},c={unversionedId:"cheatsheets/python/v1/run",id:"cheatsheets/python/v1/run",isDocsHomePage:!1,title:"Experiment and Run",description:"Guide to running code with Azure ML",source:"@site/docs/cheatsheets/python/v1/run.md",sourceDirName:"cheatsheets/python/v1",slug:"/cheatsheets/python/v1/run",permalink:"/azureml-cheatsheets/ja/docs/cheatsheets/python/v1/run",editUrl:"https://github.com/Azure/azureml-cheatsheets/tree/main/website/docs/cheatsheets/python/v1/run.md",version:"current",frontMatter:{title:"Experiment and Run",description:"Guide to running code with Azure ML",keywords:["run","experiment","submit","remote","ScriptRunConfig"]}},u=[{value:"Concepts",id:"concepts",children:[{value:"Run",id:"run",children:[]},{value:"Experiments",id:"experiments",children:[]}]},{value:"Create Run",id:"create-run",children:[{value:"Via ScriptRunConfig",id:"via-scriptrunconfig",children:[]},{value:"Get Context",id:"get-context",children:[]},{value:"Interactive",id:"interactive",children:[]}]}],p={toc:u};function s(e){var n=e.components,a=(0,i.Z)(e,["components"]);return(0,o.kt)("wrapper",(0,r.Z)({},p,a,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"concepts"},"Concepts"),(0,o.kt)("h3",{id:"run"},"Run"),(0,o.kt)("p",null,"A run represents a single execution of your code."),(0,o.kt)("p",null,"Azure ML is a machine-learning service that facilitates running your code in\nthe cloud. A ",(0,o.kt)("inlineCode",{parentName:"p"},"Run")," is an abstraction layer around each such submission, and is used to\nmonitor the job in real time as well as keep a history of your results."),(0,o.kt)("h3",{id:"experiments"},"Experiments"),(0,o.kt)("p",null,"An experiment is a light-weight container for ",(0,o.kt)("inlineCode",{parentName:"p"},"Run"),". Use experiments to submit\nand track runs."),(0,o.kt)("p",null,"Create an experiment in your workspace ",(0,o.kt)("inlineCode",{parentName:"p"},"ws"),"."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-python"},"from azureml.core import Experiment\nexp = Experiment(ws, '<experiment-name>')\n")),(0,o.kt)("h2",{id:"create-run"},"Create Run"),(0,o.kt)("h3",{id:"via-scriptrunconfig"},"Via ScriptRunConfig"),(0,o.kt)("p",null,"Usually a run is created by submitting a ScriptRunConfig."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-python"},"from azureml.core import Workspace, Experiment, ScriptRunConfig\nws = Workspace.from_config()\nexp = Experiment(ws, '<experiment-name>')\n\nconfig = ScriptRunConfig(source_directory=<'<path/to/script>'>, script='train.py', ...)\nrun = exp.submit(config)\n")),(0,o.kt)("p",null,"For more details: ",(0,o.kt)("a",{parentName:"p",href:"script-run-config"},"ScriptRunConfig")),(0,o.kt)("h3",{id:"get-context"},"Get Context"),(0,o.kt)("p",null,"Code that is running within Azure ML is associated to a ",(0,o.kt)("inlineCode",{parentName:"p"},"Run"),". The submitted code\ncan access its own run."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-py"},"from azureml.core import Run\nrun = Run.get_context()\n")),(0,o.kt)("h4",{id:"example-logging-metrics-to-current-run-context"},"Example: Logging metrics to current run context"),(0,o.kt)("p",null,"A common use-case is logging metrics in a training script."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-py",metastring:'title="train.py"',title:'"train.py"'},"from azureml.core import Run\n\nrun = Run.get_context()\n\n# training code\nfor epoch in range(n_epochs):\n    model.train()\n    ...\n    val = model.evaluate()\n    run.log('validation', val)\n")),(0,o.kt)("p",null,"When this code is submitted to Azure ML (e.g. via ScriptRunConfig) it will log metrics to its assocaited run."),(0,o.kt)("p",null,"For more details: ",(0,o.kt)("a",{parentName:"p",href:"logging"},"Logging Metrics")),(0,o.kt)("h3",{id:"interactive"},"Interactive"),(0,o.kt)("p",null,"In an interactive setting e.g. a Jupyter notebook"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-python"},"run = exp.start_logging()\n")),(0,o.kt)("h4",{id:"example-jupyter-notebook"},"Example: Jupyter notebook"),(0,o.kt)("p",null,"A common use case for interacive logging is to train a model in a notebook."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-py"},"from azureml.core import Workspace\nfrom azureml.core import Experiment\nws = Workspace.from_config()\nexp = Experiment(ws, 'example')\n\nrun = exp.start_logging()                   # start interactive run\nprint(run.get_portal_url())                 # get link to studio\n\n# toy example in place of e.g. model\n# training or exploratory data analysis\nimport numpy as np\nfor x in np.linspace(0, 10):\n    y = np.sin(x)\n    run.log_row('sine', x=x, y=y)           # log metrics\n\nrun.complete()                              # stop interactive run\n")),(0,o.kt)("p",null,"Follow the link to the run to see the metric logging in real time."),(0,o.kt)("p",null,(0,o.kt)("img",{src:t(7715).Z})))}s.isMDXComponent=!0},7715:function(e,n,t){"use strict";n.Z=t.p+"assets/images/run-ex-sine-a78600f095ae349a514b9d3e3e3dbcea.png"}}]);