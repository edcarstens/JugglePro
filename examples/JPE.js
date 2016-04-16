JPE = function(angular, mhn, pname) {
    angular.module('JpeApp', []).controller('JpeCtl', function($scope) {
	var p = new JPRO.JugPattern(mhn);
	p.name = pname;
	//console.log(p);
	// Variables
	// Always use $scope when modifying variables
	$scope.p = p;
	$scope.selections = 0;
	$scope.swapDis = true;
	$scope.swapRowsDis = true;
	$scope.space = "w3-large";
	// Methods
	$scope.hideAddCol = function(r) {
	    return !this.p.jugThrowSeqs[r].isZeros();
	};
	$scope.update = function() {
	    $scope.hideNewCol = (this.p.clocks.length > 1);
	    $scope.undoDis = this.p.undoDisabled();
	    $scope.redoDis = this.p.redoDisabled();
	};
	$scope.update();
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
	};
	$scope.clickAddRow = function() {
	    var a = this.p.getSelectedThrows();
	    var r = 0;
	    if (a.length) r = a[0][0];
	    this.p.extendRows(r);
	    this.update();
	};
	$scope.clickAddCol = function(r) {
	    this.p.extendPeriod(r);
	    this.update();
	};
	$scope.clickSubCol = function(r) {
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
	$scope.clickThrow = function(jt) {
	    $scope.selections += jt.w3ToggleSelect();
	    $scope.swapDis = (this.selections !== 2);
	    if (this.selections === 2) {
		var a = this.p.getSelectedThrows();
		$scope.swapRowsDis = (a[0][0] === a[1][0]);
	    }
	    else {
		$scope.swapRowsDis = true;
	    }
	};
	$scope.clickRT = function(r,x) {
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
	$scope.clickMT = function(r) {
	    this.p.multiplexTranslate(r);
	    this.update();
	};
	$scope.clickUndo = function() {
	    $scope.p = this.p.undo();
	    this.update();
	};
	$scope.clickRedo = function() {
	    $scope.p = this.p.redo();
	    this.update();
	};
    });

//console.log(angular);
};

