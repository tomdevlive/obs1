import React from 'react';

import {
          Row,
          Col,
          Form,
          Button
       } from 'react-bootstrap';

function OBSConfig(props) {
	function handleChange(event) {
		props.onChanged(props.config.key, event.target.id, event.target.value);
	}

	return (
		<Row>
			<Col>
				<Form.Group controlId="name">
					<Form.Label>Name</Form.Label>
					<Form.Control placeholder="Client name" value={props.config.name} onChange={handleChange}/>
				</Form.Group>
			</Col>
			<Col>
				<Form.Group controlId="address">
					<Form.Label>Address</Form.Label>
					<Form.Control placeholder="IP / Hostname" value={props.config.address} onChange={handleChange}/>
				</Form.Group>
			</Col>
			<Col>
				<Form.Group controlId="port">
					<Form.Label>Port</Form.Label>
					<Form.Control placeholder="Port" value={props.config.port} onChange={handleChange}/>
				</Form.Group>
			</Col>
			<Col>
				<Form.Group controlId="password">
					<Form.Label>password</Form.Label>
					<Form.Control type="password" placeholder="Password" value={props.config.password} onChange={handleChange}/>
				</Form.Group>
			</Col>
			<Col>
				<Button onClick={e => props.onDeleted(props.config.key)}>Delete Client</Button>
			</Col>
		</Row>
	);
}

export default OBSConfig;
