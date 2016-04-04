(function(window) {

  var each = [].forEach;
  var indexOf = [].indexOf;

  function initializePreview(document) {
    var previewContainer = document.querySelectorAll('.js-preview-container');
    var previewImage = document.querySelectorAll('.js-preview-image');
    var selectors = document.querySelectorAll('[data-box-image]');
    document.body.addEventListener('click', function(e) {
      if (indexOf.call(selectors, e.target) !== -1) {

      }
    })
  }

  // Tranform Data.
  function buildURL(photoObj) {
    return 'https://c' + photoObj.farm + '.staticflickr.com/' + photoObj.farm
      + '/' + photoObj.server + '/' + photoObj.id + '_' + photoObj.secret + '_n.jpg'; // "+ _h"
  }
  // https://c4.staticflickr.com/4/3658/3596031283_d41cbca1e2_b.jpg

  // Build HTML.
  function buildPhoto(photo, templateHtml) {
    var container = document.createElement('DIV');
    container.className = 'image-container hidden';
    container.innerHTML = templateHtml;
    for (var prop in photo) {
      var el = container.querySelector('[data-prop*="' + prop + '"]')
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
          el.parentNode.classList.remove('hidden');
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

    each.call(photos, function(photo) {
      var el = buildPhoto({
        thumbnailImg: buildURL(photo),
        title: photo.title
      }, templateHtml);

      gallery.appendChild(el);
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
