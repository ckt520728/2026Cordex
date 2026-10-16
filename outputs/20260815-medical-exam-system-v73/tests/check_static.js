/* v7.3 靜態完整性檢查：不連線 Google，也不讀取任何病人資料。 */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.html'), 'utf8');
const backend = fs.readFileSync(path.join(__dirname, '..', 'src', 'Code.gs'), 'utf8');
let failures = 0;
function check(label, ok, detail) {
  console.log('  ' + (ok ? 'PASS  ' : 'FAIL  ') + label + (!ok && detail ? '\n        ' + detail : ''));
  if (!ok) failures++;
}

console.log('\n-- JavaScript syntax --');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
scripts.forEach((source, index) => {
  let error = '';
  try { new Function(source.replace(/<\?[!=]?[\s\S]*?\?>/g, 'null')); } catch (err) { error = err.message; }
  check('HTML script block ' + (index + 1) + ' parses', !error, error);
});
let backendError = '';
try { new Function(backend); } catch (err) { backendError = err.message; }
check('Code.gs parses as JavaScript', !backendError, backendError);

console.log('\n-- DOM wiring --');
const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
check('HTML has no duplicate IDs', duplicateIds.length === 0, duplicateIds.join(', '));

const handlerNames = [...html.matchAll(/\bon\w+=["']([A-Za-z_$][\w$]*)\s*\(/g)].map((m) => m[1]);
const missingHandlers = [...new Set(handlerNames)].filter((name) =>
  !new RegExp('function\\s+' + name.replace(/[$]/g, '\\$&') + '\\s*\\(').test(html));
check('all inline handlers resolve to declared functions', missingHandlers.length === 0, missingHandlers.join(', '));
check('new Dashboard and translation controls exist',
  ['dashboardState', 'dashboardExportBtn', 'symptomsEnglish', 'examIndicationEnglish']
    .every((id) => ids.includes(id)));

console.log('\n-- encoding and version --');
check('UTF-8 text has no replacement character', !html.includes('\uFFFD') && !backend.includes('\uFFFD'));
check('visible application version is v7.3', /System v7\.3/.test(html) && />v7\.3<\/span>/.test(html));

console.log(failures ? '\n' + failures + ' FAILED\n' : '\nall checks passed\n');
process.exit(failures ? 1 : 0);
