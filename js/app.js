/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

"use strict";

var App = {
  init: function init() {
    // Login form
    this.loginInfo = document.getElementById('login-info');
    this.loginForm = document.getElementById('login-form');
    this.tokenId = document.getElementById('tokenId');
    this.tokenKey = document.getElementById('tokenKey');
    this.tokenHost = document.getElementById('tokenHost');
    this.loginButton = document.getElementById('login-button');
    this.loginButton.addEventListener('click', this.logIn.bind(this));
    this.signUpButton = document.getElementById('signup-button');
    this.signUpButton.addEventListener('click', this.signUp.bind(this));

    // Models form
    this.modelsInfo = document.getElementById('models-info');
    this.modelsList = document.getElementById('modelsList');

    // Model form
    this.modelInfo = document.getElementById('model-info');
    this.recordsList = document.getElementById('recordsList');
    this.addRecordButton = document.getElementById('add-record-button');
    this.addRecordButton.addEventListener('click', this.addRecord.bind(this));
    this.exportAsJsonLink = document.getElementById('export-model');
    this.exportAsJsonLink.addEventListener('click', this.exportModel.bind(this));

    // Put Record
    this.putRecordInfo = document.getElementById('put-record-info');
    this.putRecordForm = document.getElementById('put-record-form');
    this.putRecordButton = document.getElementById('put-record-button');
    this.putRecordButton.addEventListener('click', this.putRecord.bind(this));
    this.deleteRecordButton = document.getElementById('delete-record-button');
    this.deleteRecordButton.addEventListener('click', this.deleteRecord.bind(this));

    // Reset
    this.resetButton = document.getElementById('reset-button');
    this.resetButton.addEventListener('click', this.reset.bind(this));

    // Setup
    this.tokenId.value = sessionStorage.tokenId || '';
    this.tokenKey.value = sessionStorage.tokenKey || '';
    this.tokenHost.value = sessionStorage.host || 'http://localhost:8000';
  },

  hideAllForms: function hideAllForm() {
    this.loginInfo.classList.add('hidden');
    this.modelsInfo.classList.add('hidden');
    this.modelInfo.classList.add('hidden');
    this.putRecordInfo.classList.add('hidden');
    this.resetButton.classList.remove('hidden');
  },

  showLoginInfo: function showModelsInfo() {
    this.hideAllForms();
    this.resetButton.classList.add('hidden');
    this.loginInfo.classList.remove('hidden');
  },

  showModelsInfo: function showModelsInfo() {
    this.hideAllForms();
    this.modelsInfo.classList.remove('hidden');
  },

  showModelInfo: function showModelInfo() {
    this.hideAllForms();
    $("#model-info h3").text(this.currentModel.definition.title);
    this.modelInfo.classList.remove('hidden');
  },

  showPutRecordInfo: function showPutRecordInfo() {
    this.hideAllForms();
    this.putRecordInfo.classList.remove('hidden');
  },

  reset: function reset() {
    if (this.currentModel !== undefined) {
      if (this.modelInfo.classList.contains("hidden")) {
        this.getRecords(this.currentModel.id);
      } else {
        this.currentModel = undefined;
        this.logIn();
      }
    } else {
      this.showLoginInfo();
    }
  },

  signOut: function signOut() {
    this.showLoginInfo();
  },

  logIn: function logIn() {
    sessionStorage.tokenId = this.tokenId.value;
    sessionStorage.tokenKey = this.tokenKey.value;
    sessionStorage.host = this.tokenHost.value;

    this.session = new Daybed.Session(sessionStorage.host, {
      id: sessionStorage.tokenId,
      key: sessionStorage.tokenKey
    });

    this.session.getModels().then(function(models) {
      var modelList = $("#models-list");
      if (models.length === 0) {
        modelList.html("<li>No models yet.</li>");
      } else {
        modelList.html("");
        for (var i = 0; i < models.length; i++) {
          var item = models[i];
          var li = $(
            '<li><a href="#" title="' + item.description + '">' +
              item.title + '</a></li>');
          li.click(function() {
            this.getRecords(item.id);
          }.bind(this));
          modelList.append(li);
        }
      }
      this.showModelsInfo();
    }.bind(this));
  },

  signUp: function signUp() {
    Daybed.getToken(this.tokenHost.value).then(function(resp) {
      this.tokenId.value = resp.credentials.id;
      this.tokenKey.value = resp.credentials.key;
      this.showLoginInfo();
    }.bind(this));
  },

  getRecords: function getRecords(modelname) {
    this.session.getModel(modelname)
    .then(function(model) {
      // 1. Get definition to obtain the main field
      this.currentModel = model;
      this.currentModel.id = modelname;
      var mainfield = model.definition.fields[0].name;

      // 2. Display a list of records
      var recordsList = $("#records-list");
      var records = model.records;
      if (records.length === 0) {
        recordsList.html("<li>No records yet.</li>");
      } else {
        recordsList.html("");
        for (var i = 0; i < records.length; i++) {
          var record = records[i];
          var li = $(
            '<li><a href="#">' + record[mainfield] + "</a></li>"
          );
          li.click(function() {
            this.getRecord(record);
          }.bind(this));
          recordsList.append(li);
        }
      }
      this.showModelInfo(modelname);
    }.bind(this));
  },

  exportModel: function exportModel() {
    var exportModelLink = $("#export-model");
    var model = JSON.parse(JSON.stringify(this.currentModel));
    delete model.id;
    exportModelLink.attr('href', 'data:,' + JSON.stringify(model));
    exportModelLink.attr('download', this.currentModel.id + '.json');
    return true;
  },

  addRecord: function addRecord() {
    // 1. Build the form form the definition
    var putRecordForm = $(this.putRecordForm).html("");
    var fields = this.currentModel.definition.fields;
    var input;
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.type === "enum") {
        var select = $('<select name="' + field.name + '"></select>');
        for(var j = 0; j < field.choices.length; j++) {
          select.append($("<option>" + field.choices[j] + "</option>"));
        }
        input = $("<label>" + field.label +' </label>');
        input.append(select);
      } else {
        input = $(
          "<label>" + field.label +
            ' <input type="text" name="' + field.name + '"/></label>'
        );
      }
      putRecordForm.append(input);
    }
    input = $('<input type="hidden" name="id"/></label>');
    putRecordForm.append(input);
    this.deleteRecordButton.classList.add('hidden');
    this.showPutRecordInfo();
  },

  getRecord: function getRecord(record) {
    this.addRecord();
    for(var key in record) {
      $("#put-record-form select[name='" + key + "']").val(record[key]);
      $("#put-record-form input[name='" + key + "']").val(record[key]);
    }
    this.deleteRecordButton.classList.remove('hidden');
  },

  putRecord: function putRecord() {
    var record = {};
    $("#put-record-form input").each(function(index, input) {
      record[$(input).attr("name")] = $(input).val();
    });
    $("#put-record-form select").each(function(index, input) {
      record[$(input).attr("name")] = $(input).val();
    });
    this.session.addRecord(this.currentModel.id, record)
    .then(function() {
      this.getRecords(this.currentModel.id);
    }.bind(this));
  },

  deleteRecord: function deleteRecord() {
    if (confirm("Are you sure?")) {
      this.session.deleteRecord(this.currentModel.id,
                                $("#put-record-form input[name='id']").val())
      .then(function() {
        this.getRecords(this.currentModel.id);
      }.bind(this));
    }
  }
};

window.addEventListener('DOMContentLoaded', function onload() {
  window.removeEventListener('DOMContentLoaded', onload);
  App.init();
});
