import React from 'react';

import {
        Row,
        Col,
        Button
      } from 'react-bootstrap';

import OBSClient from './OBSClient.js';

function Clients(props) {
  const clientList = props.clients.length ? props.clients.map((item, key) =>
          <OBSClient index={key}
                key={key}
                name={item.config.name}
                address={item.config.address}
                state={item.state}
                onSceneClicked={props.changeSceneClicked}
                onRecordingClicked={props.recordingClicked}
                />
    ) : (
      <Row>
        <Col>
          No clients
        </Col>
      </Row>
    )

	return (
      <React.Fragment>
        <Row>
          <Col>
            <Button onClick={props.connectClicked}>Connect</Button>
          </Col>
          <Col>
            <Button onClick={props.disconnectClicked}>Disconnect</Button>
          </Col>
        </Row>
    		{clientList}
      </React.Fragment>
	);
}

export default Clients;
