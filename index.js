'use strict';

class Scrollspy {
  constructor(element) {
    this.element = element;
    this.ul = this.element.getElementsByTagName('ul')[0];
    this.button = this.element.getElementsByTagName('button')[0];
    this.targets = [];
    this.targetIndices = {};
    this.indicesInViewPort = [];
    var as = element.querySelectorAll('[href^="#"]');
    for (var i = 0, l = as.length; i < l; i++) {
      (function(a) {
        var id = a.hash.slice(1);
        this.targets.push(document.getElementById(id));
        this.targetIndices[id] = i;
      }.bind(this))(as[i])
    }
    var height = getComputedStyle(this.element).getPropertyValue('--scrollspy-height').trim();
    var observer = new IntersectionObserver(this.onIntersectionChange.bind(this), {rootMargin: `-${height}`});
    this.targets.forEach(observer.observe.bind(observer));
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
        } else if (index > this.indicesInViewPort[this.indicesInViewPort.length - 1]) {
          this.indicesInViewPort.push(index);
        } else {
          this.indicesInViewPort.push(index);
          this.indicesInViewPort.sort();
        }
      }
    }
    if (this.indicesInViewPort.length === 0) {
      return;
    }
    if (oldTargetIndex === this.indicesInViewPort[0]) {
      return;
    }
    var event = new CustomEvent('targetchange', {
      detail: {
        newTarget: this.targets[this.indicesInViewPort[0]],
        oldTarget: this.targets[oldTargetIndex]
      }
    });
    this.element.dispatchEvent(event);
  }
}

class Navigation {
  constructor(element) {
    this.element = element;
    this.links = {};
    var button = this.element.getElementsByTagName('button')[0];
    var as = this.element.getElementsByTagName('a');
    for (var i = 0, l = as.length; i < l; i++) {
      var a = as[i];
      this.links[a.hash.slice(1)] = a;
      a.addEventListener('click', function(event) {
        element.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-expanded', 'false');
      });
    }
    button.addEventListener('click', function(event) {
      var expanded = this.element.getAttribute('aria-expanded');
      var value = (expanded === 'true') ? 'false' : 'true';
      this.element.setAttribute('aria-expanded', value);
      button.setAttribute('aria-expanded', value);
    }.bind(this));
  }

  onTargetChange(event) {
    var newTarget = event.detail.newTarget;
    this.links[event.detail.oldTarget.id].setAttribute('aria-selected', 'false');
    this.links[newTarget.id].setAttribute('aria-selected', 'true');
    this.element.dataset.scrollspyTarget = newTarget.id;
  }
}

class HistoryManager {
  onTargetChange(event) {
    history.replaceState(null, null, '#' + event.detail.newTarget.id);
  }
}

class HashchangeDispatcher {
  onTargetChange(event) {
    var hashchangeEvent = new Event('hashchange');
    hashchangeEvent.oldURL = location.href;
    var oldURL = new URL(location.href);
    if (event.detail.oldTarget) {
      oldURL.hash = '#' + event.detail.oldTarget.id;
    }
    if (event.detail.newTarget) {
      var newURL = new URL(location.href);
      newURL.hash = '#' + event.detail.newTarget.id;
    }
    hashchangeEvent.oldURL = oldURL.toString();
    hashchangeEvent.newURL = newURL.toString();
    dispatchEvent(hashchangeEvent);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var nav = document.getElementsByTagName('nav')[0];

  var navigation = new Navigation(nav);
  nav.addEventListener('targetchange', navigation.onTargetChange.bind(navigation));

  var historyManager = new HistoryManager();
  nav.addEventListener('targetchange', historyManager.onTargetChange.bind(historyManager));

  var hashchangeDispatcher = new HashchangeDispatcher();
  nav.addEventListener('targetchange', hashchangeDispatcher.onTargetChange.bind(hashchangeDispatcher));
  addEventListener('hashchange', function(event) {
    console.dir(event);
  });

  new Scrollspy(nav);
});
