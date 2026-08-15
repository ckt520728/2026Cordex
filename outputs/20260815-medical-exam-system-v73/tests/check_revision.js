/* 臨床檢驗報告系統 v7.3 regression tests。
 *
 * 測試 public seams，不連線真實 Sheets，也不使用病人資料。
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'src', 'index.html'), 'utf8');
const backend = fs.readFileSync(path.join(root, 'src', 'Code.gs'), 'utf8');

let failures = 0;
function check(label, condition, detail) {
  if (condition) {
    console.log('  PASS  ' + label);
    return;
  }
  failures++;
  console.log('  FAIL  ' + label + (detail ? '\n        ' + detail : ''));
}

function functionBody(source, name) {
  const start = source.indexOf('function ' + name + '(');
  if (start < 0) return '';
  let depth = 0;
  let opened = false;
  for (let i = source.indexOf('{', start); i < source.length; i++) {
    if (source[i] === '{') {
      depth++;
      opened = true;
    } else if (source[i] === '}') {
      depth--;
      if (opened && depth === 0) return source.slice(start, i + 1);
    }
  }
  return '';
}

console.log('\n-- Dashboard public seam --');
check('backend exposes unified getRecordDashboard endpoint',
  /function\s+getRecordDashboard\s*\(/.test(backend));
check('frontend calls the unified Dashboard endpoint',
  /server\(['\"]getRecordDashboard['\"]/.test(functionBody(html, 'loadDashboardData')));
check('Dashboard has a persistent status region',
  /id=['\"]dashboardState['\"]/.test(html));

const dashboardLoader = functionBody(html, 'loadDashboardData');
check('Dashboard loader does not silently swallow failures',
  !/\.catch\(function\s*\([^)]*\)\s*\{\s*\}\s*\)/.test(dashboardLoader),
  'loadDashboardData() 仍含空白 catch，錯誤時會永久顯示載入中。');
check('Dashboard handles non-success responses explicitly',
  !/status\s*!==\s*['\"]success['\"]\)\s*return\s*;/.test(dashboardLoader),
  'non-success response 不可直接 return。');
check('Dashboard provides structured doctor/date/type filters',
  ['dashboardDoctor', 'dashboardStartDate', 'dashboardEndDate', 'dashboardRecordType']
    .every((id) => html.includes('id="' + id + '"')));
check('Dashboard uses one unified record table instead of admission/exam tabs',
  !/id=['"]dashTab(?:Exam|Adm)['"]/.test(html) &&
  /renderUnifiedRecordTable\s*\(/.test(dashboardLoader));
check('Dashboard presents cumulative and current-filter counts side by side',
  ['statTotalMatched', 'statAdmissionMatched', 'statExamMatched',
    'statEchoMatched', 'statSonoMatched', 'statUGIMatched', 'statLGIMatched']
    .every((id) => html.includes('id="' + id + '"')));
check('Dashboard exposes applied-filter summary and result count',
  /id=['"]dashboardFilterSummary['"]/.test(html) &&
  /id=['"]dashboardResultCount['"]/.test(html));
check('Dashboard distinguishes an empty transport response from zero records',
  /TRANSPORT_EMPTY_RESPONSE/.test(dashboardLoader));

console.log('\n-- Excel summary --');
const exportBody = functionBody(backend, 'exportRecordSummaryXlsx');
check('backend exposes Excel summary endpoint', exportBody.length > 0);
check('Excel export reuses the dashboard filter model',
  /collectDashboardRecords_\s*\(/.test(exportBody));
check('Excel summary combines admissions and exam reports for the interval',
  /var\s+records\s*=\s*data\.records/.test(exportBody));
check('Excel summary records the unified recordType rather than obsolete examType',
  /filters\.recordType/.test(exportBody) && !/filters\.examType/.test(exportBody));
check('default Excel detail excludes patient identifiers',
  exportBody.length > 0 && !/patientName|patientId|nationalId/.test(exportBody));
check('Excel summary does not echo a possibly identifying search query',
  !/spreadsheetSafeCell_\(filters\.query/.test(exportBody) &&
  /已套用（內容不寫入報表）/.test(exportBody));
check('formula-like cell content is escaped',
  /function\s+spreadsheetSafeCell_\s*\(/.test(backend));
const safeModule = { exports: {} };
new Function('module', functionBody(backend, 'spreadsheetSafeCell_') +
  '\nmodule.exports = spreadsheetSafeCell_;')(safeModule);
check('formula injection is neutralized even after leading spaces',
  safeModule.exports('  =HYPERLINK("https://invalid.example")').startsWith("'"));
const exportClickBody = functionBody(html, 'exportDashboardXlsx');
const exportPreviewBody = functionBody(html, 'previewDashboardExport');
const exportConfirmBody = functionBody(html, 'confirmDashboardExport');
check('Excel export requires a preview before Drive file creation',
  /previewDashboardExport\s*\(/.test(exportClickBody) &&
  !/server\(['"]exportRecordSummaryXlsx['"]/.test(exportClickBody) &&
  /expectedCount/.test(exportClickBody) &&
  /filteredStats/.test(exportPreviewBody) &&
  /server\(['"]exportRecordSummaryXlsx['"]/.test(exportConfirmBody));
check('Excel preview states range, count, type breakdown and de-identification',
  /日期範圍/.test(exportPreviewBody) && /筆/.test(exportPreviewBody) &&
  /住院/.test(exportPreviewBody) && /腹超/.test(exportPreviewBody) &&
  /姓名/.test(exportPreviewBody) && /MRN|病歷號/.test(exportPreviewBody));

console.log('\n-- Historical row resilience --');
const dateModule = { exports: {} };
new Function('module', functionBody(backend, 'parseRecordDate_') +
  '\nmodule.exports = parseRecordDate_;')(dateModule);
const rocDate = dateModule.exports('113/08/14');
check('ROC historical date is parsed without aborting the batch',
  rocDate instanceof Date && rocDate.getFullYear() === 2024 && rocDate.getMonth() === 7 && rocDate.getDate() === 14);
check('malformed historical date returns null', dateModule.exports('not-a-date') === null);
check('row mappers use safe date formatting',
  /formatRecordDate_\(row\[2\]/.test(functionBody(backend, 'mapExamRow_')) &&
  /formatRecordDate_\(row\[2\]/.test(functionBody(backend, 'mapAdmissionRow_')));

console.log('\n-- ROC birth date and admission age --');
const ageBody = functionBody(html, 'ageFromBirth');
const ageModule = { exports: {} };
try {
  new Function('module', ageBody + '\nmodule.exports = ageFromBirth;')(ageModule);
} catch (err) {
  ageModule.exports = function () { return 'ERROR'; };
}
const ageFromBirth = ageModule.exports;
check('separated synthetic ROC date calculates age against admission date',
  ageFromBirth('040/01/01', '2026-08-15') === '75');
check('7-digit ROC date is supported',
  ageFromBirth('0400101', '2026-08-15') === '75');
check('invalid calendar date is rejected',
  ageFromBirth('114/02/30', '2026-08-15') === '');
check('future birth date is rejected',
  ageFromBirth('116/01/01', '2026-08-15') === '');
check('admission fields trigger age/gender synchronization',
  /id=['\"]admBirthDate['\"][^>]*oninput=['\"]syncAdmissionAgeGender\(\)/.test(html) &&
  /id=['\"]admDate['\"][^>]*onchange=['\"]syncAdmissionAgeGender\(\)/.test(html) &&
  /function\s+syncAdmissionAgeGender\s*\(/.test(html));

console.log('\n-- Editable clinical fields --');
check('attending/operator support typed values with suggestions',
  /<input[^>]*id=['\"]admDoctorName['\"][^>]*list=['\"]physicianOptions['\"]/.test(html) &&
  /<input[^>]*id=['\"]doctorName['\"][^>]*list=['\"]physicianOptions['\"]/.test(html) &&
  /<datalist[^>]*id=['\"]physicianOptions['\"]/.test(html));
check('S/O English targets exist without replacing Chinese sources',
  /id=['\"]symptomsEnglish['\"]/.test(html) && /id=['\"]examIndicationEnglish['\"]/.test(html));
check('printed S/O prefer reviewed English and retain fallback',
  /v\(['\"]symptomsEnglish['\"]\)\s*\|\|\s*v\(['\"]symptoms['\"]\)/.test(html) &&
  /v\(['\"]examIndicationEnglish['\"]\)\s*\|\|\s*v\(['\"]examIndication['\"]\)/.test(html));
check('saved structured details retain Chinese S/O sources',
  /sourceSymptomsChinese\s*:\s*g\(['\"]symptoms['\"]\)/.test(html) &&
  /sourceIndicationChinese\s*:\s*g\(['\"]examIndication['\"]\)/.test(html));
check('unfinished local draft requires explicit restore confirmation',
  /confirm\s*\(/.test(functionBody(html, 'restoreDraft')));

const editableSonoIds = ['sonoLiverEcho', 'sonoLiverLesion', 'sonoIHD', 'sonoGB',
  'sonoPancreasSpleen', 'sonoRK', 'sonoLK', 'sonoAscites'];
check('sonography common descriptions remain directly editable',
  editableSonoIds.every((id) =>
    new RegExp('<input[^>]*id=[\'\"]' + id + '[\'\"][^>]*list=[\'\"]' + id + 'Options[\'\"]').test(html) &&
    new RegExp('<datalist[^>]*id=[\'\"]' + id + 'Options[\'\"]').test(html)));

const sonoFields = {};
editableSonoIds.concat(['sonoCBD', 'sonoRenalSize', 'sonoOther',
  'findings', 'diagnosis', 'impression', 'recommendation']).forEach((id) => {
  sonoFields[id] = { value: '' };
});
const sonoDocument = { getElementById: (id) => sonoFields[id] || { value: '' } };
const sonoModule = { exports: {} };
new Function('module', 'document',
  'var manualEdits = {}; var currentExamType = "Abdominal Sonography";' +
  'function scheduleDraftSave() {}\n' + functionBody(html, 'setIfAuto') + '\n' +
  functionBody(html, 'buildReportText') +
  '\nmodule.exports = buildReportText;')(sonoModule, sonoDocument);
sonoModule.exports();
check('blank sonography fields never auto-assert a normal diagnosis',
  sonoFields.diagnosis.value === '' && sonoFields.impression.value === '',
  'diagnosis=' + JSON.stringify(sonoFields.diagnosis.value) +
  ', impression=' + JSON.stringify(sonoFields.impression.value));

console.log(failures ? '\n' + failures + ' FAILED\n' : '\nall checks passed\n');
process.exit(failures ? 1 : 0);
