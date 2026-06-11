import { getConfig } from '../config';

export default class NetworkService {
  constructor() {
    this.config = getConfig();
  }

  /**
   * @param {string} endpoint
   */
  async fetchData(endpoint) { 
    try {       
        // Clean up any double-slash issues dynamically
        const baseUrl = this.config.apiBaseUrl.replace(/\/$/, '');
        const cleanEndpoint = endpoint.replace(/^\//, '');
        
        const response = await fetch(`${baseUrl}/${cleanEndpoint}`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }       
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
  }
}