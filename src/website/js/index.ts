import 'tw-elements';
import $ from 'jquery';

import '../../shared/css/tailwind.css';
import '../../shared/css/fonts.css';
import '../css/typography.css';
import '../css/privacy-policy.css';
import '../css/index.css';

$(document).ready(function () {
  $('.copyright-year', document).text(new Date().getFullYear());
});
