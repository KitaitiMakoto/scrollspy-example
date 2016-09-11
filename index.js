'use strict';

class Scrollspy {
  constructor(element) {
    this.element = element;
    this.ul = this.element.getElementsByTagName('ul')[0];
    this.button = this.element.querySelector('[role="button"]');
    this.height = this.element.getBoundingClientRect().height;
    this.observer = new IntersectionObserver(this.onIntersectionChange.bind(this), {rootMargin: `-${this.height}px`});
    this.targets = [];
    var as = element.querySelectorAll('[href^="#"]');
    for (var i = 0, l = as.length; i < l; i++) {
      (function(a) {
        var id = a.hash.slice(1);
        this.targets.push({
          a: a,
          target: document.getElementById(id)
        });
      }.bind(this))(as[i])
    }
    this.targetIndex = 0;
    this.targets.forEach(function(pair) {
      this.observer.observe(pair.target);
      pair.a.addEventListener('click', function(event) {
        this.element.setAttribute('aria-expanded', 'false');
      }.bind(this));
    }.bind(this));
    this.element.addEventListener('targetchange', this.onTargetChange.bind(this));
    this.button.addEventListener('click', function(event) {
      var expanded = this.element.getAttribute('aria-expanded');
      var value = (expanded === 'true') ? 'false' : 'true';
      this.element.setAttribute('aria-expanded', value);
    }.bind(this));
  }

  onIntersectionChange(changes) {
    var targetIndex = this.findTargetIndex();
    if (targetIndex === this.targetIndex) {
      return;
    }
    var newTarget = this.targets[targetIndex].target.id;
    var event = new CustomEvent('targetchange', {
      detail: {
        newTargetIndex: targetIndex,
        oldTargetIndex: this.targetIndex
      }
    });
    this.targetIndex = targetIndex;
    this.element.dispatchEvent(event);
  }

  // TODO: binary search
  findTargetIndex() {
    for (var i = 0, l = this.targets.length; i < l; i++) {
      var pair = this.targets[i]
      var offset = pair.target.getBoundingClientRect().top - this.height;
      if (offset > 0) {
        return (i === 0) ? i : (i - 1);
      }
    }

    return (i === 0) ? i : (i - 1);
  }

  onTargetChange(event) {
    this.targets[event.detail.oldTargetIndex].a.setAttribute('aria-selected', 'false');
    this.targets[event.detail.newTargetIndex].a.setAttribute('aria-selected', 'true');
    var transform = `translateY(calc(-${event.detail.newTargetIndex} * var(--scrollspy-height)))`;
    this.ul.style.transform = transform;
    var a = this.targets[event.detail.newTargetIndex].a;
    history.replaceState(null, a.textContent, a.hash);
  }
}

window.addEventListener('load', function() {
  new Scrollspy(document.getElementsByTagName('nav')[0]);
});
