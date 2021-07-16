import axios from 'axios';
import APIConfig from './APIConfig';
import PQueue from 'p-queue';

export default class Connector {
	private apiConfig: APIConfig;
	private queue = new PQueue({concurrency: 1});

	public isSaving = false;
	
	constructor(apiConfig: APIConfig) {
		this.apiConfig = apiConfig;
		this.finishSaving = this.finishSaving.bind(this);
	}
  
	finishSaving() : void {
		this.isSaving = false;
	}
  
  // eslint-disable-next-line
  async loadStudents() {
    const res = await axios.get(this.apiConfig.loadStudentsURL);
    return res.data;
  }
  
  // eslint-disable-next-line
  async loadStatusDefaults() {
    const res = await axios.get(this.apiConfig.loadStatusDefaultsURL);
    return res.data;
  }

  // eslint-disable-next-line
  async loadPresences() {
    const res = await axios.get(this.apiConfig.loadPresencesURL);
    return res.data;
  }
}