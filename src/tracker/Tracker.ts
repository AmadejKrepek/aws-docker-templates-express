import axios from "axios";

const baseUrl =
  "http://tracker.cxaab2cghvb0fbbc.germanywestcentral.azurecontainer.io:8000";

export async function addTracker(data: any) {
  try {
    return axios.post(`${baseUrl}/tracker`, data).then((response) => {
      return response.data;
    });
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  } finally {
    console.log('Finished')
  }
}
