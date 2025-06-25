// src/axios.js
import axios from "axios";



const instance = axios.create({
    baseURL: "http://localhost:8000/api",
});

/*
const instance = axios.create({
    baseURL: "https://organizamais.com/api",
    
});
*/
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("api_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
