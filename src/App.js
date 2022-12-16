import './App.css';

import React, { useState, useEffect, useCallback, useRef } from 'react';

import {
          Navbar,
          Nav,
          Container,
          Row,
          Col,
        } from 'react-bootstrap';

import {
          BrowserRouter as Router,
          Switch,
          Route
        } from "react-router-dom";

import {LinkContainer} from 'react-router-bootstrap'

import Clients from './components/Clients.js';
import Config from './components/Config.js';

import OBSWebSocket from 'obs-websocket-js'

import useCookie from "./hooks/useCookie.js";

let OBS = [];

function App(props) {
  const [ cookieConfig, setCookieConfig ] = useCookie("obssync-config", JSON.stringify([]));

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = JSON.stringify(value);
    });
    return ref.current;
  }

  const [clients, setClients] = useState(JSON.parse(cookieConfig));

/*
  const [clients, setClients] = useState(
                                          [
                                            {
                                              config: {
                                                key: 0,
                                                name: 'Andy',
                                                address: 'andy-pc-new.gently.org.uk',
                                                port: 4444,
                                                password: 'topsecret'
                                              },
                                              state: {
                                                state: 'Unknown',
                                                scenes: [],
                                                currentScene: "Unknown",
                                                recording: false
                                              }
                                            },
                                            {
                                              config: {
                                                key: 1,
                                                name: 'John',
                                                address: '192.168.202.67',
                                                port: 4444,
                                                password: 'topsecret'
                                              },
                                              state: {
                                                state: 'Unknown',
                                                scenes: [],
                                                currentScene: "Unknown",
                                                recording: false
                                              }
                                            }
                                          ]
                                        );
*/

  const previousClients = usePrevious(clients);
  //const [previousClients, setPreviousClients] = useState(JSON.stringify([]));

  const updateStatusCallback = useCallback((key, status) => {
    const newClients = [...clients];
    newClients[key].state.state = status;
    setClients(newClients);
  }, [clients]);

  const updateScenesCallback = useCallback((key, scenes, currentScene) => {
    const newClients = [...clients];
    newClients[key].state.scenes = scenes.map((thisItem, thisKey)  => {
       return thisItem.name;
    });
    newClients[key].state.currentScene = currentScene;
    setClients(newClients);
  }, [clients]);

  const updateCurrentSceneCallback = useCallback((key, currentScene) => {
    const newClients = [...clients];
    newClients[key].state.currentScene = currentScene;
    setClients(newClients);
  }, [clients]);

  const updateRecordingCallback = useCallback((key, recording) => {
    const newClients = [...clients];
    newClients[key].state.recording = recording;
    setClients(newClients);
  }, [clients]);

  const connectCallback = useCallback(
    async (key, info) => {
    try {
      updateStatusCallback(key, 'Connecting');
      await OBS[key].connect({ address: info.address+':'+info.port, password: info.password });
    } catch (e) {
      console.log(e);
      updateStatusCallback(key, 'Connect error: \'' + e.error + ' - ' + e.status + '\'');
    }
  }, [updateStatusCallback]);

  const obsDisconnectCallback = useCallback(() => {
    function doOBSDisconnect() {
      OBS.forEach((item, key) => {
        OBS[key].removeAllListeners();
        OBS[key].disconnect();
        OBS[key]=null;
      });

      OBS=[];

      clients.forEach((item, key) => {
        updateScenesCallback(key, [], "");
        updateStatusCallback(key, "Disconnected");
        updateRecordingCallback(key, false);
      });
    }

    doOBSDisconnect();
  }, [updateScenesCallback, updateStatusCallback, updateRecordingCallback, clients]);

  async function sendCommand(key, command, params) {
   try {
      return await OBS[key].send(command, params || {});
    } catch (e) {
      console.log('Error sending command', command, ' - error is:', e);
      return {};
    }
  }

  useEffect(() => {
    function isArray(value) {
      return Array.isArray(value);
    }

    let changed = false;
    let prevClientsParsed = []

    if (previousClients) {
      prevClientsParsed = JSON.parse(previousClients);
    }

     if (isArray(clients) !== isArray(prevClientsParsed)) {
      changed = true;
    } else if (isArray(clients) && isArray(prevClientsParsed)) {
      if (clients.length !== prevClientsParsed.length) {
        changed = true;
      } else {
        clients.forEach((item, key) => {
          if (JSON.stringify(item.config) !== JSON.stringify(prevClientsParsed[key].config)) {
            changed = true;
          }
        });
      }
    }

    if (changed) {
      obsDisconnectCallback();
    }
  }, [
        clients,
        connectCallback,
        previousClients,
        updateStatusCallback,
        updateCurrentSceneCallback,
        updateScenesCallback,
        updateRecordingCallback,
        obsDisconnectCallback
    ]
  );

  function doOBSConnect() {
    console.log("Cookie: '" + cookieConfig + "'");

    clients.forEach((item, key) => {
      OBS.push(new OBSWebSocket());
      OBS[key].on('error', err => {
          console.error('socket error:', err);
      });

      OBS[key].on('ConnectionClosed', () => {
        updateStatusCallback(key, 'Connection closed');
        updateScenesCallback(key, [], '');
      });

      OBS[key].on('AuthenticationSuccess', async () => {
        updateStatusCallback(key, 'Auth successful');
        let scenes = await sendCommand(key, "GetSceneList");
        updateScenesCallback(key, scenes.scenes, scenes.currentScene);
      });

      OBS[key].on('AuthenticationFailure', async () => {
        updateStatusCallback(key, 'Auth failure');
      });

      OBS[key].on('SwitchScenes', (data) => {
        updateCurrentSceneCallback(key, data.sceneName);
        clients.forEach( async (clientInfo, clientKey) => {
          if (clientKey !== key && clientInfo.state.currentScene !== data.sceneName) {
            await sendCommand(clientKey, "SetCurrentScene", {'scene-name': data.sceneName});
          }
        });
      });

      OBS[key].on('ScenesChanged', async() => {
        let scenes = await sendCommand(key, "GetSceneList");
        updateScenesCallback(key, scenes.scenes, scenes.currentScene);
      });

      OBS[key].on('RecordingStarted', (data) => {
        updateRecordingCallback(key, true);
      });

      OBS[key].on('RecordingStopped', (data) => {
        updateRecordingCallback(key, false);
      });

      async function doConnect(key, item) {
        await connectCallback(key, item);
      }

      doConnect(key, item.config);
    });
  }

  async function changeSceneClicked(key, scene) {
    await sendCommand(key, "SetCurrentScene", {'scene-name': scene});
  }

  async function recordingClicked(key, record) {
    await sendCommand(key, record ? "StartRecording" : "StopRecording");
  }

  async function connectClicked(key, record) {
    doOBSConnect();
  }

  async function disconnectClicked(key, record) {
    obsDisconnectCallback();
  }

  async function configChanged(newConfig) {
    setClients(newConfig);
    setCookieConfig(JSON.stringify(newConfig));
  }

  return (
    <div className="App">
      <Router>
        <Navbar>
            <Navbar.Brand>OBS Scene Sync</Navbar.Brand>
            <LinkContainer to="/">
              <Nav.Link>Clients</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/config">
            <Nav.Link>Config</Nav.Link>
            </LinkContainer>
        </Navbar>
        <Container fluid>
          <Row>
            <Col>
              <Switch>
                <Route exact path="/config" render={(props) => (
                    <Config {...props}
                            config={clients}
                            configChanged={configChanged}/>
                    )} />

                    )}
                />
                <Route path="/" render={(props) => (
                    <Clients {...props}
                            clients={clients}
                            changeSceneClicked={changeSceneClicked}
                            recordingClicked={recordingClicked}
                            connectClicked={connectClicked}
                            disconnectClicked={disconnectClicked}/>
                    )}
                  />
              </Switch>
            </Col>
          </Row>
        </Container>
      </Router>
    </div>
  );
}

export default App;
