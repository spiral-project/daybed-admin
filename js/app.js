/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

"use strict";

var App = {
  init: function init() {
    var self = this;

    // Login form
    this.loginInfo = document.getElementById('login-info');
    this.tokenId = document.getElementById('tokenId');
    this.tokenKey = document.getElementById('tokenKey');
    this.tokenHost = document.getElementById('tokenHost');
    this.loginForm = document.getElementById('login-form');
    this.loginForm.addEventListener('submit', this.logIn.bind(this));
    this.loginButton = document.getElementById('login-button');
    this.loginButton.addEventListener('click', this.logIn.bind(this));
    this.signUpButton = document.getElementById('signup-button');
    this.signUpButton.addEventListener('click', this.signUp.bind(this));

    // Models form
    this.modelsInfo = document.getElementById('models-info');

    // Model form
    this.modelInfo = document.getElementById('model-info');
    this.addRecordButton = document.getElementById('add-record-button');
    this.addRecordButton.addEventListener('click', this.addRecord.bind(this));
    this.managePermissionsButton = document.getElementById('permissions-button');
    this.managePermissionsButton.addEventListener('click', this.getPermissions.bind(this));
    this.exportAsJsonLink = document.getElementById('export-model');
    this.exportAsJsonLink.addEventListener('click', this.exportModel.bind(this));

    // Put Record
    this.putRecordInfo = document.getElementById('put-record-info');
    this.putRecordForm = document.getElementById('put-record-form');
    this.putRecordForm.addEventListener('submit', this.putRecord.bind(this));
    this.putRecordButton = document.getElementById('put-record-button');
    this.putRecordButton.addEventListener('click', this.putRecord.bind(this));
    this.deleteRecordButton = document.getElementById('delete-record-button');
    this.deleteRecordButton.addEventListener('click', this.deleteRecord.bind(this));

    // Tokens management
    this.tokensInfo = document.getElementById('tokens-info');
    this.tokensList = document.getElementById('tokens-list');
    this.addTokenButton = document.getElementById('add-token-button');
    this.addTokenButton.addEventListener('click', this.getPermission.bind(this));

    // Token permission form
    this.tokenInfo = document.getElementById('put-permission-info');
    this.tokenForm = document.getElementById('put-permission-form');
    this.tokenForm.addEventListener('submit', this.patchPermissions.bind(this));
    this.putPermissionsButton = document.getElementById('put-permissions-button');
    this.putPermissionsButton.addEventListener('click', this.patchPermissions.bind(this));
    $("#put-permission-form h4").click(function(event) {
      event.preventDefault();
      self.togglePermissions($(this).attr('id'));
    });

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
    this.tokensInfo.classList.add('hidden');
    this.tokenInfo.classList.add('hidden');
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

  showTokensInfo: function showTokensInfo() {
    this.hideAllForms();
    this.tokensInfo.classList.remove('hidden');
  },

  showTokenInfo: function showTokenInfo() {
    this.hideAllForms();
    this.tokenInfo.classList.remove('hidden');
  },

  reset: function reset() {
    if (this.currentModel !== undefined) {
      if (!this.tokenInfo.classList.contains("hidden")) {
        this.getPermissions();
      } else if (this.modelInfo.classList.contains("hidden")) {
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

  logIn: function logIn(event) {
    if (event) event.preventDefault();
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
            '<li data-id="' + item.id + '"><a href="#" title="' + item.description + '">' +
              item.title + '</a></li>');
          var self = this;
          li.click(function() {
            self.getRecords($(this).data('id'));
          });
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

  updateModel: function updateModel(modelname) {
    return this.session.getModel(modelname)
      .then(function(model) {
        this.currentModel = model;
        this.currentModel.id = modelname;
        return modelname;
      }.bind(this));

  },

  getRecords: function getRecords(modelname) {
    this.updateModel(modelname)
    .then(function(model) {
      // 1. Get definition to obtain the main field
      var mainfield = this.currentModel.definition.fields[0].name;

      // 2. Display a list of records
      var recordsList = $("#records-list");
      var records = this.currentModel.records;
      if (records.length === 0) {
        recordsList.html("<li>No records yet.</li>");
      } else {
        recordsList.html("");
        for (var i = 0; i < records.length; i++) {
          var record = records[i];
          var li = $(
            '<li data-index="' + i  +
              '"><a href="#">' + record[mainfield] + "</a></li>"
          );
          var self = this;
          li.click(function() {
            self.getRecord(self.currentModel.records[$(this).data('index')]);
          });
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
    $("#put-record-info h3").text("Add a new record to " + this.currentModel.id);
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
      } else if (field.type === "text") {
        input = $("<label>" + field.label +'<br/><textarea name="' + field.name +
                  '"></textarea></label>');
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
    $("#put-record-info h3").text("Change record (" + record.id + ")");
    for(var key in record) {
      $("#put-record-form select[name='" + key + "']").val(record[key]);
      $("#put-record-form textarea[name='" + key + "']").text(record[key]);
      $("#put-record-form input[name='" + key + "']").val(record[key]);
    }
    this.deleteRecordButton.classList.remove('hidden');
  },

  putRecord: function putRecord(event) {
    event.preventDefault();  // Prevent default submit handle
    var record = {};
    $("#put-record-form input").each(function(index, input) {
      record[$(input).attr("name")] = $(input).val();
    });
    $("#put-record-form select").each(function(index, input) {
      record[$(input).attr("name")] = $(input).val();
    });
    $("#put-record-form textarea").each(function(index, input) {
      record[$(input).attr("name")] = $(input).text();
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
  },

  getPermissions: function getPermissions() {
    var permissions = this.currentModel.acls;
    var tokensList = $("#tokens-list").html("");
    Object.keys(permissions).forEach(function(key) {
      var li = $(
        '<li data-id="' + key  +
          '"><a href="#">' + key + "</a></li>"
      );
      var self = this;
      li.click(function() {
        self.getPermission(null, $(this).data('id'));
      });
      tokensList.append(li);
    }.bind(this));
    this.showTokensInfo();
  },

  getPermission: function getPermission(event, token) {
    if (event) token = "";
    var permissions = this.currentModel.acls[token];
    $("#put-permission-info input[type='checkbox']").prop("checked", false);
    if (permissions) {
      for(var i = 0; i < permissions.length; i++) {
        $("#put-permission-info input[name='" + permissions[i] + "']")
          .prop("checked", true);
      }
    }
    $("#put-permission-info input[name='token']").val(token);
    this.showTokenInfo();
  },

  patchPermissions: function patchPermissions(event) {
    if (event) event.preventDefault();
    var permissions = [];
    $("#put-permission-info input[type='checkbox']").each(
      function(index, input) {
        var permission = $(input).attr('name');
        if (!$(input).is(":checked")) {
          permission = '-' + permission;
        }
        permissions.push(permission);
      }
    );
    var acls = {};
    acls[$("#put-permission-info input[name='token']").val()] = permissions;
    this.session.patchPermissions(this.currentModel.id, acls)
      .then(function() {
        this.updateModel(this.currentModel.id)
          .then(function(modelname) {
            this.getPermissions();
          }.bind(this));
      }.bind(this)
    );
  },

  togglePermissions: function togglePermissions(group) {
    var off = true;
    var checkboxes  = $("#" + group + " + div input[type='checkbox']");
    checkboxes.each(
      function(index, input) {
        if ($(input).is(":checked")) {
          off = false;
        }
      }
    );
    checkboxes.prop('checked', off);
  }
};

window.addEventListener('DOMContentLoaded', function onload() {
  window.removeEventListener('DOMContentLoaded', onload);
  App.init();
});
