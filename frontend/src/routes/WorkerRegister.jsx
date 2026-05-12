import './WorkerRegister.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CloudUpload } from 'react-bootstrap-icons'
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import API from '../api';
import { logout } from '../authSlice';

const WorkerRegister = () => {

    const { role, username } = useSelector((state) => state.auth)

    const navigate = useNavigate();
    const [certificate, setCertificate] = useState(null);
    const [idProof, setIdProof] = useState(null);
    const [jobs, setJobs] = useState([]);
    const dispatch = useDispatch();
    const [workerData, setWorkerData] = useState({
        'username': username,
        'full_name': '',
        'age': null,
        'salary': null,
        'description': null,
        'qualification': null,
        'experience': null,
        'job': '',
        'previous_company': '',
        'id_prof': null,
        'certificate': null,
        'location': null,
    });



    useEffect(() => {
        console.log(role);

        switch (role) {
            case 'admin':
                navigate('/admin-panel');
                break;
            case 'worker':
                navigate('/worker');
                break;
            case 'user':
                navigate('/worker_register');
                break;
            default:
                navigate('/signin');
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setWorkerData((prevData) => ({
                        ...prevData,
                        location: { latitude, longitude },
                    }));
                },
                (err) => {
                    console.log(err)
                    toast.error("Location permission denied.");
                }
            );
        } else {
            toast.error("Geolocation is not supported by this browser.");
        }

        async function fetchData() {
            try {
                const j_res = await API.get('/worker/register/');
                setJobs(j_res?.data?.Jobs)
            } catch (error) {
                error?.response?.data?.message && toast.error(error?.response?.data?.message)
            }
        }
        fetchData();
    }, [role, navigate]);

    const handleCertificateChange = (event) => {
        const file = event.target.files[0];
        setCertificate(URL.createObjectURL(file));
        setWorkerData({ ...workerData, certificate: file })
    };

    const handleIdProofChange = (event) => {
        const file = event.target.files[0];
        setIdProof(URL.createObjectURL(file));
        setWorkerData({ ...workerData, id_prof: file })
    };

    const handleInputChange = (e) => {
        setWorkerData({ ...workerData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!workerData.job) {
            toast.error('Please select a job title');
            return;
        }
        if (!workerData.id_prof) {
            toast.error('ID Proof is required');
            return;
        }
        if (!workerData.location) {
            toast.error('Geolocation is required');
            return;
        }

        const formData = new FormData();
        formData.append('full_name', workerData.full_name);
        formData.append('age', workerData.age);
        formData.append('salary', workerData.salary);
        formData.append('description', workerData.description);
        formData.append('qualification', workerData.qualification);
        formData.append('experience', workerData.experience);
        formData.append('job', workerData.job);
        formData.append('previous_company', workerData.previous_company);
        formData.append('id_prof', workerData.id_prof);
        if (workerData.certificate) {
            formData.append('certificate', workerData.certificate);
        }
        formData.append('latitude', workerData.location.latitude);
        formData.append('longitude', workerData.location.longitude);

        try {
            const response = await API.post('/worker/register/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success(response.data.message)
            dispatch(logout())
            navigate('/')
        } catch (error) {
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            }
            if (error?.response?.data?.messages) {
                Object.entries(error.response.data.messages).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        toast.error(`${key}: ${value.join(', ')}`);
                    } else {
                        toast.error(`${key}: ${value}`);
                    }
                });
            } else if (error?.message) {
                toast.error(`Error: ${error.message}`);
            } else {
                toast.error('An error occurred during registration');
            }
        }

    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-lg-6 col-md-12 col-12 col-sm-12 cols-grid form-div">
                    <div className="sign_form">
                        <h2>Work Laza</h2>
                        <hr />
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="full_name" className="label">Full name</label>
                                <input type="text" className="form-input" id="full_name" required onChange={handleInputChange} />
                            </div>
                            <div className="half-input">
                                <div className="form-group">
                                    <label htmlFor="age" className="label">Age</label>
                                    <input type="number" className="form-input" id="age" required onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="salary" className="label">Price per hour</label>
                                    <input type="number" maxLength={4} className="form-input" id="salary" required onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="qualification" className="label">Educational qualification</label>
                                <input type="text" className="form-input" id="qualification" required onChange={handleInputChange} />
                            </div>
                            <div className="half-input">
                                <div className="form-group">
                                    <label htmlFor="experience" className="label">No years of experience</label>
                                    <input type="number" className="form-input" id="experience" required onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="previous_company" className="label">Previous company (if any)</label>
                                    <input type="text" className="form-input" id="previous_company" required onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="job" className="label">Job title</label>
                                <select name="" id="job" className="form-input job_select" onChange={handleInputChange} required>
                                    <option value="">-- Select a job --</option>
                                    {
                                        jobs?.map((job, index) => {
                                            return <option key={index} value={job.id} className='job_obtions'>{job.title}</option>
                                        })
                                    }
                                </select>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="col-lg-6 col-md-12 col-12 col-sm-12 cols-grid ">
                    <div className="sign_form">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group des">
                                <label htmlFor="description" className="label">Tell us about yourself</label>
                                <input type="text" className="inp_des form-input" id="description" required onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="certificate" className="label">Any certificates</label>
                                <div className="custom-file-input">
                                    {/* The file input is hidden, but the button triggers it */}
                                    <input type="file" id="certificate" accept="image/*" onChange={handleCertificateChange} style={{ display: 'none' }} />
                                    <button type="button" className="form-input" onClick={() => document.getElementById('certificate').click()} >
                                        {certificate ? (<img src={certificate} alt="Certificate Preview" style={{ width: '100px', height: 'auto' }} />) : <><CloudUpload />Upload Certificate</>}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="idProof" className="label">ID Proof</label>
                                <div className="custom-file-input">
                                    <input type="file" id="idProof" accept="image/*" onChange={handleIdProofChange} style={{ display: 'none' }} />
                                    <button type="button" className="form-input" onClick={() => document.getElementById('idProof').click()} >
                                        {idProof ? (<img src={idProof} alt="ID Proof Preview" style={{ width: '100px', height: 'auto' }} />) : <><CloudUpload />Upload Id Proof</>}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="form_submit_btn" onClick={handleSubmit}>Register</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerRegister;
