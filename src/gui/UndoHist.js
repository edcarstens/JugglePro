/**
 * @author Ed Carstens
 */

/*
 * @class UndoHist
 * @constructor
 * @param state
 */

JPRO.UndoHist = function(state) {
    this.className = this.className || 'UndoHist';
    this.idx = 0;
    this.hist = [state.copy()];
};

JPRO.UndoHist.prototype.constructor = JPRO.UndoHist;

/**
 * pushState
 *
 * @method pushState
 * @return
 */
JPRO.UndoHist.prototype.pushState = function(state) {
    if (this.idx < this.hist.length - 1) {
	// discard redo history
	this.hist.splice(this.idx + 1);
    }
    this.idx++;
    this.hist.push(state.copy());
    return state; // for chaining
};

/*
 * undoDisabled
 *
 * @method undoDisabled
 * @return {Boolean} returns true if undo is disabled
 */
JPRO.UndoHist.prototype.undoDisabled = function() {
    return (this.idx === 0);
};

/*
 * Undo
 *
 * @method undo
 * @return {Object} returns previous state
 */
JPRO.UndoHist.prototype.undo = function() {
    if (this.idx) this.idx--;
    return this.hist[this.idx].copy();
};

/*
 * redoDisabled
 *
 * @method redoDisabled
 * @return {Boolean} returns true if redo is disabled
 */
JPRO.UndoHist.prototype.redoDisabled = function() {
    return (this.idx >= this.hist.length - 1);
};

/*
 * Redo
 *
 * @method redo
 * @return {Object} returns next state from history
 */
JPRO.UndoHist.prototype.redo = function() {
    if (this.idx < this.hist.length - 1) this.idx++;
    return this.hist[this.idx].copy();
};
