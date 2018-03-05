import React, { Component } from 'react';
import { Text } from 'react-native';

import { Button, Card, CardSection, Input, Spinner } from '../common';

import AuthService from '../lib/AuthService';
import IDService from '../lib/IDService';

import { EventRegister } from 'react-native-event-listeners'

class LoginView extends React.Component {

  constructor(props){

    super(props);

    this.state = { username: '', password: '', error: '', loading: false, loggedIn: false,
    authData: {}
 };

 this.idService = IDService.getInstance();
 this.authService = AuthService.getInstance();


  }




  componentDidMount(){


  }

  onButtonPress() {
    const { username, password } = this.state;

    this.setState({ error: '', loading: true });

    this.authenticate(username, password)
  }

  authenticate(username, password){
    fetch('http://ec2-34-210-155-178.us-west-2.compute.amazonaws.com:3000/guardauth', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Username: username,
        Password: password
      })
    }).then((response) => response.json().then((json) => 
  {
          
    if (json == 'success'){

      console.log('sucess');

      EventRegister.emit('log in', 'it works!!!');

      this.idService.setCurrentGuard(username);

      this.onLoginSuccess();
  
      this.props.navigator.push({
        screen: 'foxwatch.HomeView', // unique ID registered with Navigation.registerScreen
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
    }  else {
      this.onLoginFail();
    }



  }));

      

  }

  onLoginFail() {
    this.setState({ error: 'Authentication Failed', loading: false });
  }

  onLoginSuccess() {

    this.setState({
      username: '',
      password: '',
      loading: false,
      error: ''
    });
  }

  renderButton() {
    if (this.state.loading) {
      return <Spinner size="small" />;
    }

    return (
      <Button onPress={this.onButtonPress.bind(this)}>
        Log in
      </Button>
    );
  }

  render() {
    return (
      <Card>
        <CardSection>
          <Input
            placeholder="username"
            label="Username"
            value={this.state.username}
            onChangeText={username => this.setState({ username })}
            autoCapitalize = 'none'
          />
        </CardSection>

        <CardSection>
          <Input
            secureTextEntry
            placeholder="password"
            label="Password"
            value={this.state.password}
            onChangeText={password => this.setState({ password })}
          />
        </CardSection>

        <Text style={styles.errorTextStyle}>
          {this.state.error}
        </Text>

        <CardSection>
          {this.renderButton()}
        </CardSection>
      </Card>
    );
  }
}

const styles = {
  errorTextStyle: {
    fontSize: 20,
    alignSelf: 'center',
    color: 'red'
  }
};

export default LoginView;