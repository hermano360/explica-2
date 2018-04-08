
 $( document ).ready(function() {
  var searchQuery = window.location.href.split("?").length > 1 ? window.location.href.split("?").pop() : "Lil%20Wayne"
    $.ajax({
           url: "/token",
           type: "GET",
           success: function(token) {
             $.ajax({
                 url: "https://api.spotify.com/v1/search?query="+searchQuery+"&type=artist&limit=1",
                 type: "GET",
                 beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + token);},
                 success: (res) => {
                   const artistInfo = res.artists.items[0]
                   $('.artist-art').css("background-image", 'url("' + artistInfo.images[0].url + '")')
                   $('.artist-name').html(artistInfo.name)
                   $.ajax({
                          url: "/artist-bio",
                          type: "POST",
                          data: {artistId: artistInfo.id},
                          success: function(bio) {
                            $('.artist-bio').html(bio)
                        }
                      })

                    $.ajax({
                        url: `https://api.spotify.com/v1/artists/${artistInfo.id}/top-tracks?country=US`,
                        type: "GET",
                        beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + token);},
                        success: (res) => {
                          res.tracks.forEach((track,i) => {
                            $(`.artist-popular-track.${i+1} .artist-popular-track-img img`).attr("src", track.album.images[2].url)
                            $(`.artist-popular-track.${i+1} .artist-popular-track-info .artist-popular-track-title`).text(track.name)
                            $(`.artist-popular-track.${i+1} .artist-popular-track-info .artist-popular-track-subtitle .name`).text(track.album.name)
                            $(`.artist-popular-track.${i+1} .artist-popular-track-info .artist-popular-track-subtitle .year`).text(extractReleaseYearFromDate(track.album.release_date))
                          })
                        }
                      })
                 }
               })

             }
           })

       $.ajax({
              url: "/twitter",
              type: "POST",
              data: {name: searchQuery},
              success: function(handle) {
                $('.artist-social-twitter').attr('href', `https://twitter.com/${handle}/`)
              }
            })
      $.ajax({
             url: "/facebook",
             type: "POST",
             data: {name: searchQuery},
             success: function(handle) {
               $('.artist-social-facebook').attr('href', handle)
             }
           })
       $.ajax({
              url: "/instagram",
              type: "POST",
              data: {name: searchQuery},
              success: function(handle) {
                $('.artist-social-instagram').attr('href', `https://www.instagram.com/${handle}/`)
              }
            })

            $(window).scroll(function () {

              console.log($(window).scrollTop());

              if ($(window).scrollTop() > 300) {
                $('.artist-nav-bar').addClass('fixed')
                $('.artist-nav-bar-placeholder').addClass('fixed')
              }

              if ($(window).scrollTop() < 300) {
                $('.artist-nav-bar').removeClass('fixed')
                $('.artist-nav-bar-placeholder').removeClass('fixed')
              }
            });
 })




 function extractReleaseYearFromDate(date) {
   let regex = /^(\d{4})-\d{2}-\d{2}$/
   return date.replace(regex, '$1')
 }




function roundMinutes(ms){
  var timeString = ''
  var hours = 0
  var minutes = 0
  if(ms > 3600000){
    hours = Math.floor(ms / 3600000)
  }
  if(ms > 60000) {
    minutes = Math.floor((ms % 3600000) / 60000 )
  }
  if(hours > 1){
    timeString += hours + ' hours '
  } else if(hours === 1) {
    timeString += hours + ' hour '
  }
  if(minutes > 1){
    timeString += minutes + ' minutes'
  } else if(minutes === 1) {
    timeString += minutes + ' minute'
  }

  if(hours === 0 && minutes === 0){
    timeString = '0 minutes'
  }
  return timeString
}

function totalMillisecondsInAlbum(track_collection){
  var totalMsCount = 0
  track_collection.forEach(function(track){
    totalMsCount += track.duration_ms
  })
  return totalMsCount
}
