import React from 'react';

import { Button } from 'react-bootstrap';

function RecordIndicator(props) {
	return (
		<React.Fragment>
			<Button className={props.recording ? "btn-danger" : "btn-primary"}
							onClick = {e => props.onClicked(props.index, !props.recording)}>
								Rec
			</Button>
		</React.Fragment>
	);
}

export default RecordIndicator;
