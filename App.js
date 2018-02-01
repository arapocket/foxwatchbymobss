'use strict';

// import './ReactotronConfig'

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  TouchableHighlight,
  StatusBar,
  Text
 } from 'react-native';


import { Navigation } from 'react-native-navigation';

// import Icon from 'react-native-vector-icons/Ionicons';
import BackgroundGeolocation from 'react-native-background-geolocation';

global.BackgroundGeolocation = BackgroundGeolocation;

// import Config from './components/config';
import HomeView from './components/screens/HomeView';
// import IncidentView from './components/screens/IncidentView';
// import CameraView from './components/screens/CameraView';
// import VideoView from './components/screens/VideoView';
// import SettingsView from './components/screens/SettingsView';
// import ChatView from './components/screens/ChatView';
import LoginView from './components/screens/LoginView';
// import OptionsView from './components/screens/OptionsView';

var startPage = 'foxwatch.LoginView';
console.disableYellowBox = true;


export default class Application extends Component {



//with the navigation api, none of this stuff is being called it seems...

//   componentDidMount() {

//     StatusBar.setBarStyle('default');
//     console.ignoredYellowBox = ['Remote debugger'];

//   }
//   render() {
//     return (
//       <View  >
//         <LoginView />
//       </View>
//     );
//   }
 }



Navigation.registerComponent('foxwatch.HomeView', () => HomeView);
// Navigation.registerComponent('foxwatch.CameraView', () => CameraView);
// Navigation.registerComponent('foxwatch.VideoView', () => VideoView);
// Navigation.registerComponent('foxwatch.SettingsView', () => SettingsView);
// Navigation.registerComponent('foxwatch.IncidentView', () => IncidentView);
// Navigation.registerComponent('foxwatch.ChatView', () => ChatView);
Navigation.registerComponent('foxwatch.LoginView', () => LoginView);
// Navigation.registerComponent('foxwatch.OptionsView', () => OptionsView);


  Navigation.startSingleScreenApp({
    screen: {
      screen: startPage,
      title: '🦊'
    }
  });





