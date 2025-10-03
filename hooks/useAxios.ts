import axios from "axios";

const useAxios = () => {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const axiosSecure = axios.create({
        baseURL: `${baseURL}/api`,
    });
    return axiosSecure;
};

export default useAxios;