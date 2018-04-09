$( document ).ready(function() {
  var audioObject = null
  var regex = /(\S*)#(\S*)/
  var searchQuery = window.location.href.split("?").length > 1 ? window.location.href.split("?").pop().replace(regex, '$1') : "Lil%20Wayne"
  $('.calendar-filter-year .date').html(`${convertMonthName(new Date().getMonth())} ${new Date().getFullYear()}`)
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
                          url: "/vividPerformerID",
                          type: "POST",
                          data: {name: artistInfo.name},
                          success: function(res) {
                            let performerId = JSON.parse(res).performerId
                            $.ajax({
                                   url: "/vividEvents",
                                   type: "POST",
                                   data: {id: performerId},
                                   success: function(res) {
                                     let vividEvents = JSON.parse(res).map(function(event){
                                       const eventDate = new Date(event.eventDate)
                                       return {
                                         month: eventDate.getMonth(),
                                         day: eventDate.getDate(),
                                         year: eventDate.getFullYear(),
                                         name: event.eventName,
                                         url: event.url,
                                         venue: event.venue.name,
                                         image: artistInfo.images[0].url
                                       }
                                     })

                                     $.ajax({
                                         url: `https://api.spotify.com/v1/browse/new-releases?country=US&offset=0&limit=50`,
                                         type: "GET",
                                         beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + token);},
                                         success: (res) => {

                                           let spotifyEvents = res.albums.items.filter(function(release){
                                             let match = false
                                             release.artists.forEach(function(artist){
                                               if (artist.name ===artistInfo.name) {
                                                 match = true
                                               }
                                             })
                                             return match

                                           }).map(function(release){
                                             const releaseDate = new Date((new Date(release.release_date).getTime() + 86400000))
                                             return {
                                               month: releaseDate.getMonth(),
                                               day: releaseDate.getDate(),
                                               year: releaseDate.getFullYear(),
                                               name: release.name,
                                               url: release.href,
                                               venue: release.type,
                                               image: release.images[0].url
                                             }
                                           })

                                           let completeEvents = []
                                           vividEvents.forEach(function(event){
                                             completeEvents.push(event)
                                           })
                                           spotifyEvents.forEach(function(event){
                                             completeEvents.push(event)
                                           })
                                           completeEvents.forEach(function(event){
                                             $('.calendar-dates').append(`
                                               <div class="calendar-event" data-year="${event.year}" data-month="${convertMonthName(event.month)}">
                                               <div class="date">
                                                 <div class="day">${event.day}</div>
                                                 <div class="month">${convertMonthName(event.month)}</div>
                                               </div>
                                               <div class="date-divider">
                                                 <div class="circle"></div>
                                               </div>
                                               <div class="event-object"></div>
                                               <div class="line-break event" data-year="${event.year}" data-month="${convertMonthName(event.month)}"></div>
                                             </div>

                                               `)
                                           })
                                           if(completeEvents.length > 1){
                                             $('.calendar-filter-year .date').html(`${convertMonthName(completeEvents[0].month)} ${completeEvents[0].year}`)
                                             hideEventsBasedOnMonthYear(convertMonthName(completeEvents[0].month),completeEvents[0].year)
                                           }

                                           extractMonthsFromList(completeEvents).forEach(function(calendarMonth){
                                             $('.dropdown-menu').append(`
                                               <li role="presentation"><a role="menuitem" tabindex="-1" class="menuitem" data-month="${calendarMonth.month}" data-year="${calendarMonth.year}">${calendarMonth.month} ${calendarMonth.year}</a></li>
                                               `)
                                           })
                                           extractMonthsFromList(completeEvents).forEach(function(calendarMonth){
                                             $('.menuitem').on('click', function(e){
                                               //filter out concerts based on date clicked
                                               hideEventsBasedOnMonthYear($(e.target).data('month'),$(e.target).data('year'))
                                               $('.calendar-filter-year .date').html(`${$(e.target).data('month')} ${$(e.target).data('year')}`)

                                             })
                                           })

                                         }
                                      })
                                   }
                             })
                          }
                    })



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
                            $(`.artist-popular-track.${i+1}`).data('audio', track.preview_url);
                            $(`.artist-popular-track.${i+1}`).on('click', function(e){
                              if($(`.artist-popular-tracks`).hasClass('playing')){
                                audioObject.pause()
                              } else {
                                if(audioObject){
                                  audioObject.pause()
                                }
                                let url = $(`.artist-popular-track.${i+1}`).data('audio')
                                if(url){
                                  audioObject = new Audio()
                                  audioObject.play()
                                  $(`.artist-popular-tracks`).addClass('playing')
                                  audioObject.addEventListener('ended', function(){
                                    $(`.artist-popular-tracks`).removeClass('playing')
                                  })
                                  audioObject.addEventListener('pause', function(){
                                    $(`.artist-popular-tracks`).removeClass('playing')
                                  })
                                } else {
                                  console.log('song not available')
                                }
                              }
                            })
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
        if ($(window).scrollTop() > 287) {
          $('.artist-nav-bar-container').addClass('fixed')
          $('.artist-nav-bar-placeholder').addClass('fixed')
        } else {
          $('.artist-nav-bar-container').removeClass('fixed')
          $('.artist-nav-bar-placeholder').removeClass('fixed')
        }
      });


      var $popular = $('.artist-nav-bar-item.popular').on('click', function(){
        removeActiveNavButtons()
        $popular.addClass('active')
        $('html, body').animate({
            scrollTop: $("#popular").offset().top - $('.artist-nav-bar-container').height()
        }, 500);
        $(".artist-nav-bar").animate({
            scrollLeft: 0
        }, 500);
      })
      var $calendar = $('.artist-nav-bar-item.calendar').on('click', function(){
        removeActiveNavButtons()
        $calendar.addClass('active')
        $('html, body').animate({
            scrollTop: $("#calendar").offset().top - $('.artist-nav-bar-container').height()
        }, 500);
      })
      var $albums = $('.artist-nav-bar-item.albums').on('click', function(){
        removeActiveNavButtons()
        $albums.addClass('active')
        $('html, body').animate({
            scrollTop: $("#albums").offset().top - $('.artist-nav-bar-container').height()
        }, 500);
      })
      var $related = $('.artist-nav-bar-item.related').on('click', function(){
        removeActiveNavButtons()
        // $(".artist-nav-bar").scrollLeft(42)
        $related.addClass('active')
        $('html, body').animate({
            scrollTop: $("#related").offset().top - $('.artist-nav-bar-container').height()
        }, 500);
        $(".artist-nav-bar").animate({
            scrollLeft: 100
        }, 500);
      })

      function removeActiveNavButtons(){
        $popular.removeClass('active')
        $calendar.removeClass('active')
        $albums.removeClass('active')
        $related.removeClass('active')
      }
 })




 function extractReleaseYearFromDate(date) {
   let regex = /^(\d{4})-\d{2}-\d{2}$/
   return date.replace(regex, '$1')
 }

 function convertMonthName(monthIndex){
   return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthIndex]
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

extractMonthsFromList = (eventList) => {
  let monthCollection = []
  eventList.forEach(function(event){

    if(!monthCollection.includes(`${event.year}-${event.month+1}-02`)){
      monthCollection.push(`${event.year}-${event.month+1}-02`)
    }
  })
  return monthCollection.map(function(monthYear){
    let discreteMonth = new Date(monthYear)

    return {
      month: convertMonthName(discreteMonth.getMonth()),
      year: discreteMonth.getFullYear()
    }
  })
}

function hideEventsBasedOnMonthYear(month,year){

  Array.prototype.forEach.call($('.calendar-event'), function (item) {
    $(item).addClass('hide-calendar-event')
  });
  Array.prototype.forEach.call($('.line-break.event'), function (item) {
    $(item).addClass('hide-calendar-event')
  });

  Array.prototype.forEach.call($('.calendar-event'), function (item) {
    if($(item).data('month') === month && $(item).data('year') === year){
      $(item).removeClass('hide-calendar-event')
    }
  });
  Array.prototype.forEach.call($('.line-break.event'), function (item) {
    if($(item).data('month') === month && $(item).data('year') === year){
      $(item).removeClass('hide-calendar-event')
    }
  });

  console.log(month, year)
}
