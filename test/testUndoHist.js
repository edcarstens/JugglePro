// test undoHist
test = SHAKE.Test();
testo = SHAKE.TestObj();
State = function(id,data) {
    this.id = id || 0;
    this.data = data || 0;
};
State.prototype.constructor = State;
State.prototype.copy = function() {
    return new State(this.id + 1, this.data);
};
state0 = new State(1,123);
x = new JPRO.UndoHist(state0);
//console.log(x);
test(1, x.idx, 0);
test(2, x.hist[0].data, 123); // copy retains same data
test(3, x.hist[0].id, 2); // copy gets id incremented
state1 = new State(1,456);
rv = x.pushState(state1);
test(4, x.idx, 1);
test(5, x.hist[1].data, 456);
test(6, rv, state1);
state2 = new State(1,789);
rv = x.pushState(state2);
test(7, x.idx, 2);
testo(8, x.hist[2], {id:2,data:789});
test(9, rv, state2);
test(10, x.undoDisabled(), false);
test(11, x.redoDisabled(), true);
// UNDO
rv = x.undo();
test(11, rv.data, state1.data);
test(12, x.idx, 1);
test(13, x.undoDisabled(), false);
test(14, x.redoDisabled(), false);
rv = x.undo();
test(15, rv.data, state0.data);
test(16, x.idx, 0);
test(17, x.undoDisabled(), true);
test(18, x.redoDisabled(), false);
rv = x.undo();
test(19, rv.data, state0.data);
test(20, x.idx, 0);
test(21, x.undoDisabled(), true);
test(22, x.redoDisabled(), false);
// REDO
rv = x.redo();
test(23, rv.data, state1.data);
test(24, x.idx, 1);
test(25, x.undoDisabled(), false);
test(26, x.redoDisabled(), false);
rv = x.redo();
test(27, rv.data, state2.data);
test(28, x.idx, 2);
test(29, x.undoDisabled(), false);
test(30, x.redoDisabled(), true);
rv = x.redo();
test(31, rv.data, state2.data);
test(32, x.idx, 2);
test(33, x.undoDisabled(), false);
test(34, x.redoDisabled(), true);
// Verify condition where redo states are discarded
rv = x.undo();
rv = x.undo();
state3 = new State(100,200);
rv = x.pushState(state3);
test(35, x.hist.length, 2);
test(36, x.hist[0].data, state0.data);
test(37, x.hist[1].data, state3.data);
test(38, rv, state3);

SHAKE.FINISH();
