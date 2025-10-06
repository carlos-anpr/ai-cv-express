import axios from 'axios';

const API_KEY = import.meta.env.VITE_STRAPI_API_KEY;

const axiosClient = axios.create({
  baseURL: 'http://localhost:1337/api/',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
});

const CreateNewResume = (data) => axiosClient.post('/user-resumes', data);

const GetUserResumes = (userEmail) =>
  axiosClient.get('/user-resumes?filters[userEmail][$eq]=' + userEmail);

const UpdateResumeDetail = (id, data) =>
  axiosClient.put('/user-resumes/' + id, data);

const GetResumeById = (id) =>
  axiosClient.get('/user-resumes/' + id + '?populate=*');

const DeleteResumeById = (id) => axiosClient.delete('/user-resumes/' + id);

// Operaciones de página web del CV
const SaveWebPageConfig = (resumeId, data) =>
  axiosClient.put(`/user-resumes/${resumeId}`, { webPageConfig: data });

const GetWebPageConfig = (resumeId) =>
  axiosClient.get(`/user-resumes/${resumeId}?populate=webPageConfig`);

export default {
  CreateNewResume,
  GetUserResumes,
  UpdateResumeDetail,
  GetResumeById,
  DeleteResumeById,
  SaveWebPageConfig,
  GetWebPageConfig,
};
