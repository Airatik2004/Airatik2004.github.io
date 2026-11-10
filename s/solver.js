/* Sudoku solver of the game Sudoky — generated from Sudoku.java by j2js.py (do not edit by hand). */
(function () {
'use strict';
function bitCount(x) { x = x - ((x >>> 1) & 0x55555555); x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24; }
function ntz(x) { if (x === 0) return 32; let n = 0; while (!(x & 1)) { x >>>= 1; n++; } return n; }
const Integer = { bitCount: bitCount, numberOfTrailingZeros: ntz, MAX_VALUE: 2147483647, MIN_VALUE: -2147483648,
  parseInt: function (s) { return parseInt(s, 10); }, valueOf: function (x) { return x; } };
const Long = { bitCount: function (x) { let n = 0; while (x > 0) { if (x % 2 === 1) n++; x = Math.floor(x / 2); } return n; } };
const System = { currentTimeMillis: function () { return Date.now(); }, arraycopy: function (a, i, b, j, n) { for (let k = 0; k < n; k++) b[j + k] = a[i + k]; } };
function newArr(n, v) { return new Array(n).fill(v); }
function newArr2(a, b, v) { const r = new Array(a); for (let i = 0; i < a; i++) r[i] = new Array(b).fill(v); return r; }
const Arrays = {
  fill: function (a, v) { a.fill(v); },
  sort: function (a, from, to) { if (from === undefined) { a.sort(function (x, y) { return x - y; }); return; }
    const s = a.slice(from, to).sort(function (x, y) { return x - y; }); for (let i = from; i < to; i++) a[i] = s[i - from]; },
  copyOf: function (a, n) { const r = a.slice(0, n); while (r.length < n) r.push(0); return r; },
  equals: function (a, b) { if (a === b) return true; if (!a || !b || a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }
};
class ArrayList {
  constructor(src) { this.a = src ? (src.a ? src.a.slice() : Array.from(src)) : []; }
  add(i, x) { if (x === undefined) { this.a.push(i); return true; } this.a.splice(i, 0, x); }
  get(i) { return this.a[i]; }
  set(i, x) { const o = this.a[i]; this.a[i] = x; return o; }
  size() { return this.a.length; }
  isEmpty() { return this.a.length === 0; }
  remove(i) { return this.a.splice(i, 1)[0]; }
  clear() { this.a.length = 0; }
  contains(x) { return this.a.indexOf(x) >= 0; }
  indexOf(x) { return this.a.indexOf(x); }
  addAll(o) { for (const x of o) this.a.push(x); return true; }
  toArray() { return this.a.slice(); }
  [Symbol.iterator]() { return this.a[Symbol.iterator](); }
}
class LinkedHashSet {
  constructor() { this.s = new Set(); }
  add(x) { if (this.s.has(x)) return false; this.s.add(x); return true; }
  contains(x) { return this.s.has(x); }
  size() { return this.s.size; }
  isEmpty() { return this.s.size === 0; }
  equals(o) { if (this.s.size !== o.s.size) return false; for (const x of this.s) if (!o.s.has(x)) return false; return true; }
  [Symbol.iterator]() { return this.s[Symbol.iterator](); }
}
const HashSet = LinkedHashSet;
class ArrayDeque {
  constructor() { this.a = []; this.h = 0; }
  add(x) { this.a.push(x); return true; }
  offer(x) { this.a.push(x); return true; }
  poll() { return this.h < this.a.length ? this.a[this.h++] : null; }
  isEmpty() { return this.h >= this.a.length; }
  size() { return this.a.length - this.h; }
}
class ThreadLocal { constructor() { this.v = null; } get() { return this.v; } set(x) { this.v = x; } }
const MAXINT = 2147483647;
let LEVEL_NAMES = ["Новичок", "Лёгкий", "Средний", "Сложный", "Эксперт", "Мастер", "Гроссмейстер", "Для Димы"];
let LEVELS = 7;
let TRAP_LEVEL = 7;
let UNITS = newArr2(27, 9, 0);
let PEERS = newArr2(81, 20, 0);
let CELL_UNITS = newArr2(81, 3, 0);
{
for (let i = 0;
 i < 9;
 i++) {
 for (let j = 0;
 j < 9;
 j++) {
 UNITS[i][j] = i * 9 + j;
 UNITS[9 + i][j] = j * 9 + i;
 let br = (Math.trunc(i / 3)) * 3, bc = (i % 3) * 3;
 UNITS[18 + i][j] = (br + Math.trunc(j / 3)) * 9 + bc + j % 3;
 }
 }
 for (let c = 0;
 c < 81;
 c++) {
 let r = Math.trunc(c / 9), col = c % 9, b = (Math.trunc(r / 3)) * 3 + Math.trunc(col / 3);
 CELL_UNITS[c][0] = r;
 CELL_UNITS[c][1] = 9 + col;
 CELL_UNITS[c][2] = 18 + b;
 let n = 0;
 for (let o = 0;
 o < 81;
 o++) {
 if (o == c)continue;
 let r2 = Math.trunc(o / 9), c2 = o % 9, b2 = (Math.trunc(r2 / 3)) * 3 + Math.trunc(c2 / 3);
 if (r2 == r || c2 == col || b2 == b)PEERS[c][n++] = o;
 }
 }

}
function isPeer(a, b) {
if (a == b)return false;
 let ra = Math.trunc(a / 9), ca = a % 9, rb = Math.trunc(b / 9), cb = b % 9;
 return ra == rb || ca == cb || ((Math.trunc(ra / 3)) == (Math.trunc(rb / 3)) && (Math.trunc(ca / 3)) == (Math.trunc(cb / 3)));

}
function countSolutions(grid, limit, out) {
let g = grid.slice();
 let rows = newArr(9, 0), cols = newArr(9, 0), boxes = newArr(9, 0);
 for (let c = 0;
 c < 81;
 c++) {
 let v = g[c];
 if (v != 0) {
 let bit = 1 << v, r = Math.trunc(c / 9), col = c % 9, b = (Math.trunc(r / 3)) * 3 + Math.trunc(col / 3);
 if ((rows[r] & bit) != 0 || (cols[col] & bit) != 0 || (boxes[b] & bit) != 0)return 0;
 rows[r] |= bit;
 cols[col] |= bit;
 boxes[b] |= bit;
 }
 }
 let cnt = [0];
 solve(g, rows, cols, boxes, limit, cnt, out, null);
 return cnt[0];

}
function solve(g, rows, cols, boxes, limit, cnt, out, rnd) {
let best = - 1, bestMask = 0, bestCount = 10;
 for (let c = 0;
 c < 81;
 c++) {
 if (g[c] != 0)continue;
 let r = Math.trunc(c / 9), col = c % 9, b = (Math.trunc(r / 3)) * 3 + Math.trunc(col / 3);
 let mask = ~(rows[r] | cols[col] | boxes[b]) & 0x3FE;
 let n = Integer.bitCount(mask);
 if (n < bestCount) {
 best = c;
 bestMask = mask;
 bestCount = n;
 if (n <= 1)break;
 }
 }
 if (best == - 1) {
 if (cnt[0] == 0 && out != null)System.arraycopy(g, 0, out, 0, 81);
 cnt[0]++;
 return cnt[0] >= limit;
 }
 if (bestCount == 0)return false;
 let r = Math.trunc(best / 9), col = best % 9, b = (Math.trunc(r / 3)) * 3 + Math.trunc(col / 3);
 let digits = newArr(9, 0);
 let nd = 0;
 for (let d = 1;
 d <= 9;
 d++)if ((bestMask & (1 << d)) != 0)digits[nd++] = d;
 if (rnd != null) {
 for (let i = nd - 1;
 i > 0;
 i--) {
 let j = rnd.nextInt(i + 1);
 let t = digits[i];
 digits[i] = digits[j];
 digits[j] = t;
 }
 }
 for (let i = 0;
 i < nd;
 i++) {
 let d = digits[i], bit = 1 << d;
 g[best] = d;
 rows[r] |= bit;
 cols[col] |= bit;
 boxes[b] |= bit;
 if (solve(g, rows, cols, boxes, limit, cnt, out, rnd))return true;
 g[best] = 0;
 rows[r] &= ~bit;
 cols[col] &= ~bit;
 boxes[b] &= ~bit;
 }
 return false;

}
let T_HIDDEN = 1, T_NAKED = 2, T_MEDIUM = 3, T_HARD = 4, T_EXPERT = 5, T_MASTER = 6, T_HARDER = 7, T_INVALID = 8;
let W_XWING = 1, W_SKYSCRAPER = 2, W_SWORDFISH = 3, W_XYWING = 4, W_XYZWING = 5, W_WWING = 6, W_EMPTYRECT = 7, W_UNIQUERECT = 8, W_XCHAIN = 9, W_MWING = 10, W_SWING = 11, W_XYCHAIN = 12, W_FINNED = 13, W_BUG = 14, W_LOCKED = 15, W_PAIRS = 16, W_TRIPLES = 17, W_HIDDEN = 18, W_NAKED = 19, W_KITE = 20, W_FINNEDSWORD = 21, W_RING = 22, W_AIC = 23, W_DLOCKED = 29, W_DPAIR = 30, W_DTRIPLE = 31, W_NQUAD = 32, W_JELLYFISH = 33, W_HQUAD = 34, W_UL1 = 35, W_UL2 = 36, W_UL3 = 37, W_UL4 = 38, W_BUG2 = 39, W_BUG3 = 40, W_BUG4 = 41, W_APE = 42, W_ATE = 43, W_NISHIO = 44, W_CELLFC = 45, W_REGIONFC = 46;
function urBit(type) {
return 24 + type;

}
let TIER_OF = [0, T_MEDIUM, T_EXPERT, T_MEDIUM, T_HARD, T_HARD, T_MASTER, T_EXPERT, T_HARD, T_EXPERT, T_MASTER, T_MASTER, T_MASTER, T_EXPERT, T_EXPERT, T_NAKED, T_MEDIUM, T_MEDIUM, T_HIDDEN, T_NAKED, T_EXPERT, T_EXPERT, T_MASTER, T_MASTER, 0, 0, 0, 0, 0, T_NAKED, T_NAKED, T_NAKED, T_EXPERT, T_EXPERT, T_EXPERT, T_HARD, T_HARD, T_HARD, T_HARD, T_EXPERT, T_EXPERT, T_EXPERT, T_EXPERT, T_MASTER, T_MASTER, T_MASTER, T_MASTER];
class Step {
constructor() {
this.code = 0;
this.se = 0;
this.ur = 0;
}
}
function found(st, code, se) {
st.code = code;
 st.se = se;
 st.ur = 0;
 return true;

}
function chainSe(loop, mixed, nodes) {
return (mixed ? 70 : loop ? 65 : 66) + lengthBonus(nodes);

}
function lengthBonus(nodes) {
let added = 0, ceil = 4;
 let odd = false;
 while (nodes > ceil) {
 added++;
 ceil = odd ? Math.trunc(ceil * 4 / 3) : Math.trunc(ceil * 3 / 2);
 odd = !odd;
 }
 return added;

}
function step$4(val, cand, chains, st) {
return step$6(val, cand, chains, st, 0, ATOMS);

}
function step$6(val, cand, chains, st, from, to) {
let off = OFF.get();
 let mask = off == null ? 0 : off;
 for (let pos = from;
 pos < to;
 pos++) {
 let a = ORDER[pos];
 if ((mask & (1 << ATOM_CODE[a])) != 0)continue;
 let code = ATOM_CODE[a];
 let grouped = code == W_EMPTYRECT || code == W_FINNED || code == W_FINNEDSWORD;
 let b4 = grouped ? cand.slice() : null;
 let se = atom(val, cand, a);
 if (se > 0 && grouped)se = Math.max(se, seEquiv(val, b4, cand));
 if (se > 0) {
 found(st, code, se);
 st.ur = ATOM_UR[a];
 return true;
 }
 }
 if (!chains || to != ATOMS)return false;
 if ((mask & ((1 << W_RING) | (1 << W_AIC))) != ((1 << W_RING) | (1 << W_AIC)) && altChain(val, cand, st))return true;
 for (let a of POST) {
 if (a == A_MULTI ? (mask & ((1 << W_CELLFC) | (1 << W_REGIONFC))) == ((1 << W_CELLFC) | (1 << W_REGIONFC)) : (mask & (1 << ATOM_CODE[a])) != 0)continue;
 let se = atom(val, cand, a);
 if (se > 0) {
 let region = se >= REGION;
 found(st, region ? W_REGIONFC : ATOM_CODE[a], region ? se - REGION : se);
 return true;
 }
 }
 return false;

}
let A_ATE = 40, A_NISHIO = 41, A_MULTI = 42, A_REGION = 43;
let POST = [A_ATE, A_NISHIO, A_MULTI];
let REGION = 1000;
let OFF = new ThreadLocal();
let STOP = new ThreadLocal();
let BEFORE_NAKED = 2;
let ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 32, 33, 34, 35, 16, 17, 18, 19, 36, 37, 38, 39, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
let ATOMS = ORDER.length;
let POS = newArr(44, 0);
{
Arrays.fill(POS, ATOMS);
 for (let i = 0;
 i < ORDER.length;
 i++)POS[ORDER[i]] = i;

}
let A_RING = 30, A_AIC = 31;
let ATOM_CODE = [W_DLOCKED, W_DPAIR, W_DTRIPLE, W_LOCKED, W_PAIRS, W_XWING, W_PAIRS, W_TRIPLES, W_SWORDFISH, W_TRIPLES, W_XYWING, W_XYZWING, W_UNIQUERECT, W_UNIQUERECT, W_UNIQUERECT, W_UNIQUERECT, W_NQUAD, W_JELLYFISH, W_HQUAD, W_BUG, W_SKYSCRAPER, W_KITE, W_EMPTYRECT, W_FINNED, W_FINNEDSWORD, W_XCHAIN, W_WWING, W_MWING, W_SWING, W_XYCHAIN, W_RING, W_AIC, W_UL1, W_UL2, W_UL4, W_UL3, W_BUG2, W_BUG4, W_BUG3, W_APE, W_ATE, W_NISHIO, W_CELLFC, W_REGIONFC];
let ATOM_UR = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
function atom(val, cand, a) {
let v;
 switch(a) {
 case 0 : return directLocked(cand);
 case 1 : return directHidden(val, cand, 2) ? 20 : 0;
 case 2 : return directHidden(val, cand, 3) ? 25 : 0;
 case 3 : return locked(cand);
 case 4 : return subsetsPass(val, cand, 2, false) ? 30 : 0;
 case 5 : return fish(val, cand, 2) ? 32 : 0;
 case 6 : return subsetsPass(val, cand, 2, true) ? 34 : 0;
 case 7 : return subsetsPass(val, cand, 3, false) ? 36 : 0;
 case 8 : return fish(val, cand, 3) ? 38 : 0;
 case 9 : return subsetsPass(val, cand, 3, true) ? 40 : 0;
 case 10 : return xyWing(val, cand) ? 42 : 0;
 case 11 : return xyzWing(val, cand) ? 44 : 0;
 case 12 : return uniqueRectangle(val, cand) ? 45 : 0;
 case 13 : return urType(val, cand, 4);
 case 14 : return urType(val, cand, 2);
 case 15 : return urType(val, cand, 3);
 case 16 : return quads(val, cand, false) ? 50 : 0;
 case 17 : return jellyfish(val, cand) ? 52 : 0;
 case 18 : return quads(val, cand, true) ? 54 : 0;
 case 19 : return bugPlusOne(val, cand) ? 56 : 0;
 case 20 : return skyscraper(val, cand) ? chainSe(false, false, 4) : 0;
 case 21 : return kite(val, cand) ? chainSe(false, false, 4) : 0;
 case 22 : return emptyRectangle(val, cand) ? chainSe(false, false, 6) : 0;
 case 23 : return finnedFish(val, cand, 2) ? chainSe(false, false, 6) : 0;
 case 24 : return finnedFish(val, cand, 3) ? chainSe(false, false, 8) : 0;
 case 25 : return (v = xChain(val, cand)) > 0 ? chainSe(false, false, v + 1) : 0;
 case 26 : return wWing(val, cand) ? chainSe(false, true, 6) : 0;
 case 27 : return wing3(val, cand, 1) ? chainSe(false, true, 6) : 0;
 case 28 : return wing3(val, cand, 2) ? chainSe(false, true, 6) : 0;
 case 29 : return (v = xyChain(val, cand)) > 0 ? chainSe(false, false, 2 * v) : 0;
 case 32 : return uniqueLoop(val, cand, 1);
 case 33 : return uniqueLoop(val, cand, 2);
 case 34 : return uniqueLoop(val, cand, 4);
 case 35 : return uniqueLoop(val, cand, 3);
 case 36 : return bugType(val, cand, 2);
 case 37 : return bugType(val, cand, 4);
 case 38 : return bugType(val, cand, 3);
 case 39 : return alignedPair(val, cand) ? 62 : 0;
 case 40 : return alignedTriplet(val, cand) ? 75 : 0;
 case 41 : return nishio(val, cand);
 case 42 : return multiChains(val, cand);
 }
 return 0;

}
function directLocked(cand) {
for (let kind = 0;
 kind < 2;
 kind++) {
 let pointing = kind == 0;
 for (let u = pointing ? 18 : 0;
 u < (pointing ? 27 : 18);
 u++) {
 for (let d = 1;
 d <= 9;
 d++) {
 let bit = 1 << d, n = 0;
 let cells = newArr(9, 0);
 for (let c of UNITS[u])if ((cand[c] & bit) != 0)cells[n++] = c;
 if (n < 2)continue;
 for (let k = 0;
 k < 3;
 k++) {
 let other = CELL_UNITS[cells[0]][k];
 if (other == u)continue;
 let all = true;
 for (let i = 1;
 i < n;
 i++)if (CELL_UNITS[cells[i]][k] != other) {
 all = false;
 break;
 }
 if (!all)continue;
 let lo = u < 9 ? 0 : u < 18 ? 9 : 18;
 for (let u3 = lo;
 u3 < lo + 9;
 u3++) {
 if (u3 == u)continue;
 let total = 0, outside = 0, single = - 1;
 let crosses = false;
 for (let c of UNITS[u3]) {
 let inOther = CELL_UNITS[c][other < 9 ? 0 : other < 18 ? 1 : 2] == other;
 if (inOther)crosses = true;
 if ((cand[c] & bit) == 0)continue;
 total++;
 if (!inOther) {
 outside++;
 single = c;
 }
 }
 if (!crosses || total < 2 || outside != 1)continue;
 let before = snap(cand);
 for (let c of UNITS[other])if (CELL_UNITS[c][u < 9 ? 0 : u < 18 ? 1 : 2] != u)cand[c] &= ~bit;
 fig(before, cand, pointing ? F_DPOINTING : F_DCLAIMING, bit, Arrays.copyOf(cells, n), [u, other, u3], single, d);
 return pointing ? 17 : 19;
 }
 }
 }
 }
 }
 return 0;

}
function directHidden(val, cand, size) {
for (let u = 0;
 u < 27;
 u++) {
 let e = newArr(9, 0);
 let m = 0;
 for (let c of UNITS[u])if (val[c] == 0)e[m++] = c;
 if (m <= size)continue;
 let pos = newArr(10, 0);
 for (let d = 1;
 d <= 9;
 d++)for (let i = 0;
 i < m;
 i++)if ((cand[e[i]] & (1 << d)) != 0)pos[d] |= 1 << i;
 for (let ds = 0;
 ds < 1024;
 ds += 2) {
 if (Integer.bitCount(ds) != size)continue;
 let where = 0;
 let ok = true;
 for (let d = 1;
 d <= 9 && ok;
 d++)if ((ds & (1 << d)) != 0) {
 if (pos[d] == 0)ok = false;
 where |= pos[d];
 }
 if (!ok || Integer.bitCount(where) != size)continue;
 for (let w = 1;
 w <= 9;
 w++) {
 if ((ds & (1 << w)) != 0 || Integer.bitCount(pos[w]) < 2 || Integer.bitCount(pos[w] & ~where) != 1)continue;
 let before = snap(cand);
 restrict(cand, e, m, where, ds);
 fig(before, cand, F_DHIDDEN, ds, cellsOf(e, where), [u], cellsOf(e, pos[w] & ~where)[0], w);
 return true;
 }
 }
 }
 return false;

}
function quads(val, cand, hidden) {
for (let u = 0;
 u < 27;
 u++) {
 let e = newArr(9, 0);
 let m = 0;
 for (let c of UNITS[u])if (val[c] == 0)e[m++] = c;
 if (hidden ? m < 9 : m < 5)continue;
 let changed = false;
 if (!hidden) {
 for (let cs = 0;
 cs < (1 << m);
 cs++) {
 if (Integer.bitCount(cs) != 4)continue;
 let un = 0;
 for (let i = 0;
 i < m;
 i++)if ((cs & (1 << i)) != 0)un |= cand[e[i]];
 if (Integer.bitCount(un) != 4)continue;
 let before = snap(cand);
 for (let i = 0;
 i < m;
 i++)if ((cs & (1 << i)) == 0 && (cand[e[i]] & un) != 0) {
 cand[e[i]] &= ~un;
 changed = true;
 }
 fig(before, cand, F_NAKED, un, cellsOf(e, cs), [u], - 1, 0);
 }
 }
 else {
 let pos = newArr(10, 0);
 for (let d = 1;
 d <= 9;
 d++)for (let i = 0;
 i < m;
 i++)if ((cand[e[i]] & (1 << d)) != 0)pos[d] |= 1 << i;
 for (let ds = 0;
 ds < 1024;
 ds += 2) {
 if (Integer.bitCount(ds) != 4)continue;
 let where = 0;
 let ok = true;
 for (let d = 1;
 d <= 9 && ok;
 d++)if ((ds & (1 << d)) != 0) {
 if (pos[d] == 0)ok = false;
 where |= pos[d];
 }
 if (ok && Integer.bitCount(where) == 4) {
 let before = snap(cand);
 changed |= restrict(cand, e, m, where, ds);
 fig(before, cand, F_HIDDEN, ds, cellsOf(e, where), [u], - 1, 0);
 }
 }
 }
 if (changed)return true;
 }
 return false;

}
function jellyfish(val, cand) {
for (let d = 1;
 d <= 9;
 d++) {
 let bit = 1 << d;
 for (let orient = 0;
 orient < 2;
 orient++) {
 let m = newArr(9, 0);
 for (let i = 0;
 i < 9;
 i++)for (let j = 0;
 j < 9;
 j++) {
 let c = orient == 0 ? i * 9 + j : j * 9 + i;
 if (val[c] == 0 && (cand[c] & bit) != 0)m[i] |= 1 << j;
 }
 for (let base = 0;
 base < 512;
 base++) {
 if (Integer.bitCount(base) != 4)continue;
 let cover = 0;
 let ok = true;
 for (let i = 0;
 i < 9 && ok;
 i++)if ((base & (1 << i)) != 0) {
 let k = Integer.bitCount(m[i]);
 if (k < 2 || k > 4)ok = false;
 cover |= m[i];
 }
 if (ok && Integer.bitCount(cover) == 4 && fishRec(val, cand, bit, orient, cover, base))return true;
 }
 }
 }
 return false;

}
function altChain(val, cand, st) {
let bestRing = MAXINT, bestAic = MAXINT;
 let ringEl = null, aicEl = null;
 let ringMixed = false, aicMixed = false;
 let ringPath = null, aicPath = null;
 let rec = FIGS.get() != null;
 let offM = OFF.get();
 let ringOk = offM == null || (offM & (1 << W_RING)) == 0, aicOk = offM == null || (offM & (1 << W_AIC)) == 0;
 if (!ringOk)bestRing = - 1;
 if (!aicOk)bestAic = - 1;
 let par = newArr(1620, 0), dist = newArr(1620, 0), qu = newArr(1620, 0);
 let path = newArr(1620, 0);
 for (let sc = 0;
 sc < 81;
 sc++) {
 if (val[sc] != 0)continue;
 for (let sd = 1;
 sd <= 9;
 sd++) {
 if ((cand[sc] & (1 << sd)) == 0)continue;
 let s = sc * 10 + sd;
 Arrays.fill(par, - 2);
 let head = 0, tail = 0;
 par[s * 2] = - 1;
 dist[s * 2] = 0;
 qu[tail++] = s * 2;
 while (head < tail) {
 let stt = qu[head++], n = stt >> 1, c = Math.trunc(n / 10), d = n % 10;
 let dn = dist[stt] + 1;
 if (dn >= bestRing && dn >= bestAic)break;
 if ((stt & 1) == 0) {
 if (Integer.bitCount(cand[c]) == 2) {
 let o = Integer.numberOfTrailingZeros(cand[c] & ~(1 << d));
 let m = (c * 10 + o) * 2 + 1;
 if (par[m] == - 2) {
 par[m] = stt;
 dist[m] = dn;
 qu[tail++] = m;
 }
 }
 for (let u of CELL_UNITS[c]) {
 let other = - 1, k = 0;
 for (let q of UNITS[u])if (val[q] == 0 && (cand[q] & (1 << d)) != 0) {
 k++;
 if (q != c)other = q;
 }
 if (k != 2)continue;
 let m = (other * 10 + d) * 2 + 1;
 if (par[m] == - 2) {
 par[m] = stt;
 dist[m] = dn;
 qu[tail++] = m;
 }
 }
 }
 else {
 for (let o = 1;
 o <= 9;
 o++) {
 if (o == d || (cand[c] & (1 << o)) == 0)continue;
 let m = (c * 10 + o) * 2;
 if (par[m] == - 2) {
 par[m] = stt;
 dist[m] = dn;
 qu[tail++] = m;
 }
 }
 for (let q of PEERS[c]) {
 if (val[q] != 0 || (cand[q] & (1 << d)) == 0)continue;
 let m = (q * 10 + d) * 2;
 if (par[m] == - 2) {
 par[m] = stt;
 dist[m] = dn;
 qu[tail++] = m;
 }
 }
 }
 }
 for (let i = 0;
 i < tail;
 i++) {
 let stt = qu[i];
 if ((stt & 1) == 0)continue;
 let len = dist[stt] + 1;
 if (len < 4 || (len >= bestRing && len >= bestAic))continue;
 let t = stt >> 1;
 let k = 0;
 for (let x = stt;
 x >= 0;
 x = par[x])path[k++] = x;
 let distinct = true;
 for (let a = 0;
 a < k && distinct;
 a++)for (let b = a + 1;
 b < k;
 b++)if ((path[a] >> 1) == (path[b] >> 1)) {
 distinct = false;
 break;
 }
 if (!distinct)continue;
 let cellL = false, houseL = false;
 for (let a = 0;
 a + 1 < k;
 a++) {
 let sameCell = Math.trunc((path[a] >> 1) / 10) == Math.trunc((path[a + 1] >> 1) / 10);
 if (sameCell)cellL = true;
 else if ((path[a] & 1) == 1)houseL = true;
 }
 let tc = Math.trunc(t / 10), td = t % 10;
 let closes = t != s && ((tc == sc && td != sd) || (td == sd && isPeer(tc, sc)));
 if (closes && len < bestRing) {
 let el = new ArrayList();
 for (let a = 0;
 a + 1 < k;
 a++)if ((path[a] & 1) == 0)weakElims(val, cand, path[a] >> 1, path[a + 1] >> 1, el);
 weakElims(val, cand, t, s, el);
 if (!el.isEmpty()) {
 bestRing = len;
 ringEl = el;
 ringMixed = houseL && (cellL || tc == sc);
 if (rec)ringPath = Arrays.copyOf(path, k);
 }
 }
 if (len < bestAic) {
 let el = new ArrayList();
 if (t == s) {
 for (let o = 1;
 o <= 9;
 o++)if (o != sd && (cand[sc] & (1 << o)) != 0)el.add(sc * 10 + o);
 }
 else if (tc == sc) {
 for (let o = 1;
 o <= 9;
 o++)if (o != sd && o != td && (cand[sc] & (1 << o)) != 0)el.add(sc * 10 + o);
 }
 else if (td == sd) {
 for (let q = 0;
 q < 81;
 q++)if (q != sc && q != tc && val[q] == 0 && (cand[q] & (1 << sd)) != 0 && isPeer(q, sc) && isPeer(q, tc))el.add(q * 10 + sd);
 }
 else if (isPeer(tc, sc)) {
 if ((cand[tc] & (1 << sd)) != 0)el.add(tc * 10 + sd);
 if ((cand[sc] & (1 << td)) != 0)el.add(sc * 10 + td);
 }
 if (!el.isEmpty()) {
 bestAic = len;
 aicEl = el;
 aicMixed = houseL && cellL;
 if (rec)aicPath = Arrays.copyOf(path, k);
 }
 }
 }
 }
 }
 if (ringEl != null) {
 let before = snap(cand);
 for (let e of ringEl)cand[Math.trunc(e / 10)] &= ~(1 << (e % 10));
 altFig(before, cand, ringPath, true);
 return found(st, W_RING, chainSe(true, ringMixed, bestRing));
 }
 if (aicEl != null) {
 let before = snap(cand);
 for (let e of aicEl)cand[Math.trunc(e / 10)] &= ~(1 << (e % 10));
 altFig(before, cand, aicPath, false);
 return found(st, W_AIC, chainSe(false, aicMixed, bestAic));
 }
 return false;

}
function weakElims(val, cand, u, v, el) {
let uc = Math.trunc(u / 10), ud = u % 10, vc = Math.trunc(v / 10), vd = v % 10;
 if (uc == vc) {
 for (let o = 1;
 o <= 9;
 o++)if (o != ud && o != vd && (cand[uc] & (1 << o)) != 0 && !el.contains(uc * 10 + o))el.add(uc * 10 + o);
 }
 else if (ud == vd) {
 for (let q = 0;
 q < 81;
 q++)if (q != uc && q != vc && val[q] == 0 && (cand[q] & (1 << ud)) != 0 && isPeer(q, uc) && isPeer(q, vc) && !el.contains(q * 10 + ud))el.add(q * 10 + ud);
 }

}
function candidates(val) {
let cand = newArr(81, 0);
 for (let c = 0;
 c < 81;
 c++)cand[c] = val[c] == 0 ? 0x3FE : 0;
 for (let c = 0;
 c < 81;
 c++)if (val[c] != 0)for (let p of PEERS[c])cand[p] &= ~(1 << val[c]);
 return cand;

}
let SE_BEYOND = 70, SE_GRANDMASTER = 85;
let SE_EXTREME = 120;
let BOUND = 1000;
class Rating {
constructor() {
this.se = 0;
this.tier = T_HIDDEN;
this.state = 0;
this.placed = 0;
this.used = 0;
this.rounds = newArr(9, 0);
this.steps = newArr(9, 0);
this.n1 = 0;
this.n2 = 0;
this.t1 = 0;
this.n3 = 0;
this.nd = newArr(4, 0);
this.lenMax = newArr(4, 0);
this.lenSum = newArr(4, 0);
this.lastLen = 0;
this.empHard = 0;
this.logicSe = 12;
this.deadline = 0;
this.stop = null;
this.bmax = 0;
}
keySteps() {
return this.tier >= T_HARDER ? this.n1 + 1000 * this.n2 + 1000000 * this.n3 : this.steps[this.tier];

}
late() {
return (this.deadline > 0 && System.currentTimeMillis() > this.deadline) || (this.stop != null && this.stop.get());

}
}
function walk$4(puzzle, rate, millis, out) {
return walk$5(puzzle, rate, millis, out, null);

}
let TR_HIDDEN = 0, TR_NAKED = 1, TR_TECH = 2, TR_INNER = 3;
let TB_EMPTY = 0, TB_NONE = 1, TB_TWICE = 2;
function trace(val0, cand0, cell, digit, depth) { return null; }
let M_HIDDEN_BOX = 0, M_HIDDEN_LINE = 1, M_NAKED = 2, M_TECH = 3, M_ASSUME = 4;
let F_POINTING = 1, F_CLAIMING = 2, F_NAKED = 3, F_HIDDEN = 4, F_FISH = 5, F_DPOINTING = 6, F_DCLAIMING = 7, F_DHIDDEN = 8, F_XYWING = 9, F_XYZWING = 10, F_UR1 = 11, F_UR2 = 12, F_UR3 = 13, F_UR4 = 14, F_BUG = 15, F_SKY = 16, F_KITE = 17, F_ER = 18, F_FINNED = 19, F_CHAIN = 20, F_UL = 21, F_BUG2 = 22, F_BUG3 = 23, F_BUG4 = 24, F_APE = 25, F_ATE = 26, F_NISHIO = 27, F_FC = 28;
function chainFig(before, cand, kind, digits, nodes, strong, ring) { return null; }
function alt(links, firstStrong) {
let b = newArr(links, false);
 for (let i = 0;
 i < links;
 i++)b[i] = (i % 2 == 0) == firstStrong;
 return b;

}
let FIGS = new ThreadLocal();
function snap(cand) { return null; }
function fig(before, cand, kind, digits, cells, units, extra, extraDigit) {  }
function lastFigPivot(pv) {  }
function erFig(before, cand, val, bit, box, hinge, near, far) {  }
function finFig(before, cand, val, bit, orient, combo, f, cover, fins) {  }
function urFig(before, cand, kind, ab, q, roof, extra, house) { return null; }
function altFig(before, cand, path, ring) {  }
function cellsOf(e, mask) {
let r = newArr(Integer.bitCount(mask), 0);
 let n = 0;
 for (let x = 0;
 x < 9;
 x++)if ((mask & (1 << x)) != 0)r[n++] = e[x];
 return r;

}
function logMove(log, kind, code, se, ur, degree, pv, pc, val, cand) {  }
function walk$5(puzzle, rate, millis, out, log) {
let R = new Rating();
 if (millis > 0)R.deadline = System.currentTimeMillis() + millis;
 R.stop = STOP.get();
 let val = out != null ? out : newArr(81, 0);
 System.arraycopy(puzzle, 0, val, 0, 81);
 let cand = candidates(val);
 let st = new Step();
 let pv = null, pc = null;
 while (true) {
 if (contradiction(val, cand)) {
 R.state = 2;
 break;
 }
 if (countEmpty(val) == 0) {
 R.state = 0;
 break;
 }
 if (log != null) {
 pv = val.slice();
 pc = cand.slice();
 }
 let se = 12, n = hiddenSinglesIn(val, cand, 18, 27);
 if (n == 0) {
 n = hiddenSingles(val, cand);
 se = 15;
 }
 if (n > 0) {
 R.placed += n;
 R.rounds[T_HIDDEN]++;
 R.logicSe = Math.max(R.logicSe, se);
 R.used |= 1 << W_HIDDEN;
 if (log != null)logMove(log, se == 12 ? M_HIDDEN_BOX : M_HIDDEN_LINE, W_HIDDEN, se, 0, 0, pv, pc, val, cand);
 continue;
 }
 if (log != null)FIGS.set(new ArrayList());
 let stepped = step$6(val, cand, false, st, 0, BEFORE_NAKED);
 if (!stepped) {
 n = nakedSingles(val, cand);
 if (n > 0) {
 if (log != null)FIGS.get().clear();
 R.placed += n;
 R.rounds[T_NAKED]++;
 R.tier = Math.max(R.tier, T_NAKED);
 R.logicSe = Math.max(R.logicSe, 23);
 R.used |= 1 << W_NAKED;
 if (log != null)logMove(log, M_NAKED, W_NAKED, 23, 0, 0, pv, pc, val, cand);
 continue;
 }
 stepped = step$6(val, cand, true, st, BEFORE_NAKED, ATOMS);
 }
 if (stepped) {
 let t = TIER_OF[st.code];
 R.rounds[t]++;
 R.steps[t]++;
 R.tier = Math.max(R.tier, t);
 R.logicSe = Math.max(R.logicSe, st.se);
 R.used |= 1 << st.code;
 if (st.ur > 0)R.used |= 1 << urBit(st.ur);
 if (log != null) {
 logMove(log, M_TECH, st.code, st.se, st.ur, 0, pv, pc, val, cand);
 let lm = log.get(log.size() - 1);
 for (let f of lm.figs)if (f.trace != null)lm.trace = f.trace;
 FIGS.set(null);
 }
 continue;
 }
 if (log != null)FIGS.set(null);
 R.tier = T_HARDER;
 if (!rate) {
 R.state = 1;
 break;
 }
 let done = false;
 for (let depth = 0;
 depth < 4 && !done;
 depth++) {
 if (R.late()) {
 R.se = BOUND + Math.max(beyond(R), SE_BEYOND);
 return R;
 }
 R.bmax = 0;
 if (depth == 1 && R.empHard == 0)R.empHard = countEmpty(val);
 if (assume(val, cand, depth, R)) {
 done = true;
 if (depth < 2) {
 R.n1++;
 R.t1 = Math.max(R.t1, R.bmax);
 }
 else if (depth == 2)R.n2++;
 else R.n3++;
 R.nd[depth]++;
 R.lenSum[depth] += R.lastLen;
 R.lenMax[depth] = Math.max(R.lenMax[depth], R.lastLen);
 if (log != null) {
 logMove(log, M_ASSUME, 0, 0, 0, depth < 2 ? 1 : depth, pv, pc, val, cand);
 let am = log.get(log.size() - 1);
 if (am.removed.length > 0)am.trace = trace(pv, pc, Math.trunc(am.removed[0] / 10), am.removed[0] % 10, depth);
 }
 }
 }
 if (R.late()) {
 R.se = BOUND + Math.max(beyond(R), SE_BEYOND);
 return R;
 }
 if (!done) {
 R.se = SE_EXTREME;
 return R;
 }
 }
 if (log != null)FIGS.set(null);
 if (R.state == 2)R.tier = T_INVALID;
 R.se = beyond(R);
 return R;

}
function beyond(R) {
if (R.n1 == 0 && R.n2 == 0 && R.n3 == 0)return R.logicSe;
 if (R.n3 > 0)return SE_EXTREME - 1;
 let v;
 if (R.nd[1] > 0 || R.n2 > 0)v = 143 - 0.6 * R.empHard - (R.n2 > 0 ? 1 : 0) + 4 * Math.log(1 + R.nd[2]);
 else v = 88 + 0.08 * R.lenMax[0] + 0.44 * Math.log(Math.max(1, R.n1));
 return Math.max(R.logicSe, clamp(v, SE_GRANDMASTER, SE_EXTREME - 1));

}
function clamp(v, lo, hi) {
return Math.max(lo, Math.min(hi, Math.trunc(Math.round(v))));

}
function rate(puzzle, millis) {
return walk$4(puzzle, true, millis, null);

}
function grade(puzzle) {
return walk$4(puzzle, false, 0, null).tier;

}
function assume(val, cand, depth, R) {
if (depth > 0)return assumeDeep(val, cand, depth, R);
 let bestC = - 1, bestD = 0, best = MAXINT;
 for (let c = 0;
 c < 81;
 c++) {
 if (val[c] != 0)continue;
 for (let d = 1;
 d <= 9;
 d++) {
 if ((cand[c] & (1 << d)) == 0)continue;
 if (R.late())return false;
 let v = val.slice(), k = cand.slice();
 place(v, k, c, d);
 let len = breaks(v, k, depth, R);
 if (len >= 0 && len < best) {
 best = len;
 bestC = c;
 bestD = d;
 }
 if (depth > 0 && bestC >= 0)break;
 }
 if (depth > 0 && bestC >= 0)break;
 }
 if (bestC < 0)return false;
 cand[bestC] &= ~(1 << bestD);
 R.lastLen = best;
 return true;

}
function assumeDeep(val, cand, depth, R) {
let n = 0;
 let key = newArr(729, 0);
 for (let c = 0;
 c < 81;
 c++) {
 if (val[c] != 0)continue;
 for (let d = 1;
 d <= 9;
 d++) {
 if ((cand[c] & (1 << d)) == 0)continue;
 let v = val.slice(), k = cand.slice();
 place(v, k, c, d);
 let filled = 0;
 while (!contradiction(v, k)) {
 let m = hiddenSingles(v, k);
 if (m == 0)m = nakedSingles(v, k);
 if (m == 0)break;
 filled += m;
 }
 key[n++] = (80 - Math.min(filled, 80)) * 1000 + c * 10 + d;
 }
 }
 Arrays.sort(key, 0, n);
 for (let i = 0;
 i < n;
 i++) {
 if (R.late())return false;
 let c = Math.trunc((key[i] % 1000) / 10), d = key[i] % 10;
 let v = val.slice(), k = cand.slice();
 place(v, k, c, d);
 let len = breaks(v, k, depth, R);
 if (len < 0)continue;
 cand[c] &= ~(1 << d);
 R.lastLen = len;
 return true;
 }
 return false;

}
function breaks(val, cand, depth, R) {
let steps = 0;
 let st = new Step();
 while (true) {
 if (contradiction(val, cand))return steps;
 let n = hiddenSingles(val, cand);
 if (n == 0)n = nakedSingles(val, cand);
 if (n > 0) {
 steps += n;
 continue;
 }
 if (depth == 0)return - 1;
 steps++;
 if (step$4(val, cand, false, st)) {
 R.bmax = Math.max(R.bmax, st.se);
 continue;
 }
 if (depth == 2 && assume(val, cand, 0, R))continue;
 if (depth == 3 && assume(val, cand, 1, R))continue;
 return - 1;
 }

}
let DECIMAL = 44;
function contradiction(val, cand) {
for (let c = 0;
 c < 81;
 c++)if (val[c] == 0 && cand[c] == 0)return true;
 for (let u = 0;
 u < 27;
 u++) {
 let seen = 0, possible = 0;
 for (let c of UNITS[u]) {
 if (val[c] != 0) {
 let bit = 1 << val[c];
 if ((seen & bit) != 0)return true;
 seen |= bit;
 }
 else possible |= cand[c];
 }
 if (((seen | possible) & 0x3FE) != 0x3FE)return true;
 }
 return false;

}
function place(val, cand, c, d) {
val[c] = d;
 cand[c] = 0;
 for (let p of PEERS[c])cand[p] &= ~(1 << d);

}
function hiddenSingles(val, cand) {
return hiddenSinglesIn(val, cand, 0, 27);

}
function hiddenSinglesIn(val, cand, from, to) {
let placed = 0;
 for (let u = from;
 u < to;
 u++) {
 for (let d = 1;
 d <= 9;
 d++) {
 let bit = 1 << d, where = - 1, n = 0;
 for (let c of UNITS[u])if ((cand[c] & bit) != 0) {
 n++;
 where = c;
 }
 if (n == 1 && val[where] == 0) {
 place(val, cand, where, d);
 placed++;
 }
 }
 }
 return placed;

}
function nakedSingles(val, cand) {
let placed = 0;
 for (let c = 0;
 c < 81;
 c++) {
 if (val[c] == 0 && Integer.bitCount(cand[c]) == 1) {
 place(val, cand, c, Integer.numberOfTrailingZeros(cand[c]));
 placed++;
 }
 }
 return placed;

}
function locked(cand) {
if (lockedPass(cand, true))return 26;
 if (lockedPass(cand, false))return 28;
 return 0;

}
function lockedPass(cand, pointing) {
let changed = false;
 for (let u = pointing ? 18 : 0;
 u < (pointing ? 27 : 18);
 u++) {
 for (let d = 1;
 d <= 9;
 d++) {
 let bit = 1 << d;
 let cells = newArr(9, 0);
 let n = 0;
 for (let c of UNITS[u])if ((cand[c] & bit) != 0)cells[n++] = c;
 if (n < 2)continue;
 for (let k = 0;
 k < 3;
 k++) {
 let other = CELL_UNITS[cells[0]][k];
 if (other == u)continue;
 let all = true;
 for (let i = 1;
 i < n;
 i++)if (CELL_UNITS[cells[i]][k] != other) {
 all = false;
 break;
 }
 if (!all)continue;
 let before = snap(cand);
 for (let c of UNITS[other]) {
 if (CELL_UNITS[c][Math.trunc(u / 9)] == u)continue;
 if ((cand[c] & bit) != 0) {
 cand[c] &= ~bit;
 changed = true;
 }
 }
 fig(before, cand, pointing ? F_POINTING : F_CLAIMING, bit, Arrays.copyOf(cells, n), [u, other], - 1, 0);
 }
 }
 }
 return changed;

}
function fish(val, cand, n) {
let changed = false;
 for (let d = 1;
 d <= 9;
 d++) {
 let bit = 1 << d;
 for (let orient = 0;
 orient < 2;
 orient++) {
 let m = newArr(9, 0);
 for (let i = 0;
 i < 9;
 i++)for (let j = 0;
 j < 9;
 j++) {
 let c = orient == 0 ? i * 9 + j : j * 9 + i;
 if (val[c] == 0 && (cand[c] & bit) != 0)m[i] |= 1 << j;
 }
 for (let a = 0;
 a < 9;
 a++) {
 let ca = Integer.bitCount(m[a]);
 if (ca < 2 || ca > n)continue;
 for (let b = a + 1;
 b < 9;
 b++) {
 let cb = Integer.bitCount(m[b]);
 if (cb < 2 || cb > n)continue;
 let u2 = m[a] | m[b];
 if (n == 2) {
 if (Integer.bitCount(u2) == 2)changed |= fishRec(val, cand, bit, orient, u2, (1 << a) | (1 << b));
 continue;
 }
 if (Integer.bitCount(u2) > 3)continue;
 for (let e = b + 1;
 e < 9;
 e++) {
 let ce = Integer.bitCount(m[e]);
 if (ce < 2 || ce > 3)continue;
 let u3 = u2 | m[e];
 if (Integer.bitCount(u3) == 3)changed |= fishRec(val, cand, bit, orient, u3, (1 << a) | (1 << b) | (1 << e));
 }
 }
 }
 if (changed)return true;
 }
 }
 return false;

}
function fishRec(val, cand, bit, orient, cover, base) {
let before = snap(cand);
 let ch = fishEliminate(val, cand, bit, orient, cover, base);
 if (before != null && ch) {
 let us = new ArrayList(), cs = new ArrayList();
 for (let i = 0;
 i < 9;
 i++)if ((base & (1 << i)) != 0) {
 us.add(orient == 0 ? i : 9 + i);
 for (let j = 0;
 j < 9;
 j++) {
 let c = orient == 0 ? i * 9 + j : j * 9 + i;
 if ((cover & (1 << j)) != 0 && val[c] == 0 && (before[c] & bit) != 0)cs.add(c);
 }
 }
 for (let j = 0;
 j < 9;
 j++)if ((cover & (1 << j)) != 0)us.add(orient == 0 ? 9 + j : j);
 let u = newArr(us.size(), 0), c = newArr(cs.size(), 0);
 for (let i = 0;
 i < u.length;
 i++)u[i] = us.get(i);
 for (let i = 0;
 i < c.length;
 i++)c[i] = cs.get(i);
 fig(before, cand, F_FISH, bit, c, u, - 1, 0);
 }
 return ch;

}
function fishEliminate(val, cand, bit, orient, cover, base) {
let ch = false;
 for (let j = 0;
 j < 9;
 j++) {
 if ((cover & (1 << j)) == 0)continue;
 for (let i = 0;
 i < 9;
 i++) {
 if ((base & (1 << i)) != 0)continue;
 let c = orient == 0 ? i * 9 + j : j * 9 + i;
 if (val[c] == 0 && (cand[c] & bit) != 0) {
 cand[c] &= ~bit;
 ch = true;
 }
 }
 }
 return ch;

}
function xyWing(val, cand) {
for (let pv = 0;
 pv < 81;
 pv++) {
 let pm = cand[pv];
 if (val[pv] != 0 || Integer.bitCount(pm) != 2)continue;
 for (let i = 0;
 i < 20;
 i++) {
 let a = PEERS[pv][i], am = cand[a];
 if (val[a] != 0 || Integer.bitCount(am) != 2 || am == pm || Integer.bitCount(am & pm) != 1)continue;
 for (let j = i + 1;
 j < 20;
 j++) {
 let b = PEERS[pv][j], bm = cand[b];
 if (val[b] != 0 || Integer.bitCount(bm) != 2 || bm == pm || bm == am || Integer.bitCount(bm & pm) != 1)continue;
 let z = am & bm;
 if (Integer.bitCount(z) != 1 || (z & pm) != 0)continue;
 if (((am | bm) & ~z) != pm)continue;
 let ch = false;
 let before = snap(cand);
 for (let c = 0;
 c < 81;
 c++) {
 if (c == a || c == b || c == pv || val[c] != 0 || (cand[c] & z) == 0)continue;
 if (isPeer(c, a) && isPeer(c, b)) {
 cand[c] &= ~z;
 ch = true;
 }
 }
 if (ch) {
 fig(before, cand, F_XYWING, z, [a, b], newArr(0, 0), - 1, 0);
 lastFigPivot(pv);
 return true;
 }
 }
 }
 }
 return false;

}
function kite(val, cand) {
for (let d = 1;
 d <= 9;
 d++) {
 let bit = 1 << d;
 for (let r = 0;
 r < 9;
 r++) {
 let rc = two(val, cand, bit, UNITS[r]);
 if (rc == null)continue;
 for (let c = 0;
 c < 9;
 c++) {
 let cc = two(val, cand, bit, UNITS[9 + c]);
 if (cc == null)continue;
 for (let x = 0;
 x < 2;
 x++)for (let y = 0;
 y < 2;
 y++) {
 let a = rc[x], b = cc[y], ra = rc[1 - x], cb = cc[1 - y];
 if (a == b || ra == cb || ra == b || cb == a || boxOf(a) != boxOf(b))continue;
 if (boxOf(ra) == boxOf(a) || boxOf(cb) == boxOf(a))continue;
 let target = (Math.trunc(cb / 9)) * 9 + ra % 9;
 if (target == ra || target == cb || val[target] != 0 || (cand[target] & bit) == 0)continue;
 let before = snap(cand);
 cand[target] &= ~bit;
 chainFig(before, cand, F_KITE, bit, [ra * 10 + d, a * 10 + d, b * 10 + d, cb * 10 + d], alt(3, true), false);
 return true;
 }
 }
 }
 }
 return false;

}
function boxOf(c) {
return (Math.trunc(c / 27)) * 3 + Math.trunc((c % 9) / 3);

}
function two(val, cand, bit, unit) {
let a = - 1, b = - 1, n = 0;
 for (let c of unit)if (val[c] == 0 && (cand[c] & bit) != 0) {
 if (n == 0)a = c;
 else b = c;
 if (++n > 2)return null;
 }
 return n == 2 ? [a, b] : null;

}
function emptyRectangle(val, cand) {
for (let d = 1;
 d <= 9;
 d++) {
 let bit = 1 << d;
 for (let box = 0;
 box < 9;
 box++) {
 let br = (Math.trunc(box / 3)) * 3, bc = (box % 3) * 3;
 let cnt = 0, rows = 0, cols = 0;
 for (let i = 0;
 i < 9;
 i++) {
 let c = (br + Math.trunc(i / 3)) * 9 + bc + i % 3;
 if (val[c] == 0 && (cand[c] & bit) != 0) {
 cnt++;
 rows |= 1 << (Math.trunc(c / 9));
 cols |= 1 << (c % 9);
 }
 }
 if (cnt < 2 || Integer.bitCount(rows) < 2 || Integer.bitCount(cols) < 2)continue;
 for (let R = br;
 R < br + 3;
 R++)for (let C = bc;
 C < bc + 3;
 C++) {
 let fits = true, offRow = false, offCol = false;
 for (let i = 0;
 i < 9;
 i++) {
 let c = (br + Math.trunc(i / 3)) * 9 + bc + i % 3;
 if (val[c] != 0 || (cand[c] & bit) == 0)continue;
 let r = Math.trunc(c / 9), cc = c % 9;
 if (r != R && cc != C) {
 fits = false;
 break;
 }
 if (r == R && cc != C)offCol = true;
 if (cc == C && r != R)offRow = true;
 }
 if (!fits || !offRow || !offCol)continue;
 for (let R2 = 0;
 R2 < 9;
 R2++) {
 if (Math.trunc(R2 / 3) == Math.trunc(R / 3) || val[R2 * 9 + C] != 0 || (cand[R2 * 9 + C] & bit) == 0)continue;
 let X = - 1, n = 0;
 for (let j = 0;
 j < 9;
 j++) {
 let c = R2 * 9 + j;
 if (val[c] == 0 && (cand[c] & bit) != 0) {
 n++;
 if (j != C)X = j;
 }
 }
 if (n != 2 || Math.trunc(X / 3) == Math.trunc(C / 3))continue;
 let t = R * 9 + X;
 if (val[t] == 0 && (cand[t] & bit) != 0) {
 let before = snap(cand);
 cand[t] &= ~bit;
 erFig(before, cand, val, bit, box, R * 9 + C, R2 * 9 + C, R2 * 9 + X);
 return true;
 }
 }
 for (let C2 = 0;
 C2 < 9;
 C2++) {
 if (Math.trunc(C2 / 3) == Math.trunc(C / 3) || val[R * 9 + C2] != 0 || (cand[R * 9 + C2] & bit) == 0)continue;
 let Y = - 1, n = 0;
 for (let i = 0;
 i < 9;
 i++) {
 let c = i * 9 + C2;
 if (val[c] == 0 && (cand[c] & bit) != 0) {
 n++;
 if (i != R)Y = i;
 }
 }
 if (n != 2 || Math.trunc(Y / 3) == Math.trunc(R / 3))continue;
 let t = Y * 9 + C;
 if (val[t] == 0 && (cand[t] & bit) != 0) {
 let before = snap(cand);
 cand[t] &= ~bit;
 erFig(before, cand, val, bit, box, R * 9 + C, R * 9 + C2, Y * 9 + C2);
 return true;
 }
 }
 }
 }
 }
 return false;

}
function uniqueRectangle(val, cand) {
for (let r1 = 0;
 r1 < 9;
 r1++)for (let r2 = r1 + 1;
 r2 < 9;
 r2++)for (let c1 = 0;
 c1 < 9;
 c1++)for (let c2 = c1 + 1;
 c2 < 9;
 c2++) {
 if ((Math.trunc(r1 / 3) == Math.trunc(r2 / 3)) == (Math.trunc(c1 / 3) == Math.trunc(c2 / 3)))continue;
 let q = [r1 * 9 + c1, r1 * 9 + c2, r2 * 9 + c1, r2 * 9 + c2];
 let empty = true;
 for (let c of q)if (val[c] != 0) {
 empty = false;
 break;
 }
 if (!empty)continue;
 for (let k = 0;
 k < 4;
 k++) {
 let m = - 1, ok = 0;
 for (let x = 0;
 x < 4;
 x++) {
 if (x == k)continue;
 if (Integer.bitCount(cand[q[x]]) != 2)break;
 if (m == - 1)m = cand[q[x]];
 else if (cand[q[x]] != m)break;
 ok++;
 }
 if (ok != 3)continue;
 let f = q[k];
 if ((cand[f] & m) == m && Integer.bitCount(cand[f]) > 2) {
 let before = snap(cand);
 cand[f] &= ~m;
 fig(before, cand, F_UR1, m, q, newArr(0, 0), f, 0);
 return true;
 }
 }
 }
 return false;

}
function xChain(val, cand) {
for (let d = 1;
 d <= 9;
 d++) {
 let bit = 1 << d;
 let has = newArr(81, false);
 for (let c = 0;
 c < 81;
 c++)has[c] = val[c] == 0 && (cand[c] & bit) != 0;
 let strong = new ArrayList();
 for (let u = 0;
 u < 27;
 u++) {
 let p = - 1, q = - 1, n = 0;
 for (let c of UNITS[u])if (has[c]) {
 if (n == 0)p = c;
 else q = c;
 n++;
 }
 if (n == 2)strong.add([p, q]);
 }
 if (strong.size() < 2)continue;
 for (let s = 0;
 s < 81;
 s++) {
 if (!has[s])continue;
 let on = newArr(81, false), off = newArr(81, false);
 let dOn = newArr(81, 0), dOff = newArr(81, 0), pOn = newArr(81, 0), pOff = newArr(81, 0);
 let qu = new ArrayDeque();
 off[s] = true;
 qu.add(s);
 while (!qu.isEmpty()) {
 let x = qu.poll();
 let isOff = x >= 0;
 let c = isOff ? x : - x - 1;
 if (isOff) {
 for (let l of strong) {
 let o = l[0] == c ? l[1] : l[1] == c ? l[0] : - 1;
 if (o >= 0 && !on[o]) {
 on[o] = true;
 dOn[o] = dOff[c] + 1;
 pOn[o] = c;
 qu.add( - o - 1);
 }
 }
 }
 else {
 for (let o of PEERS[c])if (has[o] && !off[o]) {
 off[o] = true;
 dOff[o] = dOn[c] + 1;
 pOff[o] = c;
 qu.add(o);
 }
 }
 }
 for (let t = 0;
 t < 81;
 t++) {
 if (!on[t] || t == s || dOn[t] < 3)continue;
 let before = snap(cand);
 if (seenByAll(val, cand, bit, s, t)) {
 if (before != null) {
 let back = new ArrayList();
 let x = t;
 let isOn = true;
 while (true) {
 back.add(x * 10 + d);
 if (!isOn && x == s)break;
 x = isOn ? pOn[x] : pOff[x];
 isOn = !isOn;
 }
 let nodes = newArr(back.size(), 0);
 for (let i = 0;
 i < nodes.length;
 i++)nodes[i] = back.get(nodes.length - 1 - i);
 chainFig(before, cand, F_CHAIN, bit, nodes, alt(nodes.length - 1, true), false);
 }
 return dOn[t];
 }
 }
 }
 }
 return 0;

}
function wing3(val, cand, kind) {
let nodes = newArr(729, 0);
 let nn = 0;
 for (let c = 0;
 c < 81;
 c++)if (val[c] == 0)for (let d = 1;
 d <= 9;
 d++)if ((cand[c] & (1 << d)) != 0)nodes[nn++] = c * 10 + d;
 for (let i = 0;
 i < nn;
 i++) {
 let n1 = nodes[i];
 for (let t1 = 0;
 t1 < 2;
 t1++) {
 let s1 = strongOf(val, cand, n1, t1);
 for (let n2 of s1)for (let n3 of weakOf(val, cand, n2)) {
 if (n3 == n1)continue;
 for (let t2 = 0;
 t2 < 2;
 t2++) {
 for (let n4 of strongOf(val, cand, n3, t2)) {
 if (n4 == n1 || n4 == n2)continue;
 for (let n5 of weakOf(val, cand, n4)) {
 if (n5 == n1 || n5 == n2 || n5 == n3)continue;
 for (let t3 = 0;
 t3 < 2;
 t3++) {
 let ok = kind == 1 ? ((t1 == 1 && t2 == 0 && t3 == 0) || (t1 == 0 && t2 == 0 && t3 == 1)) : (t1 == 0 && t2 == 1 && t3 == 0);
 if (!ok)continue;
 for (let n6 of strongOf(val, cand, n5, t3)) {
 if (n6 == n1 || n6 == n2 || n6 == n3 || n6 == n4)continue;
 let before = snap(cand);
 if (removeSeenByBoth(val, cand, n1, n6)) {
 chainFig(before, cand, F_CHAIN, 0, [n1, n2, n3, n4, n5, n6], alt(5, true), false);
 return true;
 }
 }
 }
 }
 }
 }
 }
 }
 }
 return false;

}
function strongOf(val, cand, node, type) {
let c = Math.trunc(node / 10), d = node % 10;
 if (type == 1) {
 if (Integer.bitCount(cand[c]) != 2)return newArr(0, 0);
 let o = Integer.numberOfTrailingZeros(cand[c] & ~(1 << d));
 return [c * 10 + o];
 }
 let out = newArr(3, 0);
 let k = 0;
 for (let u of CELL_UNITS[c]) {
 let other = - 1, n = 0;
 for (let q of UNITS[u])if (val[q] == 0 && (cand[q] & (1 << d)) != 0) {
 n++;
 if (q != c)other = q;
 }
 if (n == 2) {
 let on = other * 10 + d;
 let dup = false;
 for (let j = 0;
 j < k;
 j++)if (out[j] == on)dup = true;
 if (!dup)out[k++] = on;
 }
 }
 return Arrays.copyOf(out, k);

}
function weakOf(val, cand, node) {
let c = Math.trunc(node / 10), d = node % 10;
 let out = newArr(28, 0);
 let k = 0;
 for (let o = 1;
 o <= 9;
 o++)if (o != d && (cand[c] & (1 << o)) != 0)out[k++] = c * 10 + o;
 for (let q of PEERS[c])if (val[q] == 0 && (cand[q] & (1 << d)) != 0)out[k++] = q * 10 + d;
 return Arrays.copyOf(out, k);

}
function weakLinked(c, z, node) {
let cn = Math.trunc(node / 10), dn = node % 10;
 return (c == cn && z != dn) || (z == dn && isPeer(c, cn));

}
function removeSeenByBoth(val, cand, a, b) {
let ch = false;
 for (let c = 0;
 c < 81;
 c++) {
 if (val[c] != 0)continue;
 for (let z = 1;
 z <= 9;
 z++) {
 if ((cand[c] & (1 << z)) == 0)continue;
 let m = c * 10 + z;
 if (m == a || m == b)continue;
 if (weakLinked(c, z, a) && weakLinked(c, z, b)) {
 cand[c] &= ~(1 << z);
 ch = true;
 }
 }
 }
 return ch;

}
function xyChain(val, cand) {
for (let a = 0;
 a < 81;
 a++) {
 if (val[a] != 0 || Integer.bitCount(cand[a]) != 2)continue;
 for (let x = 1;
 x <= 9;
 x++) {
 if ((cand[a] & (1 << x)) == 0)continue;
 let on = newArr(810, false), off = newArr(810, false);
 let cells = newArr(810, 0), par = newArr(810 * 2, 0);
 let qu = new ArrayDeque();
 off[a * 10 + x] = true;
 cells[a * 10 + x] = 1;
 qu.add(a * 10 + x);
 while (!qu.isEmpty()) {
 let st = qu.poll();
 let isOff = st < 810;
 let nd = isOff ? st : st - 810, c = Math.trunc(nd / 10), d = nd % 10;
 if (isOff) {
 let o = Integer.numberOfTrailingZeros(cand[c] & ~(1 << d));
 let m = c * 10 + o;
 if (!on[m]) {
 on[m] = true;
 cells[m] = cells[nd];
 par[m + 810] = nd;
 qu.add(m + 810);
 }
 }
 else {
 for (let q of PEERS[c]) {
 if (val[q] != 0 || Integer.bitCount(cand[q]) != 2 || (cand[q] & (1 << d)) == 0)continue;
 let m = q * 10 + d;
 if (!off[m]) {
 off[m] = true;
 cells[m] = cells[nd] + 1;
 par[m] = nd + 810;
 qu.add(m);
 }
 }
 }
 }
 for (let z = 0;
 z < 81;
 z++) {
 let m = z * 10 + x;
 if (z == a || !on[m] || cells[m] < 3)continue;
 let before = snap(cand);
 if (seenByAll(val, cand, 1 << x, a, z)) {
 if (before != null) {
 let back = new ArrayList();
 let stt = m + 810;
 while (true) {
 back.add(stt % 810);
 if (stt == a * 10 + x)break;
 stt = par[stt];
 }
 let nodes = newArr(back.size(), 0);
 for (let i = 0;
 i < nodes.length;
 i++)nodes[i] = back.get(nodes.length - 1 - i);
 chainFig(before, cand, F_CHAIN, 1 << x, nodes, alt(nodes.length - 1, true), false);
 }
 return cells[m];
 }
 }
 }
 }
 return 0;

}
function finnedFish(val, cand, n) {
for (let d = 1;
 d <= 9;
 d++) {
 let bit = 1 << d;
 for (let orient = 0;
 orient < 2;
 orient++) {
 let m = newArr(9, 0);
 for (let i = 0;
 i < 9;
 i++)for (let j = 0;
 j < 9;
 j++) {
 let c = orient == 0 ? i * 9 + j : j * 9 + i;
 if (val[c] == 0 && (cand[c] & bit) != 0)m[i] |= 1 << j;
 }
 for (let combo = 0;
 combo < 512;
 combo++) {
 if (Integer.bitCount(combo) != n - 1)continue;
 let cover = 0;
 let okRows = true;
 for (let i = 0;
 i < 9;
 i++)if ((combo & (1 << i)) != 0) {
 let bc = Integer.bitCount(m[i]);
 if (bc < 2 || bc > n) {
 okRows = false;
 break;
 }
 cover |= m[i];
 }
 if (!okRows || Integer.bitCount(cover) != n)continue;
 for (let f = 0;
 f < 9;
 f++) {
 if ((combo & (1 << f)) != 0 || (m[f] & cover) == 0)continue;
 let fins = m[f] & ~cover;
 if (fins == 0)continue;
 let stack = Math.trunc(Integer.numberOfTrailingZeros(fins) / 3);
 if ((fins & ~(7 << (stack * 3))) != 0)continue;
 let base = combo | (1 << f);
 let ch = false;
 let before = snap(cand);
 for (let k = stack * 3;
 k < stack * 3 + 3;
 k++) {
 if ((cover & (1 << k)) == 0)continue;
 for (let i = (Math.trunc(f / 3)) * 3;
 i < (Math.trunc(f / 3)) * 3 + 3;
 i++) {
 if ((base & (1 << i)) != 0)continue;
 let c = orient == 0 ? i * 9 + k : k * 9 + i;
 if (val[c] == 0 && (cand[c] & bit) != 0) {
 cand[c] &= ~bit;
 ch = true;
 }
 }
 }
 if (ch) {
 finFig(before, cand, val, bit, orient, combo, f, cover, fins);
 return true;
 }
 }
 }
 }
 }
 return false;

}
function urType(val, cand, type) {
for (let r1 = 0;
 r1 < 9;
 r1++)for (let r2 = r1 + 1;
 r2 < 9;
 r2++)for (let c1 = 0;
 c1 < 9;
 c1++)for (let c2 = c1 + 1;
 c2 < 9;
 c2++) {
 if ((Math.trunc(r1 / 3) == Math.trunc(r2 / 3)) == (Math.trunc(c1 / 3) == Math.trunc(c2 / 3)))continue;
 let q = [r1 * 9 + c1, r1 * 9 + c2, r2 * 9 + c1, r2 * 9 + c2];
 let empty = true;
 for (let c of q)if (val[c] != 0)empty = false;
 if (!empty)continue;
 let splits = [[0, 1, 2, 3], [2, 3, 0, 1], [0, 2, 1, 3], [1, 3, 0, 2]];
 for (let sp of splits) {
 let f1 = q[sp[0]], f2 = q[sp[1]], g1 = q[sp[2]], g2 = q[sp[3]];
 let ab = cand[f1];
 if (Integer.bitCount(ab) != 2 || cand[f2] != ab)continue;
 if ((cand[g1] & ab) != ab || (cand[g2] & ab) != ab)continue;
 let e1 = cand[g1] & ~ab, e2 = cand[g2] & ~ab;
 if (e1 == 0 || e2 == 0)continue;
 if (type == 2 && e1 == e2 && Integer.bitCount(e1) == 1) {
 let before = snap(cand);
 if (seenByAll(val, cand, e1, g1, g2)) {
 urFig(before, cand, F_UR2, ab, q, [g1, g2], e1, - 1);
 return 46;
 }
 }
 let ex = e1 | e2;
 if (type == 3 && Integer.bitCount(ex) <= 3)for (let u = 0;
 u < 27;
 u++) {
 let h1 = false, h2 = false;
 for (let c of UNITS[u]) {
 if (c == g1)h1 = true;
 if (c == g2)h2 = true;
 }
 if (!h1 || !h2)continue;
 let o = newArr(9, 0);
 let on = 0;
 for (let c of UNITS[u])if (c != g1 && c != g2 && val[c] == 0)o[on++] = c;
 for (let sm = 1;
 sm < (1 << on);
 sm++) {
 let sz = Integer.bitCount(sm);
 if (sz > 3)continue;
 let uni = ex;
 for (let i = 0;
 i < on;
 i++)if ((sm & (1 << i)) != 0)uni |= cand[o[i]];
 if (Integer.bitCount(uni) != sz + 1)continue;
 let ch = false;
 let before = snap(cand);
 for (let i = 0;
 i < on;
 i++) {
 if ((sm & (1 << i)) != 0)continue;
 if ((cand[o[i]] & uni) != 0) {
 cand[o[i]] &= ~uni;
 ch = true;
 }
 }
 if (ch) {
 let rest = newArr(sz, 0);
 for (let i = 0, r = 0;
 i < on;
 i++)if ((sm & (1 << i)) != 0)rest[r++] = o[i];
 let fg = urFig(before, cand, F_UR3, ab, q, [g1, g2], uni, u);
 if (fg != null)fg.rest = rest;
 return 45 + sz;
 }
 }
 }
 if (type == 4)for (let u = 0;
 u < 27;
 u++) {
 let h1 = false, h2 = false;
 for (let c of UNITS[u]) {
 if (c == g1)h1 = true;
 if (c == g2)h2 = true;
 }
 if (!h1 || !h2)continue;
 for (let dd = 1;
 dd <= 9;
 dd++) {
 let bit = 1 << dd;
 if ((ab & bit) == 0)continue;
 let n = 0;
 for (let c of UNITS[u])if (val[c] == 0 && (cand[c] & bit) != 0)n++;
 if (n != 2)continue;
 let other = ab & ~bit;
 if ((cand[g1] & other) != 0 || (cand[g2] & other) != 0) {
 let before = snap(cand);
 cand[g1] &= ~other;
 cand[g2] &= ~other;
 urFig(before, cand, F_UR4, ab, q, [g1, g2], bit, u);
 return 45;
 }
 }
 }
 }
 }
 return 0;

}
function bugPlusOne(val, cand) {
let tri = - 1;
 for (let c = 0;
 c < 81;
 c++) {
 if (val[c] != 0)continue;
 let n = Integer.bitCount(cand[c]);
 if (n == 2)continue;
 if (n == 3 && tri < 0) {
 tri = c;
 continue;
 }
 return false;
 }
 if (tri < 0)return false;
 let extra = 0;
 for (let u = 0;
 u < 27;
 u++) {
 let mine = false;
 for (let c of UNITS[u])if (c == tri)mine = true;
 for (let d = 1;
 d <= 9;
 d++) {
 let n = 0;
 for (let c of UNITS[u])if (val[c] == 0 && (cand[c] & (1 << d)) != 0)n++;
 if (n == 0 || n == 2)continue;
 if (!mine || n != 3)return false;
 if (extra == 0)extra = d;
 else if (extra != d)return false;
 }
 }
 if (extra == 0 || (cand[tri] & (1 << extra)) == 0)return false;
 let before = snap(cand);
 cand[tri] = 1 << extra;
 fig(before, cand, F_BUG, 1 << extra, [tri], newArr(0, 0), tri, extra);
 return true;

}
function seenByAll(val, cand, bit, ...cells) {
if (cells.length === 1 && Array.isArray(cells[0])) cells = cells[0];
let ch = false;
 for (let c = 0;
 c < 81;
 c++) {
 if (val[c] != 0 || (cand[c] & bit) == 0)continue;
 let all = true;
 for (let x of cells)if (c == x || !isPeer(c, x)) {
 all = false;
 break;
 }
 if (all) {
 cand[c] &= ~bit;
 ch = true;
 }
 }
 return ch;

}
let LOOPS = new ThreadLocal();
function allLoops(val, cand) {
let c = LOOPS.get();
 if (c != null && Arrays.equals(c[0], cand))return c[1];
 let all = new ArrayList();
 for (let s = 0;
 s < 81;
 s++) {
 if (val[s] != 0 || Integer.bitCount(cand[s]) != 2)continue;
 let a = Integer.numberOfTrailingZeros(cand[s]), b = Integer.numberOfTrailingZeros(cand[s] & ~(1 << a));
 let loops = new ArrayList();
 let path = newArr(12, 0);
 path[0] = s;
 let m0 = 0;
 for (let u of CELL_UNITS[s])m0 |= 1 << u;
 loopDfs(val, cand, (1 << a) | (1 << b), path, 1, - 1, 2, 0, loops, m0, 0);
 for (let loop of loops) {
 if (loop.length < 6 || !validLoop(loop))continue;
 let e = Arrays.copyOf(loop, loop.length + 2);
 e[loop.length] = a;
 e[loop.length + 1] = b;
 all.add(e);
 }
 }
 LOOPS.set([cand.slice(), all]);
 return all;

}
function uniqueLoop(val, cand, type) {
let bestSe = MAXINT;
 let bestLoop = null;
 let ba = 0, bb = 0;
 for (let e of allLoops(val, cand)) {
 let loop = Arrays.copyOf(e, e.length - 2);
 let a = e[e.length - 2], b = e[e.length - 1];
 let se = ulTry(val, cand.slice(), loop, a, b, type);
 if (se > 0 && se < bestSe) {
 bestSe = se;
 bestLoop = loop;
 ba = a;
 bb = b;
 }
 }
 if (bestLoop == null)return 0;
 let before = snap(cand);
 ulTry(val, cand, bestLoop, ba, bb, type);
 if (before != null)ulFig(before, cand, bestLoop, ba, bb, type);
 return bestSe;

}
function loopDfs(val, cand, ab, path, n, lastKind, allowedEx, exValues, out, evenHouses, oddHouses) {
let cell = path[n - 1];
 for (let kind = 0;
 kind < 3;
 kind++) {
 if (kind == lastKind)continue;
 let u = CELL_UNITS[cell][kind];
 for (let next of UNITS[u]) {
 if (next == path[0] && n >= 4) {
 if (n % 2 == 0)out.add(Arrays.copyOf(path, n));
 continue;
 }
 if (n >= path.length || val[next] != 0 || (cand[next] & ab) != ab)continue;
 if (next < path[0] && cand[next] == ab)continue;
 let in_ = false;
 for (let i = 0;
 i < n;
 i++)if (path[i] == next) {
 in_ = true;
 break;
 }
 if (in_)continue;
 let hm = 0;
 for (let q of CELL_UNITS[next])hm |= 1 << q;
 if ((hm & (n % 2 == 0 ? evenHouses : oddHouses)) != 0)continue;
 let ex = exValues | (cand[next] & ~ab);
 let extra = Integer.bitCount(cand[next]) > 2;
 if (!extra || Integer.bitCount(ex) == 1 || allowedEx > 0) {
 path[n] = next;
 loopDfs(val, cand, ab, path, n + 1, kind, extra ? allowedEx - 1 : allowedEx, ex, out, n % 2 == 0 ? evenHouses | hm : evenHouses, n % 2 == 0 ? oddHouses : oddHouses | hm);
 }
 }
 }

}
function validLoop(loop) {
let odd = new HashSet(), even = new HashSet();
 for (let i = 0;
 i < loop.length;
 i++)for (let u of CELL_UNITS[loop[i]])if (!(i % 2 == 1 ? odd : even).add(u))return false;
 return odd.equals(even);

}
function loopSe(len) {
return 45 + (len >= 10 ? 3 : 0) + (len >= 8 ? 2 : len >= 6 ? 1 : 0);

}
function ulTry(val, cand, loop, a, b, type) {
let ab = (1 << a) | (1 << b);
 let ex = new ArrayList();
 let exDigits = 0;
 for (let c of loop)if (Integer.bitCount(cand[c]) > 2) {
 ex.add(c);
 exDigits |= cand[c] & ~ab;
 }
 let base = loopSe(loop.length);
 let ch = false;
 if (type == 1) {
 if (ex.size() != 1)return 0;
 let c = ex.get(0);
 cand[c] &= ~ab;
 return base;
 }
 if (type == 2) {
 if (ex.size() < 2 || Integer.bitCount(exDigits) != 1)return 0;
 let cs = newArr(ex.size(), 0);
 for (let i = 0;
 i < cs.length;
 i++)cs[i] = ex.get(i);
 return seenByAll(val, cand, exDigits, cs) ? base : 0;
 }
 if (ex.size() != 2)return 0;
 let c1 = ex.get(0), c2 = ex.get(1);
 if (type == 4) {
 for (let u of CELL_UNITS[c1]) {
 let both = false;
 for (let q of CELL_UNITS[c2])if (q == u)both = true;
 if (!both)continue;
 for (let d of [a, b]) {
 let bit = 1 << d, n = 0;
 for (let c of UNITS[u])if (val[c] == 0 && (cand[c] & bit) != 0 && c != c1 && c != c2)n++;
 if (n != 0)continue;
 let other = ab & ~bit;
 if ((cand[c1] & other) != 0 || (cand[c2] & other) != 0) {
 cand[c1] &= ~other;
 cand[c2] &= ~other;
 return base;
 }
 }
 }
 return 0;
 }
 if (Integer.bitCount(exDigits) < 2)return 0;
 for (let u of CELL_UNITS[c1]) {
 let both = false;
 for (let q of CELL_UNITS[c2])if (q == u)both = true;
 if (!both)continue;
 let o = newArr(9, 0);
 let on = 0;
 for (let c of UNITS[u])if (c != c1 && c != c2 && val[c] == 0)o[on++] = c;
 let bestDeg = 0, bestSm = 0, bestUni = 0;
 for (let sm = 1;
 sm < (1 << on);
 sm++) {
 let sz = Integer.bitCount(sm);
 let uni = exDigits;
 for (let i = 0;
 i < on;
 i++)if ((sm & (1 << i)) != 0)uni |= cand[o[i]];
 if (Integer.bitCount(uni) != sz + 1 || (uni & ab) == uni)continue;
 let any = false;
 for (let i = 0;
 i < on;
 i++)if ((sm & (1 << i)) == 0 && (cand[o[i]] & uni) != 0)any = true;
 if (any && (bestDeg == 0 || sz + 1 < bestDeg)) {
 bestDeg = sz + 1;
 bestSm = sm;
 bestUni = uni;
 }
 }
 if (bestDeg == 0)continue;
 for (let i = 0;
 i < on;
 i++)if ((bestSm & (1 << i)) == 0)cand[o[i]] &= ~bestUni;
 return base + (bestDeg - 1);
 }
 return 0;

}
function ulFig(before, cand, loop, a, b, type) {  }
function bugType(val, cand, type) {
let temp = cand.slice();
 let bugVals = newArr(81, 0);
 let bug = new ArrayList();
 let all = 0;
 for (let u = 0;
 u < 27;
 u++) {
 for (let d = 1;
 d <= 9;
 d++) {
 let bit = 1 << d, n = 0, nb = 0, last = - 1;
 for (let c of UNITS[u])if (val[c] == 0 && (cand[c] & bit) != 0) {
 n++;
 if (Integer.bitCount(cand[c]) >= 3) {
 nb++;
 last = c;
 }
 }
 if (n == 0 || n == 2)continue;
 if (nb == 0)return 0;
 if (nb == 1) {
 if (!bug.contains(last))bug.add(last);
 bugVals[last] |= bit;
 all |= bit;
 temp[last] &= ~bit;
 }
 }
 }
 if (bug.size() < 2)return 0;
 for (let c = 0;
 c < 81;
 c++)if (val[c] == 0 && Integer.bitCount(temp[c]) != 2)return 0;
 for (let u = 0;
 u < 27;
 u++)for (let d = 1;
 d <= 9;
 d++) {
 let n = 0;
 for (let c of UNITS[u])if (val[c] == 0 && (temp[c] & (1 << d)) != 0)n++;
 if (n != 0 && n != 2)return 0;
 }
 let bc = newArr(bug.size(), 0);
 for (let i = 0;
 i < bc.length;
 i++)bc[i] = bug.get(i);
 let common = newArr(81, false);
 for (let c = 0;
 c < 81;
 c++) {
 if (val[c] != 0 || bug.contains(c))continue;
 let sees = true;
 for (let x of bc)if (!isPeer(c, x)) {
 sees = false;
 break;
 }
 common[c] = sees;
 }
 let before = snap(cand);
 if (type == 2) {
 if (Integer.bitCount(all) != 1)return 0;
 let ch = false;
 for (let c = 0;
 c < 81;
 c++)if (common[c] && (cand[c] & all) != 0) {
 cand[c] &= ~all;
 ch = true;
 }
 if (ch)bugFig(before, cand, F_BUG2, bc, all, - 1, null, 0);
 return ch ? 57 : 0;
 }
 let house = - 1;
 for (let kind = 0;
 kind < 3 && house < 0;
 kind++) {
 let u = CELL_UNITS[bc[0]][kind];
 let same = true;
 for (let x of bc)if (CELL_UNITS[x][kind] != u)same = false;
 if (same)house = u;
 }
 if (house < 0)return 0;
 if (type == 4) {
 if (bc.length != 2)return 0;
 let c1 = bc[0], c2 = bc[1];
 let com = cand[c1] & cand[c2] & ~all;
 if (Integer.bitCount(com) != 1)return 0;
 let r1 = cand[c1] & ~bugVals[c1] & ~com, r2 = cand[c2] & ~bugVals[c2] & ~com;
 if (r1 == 0 && r2 == 0)return 0;
 cand[c1] &= ~r1;
 cand[c2] &= ~r2;
 bugFig(before, cand, F_BUG4, bc, all, house, null, com);
 return 57;
 }
 let o = newArr(9, 0);
 let on = 0;
 for (let c of UNITS[house])if (common[c] && val[c] == 0)o[on++] = c;
 for (let deg = 2;
 deg <= 6;
 deg++) {
 for (let sm = 1;
 sm < (1 << on);
 sm++) {
 if (Integer.bitCount(sm) != deg - 1)continue;
 let uni = 0;
 for (let i = 0;
 i < on;
 i++)if ((sm & (1 << i)) != 0)uni |= cand[o[i]];
 if (Integer.bitCount(uni) != deg || (all & ~uni) != 0)continue;
 let ch = false;
 for (let i = 0;
 i < on;
 i++)if ((sm & (1 << i)) == 0 && (cand[o[i]] & uni) != 0) {
 cand[o[i]] &= ~uni;
 ch = true;
 }
 if (!ch)continue;
 let grp = newArr(deg - 1, 0);
 for (let i = 0, r = 0;
 i < on;
 i++)if ((sm & (1 << i)) != 0)grp[r++] = o[i];
 bugFig(before, cand, F_BUG3, bc, all, house, grp, uni);
 return 57 + (deg - 1);
 }
 }
 return 0;

}
function bugFig(before, cand, kind, bugCells, extra, house, grp, digit) {  }
function alignedPair(val, cand) {
let cells = new ArrayList();
 for (let c = 0;
 c < 81;
 c++) {
 if (val[c] != 0 || Integer.bitCount(cand[c]) < 2)continue;
 let single = false, any = false;
 for (let p of PEERS[c]) {
 if (val[p] != 0)continue;
 let k = Integer.bitCount(cand[p]);
 if (k == 1)single = true;
 else if (k == 2)any = true;
 }
 if (!single && any)cells.add(c);
 }
 for (let i = 0;
 i < cells.size();
 i++)for (let j = i + 1;
 j < cells.size();
 j++) {
 let c0 = cells.get(i), c1 = cells.get(j);
 let exc = new ArrayList();
 for (let p of PEERS[c0])if (p != c1 && val[p] == 0 && Integer.bitCount(cand[p]) == 2 && isPeer(p, c1))exc.add(p);
 if (exc.size() < 2)continue;
 let see = isPeer(c0, c1);
 let ok0 = 0, ok1 = 0;
 for (let d0 = 1;
 d0 <= 9;
 d0++) {
 if ((cand[c0] & (1 << d0)) == 0)continue;
 for (let d1 = 1;
 d1 <= 9;
 d1++) {
 if ((cand[c1] & (1 << d1)) == 0)continue;
 if (d0 == d1 && see)continue;
 let pair = (1 << d0) | (1 << d1);
 let bad = false;
 for (let e of exc)if ((cand[e] & ~pair) == 0) {
 bad = true;
 break;
 }
 if (bad)continue;
 ok0 |= 1 << d0;
 ok1 |= 1 << d1;
 }
 }
 let r0 = cand[c0] & ~ok0, r1 = cand[c1] & ~ok1;
 if (r0 == 0 && r1 == 0)continue;
 let before = snap(cand);
 cand[c0] &= ~r0;
 cand[c1] &= ~r1;
 if (before != null) {
 let ex = newArr(exc.size(), 0);
 for (let k = 0;
 k < ex.length;
 k++)ex[k] = exc.get(k);
 let list = FIGS.get();
 let n0 = list.size();
 fig(before, cand, F_APE, 0, [c0, c1], newArr(0, 0), - 1, 0);
 if (list.size() > n0)list.get(list.size() - 1).cells2 = ex;
 }
 return true;
 }
 return false;

}
function skyscraper(val, cand) {
for (let d = 1;
 d <= 9;
 d++) {
 let bit = 1 << d;
 for (let orient = 0;
 orient < 2;
 orient++) {
 let pos = newArr(9, null);
 for (let i = 0;
 i < 9;
 i++) {
 let n = 0, a = - 1, b = - 1;
 for (let j = 0;
 j < 9;
 j++) {
 let c = orient == 0 ? i * 9 + j : j * 9 + i;
 if (val[c] == 0 && (cand[c] & bit) != 0) {
 if (n == 0)a = j;
 else b = j;
 n++;
 }
 }
 if (n == 2)pos[i] = [a, b];
 }
 for (let a = 0;
 a < 9;
 a++) {
 if (pos[a] == null)continue;
 for (let b = a + 1;
 b < 9;
 b++) {
 if (pos[b] == null)continue;
 for (let x = 0;
 x < 2;
 x++)for (let y = 0;
 y < 2;
 y++) {
 if (pos[a][x] != pos[b][y] || pos[a][1 - x] == pos[b][1 - y])continue;
 let ja = pos[a][1 - x], jb = pos[b][1 - y];
 let r1 = orient == 0 ? a * 9 + ja : ja * 9 + a;
 let r2 = orient == 0 ? b * 9 + jb : jb * 9 + b;
 let j0 = pos[a][x];
 let b1 = orient == 0 ? a * 9 + j0 : j0 * 9 + a, b2 = orient == 0 ? b * 9 + j0 : j0 * 9 + b;
 let before = snap(cand);
 if (seenByAll(val, cand, bit, r1, r2)) {
 chainFig(before, cand, F_SKY, bit, [r1 * 10 + d, b1 * 10 + d, b2 * 10 + d, r2 * 10 + d], alt(3, true), false);
 return true;
 }
 }
 }
 }
 }
 }
 return false;

}
function xyzWing(val, cand) {
for (let pv = 0;
 pv < 81;
 pv++) {
 let pm = cand[pv];
 if (val[pv] != 0 || Integer.bitCount(pm) != 3)continue;
 for (let i = 0;
 i < 20;
 i++) {
 let a = PEERS[pv][i], am = cand[a];
 if (val[a] != 0 || Integer.bitCount(am) != 2 || (am & ~pm) != 0)continue;
 for (let j = i + 1;
 j < 20;
 j++) {
 let b = PEERS[pv][j], bm = cand[b];
 if (val[b] != 0 || Integer.bitCount(bm) != 2 || (bm & ~pm) != 0 || bm == am)continue;
 let z = am & bm;
 if (Integer.bitCount(z) != 1)continue;
 let before = snap(cand);
 if (seenByAll(val, cand, z, pv, a, b)) {
 fig(before, cand, F_XYZWING, z, [a, b], newArr(0, 0), - 1, 0);
 lastFigPivot(pv);
 return true;
 }
 }
 }
 }
 return false;

}
function wWing(val, cand) {
for (let a = 0;
 a < 81;
 a++) {
 let m = cand[a];
 if (val[a] != 0 || Integer.bitCount(m) != 2)continue;
 for (let b = a + 1;
 b < 81;
 b++) {
 if (val[b] != 0 || cand[b] != m || isPeer(a, b))continue;
 for (let d = 1;
 d <= 9;
 d++) {
 let xb = 1 << d;
 if ((m & xb) == 0)continue;
 let yb = m & ~xb;
 for (let u = 0;
 u < 27;
 u++) {
 let p = - 1, q = - 1, n = 0;
 for (let c of UNITS[u])if (val[c] == 0 && (cand[c] & xb) != 0) {
 if (n == 0)p = c;
 else q = c;
 n++;
 }
 if (n != 2 || p == a || p == b || q == a || q == b)continue;
 let pa = isPeer(p, a) && isPeer(q, b);
 let link = pa || (isPeer(q, a) && isPeer(p, b));
 if (!link)continue;
 let before = snap(cand);
 if (seenByAll(val, cand, yb, a, b)) {
 let y = Integer.numberOfTrailingZeros(yb), na = pa ? p : q, nb = pa ? q : p;
 chainFig(before, cand, F_CHAIN, yb, [a * 10 + y, a * 10 + d, na * 10 + d, nb * 10 + d, b * 10 + d, b * 10 + y], alt(5, true), false);
 return true;
 }
 }
 }
 }
 }
 return false;

}
function eliminate(cand, e, m, mask, i, j, k) {
let ch = false;
 for (let x = 0;
 x < m;
 x++) {
 if (x == i || x == j || x == k)continue;
 if ((cand[e[x]] & mask) != 0) {
 cand[e[x]] &= ~mask;
 ch = true;
 }
 }
 return ch;

}
function restrict(cand, e, m, posMask, keep) {
let ch = false;
 for (let x = 0;
 x < m;
 x++) {
 if ((posMask & (1 << x)) != 0 && (cand[e[x]] & ~keep) != 0) {
 cand[e[x]] &= keep;
 ch = true;
 }
 }
 return ch;

}
function hint(values, solution, used) {
let hu = used != null ? used : newArr(1, 0);
 hu[0] = 0;
 let val = values.slice();
 let cand = candidates(val);
 let st = new Step();
 let tier = T_HIDDEN, sub = 0;
 let unitOrder = newArr(27, 0);
 for (let i = 0;
 i < 9;
 i++) {
 unitOrder[i] = 18 + i;
 unitOrder[9 + i] = i;
 unitOrder[18 + i] = 9 + i;
 }
 while (true) {
 for (let u of unitOrder) {
 for (let d = 1;
 d <= 9;
 d++) {
 let bit = 1 << d, where = - 1, n = 0;
 for (let c of UNITS[u])if ((cand[c] & bit) != 0) {
 n++;
 where = c;
 }
 if (n == 1 && val[where] == 0 && solution[where] == d) {
 if (hu[0] == 0)hu[0] = 1 << W_HIDDEN;
 return [where, d, tier, u, sub];
 }
 }
 }
 for (let c = 0;
 c < 81;
 c++) {
 if (val[c] == 0 && Integer.bitCount(cand[c]) == 1) {
 let d = Integer.numberOfTrailingZeros(cand[c]);
 if (solution[c] == d) {
 if (hu[0] == 0)hu[0] = 1 << W_NAKED;
 return [c, d, Math.max(tier, T_NAKED), - 1, sub];
 }
 }
 }
 if (step$4(val, cand, true, st)) {
 tier = Math.max(tier, TIER_OF[st.code]);
 sub = st.code;
 hu[0] |= 1 << st.code;
 if (st.ur > 0)hu[0] |= 1 << urBit(st.ur);
 continue;
 }
 break;
 }
 let best = - 1, bc = 10;
 for (let c = 0;
 c < 81;
 c++) {
 if (val[c] != 0)continue;
 let n = Integer.bitCount(cand[c]);
 if (n < bc) {
 bc = n;
 best = c;
 }
 }
 if (best < 0)return null;
 return [best, solution[best], T_HARDER, - 1, sub];

}
let TARGET = [45, 36, 30, 26, 0, 0, 0];
let CLUES_LO = [42, 36, 31, 27, 24], CLUES_HI = [46, 40, 35, 31, 28];
let STEPS_MAX = [99, 3, 3, 3, 3];
let SE_LO = [12, 17, 30, 42, 50, 65, 80], SE_HI = [15, 28, 40, 47, 70, 80, 119];
let genCancel;
let SYMS = 7;
function brc(c) {
return [18 + (Math.trunc(c / 27)) * 3 + Math.trunc((c % 9) / 3), Math.trunc(c / 9), 9 + c % 9];

}
function alignedTriplet(val, cand) {
let base = new ArrayList();
 let excl = new ArrayList();
 let isBase = newArr(81, false);
 for (let c = 0;
 c < 81;
 c++) {
 if (val[c] != 0 || Integer.bitCount(cand[c]) < 2)continue;
 let single = false;
 let ex = new ArrayList();
 for (let p of PEERS[c]) {
 if (val[p] != 0)continue;
 let k = Integer.bitCount(cand[p]);
 if (k == 1)single = true;
 else if (k >= 2 && k <= 3)ex.add(p);
 }
 if (single || ex.isEmpty())continue;
 let e = newArr(ex.size(), 0);
 for (let i = 0;
 i < e.length;
 i++)e[i] = ex.get(i);
 base.add(c);
 excl.add(e);
 isBase[c] = true;
 }
 let n = base.size();
 if (n < 3)return false;
 let idx = newArr(81, 0);
 for (let i = 0;
 i < n;
 i++)idx[base.get(i)] = i;
 for (let j = 1;
 j < n;
 j++)for (let i = 0;
 i < j;
 i++) {
 let c0 = base.get(i), c1 = base.get(j);
 let twin = new LinkedHashSet();
 for (let x of excl.get(i))if (isBase[x] && x != c1)twin.add(x);
 for (let x of excl.get(j))if (isBase[x] && x != c0)twin.add(x);
 for (let c2 of twin) {
 let cs = [c0, c1, c2];
 let common = new ArrayList();
 for (let x of excl.get(i))if (contains(excl.get(j), x) && contains(excl.get(idx[c2]), x))common.add(x);
 if (common.size() < 2)continue;
 let ok = newArr(3, 0);
 let s01 = isPeer(c0, c1), s02 = isPeer(c0, c2), s12 = isPeer(c1, c2);
 for (let d0 = 1;
 d0 <= 9;
 d0++) {
 if ((cand[c0] & (1 << d0)) == 0)continue;
 for (let d1 = 1;
 d1 <= 9;
 d1++) {
 if ((cand[c1] & (1 << d1)) == 0 || (d0 == d1 && s01))continue;
 for (let d2 = 1;
 d2 <= 9;
 d2++) {
 if ((cand[c2] & (1 << d2)) == 0 || (d0 == d2 && s02) || (d1 == d2 && s12))continue;
 let comb = (1 << d0) | (1 << d1) | (1 << d2);
 let bad = false;
 for (let e of common)if ((cand[e] & ~comb) == 0) {
 bad = true;
 break;
 }
 if (bad)continue;
 ok[0] |= 1 << d0;
 ok[1] |= 1 << d1;
 ok[2] |= 1 << d2;
 }
 }
 }
 let any = false;
 for (let k = 0;
 k < 3;
 k++)if ((cand[cs[k]] & ~ok[k]) != 0)any = true;
 if (!any)continue;
 let b4 = snap(cand);
 for (let k = 0;
 k < 3;
 k++)cand[cs[k]] &= ok[k];
 let cm = newArr(common.size(), 0);
 for (let k = 0;
 k < cm.length;
 k++)cm[k] = common.get(k);
 let list = FIGS.get();
 let n0 = list == null ? 0 : list.size();
 fig(b4, cand, F_ATE, 0, cs, newArr(0, 0), - 1, 0);
 if (list != null && list.size() > n0)list.get(list.size() - 1).cells2 = cm;
 return true;
 }
 }
 return false;

}
function seEquiv(val, before, after) {
let best = MAXINT;
 for (let c = 0;
 c < 81;
 c++)for (let d = 1;
 d <= 9;
 d++) {
 if ((before[c] & (1 << d)) == 0 || (after[c] & (1 << d)) != 0)continue;
 let x = staticProof(before, c, d, false);
 if (x > 0)best = Math.min(best, 66 + lengthBonus(x - 2));
 x = staticProof(before, c, d, true);
 if (x > 0)best = Math.min(best, 70 + lengthBonus(x - 2));
 if (best <= 75)continue;
 let net = new Net(before, true, true);
 if (net.run(c * 20 + d * 2 + 1))best = Math.min(best, 75 + lengthBonus(net.ancestors(net.badOn) + net.ancestors(net.badOff) - 2));
 best = Math.min(best, 85);
 }
 return best == MAXINT ? 0 : best;

}
function staticProof(cand, c0, d0, y) {
let par = newArr(1620, 0);
 Arrays.fill(par, - 2);
 let q = newArr(1620, 0);
 let h = 0, t = 0, start = c0 * 20 + d0 * 2 + 1, goal = start - 1;
 par[start] = - 1;
 q[t++] = start;
 while (h < t) {
 let p = q[h++], c = Math.trunc(p / 20), d = Math.trunc((p % 20) / 2);
 if ((p & 1) != 0) {
 if (y)for (let v = 1;
 v <= 9;
 v++)if (v != d && (cand[c] & (1 << v)) != 0) {
 let o = c * 20 + v * 2;
 if (par[o] == - 2) {
 par[o] = p;
 q[t++] = o;
 }
 }
 for (let u of brc(c))for (let x of UNITS[u])if (x != c && (cand[x] & (1 << d)) != 0) {
 let o = x * 20 + d * 2;
 if (par[o] == - 2) {
 par[o] = p;
 q[t++] = o;
 }
 }
 }
 else {
 if (y && Integer.bitCount(cand[c]) == 2) {
 let o = c * 20 + Integer.numberOfTrailingZeros(cand[c] & ~(1 << d)) * 2 + 1;
 if (par[o] == - 2) {
 par[o] = p;
 q[t++] = o;
 }
 }
 for (let u of brc(c)) {
 let other = - 1, n = 0;
 for (let x of UNITS[u])if ((cand[x] & (1 << d)) != 0) {
 n++;
 if (x != c)other = x;
 }
 if (n != 2)continue;
 let o = other * 20 + d * 2 + 1;
 if (par[o] == - 2) {
 par[o] = p;
 q[t++] = o;
 }
 }
 }
 if (par[goal] != - 2) {
 let len = 0;
 for (let x = goal;
 x != - 1;
 x = par[x])len++;
 return len;
 }
 }
 return - 1;

}
function contains(a, x) {
for (let y of a)if (y == x)return true;
 return false;

}
class Net {
constructor(cand, dynamic, nishio) {
this.src = null;
this.g = null;
this.dynamic = false;
this.nishio = false;
this.has = newArr(1620, false);
this.par = newArr(1620, null);
this.order = newArr(1620, 0);
this.depth = newArr(1620, 0);
this.count = 0;
this.badOn = - 1;
this.badOff = - 1;
this.badNew = - 1;
this.badPar = null;
this.src = cand;
 this.g = cand.slice();
 this.dynamic = dynamic;
 this.nishio = nishio;

}
add(n, p) {
this.has[n] = true;
 this.par[n] = p;
 this.order[this.count++] = n;
 if (p.length > 0)this.depth[n] = this.depth[p[0]] + 1;

}
run(start) {
let qOn = newArr(1620, 0), qOff = newArr(1620, 0);
 let hOn = 0, tOn = 0, hOff = 0, tOff = 0;
 this.add(start, newArr(0, 0));
 if ((start & 1) != 0)qOn[tOn++] = start;
 else qOff[tOff++] = start;
 while (hOn < tOn || hOff < tOff) {
 if (hOn < tOn) {
 let p = qOn[hOn++], c = Math.trunc(p / 20), d = Math.trunc((p % 20) / 2);
 if (!this.nishio)for (let v = 1;
 v <= 9;
 v++) {
 if (v == d || (this.g[c] & (1 << v)) == 0)continue;
 let o = c * 20 + v * 2;
 if (this.has[o + 1]) {
 this.bad(o + 1, o, o, [p]);
 return true;
 }
 if (!this.has[o]) {
 this.add(o, [p]);
 qOff[tOff++] = o;
 }
 }
 for (let u of brc(c))for (let x of UNITS[u]) {
 if (x == c || (this.g[x] & (1 << d)) == 0)continue;
 let o = x * 20 + d * 2;
 if (this.has[o + 1]) {
 this.bad(o + 1, o, o, [p]);
 return true;
 }
 if (!this.has[o]) {
 this.add(o, [p]);
 qOff[tOff++] = o;
 }
 }
 }
 else {
 let p = qOff[hOff++], c = Math.trunc(p / 20), d = Math.trunc((p % 20) / 2);
 let ons = newArr(4, 0);
 let pars = newArr(4, null);
 let k = 0;
 if (!this.nishio && Integer.bitCount(this.g[c]) == 2) {
 let v = Integer.numberOfTrailingZeros(this.g[c] & ~(1 << d));
 let pp = new ArrayList();
 pp.add(p);
 for (let w = 1;
 w <= 9;
 w++)if ((this.src[c] & (1 << w)) != 0 && (this.g[c] & (1 << w)) == 0)pp.add(c * 20 + w * 2);
 ons[k] = c * 20 + v * 2 + 1;
 pars[k++] = toArray(pp);
 }
 for (let u of brc(c)) {
 let other = - 1, n = 0;
 for (let x of UNITS[u])if ((this.g[x] & (1 << d)) != 0) {
 n++;
 if (x != c)other = x;
 }
 if (n != 2 || other < 0)continue;
 let pp = new ArrayList();
 pp.add(p);
 for (let x of UNITS[u])if ((this.src[x] & (1 << d)) != 0 && (this.g[x] & (1 << d)) == 0)pp.add(x * 20 + d * 2);
 ons[k] = other * 20 + d * 2 + 1;
 pars[k++] = toArray(pp);
 }
 if (this.dynamic)this.g[c] &= ~(1 << d);
 for (let i = 0;
 i < k;
 i++) {
 let on = ons[i];
 if (this.has[on - 1]) {
 this.bad(on, on - 1, on, pars[i]);
 return true;
 }
 if (!this.has[on]) {
 this.add(on, pars[i]);
 qOn[tOn++] = on;
 }
 }
 }
 }
 return false;

}
bad(on, off, nw, p) {
this.badOn = on;
 this.badOff = off;
 this.badNew = nw;
 this.badPar = p;

}
parents(n) {
return n == this.badNew ? this.badPar : this.par[n];

}
ancestors(n) {
if (!this.dynamic)return n == this.badNew ? this.depth[this.badPar[0]] + 2 : this.depth[n] + 1;
 let seen = newArr(1620, false);
 let st = newArr(1620, 0);
 let sp = 0, cnt = 0;
 st[sp++] = n;
 seen[n] = true;
 while (sp > 0) {
 let x = st[--sp];
 cnt++;
 let pp = this.parents(x);
 if (pp != null)for (let y of pp)if (!seen[y]) {
 seen[y] = true;
 st[sp++] = y;
 }
 }
 return cnt;

}
path(n) {
let l = new ArrayList();
 for (let x = n;
 ;
 ) {
 l.add(0, x);
 let pp = this.parents(x);
 if (pp == null || pp.length == 0)break;
 x = pp[0];
 }
 return toArray(l);

}
}
function toArray(l) {
let a = newArr(l.size(), 0);
 for (let i = 0;
 i < a.length;
 i++)a[i] = l.get(i);
 return a;

}
function nishio(val, cand) {
let best = MAXINT, bestC = - 1, bestD = 0;
 let bestOff = false;
 let bestNet = null;
 for (let c = 0;
 c < 81;
 c++) {
 if (val[c] != 0 || Integer.bitCount(cand[c]) < 2)continue;
 for (let d = 1;
 d <= 9;
 d++) {
 if ((cand[c] & (1 << d)) == 0)continue;
 for (let t = 0;
 t < 2;
 t++) {
 let net = new Net(cand, true, true);
 if (!net.run(c * 20 + d * 2 + (t == 0 ? 1 : 0)))continue;
 let cx = net.ancestors(net.badOn) + net.ancestors(net.badOff);
 let key = lengthBonus(cx - 2) * 10000 + cx;
 if (key < best) {
 best = key;
 bestC = c;
 bestD = d;
 bestOff = t == 1;
 bestNet = net;
 }
 }
 }
 }
 if (bestC < 0)return 0;
 let b4 = snap(cand);
 if (bestOff)cand[bestC] = 1 << bestD;
 else cand[bestC] &= ~(1 << bestD);
 let list = FIGS.get();
 if (list != null) {
 let n0 = list.size();
 fig(b4, cand, F_NISHIO, 1 << bestD, [bestC], newArr(0, 0), - 1, 0);
 if (list.size() > n0)list.get(list.size() - 1).trace = nishioTrace(val, b4, bestNet, bestC, bestD, bestOff);
 }
 return 75 + lengthBonus(best % 10000 - 2);

}
function nishioTrace(val0, cand0, net, c, d, off) { return null; }
function multiChains(val, cand) {
let off = OFF.get();
 let mask = off == null ? 0 : off;
 let cellOk = (mask & (1 << W_CELLFC)) == 0, regionOk = (mask & (1 << W_REGIONFC)) == 0;
 let best = MAXINT;
 let bestNodes = null;
 let bestNets = null;
 let bestTarget = - 1, bestSort = 0, bestUnit = - 1, bestDigit = 0, bestCell = - 1;
 let cache = newArr(1620, null);
 for (let c = 0;
 c < 81;
 c++) {
 if (val[c] != 0 || Integer.bitCount(cand[c]) < 3)continue;
 let byValue = newArr(10, null);
 for (let d = 1;
 d <= 9;
 d++) {
 if ((cand[c] & (1 << d)) == 0)continue;
 let net = staticNet(cand, cache, c * 20 + d * 2 + 1);
 byValue[d] = net;
 if (!regionOk)continue;
 for (let u of brc(c)) {
 let first = - 1, n = 0;
 for (let x of UNITS[u])if ((cand[x] & (1 << d)) != 0) {
 n++;
 if (first < 0)first = x;
 }
 if (n < 2 || first != c)continue;
 let nets = newArr(n, null);
 let where = newArr(n, 0);
 let k = 0;
 for (let x of UNITS[u]) {
 if ((cand[x] & (1 << d)) == 0)continue;
 where[k] = x;
 if (x == c)nets[k++] = net;
 else nets[k++] = staticNet(cand, cache, x * 20 + d * 2 + 1);
 }
 for (let pass = 0;
 pass < 2;
 pass++)for (let i = 0;
 i < net.count;
 i++) {
 let t = net.order[i];
 if ((t & 1) == pass)continue;
 if (!worth(cand, t))continue;
 let cx = 0;
 let all = true;
 for (let o of nets) {
 if (!o.has[t]) {
 all = false;
 break;
 }
 cx += o.ancestors(t);
 }
 if (!all)continue;
 let key = lengthBonus(cx - 2) * 100000 + cx * 10 + 6;
 if (key < best) {
 best = key;
 bestNets = nets;
 bestNodes = where;
 bestTarget = t;
 bestUnit = u;
 bestDigit = d;
 bestCell = - 1;
 }
 }
 }
 }
 if (!cellOk)continue;
 let first = null;
 for (let d = 1;
 d <= 9;
 d++)if (byValue[d] != null) {
 first = byValue[d];
 break;
 }
 for (let pass = 0;
 pass < 2;
 pass++)for (let i = 0;
 i < first.count;
 i++) {
 let t = first.order[i];
 if ((t & 1) == pass)continue;
 if (!worth(cand, t))continue;
 let cx = 0;
 let all = true;
 for (let d = 1;
 d <= 9;
 d++)if (byValue[d] != null) {
 if (!byValue[d].has[t]) {
 all = false;
 break;
 }
 cx += byValue[d].ancestors(t);
 }
 if (!all)continue;
 let key = lengthBonus(cx - 2) * 100000 + cx * 10 + 5;
 if (key < best) {
 best = key;
 bestTarget = t;
 bestCell = c;
 bestUnit = - 1;
 bestDigit = 0;
 let ns = new ArrayList();
 let ws = new ArrayList();
 for (let d = 1;
 d <= 9;
 d++)if (byValue[d] != null) {
 ns.add(byValue[d]);
 ws.add(c * 10 + d);
 }
 bestNets = ns.toArray(newArr(0, null));
 bestNodes = toArray(ws);
 }
 }
 }
 if (bestTarget < 0)return 0;
 let tc = Math.trunc(bestTarget / 20), td = Math.trunc((bestTarget % 20) / 2);
 let on = (bestTarget & 1) != 0;
 let b4 = snap(cand);
 if (on)cand[tc] = 1 << td;
 else cand[tc] &= ~(1 << td);
 let list = FIGS.get();
 if (list != null)for (let o of bestNets) {
 let p = o.path(bestTarget);
 let nodes = newArr(p.length, 0);
 let strong = newArr(Math.max(0, p.length - 1), false);
 for (let i = 0;
 i < p.length;
 i++)nodes[i] = (Math.trunc(p[i] / 20)) * 10 + Math.trunc((p[i] % 20) / 2);
 for (let i = 0;
 i + 1 < p.length;
 i++)strong[i] = (p[i] & 1) == 0;
 let n0 = list.size();
 let cells = bestCell >= 0 ? [bestCell] : bestNodes.slice();
 fig(b4, cand, F_FC, bestCell >= 0 ? 1 << (nodes[0] % 10) : 1 << bestDigit, cells, bestUnit >= 0 ? [bestUnit] : newArr(0, 0), - 1, 0);
 if (list.size() == n0)break;
 let f = list.get(list.size() - 1);
 f.chain = nodes;
 f.strong = strong;
 f.sub = bestCell >= 0 ? 0 : 1;
 f.target = tc * 10 + td;
 f.targetOn = on;
 }
 let se = 80 + Math.trunc(best / 100000);
 return bestCell >= 0 ? se : se + REGION;

}
function staticNet(cand, cache, start) {
if (cache[start] == null) {
 let n = new Net(cand, false, false);
 n.run(start);
 cache[start] = n;
 }
 return cache[start];

}
function worth(cand, n) {
let c = Math.trunc(n / 20), d = Math.trunc((n % 20) / 2);
 if ((n & 1) != 0)return (cand[c] & ~(1 << d)) != 0 && (cand[c] & (1 << d)) != 0;
 return (cand[c] & (1 << d)) != 0;

}
let TRAIN_IDS = ["hidden", "naked", "locked", "subsets", "triples", "fish", "swordfish", "xywing", "skyscraper", "xyzwing", "wwing", "erect", "urect", "xchain", "mwing", "swing", "xychain", "finned", "bug", "urect2", "urect3", "urect4", "kite", "finswordfish", "dlocked", "dpair", "dtriple", "nquad", "hquad", "jellyfish", "ring", "aic", "uloop", "uloop2", "uloop3", "uloop4", "bug2", "bug3", "bug4", "ape", "ate", "nishio", "cellfc", "regionfc"];
function subsetsPass(val, cand, size, hidden) {
for (let u = 0;
 u < 27;
 u++) {
 let changed = false;
 let e = newArr(9, 0);
 let m = 0;
 for (let c of UNITS[u])if (val[c] == 0)e[m++] = c;
 if (!hidden) {
 for (let i = 0;
 i < m;
 i++)for (let j = i + 1;
 j < m;
 j++) {
 let un = cand[e[i]] | cand[e[j]];
 if (size == 2) {
 if (Integer.bitCount(un) == 2) {
 let b4 = snap(cand);
 changed |= eliminate(cand, e, m, un, i, j, - 1);
 fig(b4, cand, F_NAKED, un, [e[i], e[j]], [u], - 1, 0);
 }
 continue;
 }
 for (let k = j + 1;
 k < m;
 k++) {
 let un3 = un | cand[e[k]];
 if (Integer.bitCount(un3) == 3) {
 let b4 = snap(cand);
 changed |= eliminate(cand, e, m, un3, i, j, k);
 fig(b4, cand, F_NAKED, un3, [e[i], e[j], e[k]], [u], - 1, 0);
 }
 }
 }
 }
 else {
 let pos = newArr(10, 0);
 let ds = newArr(9, 0);
 let nd = 0;
 for (let d = 1;
 d <= 9;
 d++) {
 for (let i = 0;
 i < m;
 i++)if ((cand[e[i]] & (1 << d)) != 0)pos[d] |= 1 << i;
 if (pos[d] != 0)ds[nd++] = d;
 }
 for (let a = 0;
 a < nd;
 a++)for (let b = a + 1;
 b < nd;
 b++) {
 let pu = pos[ds[a]] | pos[ds[b]];
 let keep2 = (1 << ds[a]) | (1 << ds[b]);
 if (size == 2) {
 if (Integer.bitCount(pu) == 2) {
 let b4 = snap(cand);
 changed |= restrict(cand, e, m, pu, keep2);
 fig(b4, cand, F_HIDDEN, keep2, cellsOf(e, pu), [u], - 1, 0);
 }
 continue;
 }
 for (let c = b + 1;
 c < nd;
 c++) {
 let pu3 = pu | pos[ds[c]];
 let keep3 = keep2 | (1 << ds[c]);
 if (Integer.bitCount(pu3) == 3) {
 let b4 = snap(cand);
 changed |= restrict(cand, e, m, pu3, keep3);
 fig(b4, cand, F_HIDDEN, keep3, cellsOf(e, pu3), [u], - 1, 0);
 }
 }
 }
 }
 if (changed)return true;
 }
 return false;

}
let TRAIN_ATOMS = [[], [], [3], [4, 6], [7, 9], [5], [8], [10], [20], [11], [26], [22], [12], [25], [27], [28], [29], [23], [19], [14], [15], [13], [21], [24], [0], [1], [2], [16], [18], [17], [A_RING], [A_AIC], [32], [33], [35], [34], [36], [38], [37], [39], [A_ATE], [A_NISHIO], [A_MULTI], [A_REGION]];
function any(b) {
for (let x of b)if (x)return true;
 return false;

}
function countEmpty(v) {
let n = 0;
 for (let x of v)if (x == 0)n++;
 return n;

}
let lastSteps = 0;
window.SX = {
  hint: function (values, solution) { return hint(values, solution, null); },
  grade: grade,
  /** SE in tenths (BOUND + the rating so far — out of time); then steps() — key moves (a + 1000·b + 1000000·c). */
  seRating: function (puzzle, millis) { const R = rate(puzzle, millis); lastSteps = R.keySteps(); return R.se; },
  steps: function () { return lastSteps; },
  LEVELS: LEVELS, countSolutions: countSolutions, T_HIDDEN: T_HIDDEN, T_NAKED: T_NAKED, T_HARDER: T_HARDER,
  PEERS: PEERS, UNITS: UNITS, CELL_UNITS: CELL_UNITS, isPeer: isPeer
};
})();
