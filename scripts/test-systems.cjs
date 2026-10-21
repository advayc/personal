// Verify the algorithm and physics models independently of their SVG rendering.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
const file = require('node:path').resolve(__dirname, '../src/components/systems/models.ts');
const model = new Module(file, module);
model._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, file);
const { graphNodes, graphEdges, traverse, kruskal, planetRatio, capacitance, capacitorCharge } = model.exports;
assert.deepEqual(traverse('bfs'), [0, 1, 3, 2, 4, 6, 5]);
assert.deepEqual(traverse('dfs'), [0, 1, 2, 5, 4, 3, 6]);
for (const node of graphNodes) {
  for (const mode of ['bfs', 'dfs']) {
    const order = traverse(mode, node.id);
    assert.equal(order[0], node.id);
    assert.equal(new Set(order).size, graphNodes.length);
  }
}
function treeWeight(edges) {
  const parent = graphNodes.map(n => n.id);
  const root = n => parent[n] === n ? n : root(parent[n]);
  for (const e of edges) {
    if (root(e.a) === root(e.b)) return Infinity;
    parent[root(e.a)] = root(e.b);
  }
  return edges.reduce((sum, e) => sum + e.w, 0);
}
// Exhaust every six-edge subset; this oracle doesn't use the greedy algorithm.
let minimum = Infinity;
for (let mask = 0; mask < 1 << graphEdges.length; mask++) {
  const subset = graphEdges.filter((_, i) => mask & (1 << i));
  if (subset.length === graphNodes.length - 1) minimum = Math.min(minimum, treeWeight(subset));
}
const states = kruskal();
const last = states.at(-1);
assert.equal(last.weight, minimum);
assert.equal(last.accepted.length, graphNodes.length - 1);
assert.equal(treeWeight(last.accepted.map(i => graphEdges[i])), minimum);
assert.equal(minimum, 15);
for (let i = 1; i < states.length; i++) assert.ok(states[i].edge.w >= states[i - 1].edge.w);
assert.equal(planetRatio(18, 54), 4);
// Willis relation with ring stationary: (sun-carrier)/(ring-carrier) = -Nr/Ns.
for (const sun of [3, 12, 30]) {
  const carrier = sun / planetRatio(18, 54);
  assert.equal((sun - carrier) / -carrier, -3);
}
const c = capacitance(100, 4);
assert.ok(Math.abs(c - 22.135469532e-12) < 1e-20);
assert.equal(capacitance(100, 8), c / 2);
assert.equal(capacitance(200, 4), c * 2);
assert.equal(capacitorCharge(0, c), 0);
assert.equal(capacitorCharge(5, c), c * 5);
console.log('PASS: BFS/DFS from every start, exhaustive MST oracle, gearbox ratio, capacitance and charge.');

// Independent kinematic constraints across every selectable lock and direction.
for (const lock of ['ring', 'carrier', 'sun']) {
  for (const input of [-30, -12, 0, 12, 30]) {
    const v = model.exports.planetarySpeeds(lock, input);
    assert.ok(Math.abs(v[lock]) < 1e-10);
    assert.ok(Math.abs(18*(v.sun-v.carrier)+54*(v.ring-v.carrier)) < 1e-10);
    assert.ok(Math.abs(18*(v.sun-v.carrier)+18*v.planetRelative) < 1e-10);
    assert.ok(Math.abs(v.planet-v.carrier-v.planetRelative) < 1e-10);
  }
}
assert.equal(model.exports.planetarySpeeds('carrier',12).ring,-4);
assert.equal(model.exports.planetarySpeeds('sun',12).carrier,9);
console.log('PASS: all three gearbox configurations satisfy Willis and planet mesh constraints.');
