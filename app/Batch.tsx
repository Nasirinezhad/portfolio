import { useMemo, useState, type ChangeEvent, type ClipboardEvent } from 'react';
import * as XLSX from 'xlsx';

/* ================= types ================= */
type Row = { a: string; n: string; m: string; p: string };
type Cfg = { div: boolean; min: boolean; sep: boolean; save: boolean; ign: boolean; bom: boolean; limD: number; limR: number };
type Acc = { iban: string; name: string };
type Info = { i: string; c: string; t: string };
type Log = { t: string; c: string };
type Kind = 'ach' | 'rtgs' | 'tejarat';

/* ================= data ================= */
const BANKS: Record<number, string> = { 10: 'مرکزی', 11: 'صنعت معدن', 12: 'ملت', 13: 'رفاه', 14: 'مسکن', 15: 'سپه', 16: 'کشاورزی', 17: 'ملی', 18: 'تجارت', 19: 'صادرات', 20: 'توسعه صادرات', 21: 'پست بانک', 22: 'توسعه تعاون', 52: 'قوامین', 53: 'کارآفرین', 54: 'پارسیان', 55: 'اقتصادنوین', 56: 'سامان', 57: 'پاسارگاد', 58: 'سرمایه', 59: 'سینا', 60: 'مهر', 61: 'شهر', 62: 'آینده', 63: 'سپه انصار', 64: 'گردشگری', 65: 'سپه حکمت', 66: 'دی', 69: 'ایران زمین', 70: 'رسالت', 73: 'سپه کوثر', 75: 'ملل', 78: 'خاورمیانه', 79: 'سپه مهر اقتصاد', 80: 'نور', 93: 'شاپرک', 95: 'ایران ونزولا' };
const T = { ach: 'پایا', rtgs: 'ساتنا', tejarat: 'تجارت' };
const M: Record<string, string> = {
  InvalidIBAN: 'این شماره شبا معتبر نیست', InvalidIBANLength: 'طول شماره شبا معتبر نیست، هر شبا شامل دقیقا 24 رقم است',
  NoPunctuation: 'در نام و نام خانوادگی از علایم نگارشی نباید استفاده شود', ShortName: 'نام و نام خانوادگی کوتاه است',
  NoFloat: 'مبلغ نمیتواند اعشار داشته باشد', WillNotExport: 'مبلغ صفر به فایل خروجی اضافه نخواهد شد',
  MaxPayID: 'حداکثر طول شناسه واریز 30 رقم است', CantDivid: 'این دستور شناسه دار است و مبلغ آن بیشتر از حد پایا است نمیتوان به صورت گروهی اجرا شود',
  WillDivid: 'این دستور در ** حواله واریز خواهد شد', FixErrorsFirst: 'ابتدا خطاهای موجود را حل کنید **',
  DiffrentWithLast: 'این شبا قبلا به نام  **  ثبت شده است. از صحت نام مطمئن شوید. میتوانید نام را در حساب ها اصلاح کنید',
  DupDiffrentName: 'شبا در همین لیست با نام متفاوت تکرار شده است: ',
  CountTejLess: 'تعداد حساب های طرف تجارت کمتر از 10 مورد است', CountACHLess: 'تعداد پایا ها کمتر از 11 مورد است', CountRTGSLess: 'تعداد ساتنا ها کمتر از 11 مورد است',
  NothingToExport: 'چیزی برای خروجی گرفتن وجود ندارد!',
  TotalAmountach: 'مجموع مبالغ پایای گروهی', TotalAmounttejarat: 'مجموع مبالغ تجارت  گروهی', TotalAmountrtgs: 'مجموع مبالغ ساتنای گروهی',
  RecordsCountach: 'تعداد حواله های پایای گروهی', RecordsCounttejarat: 'تعداد رکورد های حساب تجارت', RecordsCountrtgs: 'تعداد حواله های ساتنای گروهی',
  NoRTGS: 'در این حالت خروجی ساتنا گرفته نمی‌شود و تمامی رکورد های بیش از سقف پایا به چند رکورد با سقف پایا تقسیم خواهند شد.',
  RTGSInclude: 'فایل ساتنای گروهی بر اساس مبالغ رکورد ها ایجاد خواهد شد.',
  selectedNoRTGS: 'شما حالت ساتنای گروهی را انتخاب نکرده اید!',
  minRTGS: 'رکورد های بیشتر از حداقل ساتنا در فایل ساتنا قرار خواهند گرفت',
  maxRTGS: 'رکورد های بیشتر از سقف پایا در فایل ساتنا و کمتر از آن در فایل پایا قرار خواهند گرفت',
  SepTrans: 'شباها و حساب های مقصد بانک تجارت در فایل جداگانه خروجی گرفته می‌شوند',
  TransInclude: 'شباها و حساب های مقصد بانک تجارت همراه سایر بانک ها در یک فایل خروجی گرفته می‌شوند',
  NamesWillSave: 'شبا و نام در این لیست ذخیره خواهند شد تا در استفاده های بعدی مقایسه شوند. امکان استعلام نام صاحب حساب وجود ندارد و این مقایسه صرفا براساس مقادیری است که خودتان وارد کرده اید.',
  NoSaveNames: 'لیست نام و شبا ذخیره نخواهد شد.',
  IgnoErr: 'فایل خروجی با وجود خطا ایجاد خواهد شد. در این صورت ممکن است فایل قابل اجرا نباشد یا موارد خطا دار توسط شعبه عودت شوند.',
  IncErr: 'در صورت وجود خطا در لیست خروجی ایجاد نمی‌شود',
};
const tr = (k: string, ...a: (string | number)[]) => { let s = M[k] ?? k; a.forEach((v) => (s = s.replace('**', String(v)))); return s; };

/* ================= core logic ================= */
const D = (s: unknown) => String(s ?? '').replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632));
const toNum = (s: unknown) => { const x = D(s).replace(/[,٬\s]/g, ''); return x === '' || isNaN(+x) ? NaN : +x; };
const mod97 = (s: string) => { let r = 0; for (const c of s) r = (r * 10 + +c) % 97; return r; };
const pad = (t: string, n: number, ch: string) => (ch.repeat(n) + t).slice(-n); // مثل Right(String(n,ch)&text,n) در VBA
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const withCD = (s: string) => ('0' + (98 - mod97(s + '182700')) + s).slice(-24);
const bankOf = (i: string) => i.substr(3, 2);
const hasPunct = (s: string) => /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(s);

function findIban(ibn: string, bank: string) {
  ibn = ibn.replace(/ir/gi, '').replace(/[\s\-']/g, '');
  return withCD(('0' + bank + '000000000000000000000000').slice(0, Math.max(0, 22 - ibn.length)) + ibn);
}
export function acc2iban(raw: string): string {
  let s = D(raw).trim().replace(/ir/gi, '').replace(/[\s\-']/g, '');
  if (s.includes('0*')) s = s.replace('0*', '0'.repeat(Math.max(0, 26 - s.length)));
  if (s.includes('/')) { const i = s.indexOf('/'); s = findIban(s.slice(i + 1), s.slice(0, i)); }
  if (s.length >= 8 && s.length <= 13) s = withCD('018000000000000000000000000'.slice(0, 22 - s.length) + s);
  else if (s.length !== 24) return 'InvalidIBANLength';
  if (!/^\d+$/.test(s) || mod97(s.slice(2) + '1827' + s.slice(0, 2)) !== 1) return 'InvalidIBAN';
  return s;
}

const ONES = ['صفر', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه', 'ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
const TENS = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
const HUND = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
const SCALE = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون', 'کوادریلیون'];
function w3(n: number) {
  const p: string[] = [];
  if (n >= 100) p.push(HUND[Math.floor(n / 100)]);
  n %= 100;
  if (n >= 20) { p.push(TENS[Math.floor(n / 10)]); if (n % 10) p.push(ONES[n % 10]); } else if (n > 0) p.push(ONES[n]);
  return p.join(' و ');
}
export function words(n: number) {
  n = Math.round(n);
  if (n === 0) return 'صفر';
  let s = String(Math.abs(n));
  const g: number[] = [];
  while (s.length) { g.unshift(+s.slice(-3)); s = s.slice(0, -3); }
  const p: string[] = [];
  g.forEach((v, i) => { if (v) p.push(w3(v) + (SCALE[g.length - 1 - i] ? ' ' + SCALE[g.length - 1 - i] : '')); });
  return (n < 0 ? 'منفی ' : '') + p.join(' و ');
}

function rowType(r: Row, ibn: string, S: Cfg) {
  const a = toNum(r.m);
  if (bankOf(ibn) === '18') return T.tejarat;
  if (S.div) return T.ach;
  if ((S.min && a > S.limR) || a > S.limD) return T.rtgs;
  return T.ach;
}
function checkRow(rows: Row[], ibns: string[], i: number, S: Cfg, accs: Acc[]) {
  const r = rows[i], ibn = ibns[i], name = r.n, amt = toNum(r.m), pid = D(r.p);
  if (ibn.length !== 24) return tr(ibn) + '!';
  const bank = BANKS[+bankOf(ibn)] || '';
  if (hasPunct(name)) return tr('NoPunctuation') + '!';
  if (bankOf(ibn) !== '18' && name.length < 6) return tr('ShortName') + '!';
  if (!Number.isInteger(amt)) return tr('NoFloat') + '!';
  if (amt < 1) return tr('WillNotExport');
  if (pid.length > 30) return tr('MaxPayID') + '!';
  const rt = bankOf(ibn) !== '18' && S.div && amt > S.limD;
  if (pid.length > 0 && rt) return tr('CantDivid') + '!';
  const saved = accs.find((x) => x.iban === 'IR' + ibn);
  if (saved && saved.name && saved.name !== name) return tr('DiffrentWithLast', saved.name);
  for (let j = 0; j < rows.length; j++) if (j !== i && ibns[j] === ibn && rows[j].n && rows[j].n !== name) return tr('DupDiffrentName') + rows[j].n + '!';
  let out = `${bank} IR${ibn} ${name}`;
  if (rt) out += ' ' + tr('WillDivid', Math.ceil(amt / S.limD));
  return out;
}
function derive(rows: Row[], S: Cfg, accs: Acc[]): Info[] {
  const ibns = rows.map((r) => acc2iban(r.a));
  return rows.map((r, i) => ({ i: ibns[i], c: checkRow(rows, ibns, i, S, accs), t: rowType(r, ibns[i], S) }));
}

const CRLF = '\r\n';
const line = (ibn: string, amt: number, name: string, pid: string) =>
  'IR' + ibn + ';' + pad(String(amt), 13, '0') + ';0000000000000;' + pad(name, 30, ' ') + ';' + pad(D(pid), 30, ' ');
function writeRec(ibn: string, amt: number, name: string, pid: string, S: Cfg) {
  if (!S.ign) {
    if (!S.div && amt > S.limD) return '';
    if (S.min && amt >= S.limR) return '';
    if (S.sep && bankOf(ibn) === '18') return '';
  }
  let o = '';
  if (bankOf(ibn) !== '18') while (amt > S.limD) { o += line(ibn, S.limD, name, pid) + CRLF; amt -= S.limD; }
  if (amt > 0) o += line(ibn, amt, name, pid) + CRLF;
  return o;
}
function download(name: string, text: string, bom: boolean) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([(bom ? '\uFEFF' : '') + text], { type: 'text/plain;charset=utf-8' }));
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* ================= import helpers ================= */
function parseAch(txt: string, out: Row[]) {
  const L = txt.replace(/^\uFEFF/, '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  let n = 0;
  if (L.some((l) => l.includes(';'))) { // فایل پایا / ساتنا
    for (let i = 1; i < L.length; i++) {
      const p = L[i].split(';');
      if (p.length >= 4) { out.push({ a: p[0].trim(), m: String(Number(p[1]) || 0), p: Number(p[4]) > 0 ? p[4].trim() : '', n: p[3].trim() }); n++; }
    }
    return n;
  }
  for (const l of L) { // فایل تجارت (trans.dat / trans-payid.dat)
    if (l.length === 32 && l.endsWith('050105')) continue; // سطر هدر
    if (l.length < 32) continue;
    const rest = l.slice(26);
    out.push({ a: l.slice(0, 13), n: '', m: String(Number(l.slice(13, 26)) || 0), p: rest === '050101' ? '' : rest.replace(/^0+/, '') });
    n++;
  }
  return n;
}
function parseSheet(A: unknown[][], out: Row[]) {
  const pats: Record<keyof Row, RegExp> = { a: /شبا|حساب|iban|account|sheba/i, n: /نام|name/i, m: /مبلغ|amount|ریال/i, p: /شناسه|واریز|pay|id/i };
  let map: Partial<Record<keyof Row, number>> | null = null, start = 0;
  for (let i = 0; i < Math.min(A.length, 15) && !map; i++) {
    const m: Partial<Record<keyof Row, number>> = {}, used = new Set<number>();
    (['a', 'n', 'm', 'p'] as const).forEach((k) => A[i].forEach((c, j) => { if (m[k] === undefined && !used.has(j) && typeof c === 'string' && pats[k].test(c)) { m[k] = j; used.add(j); } }));
    if (m.a !== undefined && Object.keys(m).length >= 2) { map = m; start = i + 1; }
  }
  if (!map) { map = { a: 0, n: 1, m: 2, p: 3 }; if (A[0] && isNaN(toNum(A[0][2]))) start = 1; }
  let n = 0;
  for (let i = start; i < A.length; i++) {
    const g = (k: keyof Row) => (map![k] === undefined ? '' : String(A[i][map![k]!] ?? '').trim());
    const r = { a: g('a'), n: g('n'), m: g('m').replace(/[,٬\s]/g, ''), p: g('p') };
    if (!r.a && !r.m) continue;
    out.push(r); n++;
  }
  return n;
}

/* ================= storage ================= */
const KEY = 'sheba_accounts';
const loadAcc = (): Acc[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const saveAcc = (a: Acc[]) => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* ignore */ } };

const blank = (): Row => ({ a: '', n: '', m: '', p: '' });
const DEF: Cfg = { div: true, min: false, sep: true, save: false, ign: false, bom: true, limD: 2e9, limR: 1e9 };

/* ================= component ================= */
export default function Batch() {
  const [rows, setRows] = useState<Row[]>([blank(), blank(), blank()]);
  const [S, setS] = useState<Cfg>(DEF);
  const [accs, setAccs] = useState<Acc[]>(loadAcc);
  const [logs, setLogs] = useState<Log[]>([]);
  const [hint, setHint] = useState('');
  const [dlg, setDlg] = useState(false);

  const info = useMemo(() => derive(rows, S, accs), [rows, S, accs]);
  const sum = useMemo(() => rows.reduce((s, r) => s + (toNum(r.m) || 0), 0), [rows]);
  const log = (t: string, c = '') => setLogs((l) => [{ t, c }, ...l]);
  const updAccs = (a: Acc[]) => { setAccs(a); saveAcc(a); };

  function setCell(i: number, k: keyof Row, v: string) { setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r))); }

  function onPaste(e: ClipboardEvent<HTMLTableSectionElement>) {
    const t = e.clipboardData.getData('text');
    if (!/[\t\n]/.test(t.trim())) return;
    const el = e.target as HTMLInputElement;
    if (!el.dataset.k) return;
    e.preventDefault();
    const ks: (keyof Row)[] = ['a', 'n', 'm', 'p'];
    const i0 = +el.dataset.i!, c0 = Math.max(0, ks.indexOf(el.dataset.k as keyof Row));
    const next = rows.map((r) => ({ ...r }));
    t.replace(/\r/g, '').replace(/\n+$/, '').split('\n').forEach((ln, di) => {
      while (next.length <= i0 + di) next.push(blank());
      ln.split('\t').forEach((v, dj) => { if (c0 + dj < 4) next[i0 + di][ks[c0 + dj]] = v.trim(); });
    });
    setRows(next);
  }

  function change(k: keyof Cfg, v: boolean | number, mode?: 'div' | 'rtgs') {
    let n: Cfg = { ...S, [k]: v } as Cfg, m = '';
    if (mode === 'div') { n = { ...S, div: true, min: false }; m = tr('NoRTGS'); }
    else if (mode === 'rtgs') { n = { ...S, div: false }; m = tr('RTGSInclude'); }
    else if (k === 'min') {
      if (S.div) { n = S; m = tr('selectedNoRTGS'); } else m = tr(v ? 'minRTGS' : 'maxRTGS');
    }
    else if (k === 'sep') m = tr(v ? 'SepTrans' : 'TransInclude');
    else if (k === 'save') m = tr(v ? 'NamesWillSave' : 'NoSaveNames');
    else if (k === 'ign') m = tr(v ? 'IgnoErr' : 'IncErr');
    setS(n);
    if (m) setHint(m);
  }

  function validate(show: boolean) {
    let tej = 0, ach = 0, rt = 0;
    for (let k = 0; k < rows.length; k++) {
      const x = info[k];
      if (x.c.includes('!')) { if (show) log(tr('FixErrorsFirst', x.c), 'bad'); return 1; }
      if (x.t === T.tejarat) tej++; else if (x.t === T.ach) ach += Math.ceil(toNum(rows[k].m) / S.limD); else rt++;
    }
    if (show) {
      if (tej > 0 && tej < 10) log(tr('CountTejLess'), 'bad');
      if (ach > 0 && ach < 11) log(tr('CountACHLess'), 'bad');
      if (rt > 0 && rt < 11) log(tr('CountRTGSLess'), 'bad');
      if (!rt && !ach && !tej) { log(tr('NothingToExport'), 'bad'); return 1; }
    }
    let v = 1;
    if (tej > 0) v *= 2; if (ach > 0) v *= 3; if (rt > 0) v *= 5;
    if (show && v > 1) log('بررسی بدون خطا انجام شد.', 'ok');
    return v;
  }

  function makeFile(match: Kind) {
    let c = '', cv = '', total = 0, n = 0;
    rows.forEach((r, k) => {
      const amt = toNum(r.m), ibn = info[k].i;
      if (!(match === 'ach' || info[k].t === T[match])) return;
      if (!(amt > 0)) return; // مبلغ صفر وارد خروجی نمی‌شود
      if (match === 'rtgs') { c += line(ibn, amt, r.n, r.p) + CRLF; total += amt; n++; }
      else if (match === 'tejarat') {
        const p = D(r.p);
        if (p.length) cv += ibn.slice(-13) + pad(String(amt), 13, '0') + pad(p, 17, '0') + CRLF;
        else c += ibn.slice(-13) + pad(String(amt), 13, '0') + '050101' + CRLF;
        total += amt; n++;
      } else { const o = writeRec(ibn, amt, r.n, r.p, S); if (o) { c += o; total += amt; n++; } }
    });
    c = (match === 'tejarat' ? pad(String(total), 26, '0') + '050105' : pad(String(total), 34, '0') + '040404') + CRLF + c;
    log(tr('TotalAmount' + match) + ': ' + fmt(total) + ' ریال — ' + words(total), 'ok');
    log(tr('RecordsCount' + match) + ': ' + fmt(n), 'ok');
    download({ ach: 'ach.txt', rtgs: 'rtgs.txt', tejarat: 'trans.dat' }[match], c, S.bom);
    if (cv.length) setTimeout(() => download('trans-payid.dat', cv, S.bom), 400);
  }

  function exportAll() {
    if (!rows.length) return log(tr('NothingToExport'), 'bad');
    if (S.ign) makeFile('ach');
    else {
      const v = validate(true);
      if (v === 1) return;
      if (v % 3 === 0) makeFile('ach');
      if (!S.div && v % 5 === 0) setTimeout(() => makeFile('rtgs'), 200);
      if (v % 2 === 0 && (S.sep || v % 3 !== 0)) setTimeout(() => makeFile('tejarat'), 600);
    }
    if (S.save) {
      const a = [...accs];
      rows.forEach((r, k) => { const i = info[k].i; if (i.length === 24 && !a.some((x) => x.iban === 'IR' + i)) a.push({ iban: 'IR' + i, name: r.n }); });
      updAccs(a);
    }
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const fs = Array.from(e.target.files ?? []);
    e.target.value = '';
    const out: Row[] = [];
    for (const f of fs) {
      const ext = f.name.split('.').pop()!.toLowerCase();
      try {
        let n = 0;
        if (ext === 'txt' || ext === 'dat') n = parseAch(await f.text(), out);
        else {
          const wb = ext === 'csv' || ext === 'tsv' ? XLSX.read(await f.text(), { type: 'string' }) : XLSX.read(await f.arrayBuffer(), { type: 'array' });
          n = parseSheet(XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' }), out);
        }
        log(`${f.name}: ${n} رکورد به انتهای لیست اضافه شد`, 'ok');
      } catch (err) { log(f.name + ': خواندن فایل با خطا مواجه شد: ' + (err as Error).message, 'bad'); }
    }
    setRows((rs) => [...rs.filter((r) => r.a || r.m || r.n), ...out]);
  }

  function saveXlsx() {
    const A: (string | number)[][] = [['ردیف', 'شماره شبا/حساب', 'نام و نام خانوادگی', 'مبلغ(ریال)', 'شناسه واریز', 'بررسی', 'نوع']];
    rows.forEach((r, i) => A.push([i + 1, r.a, r.n, toNum(r.m) || 0, r.p, info[i].c, info[i].t]));
    const wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(A);
    ws['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 26 }, { wch: 16 }, { wch: 20 }, { wch: 60 }, { wch: 8 }];
    XLSX.utils.book_append_sheet(wb, ws, 'لیست');
    XLSX.writeFile(wb, 'batch-list.xlsx');
  }

  return (
    <div className="bt" dir="rtl" lang="fa">
      <style>{CSS}</style>
      <header>
        <h1>ابزار حواله گروهی – پایا، ساتنا، تجارت</h1>
        <div className="sum"><b>{fmt(sum)}</b> ریال<small>{sum ? words(sum) + ' ریال' : ''}</small></div>
      </header>

      <div className="card bar">
        <button className="pri" onClick={exportAll}>ایجاد خروجی</button>
        <button onClick={() => (rows.length ? validate(true) : log(tr('NothingToExport'), 'bad'))}>بررسی</button>
        <label className="btn">خواندن از فایل (اکسل / CSV / ach.txt / trans.dat)
          <input type="file" hidden accept=".xlsx,.xlsm,.xlsb,.xls,.ods,.csv,.tsv,.txt,.dat" multiple onChange={onFile} />
        </label>
        <button onClick={() => setRows((r) => [...r, blank()])}>+ ردیف</button>
        <button onClick={saveXlsx}>ذخیره لیست به اکسل</button>
        <button onClick={() => setDlg(true)}>حساب‌های ذخیره‌شده ({accs.length})</button>
        <button onClick={() => confirm('کل لیست پاک شود؟') && setRows([])}>پاک کردن لیست</button>
      </div>

      <details className="card" open>
        <summary>تنظیمات</summary>
        <div className="set">
          <label><input type="radio" name="mode" checked={S.div} onChange={() => change('div', true, 'div')} /><span>به چندین حواله پایا تقسیم شود</span></label>
          <label><input type="radio" name="mode" checked={!S.div} onChange={() => change('div', false, 'rtgs')} /><span>فایل ساتنا گروهی ایجاد شود (رکوردهای بیشتر از سقف پایا)</span></label>
          <label><input type="checkbox" checked={S.min} onChange={(e) => change('min', e.target.checked)} /><span>مبالغ بین سقف ساتنا تا سقف پایا در فایل ساتنا ایجاد شوند</span></label>
          <label><input type="checkbox" checked={S.sep} onChange={(e) => change('sep', e.target.checked)} /><span>حساب‌های تجارت مجزا خروجی گرفته شود</span></label>
          <label><input type="checkbox" checked={S.save} onChange={(e) => change('save', e.target.checked)} /><span>حساب‌ها برای بررسی‌های آینده ذخیره شوند</span></label>
          <label><input type="checkbox" checked={S.ign} onChange={(e) => change('ign', e.target.checked)} /><span>از خطاها صرف‌نظر کن و در هر حال خروجی را ایجاد کن</span></label>
          <label><input type="checkbox" checked={S.bom} onChange={(e) => change('bom', e.target.checked)} /><span>افزودن BOM به فایل‌ها (مطابق خروجی نسخه اکسل)</span></label>
          <div className="lim">
            <span>سقف پایا:</span><input type="number" value={S.limD} onChange={(e) => change('limD', +e.target.value || 2e9)} />
            <span>حداقل ساتنا:</span><input type="number" value={S.limR} onChange={(e) => change('limR', +e.target.value || 1e9)} />
          </div>
        </div>
        <p className="hint">{hint}</p>
      </details>

      <div className="card tw">
        <table>
          <thead><tr><th>ردیف</th><th>شماره شبا/حساب</th><th>نام و نام خانوادگی</th><th>مبلغ (ریال)</th><th>شناسه واریز</th><th>بررسی</th><th>نوع</th><th /></tr></thead>
          <tbody onPaste={onPaste}>
            {rows.map((r, i) => (
              <tr key={i} className={info[i]?.c.includes('!') ? 'bad' : ''}>
                <td className="c">{i + 1}</td>
                <td><input data-i={i} data-k="a" dir="ltr" value={r.a} onChange={(e) => setCell(i, 'a', e.target.value)} /></td>
                <td><input data-i={i} data-k="n" value={r.n} onChange={(e) => setCell(i, 'n', e.target.value)} /></td>
                <td><input data-i={i} data-k="m" dir="ltr" inputMode="numeric" value={r.m} onChange={(e) => setCell(i, 'm', e.target.value)} /></td>
                <td><input data-i={i} data-k="p" dir="ltr" value={r.p} onChange={(e) => setCell(i, 'p', e.target.value)} /></td>
                <td className="chk">{info[i]?.c}</td>
                <td className="ty">{info[i]?.t}</td>
                <td><button className="x" title="حذف ردیف" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="hint">می‌توانید چند سطر را مستقیم از اکسل کپی و در جدول Paste کنید. فرمت حساب: شبا ۲۴ رقمی، شماره حساب تجارت (۸ تا ۱۳ رقم)، <bdi>19/105259548004</bdi> (کدبانک/شماره‌حساب) یا <bdi>330190*221138691005</bdi> برای جایگزینی صفرها.</p>
      </div>

      <div className="card"><ul className="log">{logs.map((l, i) => <li key={i} className={l.c}>{l.t}</li>)}</ul></div>

      {dlg && (
        <div className="ov" onClick={() => setDlg(false)}>
          <div className="dlg card" onClick={(e) => e.stopPropagation()}>
            <h3>حساب‌های ذخیره‌شده</h3>
            <div className="tw" style={{ maxHeight: '55vh' }}>
              <table style={{ minWidth: 520 }}>
                <thead><tr><th>شبا</th><th>نام</th><th /></tr></thead>
                <tbody>
                  {accs.length === 0 && <tr><td colSpan={3} className="hint">خالی است</td></tr>}
                  {accs.map((x, i) => (
                    <tr key={x.iban}>
                      <td dir="ltr">{x.iban}</td>
                      <td><input value={x.name} onChange={(e) => updAccs(accs.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))} /></td>
                      <td><button className="x" onClick={() => updAccs(accs.filter((_, j) => j !== i))}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="hint">این لیست فقط در همین مرورگر ذخیره می‌شود و برای هشدار «شبا قبلاً با نام دیگری ثبت شده» استفاده می‌شود.</p>
            <div className="bar">
              <button className="pri" onClick={() => setDlg(false)}>بستن</button>
              <button onClick={() => confirm('همه حساب‌های ذخیره‌شده حذف شود؟') && updAccs([])}>حذف همه</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= styles (scoped to .bt) ================= */
const CSS = `
.bt{--bg:#eef3f9;--card:#fbfdff;--ink:#14233a;--mut:#5f6f86;--line:#d3dce9;--ac:#1f5fbf;--acx:#fff;--bad:#b3261e;--badbg:#fbe4e1;--ok:#17653f;
 background:var(--bg);color:var(--ink);font:400 14px/1.7 Vazirmatn,Tahoma,sans-serif;padding:16px;min-height:100vh}
@media(prefers-color-scheme:dark){.bt{--bg:#0f1724;--card:#172236;--ink:#e6edf7;--mut:#8fa0b8;--line:#2a3a55;--ac:#6aa8ff;--acx:#0b1526;--bad:#ff8a80;--badbg:#3a1f1c;--ok:#7fd8a6}}
.bt *{box-sizing:border-box}
.bt>header,.bt>.card,.bt>details{max-width:1200px;margin-inline:auto}
.bt header{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:end;gap:12px;margin-bottom:14px}
.bt h1{margin:0;font-size:22px;font-weight:800}
.bt .sum{text-align:left}.bt .sum b{font-size:22px;font-weight:800;color:var(--ac)}.bt .sum small{display:block;color:var(--mut);max-width:420px}
.bt .card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px;margin-bottom:12px}
.bt .bar{display:flex;flex-wrap:wrap;gap:8px}
.bt button,.bt .btn{font:inherit;border:1px solid var(--line);background:var(--card);color:var(--ink);padding:6px 14px;border-radius:8px;cursor:pointer}
.bt button:hover,.bt .btn:hover{border-color:var(--ac)}
.bt .pri{background:var(--ac);color:var(--acx);border-color:var(--ac);font-weight:600}
.bt .set{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:6px 18px;margin-top:8px}
.bt .set label{display:flex;gap:8px;align-items:start}
.bt .lim{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.bt .lim input{width:150px;font:inherit;color:inherit;background:var(--card);border:1px solid var(--line);border-radius:6px;padding:2px 6px}
.bt summary{cursor:pointer;font-weight:600}
.bt .tw{overflow-x:auto}
.bt table{border-collapse:collapse;width:100%;min-width:900px}
.bt th{text-align:right;font-weight:600;color:var(--mut);border-bottom:2px solid var(--line);padding:6px 4px}
.bt td{border-bottom:1px solid var(--line);padding:2px 3px;vertical-align:middle}
.bt td input{width:100%;font:inherit;color:inherit;background:transparent;border:1px solid transparent;border-radius:6px;padding:3px 6px}
.bt td input:focus{border-color:var(--ac);outline:none;background:var(--card)}
.bt .c{color:var(--mut);width:36px;text-align:center}.bt .chk{font-size:12px;min-width:260px}.bt .ty{white-space:nowrap;font-weight:600}
.bt tr.bad .chk{color:var(--bad);background:var(--badbg);font-weight:600}
.bt .x{border:0;color:var(--mut);padding:0 8px;font-size:18px;background:transparent}
.bt .log{list-style:none;margin:0;padding:0}.bt .log li{padding:3px 0;border-bottom:1px dashed var(--line)}.bt .log .bad{color:var(--bad)}.bt .log .ok{color:var(--ok)}
.bt .hint{color:var(--mut);font-size:12px;margin:6px 0 0}
.bt .ov{position:fixed;inset:0;background:rgba(0,0,0,.45);display:grid;place-items:center;z-index:50}
.bt .dlg{width:min(760px,95vw);margin:0}
`;
