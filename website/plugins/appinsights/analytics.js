import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

export default (function () {
  if (!ExecutionEnvironment.canUseDOM) {
    return null;
  }

  return {
    onRouteUpdate({location}) {
      // Set page so that subsequent hits on this page are attributed
      // to this page. This is recommended for Single-page Applications.
      window.ga('set', 'page', location.pathname);
      // Always refer to the variable on window in-case it gets
      // overridden elsewhere.
      window.ga('send', 'pageview');
    },
  };
})();