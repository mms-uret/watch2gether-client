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
        });

        $('#invite').on('click', function(){
            var numbers = [];
            $('#contact-container .output .active .number').each(function(){
                numbers.push($(this).text());
            });
            console.log(numbers.join(', '));
        });

      $('#program-container .output').on('click', '.list-group-item', function() {
        $('#program-container .output').toggleClass('active', false);
        $(this).toggleClass('active');
      });

      $("#program-search").on("keyup", function(event){
        app.onSearch($(this).val());
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
      $('#program-container .list-group-item').show();
      $('#program-container .list-group-item').filter(function (index) {
        var programTitle = $(this).find('.title').html().toLowerCase();
        return programTitle.indexOf(inputValue.toLowerCase()) < 0;
      }).hide();
    },

    // Update DOM on a Received Event
    renderProgram: function () {
      var output = $('#program-container .output');
      var template = $('#program-container .template');

        $.ajax({
            url: 'data/channel.xml',
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
    $('#contact-container button').hide();
    $('#invite').removeClass('hide');
    navigator.contacts.find(
      ["displayName", "name"],
      function(contacts) {
        contacts = _.sortBy(contacts, function(contact) {return contact.name.formatted});
        $.each(contacts, function(){
          if (this.name.formatted && this.phoneNumbers) {
            var item = template.clone();
            item.find('.name').text(this.name.formatted);
            item.find('.number').text(this.phoneNumbers[0].value);
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
  }
};
