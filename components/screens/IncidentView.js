'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableWithoutFeedback,
  TextInput,
  Image
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
import AuthService from '../lib/AuthService';
import BGService from '../lib/BGService';
import IDService from '../lib/IDService';



import commonStyles from '../styles';
import Config from '../config';
import { RadioButtons, SegmentedControls } from 'react-native-radio-buttons';


import { RNS3 } from 'react-native-aws3';

import Video from "react-native-video";

import { EventRegister } from 'react-native-event-listeners'

import MovToMp4 from 'react-native-mov-to-mp4';


class IncidentView extends React.Component {

  static navigatorStyle = {
    navBarBackgroundColor: Config.colors.orange
  };

  constructor(props) {
    super(props);

    this.bgService = BGService.getInstance();
    this.patrolService = PatrolService.getInstance();
    this.idService = IDService.getInstance();
    this.authService = AuthService.getInstance();

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

  onClickClose() {
    this.bgService.playSound('CLOSE');
    this.props.navigator.dismissModal({
      animationType: 'slide-down' // 'none' / 'slide-down' , dismiss animation for the modal (optional, default 'slide-down')
    });
  }

  renderCheckList() {
    const options = [
      "Fight",
      "Fire",
      "Public Intoxication",
      "Safety Hazard",
      "Traffic Accident",
      "Transient",
      "Tresspass",
      "Vandalism",
      "Wet Floor",
      "Other"

    ];

    function setSelectedOption(checkListOption) {
      this.setState({
        checkListOption,
      });
    }

    function renderOption(option, selected, onSelect, index) {

      const textStyle = {
        paddingTop: 10,
        paddingBottom: 10,
        color: 'black',
        flex: 1,
        fontSize: 14,
      };
      const baseStyle = {
        flexDirection: 'row',
      };
      var style;
      var checkMark;

      if (index > 0) {
        style = [baseStyle, {
          borderTopColor: '#eeeeee',
          borderTopWidth: 1,
        }];
      } else {
        style = baseStyle;
      }

      if (selected) {
        checkMark = <Text style={{
          flex: 0.1,
          color: '#007AFF',
          fontWeight: 'bold',
          paddingTop: 8,
          fontSize: 20,
          alignSelf: 'center',
        }}>✓</Text>;
      }

      return (
        <TouchableWithoutFeedback onPress={onSelect} key={index}>
          <View style={style}>
            <Text style={textStyle}>{option}</Text>
            {checkMark}
          </View>
        </TouchableWithoutFeedback>
      );
    }

    function renderContainer(options) {
      return (
        <View style={{
          backgroundColor: Config.colors.off_white,
          paddingLeft: 20,
        }}>
          {options}
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <View style={{ backgroundColor: Config.colors.off_white }}>

          <View style={{
          }}>

            <RadioButtons
              options={options}
              onSelection={setSelectedOption.bind(this)}
              selectedOption={this.state.checkListOption}
              renderOption={renderOption}
              renderContainer={renderContainer}
            />
          </View>
          {/* <Text style={{
            margin: 20,
          }}>Incident Type: {this.state.checkListOption || 'none'}</Text> */}
        </View>
      </View>);

  }

  onPressPhotoButton() {

    this.bgService.playSound('OPEN');
    this.props.navigator.showModal({
      screen: "foxwatch.CameraView", // unique ID registered with Navigation.registerScreen
      title: "🦊", // title of the screen as appears in the nav bar (optional)
      passProps: {
        onDone: (data) => {
          // console.log('logging photo path from IncidentView');
          // console.log(data);

          this.patrolService.getState((state) => {
            this.setState({
              patrolData: state
            });

          });

        }

      }, // simple serializable object that will pass as props to the modal (optional)
      animationType: 'slide-up' // 'none' / 'slide-up' , appear animation for the modal (optional, default 'slide-up')
    });

  }

  onPressVideoButton() {

    this.bgService.playSound('OPEN');
    this.props.navigator.showModal({
      screen: "foxwatch.VideoView", // unique ID registered with Navigation.registerScreen
      title: "🦊", // title of the screen as appears in the nav bar (optional)
      passProps: {
        onDone: (data) => {
          // console.log('logging photo path from IncidentView');
          // console.log(data);

          this.patrolService.getState((state) => {
            this.setState({
              patrolData: state
            });

          });

        }

      }, // simple serializable object that will pass as props to the modal (optional)
      animationType: 'slide-up' // 'none' / 'slide-up' , appear animation for the modal (optional, default 'slide-up')
    });

  }

  onPressSubmitButton() {

    console.log('logging mediaType from onPressSubmitButton: ' + this.patrolService.getMediaType())
    let mediaType = this.patrolService.getMediaType();


    this.idService.createIncidentID();

    var description = this.state.description;

    if (description == '') {
      description = 'No description entered.'
    }

    var incidentType = this.state.checkListOption;

    if (incidentType == '') {
      incidentType = 'Other'
    }

    fetch('http://ec2-34-210-155-178.us-west-2.compute.amazonaws.com:3000/incidents', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        IncidentID: this.idService.getCurrentIncidentID(),
        Description: description,
        Type: incidentType,
        lat: this.state.patrolData.currentLat,
        lng: this.state.patrolData.currentLng,
        PatrolID: this.idService.getCurrentPatrolID(),
        Media: mediaType

      })
    }).then((response) => {
      console.log('logging media type: ' + this.patrolService.getMediaType());
      console.log("logging incident post response");
      console.log(response);
      this.props.navigator.dismissModal({
        animationType: 'slide-down' // 'none' / 'slide-down' , dismiss animation for the modal (optional, default 'slide-down')
      });
      this.uploadMedia();
    }).catch((err) => {
      console.log(err);
      this.authService.toast("The incident was not sent. Please check your connection and try again.")
    })

    EventRegister.emit('new incident', this.idService.getCurrentIncidentID());

  }

  incidentMedia() {

    let mediaPath = this.state.patrolData.mediaPath;

    if (mediaPath != undefined && mediaPath != '' && mediaPath != null) {

      if (mediaPath.includes('.mov')) {

        console.log('yes it includes .mov');

        var media = <Video style={styles.incidentMedia} source={{ uri: mediaPath }} volume={1.0} repeat={true} />

      } else {
        var media = <Image style={styles.incidentMedia} source={{ uri: mediaPath }} />

      }

    } else {
    }

    return (
      <View >
        {media}
      </View>
    );
  }

  uploadMedia() {
    var fileName = this.state.idData.currentIncidentID;
    this.fetchPresignUrl(fileName);
  }

  fetchPresignUrl(fileName) {

    var xhr = new XMLHttpRequest();

    var self = this;

    xhr.onreadystatechange = function () {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        // alert(xhr.responseText);
        var res = xhr.responseText;
        console.log('logging the fetchPresignUrl res');
        console.log(res);
        self.sendFile(fileName, res);
      }
    }


    xhr.open("GET", 'http://ec2-34-210-155-178.us-west-2.compute.amazonaws.com:8080/getPreSignUrl?fileName=' + fileName, true);

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(null);

  }

  sendFile(fileName, presignedUrl) {

    let mediaPath = this.patrolService.getMediaPath();


    console.log('logging media path inside sendFile()');
    console.log(mediaPath);



    if (mediaPath.length > 0 && mediaPath != undefined && mediaPath != null) {

      let filePath = ''

      var fileType = 'media/jpeg';

      if (this.patrolService.getMediaType() == 'video'){

        console.log('media type is video');

        filePath = this.patrolService.getMediaPath();

        MovToMp4.convertMovToMp4(filePath, fileName + ".mp4", function (results) {
          console.log('logging results of video convert');
          console.log(results);
          filePath = results;


          var xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                console.log('Successfully uploaded the file')
              } else {
                console.log('The file could not be uploaded')
              }
            }
          }
          xhr.open('PUT', presignedUrl)
          xhr.send({
            uri: filePath, type: fileType, name: fileName
          });

        });
      } else {
        filePath = 'file://' + this.patrolService.getMediaPath();

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              console.log('Successfully uploaded the file')
            } else {
              console.log('The file could not be uploaded')
            }
          }
        }
        xhr.open('PUT', presignedUrl)
        xhr.send({
          uri: filePath, type: fileType, name: fileName
        });

      }

    }

  }

  render() {
    return (


      <View style={styles.container}>


        <View style={styles.topToolbar}>



          <Text style={styles.toolbarTitle}>Report Incident</Text>


          <View style={styles.toolbarButtonContainer} >
            <Icon.Button
              name="md-arrow-dropdown-circle"
              size={30}
              onPress={this.onClickClose.bind(this)}
              backgroundColor="transparent"
              underlayColor="transparent"
              color={Config.colors.black}
              paddingTop={15}
            >
            </Icon.Button>
          </View>



        </View>

        <Content contentContainerStyle={styles.content}>


          <Form style={styles.form}>
            <View style={styles.headerItem}>
              <Text style={styles.header}>Type of Incident:</Text>
            </View>
            <ScrollView >
              {this.renderCheckList()}
            </ScrollView>
            <View style={styles.headerItem}>
              <Text style={styles.header}>Description:</Text>
            </View>
            <TextInput style={styles.textInput}
              {...this.props} // Inherit any props passed to it; e.g., multiline, numberOfLines below
              editable={true}
              maxLength={40}
              autoCapitalize='sentences'
              placeholder='Enter a description.'
              placeholderTextColor={Config.colors.grey}
              selectTextOnFocus={true}
              multiline={true}
              onChangeText={(text) => this.setState({ description: text })}

            />

            <Icon.Button style={styles.incidentButton}
              name="md-camera"
              size={30}
              onPress={this.onPressPhotoButton.bind(this)}
              backgroundColor="transparent"
              underlayColor="transparent"
              color={Config.colors.black}
              paddingTop={15}
            >Take Photo
            </Icon.Button>
            <Icon.Button style={styles.incidentButton}
              name="md-videocam"
              size={30}
              onPress={this.onPressVideoButton.bind(this)}
              backgroundColor="transparent"
              underlayColor="transparent"
              color={Config.colors.black}
              paddingTop={15}
            >Record Video
            </Icon.Button>


            <Icon.Button style={styles.incidentButton}
              name="md-send"
              size={30}
              onPress={this.onPressSubmitButton.bind(this)}
              backgroundColor="transparent"
              underlayColor="transparent"
              color={Config.colors.black}
              paddingTop={15}
            >Submit
                </Icon.Button>

          </Form>


          {this.incidentMedia()}


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
  },
  textInput: {
    backgroundColor: Config.colors.white,
    fontSize: 18,
    marginBottom: 30
  }
});


module.exports = IncidentView;