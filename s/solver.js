/* Sudoku solver of the game Sudoky (ported from Sudoku.java): hints and the solution. */
(function () {
function bitCount(x){x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0F0F0F0F)*0x01010101)>>>24;}
function ntz(x){if(x===0)return 32;let n=0;while(!(x&1)){x>>>=1;n++;}return n;}
    const UNITS = Array.from({length:27},()=>new Array(9).fill(0));
    const PEERS = Array.from({length:81},()=>new Array(20).fill(0));
    const CELL_UNITS = Array.from({length:81},()=>new Array(3).fill(0));

    {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                UNITS[i][j] = i * 9 + j;              // rows
                UNITS[9 + i][j] = j * 9 + i;          // cols
                let br = (Math.floor(i / 3)) * 3, bc = (i % 3) * 3;
                UNITS[18 + i][j] = (br + Math.floor(j / 3)) * 9 + bc + j % 3; // boxes
            }
        }
        for (let c = 0; c < 81; c++) {
            let r = Math.floor(c / 9), col = c % 9, b = (Math.floor(r / 3)) * 3 + Math.floor(col / 3);
            CELL_UNITS[c][0] = r;
            CELL_UNITS[c][1] = 9 + col;
            CELL_UNITS[c][2] = 18 + b;
            let n = 0;
            for (let o = 0; o < 81; o++) {
                if (o == c) continue;
                let r2 = Math.floor(o / 9), c2 = o % 9, b2 = (Math.floor(r2 / 3)) * 3 + Math.floor(c2 / 3);
                if (r2 == r || c2 == col || b2 == b) PEERS[c][n++] = o;
            }
        }
    }

    function isPeer(a, b) {
        if (a == b) return false;
        let ra = Math.floor(a / 9), ca = a % 9, rb = Math.floor(b / 9), cb = b % 9;
        return ra == rb || ca == cb || ((Math.floor(ra / 3)) == (Math.floor(rb / 3)) && (Math.floor(ca / 3)) == (Math.floor(cb / 3)));
    }

    // ---------------------------------------------------------------- solver

    /** Counts solutions up to limit. If out != null and a solution is found, the first one is written there. */
    function countSolutions(grid, limit, out) {
        let g = grid.slice();
        let rows = new Array(9).fill(0), cols = new Array(9).fill(0), boxes = new Array(9).fill(0);
        for (let c = 0; c < 81; c++) {
            let v = g[c];
            if (v != 0) {
                let bit = 1 << v, r = Math.floor(c / 9), col = c % 9, b = (Math.floor(r / 3)) * 3 + Math.floor(col / 3);
                if ((rows[r] & bit) != 0 || (cols[col] & bit) != 0 || (boxes[b] & bit) != 0) return 0;
                rows[r] |= bit; cols[col] |= bit; boxes[b] |= bit;
            }
        }
        let cnt = [0];
        solve(g, rows, cols, boxes, limit, cnt, out, null);
        return cnt[0];
    }

    function solve(g, rows, cols, boxes, limit, cnt, out, rnd) {
        let best = -1, bestMask = 0, bestCount = 10;
        for (let c = 0; c < 81; c++) {
            if (g[c] != 0) continue;
            let r = Math.floor(c / 9), col = c % 9, b = (Math.floor(r / 3)) * 3 + Math.floor(col / 3);
            let mask = ~(rows[r] | cols[col] | boxes[b]) & 0x3FE;
            let n = bitCount(mask);
            if (n < bestCount) { best = c; bestMask = mask; bestCount = n; if (n <= 1) break; }
        }
        if (best == -1) {
            if (cnt[0] == 0 && out != null) for (let q = 0; q < 81; q++) out[q] = g[q];
            cnt[0]++;
            return cnt[0] >= limit;
        }
        if (bestCount == 0) return false;
        let r = Math.floor(best / 9), col = best % 9, b = (Math.floor(r / 3)) * 3 + Math.floor(col / 3);
        let digits = new Array(9).fill(0);
        let nd = 0;
        for (let d = 1; d <= 9; d++) if ((bestMask & (1 << d)) != 0) digits[nd++] = d;
        if (rnd != null) {
            for (let i = nd - 1; i > 0; i--) { let j = rnd.nextInt(i + 1); let t = digits[i]; digits[i] = digits[j]; digits[j] = t; }
        }
        for (let i = 0; i < nd; i++) {
            let d = digits[i], bit = 1 << d;
            g[best] = d; rows[r] |= bit; cols[col] |= bit; boxes[b] |= bit;
            if (solve(g, rows, cols, boxes, limit, cnt, out, rnd)) return true;
            g[best] = 0; rows[r] &= ~bit; cols[col] &= ~bit; boxes[b] &= ~bit;
        }
        return false;
    }

    const T_HIDDEN = 1, T_NAKED = 2, T_SUBSETS = 3, T_FISH = 4, T_WINGS = 5, T_ADVANCED = 6, T_HARDER = 7, T_INVALID = 8;

    /** Technique codes beyond singles (W_* numbers plus the basic ones). */
    const W_LOCKED = 15, W_PAIRS = 16, W_TRIPLES = 17, W_HIDDEN = 18, W_NAKED = 19;

    /** Tier of each technique code. */
    const TIER_OF = [0, T_FISH, T_FISH, T_FISH, T_WINGS, T_WINGS, T_WINGS, T_ADVANCED, T_ADVANCED, T_ADVANCED,
            T_ADVANCED, T_ADVANCED, T_ADVANCED, T_WINGS, T_ADVANCED, T_NAKED, T_SUBSETS, T_SUBSETS, T_HIDDEN, T_NAKED,
            T_WINGS, T_ADVANCED, T_ADVANCED, T_HARDER];

    /** Approximate Sudoku Explainer rating of each technique code (tenths). */
    // ordered by our levels: Сложный ≤ 4,0, Эксперт ≤ 4,6, Мастер 4,5–6,9; chains rise with their length (see chainSe)
    const SE_OF = [0, 32, 40, 38, 42, 44, 44, 50, 45, 52, 52, 54, 50, 46, 56, 26, 30, 36, 15, 23, 41, 48, 65, 70];

    /** Length of the chain found by the last xChain (links) / xyChain (cells), per thread. */
    const CHAIN = new Array(1).fill(0);

    /**
     * The variant of the last locked / pairs / triples / unique-rectangle step (per thread), rated as
     * Sudoku Explainer does: pointing 2,6 · claiming 2,8; naked pair 3,0 · hidden 3,4; naked triple 3,6 ·
     * hidden 4,0; unique rectangle type 1 and 4 — 4,5, type 2 — 4,6, type 3 — 4,6 (with a pair) or 4,7
     * (with a triple).
     */
    const VARIANT_SE = new Array(1).fill(0);

    /** SE of one step: chains get more for every extra link, up to 6,9; variants as in VARIANT_SE. */
    function stepSe(w) {
        if (w == W_LOCKED || w == W_PAIRS || w == W_TRIPLES || w == W_UNIQUERECT) {
            let v = VARIANT_SE[0];
            if (v > 0) return v;
        }
        let n = CHAIN[0];
        if (w == W_XCHAIN) return Math.min(69, 52 + 2 * Math.max(0, n - 3));       // 3 links 5,2 · 5 → 5,6 · 7 → 6,0 …
        if (w == W_XYCHAIN) return Math.min(69, 50 + 4 * Math.max(0, n - 3));      // 3 cells 5,0 · 4 → 5,4 · 5 → 5,8 …
        if (w == W_RING || w == W_AIC) return (ALT[1] === 1 ? 70 : w == W_RING ? 65 : 66) + lengthBonus(ALT[0]);
        return SE_OF[w];
    }

    /**
     * Applies the simplest elimination technique (anything but singles) that works, in the order of
     * the levels; returns its code, 0 if none.
     */
    function step(val, cand, chains) {
        if (chains === undefined) chains = true;
        if (locked(cand)) return W_LOCKED;
        if (subsetsN(val, cand, 2)) return W_PAIRS;
        if (subsetsN(val, cand, 3)) return W_TRIPLES;
        if (fish(val, cand, 2)) return W_XWING;
        if (skyscraper(val, cand)) return W_SKYSCRAPER;
        if (fish(val, cand, 3)) return W_SWORDFISH;
        if (kite(val, cand)) return W_KITE;
        if (xyWing(val, cand)) return W_XYWING;
        if (xyzWing(val, cand)) return W_XYZWING;
        if (wWing(val, cand)) return W_WWING;
        if (finnedFish(val, cand, 2)) return W_FINNED;
        if (finnedFish(val, cand, 3)) return W_FINNEDSWORD;
        if (wing3(val, cand, 1)) return W_MWING;
        if (wing3(val, cand, 2)) return W_SWING;
        if (emptyRectangle(val, cand)) return W_EMPTYRECT;
        if (uniqueRectangle(val, cand)) { UR_TYPE[0] = 1; VARIANT_SE[0] = 45; return W_UNIQUERECT; }
        for (let ty = 2; ty <= 4; ty++) if (urType(val, cand, ty)) {
            UR_TYPE[0] = ty;
            VARIANT_SE[0] = ty == 2 ? 46 : ty == 3 ? 45 + UR3_SUBSET[0] : 45;
            return W_UNIQUERECT;
        }
        if (bugPlusOne(val, cand)) return W_BUG;
        if (xChain(val, cand)) return W_XCHAIN;
        if (xyChain(val, cand)) return W_XYCHAIN;
        if (chains) { var aw = altChain(val, cand); if (aw > 0) return aw; }
        return 0;
    }

    function lengthBonus(nodes) {
        var added = 0, ceil = 4, odd = false;
        while (nodes > ceil) { added++; ceil = odd ? Math.floor(ceil * 4 / 3) : Math.floor(ceil * 3 / 2); odd = !odd; }
        return added;
    }

    const W_RING = 22, W_AIC = 23;
    const ALT = [0, 0];

    /** Ring («Мастер») or alternating chain (AIC, «Гроссмейстер»), as Sudoku.java altChain. */
    function altChain(val, cand) {
        var bestRing = Infinity, bestAic = Infinity, ringEl = null, aicEl = null, ringMixed = 0, aicMixed = 0;
        var par = new Int32Array(1620), dist = new Int32Array(1620), qu = new Int32Array(1620), path = new Int32Array(1620);
        for (var sc = 0; sc < 81; sc++) {
            if (val[sc] !== 0) continue;
            for (var sd = 1; sd <= 9; sd++) {
                if ((cand[sc] & (1 << sd)) === 0) continue;
                var s = sc * 10 + sd;
                par.fill(-2);
                var head = 0, tail = 0;
                par[s * 2] = -1; dist[s * 2] = 0; qu[tail++] = s * 2;
                while (head < tail) {
                    var st = qu[head++], nd = st >> 1, c = Math.floor(nd / 10), d = nd % 10;
                    var dn = dist[st] + 1, m;
                    if (dn >= bestRing && dn >= bestAic) break;
                    if ((st & 1) === 0) {
                        if (bitCount(cand[c]) === 2) {
                            var o = ntz(cand[c] & ~(1 << d));
                            m = (c * 10 + o) * 2 + 1;
                            if (par[m] === -2) { par[m] = st; dist[m] = dn; qu[tail++] = m; }
                        }
                        for (var u of CELL_UNITS[c]) {
                            var other = -1, k = 0;
                            for (var q of UNITS[u]) if (val[q] === 0 && (cand[q] & (1 << d)) !== 0) { k++; if (q !== c) other = q; }
                            if (k !== 2) continue;
                            m = (other * 10 + d) * 2 + 1;
                            if (par[m] === -2) { par[m] = st; dist[m] = dn; qu[tail++] = m; }
                        }
                    } else {
                        for (var o2 = 1; o2 <= 9; o2++) {
                            if (o2 === d || (cand[c] & (1 << o2)) === 0) continue;
                            m = (c * 10 + o2) * 2;
                            if (par[m] === -2) { par[m] = st; dist[m] = dn; qu[tail++] = m; }
                        }
                        for (var q2 of PEERS[c]) {
                            if (val[q2] !== 0 || (cand[q2] & (1 << d)) === 0) continue;
                            m = (q2 * 10 + d) * 2;
                            if (par[m] === -2) { par[m] = st; dist[m] = dn; qu[tail++] = m; }
                        }
                    }
                }
                for (var i = 0; i < tail; i++) {
                    var st2 = qu[i];
                    if ((st2 & 1) === 0) continue;
                    var len = dist[st2] + 1;
                    if (len < 4 || (len >= bestRing && len >= bestAic)) continue;
                    var t = st2 >> 1, kk = 0;
                    for (var x = st2; x >= 0; x = par[x]) path[kk++] = x;
                    var distinct = true;
                    for (var a = 0; a < kk && distinct; a++) for (var b = a + 1; b < kk; b++) if ((path[a] >> 1) === (path[b] >> 1)) { distinct = false; break; }
                    if (!distinct) continue;
                    var cellL = false, houseL = false;
                    for (a = 0; a + 1 < kk; a++) if ((path[a] & 1) === 1) { if (Math.floor((path[a] >> 1) / 10) === Math.floor((path[a + 1] >> 1) / 10)) cellL = true; else houseL = true; }
                    var tc = Math.floor(t / 10), td = t % 10;
                    var closes = t !== s && ((tc === sc && td !== sd) || (td === sd && isPeer(tc, sc)));
                    var el;
                    if (closes && len < bestRing) {
                        el = [];
                        for (a = 0; a + 1 < kk; a++) if ((path[a] & 1) === 0) weakElims(val, cand, path[a] >> 1, path[a + 1] >> 1, el);
                        weakElims(val, cand, t, s, el);
                        if (el.length) { bestRing = len; ringEl = el; ringMixed = cellL && houseL ? 1 : 0; }
                    }
                    if (len < bestAic) {
                        el = [];
                        if (t === s) { for (var o3 = 1; o3 <= 9; o3++) if (o3 !== sd && (cand[sc] & (1 << o3)) !== 0) el.push(sc * 10 + o3); }
                        else if (tc === sc) { for (o3 = 1; o3 <= 9; o3++) if (o3 !== sd && o3 !== td && (cand[sc] & (1 << o3)) !== 0) el.push(sc * 10 + o3); }
                        else if (td === sd) { for (var q3 = 0; q3 < 81; q3++) if (q3 !== sc && q3 !== tc && val[q3] === 0 && (cand[q3] & (1 << sd)) !== 0 && isPeer(q3, sc) && isPeer(q3, tc)) el.push(q3 * 10 + sd); }
                        else if (isPeer(tc, sc)) {
                            if ((cand[tc] & (1 << sd)) !== 0) el.push(tc * 10 + sd);
                            if ((cand[sc] & (1 << td)) !== 0) el.push(sc * 10 + td);
                        }
                        if (el.length) { bestAic = len; aicEl = el; aicMixed = cellL && houseL ? 1 : 0; }
                    }
                }
            }
        }
        var e2;
        if (aicEl && !ringEl) {
            for (e2 of aicEl) cand[Math.floor(e2 / 10)] &= ~(1 << (e2 % 10));
            ALT[0] = bestAic; ALT[1] = aicMixed;
            return W_AIC;
        }
        if (ringEl) {
            for (e2 of ringEl) cand[Math.floor(e2 / 10)] &= ~(1 << (e2 % 10));
            ALT[0] = bestRing; ALT[1] = ringMixed;
            return W_RING;
        }
        return 0;
    }

    function weakElims(val, cand, u, v, el) {
        var uc = Math.floor(u / 10), ud = u % 10, vc = Math.floor(v / 10), vd = v % 10;
        if (uc === vc) {
            for (var o = 1; o <= 9; o++) if (o !== ud && o !== vd && (cand[uc] & (1 << o)) !== 0 && el.indexOf(uc * 10 + o) < 0) el.push(uc * 10 + o);
        } else if (ud === vd) {
            for (var q = 0; q < 81; q++)
                if (q !== uc && q !== vc && val[q] === 0 && (cand[q] & (1 << ud)) !== 0 && isPeer(q, uc) && isPeer(q, vc) && el.indexOf(q * 10 + ud) < 0) el.push(q * 10 + ud);
        }
    }

    /**
     * Logical solve, always using the simplest available technique first.
     * Returns {maxTierUsed, placements, state} where state: 0 solved, 1 stuck, 2 contradiction.
     */
    function contradiction(val, cand) {
        for (let c = 0; c < 81; c++) if (val[c] == 0 && cand[c] == 0) return true;
        for (let u = 0; u < 27; u++) {
            let seen = 0, possible = 0;
            for (const c of UNITS[u]) {
                if (val[c] != 0) {
                    let bit = 1 << val[c];
                    if ((seen & bit) != 0) return true;
                    seen |= bit;
                } else possible |= cand[c];
            }
            if (((seen | possible) & 0x3FE) != 0x3FE) return true;
        }
        return false;
    }

    function place(val, cand, c, d) {
        val[c] = d;
        cand[c] = 0;
        for (const p of PEERS[c]) cand[p] &= ~(1 << d);
    }

    function hiddenSingles(val, cand) { return hiddenSinglesIn(val, cand, 0, 27); }

    /** Hidden singles in units from..to-1 (rows 0–8, columns 9–17, boxes 18–26). */
    function hiddenSinglesIn(val, cand, from, to) {
        let placed = 0;
        for (let u = from; u < to; u++) {
            for (let d = 1; d <= 9; d++) {
                let bit = 1 << d, where = -1, n = 0;
                for (const c of UNITS[u]) if ((cand[c] & bit) != 0) { n++; where = c; }
                if (n == 1 && val[where] == 0) { place(val, cand, where, d); placed++; }
            }
        }
        return placed;
    }

    function nakedSingles(val, cand) {
        let placed = 0;
        for (let c = 0; c < 81; c++) {
            if (val[c] == 0 && bitCount(cand[c]) == 1) {
                place(val, cand, c, ntz(cand[c]));
                placed++;
            }
        }
        return placed;
    }

    /** Pointing and claiming. */
    function locked(cand) {
        if (lockedPass(cand, true)) { VARIANT_SE[0] = 26; return true; }    // pointing: from a box onto a line
        if (lockedPass(cand, false)) { VARIANT_SE[0] = 28; return true; }   // claiming: from a line into a box
        return false;
    }

    function lockedPass(cand, pointing) {
        let changed = false;
        for (let u = pointing ? 18 : 0; u < (pointing ? 27 : 18); u++) {
            for (let d = 1; d <= 9; d++) {
                let bit = 1 << d;
                let cells = new Array(9).fill(0);
                let n = 0;
                for (const c of UNITS[u]) if ((cand[c] & bit) != 0) cells[n++] = c;
                if (n < 2) continue;
                for (let k = 0; k < 3; k++) {
                    let other = CELL_UNITS[cells[0]][k];
                    if (other == u) continue;
                    let all = true;
                    for (let i = 1; i < n; i++) if (CELL_UNITS[cells[i]][k] != other) { all = false; break; }
                    if (!all) continue;
                    for (const c of UNITS[other]) {
                        if (CELL_UNITS[c][Math.floor(u / 9)] == u) continue;
                        if ((cand[c] & bit) != 0) { cand[c] &= ~bit; changed = true; }
                    }
                }
            }
        }
        return changed;
    }

    /** Naked and hidden pairs and triples. */
    function subsets(val, cand) {
        let changed = false;
        for (let u = 0; u < 27; u++) {
            let e = new Array(9).fill(0);
            let m = 0;
            for (const c of UNITS[u]) if (val[c] == 0) e[m++] = c;
            // naked
            for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) {
                let un = cand[e[i]] | cand[e[j]];
                if (bitCount(un) == 2) changed |= eliminate(cand, e, m, un, i, j, -1);
                for (let k = j + 1; k < m; k++) {
                    let un3 = un | cand[e[k]];
                    if (bitCount(un3) == 3) changed |= eliminate(cand, e, m, un3, i, j, k);
                }
            }
            // hidden
            let pos = new Array(10).fill(0);
            let ds = new Array(9).fill(0);
            let nd = 0;
            for (let d = 1; d <= 9; d++) {
                for (let i = 0; i < m; i++) if ((cand[e[i]] & (1 << d)) != 0) pos[d] |= 1 << i;
                if (pos[d] != 0) ds[nd++] = d;
            }
            for (let a = 0; a < nd; a++) for (let b = a + 1; b < nd; b++) {
                let pu = pos[ds[a]] | pos[ds[b]];
                let keep2 = (1 << ds[a]) | (1 << ds[b]);
                if (bitCount(pu) == 2) changed |= restrict(cand, e, m, pu, keep2);
                for (let c = b + 1; c < nd; c++) {
                    let pu3 = pu | pos[ds[c]];
                    if (bitCount(pu3) == 3) changed |= restrict(cand, e, m, pu3, keep2 | (1 << ds[c]));
                }
            }
            if (changed) return true;
        }
        return false;
    }

    /** X-wing (n=2) and swordfish (n=3), row- and column-based. */
    function fish(val, cand, n) {
        let changed = false;
        for (let d = 1; d <= 9; d++) {
            let bit = 1 << d;
            for (let orient = 0; orient < 2; orient++) {
                let m = new Array(9).fill(0); // positions of d in base line i, as mask over cover lines
                for (let i = 0; i < 9; i++)
                    for (let j = 0; j < 9; j++) {
                        let c = orient == 0 ? i * 9 + j : j * 9 + i;
                        if (val[c] == 0 && (cand[c] & bit) != 0) m[i] |= 1 << j;
                    }
                for (let a = 0; a < 9; a++) {
                    let ca = bitCount(m[a]);
                    if (ca < 2 || ca > n) continue;
                    for (let b = a + 1; b < 9; b++) {
                        let cb = bitCount(m[b]);
                        if (cb < 2 || cb > n) continue;
                        let u2 = m[a] | m[b];
                        if (n == 2) {
                            if (bitCount(u2) == 2) changed |= fishEliminate(val, cand, bit, orient, u2, (1 << a) | (1 << b));
                            continue;
                        }
                        if (bitCount(u2) > 3) continue;
                        for (let e = b + 1; e < 9; e++) {
                            let ce = bitCount(m[e]);
                            if (ce < 2 || ce > 3) continue;
                            let u3 = u2 | m[e];
                            if (bitCount(u3) == 3) changed |= fishEliminate(val, cand, bit, orient, u3, (1 << a) | (1 << b) | (1 << e));
                        }
                    }
                }
                if (changed) return true;
            }
        }
        return false;
    }

    function fishEliminate(val, cand, bit, orient, cover, base) {
        let ch = false;
        for (let j = 0; j < 9; j++) {
            if ((cover & (1 << j)) == 0) continue;
            for (let i = 0; i < 9; i++) {
                if ((base & (1 << i)) != 0) continue;
                let c = orient == 0 ? i * 9 + j : j * 9 + i;
                if (val[c] == 0 && (cand[c] & bit) != 0) { cand[c] &= ~bit; ch = true; }
            }
        }
        return ch;
    }

    /** XY-wing: pivot {x,y}, pincers {x,z} and {y,z} seen by the pivot; z is removed from cells seeing both pincers. */
    function xyWing(val, cand) {
        for (let pv = 0; pv < 81; pv++) {
            let pm = cand[pv];
            if (val[pv] != 0 || bitCount(pm) != 2) continue;
            for (let i = 0; i < 20; i++) {
                let a = PEERS[pv][i], am = cand[a];
                if (val[a] != 0 || bitCount(am) != 2 || am == pm || bitCount(am & pm) != 1) continue;
                for (let j = i + 1; j < 20; j++) {
                    let b = PEERS[pv][j], bm = cand[b];
                    if (val[b] != 0 || bitCount(bm) != 2 || bm == pm || bm == am || bitCount(bm & pm) != 1) continue;
                    let z = am & bm;
                    if (bitCount(z) != 1 || (z & pm) != 0) continue;
                    if (((am | bm) & ~z) != pm) continue;
                    let ch = false;
                    for (let c = 0; c < 81; c++) {
                        if (c == a || c == b || c == pv || val[c] != 0 || (cand[c] & z) == 0) continue;
                        if (isPeer(c, a) && isPeer(c, b)) { cand[c] &= ~z; ch = true; }
                    }
                    if (ch) return true;
                }
            }
        }
        return false;
    }

    /** Tier-5 techniques, simplest first. */
    const W_XWING = 1, W_SKYSCRAPER = 2, W_SWORDFISH = 3, W_XYWING = 4, W_XYZWING = 5, W_WWING = 6,
            W_MWING = 10, W_SWING = 11, W_FINNED = 13, W_BUG = 14, W_KITE = 20, W_FINNEDSWORD = 21;

    /**
     * Воздушный змей (2-String Kite): a digit has two places in a row and two in a column; one end of the row
     * and one end of the column are in the same box (different cells). One of the two other ends holds the
     * digit, so it leaves the cell that sees both of them (in the row of one and the column of the other).
     */
    function kite(val, cand) {
        for (let d = 1; d <= 9; d++) {
            let bit = 1 << d;
            for (let r = 0; r < 9; r++) {
                let rc = two(val, cand, bit, UNITS[r]);
                if (rc == null) continue;
                for (let c = 0; c < 9; c++) {
                    let cc = two(val, cand, bit, UNITS[9 + c]);
                    if (cc == null) continue;
                    for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) {
                        let a = rc[x], b = cc[y], ra = rc[1 - x], cb = cc[1 - y];   // a, b — in one box; ra, cb — the free ends
                        if (a == b || ra == cb || ra == b || cb == a || boxOf(a) != boxOf(b)) continue;
                        if (boxOf(ra) == boxOf(a) || boxOf(cb) == boxOf(a)) continue;
                        let target = (Math.floor(cb / 9)) * 9 + ra % 9;
                        if (target == ra || target == cb || val[target] != 0 || (cand[target] & bit) == 0) continue;
                        cand[target] &= ~bit;
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function boxOf(c) { return (Math.floor(c / 27)) * 3 + Math.floor((c % 9) / 3); }

    /** The two cells of a unit where the digit can go, or null if there are not exactly two. */
    function two(val, cand, bit, unit) {
        let a = -1, b = -1, n = 0;
        for (const c of unit) if (val[c] == 0 && (cand[c] & bit) != 0) { if (n == 0) a = c; else b = c; if (++n > 2) return null; }
        return n == 2 ? [a, b] : null;
    }

    /** Tier-6 techniques («Мастер»): numbered after the tier-5 ones, for hints. */
    /** Type (1–4) of the unique rectangle found by the last step() on this thread. */
    /** Type 3: how many other cells joined the roof in its naked subset (per thread). */
    const UR3_SUBSET = new Array(1).fill(0);
    const UR_TYPE = [1];
    /** Bit in lastUsed() for a unique rectangle of type 1–4 (beside W_UNIQUERECT itself). */
    function urBit(type) { return 24 + type; }
    const W_EMPTYRECT = 7, W_UNIQUERECT = 8, W_XCHAIN = 9, W_XYCHAIN = 12;

    /**
     * Empty rectangle: in a box all candidates of d lie on one row R and one column C (an «L» or a
     * cross). If in a row R2 outside the band d has only two places, (R2, C) and (R2, X), then d is
     * removed from (R, X): either (R2, X) is d, or (R2, C) is, and then the box's d is on row R.
     * Rows and columns may be swapped.
     */
    function emptyRectangle(val, cand) {
        for (let d = 1; d <= 9; d++) {
            let bit = 1 << d;
            for (let box = 0; box < 9; box++) {
                let br = (Math.floor(box / 3)) * 3, bc = (box % 3) * 3;
                let cnt = 0, rows = 0, cols = 0;
                for (let i = 0; i < 9; i++) {
                    let c = (br + Math.floor(i / 3)) * 9 + bc + i % 3;
                    if (val[c] == 0 && (cand[c] & bit) != 0) { cnt++; rows |= 1 << (Math.floor(c / 9)); cols |= 1 << (c % 9); }
                }
                if (cnt < 2 || bitCount(rows) < 2 || bitCount(cols) < 2) continue;
                for (let R = br; R < br + 3; R++) for (let C = bc; C < bc + 3; C++) {
                    // every candidate of the box on row R or column C, and some off the hinge on each
                    let fits = true, offRow = false, offCol = false;
                    for (let i = 0; i < 9; i++) {
                        let c = (br + Math.floor(i / 3)) * 9 + bc + i % 3;
                        if (val[c] != 0 || (cand[c] & bit) == 0) continue;
                        let r = Math.floor(c / 9), cc = c % 9;
                        if (r != R && cc != C) { fits = false; break; }
                        if (r == R && cc != C) offCol = true;
                        if (cc == C && r != R) offRow = true;
                    }
                    if (!fits || !offRow || !offCol) continue;
                    // column C outside the box: a row R2 (outside the band) with d only at (R2, C) and (R2, X)
                    for (let R2 = 0; R2 < 9; R2++) {
                        if (Math.floor(R2 / 3) == Math.floor(R / 3) || val[R2 * 9 + C] != 0 || (cand[R2 * 9 + C] & bit) == 0) continue;
                        let X = -1, n = 0;
                        for (let j = 0; j < 9; j++) { let c = R2 * 9 + j; if (val[c] == 0 && (cand[c] & bit) != 0) { n++; if (j != C) X = j; } }
                        if (n != 2 || Math.floor(X / 3) == Math.floor(C / 3)) continue;
                        let t = R * 9 + X;
                        if (val[t] == 0 && (cand[t] & bit) != 0) { cand[t] &= ~bit; return true; }
                    }
                    // the same with rows and columns swapped: a column C2 with d only at (R, C2) and (Y, C2)
                    for (let C2 = 0; C2 < 9; C2++) {
                        if (Math.floor(C2 / 3) == Math.floor(C / 3) || val[R * 9 + C2] != 0 || (cand[R * 9 + C2] & bit) == 0) continue;
                        let Y = -1, n = 0;
                        for (let i = 0; i < 9; i++) { let c = i * 9 + C2; if (val[c] == 0 && (cand[c] & bit) != 0) { n++; if (i != R) Y = i; } }
                        if (n != 2 || Math.floor(Y / 3) == Math.floor(R / 3)) continue;
                        let t = Y * 9 + C;
                        if (val[t] == 0 && (cand[t] & bit) != 0) { cand[t] &= ~bit; return true; }
                    }
                }
            }
        }
        return false;
    }

    /**
     * Unique rectangle, type 1: four empty cells in two rows, two columns and two boxes; three of
     * them hold exactly {a, b}. If the fourth were a or b too, the puzzle would have two solutions,
     * so a and b are removed from it.
     */
    function uniqueRectangle(val, cand) {
        for (let r1 = 0; r1 < 9; r1++) for (let r2 = r1 + 1; r2 < 9; r2++)
            for (let c1 = 0; c1 < 9; c1++) for (let c2 = c1 + 1; c2 < 9; c2++) {
                if ((Math.floor(r1 / 3) == Math.floor(r2 / 3)) == (Math.floor(c1 / 3) == Math.floor(c2 / 3))) continue;   // exactly two boxes
                let q = [r1 * 9 + c1, r1 * 9 + c2, r2 * 9 + c1, r2 * 9 + c2];
                let empty = true;
                for (const c of q) if (val[c] != 0) { empty = false; break; }
                if (!empty) continue;
                for (let k = 0; k < 4; k++) {
                    let m = -1, ok = 0;
                    for (let x = 0; x < 4; x++) {
                        if (x == k) continue;
                        if (bitCount(cand[q[x]]) != 2) break;
                        if (m == -1) m = cand[q[x]]; else if (cand[q[x]] != m) break;
                        ok++;
                    }
                    if (ok != 3) continue;
                    let f = q[k];
                    if ((cand[f] & m) == m && bitCount(cand[f]) > 2) { cand[f] &= ~m; return true; }
                }
            }
        return false;
    }

    /**
     * X-chain: candidates of one digit linked alternately by strong links (the only two places in a
     * unit) and weak links (cells seeing each other), starting and ending with a strong link. One of
     * the two ends holds the digit, so it is removed from cells seeing both ends.
     */
    function xChain(val, cand) {
        for (let d = 1; d <= 9; d++) {
            let bit = 1 << d;
            let has = new Array(81).fill(false);
            for (let c = 0; c < 81; c++) has[c] = val[c] == 0 && (cand[c] & bit) != 0;
            // strong links
            let strong = [];
            for (let u = 0; u < 27; u++) {
                let p = -1, q = -1, n = 0;
                for (const c of UNITS[u]) if (has[c]) { if (n == 0) p = c; else q = c; n++; }
                if (n == 2) strong.push([p, q]);
            }
            if (strong.length < 2) continue;
            for (let s = 0; s < 81; s++) {
                if (!has[s]) continue;
                // states: on[c] = «if s is not d, c is d» (reached by a strong link); off[c] = «… c is not d»
                let on = new Array(81).fill(false), off = new Array(81).fill(false);
                let dOn = new Array(81).fill(0), dOff = new Array(81).fill(0);
                let qu = [], qh = 0;   // a FIFO queue, as Java's ArrayDeque add/poll
                off[s] = true;
                qu.push(s);
                while (qh < qu.length) {
                    let x = qu[qh++];
                    let isOff = x >= 0;
                    let c = isOff ? x : -x - 1;
                    if (isOff) {
                        for (const l of strong) {
                            let o = l[0] == c ? l[1] : l[1] == c ? l[0] : -1;
                            if (o >= 0 && !on[o]) { on[o] = true; dOn[o] = dOff[c] + 1; qu.push(-o - 1); }
                        }
                    } else {
                        for (const o of PEERS[c]) if (has[o] && !off[o]) { off[o] = true; dOff[o] = dOn[c] + 1; qu.push(o); }
                    }
                }
                for (let t = 0; t < 81; t++) {
                    if (!on[t] || t == s || dOn[t] < 3) continue;   // length 1 is a plain strong link
                    if (seenByAll(val, cand, bit, s, t)) { CHAIN[0] = dOn[t]; return true; }
                }
            }
        }
        return false;
    }

    /**
     * Three-strong-link chains of candidates (cell, digit). Strong link: the only two places of a
     * digit in a unit («место»), or the two candidates of a bivalue cell («клетка»). Weak link: same
     * digit in cells that see each other, or two digits of one cell. n1 = n2 - n3 = n4 - n5 = n6
     * means n1 or n6 is true, so a candidate weakly linked to both ends is removed.
     * kind 1 = M-wing (cell, place, place — either way round), 2 = S-wing (place, cell, place).
     */
    function wing3(val, cand, kind) {
        let nodes = new Array(729).fill(0);
        let nn = 0;
        for (let c = 0; c < 81; c++) if (val[c] == 0) for (let d = 1; d <= 9; d++) if ((cand[c] & (1 << d)) != 0) nodes[nn++] = c * 10 + d;
        for (let i = 0; i < nn; i++) {
            let n1 = nodes[i];
            for (let t1 = 0; t1 < 2; t1++) {
                let s1 = strongOf(val, cand, n1, t1);
                for (const n2 of s1) for (const n3 of weakOf(val, cand, n2)) {
                    if (n3 == n1) continue;
                    for (let t2 = 0; t2 < 2; t2++) {
                        for (const n4 of strongOf(val, cand, n3, t2)) {
                            if (n4 == n1 || n4 == n2) continue;
                            for (const n5 of weakOf(val, cand, n4)) {
                                if (n5 == n1 || n5 == n2 || n5 == n3) continue;
                                for (let t3 = 0; t3 < 2; t3++) {
                                    let ok = kind == 1 ? ((t1 == 1 && t2 == 0 && t3 == 0) || (t1 == 0 && t2 == 0 && t3 == 1))
                                            : (t1 == 0 && t2 == 1 && t3 == 0);
                                    if (!ok) continue;
                                    for (const n6 of strongOf(val, cand, n5, t3)) {
                                        if (n6 == n1 || n6 == n2 || n6 == n3 || n6 == n4) continue;
                                        if (removeSeenByBoth(val, cand, n1, n6)) return true;
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

    /** Strong partners of node (cell*10+digit): type 0 = other place in a unit, 1 = other digit of a bivalue cell. */
    function strongOf(val, cand, node, type) {
        let c = Math.floor(node / 10), d = node % 10;
        if (type == 1) {
            if (bitCount(cand[c]) != 2) return new Array(0).fill(0);
            let o = ntz(cand[c] & ~(1 << d));
            return [c * 10 + o];
        }
        let out = new Array(3).fill(0);
        let k = 0;
        for (const u of CELL_UNITS[c]) {
            let other = -1, n = 0;
            for (const q of UNITS[u]) if (val[q] == 0 && (cand[q] & (1 << d)) != 0) { n++; if (q != c) other = q; }
            if (n == 2) {
                let on = other * 10 + d;
                let dup = false;
                for (let j = 0; j < k; j++) if (out[j] == on) dup = true;
                if (!dup) out[k++] = on;
            }
        }
        return out.slice(0, k);
    }

    /** Weak partners: same digit in a peer cell, or another digit of the same cell. */
    function weakOf(val, cand, node) {
        let c = Math.floor(node / 10), d = node % 10;
        let out = new Array(28).fill(0);
        let k = 0;
        for (let o = 1; o <= 9; o++) if (o != d && (cand[c] & (1 << o)) != 0) out[k++] = c * 10 + o;
        for (const q of PEERS[c]) if (val[q] == 0 && (cand[q] & (1 << d)) != 0) out[k++] = q * 10 + d;
        return out.slice(0, k);
    }

    function weakLinked(c, z, node) {
        let cn = Math.floor(node / 10), dn = node % 10;
        return (c == cn && z != dn) || (z == dn && isPeer(c, cn));
    }

    /** Removes every candidate weakly linked to both nodes. */
    function removeSeenByBoth(val, cand, a, b) {
        let ch = false;
        for (let c = 0; c < 81; c++) {
            if (val[c] != 0) continue;
            for (let z = 1; z <= 9; z++) {
                if ((cand[c] & (1 << z)) == 0) continue;
                let m = c * 10 + z;
                if (m == a || m == b) continue;
                if (weakLinked(c, z, a) && weakLinked(c, z, b)) { cand[c] &= ~(1 << z); ch = true; }
            }
        }
        return ch;
    }

    /**
     * XY-chain: cells with two candidates each, every next one seeing the previous and sharing a
     * digit with it, starting and ending with the same digit x. If the first cell is not x, the
     * last one is, so x is removed from cells seeing both ends. (XY-wing is the 3-cell case.)
     */
    function xyChain(val, cand) {
        for (let a = 0; a < 81; a++) {
            if (val[a] != 0 || bitCount(cand[a]) != 2) continue;
            for (let x = 1; x <= 9; x++) {
                if ((cand[a] & (1 << x)) == 0) continue;
                // off: «this cell is not d», on: «this cell is d» — node = cell*10+digit
                let on = new Array(810).fill(false), off = new Array(810).fill(false);
                let cells = new Array(810).fill(0);
                let qu = [], qh = 0;   // a FIFO queue, as Java's ArrayDeque add/poll
                off[a * 10 + x] = true;
                cells[a * 10 + x] = 1;
                qu.push(a * 10 + x);
                while (qh < qu.length) {
                    let st = qu[qh++];
                    let isOff = st < 810;
                    let nd = isOff ? st : st - 810, c = Math.floor(nd / 10), d = nd % 10;
                    if (isOff) {
                        let o = ntz(cand[c] & ~(1 << d));
                        let m = c * 10 + o;
                        if (!on[m]) { on[m] = true; cells[m] = cells[nd]; qu.push(m + 810); }
                    } else {
                        for (const q of PEERS[c]) {
                            if (val[q] != 0 || bitCount(cand[q]) != 2 || (cand[q] & (1 << d)) == 0) continue;
                            let m = q * 10 + d;
                            if (!off[m]) { off[m] = true; cells[m] = cells[nd] + 1; qu.push(m); }
                        }
                    }
                }
                for (let z = 0; z < 81; z++) {
                    let m = z * 10 + x;
                    if (z == a || !on[m] || cells[m] < 3) continue;
                    if (seenByAll(val, cand, 1 << x, a, z)) { CHAIN[0] = cells[m]; return true; }
                }
            }
        }
        return false;
    }

    /**
     * Finned fish (X-wing n=2, swordfish n=3; sashimi included): n-1 rows keep the digit inside n
     * columns, the last row also has extra cells («fin») all in one box. Without the fin it would
     * be an ordinary fish; with it the digit is in the fin's box. Either way the digit leaves the
     * cover columns inside the fin's box (outside the base rows). Rows and columns may be swapped.
     */
    function finnedFish(val, cand, n) {
        for (let d = 1; d <= 9; d++) {
            let bit = 1 << d;
            for (let orient = 0; orient < 2; orient++) {
                let m = new Array(9).fill(0);
                for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
                    let c = orient == 0 ? i * 9 + j : j * 9 + i;
                    if (val[c] == 0 && (cand[c] & bit) != 0) m[i] |= 1 << j;
                }
                for (let combo = 0; combo < 512; combo++) {
                    if (bitCount(combo) != n - 1) continue;
                    let cover = 0;
                    let okRows = true;
                    for (let i = 0; i < 9; i++) if ((combo & (1 << i)) != 0) {
                        let bc = bitCount(m[i]);
                        if (bc < 2 || bc > n) { okRows = false; break; }
                        cover |= m[i];
                    }
                    if (!okRows || bitCount(cover) != n) continue;
                    for (let f = 0; f < 9; f++) {
                        if ((combo & (1 << f)) != 0 || (m[f] & cover) == 0) continue;
                        let fins = m[f] & ~cover;
                        if (fins == 0) continue;
                        let stack = Math.floor(ntz(fins) / 3);
                        if ((fins & ~(7 << (stack * 3))) != 0) continue;   // all fins in one box
                        let base = combo | (1 << f);
                        let ch = false;
                        for (let k = stack * 3; k < stack * 3 + 3; k++) {
                            if ((cover & (1 << k)) == 0) continue;
                            for (let i = (Math.floor(f / 3)) * 3; i < (Math.floor(f / 3)) * 3 + 3; i++) {
                                if ((base & (1 << i)) != 0) continue;
                                let c = orient == 0 ? i * 9 + k : k * 9 + i;
                                if (val[c] == 0 && (cand[c] & bit) != 0) { cand[c] &= ~bit; ch = true; }
                            }
                        }
                        if (ch) return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Unique rectangle, types 2, 3 and 4: four empty cells (two rows, two columns, two boxes) all
     * holding {a, b}; two of them («floor») exactly {a, b}, the other two («roof») see each other.
     * Type 2: both roof cells are {a, b, x} — x is in one of them, so it leaves cells seeing both.
     * Type 3: the roof's extra digits with one or two other cells of a shared unit form a naked subset.
     * Type 4: in a unit of the roof a has only the two roof places — then b leaves both roof cells.
     */
    function uniqueRectangle24(val, cand) { return urType(val, cand, 0); }

    /** Unique rectangle of one type (2, 3 or 4); 0 = any of them. */
    function urType(val, cand, type) {
        for (let r1 = 0; r1 < 9; r1++) for (let r2 = r1 + 1; r2 < 9; r2++)
            for (let c1 = 0; c1 < 9; c1++) for (let c2 = c1 + 1; c2 < 9; c2++) {
                if ((Math.floor(r1 / 3) == Math.floor(r2 / 3)) == (Math.floor(c1 / 3) == Math.floor(c2 / 3))) continue;
                let q = [r1 * 9 + c1, r1 * 9 + c2, r2 * 9 + c1, r2 * 9 + c2];
                let empty = true;
                for (const c of q) if (val[c] != 0) empty = false;
                if (!empty) continue;
                // floor/roof splits: by rows (0,1 | 2,3) or by columns (0,2 | 1,3)
                let splits = [[0, 1, 2, 3], [2, 3, 0, 1], [0, 2, 1, 3], [1, 3, 0, 2]];
                for (const sp of splits) {
                    let f1 = q[sp[0]], f2 = q[sp[1]], g1 = q[sp[2]], g2 = q[sp[3]];
                    let ab = cand[f1];
                    if (bitCount(ab) != 2 || cand[f2] != ab) continue;
                    if ((cand[g1] & ab) != ab || (cand[g2] & ab) != ab) continue;
                    let e1 = cand[g1] & ~ab, e2 = cand[g2] & ~ab;
                    if (e1 == 0 || e2 == 0) continue;
                    // type 2
                    if ((type == 0 || type == 2) && e1 == e2 && bitCount(e1) == 1 && seenByAll(val, cand, e1, g1, g2)) return true;
                    // type 3: the roof acts as one cell with candidates e1|e2 — a naked subset with other cells of a shared unit
                    let ex = e1 | e2;
                    if ((type == 0 || type == 3) && bitCount(ex) <= 3) for (let u = 0; u < 27; u++) {
                        let h1 = false, h2 = false;
                        for (const c of UNITS[u]) { if (c == g1) h1 = true; if (c == g2) h2 = true; }
                        if (!h1 || !h2) continue;
                        let o = new Array(9).fill(0);
                        let on = 0;
                        for (const c of UNITS[u]) if (c != g1 && c != g2 && val[c] == 0) o[on++] = c;
                        for (let sm = 1; sm < (1 << on); sm++) {
                            let sz = bitCount(sm);
                            if (sz > 2) continue;
                            let uni = ex;
                            for (let i = 0; i < on; i++) if ((sm & (1 << i)) != 0) uni |= cand[o[i]];
                            if (bitCount(uni) != sz + 1) continue;
                            UR3_SUBSET[0] = sz;   // the roof + sz cells: a naked pair (1) or triple (2)
                            let ch = false;
                            for (let i = 0; i < on; i++) {
                                if ((sm & (1 << i)) != 0) continue;
                                if ((cand[o[i]] & uni) != 0) { cand[o[i]] &= ~uni; ch = true; }
                            }
                            if (ch) return true;
                        }
                    }
                    // type 4
                    if (type == 0 || type == 4) for (let u = 0; u < 27; u++) {
                        let h1 = false, h2 = false;
                        for (const c of UNITS[u]) { if (c == g1) h1 = true; if (c == g2) h2 = true; }
                        if (!h1 || !h2) continue;
                        for (let dd = 1; dd <= 9; dd++) {
                            let bit = 1 << dd;
                            if ((ab & bit) == 0) continue;
                            let n = 0;
                            for (const c of UNITS[u]) if (val[c] == 0 && (cand[c] & bit) != 0) n++;
                            if (n != 2) continue;
                            let other = ab & ~bit;
                            if ((cand[g1] & other) != 0 || (cand[g2] & other) != 0) {
                                cand[g1] &= ~other; cand[g2] &= ~other;
                                return true;
                            }
                        }
                    }
                }
            }
        return false;
    }

    /**
     * BUG+1: every empty cell has two candidates except one with three, and in every unit each
     * digit is a candidate exactly twice (or not at all) — except the extra digit of that cell,
     * which is there three times in each of its units. Without it the puzzle would have two
     * solutions, so the cell takes that digit.
     */
    function bugPlusOne(val, cand) {
        let tri = -1;
        for (let c = 0; c < 81; c++) {
            if (val[c] != 0) continue;
            let n = bitCount(cand[c]);
            if (n == 2) continue;
            if (n == 3 && tri < 0) { tri = c; continue; }
            return false;
        }
        if (tri < 0) return false;
        let extra = 0;
        for (let u = 0; u < 27; u++) {
            let mine = false;
            for (const c of UNITS[u]) if (c == tri) mine = true;
            for (let d = 1; d <= 9; d++) {
                let n = 0;
                for (const c of UNITS[u]) if (val[c] == 0 && (cand[c] & (1 << d)) != 0) n++;
                if (n == 0 || n == 2) continue;
                if (!mine || n != 3) return false;
                if (extra == 0) extra = d; else if (extra != d) return false;
            }
        }
        if (extra == 0 || (cand[tri] & (1 << extra)) == 0) return false;
        cand[tri] = 1 << extra;
        return true;
    }

    /** Removes bit from every empty cell (other than the listed ones) that sees all the listed cells. */
    function seenByAll(val, cand, bit, ...cells) {
        let ch = false;
        for (let c = 0; c < 81; c++) {
            if (val[c] != 0 || (cand[c] & bit) == 0) continue;
            let all = true;
            for (const x of cells) if (c == x || !isPeer(c, x)) { all = false; break; }
            if (all) { cand[c] &= ~bit; ch = true; }
        }
        return ch;
    }

    /**
     * Skyscraper: in two rows (or columns) a digit has exactly two places each, and one end of each
     * is in the same column (row). One of the two other ends («roofs») holds the digit, so it is
     * removed from cells seeing both roofs.
     */
    function skyscraper(val, cand) {
        for (let d = 1; d <= 9; d++) {
            let bit = 1 << d;
            for (let orient = 0; orient < 2; orient++) {
                let pos = new Array(9);
                for (let i = 0; i < 9; i++) {
                    let n = 0, a = -1, b = -1;
                    for (let j = 0; j < 9; j++) {
                        let c = orient == 0 ? i * 9 + j : j * 9 + i;
                        if (val[c] == 0 && (cand[c] & bit) != 0) { if (n == 0) a = j; else b = j; n++; }
                    }
                    if (n == 2) pos[i] = [a, b];
                }
                for (let a = 0; a < 9; a++) {
                    if (pos[a] == null) continue;
                    for (let b = a + 1; b < 9; b++) {
                        if (pos[b] == null) continue;
                        for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) {
                            if (pos[a][x] != pos[b][y] || pos[a][1 - x] == pos[b][1 - y]) continue;
                            let ja = pos[a][1 - x], jb = pos[b][1 - y];
                            let r1 = orient == 0 ? a * 9 + ja : ja * 9 + a;
                            let r2 = orient == 0 ? b * 9 + jb : jb * 9 + b;
                            if (seenByAll(val, cand, bit, r1, r2)) return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    /** XYZ-wing: pivot {x,y,z} sees pincers {x,z} and {y,z}; z is removed from cells seeing all three. */
    function xyzWing(val, cand) {
        for (let pv = 0; pv < 81; pv++) {
            let pm = cand[pv];
            if (val[pv] != 0 || bitCount(pm) != 3) continue;
            for (let i = 0; i < 20; i++) {
                let a = PEERS[pv][i], am = cand[a];
                if (val[a] != 0 || bitCount(am) != 2 || (am & ~pm) != 0) continue;
                for (let j = i + 1; j < 20; j++) {
                    let b = PEERS[pv][j], bm = cand[b];
                    if (val[b] != 0 || bitCount(bm) != 2 || (bm & ~pm) != 0 || bm == am) continue;
                    let z = am & bm;
                    if (bitCount(z) != 1) continue;
                    if (seenByAll(val, cand, z, pv, a, b)) return true;
                }
            }
        }
        return false;
    }

    /**
     * W-wing: two cells {x,y} that don't see each other; in some unit x has exactly two places, one
     * seeing each of the cells. Then not both cells are x, so y is removed from cells seeing both.
     */
    function wWing(val, cand) {
        for (let a = 0; a < 81; a++) {
            let m = cand[a];
            if (val[a] != 0 || bitCount(m) != 2) continue;
            for (let b = a + 1; b < 81; b++) {
                if (val[b] != 0 || cand[b] != m || isPeer(a, b)) continue;
                for (let d = 1; d <= 9; d++) {
                    let xb = 1 << d;
                    if ((m & xb) == 0) continue;
                    let yb = m & ~xb;
                    for (let u = 0; u < 27; u++) {
                        let p = -1, q = -1, n = 0;
                        for (const c of UNITS[u]) if (val[c] == 0 && (cand[c] & xb) != 0) { if (n == 0) p = c; else q = c; n++; }
                        if (n != 2 || p == a || p == b || q == a || q == b) continue;
                        let link = (isPeer(p, a) && isPeer(q, b)) || (isPeer(q, a) && isPeer(p, b));
                        if (link && seenByAll(val, cand, yb, a, b)) return true;
                    }
                }
            }
        }
        return false;
    }

    function eliminate(cand, e, m, mask, i, j, k) {
        let ch = false;
        for (let x = 0; x < m; x++) {
            if (x == i || x == j || x == k) continue;
            if ((cand[e[x]] & mask) != 0) { cand[e[x]] &= ~mask; ch = true; }
        }
        return ch;
    }

    function restrict(cand, e, m, posMask, keep) {
        let ch = false;
        for (let x = 0; x < m; x++) {
            if ((posMask & (1 << x)) != 0 && (cand[e[x]] & ~keep) != 0) { cand[e[x]] &= keep; ch = true; }
        }
        return ch;
    }

    // ---------------------------------------------------------------- hints

    /**
     * Next logical move from the current answers. Returns {cell, digit, tier, unit}:
     * tier = hardest technique needed to reach it (1..5, 6 = no logical move: guess),
     * unit = unit index (0..8 rows, 9..17 cols, 18..26 boxes) for a hidden single, -1 otherwise.
     */
    /** Techniques (bit per code) the last hint() on this thread was about: the steps on its way, or its single. */
    const HINT_USED = new Array(1).fill(0);
    function lastHintUsed() { return HINT_USED[0]; }

    function hint(values, solution) {
        let hu = HINT_USED;
        hu[0] = 0;
        let val = values.slice();
        let cand = new Array(81).fill(0);
        for (let c = 0; c < 81; c++) cand[c] = val[c] == 0 ? 0x3FE : 0;
        for (let c = 0; c < 81; c++) if (val[c] != 0) for (const p of PEERS[c]) cand[p] &= ~(1 << val[c]);
        let tier = T_HIDDEN, sub = 0;
        let unitOrder = new Array(27).fill(0);
        for (let i = 0; i < 9; i++) { unitOrder[i] = 18 + i; unitOrder[9 + i] = i; unitOrder[18 + i] = 9 + i; }
        while (true) {
            for (const u of unitOrder) {
                for (let d = 1; d <= 9; d++) {
                    let bit = 1 << d, where = -1, n = 0;
                    for (const c of UNITS[u]) if ((cand[c] & bit) != 0) { n++; where = c; }
                    if (n == 1 && val[where] == 0 && solution[where] == d) {
                        if (hu[0] == 0) hu[0] = 1 << W_HIDDEN;
                        return [where, d, tier, u, sub];
                    }
                }
            }
            for (let c = 0; c < 81; c++) {
                if (val[c] == 0 && bitCount(cand[c]) == 1) {
                    let d = ntz(cand[c]);
                    if (solution[c] == d) {
                        if (hu[0] == 0) hu[0] = 1 << W_NAKED;
                        return [c, d, Math.max(tier, T_NAKED), -1, sub];
                    }
                }
            }
            let w = step(val, cand);
            if (w > 0) {
                tier = Math.max(tier, Math.min(T_ADVANCED, TIER_OF[w])); sub = w;
                hu[0] |= 1 << w;
                if (w == W_UNIQUERECT) hu[0] |= 1 << urBit(UR_TYPE[0]);
                continue;
            }
            break;
        }
        let best = -1, bc = 10;
        for (let c = 0; c < 81; c++) {
            if (val[c] != 0) continue;
            let n = bitCount(cand[c]);
            if (n < bc) { bc = n; best = c; }
        }
        if (best < 0) return null;
        return [best, solution[best], T_HARDER, -1, sub];
    }

    // ---------------------------------------------------------------- generator

    const TARGET = [45, 36, 30, 26, 0, 0, 0];

    /**
     * Level ladder (levels 0..4): the key technique (tier level+1) must be needed, but only a few times,
     * and the number of givens stays in a band, so a level is not «easy but endless».
     */
    const CLUES_LO = [42, 36, 31, 27, 24], CLUES_HI = [46, 40, 35, 31, 28];
    const STEPS_MAX = [99, 3, 3, 3, 3];

    function subsetsN(val, cand, size) {
        // naked subsets first (pair 3,0, triple 3,6), hidden ones only when there are none (3,4 and 4,0)
        if (subsetsPass(val, cand, size, false)) { VARIANT_SE[0] = size == 2 ? 30 : 36; return true; }
        if (subsetsPass(val, cand, size, true)) { VARIANT_SE[0] = size == 2 ? 34 : 40; return true; }
        return false;
    }

    function subsetsPass(val, cand, size, hidden) {
        for (let u = 0; u < 27; u++) {
            let changed = false;
            let e = new Array(9).fill(0);
            let m = 0;
            for (const c of UNITS[u]) if (val[c] == 0) e[m++] = c;
            if (!hidden) {
                for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) {
                    let un = cand[e[i]] | cand[e[j]];
                    if (size == 2) { if (bitCount(un) == 2) changed |= eliminate(cand, e, m, un, i, j, -1); continue; }
                    for (let k = j + 1; k < m; k++) {
                        let un3 = un | cand[e[k]];
                        if (bitCount(un3) == 3) changed |= eliminate(cand, e, m, un3, i, j, k);
                    }
                }
            } else {
                let pos = new Array(10).fill(0);
                let ds = new Array(9).fill(0);
                let nd = 0;
                for (let d = 1; d <= 9; d++) {
                    for (let i = 0; i < m; i++) if ((cand[e[i]] & (1 << d)) != 0) pos[d] |= 1 << i;
                    if (pos[d] != 0) ds[nd++] = d;
                }
                for (let a = 0; a < nd; a++) for (let b = a + 1; b < nd; b++) {
                    let pu = pos[ds[a]] | pos[ds[b]];
                    let keep2 = (1 << ds[a]) | (1 << ds[b]);
                    if (size == 2) { if (bitCount(pu) == 2) changed |= restrict(cand, e, m, pu, keep2); continue; }
                    for (let c = b + 1; c < nd; c++) {
                        let pu3 = pu | pos[ds[c]];
                        if (bitCount(pu3) == 3) changed |= restrict(cand, e, m, pu3, keep2 | (1 << ds[c]));
                    }
                }
            }
            if (changed) return true;
        }
        return false;
    }


    // ------------------------------------------------------------ grade and SE rating (as Sudoku.java)
    function grade(puzzle) {
        var val = puzzle.slice(), cand = new Array(81);
        for (var c = 0; c < 81; c++) cand[c] = val[c] === 0 ? 0x3FE : 0;
        for (c = 0; c < 81; c++) if (val[c] !== 0) for (var p of PEERS[c]) cand[p] &= ~(1 << val[c]);
        var level = T_HIDDEN;
        while (true) {
            if (contradiction(val, cand)) return T_INVALID;
            var empty = 0;
            for (c = 0; c < 81; c++) if (val[c] === 0) empty++;
            if (empty === 0) return level;
            if (hiddenSingles(val, cand) > 0) continue;
            if (nakedSingles(val, cand) > 0) { level = Math.max(level, T_NAKED); continue; }
            var w = step(val, cand);
            if (w > 0) { level = Math.max(level, TIER_OF[w]); continue; }
            return T_HARDER;
        }
    }

    var SE_BEYOND = 70, SE_EXTREME = 120, BOUND = 1000;
    var B0 = 82.1, K1 = 2.64, KT = 0.28, B2 = 4.5;
    var deadline = 0, lastLen = 0, lastSteps = 0, bmax = 0;
    function late() { return deadline > 0 && Date.now() > deadline; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(v))); }
    /** As Sudoku.java beyond(): n = [1st degree, 2nd degree, hardest technique inside the 1st, chains]. */
    function beyond(r, n) {
        if (n[0] === 0 && n[1] === 0) return r;
        var v = B0 + K1 * Math.log(Math.max(1, n[0])) + KT * n[2];
        if (n[1] > 0) v += B2;
        return Math.max(r, clamp(v, SE_BEYOND, SE_EXTREME - 1));
    }
    function breaks(val, cand, depth) {
        var steps = 0;
        while (true) {
            if (contradiction(val, cand)) return steps;
            var n = hiddenSingles(val, cand);
            if (n === 0) n = nakedSingles(val, cand);
            if (n > 0) { steps += n; continue; }
            if (depth === 0) return -1;
            steps++;
            var w = step(val, cand, false);
            if (w > 0) { bmax = Math.max(bmax, stepSe(w)); continue; }
            if (depth === 2 && assume(val, cand, 0)) continue;
            return -1;
        }
    }
    function assume(val, cand, depth) {
        var bestC = -1, bestD = 0, best = Infinity;
        for (var c = 0; c < 81; c++) {
            if (val[c] !== 0) continue;
            for (var d = 1; d <= 9; d++) {
                if ((cand[c] & (1 << d)) === 0) continue;
                if (late()) return false;
                var v = val.slice(), k = cand.slice();
                place(v, k, c, d);
                var len = breaks(v, k, depth);
                if (len >= 0 && len < best) { best = len; bestC = c; bestD = d; }
                if (depth > 0 && bestC >= 0) break;
            }
            if (depth > 0 && bestC >= 0) break;
        }
        if (bestC < 0) return false;
        cand[bestC] &= ~(1 << bestD);
        lastLen = best;
        return true;
    }
    /** SE in tenths (BOUND + the rating so far — out of time); lastSteps — key moves (a + 1000·b with the 2nd degree). */
    function seRating(puzzle, millis) {
        deadline = millis > 0 ? Date.now() + millis : 0;
        try { return seRun(puzzle); } finally { deadline = 0; }
    }
    function seRun(puzzle) {
        var steps = new Array(10).fill(0); steps[9] = T_HIDDEN;
        var val = puzzle.slice(), cand = new Array(81);
        for (var c = 0; c < 81; c++) cand[c] = val[c] === 0 ? 0x3FE : 0;
        for (c = 0; c < 81; c++) if (val[c] !== 0) for (var p of PEERS[c]) cand[p] &= ~(1 << val[c]);
        var r = 12, n = [0, 0, 0, 0];
        var fin = function (x) { lastSteps = steps[9] === T_HARDER ? n[3] + n[0] + 1000 * n[1] : steps[steps[9]]; return x; };
        while (true) {
            if (contradiction(val, cand)) return fin(beyond(r, n));
            var empty = false;
            for (c = 0; c < 81; c++) if (val[c] === 0) { empty = true; break; }
            if (!empty) return fin(beyond(r, n));
            if (hiddenSinglesIn(val, cand, 18, 27) > 0) { r = Math.max(r, 12); continue; }
            if (hiddenSingles(val, cand) > 0) { r = Math.max(r, 15); continue; }
            if (nakedSingles(val, cand) > 0) { r = Math.max(r, 23); steps[9] = Math.max(steps[9], T_NAKED); continue; }
            var w = step(val, cand);
            if (w > 0) { r = Math.max(r, stepSe(w)); steps[TIER_OF[w]]++; steps[9] = Math.max(steps[9], TIER_OF[w]); if (w === W_AIC) n[3]++; continue; }
            var done = false;
            for (var depth = 0; depth < 3 && !done; depth++) {
                if (late()) return fin(BOUND + Math.max(beyond(r, n), SE_BEYOND));
                bmax = 0;
                if (assume(val, cand, depth)) {
                    done = true;
                    if (depth < 2) { n[0]++; n[2] = Math.max(n[2], bmax); } else n[1]++;
                }
            }
            if (late()) return fin(BOUND + Math.max(beyond(r, n), SE_BEYOND));
            if (!done) return fin(SE_EXTREME);
            steps[T_HARDER]++;
            steps[9] = T_HARDER;
        }
    }

    /**
     * Steps tried for a training on technique k, in order: everything simpler first, so the task
     * really needs k. Rare techniques get a shorter list, or the search would take too long:
     * the finned X-wing only has to beat the basic steps and the plain X-wing, BUG+1 nothing.
     */window.SX = {hint: hint, grade: grade, seRating: seRating, steps: function () { return lastSteps; }, LEVELS: 7, countSolutions: countSolutions, used: function () { return HINT_USED[0]; }, T_HIDDEN: T_HIDDEN, T_NAKED: T_NAKED, T_HARDER: T_HARDER, PEERS: PEERS, UNITS: UNITS, CELL_UNITS: CELL_UNITS, isPeer: isPeer};
})();
