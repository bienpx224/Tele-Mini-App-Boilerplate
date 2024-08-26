// src/api.js
import axios from 'axios';

const base_domain = "https://dev.coin-master-game.sotatek.works/dev/api/coin-master";

// Create an instance of axios
const api = axios.create({
  baseURL: base_domain, // Replace with your API base URL
  timeout: 10000,
  headers: {'X-Custom-Header': 'foobar'}
});

// Function to cancel battle
export const cancelBattle = (token : string | null) => {
  try {
    api.post('/battle/cancel', 
      {
        
      }, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    ).then((res)=>{
      console.log("--- cancel battle response : " , res)
    }).catch((err)=>{
      console.log("--- cancel battle response Error: " , err)
    });
    
  } catch (error) {
    console.error("--- There was an error cancelling the battle!", error);
    throw error;
  }
};

// Example function to get data
export const getData = async () => {
  try {
    const response = await api.get('/auth/login'); // Replace with your endpoint
    return response.data;
  } catch (error) {
    console.error("--- There was an error fetching the data!", error);
    throw error;
  }
};

// Example function to post data
export const postLogin = async (data : any) => {
  try {
    console.log("- Call API Post Login ")
    const response = await api.post('/auth/login', data); // Replace with your endpoint
    console.log("--- API Post Login Response : ", response)
    return response.data;
  } catch (error : any) {
    console.error("--- There was an error posting the data!", error);
    return error.response;
  }
};


export const postUserClosedApp = (data : any) => {
  try {
    console.log("- Call API Notify Closed App ")
    const response = api.post('/auth/login', data); // Replace with your endpoint
    console.log("--- Response : ", response)
  } catch (error) {
    console.error("--- There was an error posting the data!", error);
  }
}

export default api;
