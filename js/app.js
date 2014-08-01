/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

"use strict";

var App = {
  init: function init() {
    // Login form
    this.loginInfo = document.getElementById('login-info');
    this.loginForm = document.getElementById('login-form');
    this.loginButton = document.getElementById('login-button');
    this.loginButton.addEventListener('click', this.logIn.bind(this));

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
  },

  hideAllForms: function hideAllForm() {
    this.loginInfo.classList.add('hidden');
    this.modelsInfo.classList.add('hidden');
    this.modelInfo.classList.add('hidden');
    this.putRecordInfo.classList.add('hidden');
  },

  showLoginInfo: function showModelsInfo() {
    this.hideAllForms();
    this.modelsInfo.classList.remove('hidden');
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
  }
};

window.addEventListener('DOMContentLoaded', function onload() {
  window.removeEventListener('DOMContentLoaded', onload);
  App.init();
});
