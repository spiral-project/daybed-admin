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

    // Put Record
    this.putRecordInfo = document.getElementById('put-record-info');
    this.putRecordForm = document.getElementById('put-record-form');
    this.putRecordButton = document.getElementById('put-record-button');
    this.putRecordButton.addEventListener('click', this.putRecord.bind(this));

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
  },

  showLoginInfo: function showModelsInfo() {
    this.hideAllForms();
    this.loginInfo.classList.remove('hidden');
  },

  showModelsInfo: function showModelsInfo() {
    this.hideAllForms();
    this.modelsInfo.classList.remove('hidden');
  },

  showModelInfo: function showModelInfo() {
    this.hideAllForms();
    this.modelInfo.classList.remove('hidden');
  },

  showPutRecordInfo: function showPutRecordInfo() {
    this.hideAllForms();
    this.putRecordInfo.classList.remove('hidden');
  },

  reset: function reset() {
    this.showLoginForm();
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
        for (var i = 0; i < models.length; i++) {
          modelList.append("<li>" + models[i] + "</li>");
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

  putRecord: function putRecord() {}
};

window.addEventListener('DOMContentLoaded', function onload() {
  window.removeEventListener('DOMContentLoaded', onload);
  App.init();
});
