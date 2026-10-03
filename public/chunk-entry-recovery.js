/**
 * Runs before the Vite entry module. If a stale deploy serves HTML for /assets/*.js,
 * React never boots — recover with one guarded reload (see chunkLoadRecovery session key).
 */
(function () {
  var RELOAD_KEY = 'fa_chunk_reload';
  var BOOT_FLAG = '__fa_app_booted__';

  function guardedReplaceReload() {
    try {
      if (sessionStorage.getItem(RELOAD_KEY)) return;
      sessionStorage.setItem(RELOAD_KEY, '1');
    } catch (e) {
      return;
    }
    var url = new URL(window.location.href);
    url.searchParams.set('_fa_cv', String(Date.now()));
    window.location.replace(url.toString());
  }

  function isProductionAssetEntry(script) {
    var src = script.getAttribute('src') || '';
    return src.indexOf('/assets/') !== -1;
  }

  function watchModuleScripts() {
    var scripts = document.querySelectorAll('script[type="module"][src]');
    for (var i = 0; i < scripts.length; i++) {
      scripts[i].addEventListener('error', function () {
        guardedReplaceReload();
      });
    }
    var entry = scripts[0];
    if (entry && isProductionAssetEntry(entry)) {
      window.setTimeout(function () {
        if (!window[BOOT_FLAG]) {
          guardedReplaceReload();
        }
      }, 12000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchModuleScripts);
  } else {
    watchModuleScripts();
  }
})();
