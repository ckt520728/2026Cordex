/* Regression test for the 陽明醫院 admission-note text generators.
 *
 *   node tests/check_note_output.js
 *
 * Loads ROS_SYSTEMS / PE_FORM and the pure text builders out of src/index.html,
 * runs them against a stubbed DOM, and asserts the output matches the hospital's
 * pre-printed ADMISSION NOTE form. Static syntax checks cannot catch a wrong
 * output format — this can.
 *
 * Exits non-zero on any failure.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src', 'index.html');
const src = fs.readFileSync(SRC, 'utf8');

function grabVar(name) {
  const i = src.indexOf('var ' + name + ' = [');
  if (i < 0) throw new Error('config not found: ' + name);
  const j = src.indexOf('\n  ];', i);
  return src.slice(i, j + 5);
}
function grabFn(name) {
  const i = src.indexOf('function ' + name + '(');
  if (i < 0) throw new Error('function not found: ' + name);
  let depth = 0, started = false;
  for (let k = src.indexOf('{', i); k < src.length; k++) {
    if (src[k] === '{') { depth++; started = true; }
    else if (src[k] === '}') { depth--; if (started && depth === 0) return src.slice(i, k + 1); }
  }
  throw new Error('unbalanced braces in ' + name);
}

const fields = {};
const documentStub = {
  getElementById: (id) => (id in fields ? { value: fields[id] } : { value: '' }),
  querySelector: () => null,
  querySelectorAll: () => [],
};

const code = [
  grabVar('ROS_SYSTEMS'),
  grabVar('PE_FORM'),
  'var rosState = {}; var peState = {}; var peActive = {};',
  grabFn('peFind'), grabFn('peKey'), grabFn('peSign'),
  grabFn('composePE'), grabFn('buildROSText'), grabFn('buildPEText'),
  grabFn('buildPersonalHistoryLines'),
  grabVar('LAB_PANELS'), grabVar('STUDY_PANELS'),
  grabFn('padRight_'), grabFn('labLine_'),
  grabFn('buildLabsText'), grabFn('buildStudiesText'),
  'module.exports = { ROS_SYSTEMS, PE_FORM, buildROSText, buildPEText, composePE,' +
  ' buildPersonalHistoryLines, buildLabsText, buildStudiesText, LAB_PANELS, STUDY_PANELS,' +
  ' setRos: (s) => { rosState = s; }, setPe: (a) => { peActive = a; },' +
  ' setPeState: (s) => { peState = s; } };',
].join('\n');

const mod = { exports: {} };
new Function('module', 'document', code)(mod, documentStub);
const A = mod.exports;

let failures = 0;
function check(label, cond, detail) {
  if (cond) { console.log('  PASS  ' + label); }
  else { console.log('  FAIL  ' + label + (detail ? '\n        ' + detail : '')); failures++; }
}

console.log('\n-- structure --');
check('ROS has the form\'s 9 systems', A.ROS_SYSTEMS.length === 9, 'got ' + A.ROS_SYSTEMS.length);
check('ROS has no generic "endo" system',
  !A.ROS_SYSTEMS.some((s) => s[0] === 'endo'));
check('PE has 9 blocks', A.PE_FORM.length === 9, 'got ' + A.PE_FORM.length);
check('PE keeps the form\'s Wound line', A.PE_FORM.some((s) => s[1] === 'Wound'));
check('PE dropped generic Back/Neuro/Skin blocks',
  !A.PE_FORM.some((s) => ['peBack', 'peNeuro', 'peSkin'].indexOf(s[0]) >= 0));
check('Abdomen carries the form\'s 11 items',
  (A.PE_FORM.filter((s) => s[0] === 'peAbdomen')[0] || [])[4].length === 11);

console.log('\n-- review of systems --');
const ros = {};
A.ROS_SYSTEMS.forEach((sys) => sys[2].forEach((it) => { ros[sys[0] + '|' + it] = 'neg'; }));
ros['resp|dyspnea'] = 'pos';
A.setRos(ros);
const rosText = A.buildROSText();
check('numbered, full-width colon, ；separator',
  /^1\.systemic：fever\(-\)；BW loss\(-\)/.test(rosText), rosText.split('\n')[0]);
check('positives render as (+)', rosText.indexOf('dyspnea(+)') >= 0);
check('emits all 9 numbered systems', rosText.split('\n').length === 9);
check('9th line is Neurological', /^9\.Neurological：/.test(rosText.split('\n')[8]));

console.log('\n-- unreviewed items are not asserted --');
A.setRos({ 'resp|cough': 'pos' });
const sparse = A.buildROSText();
check('only the reviewed item prints', sparse === '5.Respiratory：cough(+)', JSON.stringify(sparse));

console.log('\n-- physical examination --');
const act = {};
A.PE_FORM.forEach((s) => { act[s[0]] = true; });
A.setPe(act);
A.setPeState({});
A.PE_FORM.forEach((s) => { fields[s[0]] = A.composePE(s[0]); });
const peText = A.buildPEText();
check('Conscious uses the form\'s E_V_M_ form', /Conscious: E\d+V\d+M\d+/.test(peText));
check('HEENT item 1 pairs two flags',
  peText.indexOf('HEENT: 1.Conjunctivae pale(-), icteric sclerae(-)') >= 0);
check('normal-positive items keep (+)', peText.indexOf('Neck: 1.supple(+)') >= 0);
check('Heart item 4 keeps the "Palpable" prefix',
  peText.indexOf('4.Palpable : Thrill(-), Heave(-)') >= 0);
check('Abdomen numbering reaches 11', peText.indexOf('11.Scar(-)') >= 0);
check('continuation lines are indented under the label',
  peText.indexOf('\n       2.Tonsil enlargement(-)') >= 0);

console.log('\n-- personal history (under 過去病史, per the hospital form) --');
Object.assign(fields, {
  admSmoking: 'Non-smoker', admPackYear: '',
  admAlcohol: 'Denied alcohol use', admAlcoholDetail: '',
  admBetelNut: 'Denied betel nut chewing', admBetelDetail: '',
  admWaterExposure: 'no',
  admOccupation: '', admTravelContact: '', admFunctional: '',
});
let ph = A.buildPersonalHistoryLines();
check('the form\'s four fixed items, numbered', ph.length === 4, JSON.stringify(ph));
check('item 1 is Smoking', ph[0] === '1. Smoking : Non-smoker', ph[0]);
check('item 3 is Betel nut chewing', /^3\. Betel nut chewing : /.test(ph[2]), ph[2]);
check('item 4 is the contaminated-water line',
  ph[3] === '4. Exposures to contaminated water : no', ph[3]);

fields.admPackYear = '30 pack-year';
check('pack-year appends in parentheses',
  A.buildPersonalHistoryLines()[0] === '1. Smoking : Non-smoker (30 pack-year)',
  A.buildPersonalHistoryLines()[0]);

fields.admOccupation = 'Retired construction worker';
fields.admTravelContact = 'Denied recent travel';
ph = A.buildPersonalHistoryLines();
check('optional fields continue the numbering only when filled',
  ph.length === 6 && ph[4] === '5. Occupation : Retired construction worker' &&
  /^6\. TOCC : /.test(ph[5]), JSON.stringify(ph.slice(4)));

console.log('\n-- laboratory panel format (檢驗報告 / 檢查報告) --');
check('labs cover the form\'s CBC / BCS / SMA panels',
  ['CBC', 'BCS', 'SMA'].every((p) => A.LAB_PANELS.some((r) => r[0] === p)));
check('studies cover the form\'s CxR / KUB',
  ['CxR', 'KUB'].every((p) => A.STUDY_PANELS.some((r) => r[0] === p)));

Object.assign(fields, {
  labCBCDate: '2/18', labCBC: 'WBC:12.3  Hgb:10.2  PLT:210  MCV:88',
  labBCSDate: '2/18', labBCS: 'BUN:32  Cr:2.1  Na:138',
  labSMADate: '11/14', labSMA: 'GOT:32  GPT:28',
  labCXRDate: '2/18', labCXR: 'Bilateral lower lung infiltration',
  labKUBDate: '2/18', labKUB: 'No free air',
  labOther: '',
});
const labs = A.buildLabsText();
check('panel + date + values, column aligned',
  labs.split('\n')[0] === 'CBC  2/18   WBC:12.3  Hgb:10.2  PLT:210  MCV:88',
  JSON.stringify(labs.split('\n')[0]));
check('a different panel date is preserved',
  labs.indexOf('SMA  11/14  GOT:32') >= 0, JSON.stringify(labs));
check('empty panels are omitted', labs.split('\n').length === 3, JSON.stringify(labs));
check('studies render in the same shape',
  A.buildStudiesText().split('\n')[0] === 'CxR  2/18   Bilateral lower lung infiltration',
  JSON.stringify(A.buildStudiesText().split('\n')[0]));

fields.labCBCDate = '';
check('a panel with no date still renders without a gap',
  A.buildLabsText().split('\n')[0] === 'CBC  WBC:12.3  Hgb:10.2  PLT:210  MCV:88',
  JSON.stringify(A.buildLabsText().split('\n')[0]));

console.log('\n-- untouched blocks stay out of the note --');
A.setPe({});
A.PE_FORM.forEach((s) => { fields[s[0]] = A.composePE(s[0]); });
check('nothing printed before the physician examines', A.buildPEText() === '');

console.log(failures ? '\n' + failures + ' FAILED\n' : '\nall checks passed\n');
process.exit(failures ? 1 : 0);
