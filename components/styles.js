'use strict';

import React, { Component } from 'react';
import {
  StyleSheet
} from 'react-native';


var styles = StyleSheet.create({
  
  toolbarTitle: {
    fontWeight: 'bold', 
    fontSize: 35, 
    flex: 1, 
    textAlign: 'center',
    marginRight: 11
  },
  iosStatusBar: {
    height: 20,
    backgroundColor: 'black'
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  iconButton: {
    width: 50,
    flex: 1
  },
  labelActivity: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    padding: 3,
    width: 75
  },
  labelText: {
    fontSize: 14,
    textAlign: 'center'
  },
  backButtonIcon: {
    //marginRight: 
  },
  backButtonText: {
    fontSize: 18,
    color: '#4f8ef7'
  },

  redButton: {
    backgroundColor: '#FE381E'
  },
  greenButton: {
    backgroundColor: '#16BE42'
  },
  transparentButton: {
    backgroundColor: "transparent"
  }

});

module.exports = styles;
