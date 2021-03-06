/**
 * Vanilla JavaScript zooming image library
 *
 * Original preamble:
 * v-zoom.js - It's the best way to zoom an image only used plain Javascript
 * @author xuandieu
 * @version v0.9.5
 * @link https://github.com/vDiFoung/v-zoom
 * @license MIT
 *
 *
 * The MIT License. Copyright © 2018 xuandieu
 */

+function () {
  "use strict";

  const backgroundId = "vz-bg";
  const wrappedImageId = "vz-wrapped-img";

  const DefaultOptions = {
	zoomEffect: "translate",
	duration: 279,
	backgroundColor: "rgba(0.0.0.1)",
	scrollToCancel: true,
	zoomPercentage: 50,
  };

  let IntervalIdList = {
	backgroundPageOpacity: 0,
	wrappedImgTranslate: 0,
	imgScale: 0
  };

  let elementsWillZoom = [];
  let elementZoomed = "";
  let VZoom = function () {
	let init = function (selector, option) {
	  option = {...DefaultOptions, ...option};
	  elementsWillZoom = [];
	  document.querySelectorAll(selector).forEach(el => {
		elementsWillZoom = [...elementsWillZoom, el];
		el.data = new Actions(el, option);
	  });
	  return {destroy};
	};
	return {init};
  }();

  let Actions = function (el, option) {
	this.el = el;
	this.option = {...option};
	this.option.vzoomScale = el.dataset.vzoomScale;
	this.currentTimeExecutedEvent = 0;

	this.IntervalIdList = IntervalIdList;

	this.el.style.cursor = "zoom-in";
	this.imgClick = (e) => {
	  e.stopPropagation();
	  if (e.target.classList.contains("vz-zoomed")) {
		this.zoomCancel();
		return;
	  }

	  elementZoomed = e.target;
	  e.target.classList.add("vz-zoomed");
	  e.target.style.cursor = "zoom-out";
	  this.handleBackground(true);
	  this.handleNodeWrappedImg(true);
	  this.enableDocumentClickToCancel(true);
	  if (this.option.scrollToCancel) {
		this.enableDocumentScrollToCancel(true);
	  }
	  if (this.option.zoomEffect.toUpperCase() === "SCALE") {
		this.effectScale(true);
	  }
	  else {
		this.effectTranslate(true);
	  }

	};
	el.addEventListener("click", this.imgClick);

  };

  Actions.prototype.handleBackground = function (toggle) {
	if (toggle) {
	  let background = document.createElement("div");
	  background.setAttribute("id", backgroundId);
	  background.setAttribute("style", `position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: ${this.option.backgroundColor}; z-index: 9999; opacity: 0;`);
	  document.body.appendChild(background);
	  background.addEventListener("click", () => {
	  });

	  let startTime = Date.now();
	  this.IntervalIdList.backgroundPageOpacity = setInterval(() => {
		let slideTime = Date.now() - startTime;
		if (slideTime >= parseFloat(this.option.duration)) {
		  background.style.opacity = "1";
		  clearInterval(this.IntervalIdList.backgroundPageOpacity);
		  this.currentTimeExecutedEvent = parseInt(this.option.duration);
		}
		else {
		  background.style.opacity = `${slideTime / this.option.duration}`;
		  // Calculate time executed events.
		  this.currentTimeExecutedEvent = slideTime;
		}
	  }, 0);
	}
	else {
	  let background = document.getElementById(backgroundId);
	  let currentOpacity = parseFloat(background.style.opacity);
	  clearInterval(this.IntervalIdList.backgroundPageOpacity);

	  let startTime = Date.now();
	  this.IntervalIdList.backgroundPageOpacity = setInterval(() => {
		let slideTime = Date.now() - startTime;
		if (slideTime >= this.currentTimeExecutedEvent) {
		  background.style.opacity = "0";
		  background.remove();
		  clearInterval(this.IntervalIdList.backgroundPageOpacity);
		  document.body.style.removeProperty("pointer-events");
		  // Reset value when executed event done.
		  this.currentTimeExecutedEvent = 0;
		}
		else {
		  document.body.style.pointerEvents = "none";
		  background.style.opacity = `${currentOpacity * ((this.currentTimeExecutedEvent - slideTime) / this.currentTimeExecutedEvent)}`;
		}
	  }, 0);

	}
  };

  Actions.prototype.handleNodeWrappedImg = function (toggle) {
	if (toggle) {
	  let newNodeWrapImg = document.createElement("div");
	  newNodeWrapImg.setAttribute("id", wrappedImageId);
	  this.el.parentNode.insertBefore(newNodeWrapImg, this.el);
	  newNodeWrapImg.appendChild(this.el);
	  newNodeWrapImg.style.cssText = "position:relative; z-index: 99999;";
	  newNodeWrapImg.addEventListener("click", () => {
	  });
	  let imgWidth = this.el.offsetWidth;
	  let imgHeight = this.el.offsetHeight;

	  let viewportPointCenter = {
		x: window.innerWidth / 2,
		y: window.innerHeight / 2
	  };
	  let elementTargetedPointCenter = {
		x: this.el.getBoundingClientRect().left + imgWidth / 2,
		y: this.el.getBoundingClientRect().top + imgHeight / 2
	  };

	  let startTime = Date.now();
	  this.IntervalIdList.wrappedImgTranslate = setInterval(() => {
		let slideTime = Date.now() - startTime;
		if (slideTime >= parseFloat(this.option.duration)) {
		  newNodeWrapImg.style.transform = `translate(${viewportPointCenter.x - elementTargetedPointCenter.x}px,${viewportPointCenter.y - elementTargetedPointCenter.y}px)`;
		  clearInterval(this.IntervalIdList.wrappedImgTranslate);
		}
		else {
		  newNodeWrapImg.style.transform = `translate(${(slideTime / this.option.duration) * (viewportPointCenter.x - elementTargetedPointCenter.x)}px,${(slideTime / this.option.duration) * (viewportPointCenter.y - elementTargetedPointCenter.y)}px)`;
		}
	  }, 0);
	}
	else {
	  let parent = this.el.parentNode;
	  if (parent.id === wrappedImageId) {
		let style = window.getComputedStyle(parent);
		let matrix = new WebKitCSSMatrix(style.webkitTransform);
		let translatedX = matrix.e;
		let translatedY = matrix.f;

		clearInterval(this.IntervalIdList.wrappedImgTranslate);
		let startTime = Date.now();
		this.IntervalIdList.wrappedImgTranslate = setInterval(() => {
		  let slideTime = Date.now() - startTime;
		  if (slideTime >= this.currentTimeExecutedEvent) {
			parent.style.removeProperty("transform");
			clearInterval(this.IntervalIdList.wrappedImgTranslate);
			parent.parentNode.insertBefore(this.el, parent);
			parent.remove();
		  }
		  else {
			let coordinateX = translatedX * (this.currentTimeExecutedEvent - slideTime) / this.currentTimeExecutedEvent;
			let coordinateY = translatedY * (this.currentTimeExecutedEvent - slideTime) / this.currentTimeExecutedEvent;
			parent.style.transform = `translate(${coordinateX}px,${coordinateY}px)`;
		  }
		}, 0);
	  }
	}
  };

  Actions.prototype.enableDocumentScrollToCancel = function (toggle) {
	if (toggle) {
	  document.addEventListener("scroll", this.handleScrollEvt);
	}
	else {
	  document.removeEventListener("scroll", this.handleScrollEvt);
	}
  };
  Actions.prototype.handleScrollEvt = function () {
	let elZoomedData = elementZoomed.data;
	setTimeout(() => {
	  elZoomedData.zoomCancel();
	}, 195);
  };

  Actions.prototype.enableDocumentClickToCancel = function (toggle) {
	if (toggle) {
	  document.addEventListener("click", this.handleClickEvt);
	}
	else {
	  document.removeEventListener("click", this.handleClickEvt);
	}
  };
  Actions.prototype.handleClickEvt = function () {
	let elZoomedData = elementZoomed.data;
	elZoomedData.zoomCancel();
  };

  Actions.prototype.effectTranslate = function (toggle) {
	if (toggle) {
	  let zoomTo = (typeof this.option.vzoomScale === "undefined") ? this.calculateScaleZoom() : parseFloat(this.option.vzoomScale);

	  let startTime = Date.now();
	  this.IntervalIdList.imgScale = setInterval(() => {
		let slideTime = Date.now() - startTime;
		if (slideTime >= parseFloat(this.option.duration)) {
		  this.el.style.transform = `scale(${zoomTo})`;
		  clearInterval(this.IntervalIdList.imgScale);
		}
		else {
		  this.el.style.transform = `scale(${1 + (slideTime / this.option.duration) * (zoomTo - 1)})`;
		}
	  }, 0);
	}
	else {
	  let style = window.getComputedStyle(this.el);
	  let matrix = new WebKitCSSMatrix(style.webkitTransform);
	  let currentScale = matrix.d;

	  clearInterval(this.IntervalIdList.imgScale);
	  let startTime = Date.now();
	  this.IntervalIdList.imgScale = setInterval(() => {
		let slideTime = Date.now() - startTime;
		if (slideTime >= this.currentTimeExecutedEvent) {
		  this.el.style.removeProperty("transform");
		  clearInterval(this.IntervalIdList.imgScale);
		}
		else {
		  this.el.style.transform = `scale(${currentScale - (slideTime / this.currentTimeExecutedEvent) * (currentScale - 1)})`;
		}
	  }, 0);
	}
  };

  Actions.prototype.effectScale = function (toggle) {
	if (toggle) {
	  let zoomTo = (typeof this.option.vzoomScale === "undefined") ? this.calculateScaleZoom() : parseFloat(this.option.vzoomScale);

	  let startTime = Date.now();
	  this.IntervalIdList.imgScale = setInterval(() => {
		let slideTime = Date.now() - startTime;
		if (slideTime >= parseFloat(this.option.duration)) {
		  this.el.style.transform = `scale(${zoomTo})`;
		  clearInterval(this.IntervalIdList.imgScale);
		}
		else {
		  this.el.style.transform = `scale(${(slideTime / this.option.duration) * zoomTo})`;
		}
	  }, 0);
	}
	else {
	  let style = window.getComputedStyle(this.el);
	  let matrix = new WebKitCSSMatrix(style.webkitTransform);
	  let currentScale = matrix.d;

	  clearInterval(this.IntervalIdList.imgScale);
	  let startTime = Date.now();
	  this.IntervalIdList.imgScale = setInterval(() => {
		let slideTime = Date.now() - startTime;
		if (slideTime >= this.currentTimeExecutedEvent) {
		  this.el.style.removeProperty("transform");
		  currentScale = 1;
		  clearInterval(this.IntervalIdList.imgScale);
		}
		else {
		  this.el.style.transform = `scale(${currentScale * (this.currentTimeExecutedEvent - slideTime) / this.currentTimeExecutedEvent})`;
		}
	  }, 0);
	}
  };

  Actions.prototype.zoomCancel = function () {
	elementZoomed = "";
	this.el.classList.remove("vz-zoomed");
	this.el.style.cursor = "zoom-in";
	this.handleBackground(false);
	this.handleNodeWrappedImg(false);
	this.enableDocumentClickToCancel(false);
	if (this.option.scrollToCancel) {
	  this.enableDocumentScrollToCancel(false);
	}
	if (this.option.zoomEffect.toUpperCase() === "SCALE") {
	  this.effectScale(false);
	}
	else {
	  this.effectTranslate(false);
	}

  };

  Actions.prototype.isMobile = function () {
	return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
	  || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4));
  };

  Actions.prototype.calculateScaleZoom = function () {
	let scaleTo;
	let imgWidth = this.el.offsetWidth;
	let windowWidth = window.innerWidth;

	if (this.isMobile()) {
	  scaleTo = windowWidth / imgWidth;
	}
	else {
	  scaleTo = (windowWidth * this.option.zoomPercentage / 100) / imgWidth;
	}

	return scaleTo;
  };

  let destroy = function () {
	elementsWillZoom.forEach(el => {
	  el.removeEventListener('click', el.data.imgClick);
	  if(el.classList.contains('vz-zoomed')) {
		el.data.zoomCancel();
	  }
	  el.style.removeProperty("cursor");
	  el.data = {};
	})
  };

  if (typeof window !== "undefined") {
	window.VZoom = VZoom;
  }

}();