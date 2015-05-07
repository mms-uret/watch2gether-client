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

        $('#contact-container button').on('click', function() {
            var output = $('#contact-container .output');
            output.html("");
            navigator.contacts.find(
                ["displayName", "name"],
                function(contacts) {
                    $.each(contacts, function(){
                        output.html(output.html() + "<br>" + this.name.formatted);
                    });
                },
                function() {
                    alert('error');
                }
            );
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
      $('#program-list li').show();
      $('#program-list li').filter(function (index) {
        return $(this).html().toLowerCase().indexOf(inputValue.toLowerCase()) < 0;
      }).hide();
    },

    // Update DOM on a Received Event
    renderProgram: function () {
        var $container = $('#program-list');

        $.ajax({
            url: 'data/channel.xml',
            type: "GET",
            success: function(data) {
              $(data).find('program').each(function(){
                var programTitle = $(this).find("title").text();


                $container.append('<li>' + programTitle + '</li>');
              });
            },
            error: function(jqXHR, textStatus, errorThrown) {

            }
        });
    },

    renderContacts: function () {

    }
};
