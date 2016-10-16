var JSComponents = JSComponents || {};

JSComponents.ProgressBar = function(parentNode) {
	//private members
	var elm_;
	var parentNode_;
	//private CROT
	var __construct = function() {
		elm_ = document.createElement('div');
		elm_.setAttribute("id","progress");
		elm_.innerHTML = '<img src="viewer/progress/spin.svg">';
		elm_.style.position = "absolute";
		parentNode_ = parentNode; 
	}();
	//public API
	/**
	 * Displays animated progress bar at location(x,y)
	 */
	this.showProgress = function (x, y) {
		elm_.style.visibility = "visible";
		elm_.style.left = x - 50;
		elm_.style.top = y - 60;

		parentNode_.appendChild(elm_);
	};
	/**
	 * Hide the progress bar
	 * remark: tihs will disconnect it from DOM
	 */
	this.hideProgress = function () {
		parentNode_.removeChild(elm_);
	};
	this.dispose = function() {
		this.hideProgress();
	};
};