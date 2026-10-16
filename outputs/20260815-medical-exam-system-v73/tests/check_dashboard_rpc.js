/* Dashboard Apps Script RPC contract regression test.
 *
 * 使用 synthetic rows 執行 public endpoint；不連線真實 Sheets，也不含 PHI。
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const backend = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'Code.gs'),
  'utf8'
);

function fakeSheet(rows) {
  return {
    getDataRange() {
      return { getValues() { return rows; } };
    }
  };
}

const examHeader = Array(28).fill('header');
const examRow = Array(28).fill('');
examRow[0] = 'EXAM-SYNTHETIC-001';
examRow[1] = new Date('2026-08-15T01:02:03Z');
examRow[2] = new Date('2026-08-15T00:00:00Z');
examRow[3] = 'Abdominal Sonography';
examRow[4] = '測試醫師';
examRow[5] = 'MRN-SYNTHETIC';
examRow[7] = 'Synthetic diagnosis';
examRow[9] = 'Synthetic impression';
// Google Sheets 的生日欄通常會以 Date 回傳；這正是正式站曾失去 payload 的型別。
examRow[19] = new Date('1980-01-02T00:00:00Z');
// Google Sheets 的 time-formatted cell 也會回傳 Date，必須同樣轉成字串。
examRow[24] = new Date('1899-12-30T08:30:00Z');

const admissionHeader = Array(18).fill('header');
const admissionRow = Array(18).fill('');
admissionRow[0] = 'ADM-SYNTHETIC-001';
admissionRow[1] = new Date('2026-08-14T03:04:05Z');
admissionRow[2] = new Date('2026-08-14T00:00:00Z');
admissionRow[3] = 'MRN-SYNTHETIC-2';
admissionRow[4] = '測試病患';
admissionRow[7] = '測試醫師';
admissionRow[9] = 'Synthetic chief complaint';

const sheets = {
  Master_Exams: fakeSheet([examHeader, examRow]),
  Master_AdmissionNotes: fakeSheet([admissionHeader, admissionRow])
};

const sandbox = {
  console,
  Date,
  Object,
  Math,
  Number,
  String,
  RegExp,
  Utilities: {
    formatDate(value, _timezone, pattern) {
      const date = new Date(value);
      const iso = date.toISOString();
      if (pattern === 'HH:mm') return iso.slice(11, 16);
      return pattern === 'yyyy-MM-dd HH:mm'
        ? iso.slice(0, 16).replace('T', ' ')
        : iso.slice(0, 10);
    }
  },
  __fakeGetSpreadsheet() {
    return {
      getSheetByName(name) {
        return sheets[name] || null;
      }
    };
  }
};

vm.createContext(sandbox);
vm.runInContext(backend, sandbox, { filename: 'Code.gs' });
vm.runInContext(
  'authFail_ = function () { return null; }; getSpreadsheet = __fakeGetSpreadsheet;',
  sandbox
);

const result = vm.runInContext(
  "getRecordDashboard('synthetic-token', { recordType: 'all' }, 50)",
  sandbox
);

function findRpcUnsafe(value, pathLabel) {
  if (value === undefined) return pathLabel + ' is undefined';
  if (value === null) return '';
  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') return '';
  if (type === 'function' || type === 'symbol' || type === 'bigint') {
    return pathLabel + ' has prohibited type ' + type;
  }
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return pathLabel + ' is Date';
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const issue = findRpcUnsafe(value[i], pathLabel + '[' + i + ']');
      if (issue) return issue;
    }
    return '';
  }
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return pathLabel + ' is not a plain object';
  }
  for (const key of Object.keys(value)) {
    const issue = findRpcUnsafe(value[key], pathLabel + '.' + key);
    if (issue) return issue;
  }
  return '';
}

if (!result || result.status !== 'success') {
  console.error('FAIL Dashboard public endpoint 未回傳 success envelope。');
  process.exit(1);
}

if (result.records.length !== 2 ||
    !result.filteredStats ||
    result.filteredStats.total !== 2 ||
    result.filteredStats.admissions !== 1 ||
    result.filteredStats.sono !== 1) {
  console.error('FAIL Dashboard 未以單一 response 合併住院與檢查，或缺少目前條件統計。');
  process.exit(1);
}

const examRecord = result.records.find(record => record.recordKind === 'exam');
if (!examRecord || examRecord.examTime !== '08:30') {
  console.error('FAIL Google Sheets time-formatted cell 未穩定序列化為 HH:mm。');
  process.exit(1);
}

const rpcIssue = findRpcUnsafe(result, 'result');
if (rpcIssue) {
  console.error('FAIL Dashboard response 不符合 google.script.run 可傳輸型別：' + rpcIssue);
  process.exit(1);
}

const sonoOnly = vm.runInContext(
  "getRecordDashboard('synthetic-token', { recordType: 'sono' }, 50)",
  sandbox
);
if (!sonoOnly || sonoOnly.filteredCount !== 1 ||
    sonoOnly.records[0].recordKind !== 'exam') {
  console.error('FAIL recordType facet 未正確限制為腹部超音波。');
  process.exit(1);
}

// 預覽後若資料筆數已改變，backend 必須在建立 Drive 檔案前停止。
const staleExport = vm.runInContext(
  "exportRecordSummaryXlsx('synthetic-token', { recordType: 'all', expectedCount: 999 })",
  sandbox
);
if (!staleExport || staleExport.status !== 'stale' || staleExport.currentCount !== 2) {
  console.error('FAIL Excel export 未阻擋 preview count 與目前資料不一致的請求。');
  process.exit(1);
}

console.log('PASS Dashboard response 為 RPC-safe 統一紀錄與雙層統計 contract。');
