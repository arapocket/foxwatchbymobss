'use strict';
import React, { Component } from 'react';
import {
    AppRegistry,
    Dimensions,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from 'react-native';

import {
    Form
} from "native-base";

import Camera from 'react-native-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import Button from 'apsl-react-native-button'
import Config from '../config';
import PatrolService from '../lib/PatrolService';



class VideoView extends React.Component {

    static navigatorStyle = {
        navBarBackgroundColor: Config.colors.orange
    };

    constructor(props) {

        super(props);
        this.patrolService = PatrolService.getInstance();


        this.state = {

            patrolData: {},
            isRecording: false

        };


        this.props.navigator.toggleNavBar({
            to: 'hidden', // required, 'hidden' = hide navigation bar, 'shown' = show navigation bar
            animated: true // does the toggle have transition animation or does it happen immediately (optional). By default animated: true
        });


    }


    ComponentDidMount() {
        this.patrolService.getState((state) => {
            this.setState({
                patrolData: state
            });
            console.log("logging idData");
            console.log(this.state.idData);
        });
    }

    render() {
        return (
            <View style={styles.container} >

                <Camera
                    ref={(cam) => {
                        this.camera = cam;
                    }}
                    style={styles.preview}
                    aspect={Camera.constants.Aspect.fill}
                    mirrorImage={false}
                    flashMode={Camera.constants.FlashMode.auto}
                    captureTarget={Camera.constants.CaptureTarget.disk}
                    jpegQuality={90}
                    fixOrientation={true}
                    captureMode={Camera.constants.CaptureMode.video}
                    audio={true}

                >
                    <Icon.Button style={styles.cancelButton}
                        name="md-close-circle"
                        size={50}
                        onPress={this.close.bind(this)}
                        backgroundColor="transparent"
                        underlayColor="transparent"
                        color={Config.colors.off_white}
                        iconStyle={{ marginRight: 0 }}

                    ></Icon.Button>



                    <View style={styles.buttonContainer}>
                        {this.captureButton()}
                    </View>

                </Camera>

            </View>


        );
    }

    close() {
        this.props.navigator.dismissModal({
            animationType: 'slide-down' // 'none' / 'slide-down' , dismiss animation for the modal (optional, default 'slide-down')
        });
    }

    captureButton() {

        if (!this.state.isRecording) {
            var button = <Icon.Button style={styles.captureButton} name="md-videocam" size={50} onPress={this.recordVideo.bind(this)} backgroundColor="transparent" underlayColor="transparent" color={Config.colors.off_white} iconStyle={{ marginRight: 0 }} ></Icon.Button>
        } else {
            var button = <EntypoIcon.Button style={styles.captureButton} name="controller-stop" size={50} onPress={this.recordVideo.bind(this)} backgroundColor="transparent" underlayColor="transparent" color={Config.colors.red} iconStyle={{ marginRight: 0 }} ></EntypoIcon.Button>
        }


        return (
            <View >
                {button}
            </View>
        );
    }


    recordVideo() {
        console.log('record video called');
        if (!this.state.isRecording) {
            this.setState({ isRecording: true });

            setTimeout(() => {
                this.setState({ isRecording: false })
                this.camera.stopCapture();
                this.props.navigator.dismissModal({
                    animationType: 'slide-down' // 'none' / 'slide-down' , dismiss animation for the modal (optional, default 'slide-down')
                });
            }, 7000)

            this.camera.capture()
                .then((data) => {
                    this.patrolService.setMediaType('video');

                    this.patrolService.setMediaPath(data.path);
                    this.patrolService.getState((state) => {
                        this.setState({
                            patrolData: state
                        });

                    });

                    this.props.onDone(data.path);

                })

                .catch(err => console.error(err));


        } else {
            this.setState({ isRecording: false })
            this.camera.stopCapture();
            this.props.navigator.dismissModal({
                animationType: 'slide-down' // 'none' / 'slide-down' , dismiss animation for the modal (optional, default 'slide-down')
            });

        }
        console.log(this.state);

    }
}

const styles = StyleSheet.create({

    container: {

        flexDirection: "column",
        flex: 1,
        backgroundColor: Config.colors.white

    },
    preview: {
        flex: 1
    },
    capture: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 5,
        color: '#000',
        padding: 10,
        margin: 40
    },
    captureButton: {
        borderTopWidth: 2,
        borderTopColor: Config.colors.black,
        borderBottomWidth: 2,
        borderBottomColor: Config.colors.black,
        marginBottom: 5,
        alignSelf: 'center'
    },
    stopRecordingButton: {
        borderTopWidth: 2,
        borderTopColor: Config.colors.black,
        borderBottomWidth: 2,
        borderBottomColor: Config.colors.black,
        marginBottom: 5,
        alignSelf: 'center'
    },
    cancelButton: {
        borderTopWidth: 2,
        borderTopColor: Config.colors.black,
        borderBottomWidth: 2,
        borderBottomColor: Config.colors.black,
        marginBottom: 5


    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end'
    }

});



module.exports = VideoView;