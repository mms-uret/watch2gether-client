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
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $('#contact-container button').on('click', this.renderContacts);
        $('#contact-container .output').on('click', '.list-group-item', function(){
            $(this).toggleClass('active');
            $('#invite').toggleClass('hide', false);
        });

        $('#invite').on('click', function(){
            var numbers = [];
            $('#contact-container .output .active .number').each(function(){
                numbers.push($(this).text());
            });
            console.log(numbers.join(', '));
        });

      $('#program-container .output').on('click', '.list-group-item', function() {
        app.renderContacts();
      });

      $(".list-search").on("keyup", function(event) {
        app.onSearch($(this).val());
      });

      $("#back2Programs").on("click", function(event) {
        app.renderProgram();
      });

      $("#invite").on("click", function(event) {
        var senderNumber = '+41788914362',
          receiverNumber = '+41788914362',
          senderName = "Burim",
          clientId = "7V3QbSNyGonv4wETAIltvnN5bPYZbgyk",
          message = "Test sms";

        $('#program-container').toggleClass('hide', true);
        $('#contact-container').toggleClass('hide', true);
        $('#back2Programs').toggleClass('hide', true);
        $('#invite').toggleClass('hide', true);
        $('#navLabel').text('SMS senden');

        app.sendSMS(receiverNumber, senderNumber, senderName, clientId, message);
      });
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
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

  sendSMS: function(number, senderNumber, senderName, clientId, message) {

    var url = 'https://api.swisscom.com/v1/messaging/sms/outbound/tel:' + senderNumber + '/requests';

    $('#sms-container').toggleClass('hide', false);
    $('#sms-info').html('SMS wird gesendet ...');
    $('#sms-info').append('<br/>nummer: ' + number);
    $('#sms-info').append('<br/>senderNummer: ' + senderNumber);
    $('#sms-info').append('<br/>senderName: ' + senderName);
    $('#sms-info').append('<br/>clientId: ' + clientId);
    $('#sms-info').append('<br/>message: ' + message);
    $('#sms-info').append('<br/>url: ' + url);

    $.ajax({
      url: url,
      type: "POST",
      dataType: 'json',
      contentType: 'application/json',
      Accept: 'application/json',
      processData: false,
      data: "{\"outboundSMSMessageRequest\":{\"senderAddress\":\"tel:" + senderNumber +
            "\", \"address\":[\"tel:" + number +
            "\"],\"outboundSMSTextMessage\":{\"message\":\"" + message +
            "\"},\"clientCorrelator\":\"any id\",\"senderName\":\"" + senderName + "\"}}",
      beforeSend: function(xhr) {
        xhr.setRequestHeader("client_id", clientId);
      },
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "client_id": clientId
      },
      success: function(data) {
        $('#sms-info').append('</br><br/>SMS ist gesendet worden');
      },
      error: function(jqXHR, textStatus, errorThrown) {
        $('#sms-info').append('</br><br/>Ein Fehler ist aufgetretten, statusText: ' +
            jqXHR.statusText + ', textStatus: ' + textStatus + ', error: ' + errorThrown);
      }
    });

  }
};
