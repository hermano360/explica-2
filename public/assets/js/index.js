
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



   // $.ajax({
   //   url: "/artist",
   //   type: "POST",
   //   data: {name: searchQuery},
   //   success: function(res) {
   //     const artistInfo = JSON.parse(res).response.hits[0].result.primary_artist
   //
   //     $('.artist-art').css("background-image", 'url("' + artistInfo.image_url + '")')
   //     $('.artist-name').html(artistInfo.name)
   //      console.log(JSON.parse(res).response.hits[0].result.primary_artist.id)
   //      console.log(JSON.parse(res).response.hits[0].result.primary_artist.image_url)
   //      console.log(JSON.parse(res).response.hits[1].result.primary_artist.image_url)
   //      console.log(JSON.parse(res).response.hits[0].result.primary_artist.name)
   //
   //      $.ajax({
   //        url: "/artist-bio",
   //        type: "POST",
   //        data: {artistId: '55Aa2cqylxrFIXC767Z865'},
   //        success: function(res) {
   //          console.log(res)
   //        }
   //       });
   //
   //   }
   //  });
 })




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
