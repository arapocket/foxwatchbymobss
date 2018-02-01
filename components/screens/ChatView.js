'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Switch,
  Platform,
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
  Input
} from "native-base";


import Icon from 'react-native-vector-icons/Ionicons';
import Button from 'apsl-react-native-button'

import AuthService from '../lib/AuthService';
import BGService from '../lib/BGService';

import { EventRegister } from 'react-native-event-listeners'


import commonStyles from '../styles';
import Config from '../config';


class ChatView extends React.Component {

  static navigatorStyle = {
    navBarBackgroundColor: Config.colors.orange
  };

  constructor(props) {
    super(props);

    this.bgService = BGService.getInstance();
    this.authService = AuthService.getInstance();

    // Default state
    this.state = {
      patrolData: {},
      message: ''
    };

    this.props.navigator.toggleNavBar({
      to: 'hidden', // required, 'hidden' = hide navigation bar, 'shown' = show navigation bar
      animated: true // does the toggle have transition animation or does it happen immediately (optional). By default animated: true
    });

    this.renderMessages = this.renderMessages.bind(this);

  }


  componentDidMount() {

    this.authService.getState((state) => {
      this.setState({
        patrolData: state
      });
    });

    this.listener = EventRegister.addEventListener('incoming chat', (data) => {
      this.authService.getState((state) => {
        this.setState({
          patrolData: state
        });
      });
      this.renderMessages();
    })

  }


  renderMessages() {




    console.log('logging patrolData messages inside renderMessages');
    console.log(this.state.patrolData.messages);

    if (this.state.patrolData.messages != undefined) {
      return this.state.patrolData.messages.map(msg =>
        <Text key={this.createMessageKey()} style={styles.messages} >
          {msg.user} : {msg.msg}
        </Text>)
    } else {
      return;
    }



  }


  onClickClose() {
    this.bgService.playSound('CLOSE');
    this.props.navigator.dismissModal({
      animationType: 'slide-down' // 'none' / 'slide-down' , dismiss animation for the modal (optional, default 'slide-down')
    });
  }

  onPressSubmitButton() {

    this.authService.emitMessage(this.state.message);
    this.setState({ message: '' })


    this.authService.getState((state) => {
      this.setState({
        patrolData: state
      });
      console.log('logging patrolData inside onPressSubmitButton');
      console.log(this.state.patrolData);
    });

    this.renderMessages();

  }

  createMessageKey() {
    return Math.random().toString(36).substr(2, 9);
  }

  render() {
    return (


      <View style={styles.container}>


        <View style={styles.topToolbar}>

          <Text style={styles.toolbarTitle}>FOXCHAT</Text>

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

            <ScrollView style={styles.messagesContainer} >
              {this.renderMessages()}
            </ScrollView>

            <TextInput style={styles.textInput}
              {...this.props} // Inherit any props passed to it; e.g., multiline, numberOfLines below
              editable={true}
              maxLength={40}
              autoCapitalize='sentences'
              placeholder='Enter a message.'
              placeholderTextColor={Config.colors.grey}
              selectTextOnFocus={true}
              multiline={true}
              onChangeText={(text) => this.setState({ message: text })}
              value={this.state.message}

            />

            <Icon.Button style={styles.incidentButton}
              name="md-send"
              size={30}
              onPress={this.onPressSubmitButton.bind(this)}
              backgroundColor="transparent"
              underlayColor="transparent"
              color={Config.colors.black}
              paddingTop={15}
            >Send
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
  incidentPhoto: {
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
  },
  messagesContainer: {
    backgroundColor: Config.colors.black,
    marginBottom: 30
  },
  messages: {
    fontSize: 18,
    color: Config.colors.white

  }
});


module.exports = ChatView;