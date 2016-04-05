(function(window) {

  var each = [].forEach;
  var indexOf = [].indexOf;

  function initializePreview(document, photos) {
    var previewContainer = document.querySelector('.js-preview-container');
    var previewImage = document.querySelector('.js-preview-image');
    var previewTitle = document.querySelector('.js-preview-title');
    var previewPrev = document.querySelector('.js-preview-controls--prev');
    var previewNext = document.querySelector('.js-preview-controls--next');
    var selectors = document.querySelectorAll('[data-box-image]');
    var hiddenClass = 'hidden';

    var photo = {};

    function findPhoto(photos, url) {
      return photos.filter(function(photo) {
        return photo.largeImg === url;
      })[0] || {};
    }

    function showPhoto(event, el) {
      var url = el.getAttribute('data-box-image');
      var p = findPhoto(photos, url);
      previewImage.src = url;
      previewTitle.textContent = p.title;
      previewImage.onload = function() {
        previewContainer.classList.remove(hiddenClass);
      }
      event.preventDefault();
    }

    document.body.addEventListener('click', function(e) {
      var el = e.target;
      console.log(e)

      if (el === previewContainer) {
        previewContainer.classList.add(hiddenClass)
      }

      if (el.nodeName === 'IMG') {
        el = el.parentNode;
      }

      if (indexOf.call(selectors, el) !== -1) {
        showPhoto(event, el);
      }

      // Listen for clicks on previous button.
      if (el === previewPrev) {

      }

    });

    // Listen for close events.
  }

  // Tranform Data.
  function buildURL(photoObj, size) {
    var ext = '_n.jpg';
    if (size === 'large') {
      ext = '_h.jpg';
    }
    return 'https://c' + photoObj.farm + '.staticflickr.com/' + photoObj.farm
      + '/' + photoObj.server + '/' + photoObj.id + '_' + photoObj.secret + ext; // "+ _h"
  }
  // https://c4.staticflickr.com/4/3658/3596031283_d41cbca1e2_b.jpg

  // Build HTML.
  function buildPhoto(photo, templateHtml) {
    var container = document.createElement('DIV');
    container.className = 'inline-block hidden';
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
    // var img = container.querySelector('[data-prop="src"]')
    // img.src = buildURL(photo);
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

    console.log(response.photos)
    if (response.photos && response.photos.photo.length) {
      buildHTML(response.photos.photo);
    } else {
      console.error('You don\'t have any public photos');
    }
  };
  xhr.send();

}(window));
