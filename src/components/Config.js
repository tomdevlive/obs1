import React, { useState } from 'react';

import OBSConfig from './OBSConfig.js';

import {
          Form,
          Row,
          Col,
          Button
      	} from 'react-bootstrap';

function Config(props) {
	const [config, setConfig] = useState(props.config);
	const [configFile, setConfigFile] = useState(null);

	function importFileChanged(e) {
		setConfigFile(e.target.files[0]);
	}

	function importConfigClicked() {
		if (configFile) {
			configFile.text().then(t => setConfig(JSON.parse(t)))
		} else {
			alert("Select config file to import");
		}
	}

	function downloadFile(filename, text) {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}

	function exportConfigClicked() {
		downloadFile("obssync-config.json", JSON.stringify(config, null, 2));
	}

	function configChanged(key, name, value) {
		if (name && value) {
			let newConfig = [...config];
			if (newConfig.length === 0) {
				newConfig.push({
												key: key,
												name: key,
												config: {
																	key: key,
					                        name: '',
					                        address: '',
					                        port: 4444,
					                        password: ''
												},
	                      state: {
	                        state: 'Unknown',
	                        scenes: [],
	                        currentScene: "Unknown",
	                        recording: false
	                      }
											});
			}

			if (value!==newConfig[key].config[name]) {
				newConfig[key].config[name] = value;
				setConfig(newConfig);
			}
		}
	}

	function configDeleted(deleteKey) {
		let newConfig = config.filter((item, key) => {
			return item.config.key !== deleteKey;
		});

		setConfig(newConfig);
	}

	function addItem() {
		let newConfig = [...config];
		newConfig.push(
                    {
                      config: {
                        key: newConfig.length,
                        name: '',
                        address: '',
                        port: 4444,
                        password: ''
                      },
                      state: {
                        state: 'Unknown',
                        scenes: [],
                        currentScene: "Unknown",
                        recording: false
                      }
                    }
                   );
		setConfig(newConfig);
	}

  const configList = config.length ? config.map((item, key) =>
        <OBSConfig index={key}
              key={key}
              name={key}
              config={item.config}
              onChanged={configChanged}
              onDeleted={configDeleted}
              />
  ) : (
        <OBSConfig index='0'
              key='0'
              name='0'
              config= {{
                        key: 0,
                        name: '',
                        address: '',
                        port: 4444,
                        password: ''
                      }}
              onChanged={configChanged}
              onDeleted={configDeleted}
              />
  )

	return (
	  <React.Fragment>
			<Form>
				{configList}
				<Row>
					<Col>
						<Form.File onChange={e => importFileChanged(e)} />
					</Col>
					<Col>
						<Button onClick={importConfigClicked}>Import Config</Button>
					</Col>
					<Col>
						<Button onClick={exportConfigClicked}>Export Config</Button>
					</Col>
					<Col>
						<Button onClick={addItem}>Add Client</Button>
					</Col>
					<Col>
						<Button onClick={e => props.configChanged(config)}>Apply Config</Button>
					</Col>
				</Row>
			</Form>
		</React.Fragment>
	);
}

export default Config;
