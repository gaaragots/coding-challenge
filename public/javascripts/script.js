/**
 * This is the getPhoto library
 */
function makeFacebookPhotoURL( id, accessToken ) {
  return 'https://graph.facebook.com/' + id + '/picture?access_token=' + accessToken;
}
function login( callback ) {
  FB.login(function(response) {
    if (response.authResponse) {
      //console.log('Welcome!  Fetching your information.... ');
      if (callback) {
        callback(response);
      }
    } else {
      console.log('User cancelled login or did not fully authorize.');
    }
  },{scope: 'user_photos'} );
}
function getAlbums(userId, callback ) {
  FB.api(
      '/' + userId + '/albums',
      {fields: 'id,cover_photo'},
      function(albumResponse) {
        //console.log( ' got albums ' );
        if (callback) {
        console.log(albumResponse);
          callback(albumResponse);
        }
      }
    );
}
function getPhotosForAlbumId( albumId, callback ) {
  FB.api(
      '/'+albumId+'/photos',
      {fields: 'id'},
      function(albumPhotosResponse) {
        //console.log( ' got photos for album ' + albumId );
        if (callback) {
          callback( albumId, albumPhotosResponse );
        }
      }
    );
}
function getLikesForPhotoId( photoId, callback ) {
  FB.api(
      '/'+albumId+'/photos/'+photoId+'/likes',
      {},
      function(photoLikesResponse) {
        if (callback) {
          callback( photoId, photoLikesResponse );
        }
      }
    );
}
function getPhotos(callback) {
  var allPhotos = [];
  var accessToken = '';
  login(function(loginResponse) {
      accessToken = loginResponse.authResponse.accessToken || '';
      userID = loginResponse.authResponse.userID;
      getAlbums(userID, function(albumResponse) {
          var i, album, deferreds = {}, listOfDeferreds = [];
          for (i = 0; i < albumResponse.data.length; i++) {
            album = albumResponse.data[i];
            deferreds[album.id] = $.Deferred();
            listOfDeferreds.push( deferreds[album.id] );
            getPhotosForAlbumId( album.id, function( albumId, albumPhotosResponse ) {
                var i, facebookPhoto;
                for (i = 0; i < albumPhotosResponse.data.length; i++) {
                  facebookPhoto = albumPhotosResponse.data[i];
                  allPhotos.push({
                    'id'  : facebookPhoto.id,
                    'added' : facebookPhoto.created_time,
                    'url' : makeFacebookPhotoURL( facebookPhoto.id, accessToken )
                  });
                }
                deferreds[albumId].resolve();
              });
          }
          $.when.apply($, listOfDeferreds ).then( function() {
            if (callback) {
              callback( allPhotos );
            }
          }, function( error ) {
            if (callback) {
              callback( allPhotos, error );
            }
          });
        });
    });
}

/**
 * This is the bootstrap / app script
 */
// wait for DOM and facebook auth
var docReady = $.Deferred();
var facebookReady = $.Deferred();
$(document).ready(docReady.resolve);
window.fbAsyncInit = function() {
  FB.init({
    appId      : '1960354484198795',
    channelUrl : '//conor.lavos.local/channel.html',
    status     : true,
    cookie     : true,
    xfbml      : true
  });
  facebookReady.resolve();
};

Vue.component('my-pic', {
  // The todo-item component now accepts a
  // "prop", which is like a custom attribute.
  // This prop is called todo.
  props: ['pic'],
  template: '<img v-bind:src="pic.url" />'
})

var app = new Vue({
  el: '#fb-root',
  data: {
    pictures: {
      id: 0,
      url: ''
    },
    showLoader: false
  },
  methods: {
    getPicturs: function (data) {
      this.pictures = data;
      this.showLoader = false;
    },
    getPhotos: function() {
      this.showLoader = true;
      $.when(docReady, facebookReady).then(function() {
        if (typeof getPhotos !== 'undefined') {
          getPhotos( function( photos ) {
            app.getPicturs(photos);
          });
        }
      });
    },
    facebookLogout: function() {
      this.showLoader = true;
      this.pictures = {
        id: 0,
        url: ''
      };
      FB.logout(function(response) {
        
      });
      this.showLoader = false;
    }
  }
})