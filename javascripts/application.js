// Instantiate an empty object.
var Instagram = {};

// Small object for holding important configuration data.
Instagram.Config = {
  clientID: 'f27f215ef85c4901b036967c49f1a4f8',
  apiHost: 'https://api.instagram.com'
};


// ************************
// ** Main Application Code
// ************************

// HTML markup goes here, please!
(function(){
  var photoTemplate, resource;

  function init(){
    bindEventHandlers();
    photoTemplate = _.template($('#photo-template').html());
  }

  function toTemplate(photo){
    photo = {
      count: photo.likes.count,
      avatar: photo.user.profile_picture,
      photo: photo.images.low_resolution.url,
      url: photo.link
    };

    return photoTemplate(photo);
  }

  function toScreen(photos){
    var photos_html = '';

    $('.paginate a').attr('data-max-tag-id', photos.pagination.next_max_id)
                    .fadeIn();

    $.each(photos.data, function(index, photo){
      photos_html += toTemplate(photo);
    });

    $('div#photos-wrap').append(photos_html);
  }

  function generateResource(tag){
    var config = Instagram.Config, url;

    if(typeof tag === 'undefined'){
      throw new Error("Resource requires a tag. Try searching for cats.");
    } else {
      // Make sure tag is a string, trim any trailing/leading whitespace and take only the first 
      // word, if there are multiple.
      tag = String(tag).trim().split(" ")[0];
    }

    url = config.apiHost + "/v1/tags/" + tag + "/media/recent?callback=?&client_id=" + config.clientID;

    return function(max_id){
      var next_page;
      if(typeof max_id === 'string' && max_id.trim() !== '') {
        next_page = url + "&max_id=" + max_id;
      }
      return next_page || url;
    };
  }

  function paginate(max_id){    
    $.getJSON(generateUrl(tag), toScreen);
  }

  function search(tag){
    resource = generateResource(tag);
    $('.paginate a').hide();
    $('#photos-wrap *').remove();
    fetchPhotos();
  }

  function fetchPhotos(max_id){
    $.getJSON(resource(max_id), toScreen);
  }

  function bindEventHandlers(){
    $('body').on('click', '.paginate a.btn', function(){
      var tagID = $(this).attr('data-max-tag-id');
      fetchPhotos(tagID);
      return false;
    });

    // Bind an event handler to the `submit` event on the form
    $('form').on('submit', function(e){

      // Stop the form from fulfilling its destinty.
      e.preventDefault();

      // Extract the value of the search input text field.
      var tag = $('input.search-tag').val().trim();

      // Invoke `search`, passing `tag` (unless tag is an empty string).
      if(tag) {
        search(tag);
      };

    });

  }

  function showPhoto(p){
    $(p).fadeIn();
  }

  // Public API
  Instagram.App = {
    search: search,
    showPhoto: showPhoto,
    init: init
  };
}());

$(function(){
  Instagram.App.init();
  
  // Start with a search on cats; we all love cats.
  Instagram.App.search('cats');  
});


Instagram.Template.Views = {

  "photo": "<div class='photo'>" +
            "<a href='{url}' target='_blank'><img class='main' src='{photo_url}' width='250' height='250' /></a>" +
            "<img class='avatar' width='40' height='40' src='{avatar_url}' />" +
            "<span class='heart'><strong>{like_count}</strong></span>" +
          "</div>"
};


function toTemplate(photo){
    photo = {
        like_count: photo.likes.count,
        avatar_url: photo.user.profile_picture,
        photo_url: photo.images.low_resolution.url,
        url: photo.link
    };

    return Instagram.Template.generate(Instagram.Template.Views["photo"], photo);
}

// A simple (it does the job) function for template parsing.
Instagram.Template.generate = function(template, photo){

  // Define variable for regular expression.
  var re;

  // Loop through the passed photo object.
  for(var attribute in photo){

    // Generate a regular expression.
    re = new RegExp("{"+attribute+"}","g");

    // Apply the regular expression instance with 'replace'.
    template = template.replace(re, photo[attribute]);
  }

  return template;
};

(function(){

    function toScreen(photos){

          // Using jQuery's generic iterator function:
          // jQuery.each http://api.jquery.com/jQuery.each/

        $.each(photos.data, function(index, photo){

            // I'll construct the image tag on the fly.
            // The images property contains objects representing images of
            // varying quality. I'll give low_resulution a try.
            // Appending new photos to the bottom of 'body' - new stuff isn't visible
            // unless you scroll down the page. I want to 'prepend'!
            
            photo = toTemplate(photo);
            $('div#photos-wrap').prepend(photo);
        });
    }

    function search(tag){
        var url = 'https://api.instagram.com/v1/tags/' + tag + '/media/recent?callback=?&amp;client_id=f27f215ef85c4901b036967c49f1a4f8&max_tag_id=1402777061457611'
        $.getJSON(url, toScreen);
    }

    Instagram.search = search;
})();

Instagram.search('cats');





