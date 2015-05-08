/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        app.renderProgram();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        $('#contact-container button').on('click', this.renderContacts);
        $('#contact-container .output').on('click', '.list-group-item', function(){
            $(this).toggleClass('active');
            $('#invite').toggleClass('hide', false);
        });

      $('#program-container .output').on('click', '.list-group-item', function() {
          $(this).toggleClass('active');
          app.renderContacts();
      });

      $(".list-search").on("keyup", function(event) {
        app.onSearch($(this).val());
      });

      $("#back2Programs").on("click", function(event) {
        app.renderProgram();
      });

      $("#invite").on("click", function() {
          var numbers = [], number;
          $('#contact-container .output .active .info').each(function(){
              number = $(this).text();
              number = number.replace(/ /g, '');
              number = number.replace(/\+/g, '');
              if (number.substr(0, 1) == '0') {
                  number = '41' + number.substr(1);
              }
              numbers.push(number);
          });
          var show = $('#program-container .active');
          $('#sms-container').removeClass('hide');
          $('#contact-container').addClass('hide');
          $('#back2Programs').addClass('hide');
          $('#invite').addClass('hide');
          $('#navLabel').text('Fertig!');

          //app.sendEvent('SRF 1', show.attr('data-timestamp'), show.find('.title').text(), numbers);
          var now = new Date();
          app.sendEvent('SRF 1', (now.getTime() / 1000 + 120), show.find('.title').text(), numbers);
      });
    },


    onSearch: function(inputValue) {
      $('.list-group-item').show();
      $('.list-group-item').filter(function (index) {
        var title = $(this).find('.title').html().toLowerCase();
        return title.indexOf(inputValue.toLowerCase()) < 0;
      }).hide();
    },

    // Update DOM on a Received Event
    renderProgram: function () {

      $('#program-container').toggleClass('hide', false);
      $('#contact-container').toggleClass('hide', true);
      $('#back2Programs').toggleClass('hide', true);
      $('#navLabel').text('Sendungen');
      $('#program-container .output .list-group-item').toggleClass('active', false);

      var output = $('#program-container .output');
      var template = $('#program-container .template');
      output.html("");

      // channel url: http://ws.srf.ch/tvprogramm/query/broadcasts.xml?channel=33000&day=3077
      //var url = 'http://ws.srf.ch/tvprogramm/query/broadcasts.xml?channel=33000&day=3077';
      var url = 'data/channel.xml';

        $.ajax({
            url: url,
            type: "GET",
            success: function(data) {
              $(data).find('result').each(function(){
                var programTitle = $(this).find("title").text();
                var programDateStr = $(this).find("realDateTime").text();
                programDateStr = programDateStr.replace(/CEST/, '+0200');
                var programDate = new Date(programDateStr);
                var programDateOutput = programDate.toLocaleDateString() +
                  ', ' + programDate.getHours() +
                  ':' + programDate.getMinutes() + ' Uhr';

                var item = template.clone();
                item.find('.title').text(programTitle);
                item.find('.infos').text(programDateOutput);
                item.removeClass('hide');
                item.attr('data-timestamp', programDate.getTime() / 1000);
                output.append(item);

              });
            },
            error: function(jqXHR, textStatus, errorThrown) {

            }
        });
    },

  renderContacts: function() {
    var output = $('#contact-container .output');
    var template = $('#contact-container .template');
    output.html("");

    $('#program-container').toggleClass('hide', true);
    $('#contact-container').toggleClass('hide', false);
    $('#back2Programs').toggleClass('hide', false);
    $('#navLabel').text('Kontakte');

    $('#contact-container button').hide();
    $('#invite').removeClass('hide');
    navigator.contacts.find(
      ["displayName", "name"],
      function(contacts) {
        contacts = _.sortBy(contacts, function(contact) {return contact.name.formatted});
        $.each(contacts, function(){
          if (this.name.formatted && this.phoneNumbers) {
            var item = template.clone();
            item.find('.title').text(this.name.formatted);
            item.find('.info').text(this.phoneNumbers[0].value);
            item.removeClass('hide');
            output.append(item);
          }
        });
      },
      function() {
        alert('error');
      },
        {
            multiple: true
        }
    );
  },

  sendEvent: function(channel, time, show, numbers) {

    var data = {
        'channel': channel,
        'time': time,
        'show': show,
        'numbers': numbers
    };

    $.ajax({
      url: 'http://watch2gether.nova.scapp.io/watch2gether/event',
      type: "POST",
      dataType: 'json',
      contentType: 'application/json',
      Accept: 'application/json',
      processData: false,
      data: JSON.stringify(data),
      success: function() {
        var show = $('#program-container .active');
        var contacts = $('#contact-container .output .active');
        var infoBox = $('#success-container');
        infoBox.find('.show').html('Sendung: ' + show.find('title').text());
        infoBox.find('.time').html('Zeit: ' + show.find('infos').text());
        contacts.each(function(){
          infoBox.find('friends').append('<li>' + $(this).find('title').text());
        });
        infoBox.removeClass('hide');
      },
      error: function() {
        console.log('error');
      }
    });

  }
};
