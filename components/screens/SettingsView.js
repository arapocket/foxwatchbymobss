'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Switch,
  Platform
 } from 'react-native';


import {
  Container,
  Header,
  Content,
  Text,
  Right,
  Left,
  Picker,
  Form,
  Label,
  Input,
  Item as FormItem
} from "native-base";
const Item = Picker.Item;

import Icon from 'react-native-vector-icons/Ionicons';
import Button from 'apsl-react-native-button'

import SettingsService from '../lib/SettingsService';
import BGService from '../lib/BGService';


import commonStyles from '../styles';
import Config from '../config';

class SettingsView extends React.Component {

  static navigatorStyle = {
    navBarBackgroundColor: Config.colors.orange
  };

  constructor(props) {
    super(props);


    this.bgService = BGService.getInstance();
    this.settingsService = SettingsService.getInstance();

    // Default state
    this.state = {
      isDestroyingLog: false,
      isLoadingGeofences: false,
      geofence: {
        radius: '200',
        notifyOnEntry: true,
        notifyOnExit: false,
        notifyOnDwell: false,
        loiteringDelay: '0'
      }
    };


    
    this.props.navigator.toggleNavBar({
      to: 'hidden', // required, 'hidden' = hide navigation bar, 'shown' = show navigation bar
      animated: true // does the toggle have transition animation or does it happen immediately (optional). By default animated: true
    });

    

  }


  load() {
    // Fetch current state of BackgroundGeolocation
    this.bgService.getState((state) => {

      this.setState({
        ...state,
        logLevel: this.decodeLogLevel(state.logLevel),
        trackingMode: this.decodeTrackingMode(state.trackingMode),
        notificationPriority: this.decodeNotificationPriority(state.notificationPriority)
      });
    });

    // Load app settings
    this.settingsService.getState((state) => {
      this.setState(state);
    });
  }

  onClickClose() {
    this.bgService.playSound('CLOSE');
    this.props.navigator.dismissModal({
      animationType: 'slide-down' // 'none' / 'slide-down' , dismiss animation for the modal (optional, default 'slide-down')
    });
  }

  onChangeGeofence(setting, value) {
    this.settingsService.onChange(setting, value);
    let state = {};
    state[setting.name] = value;
    this.setState(state);
  }

  onClickLoadGeofences() {
    if (this.state.isLoadingGeofences) { return false; }
    this.setState({isLoadingGeofences: true});

    this.settingsService.getState((state) => {
      this.bgService.loadTestGeofences('city_drive', state, () => {
        this.settingsService.toast('Loaded City Drive geofences');
        this.setState({isLoadingGeofences: false});
      });
    });
  }

  onClickClearGeofences() {
    this.bgService.removeGeofences();
  }

  onClickEmailLogs() {

  }

  onClickDestroyLog() {
    this.settingsService.confirm('Confirm Destroy', 'Destroy Logs?', () => {
      this.setState({isDestroyingLog: true});
      this.bgService.getPlugin().destroyLog(() => {
        this.setState({isDestroyingLog: false});
        this.settingsService.toast('Destroyed logs');
      });
    });
  }

  setTrackingMode(trackingMode){
    this.bgService.playSound('BUTTON_CLICK');
    this.setState({
      trackingMode
    });
    let bgGeo = this.bgService.getPlugin();
    if (trackingMode == "location") {
      bgGeo.start();
    } else {
      bgGeo.startGeofences();
    }
    if (typeof(this.props.onChange) === 'function') {  // <-- Android
      this.props.onChange('trackingMode', trackingMode);
    }
  }

  decodeTrackingMode(trackingMode) {
    return (trackingMode === 1 || trackingMode === 'location') ? 'location' : 'geofence';
  }

  decodeLogLevel(logLevel) {
    let value = 'VERBOSE';
    let bgGeo = this.bgService.getPlugin();
    switch(logLevel) {
      case bgGeo.LOG_LEVEL_OFF:
        value = 'OFF';
        break;
      case bgGeo.LOG_LEVEL_ERROR:
        value = 'ERROR';
        break;
      case bgGeo.LOG_LEVEL_WARNING:
        value = 'WARN';
        break;
      case bgGeo.LOG_LEVEL_INFO:
        value = 'INFO';
        break;
      case bgGeo.LOG_LEVEL_DEBUG:
        value = 'DEBUG';
        break;
      case bgGeo.LOG_LEVEL_VERBOSE:
        value = 'VERBOSE';
        break;
    }
    return value;
  }

  encodeLogLevel(logLevel) {
    let value = 0;
    let bgGeo = this.bgService.getPlugin();
    switch(logLevel) {
      case 'OFF':
        value = bgGeo.LOG_LEVEL_OFF;
        break;
      case 'ERROR':
        value = bgGeo.LOG_LEVEL_ERROR;
        break;
      case 'WARN':
        value = bgGeo.LOG_LEVEL_WARNING;
        break;
      case 'INFO':
        value = bgGeo.LOG_LEVEL_INFO;
        break;
      case 'DEBUG':
        value = bgGeo.LOG_LEVEL_DEBUG;
        break;
      case 'VERBOSE':
        value = bgGeo.LOG_LEVEL_VERBOSE;
        break;
    }
    return value;
  }

  decodeNotificationPriority(value) {
    let bgGeo = this.bgService.getPlugin();
    switch(value) {
      case bgGeo.NOTIFICATION_PRIORITY_DEFAULT:
        value = 'DEFAULT';
        break;
      case bgGeo.NOTIFICATION_PRIORITY_HIGH:
        value = 'HIGH';
        break;
      case bgGeo.NOTIFICATION_PRIORITY_LOW:
        value = 'LOW';
        break;
      case bgGeo.NOTIFICATION_PRIORITY_MAX:
        value = 'MAX';
        break;
      case bgGeo.NOTIFICATION_PRIORITY_MIN:
        value = 'MIN';
        break;
      default:
        value = bgGeo.NOTIFICATION_PRIORITY_DEFAULT;
    }
    return value;
  }

  encodeNotficationPriority(value) {
    let bgGeo = this.bgService.getPlugin();
    switch(value) {
      case 'DEFAULT':
        value = bgGeo.NOTIFICATION_PRIORITY_DEFAULT;
        break;
      case 'HIGH':
        value = bgGeo.NOTIFICATION_PRIORITY_HIGH;
        break;
      case 'LOW':
        value = bgGeo.NOTIFICATION_PRIORITY_LOW;
        break;
      case 'MAX':
        value = bgGeo.NOTIFICATION_PRIORITY_MAX;
        break;
      case 'MIN':
        value = bgGeo.NOTIFICATION_PRIORITY_MIN;
        break;
    }
    return value;
  }

  setGeofenceProximityRadius(value) {
    this.bgService.playSound('BUTTON_CLICK');
    var state = {geofenceProximityRadius: value}
    this.setState(state);
    var decodedValue = parseInt(value.match(/[0-9]+/)[0], 10)*1000;

    /*
    SettingsService.set('geofenceProximityRadius', decodedValue, function(state) {
      if (typeof(me.props.onChange) === 'function') {  // <-- Android
        me.props.onChange('geofenceProximityRadius', decodedValue);
      }
    });
    */
    console.warn('TODO setGeofenceProximityRadius');
  }

  onFormChange() {

  }

  onChangeTrackingMode(value) {
    let bgGeo = this.bgService.getPlugin();
    if (this.state.trackingMode === value) { return; }
    this.setState({trackingMode: value});
    this.bgService.set('trackingMode', value);
  }

  onChangeEmail(value) {
    this.settingsService.onChange('email', value);
    this.setState({email: value});
  }

  onFieldChange(setting, value) {
    let currentValue = this.state[setting.name];

    switch (setting.dataType) {
      case 'integer':
        value = parseInt(value, 10);
        break;
    }

    if (this.state[setting.name] === value) {
      return;
    }

    let state = {};
    state[setting.name] = value;
    this.setState(state);

    // Buffer field-changes by 500ms
    function doChange() {
      // Encode applicable settings for consumption by plugin.
      switch(setting.name) {
        case 'logLevel':
          value = this.encodeLogLevel(value);
          break;
        case 'notificationPriority':
          value = this.encodeNotficationPriority(value);
          break;
      }
      this.bgService.set(setting.name, value);
    }

    if (this.changeBuffer) {
      this.changeBuffer = clearTimeout(this.changeBuffer);
    }
    this.changeBuffer = setTimeout(doChange.bind(this), 500);
  }

  buildField(setting, onValueChange) {
    let field = null;
    switch(setting.inputType) {
      case 'text':
        field = (
          <FormItem inlineLabel key={setting.name} style={styles.formItem}>
            <Input placeholder={setting.defaultValue} value={this.state[setting.name]} onChangeText={value => {onValueChange(setting, value)}}/>
          </FormItem>
        );
        break;
      case 'select':
        let items = [];
        setting.values.forEach((value) => {
          items.push((<Item label={value.toString()} value={value} key={setting.name + ":" + value} />));
        });
        field = (
          <FormItem inlineLabel key={setting.name} style={styles.formItem}>
            <Label style={styles.formLabel}>{setting.name}</Label>
            <Right>
              <Picker
                mode="dropdown"
                style={{width:(Platform.OS === 'ios') ? undefined : 150}}
                selectedValue={this.state[setting.name]}
                onValueChange={value => {onValueChange(setting, value)}}
              >{items}</Picker>
            </Right>
          </FormItem>
        );
        break;
      case 'toggle':
        field = (
          <FormItem inlineLabel key={setting.name} style={styles.formItem}>
            <Label style={styles.formLabel}>{setting.name}</Label>
            <Right style={{paddingRight:10}}>
              <Switch value={this.state[setting.name]} onValueChange={value => {onValueChange(setting, value)}} />
            </Right>
          </FormItem>
        );
        break;
      default:
        field = (
          <FormItem key={setting.name}>
            <Text>Unknown field-type for {setting.name} {setting.inputType}</Text>
          </FormItem>
        );
        break;
    }
    return field;
  }

  renderTrackingModeField() {
    return (
      <FormItem inlineLabel key="trackingMode" style={styles.formItem}>
        <Label style={styles.formLabel}>trackingMode</Label>
        <Right>
          <Picker
            mode="dropdown"
            selectedValue={this.state.trackingMode}
            onValueChange={this.onChangeTrackingMode.bind(this)}
            style={{width:(Platform.OS === 'ios') ? undefined : 150}}>
            <Item label="Location" value="location" />
            <Item label="Geofence" value="geofence" />
          </Picker>
        </Right>
      </FormItem>
    );
  }
  renderPlatformSettings(section) {
    return this.bgService.getPlatformSettings(section).map((setting) => {
      return this.buildField(setting, this.onFieldChange.bind(this));
    });
  }

  getGeofenceTestSettings() {
    return this.settingsService.getSettings('geofence').map((setting) => {
      return this.buildField(setting, this.onChangeGeofence.bind(this));
    });
  }



  render() {
    return (
        <View style={styles.container}>

          <View style={styles.topToolbar}>


            
            <Text style={styles.toolbarTitle}>Settings</Text>


            <View style={styles.toolbarButtonContainer} >
            <Icon.Button 
              name="md-arrow-dropdown-circle"
              size={30}
              onPress={this.onClickClose.bind(this)}
              backgroundColor="transparent"
              underlayColor="transparent"
              color={Config.colors.black}
              paddingTop = {15}
              >
            </Icon.Button>
            </View>


          </View>

          <Content>
            <Form  >
              <FormItem style={styles.headerItem}>
                <Text style={styles.header}>GEOLOCATION</Text>
              </FormItem>
              {this.renderTrackingModeField()}
              {this.renderPlatformSettings('geolocation')}
              <FormItem style={styles.headerItem}>
                <Text style={styles.header}>ACTIVITY RECOGNITION</Text>
              </FormItem>
              {this.renderPlatformSettings('activity recognition')}
              <FormItem style={styles.headerItem}>
                <Text style={styles.header}>HTTP &amp; PERSISTENCE</Text>
              </FormItem>
              {this.renderPlatformSettings('http')}
              <FormItem style={styles.headerItem}>
                <Text style={styles.header}>APPLICATION</Text>
              </FormItem>
              {this.renderPlatformSettings('application')}
              <FormItem style={styles.headerItem}>
                <Text style={styles.header}>DEBUG</Text>
              </FormItem>
              <FormItem inlineLabel key="email" style={styles.formItem}>
                <Input placeholder="your@email.com" value={this.state.email} onChangeText={this.onChangeEmail.bind(this)} />
              </FormItem>
              {this.renderPlatformSettings('debug')}
              <View style={styles.setting}>
                <Button onPress={this.onClickDestroyLog.bind(this)} activeOpacity={0.7} isLoading={this.state.isDestroyingLog} style={[styles.button, styles.redButton, {flex:1}]} textStyle={styles.buttonLabel}>
                  Destroy logs
                </Button>
              </View>

              <FormItem style={styles.headerItem}>
                <Text style={styles.header}>GEOFENCE TESTING (Freeway Drive)</Text>
              </FormItem>
              <View style={styles.setting}>
                <View style={styles.label}>
                  <Button onPress={this.onClickClearGeofences.bind(this)} activeOpacity={0.7} style={[styles.button, styles.redButton]} textStyle={styles.buttonLabel}>
                    Clear
                  </Button>
                </View>
                <Text>&nbsp;&nbsp;&nbsp;</Text>
                <View style={styles.label}>
                  <Button onPress={this.onClickLoadGeofences.bind(this)} isLoading={this.state.isLoadingGeofences} activeOpacity={0.7} style={[styles.button, styles.blueButton]} textStyle={styles.buttonLabel}>
                    Load
                  </Button>
                </View>
              </View>
              {this.getGeofenceTestSettings()}
            </Form>
          </Content>


        </View>

    );
  }
};

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 20,
    justifyContent: 'space-between',
    backgroundColor: Config.colors.off_white

  },
  topToolbar: {
    backgroundColor: '#cc7000',
    borderBottomColor: 'black',
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 0.1
  },
  
  setting: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth:1,
    borderBottomColor:"#ccc",
    padding: 10
  },
  headerItem: {
    marginTop: 20,
    backgroundColor: "transparent"
  },
  header: {
    fontSize: 16
  },
  label: {
    flex: 1
  },
  button: {
    borderWidth:0,
    borderRadius: 5,
    marginBottom: 0
  },
  buttonLabel: {
    fontSize: 14,
    color: '#fff'
  },
  redButton: {
    backgroundColor: '#ff3824'
  },
  blueButton: {
    backgroundColor: '#0076ff'
  },
  formItem: {
    backgroundColor: "#fff"
  },
  formLabel: {
    color: Config.colors.light_blue
  },
  toolbarTitle: {
    fontWeight: 'bold', 
    fontSize: 25, 
    flex: 1, 
    textAlign: 'left'
  },
  toolbarButtonContainer:  {
    flex: 0.2
  }
});


module.exports = SettingsView;