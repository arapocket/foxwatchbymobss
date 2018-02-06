import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import Config from './config';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from 'apsl-react-native-button'

import commonStyles from './styles';

import BGService from './lib/BGService';
import SettingsService from './lib/SettingsService';


/**
* This is the common shared bottom-toolbar.  It's passed the BackgroundGeolocation instance
* via #props.  It manages the #changePace, #getCurrentPosition buttons, #odometer, #activity
* and location #provider.
*/
class BottomToolbarView extends React.Component {

  constructor(props) {
    super(props);
    this.bgService = BGService.getInstance();
    this.bgService.on('change', (name, value) => {
      if (name === 'odometer') {
        this.setState({ odometer: value.toFixed(1) });
      }
    });

    this.settingsService = SettingsService.getInstance();


    this.state = {
      enabled: false,
      isMoving: false,
      isChangingPace: false,
      odometer: (0 / 1).toFixed(1),
      currentActivity: 'unknown',
      currentProvider: undefined,
      showIncidentModal: false
    };


  }

  componentDidMount() {

    // Listen to events from our parent
    this.onChangeEnabled = this.onChangeEnabled.bind(this)
    this.props.eventEmitter.addListener('enabled', this.onChangeEnabled);

    let bgGeo = this.bgService.getPlugin();

    this.onActivityChange = this.onActivityChange.bind(this);
    this.onProviderChange = this.onProviderChange.bind(this);
    this.onLocation = this.onLocation.bind(this);
    this.onMotionChange = this.onMotionChange.bind(this);

    bgGeo.on("activitychange", this.onActivityChange);
    bgGeo.on("providerchange", this.onProviderChange);
    bgGeo.on("location", this.onLocation);
    bgGeo.on("motionchange", this.onMotionChange);

    bgGeo.getState((state) => {
      this.setState({
        enabled: state.enabled,
        isMoving: state.isMoving,
        odometer: (state.odometer / 1000).toFixed(1)
      });
    });
  }

  componentWillUnmount() {
    // Unregister BackgroundGeolocation listeners!
    let bgGeo = this.bgService.getPlugin();
    bgGeo.un("activitychange", this.onActivityChange);
    bgGeo.un("providerchange", this.onProviderChange);
    bgGeo.un("location", this.onLocation);
    bgGeo.un("motionchange", this.onMotionChange);

    this.props.eventEmitter.removeListener('enabled', this.onChangeEnabled);
  }

  onActivityChange(event) {
    console.log('[js] activitychange: ', event.activity, event.confidence);
    this.setState({
      currentActivity: event.activity
    });
  }

  onProviderChange(provider) {
    console.log('[js] providerchange: ', JSON.stringify(provider));
    this.setState({
      currentProvider: provider
    });
  }

  onChangeEnabled(enabled) {
    this.setState({
      enabled: enabled
    });
  }

  onLocation(location) {
    if (location.sample) { return; }
    this.setState({
      odometer: (location.odometer / 1000).toFixed(1)
    });
  }

  onMotionChange(event) {
    console.log('motionchange: ', event);

    this.setState({
      isChangingPace: false,
      isMoving: event.isMoving
    });
  }

  onClickPace() {
    if (!this.state.enabled) { return; }

    let isMoving = !this.state.isMoving;
    let bgGeo = this.bgService.getPlugin();

    this.setState({
      isMoving: isMoving,
      isChangingPace: true
    });

    bgGeo.changePace(isMoving, (state) => {

    }, (error) => {
      console.info("Failed to changePace: ", error);
      this.setState({
        isChangingPace: false,
        isMoving: !isMoving // <-- reset state back
      });
    });
  }

  onClickLocate() {
    let bgGeo = this.bgService.getPlugin();
    this.bgService.playSound('BUTTON_CLICK');
    this.settingsService.set('followsUserLocation', true);
    bgGeo.getCurrentPosition({
      timeout: 30,
      samples: 3,
      desiredAccuracy: 10,
      maximumAge: 5000,
      persist: true
    }, (location) => {
      console.log('- current position: ', JSON.stringify(location));
    }, (error) => {
      console.info('ERROR: Could not get current position', error);
    });
  }

  // getPaceButton() {


  //   if (this.state.enabled) {

  //     if (this.state.isMoving) {
  //       var icon = Config.icons.pause;
  //     } else {
  //       var icon = Config.icons.play;
  //     }
  //   }

    
  //         let button = <Icon.Button
  //     onPress={this.onClickPace.bind(this)}
  //     name={icon} color={Config.colors.off_white}
  //     size={43} backgroundColor="transparent"
  //     underlayColor="transparent"
  //     iconStyle={{ marginRight: 0 }} />

  //   return (
  //     <View  >
  //       {button}
  //     </View>
  //   );

  // }



  render() {
    return (
      <View style={styles.bottomToolbar}>


        <View style={styles.btnNavigateContainer} >
          <Icon.Button
            style={styles.btnNavigate}
            color={Config.colors.off_white}
            backgroundColor="transparent"
            underlayColor="transparent" size={45}
            name={Config.icons.navigate}
            iconStyle={{ marginRight: 0 }}
            onPress={() => this.onClickLocate()} />
        </View>
        <View style={styles.paceButton} >
        </View>

      </View>




    );
  }
}

var styles = StyleSheet.create({
  bottomToolbar: {
    borderTopColor: 'black',
    borderTopWidth: 2,
    backgroundColor: Config.colors.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 0.1

  },
  btnNavigate: {

  },
  btnNavigateContainer: {

  },
  paceButton: {
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",

  },
  labelActivity: {

  },
  statusLabel: {
  },
  activityIcon: {
    marginRight: 5,
    marginLeft: 5
    //width: 50
  }
});

module.exports = BottomToolbarView;