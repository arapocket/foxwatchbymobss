/**
* BackgroundGeolocation Service
* A helper singleton for interacting with BackgroundGeolocation
*/
import {
  AsyncStorage
} from 'react-native';

import EventEmitter from 'EventEmitter';

import DeviceInfo from 'react-native-device-info';

const STORAGE_KEY = "@TSLocationManager:";

// react-native-device-info
let deviceInfo = {
  uuid: DeviceInfo.getUniqueID(),
  model: DeviceInfo.getModel(),
  platform: DeviceInfo.getSystemName(),
  manufacturer: DeviceInfo.getManufacturer(),
  version: DeviceInfo.getSystemVersion(),
  framework: 'ReactNative'
};

const SECTIONS = ['geolocation', 'activity recognition', 'application', 'persistence', 'http'];
const SETTINGS = {
  common: [
    // Geolocation
    {name: 'desiredAccuracy', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [-1, 0, 10, 100, 1000], defaultValue: 0 },
    {name: 'distanceFilter', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 2, 3, 5, 10, 20, 50, 100, 500], defaultValue: 2 },
    {name: 'disableElasticity', group: 'geolocation', dataType: 'boolean', inputType: 'toggle', values: [true, false], defaultValue: false},
    {name: 'stopAfterElapsedMinutes', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [-1, 0, 1, 2, 5, 10, 15], defaultValue: 0},
    {name: 'desiredOdometerAccuracy', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [10, 20, 50, 100, 500], defaultValue: 100},
    // Activity Recognition
    {name: 'activityRecognitionInterval', group: 'activity recognition', dataType: 'integer', inputType: 'select', values: [0, 1000, 5000, 10000, 30000], defaultValue: 0},
    {name: 'stopTimeout', group: 'activity recognition', dataType: 'integer', inputType: 'select', values: [0, 1, 5, 10, 15], defaultValue: 1},
    // HTTP & Persistence
    {name: 'url', group: 'http', inputType: 'text', dataType: 'string', defaultValue: 'http://your.server.com/endpoint'},
    {name: 'autoSync', group: 'http', dataType: 'boolean', inputType: 'toggle', values: [true, false], defaultValue: true},
    {name: 'autoSyncThreshold', group: 'http', dataType: 'integer', inputType: 'select', values: [0, 5, 10, 25, 50, 100], defaultValue: 0},
    {name: 'batchSync', group: 'http', dataType: 'boolean', inputType: 'toggle', values: [true, false], defaultValue: false},
    {name: 'maxBatchSize', group: 'http', dataType: 'integer', inputType: 'select', values: [-1, 50, 100, 250, 500], defaultValue: 250},
    {name: 'maxRecordsToPersist', group: 'http', dataType: 'integer', inputType: 'select', values: [-1, 0, 1, 10, 100, 1000], defaultValue: -1},
    {name: 'maxDaysToPersist', group: 'http', dataType: 'integer', inputType: 'select', values: [-1, 1, 2, 3, 4, 5, 6, 7], defaultValue: -1},
    // Application
    {name: 'stopOnTerminate', group: 'application', dataType: 'boolean', inputType: 'toggle', values: [true, false], defaultValue: true},
    {name: 'startOnBoot', group: 'application', dataType: 'boolean', inputType: 'toggle', values: [true, false], defaultValue: false},
    {name: 'heartbeatInterval', group: 'application', dataType: 'integer', inputType: 'select', values: [60, (2*60), (5*60), (15*60)], defaultValue: 60},
    // Logging & Debug
    {name: 'debug', group: 'debug', dataType: 'boolean', inputType: 'toggle', values: [true, false], defaultValue: true},
    {name: 'logLevel', group: 'debug', dataType: 'string', inputType: 'select', values: ['OFF', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'VERBOSE'], defaultValue: 'VERBOSE'},
    {name: 'logMaxDays', group: 'debug', dataType: 'integer', inputType: 'select', values: [1, 2, 3, 4, 5, 6, 7], defaultValue: 3}
  ],
  ios: [
    // Geolocation
    {name: 'stationaryRadius', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 25, 50, 100, 500, 1000, 5000], defaultValue: 0 },
    {name: 'activityType', group: 'geolocation', dataType: 'string', inputType: 'select', values: ['Other', 'AutomotiveNavigation', 'Fitness', 'OtherNavigation'], defaultValue: 'Fitness'},
    {name: 'useSignificantChangesOnly', group: 'geolocation', dataType: 'boolean', inputType: 'toggle', values: [true, false], defaultValue: false},
    // Application
    {name: 'preventSuspend', group: 'application', dataType: 'boolean', inputType: 'toggle', values: [true, false], defaultValue: true},
    // Activity Recognition
    {name: 'disableStopDetection', group: 'activity recognition', dataType: 'boolean', inputType: 'toggle', values: [true, false], defaultValue: true},
    {name: 'stopDetectionDelay', group: 'activity recognition', dataType: 'integer', inputType: 'select', values: [0, 1, 5, 10, 15], defaultValue: 0}
  ],
  android: [
    // Geolocation
    {name: 'locationUpdateInterval', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 1000, 5000, 10000, 30000, 60000], defaultValue: 5000},
    {name: 'fastestLocationUpdateInterval', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 1000, 5000, 10000, 30000, 60000], defaultValue: 1000},
    {name: 'deferTime', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, (10*1000), (30*1000), (60*1000), (5*60*1000)], defaultValue: 0},
    // Activity Recognition
    {name: 'triggerActivities', group: 'activity recognition', dataType: 'string', inputType: 'select', values: ['in_vehicle', 'on_bicycle', 'on_foot', 'running', 'walking'], defaultValue: 'in_vehicle, on_bicycle, running, walking, on_foot'},      
    // Application
    {name: 'foregroundService', group: 'application', dataType: 'boolean', inputType: 'toggle', values: [true, false], defaultValue: false},
    {name: 'forceReloadOnMotionChange', group: 'application', dataType: 'boolean', inputType: 'toggle', values: [true, false], defaultValue: false},
    {name: 'forceReloadOnLocationChange', group: 'application', dataType: 'boolean', inputType: 'toggle', values: [true, false], defaultValue: false},
    {name: 'forceReloadOnHeartbeat', group: 'application', dataType: 'boolean', inputType: 'toggle', values: [true, false], defaultValue: false},
    {name: 'notificationPriority', group: 'application', dataType: 'string', inputType: 'select', values: ['DEFAULT', 'HIGH', 'LOW', 'MAX', 'MIN'], defaultValue: 'DEFAULT'}
  ]
};

//A collection of soundId for use with BackgroundGeolocation#playSound
const SOUND_MAP = {
  "ios": {
    "LONG_PRESS_ACTIVATE": 1113,
    "LONG_PRESS_CANCEL": 1075,
    "BUTTON_CLICK": 1104,
    "MESSAGE_SENT": 1303,
    "ERROR": 1006,
    "OPEN": 1502,
    "CLOSE": 1503,
    "FLOURISH": 1509
  },
  "android": {
    "LONG_PRESS_ACTIVATE": 27,
    "LONG_PRESS_CANCEL": 94,
    "BUTTON_CLICK": 19,
    "MESSAGE_SENT": 90,
    "ERROR": 89,
    "OPEN": 37,
    "CLOSE": 94,
    "FLOURISH": 37
  }
};

let eventEmitter = new EventEmitter();


// Singleton instance
let instance = null;

class BGService {

  static getInstance() {
    if (!instance) {
      instance = new BGService();
    }
    return instance;
  }

  constructor() {
    this.uuid = null;
    this.getUUID((uuid) => {
      this.uuid = uuid;
    });
    this.state = {};

    this.plugin = global.BackgroundGeolocation;

    let platform = DeviceInfo.getSystemName();
    if (platform.match(/iPhone/)) {
      platform = 'ios'
    };
    this.platform = platform.toLowerCase();

    let items = [].concat(SETTINGS.common).concat(SETTINGS[this.platform]);
    this.settings = {
      items: items,
      map: {}
    };
    // Create a Map of Settings
    items.forEach((item) => {
      this.settings.map[item.name] = item;
    });

    // console.log('BGService#constructor');
  }

  getUUID(callback) {
    AsyncStorage.getItem(STORAGE_KEY+"uuid", function(err, uuid) {
      if (uuid) {
        this.uuid = uuid;
      }
      callback(this.uuid);
    });
  }

  setUUID(uuid) {
    AsyncStorage.setItem(STORAGE_KEY+"uuid", uuid);
  }

  getPlugin() {
    return this.plugin;
  }

  getPlatform() {
    return this.platform;
  }

  getPlatformSettings(group) {
    if (group === undefined) {
      return this.settings.items;
    } else {
      let settings = [];
      this.settings.items.forEach((setting) => {
        if (setting.group === group && !setting.ignore) {
          settings.push(setting);
        }
      });
      return settings;
    }
  }

  // Fetch plugin state.
  getState(callback) {
    if (this.uuid) {
      this.plugin.getState((state) => {
        this.state = state;
        callback(state);
      });
    } else {
      // Determine if this is app first-boot.
      this.getUUID((uuid) => {
        if (!uuid) {
          this.plugin.getState((state) => {
            // First boot:  Override default options from plugin state.
            // We want to start with debug: true.
            this.setUUID(deviceInfo.uuid);  // <-- flag to detect we've booted before

            state.debug = true;
            state.logLevel = this.plugin.LOG_LEVEL_VERBOSE;
            state.foregroundService = true;
            state.autoSync = true;
            state.stopOnTerminate = false;
            state.startOnBoot = true;
            state.heartbeatInterval = 60;
            state.distanceFilter = 3;
            state.params = {device: deviceInfo, test: '1'};
            this.state = state;
            callback(state);
          });
        } else {
          this.plugin.getState((state) => {

            this.setUUID(deviceInfo.uuid);  // <-- flag to detect we've booted before
            
                        state.debug = true;
                        state.logLevel = this.plugin.LOG_LEVEL_VERBOSE;
                        state.foregroundService = true;
                        state.autoSync = true;
                        state.stopOnTerminate = false;
                        state.startOnBoot = true;
                        state.heartbeatInterval = 60;
                        state.distanceFilter = 3;
                        state.params = {device: deviceInfo, test: '1'};
                        this.state = state;
                        callback(state);

          });
        }
      });
    }
  }

  isLocationTrackingMode() {
    return (this.state.trackingMode === 1) || (this.state.trackingMode === 'location');
  }

  // Set a plugin config option and execute BackgroundGeolocation#setConfig
  set(key, value, callback) {
    callback = callback || function(){};
    
    if (key === 'trackingMode') {
      if (value === 'location') {
        this.plugin.start((state) => {
          this.state = state;
          callback(state);
        });
      } else {

      }
    } else {
      let config = {};
      config[key] = value;
      this.state[key] = value;

      this.plugin.setConfig(config, (state) => {
        this.state = state;
        // console.log('- setConfig success', state);
        callback(state);
      });
    }
    eventEmitter.emit('change', key, value);
  }


  /**
  * Listen to config change events
  */
  on(event, callback) {
    eventEmitter.addListener(event, callback);
  }

  removeListeners() {
    eventEmitter.removeAllListeners();
  }

  setOdometer(value, success, failure) {
    success = success || function() {};
    failure = failure || function() {};
    this.plugin.setOdometer(value, (location) => {
      eventEmitter.emit('change', 'odometer', value);
      success(location);
    }, (error) => {
      failure(error);
    });
  }


  /**
  * Play a UI sound via BackgroundGeolocation
  * @param {String/Number} name/soundId
  */
  playSound(name) {
    var soundId = 0;

    if (typeof(name) === 'string') {
      soundId = SOUND_MAP[this.platform][name];
    } else if (typeof(name) === 'number') {
      soundId = name;
    }
    if (!soundId) {
      alert('Invalid sound id provided to BGService#playSound' + name);
      return;
    }
    this.plugin.playSound(soundId);
  }

  /**
  * Returns an array of locations for iOS Simulator City Drive Route
  * @return {Array}
  */
  getCityDriveData() {
    return [{"lat":"37.33527476","lng":"-122.03254703"},{"lat":"37.33500926","lng":"-122.03272188"},{"lat":"37.33467638","lng":"-122.03432425"},{"lat":"37.33453849","lng":"-122.03695223"},{"lat":"37.33447068","lng":"-122.04007348"},{"lat":"37.33446146","lng":"-122.04380955"},{"lat":"37.33426985","lng":"-122.04751058"},{"lat":"37.33352458","lng":"-122.05100549"},{"lat":"37.33275353","lng":"-122.05462472"},{"lat":"37.33228724","lng":"-122.05833354"},{"lat":"37.33307736","lng":"-122.06203541"},{"lat":"37.33422447","lng":"-122.06562781"},{"lat":"37.33435661","lng":"-122.06939204"},{"lat":"37.33369775","lng":"-122.07309474"},{"lat":"37.33368006","lng":"-122.07665613"},{"lat":"37.33492184","lng":"-122.07997503"},{"lat":"37.3370055","lng":"-122.0827595"},{"lat":"37.33879885","lng":"-122.08577472"},{"lat":"37.34046597","lng":"-122.08886286"},{"lat":"37.34208941","lng":"-122.09195687"},{"lat":"37.34415677","lng":"-122.09439031"},{"lat":"37.34576798","lng":"-122.09727888"},{"lat":"37.34719244","lng":"-122.1006624"},{"lat":"37.34894824","lng":"-122.1036539"},{"lat":"37.35145376","lng":"-122.10569934"},{"lat":"37.35357644","lng":"-122.10818206"},{"lat":"37.35478615","lng":"-122.11144128"},{"lat":"37.35583234","lng":"-122.11484701"},{"lat":"37.35772158","lng":"-122.11764607"},{"lat":"37.36040727","lng":"-122.11952001"},{"lat":"37.36303768","lng":"-122.12160442"},{"lat":"37.36457081","lng":"-122.12476867"},{"lat":"37.36489536","lng":"-122.12851823"},{"lat":"37.36543834","lng":"-122.13217241"},{"lat":"37.3664761","lng":"-122.13564763"},{"lat":"37.36776176","lng":"-122.13898061"},{"lat":"37.36994839","lng":"-122.1416339"},{"lat":"37.37240005","lng":"-122.14386038"},{"lat":"37.37481249","lng":"-122.14611939"},{"lat":"37.37709618","lng":"-122.14869624"},{"lat":"37.37961188","lng":"-122.15082139"},{"lat":"37.3826398","lng":"-122.15178036"},{"lat":"37.38560981","lng":"-122.15272559"},{"lat":"37.38774539","lng":"-122.15510789"},{"lat":"37.38869141","lng":"-122.15849049"},{"lat":"37.38931302","lng":"-122.16207476"},{"lat":"37.39081987","lng":"-122.1652427"},{"lat":"37.39210109","lng":"-122.16863067"},{"lat":"37.39242056","lng":"-122.17227965"},{"lat":"37.39361482","lng":"-122.17556879"},{"lat":"37.39578711","lng":"-122.17805511"},{"lat":"37.39821434","lng":"-122.18044236"},{"lat":"37.40071157","lng":"-122.18290622"},{"lat":"37.40313012","lng":"-122.18535374"},{"lat":"37.40549529","lng":"-122.18774837"},{"lat":"37.40759705","lng":"-122.19035128"},{"lat":"37.40890928","lng":"-122.19364872"},{"lat":"37.41002813","lng":"-122.19717013"},{"lat":"37.4111682","lng":"-122.20078524"},{"lat":"37.41233794","lng":"-122.20442475"},{"lat":"37.41363889","lng":"-122.20791833"},{"lat":"37.41583072","lng":"-122.2106204"},{"lat":"37.41782917","lng":"-122.21338064"},{"lat":"37.41872658","lng":"-122.21683566"},{"lat":"37.41935866","lng":"-122.22058933"},{"lat":"37.4209964","lng":"-122.22388736"},{"lat":"37.42303224","lng":"-122.22680837"},{"lat":"37.42510651","lng":"-122.22979057"},{"lat":"37.42738525","lng":"-122.23260102"},{"lat":"37.42942843","lng":"-122.23549663"},{"lat":"37.4313864","lng":"-122.23829728"},{"lat":"37.43354365","lng":"-122.24095367"},{"lat":"37.4357105","lng":"-122.24350931"},{"lat":"37.4378918","lng":"-122.24613695"},{"lat":"37.44000262","lng":"-122.24876996"},{"lat":"37.44207177","lng":"-122.25146784"},{"lat":"37.44364246","lng":"-122.25458952"},{"lat":"37.44423451","lng":"-122.25815644"},{"lat":"37.44401797","lng":"-122.26182293"},{"lat":"37.44381697","lng":"-122.26544651"},{"lat":"37.4444387","lng":"-122.26900388"},{"lat":"37.44598499","lng":"-122.27225807"},{"lat":"37.44805758","lng":"-122.27523289"},{"lat":"37.45014137","lng":"-122.27827786"},{"lat":"37.45213903","lng":"-122.28131706"},{"lat":"37.45408782","lng":"-122.28428358"},{"lat":"37.45607437","lng":"-122.28728422"},{"lat":"37.45855399","lng":"-122.28964389"},{"lat":"37.46150337","lng":"-122.29066665"},{"lat":"37.46449927","lng":"-122.29080537"},{"lat":"37.46741706","lng":"-122.29164222"},{"lat":"37.47004943","lng":"-122.29347317"},{"lat":"37.4724045","lng":"-122.29584441"},{"lat":"37.47484795","lng":"-122.29807718"},{"lat":"37.47775391","lng":"-122.29919189"},{"lat":"37.48081016","lng":"-122.29901151"},{"lat":"37.48386847","lng":"-122.29850608"},{"lat":"37.4868127","lng":"-122.2981216"},{"lat":"37.48974125","lng":"-122.29883038"},{"lat":"37.49226793","lng":"-122.30073474"},{"lat":"37.49413538","lng":"-122.3036213"},{"lat":"37.4951695","lng":"-122.30711999"},{"lat":"37.49605031","lng":"-122.31058583"},{"lat":"37.49739544","lng":"-122.3138981"},{"lat":"37.49913263","lng":"-122.31702405"},{"lat":"37.50040366","lng":"-122.32036315"},{"lat":"37.50083658","lng":"-122.32388539"},{"lat":"37.50117039","lng":"-122.32749548"},{"lat":"37.50237035","lng":"-122.33083005"},{"lat":"37.50420426","lng":"-122.33381577"},{"lat":"37.50606869","lng":"-122.33688933"},{"lat":"37.50799594","lng":"-122.34003061"},{"lat":"37.50988405","lng":"-122.34301482"},{"lat":"37.51203087","lng":"-122.34564414"},{"lat":"37.51425798","lng":"-122.34819157"},{"lat":"37.51644813","lng":"-122.35068376"},{"lat":"37.51869146","lng":"-122.35307638"},{"lat":"37.52133683","lng":"-122.35490229"},{"lat":"37.52404792","lng":"-122.35651279"},{"lat":"37.52656144","lng":"-122.35869996"},{"lat":"37.52949012","lng":"-122.36013184"},{"lat":"37.53245962","lng":"-122.36139139"},{"lat":"37.53535502","lng":"-122.36269562"},{"lat":"37.53806531","lng":"-122.36427066"},{"lat":"37.54071957","lng":"-122.36586045"},{"lat":"37.54319399","lng":"-122.36775116"},{"lat":"37.54551481","lng":"-122.37012089"},{"lat":"37.54781925","lng":"-122.37250714"},{"lat":"37.55009393","lng":"-122.37486312"},{"lat":"37.55254949","lng":"-122.37717024"},{"lat":"37.55541199","lng":"-122.37918458"},{"lat":"37.55818716","lng":"-122.38106338"},{"lat":"37.56068828","lng":"-122.38341593"},{"lat":"37.56314841","lng":"-122.38588298"},{"lat":"37.56541169","lng":"-122.38835698"},{"lat":"37.56674169","lng":"-122.39169239"},{"lat":"37.5685417","lng":"-122.39470024"},{"lat":"37.57095669","lng":"-122.39698791"},{"lat":"37.57337626","lng":"-122.39928572"},{"lat":"37.57613294","lng":"-122.40094584"},{"lat":"37.57901078","lng":"-122.4022173"},{"lat":"37.58156135","lng":"-122.40405955"},{"lat":"37.58410689","lng":"-122.40616551"},{"lat":"37.58628103","lng":"-122.40888284"},{"lat":"37.58845823","lng":"-122.41162422"},{"lat":"37.59089234","lng":"-122.41402865"},{"lat":"37.5933155","lng":"-122.41641054"},{"lat":"37.59572459","lng":"-122.41875689"},{"lat":"37.59795493","lng":"-122.42134262"},{"lat":"37.60011457","lng":"-122.42399767"},{"lat":"37.60240224","lng":"-122.4265399"},{"lat":"37.60520008","lng":"-122.42789551"},{"lat":"37.60813618","lng":"-122.42777573"},{"lat":"37.61097345","lng":"-122.42659053"},{"lat":"37.61359414","lng":"-122.42477627"},{"lat":"37.61652164","lng":"-122.42409633"},{"lat":"37.61941491","lng":"-122.42515597"},{"lat":"37.62223282","lng":"-122.42696981"},{"lat":"37.62499411","lng":"-122.42876044"},{"lat":"37.62751237","lng":"-122.43105867"},{"lat":"37.62961128","lng":"-122.43380726"},{"lat":"37.63173002","lng":"-122.43652912"},{"lat":"37.63434333","lng":"-122.43855737"},{"lat":"37.63721702","lng":"-122.43994642"},{"lat":"37.63973671","lng":"-122.44194609"},{"lat":"37.64209642","lng":"-122.44410611"},{"lat":"37.6439212","lng":"-122.44706014"},{"lat":"37.64593185","lng":"-122.44975467"},{"lat":"37.64856629","lng":"-122.45139107"},{"lat":"37.65116761","lng":"-122.45299486"},{"lat":"37.65334007","lng":"-122.45534515"},{"lat":"37.65538199","lng":"-122.45796869"},{"lat":"37.65749297","lng":"-122.4606685"},{"lat":"37.6595944","lng":"-122.46334517"},{"lat":"37.66213336","lng":"-122.46529514"},{"lat":"37.66513186","lng":"-122.46553863"},{"lat":"37.6681835","lng":"-122.46560385"},{"lat":"37.67115958","lng":"-122.46650842"},{"lat":"37.6737871","lng":"-122.46830709"},{"lat":"37.67626076","lng":"-122.47032856"},{"lat":"37.67888283","lng":"-122.47161778"},{"lat":"37.681853","lng":"-122.47152482"},{"lat":"37.6847816","lng":"-122.47134126"},{"lat":"37.6876731","lng":"-122.47090381"},{"lat":"37.69061264","lng":"-122.47027005"},{"lat":"37.69348641","lng":"-122.47026259"},{"lat":"37.69632218","lng":"-122.47076182"},{"lat":"37.69914914","lng":"-122.47129566"},{"lat":"37.70201202","lng":"-122.47133229"},{"lat":"37.70486296","lng":"-122.47116624"},{"lat":"37.70741441","lng":"-122.4695213"},{"lat":"37.70957963","lng":"-122.46701645"},{"lat":"37.71043642","lng":"-122.46355472"},{"lat":"37.71046027","lng":"-122.45988294"},{"lat":"37.71069928","lng":"-122.45637822"},{"lat":"37.71224348","lng":"-122.45340591"},{"lat":"37.71448702","lng":"-122.45078271"},{"lat":"37.71693873","lng":"-122.44871305"},{"lat":"37.71990228","lng":"-122.44822204"},{"lat":"37.72291888","lng":"-122.44775048"},{"lat":"37.72576768","lng":"-122.44632572"},{"lat":"37.72805372","lng":"-122.44386563"},{"lat":"37.72953195","lng":"-122.44070582"},{"lat":"37.7307498","lng":"-122.43723772"},{"lat":"37.73174796","lng":"-122.43356938"},{"lat":"37.73216621","lng":"-122.42992443"},{"lat":"37.73150681","lng":"-122.42617839"},{"lat":"37.73152823","lng":"-122.42250586"},{"lat":"37.73190474","lng":"-122.4188029"},{"lat":"37.73208047","lng":"-122.4151556"},{"lat":"37.73335846","lng":"-122.41185347"},{"lat":"37.73467442","lng":"-122.40896246"},{"lat":"37.7367644","lng":"-122.40753804"},{"lat":"37.73918836","lng":"-122.40786326"},{"lat":"37.74134411","lng":"-122.40745439"},{"lat":"37.7433128","lng":"-122.40606023"},{"lat":"37.7454038","lng":"-122.40480714"},{"lat":"37.74791032","lng":"-122.40401446"},{"lat":"37.75036492","lng":"-122.40324249"},{"lat":"37.7530224","lng":"-122.40280453"},{"lat":"37.75548823","lng":"-122.40305884"},{"lat":"37.75750915","lng":"-122.40390315"},{"lat":"37.75912761","lng":"-122.40587398"},{"lat":"37.76147723","lng":"-122.40613148"}];
  }

  toRad(n) {
    return n * (Math.PI / 180);
  }
  toDeg(n) {
    return n * (180 / Math.PI);
  }

  getBearing(start, end){
    let startLat = this.toRad(start.latitude);
    let startLong = this.toRad(start.longitude);
    let endLat = this.toRad(end.latitude);
    let endLong = this.toRad(end.longitude);

    let dLong = endLong - startLong;

    let dPhi = Math.log(Math.tan(endLat/2.0+Math.PI/4.0)/Math.tan(startLat/2.0+Math.PI/4.0));
    if (Math.abs(dLong) > Math.PI){
      if (dLong > 0.0)
         dLong = -(2.0 * Math.PI - dLong);
      else
         dLong = (2.0 * Math.PI + dLong);
    }
    return (this.toDeg(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
  }

  computeOffsetCoordinate(coordinate, distance, heading) {
    distance = distance / (6371*1000);
    heading = this.toRad(heading);

    var lat1 = this.toRad(coordinate.latitude), lon1 = this.toRad(coordinate.longitude);
    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance) +
                        Math.cos(lat1) * Math.sin(distance) * Math.cos(heading));

    var lon2 = lon1 + Math.atan2(Math.sin(heading) * Math.sin(distance) *
                                Math.cos(lat1), 
                                Math.cos(distance) - Math.sin(lat1) *
                                Math.sin(lat2));

    if (isNaN(lat2) || isNaN(lon2)) return null;

    return {
      latitude: this.toDeg(lat2),
      longitude: this.toDeg(lon2)
    };
  }
}
module.exports = BGService;
