'use strict';

import React, { Component } from 'react';
import {
    AsyncStorage,
} from 'react-native';

import EventEmitter from 'EventEmitter';

const STORAGE_KEY = "IDService";
let instance = null;
let eventEmitter = new EventEmitter();
import { EventRegister } from 'react-native-event-listeners'

class IDService {


    static getInstance() {
        if (instance === null) {
            instance = new IDService();
        }
        return instance;
    }
    constructor(props) {
        this.state = {
            currentGuardID: '',
            currentPatrolID: '',
            currentCoordID: '',
            currentRouteID: '',
            currentCheckpointID: '',
            currentIncidentID: '',
            currentGuardLocationID: '',
            guardFirstNames: ["Tom", "John", "Ringo", "Michael", "Conor"],
            guardLastNames: ["Hardy", "Lennon", "Starr", "Scott", "McGregor"],
            currentGuardFirstName: "",
            currentGuardLastName: ''
        };
        this._loadState();



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
        AsyncStorage.getItem(STORAGE_KEY + ":idData", (err, value) => {
            if (value) {
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
        AsyncStorage.setItem(STORAGE_KEY + ":idData", JSON.stringify(this.state, null));
    }



    createGuardID() {

        let currentGuardID = Math.random().toString(36).substr(2, 9);
        let currentGuardFirstName = this.state.guardFirstNames[this.randomIntFromInterval(0, 4)]
        let currentGuardLastName = this.state.guardLastNames[this.randomIntFromInterval(0, 4)]
        this.set("currentGuardID", currentGuardID);
        this.set("currentGuardFirstName", currentGuardFirstName);
        this.set("currentGuardLastName", currentGuardLastName);
        // console.log('logging IDService state');
        // console.log(this.state);
    }


    randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    createPatrolID() {
        let currentPatrolID = Math.random().toString(36).substr(2, 9);
        this.set("currentPatrolID", currentPatrolID);
    }

    createCoordID() {
        let currentCoordID = Math.random().toString(36).substr(2, 9);
        this.set("currentCoordID", currentCoordID);
    }

    createRouteID() {
        let currentRouteID = Math.random().toString(36).substr(2, 9);
        this.set("currentRouteID", currentRouteID);
    }

    createCheckpointID() {
        let currentCheckpointID = Math.random().toString(36).substr(2, 9);
        this.set("currentCheckpointID", currentCheckpointID);
    }

    createIncidentID() {
        let currentIncidentID = Math.random().toString(36).substr(2, 9);
        this.set("currentIncidentID", currentIncidentID);
    }

    createGuardLocationID() {
        let currentGuardLocationID = Math.random().toString(36).substr(2, 9);
        this.set("currentGuardLocationID", currentGuardLocationID);
    }

    getCurrentPatrolID() {
        return this.state.currentPatrolID;
    }

    getCurrentGuardID() {
        return this.state.currentGuardID;
    }

    getCurrentIncidentID(){
        return this.state.currentIncidentID;
    }

    getCurrentCoordID() {
        return this.state.currentCoordID;
    }

    setCurrentGuard(username) {

        console.log('setCurrentGuard called');

        fetch('http://ec2-34-210-155-178.us-west-2.compute.amazonaws.com:3000/getGuard/' + username)
            .then(res => res.json())
            .then(json => {


                let guard = json[0];


                this.set('currentGuardID', guard.GuardID);
                this.set('currentGuardFirstName', guard.FirstName);
                this.set('currentGuardLastName', guard.LastName);

            }
            ).catch(err => {
                // console.log(err);
            });
    }

    resetState(){

        this.set('currentGuardID', '');
        this.set('currentPatrolID', '');
        this.set('currentCoordID', '');
        this.set('currentRouteID', '');
        this.set('currentCheckpointID', '');
        this.set('currentIncidentID', '');
        this.set('currentGuardLocationID', '');
        this.set('currentGuardFirstName', '');
        this.set('currentGuardLastName', '');
    }

}

module.exports = IDService;