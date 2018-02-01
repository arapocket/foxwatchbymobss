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
import Button from 'apsl-react-native-button'
import Config from '../config';
import PatrolService from '../lib/PatrolService';



class CameraView extends React.Component {

    static navigatorStyle = {
        navBarBackgroundColor: Config.colors.orange
    };

    constructor(props) {

        super(props);
        this.patrolService = PatrolService.getInstance();


        this.state = {

            patrolData: {}

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
                    jpegQuality = {90}
                    fixOrientation = {true}
                    
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
                        <Icon.Button style={styles.captureButton}
                            name="md-camera"
                            size={50}
                            onPress={this.takePicture.bind(this)}
                            backgroundColor="transparent"
                            underlayColor="transparent"
                            color={Config.colors.off_white}
                            iconStyle={{ marginRight: 0 }}

                        ></Icon.Button>

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



    takePicture() {
        const options = {
        };
        //options.location = ...
        this.camera.capture({ metadata: options })
            .then((data) => {
                console.log("logging path");
                console.log(data.path);
                // this.refs.modal.close();
                console.log(data)
                this.patrolService.setMediaPath(data.path);
                this.patrolService.getState((state) => {
                    this.setState({
                        patrolData: state
                    });
                    console.log("logging patrolData");
                    console.log(this.state.patrolData);
                });

                this.props.onDone(data.path);

                this.props.navigator.dismissModal({
                    animationType: 'slide-down' // 'none' / 'slide-down' , dismiss animation for the modal (optional, default 'slide-down')
                });

            })



            .catch(err => console.error(err));
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
        justifyContent:'flex-end'
    }

});



module.exports = CameraView;