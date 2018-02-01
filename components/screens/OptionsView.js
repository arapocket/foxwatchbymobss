'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
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

import CameraView from './CameraView'
import VideoView from './VideoView'
import PatrolService from '../lib/PatrolService';
import BGService from '../lib/BGService';
import IDService from '../lib/IDService';



import commonStyles from '../styles';
import Config from '../config';
import { RadioButtons, SegmentedControls } from 'react-native-radio-buttons';


import { RNS3 } from 'react-native-aws3';

import Video from "react-native-video";

import { EventRegister } from 'react-native-event-listeners'

class OptionsView extends React.Component {

  static navigatorStyle = {
    navBarBackgroundColor: Config.colors.orange
  };

  constructor(props) {
    super(props);

    this.bgService = BGService.getInstance();
    this.patrolService = PatrolService.getInstance();
    this.idService = IDService.getInstance();

    // Default state
    this.state = {
      patrolData: {},
      idData: {},
      presignedUrl: '',
      description: '',
      checkListOption: ''
    };

    this.props.navigator.toggleNavBar({
      to: 'hidden', // required, 'hidden' = hide navigation bar, 'shown' = show navigation bar
      animated: true // does the toggle have transition animation or does it happen immediately (optional). By default animated: true
    });



  }


  componentDidMount() {
    this.patrolService.getState((state) => {
      this.setState({
        patrolData: state
      });
    });

    this.idService.getState((state) => {
      this.setState({
        idData: state
      });

    });

  }

  onLogout(){
    EventRegister.emit('log out', 'it works!!!');

    this.props.navigator.push({
        screen: 'foxwatch.LoginView', // unique ID registered with Navigation.registerScreen
        title: '🦊', // navigation bar title of the pushed screen (optional)
        passProps: {}, // Object that will be passed as props to the pushed screen (optional)
        animated: true, // does the push have transition animation or does it happen immediately (optional)
        animationType: 'fade', // 'fade' (for both) / 'slide-horizontal' (for android) does the push have different transition animation (optional)
        backButtonTitle: undefined, // override the back button title (optional)
        backButtonHidden: true, // hide the back button altogether (optional)
        navigatorStyle: {}, // override the navigator style for the pushed screen (optional)
        navigatorButtons: {}, // override the nav buttons for the pushed screen (optional)
        // enable peek and pop - commited screen will have `isPreview` prop set as true.
        previewView: undefined, // react ref or node id (optional)
        previewHeight: undefined, // set preview height, defaults to full height (optional)
        previewCommit: true, // commit to push preview controller to the navigation stack (optional)
        previewActions: [{ // action presses can be detected with the `PreviewActionPress` event on the commited screen.
          id: '', // action id (required)
          title: '', // action title (required)
          style: undefined, // 'selected' or 'destructive' (optional)
          actions: [], // list of sub-actions
        }],
      });

  }

  onClickClose() {
    this.bgService.playSound('CLOSE');
    this.props.navigator.dismissModal({
      animationType: 'slide-down' // 'none' / 'slide-down' , dismiss animation for the modal (optional, default 'slide-down')
    });
  }



  render() {
    return (


      <View style={styles.container}>


        <View style={styles.topToolbar}>



          <Text style={styles.toolbarTitle}>Options</Text>


          <View style={styles.toolbarButtonContainer} >
            <Icon.Button
              name="md-arrow-dropdown-circle"
              size={30}
              backgroundColor="transparent"
              underlayColor="transparent"
              onPress={this.onClickClose.bind(this)}
              color={Config.colors.black}
              paddingTop={15}
            >
            </Icon.Button>
          </View>



        </View>

        <Content contentContainerStyle={styles.content}>


          <Form style={styles.form}>

            <Icon.Button style={styles.incidentButton}
              name="md-power"
              size={30}
              backgroundColor="transparent"
              underlayColor="transparent"
              onPress={this.onLogout.bind(this)}
              color={Config.colors.black}
              paddingTop={15}
            >Log Out
            </Icon.Button>

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
    borderBottomColor: Config.colors.off_white,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

  },
  content: {
    justifyContent: 'center',
  },
  photoContainer: {
    backgroundColor: Config.colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incidentMedia: {
    width: null,
    height: 600,

  },
  form: {
  },
  headerItem: {
    backgroundColor: Config.colors.light_orange
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left'
  },
  label: {
    flex: 1
  },
  button: {
    borderWidth: 0,
    borderRadius: 5,
    marginBottom: 0
  },
  buttonLabel: {
    fontSize: 14,
    color: Config.colors.off_white
  },
  redButton: {
    backgroundColor: '#ff3824'
  },
  blueButton: {
    backgroundColor: '#0076ff'
  },
  formItem: {
    backgroundColor: Config.colors.off_white
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
  toolbarButtonContainer: {
    flex: 0.2
  },
  incidentButton: {
    borderTopWidth: 2,
    borderTopColor: Config.colors.black,
    borderBottomWidth: 2,
    borderBottomColor: Config.colors.black,
    marginBottom: 5,
    backgroundColor: Config.colors.light_blue,
  }
});


module.exports = OptionsView;