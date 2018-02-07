'use strict';

import React, {
  Component,
  PushNotificationIOS
} from 'react';
import {
  AsyncStorage,
} from 'react-native';

import PushNotification from 'react-native-push-notification';
import Toast from 'react-native-root-toast';

import { EventRegister } from 'react-native-event-listeners'
import EventEmitter from 'EventEmitter';

import BGService from '../lib/BGService';
import IDService from '../lib/IDService';
import PatrolService from '../lib/PatrolService';


import io from 'socket.io-client';
const socket = {};



const STORAGE_KEY = "AuthService";

let instance = null;
let eventEmitter = new EventEmitter();

class AuthService extends React.Component {

  static getInstance() {
    if (instance === null) {
      instance = new AuthService();
    }
    return instance;
  }
  constructor(props) {

    super(props);

    this.state = {
      authorized: false,
      enabled: false,
      coordSeq: 1,
      idData: {},
      messages: []
    };

    this.bgService = BGService.getInstance();
    this.idService = IDService.getInstance();
    this.patrolService = PatrolService.getInstance();
    var bgGeo = this.bgService.getPlugin();

    this._loadState();

    this.connectToSocket = this.connectToSocket.bind(this);
    this.getIDData = this.getIDData.bind(this);
    this.startPushNotifications = this.startPushNotifications.bind(this);

    this.getIDData();

    this.authListener = EventRegister.addEventListener('log in', (data) => {
      console.log('log in heard');
      this.set('enabled', true);
    })

    this.logoutListener = EventRegister.addEventListener('log out', (data) => {
      console.log('log out heard ');
      this.resetState();
      this.idService.resetState();
      bgGeo.stop(() => {

      });

      bgGeo.removeAllListeners();

      this.bgService.removeListeners();

    })


    this.guardPut = this.guardPut.bind(this);
    this.incrementCoordSequence = this.incrementCoordSequence.bind(this);


  }


  isEnabled() {
    return this.state.enabled;
  }

  getState(callback) {
    if (this.state) {
      callback(this.state);
    } else {
      this._loadState(callback);
    }
  }


  set(name, value) {
    if (this.state[name] === value) {
      // No change.  Ignore
      return;
    }
    this.state[name] = value;
    eventEmitter.emit('change', {
      name: name,
      value: value,
      state: this.state
    });
    this._saveState();
  }

  _getDefaultState() {
    return this.state;
  }

  _loadState(callback) {
    AsyncStorage.getItem(STORAGE_KEY + ":authData", (err, value) => {
      if (value) {
        // console.log('state loaded, here it is:')
        // console.log(value);
        this.state = JSON.parse(value);
      } else {
        this.state = this._getDefaultState();
        this._saveState();
      }

      if (typeof (callback) === 'function') {
        callback(this.state);
      }
    });
  }

  _saveState() {
    AsyncStorage.setItem(STORAGE_KEY + ":authData", JSON.stringify(this.state, null));
    // console.log('state saved, here it is:')
    // console.log(this.state);
  }

  startPushNotifications() {
    var self = this;

    PushNotification.configure({

      onRegister: function (token) {
        console.log('TOKEN:', token);
        self.putDeviceToken(token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        // notification.finish(PushNotificationIOS.FetchResult.NoData);

      },

    })
  }

  putDeviceToken(token) {

    var deviceToken = JSON.stringify(token.token).replace(/"/g, '');


    fetch('http://ec2-34-210-155-178.us-west-2.compute.amazonaws.com:3000/addDeviceToken', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        GuardID: this.idService.getCurrentGuardID(),
        DeviceToken: deviceToken
      })
    }).then((response) => {
      console.log("logging putDeviceToken response");
      console.log(response);
    })
  }

  getIDData() {
    this.idService.getState((state) => {
      // console.log('idService.getState being called from patrolService');
      // console.log(state);
      this.set('idData', state);
      // console.log('ok now we log this state again');
      // console.log(this.state);
      this._saveState();
    });
  }

  connectToSocket() {

    this.getIDData();

    var state = this.state;
    // console.log('logging patrol service states idData');
    // console.log(state.idData);

    socket = io('http://ec2-34-210-155-178.us-west-2.compute.amazonaws.com:3000');


    var self = this;

    socket.on('connect', function () {
      // console.log('connected!');
      // console.log(state);
      socket.emit('add user', state.idData.currentGuardFirstName);
      self.set('messages', [])
    });

    socket.on('user joined', (user) => {
      console.log(user);
      this.toast(user.username + ' joined.');
    })

    socket.on('message', (msg) => {

      var user = JSON.stringify(msg.username).replace(/"/g, '');
      msg = JSON.stringify(msg.message).replace(/"/g, '');
      this.toast(user + ': "' + msg + '"');
      this.set('messages', [...this.state.messages, {
        user: user,
        msg: msg
      }])

      EventRegister.emit('incoming chat', 'it works!!!')
    });


    socket.on('patrol stop', (id) => {
      console.log('stop was heard from GREYFOX. The ID was ' + id.id);
      EventRegister.emit('patrol stop', id);
    })

    socket.on('user left', function (user) {
      console.log('socket.on userleft called');
      self.toast(user.username + ' left.');

    });

  }

  emitMessage(msg) {

    if (this.state.enabled) {
      socket.emit('message', msg);
      console.log('emitMessage called ');
      console.log(msg);

      var user = this.state.idData.currentGuardFirstName;
      this.set('messages', [...this.state.messages, {
        user: user,
        msg: msg
      }])

      EventRegister.emit('incoming chat', 'it works!!!')

    } else {
      this.set('messages', [...this.state.messages, {
        user: 'FoxWatch App',
        msg: 'Only guards on patrols may send messages. '
      }])
      EventRegister.emit('incoming chat', 'it works!!!')
    }


  }

  disconnectSocket() {
    socket.disconnect();
  }

  restartSocket(){

  }

  toast(message, param, duration) {
    duration = duration || 'LONG';
    // Add a Toast on screen.
    let toast = Toast.show(message, {
      duration: Toast.durations[duration.toUpperCase()],
      position: Toast.positions.CENTER,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0
    });
  }

  guardPut(loggedIn) {

    console.log('guardPut called');
    console.log(this.idService);
    console.log(this.idService.getCurrentGuardID());

    fetch('http://ec2-34-210-155-178.us-west-2.compute.amazonaws.com:3000/guards', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        GuardID: this.idService.getCurrentGuardID(),
        LoggedIn: loggedIn
      })
    }).then((response) => {
      //  console.log("logging response");
      //  console.log(response);
    })

  }

  patrolPost() {

    this.idService.createPatrolID();

    fetch('http://ec2-34-210-155-178.us-west-2.compute.amazonaws.com:3000/patrols', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        PatrolID: this.idService.getCurrentPatrolID(),
        GuardID: this.idService.getCurrentGuardID(),
        CurrentPatrol: 1
      })
    }).then((response) => {
      //  console.log("logging patrolPost response");
      console.log(response);

    })

  }

  patrolPut() {
    fetch('http://ec2-34-210-155-178.us-west-2.compute.amazonaws.com:3000/patrols', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        GuardID: this.idService.getCurrentGuardID(),
        CurrentPatrol: 0
      })
    }).then((response) => {
      //  console.log("logging patrolPut response");
      //  console.log(response);
    })
  }

  coordPut() {

    console.log('coordPut called');

    fetch('http://ec2-34-210-155-178.us-west-2.compute.amazonaws.com:3000/coordinates', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        GuardID: this.idService.getCurrentGuardID(),
        CurrentCoord: 0
      })
    }).then((response) => {
      // console.log("logging coordPut response");
      // console.log(response);

    })
  }

  coordPut(location) {

    console.log('coordPut(location) called');

    fetch('http://ec2-34-210-155-178.us-west-2.compute.amazonaws.com:3000/coordinates', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        GuardID: this.idService.getCurrentGuardID(),
        CurrentCoord: 0
      })
    }).then((response) => {
      this.coordPost(location);

    })
  }

  coordPost(location) {

    console.log('coordPost called');

    this.idService.createCoordID();

    fetch('http://ec2-34-210-155-178.us-west-2.compute.amazonaws.com:3000/coordinates', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        CoordID: this.idService.getCurrentCoordID(),
        Sequence: this.state.coordSeq,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        PatrolID: this.idService.getCurrentPatrolID(),
        CurrentCoord: 1
      })
    }).then((response) => {
      this.patrolService.set('currentLat', location.coords.latitude);
      this.patrolService.set('currentLng', location.coords.longitude);
    })

  }

  incrementCoordSequence() {


    let coordSeq = this.state.coordSeq;
    coordSeq += 1;
    this.set('coordSeq', coordSeq);
  }


  getMessages() {
    return this.state.messages;
  }


  resetState(){
    this.patrolPut();
    this.coordPut();
    this.disconnectSocket();
    this.guardPut(0);
    this.set('coordSeq', 1);
    this.set('enabled', false);
  }

}



module.exports = AuthService;