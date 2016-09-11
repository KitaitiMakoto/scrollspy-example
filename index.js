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
    this.targets.forEach(function(pair) {
      this.observer.observe(pair.target);
      pair.a.addEventListener('click', function(event) {
        this.element.setAttribute('aria-expanded', 'false');
      }.bind(this));
    }.bind(this));
    this.button.addEventListener('click', function(event) {
      var expanded = this.element.getAttribute('aria-expanded');
      var value = (expanded === 'true') ? 'false' : 'true';
      this.element.setAttribute('aria-expanded', value);
    }.bind(this));
  }

  onIntersectionChange(changes) {
    var targetIndex = 0;
    this.targets.forEach(function(pair, index) {
      var offset = pair.target.getBoundingClientRect().top - this.height;
      if (offset <= 0) {
        targetIndex = index;
      }
    }.bind(this));
    this.targets.forEach(function(pair, index) {
      var value = (index === targetIndex) ? 'true' : 'false';
      pair.a.setAttribute('aria-selected', value);
    });
    var transform = `translateY(calc(-${targetIndex} * var(--scrollspy-height)))`;
    this.ul.style.transform = transform;
  }
}

window.addEventListener('load', function() {
  new Scrollspy(document.getElementsByTagName('nav')[0]);
});
