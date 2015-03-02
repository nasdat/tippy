// Generated by CoffeeScript 1.7.1
(function() {
  var days, defaultRanking, format, getDate, getMonth, loadImages, loadOptions, months, populateTabList, randomize, saveOptions, startTime, truncate, workmode;

  randomize = function(arr) {
    var curIndex, randIndex, tempVal, _results;
    curIndex = arr.length;
    _results = [];
    while (0 !== curIndex) {
      randIndex = Math.floor(Math.random() * curIndex);
      curIndex -= 1;
      tempVal = arr[curIndex];
      arr[curIndex] = arr[randIndex];
      _results.push(arr[randIndex] = tempVal);
    }
    return _results;
  };

  format = function(time) {
    if (time < 10) {
      return '0' + time;
    } else {
      return time;
    }
  };

  getDate = function(d) {
    return format(d.getDate());
  };

  getMonth = function(d) {
    return format(d.getMonth() + 1);
  };

  truncate = function(string) {
    if (string.length > 30) {
      return string.substring(0, 30) + '...';
    } else {
      return string;
    }
  };

  startTime = function() {
    var d, h, m, s;
    d = new Date();
    h = format(d.getHours());
    m = format(d.getMinutes());
    s = format(d.getSeconds());
    $('#time').text(h + ' ' + m + ' ' + s);
    return setTimeout((function() {
      return startTime();
    }), 500);
  };

  defaultRanking = 'Daily';

  workmode = "off";

  loadOptions = function() {
    var ranking;
    ranking = localStorage['rankingType'];
    if (ranking == null) {
      ranking = defaultRanking;
    }
    $('input[name=pgata]:radio').each(function() {
      if ($(this)[0].value === ranking) {
        return $(this)[0].checked = true;
      }
    });
    workmode = localStorage['workMode'];
    console.log(localStorage['workMode']);
    if (workmode == null) {
      workmode = "off";
    }
    if (workmode === "on") {
      return $('input[name="wmode"]').prop("checked", true);
    }
  };

  saveOptions = function() {
    $('input[name=pgata]:radio').each(function() {
      if ($(this)[0].checked) {
        return localStorage['rankingType'] = $(this)[0].value;
      }
    });
    localStorage['workMode'] = workmode;
    return console.log(localStorage['workMode']);
  };

  loadImages = function(ranking) {
    var d, date, items, json, req, rurl, timestamp;
    switch (ranking) {
      case 'Daily':
        rurl = '/pixiv_daily.json';
        break;
      case 'Weekly':
        rurl = '/pixiv_weekly.json';
        break;
      case 'Monthly':
        rurl = '/pixiv_monthly.json';
        break;
      case 'Rookie':
        rurl = '/pixiv_rookie.json';
        break;
      case 'Original':
        rurl = '/pixiv_original.json';
        break;
      default:
        rurl = '/pixiv_daily.json';
    }
    d = new Date();
    date = getDate(d);
    if (date === 1) {
      date === 29;
    }
    timestamp = d.getFullYear().toString() + getMonth(d) + format(date - 1);
    json = 'http://cdn-pixiv.lolita.tw/rankings/' + timestamp + rurl;
    items = [];
    if (workmode === "off") {
      req = $.getJSON(json, function(response) {
        var i, val, _results;
        i = 0;
        randomize(response);
        _results = [];
        while (i < 30) {
          val = response[i];
          items.push("<div style='display: none' class='pxvimg'><a href='" + val['url'] + "'><img src='" + val['img_url'] + "'></a></div>");
          _results.push(i++);
        }
        return _results;
      });
      $('#loader').fadeIn(400);
      return $('#content').fadeOut(400, function() {
        $('#content').empty();
        $('#content').show();
        return req.complete(function() {
          d = $('<div/>', {
            'id': 'img-list',
            'html': items.join('')
          });
          return d.appendTo('#content').each(function() {
            return $('#img-list').waitForImages(function() {
              $('#loader').fadeOut(400);
              $('#img-list').isotope({
                'itemSelector': '.pxvimg'
              });
              return $('.pxvimg').each(function(index) {
                return $(this).delay(100 * index).fadeIn(400);
              });
            });
          });
        });
      });
    } else {
      return $('#loader').fadeOut(400);
    }
  };

  populateTabList = function() {
    return chrome.sessions.getRecentlyClosed(function(sessions) {
      var i, session, tabs;
      $('#nodev').hide();
      i = 0;
      tabs = [];
      while (i < 10) {
        session = sessions[i];
        if ((session.tab != null) && session.tab.url.substring(0, 9) !== 'chrome://') {
          tabs.push("<div class='rc-link'><a href='" + session.tab.url + "'>" + truncate(session.tab.title) + "</a></div>");
        }
        i++;
      }
      return $('<div/>', {
        'id': 'rc-list',
        'html': tabs.join('')
      }).appendTo('#rc-panel');
    });
  };

  days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  $(document).ready(function() {
    var closeMenu, d, debounce;
    startTime();
    loadOptions();
    d = new Date();
    $('#date').text(days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate());
    loadImages(localStorage['rankingType']);
    debounce = null;
    $('#settings').click(function() {
      $('#sp-wrapper').fadeIn(400);
      return $('#blackout').fadeIn(400);
    });
    $('#dismiss').click(function() {
      $('#sp-wrapper').fadeOut(400);
      return $('#blackout').fadeOut(400);
    });
    $('#rc-panel, #rc-button').mouseleave(function() {
      return debounce = setTimeout(closeMenu, 400);
    });
    $('#rc-button, #rc-panel').mouseenter(function() {
      $('#rc-panel').fadeIn(400);
      return clearTimeout(debounce);
    });
    closeMenu = function() {
      $('#rc-panel').fadeOut(400);
      return clearTimeout(debounce);
    };
    $('input[type="radio"]').click(function() {
      saveOptions();
      return loadImages(localStorage['rankingType']);
    });
    $('input[name="wmode"]').change(function() {
      if (this.checked) {
        $('#content').fadeOut(400);
        workmode = "on";
      } else {
        $('#content').fadeIn(400);
        workmode = "off";
        loadImages(localStorage['rankingType']);
      }
      return saveOptions();
    });
    return populateTabList();
  });

}).call(this);
