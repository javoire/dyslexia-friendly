import '../../shared/css/tailwind.css';
import '../../shared/css/fonts.css';

import '../css/popup.css';

// Single-source the version from the manifest at runtime
const version = chrome.runtime.getManifest().version;
const versionEl = document.getElementById('version');
if (versionEl) {
  versionEl.textContent = `Version ${version}`;
}
