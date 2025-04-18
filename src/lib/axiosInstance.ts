import axios, { AxiosInstance } from 'axios';

const CALLBACK_URL = process.env.CALLBACK_URL;
const CALLBACK_TOKEN = process.env.COMPRESSION_TOKEN || 'supersecretrandomstring';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: CALLBACK_URL,
  params: {
    token: CALLBACK_TOKEN,
  },
});

export default axiosInstance;
