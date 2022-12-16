import React from 'react';

import {
				Row,
				Col
			} from 'react-bootstrap';

import RecordIndicator from './RecordIndicator.js';
import SceneList from './SceneList.js';

function OBSClient(props) {
	return (
		<React.Fragment>
			<Row>
			<Col>
				{props.name} - {props.state ? props.state.state : 'No state'}
			</Col>
			<Col>
				<RecordIndicator index={props.index}
													recording={props.state ? props.state.recording: false}
													onClicked={props.onRecordingClicked}/>
			</Col>
			<Col className='col-10'>
				<SceneList index={props.index}
									sceneList={props.state ? props.state.scenes : []}
									currentScene={props.state ? props.state.currentScene : ""}
									onClicked={props.onSceneClicked}/>
			</Col>
			</Row>
		</React.Fragment>
	);
}

export default OBSClient;
