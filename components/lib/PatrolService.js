'use strict';

import React, {
    Component
} from 'react';
import {
    AsyncStorage,
} from 'react-native';


import EventEmitter from 'EventEmitter';
import IDService from './IDService';

const STORAGE_KEY = "PatrolService";

let instance = null;
let eventEmitter = new EventEmitter();

class PatrolService extends React.Component {


    static getInstance() {
        if (instance === null) {
            instance = new PatrolService();
        }
        return instance;
    }
    constructor(props) {
        super(props);

        // console.log('calling idService getInstance inside PatrolService');
        this.idService = IDService.getInstance();

        this.state = {
            COLORS: {
                gold: '#fedd1e',
                white: "#fff",
                blue: "#2677FF",
                light_blue: "#3366cc",
                polyline_color: "#00B3FD",
                green: "#16BE42",
                dark_purple: "#2A0A73",
                grey: "#404040",
                red: "#FE381E",
                dark_red: "#A71300",
                black: "#000"
            },
            ICON_MAP: {
                activity_unknown: "help-circle",
                activity_still: "body",
                activity_shaking: "walk",
                activity_on_foot: "walk",
                activity_walking: "walk",
                activity_running: "walk",
                activity_on_bicycle: "bicycle",
                activity_in_vehicle: "car",
                pace_true: "pause",
                pace_false: "play",
                provider_network: "wifi",
                provider_gps: "locate",
                provider_disabled: "warning"
            },
            MESSAGE: {
                reset_odometer_success: 'Reset odometer success',
                reset_odometer_failure: 'Failed to reset odometer: {result}',
                sync_success: 'Sync success ({result} records)',
                sync_failure: 'Sync error: {result}',
                destroy_locations_success: 'Destroy locations success ({result} records)',
                destroy_locations_failure: 'Destroy locations error: {result}',
                removing_markers: 'Removing markers...',
                rendering_markers: 'Rendering markers...'
            },
            mediaPath: '',
            currentLat: 0,
            currentLng: 0,
            idData: {

            },
            messages: []


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
        AsyncStorage.getItem(STORAGE_KEY + ":patrolData", (err, value) => {
            if (value) {
                // console.log('state loaded, here it is:')
                // console.log(value);
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
        AsyncStorage.setItem(STORAGE_KEY + ":patrolData", JSON.stringify(this.state, null));
        // console.log('state saved, here it is:')
        // console.log(this.state);
    }

    setMediaPath(path) {
        this.set("mediaPath", path)
    }

    getMediaPath(){
        return this.state.mediaPath;
    }




}

module.exports = PatrolService;