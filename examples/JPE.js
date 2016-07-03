JPE = function(angular, pats, pname) {
    angular.module('JpeApp', []).controller('JpeCtl', function($scope) {
	$scope.version = "1.8";
	var i,pat,r,j,rhythm,p;
	$scope.pats = [];
	$scope.rowDis = [];
	$scope.undoHist = [];
	for (i in pats) {
	    pat = pats[i]
	    if (pat.mhn) {
		// pat is JSON with a rhythm and mhn
		pat.clocks = [];
		r = pat.rhythm;
		for (j=0; j<r.length; j++) {
		    rhythm = JPRO.HierRptSeq.create(r[j], -1);
		    pat.clocks.push(new JPRO.Clock(1, rhythm));
		}
		console.log(pat);
		p = new JPRO.JugPattern(pat.mhn, pat.clocks);
	    }
	    else {
		// pat is simple MHN
		p = new JPRO.JugPattern(pat);
	    }
	    $scope.pats.push(p);
	    $scope.rowDis.push(true);
	    $scope.undoHist.push(new JPRO.UndoHist(p));
	}
	$scope.pname = pname || 'Untitled';
	// Variables
	// Always use $scope when modifying variables
	$scope.pidx = 0;
	$scope.rowDis[$scope.pidx] = false;
	$scope.p = $scope.pats[$scope.pidx];
	$scope.selections = 0;
	$scope.swapDis = true;
	$scope.swapRowsDis = true;
	$scope.dbeatDis = true;
	$scope.space = "w3-large";
	// Methods
	$scope.hideAddCol = function(r) {
	    return !$scope.p.jugThrowSeqs[r].isZeros();
	};
	$scope.update = function(noUndo) {
	    if (!noUndo) {
		// push a copy of p in the undo history for pidx
		this.undoHist[this.pidx].pushState(this.p);
	    }
	    $scope.hideNewCol = (this.p.clocks.length > 1);
	    $scope.undoDis = this.undoHist[this.pidx].undoDisabled();
	    $scope.redoDis = this.undoHist[this.pidx].redoDisabled();
	};
	$scope.update(1);
	$scope.rowToChar = function(r) {
	    return String.fromCharCode(65 + r);
	};
	/**
	 * Clear selections
	 *
	 * @method clearSelections
	 */
	$scope.clearSelections = function() {
	    this.p.clearSelections();
	    $scope.selections = 0;
	    $scope.swapDis = true;
	    $scope.swapRowsDis = true;
	    $scope.dbeatDis = true;
	};
	$scope.selectPat = function(pidx) {
	    if (pidx != this.pidx) {
		$scope.rowDis[this.pidx] = true;
		$scope.rowDis[pidx] = false;
		this.clearSelections();
		$scope.pidx = pidx;
		$scope.p = this.pats[pidx];
		this.update(1);
	    }
	};
	$scope.clickFormat = function() {
	    $scope.space = (this.space === "w3-small") ? "w3-large" : "w3-small";
	};
	/**
	 * Clear selections / Clean the matrix if nothing selected
	 *
	 * @method clickAC
	 */
	$scope.clickAC = function() {
	    if (this.selections) {
		this.clearSelections();
	    }
	    else {
		this.p.clean();
		this.update();
	    }
	};
	$scope.toolTipAC = function() {
	    if (this.selections) {
		return 'Clear selections';
	    }
	    else {
		return 'Clean multiplexed pattern'
	    }
	};
	$scope.clickReset = function() {
	    this.p.reset();
	    this.update();
	    this.clearSelections();
	};
	$scope.clickAddRow = function() {
	    var a = this.p.getSelectedThrows();
	    var r = 0;
	    if (a.length) r = a[0][0];
	    this.p.extendRows(r);
	    this.update();
	};
	$scope.clickAddCol = function(r,pidx) {
	    this.selectPat(pidx || this.pidx);
	    this.p.extendPeriod(r);
	    this.update();
	};
	$scope.clickSubCol = function(r,pidx) {
	    this.selectPat(pidx || this.pidx);
	    this.p.decPeriod(r);
	    this.update();
	};
	
	$scope.clickSwap = function() {
	    var a = this.p.getSelectedThrows();
	    this.p.swap(a[0], a[1]);
	    this.clearSelections();
	    this.update();
	};
	$scope.clickSwapRows = function() {
	    var a = this.p.getSelectedThrows();
	    if (a[0][0] === a[1][0]) return;
	    this.p.swapRows(a[0][0], a[1][0]);
	    this.clearSelections();
	    this.update();
	};

	$scope.clickThrow = function(jt,pidx) {
	    this.selectPat(pidx);
	    $scope.selections += jt.w3ToggleSelect();
	    $scope.swapDis = (this.selections !== 2);
	    $scope.dbeatDis = (this.selections === 0);
	    if (this.selections === 2) {
		var a = this.p.getSelectedThrows();
		$scope.swapRowsDis = (a[0][0] === a[1][0]);
	    }
	    else {
		$scope.swapRowsDis = true;
	    }
	    // No update here because this is just a select/deselect
	};
	$scope.clickRT = function(r,x,pidx) {
	    this.selectPat(pidx);
	    if (this.selections) {
		this.p.translateThrowsSelected(x);
		this.clearSelections();
	    }
	    else {
		this.p.translateRow(r,x);
	    }
	    this.update();
	};
	$scope.clickTA = function(x) {
	    if (this.selections) {
		this.p.translateThrowsSelected(x);
		this.clearSelections();
	    }
	    else {
		this.p.translateAll(x);
	    }
	    this.update();
	};
	$scope.clickRotate = function(x) {
	    this.p.rotateThrows(x);
	    this.update();
	};
	$scope.clickMT = function(r,pidx) {
	    this.selectPat(pidx);
	    this.p.multiplexTranslate(r);
	    this.update();
	};
	$scope.clickUndo = function() {
	    //$scope.p = this.p.undo();
	    $scope.p = this.undoHist[this.pidx].undo();
	    $scope.pats[this.pidx] = this.p;
	    this.update(1);
	    this.clearSelections();
	};
	$scope.clickRedo = function() {
	    //$scope.p = this.p.redo();
	    $scope.p = this.undoHist[this.pidx].redo();
	    $scope.pats[this.pidx] = this.p;
	    this.update(1);
	    this.clearSelections();
	};
	$scope.clickDestBeat = function(x) {
	    if (this.selections) {
		var a = this.p.getSelectedThrows();
		this.p.modDestBeat(a[0], x);
		this.update();
		this.clearSelections();
	    }
	};
	$scope.clickSC = function(r,pidx) {
	    this.selectPat(pidx);
	    this.p.jugThrowSeqs[r].w3ToggleColor();
	    this.update();
	}
    });

//console.log(angular);
};
