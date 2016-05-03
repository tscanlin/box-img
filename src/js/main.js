(function(window) {

  var each = [].forEach;
  var indexOf = [].indexOf;

  function initializePreview(document, photos) {
    var previewContainer = document.querySelector('[data-preview-container]');
    var previewHides = document.querySelectorAll('[data-preview-hide]');
    var previewImage = document.querySelector('[data-preview-image]');
    var previewTitle = document.querySelector('[data-preview-title]');
    var previewControls = document.querySelectorAll('[data-preview-control]');
    var activators = document.querySelectorAll('[data-preview-show]');
    var hiddenClass = 'hidden';

    function contains(arr, item) {
      return indexOf.call(arr, item) !== -1;
    }

    function findPhoto(photos, url) {
      return photos.filter(function(photo) {
        return photo.largeImg === url;
      })[0] || {};
    }

    function showPhoto(photo, event) {
      if (!photo) {
        return;
      }
      previewImage.src = photo.largeImg;
      previewTitle.textContent = photo.title;

      // Hide or show the arrows.
      var index = indexOf.call(photos, findPhoto(photos, previewImage.src));
      if (index === 0) {
        previewControls.item(0).classList.add(hiddenClass);
      } else {
        previewControls.item(0).classList.remove(hiddenClass);
      }

      if (index === photos.length - 1) {
        previewControls.item(1).classList.add(hiddenClass);
      } else {
        previewControls.item(1).classList.remove(hiddenClass);
      }

      previewImage.onload = function() {
        previewContainer.classList.remove(hiddenClass);
      }

      if (event) {
        event.preventDefault();
      }
    }

    function clickListener(event) {
      var el = event.target;

      // Clicking thumbnail images should actually trigger the parent link.
      if (el.getAttribute('data-click-parent')) {
        el = el.parentNode;
      }

      if (contains(previewHides, el)) {
        previewContainer.classList.add(hiddenClass)
      }

      if (contains(activators, el)) {
        var url = el.getAttribute('data-preview-show');
        var photo = findPhoto(photos, url);
        showPhoto(photo, event);
      }

      // Listen for clicks on previous button.
      if (contains(previewControls, el)) {
        var val = el.getAttribute('data-preview-control');

        var index = indexOf.call(photos, findPhoto(photos, previewImage.src));
        var photo = photos[index + 1]; // Default to next.
        if (val === 'prev') {
          photo = photos[index - 1];
        }
        showPhoto(photo);
      }
    }

    function keyupListener(event) {
      // Escape.
      if (event.keyCode === 27) {
        previewContainer.classList.add(hiddenClass);
        return;
      }

      // Left / Right arrows.
      var index = indexOf.call(photos, findPhoto(photos, previewImage.src));
      var photo = false; // Default to false.
      if (event.keyCode === 37) { // Left.
        photo = photos[index - 1];
      } else if (event.keyCode === 39) { // Right.
        photo = photos[index + 1];
      }
      showPhoto(photo);
    }

    document.body.addEventListener('click', clickListener);
    document.body.addEventListener('keyup', keyupListener);

    return function() {
      document.body.removeEventListener('click', clickListener);
      document.body.removeEventListener('keyup', keyupListener);
    }
  }

  // Tranform Data.
  function buildURL(photoObj, size) {
    var ext = '_n.jpg';
    if (size === 'large') {
      ext = '_b.jpg';
    }
    return 'https://c' + photoObj.farm + '.staticflickr.com/' + photoObj.farm
      + '/' + photoObj.server + '/' + photoObj.id + '_' + photoObj.secret + ext; // "+ _h"
  }

  // Build HTML.
  function buildPhoto(photo, templateHtml) {
    var container = document.createElement('DIV');
    container.className = 'left hidden';
    container.innerHTML = templateHtml;
    for (var prop in photo) {
      var el = container.querySelector('[data-prop*="' + prop + '"]')
      if (!el) {
        continue;
      }
      var keyVal = el.getAttribute('data-prop').split(':');
      var key = keyVal[0].trim();
      var val = keyVal[1].trim();
      if (key.split('-')[0] === 'data') {
        el.setAttribute(key, photo[val]);
      } else {
        el[key] = photo[val];
      }

      // Show el once image loads.
      if (key === 'src') {
        el.onload = function() {
          el.parentNode.parentNode.classList.remove('hidden');
        }
      }
    }

    return container;
  }

  function buildHTML(photos) {
    var gallery = document.querySelector('.js-gallery');
    var templateHtml = document.querySelector('#image-template').innerHTML;

    var arr = [];
    each.call(photos, function(photo, i) {
      var data = {
        thumbnailImg: buildURL(photo),
        largeImg: buildURL(photo, 'large'),
        title: photo.title
      };
      arr.push(data);
      var el = buildPhoto(data, templateHtml);

      gallery.appendChild(el);

      // At the end.
      if (i === photos.length - 1) {
        initializePreview(document, arr);
      }
    });
  }

  // Get Data (Ajax).
  var xhr = new XMLHttpRequest();
  var userId = '141551706@N07';
  xhr.open('GET', encodeURI('https://api.flickr.com/services/rest/?&method=flickr.people.getPublicPhotos&format=json&nojsoncallback=1&api_key=5c1f1af33b907a0e7e1bb79b5b0a5fee&user_id=' + userId));
  xhr.onload = function() {
    var response = {};

    if (xhr.status !== 200) {
      console.error('Failed with status of ' + xhr.status);
    }

    try {
      response = JSON.parse(xhr.responseText);
    } catch (e) {
      console.error(e);
    }

    if (response.photos && response.photos.photo.length) {
      buildHTML(response.photos.photo);
    } else {
      console.error('You don\'t have any public photos');
    }
  };
  xhr.send();

}(window));
