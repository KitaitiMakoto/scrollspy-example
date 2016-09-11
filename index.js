'use strict';

class Scrollspy {
  constructor(element) {
    this.element = element;
    this.ul = this.element.getElementsByTagName('ul')[0];
    this.button = this.element.querySelector('[role="button"]');
    this.height = this.element.getBoundingClientRect().height;
    this.observer = new IntersectionObserver(this.onIntersectionChange.bind(this), {rootMargin: `-${this.height}px`});
    this.targets = [];
    this.targetIndices = {};
    this.indicesInViewPort = [];
    var as = element.querySelectorAll('[href^="#"]');
    for (var i = 0, l = as.length; i < l; i++) {
      (function(a) {
        var id = a.hash.slice(1);
        this.targets.push({
          a: a,
          target: document.getElementById(id)
        });
        this.targetIndices[id] = i;
      }.bind(this))(as[i])
    }
    this.targets.forEach(function(pair) {
      this.observer.observe(pair.target);
      pair.a.addEventListener('click', function(event) {
        this.element.setAttribute('aria-expanded', 'false');
        this.button.setAttribute('aria-expanded', 'false');
      }.bind(this));
    }.bind(this));
    this.element.addEventListener('targetchange', this.onTargetChange.bind(this));
    this.button.addEventListener('click', function(event) {
      var expanded = this.element.getAttribute('aria-expanded');
      var value = (expanded === 'true') ? 'false' : 'true';
      this.element.setAttribute('aria-expanded', value);
      this.button.setAttribute('aria-expanded', value);
    }.bind(this));
  }

  onIntersectionChange(changes) {
    var oldTargetIndex = this.indicesInViewPort[0] || 0;
    for (var i = changes.length - 1; i >= 0; i--) {
      var change = changes[i];
      var index = this.targetIndices[change.target.id];
      if (change.intersectionRatio === 0) {
        var indexInViewPort = this.indicesInViewPort.indexOf(index);
        this.indicesInViewPort.splice(indexInViewPort, 1);
      } else {
        if (index < oldTargetIndex) {
          this.indicesInViewPort.unshift(index);
        } else {
          this.indicesInViewPort.push(index);
        }
      }
    }
    if (oldTargetIndex === this.indicesInViewPort[0]) {
      return;
    }
    var event = new CustomEvent('targetchange', {
      detail: {
        newTargetIndex: this.indicesInViewPort[0],
        oldTargetIndex: oldTargetIndex
      }
    });
    this.element.dispatchEvent(event);
  }

  onTargetChange(event) {
    this.targets[event.detail.oldTargetIndex].a.setAttribute('aria-selected', 'false');
    this.targets[event.detail.newTargetIndex].a.setAttribute('aria-selected', 'true');
    this.ul.dataset.scrollspyIndex = '' + event.detail.newTargetIndex;
    var a = this.targets[event.detail.newTargetIndex].a;
    var event = new Event('hashchange');
    event.oldURL = location.href;
    event.newURL = a.href;
    history.replaceState(null, a.textContent, a.hash);
    dispatchEvent(event);
  }
}

window.addEventListener('load', function() {
  new Scrollspy(document.getElementsByTagName('nav')[0]);
});
