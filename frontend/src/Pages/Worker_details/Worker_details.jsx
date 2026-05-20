/* eslint-disable no-unused-vars */
import { useEffect, useState, useContext } from 'react';
import { useSelector } from "react-redux";
import './Worker_details.css';
import PropTypes from 'prop-types';
import API from '../../api';
import { toast } from 'sonner';
import user_icon from '../../assets/user.png';
import { X, CloudUpload, Star, StarFill, StarHalf } from 'react-bootstrap-icons'
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { LoadingContext } from '../../App';
import secureRequest from '../../Compenets/ProtectedRoute/secureRequest';


const Worker_details = ({ worker_id }) => {

    const [worker, setWorker] = useState();
    const [rating, setRating] = useState(0);
    const [reviews, setReviews] = useState();
    const [availabilities, setAvailabilities] = useState();
    const [formData, setFormData] = useState(null);
    const { isAuthenticated } = useSelector((state) => state.auth)
    const [showBooking, setShowBooking] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const setIsLoading = useContext(LoadingContext);

    const getcords = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                    },
                    (error) => {
                        toast.error("Error getting geolocation:", error);
                        resolve({ latitude: 0, longitude: 0 });
                    }
                );
            } else {
                toast.error("Geolocation is not supported by this browser.");
                reject(new Error("Geolocation not supported"));
            }
        });
    };

    const getAddressFromCoordinates = async (latitude, longitude) => {
        const apiKey = 'AIzaSyA0eNABot64Wdu0CjPDa-qKmVJVhV11UiI';
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === 'OK') {
                const address = data.results[0].formatted_address;
                return address
            } else {
                console.error('Geocoding failed:', data.status);
                return (null)
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            return (null)
        }
    };


    useEffect(() => {
        const fetch_data = async () => {
            setIsLoading(true)
            try {
                const l_res = await getcords();
                const a_res = await getAddressFromCoordinates(l_res.latitude, l_res.longitude);
                let res = null
                if (isAuthenticated) {
                    await secureRequest(async () => {
                        res = await API.get(`/user/workers_view/${worker_id}`)
                    });
                } else {
                    res = await API.get(`/user/workers_view/${worker_id}`)
                }
                const today = new Date();
                const currentDay = today.getDay();
        
                const day = String(today.getDate()).padStart(2, '0');
                const month = String(today.getMonth() + 1).padStart(2, '0'); 
                const year = today.getFullYear();
                
                const hours = String(today.getHours()).padStart(2, '0');
                const minutes = String(today.getMinutes()).padStart(2, '0');
                const seconds = String(today.getSeconds()).padStart(2, '0');
         
                const formattedDate = `${year}-${month}-${day}`;
                const formattedTime = `${hours}:${minutes}:${seconds}`;

                setWorker(res?.data?.worker)
                setAvailabilities(res?.data?.worker?.availabilities)
                setReviews(res?.data?.reviews)
                getRating(res?.data?.reviews)
                setFormData({ ...formData, worker:res?.data?.worker?.id ,latitude: l_res.latitude, longitude:l_res.longitude, address:a_res, bookedDate:formattedDate,bookedTime:formattedTime})
            } catch (err) {
                console.log(err?.response)
                err?.response?.data?.message && toast.error(err?.response?.data?.message)
            } finally {
                setIsLoading(false)
            }
        }
        fetch_data();
    }, [])

    const getWeekDays = () => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = new Date();

        today.setDate(today.getDate() + 1); 

        const currentDay = today.getDay();

        let weekDays = [];

        for (let i = 0; i < 7; i++) {
            const dayOffset = (currentDay + i) % 7;
            const day = new Date(today);
            day.setDate(today.getDate() + (i))
            // Format date as MM/DD/YYYY to match backend expectation
            const month = String(day.getMonth() + 1).padStart(2, '0');
            const date = String(day.getDate()).padStart(2, '0');
            const year = day.getFullYear();
            const formattedDate = `${month}/${date}/${year}`;
            weekDays.push({
                dayName: daysOfWeek[dayOffset],
                date: formattedDate,
            });
        }
        return weekDays;
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(URL.createObjectURL(file));
            setFormData({...formData,photo:file})
        }
    }

    const getSlotsForDay = () => {
        const day = formData?.selectedDay?.split(" ");
        return availabilities?.filter(slot => slot.day_of_week === day?.[0]);
    };

    const getDurationsForSlot = () => {
        const slot = availabilities?.filter(s=> s.id ==formData?.selectedSlot)?.[0]

        
        if (!slot) return []; 
        

        const startTimeString = `1970-01-01T${slot.start_time}Z`;  
        const endTimeString = `1970-01-01T${slot.end_time}Z`;

        const startTime = new Date(startTimeString);
        const endTime = new Date(endTimeString);

        
        const hoursDifference = (endTime - startTime) / (1000 * 60 * 60);
        let availableHours = [];
        for (let i = 1; i <= hoursDifference; i++) {
            availableHours.push(i);
        }    

        return availableHours;
    };


    const saveWorker = async (worker_id) => {
        if (!isAuthenticated) {
            toast.warning("Please login to save a profile")
            return
        }
        try {
            await secureRequest(async () => {
                const res = await API.post('/user/saved_workers_view/', { 'worker_id': worker_id })
                toast.success(res?.data?.message)
            });
        } catch (err) {
            console.log(err)
            err?.response?.data?.message && toast.error(err?.response?.data?.message)
        }
    }

    const handleConfirmBooking = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) {
            toast.warning("Please login to book a worker")
            return
        }
        setIsLoading(true)
        setShowBooking(false)
        try {

            const formDataToSend = new FormData();

            for (const key in formData) {
                formDataToSend.append(key, formData[key]);
            }
            await secureRequest(async () => {
                const res = await API.post('/user/bookings_view/',formDataToSend);
                toast.success(res?.data?.message);
            });
        } catch (err) {
            err?.response?.data?.error && toast.error(err?.response?.data?.error)
            err?.response?.data?.message && toast.error(err?.response?.data?.message)
        } finally {
            setIsLoading(false)
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0; 
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < fullStars; i++) {
          stars.push(<StarFill key={`full-${i}`} />);
        }
        if (hasHalfStar) {
          stars.push(<StarHalf key="half" />);
        }
        for (let i = 0; i < emptyStars; i++) {
          stars.push(<Star key={`empty-${i}`} />);
        }
      
        return stars;
    };

    const getRating = async (reviews) =>{
        const total_reviews = reviews?.length
        let total_rating = 0
        await reviews.map(review =>{ 
            total_rating += review?.rating
        })
        const avg_rating = total_rating / total_reviews 
        setRating(avg_rating)
    }
      
    return (
        <div className='main_worker_details'>
            <span className='page_name'>Workers/Worker details</span>
            <div className="container-fluid main_details">
                <div className="inner_div">
                    <div className="first_row">
                        <div className="left_side">
                            <img src={worker?.profile_pic ? `${worker?.profile_pic}` : user_icon} alt="" />
                        </div>
                        <div className="right_side">
                            <br />
                            <h2>{worker?.full_name}</h2>
                            <br />
                            <div>
                                <span className="feild">{worker?.job_title}</span>
                                <br />
                                <span className="feild">{worker?.experience} + yers of expeexperience</span><br />
                                <span className="feild">Education : {worker?.qualification} </span><br />
                                <span className="feild">Age : {worker?.age}  </span><br />
                                <span className="feild">Rating : {rating}  </span>
                            </div>
                            <br />
                            <h4>₹ {worker?.salary} / hour</h4>
                            <br />
                            <div className="buttons">
                                <button onClick={() => saveWorker(worker?.id)}>Save profile</button>
                                <button onClick={() => setShowBooking(true)}>Book now</button>
                            </div>
                            <br /><br />
                        </div>
                    </div>
                    <div className="second_row">
                        <p>{worker?.description}</p>
                    </div>
                    <br />
                </div>
                <div className="revew_div col-lg-12 row">
                    <div className="stars">{renderStars(rating)}</div>
                    {
                        reviews?.map(review => {
                            return(
                            <div className="review col-12 col-md-6 col-lg-4" key={review?.id}>
                                <div className="stars">{renderStars(review?.rating)}</div>
                                <div className="details">
                                    <div className="top">
                                        <h3>{review?.title}</h3>
                                        <img src={`${review?.user_profile?.profile_picture}`} alt={review?.user_profile?.username} />
                                    </div>
                                    <br />
                                    <p>{`"${review?.description}"`}</p>
                                </div>
                            </div>
                        )})
                    }
                    
                </div>
            </div>
            <Modal show={showBooking} onHide={() => setShowBooking(false)} centered style={{color:'var(--title-color)'}}>
                <Modal.Header style={{ backgroundColor: 'var(--secondary-color)' }}>
                    <Modal.Title style={{ color: 'var(--title-color)' }}>Book a worker</Modal.Title>
                    <X color='red' onClick={() => setShowBooking(false)} style={{ fontSize: '40px' }} cursor={'pointer'} />
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: 'var(--secondary-color)' }}>
                    <Form >
                        <Form.Group controlId="formFileUpload">
                            <Form.Label>Upload a Photo</Form.Label>
                            <InputGroup>
                                <Form.Control type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} id="file-upload-input" />

                                {
                                    selectedFile ? (<img src={selectedFile} alt="Selected" style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px' }} onClick={() => document.getElementById("file-upload-input").click()} />) :
                                        <Button  variant="outline-secondary" onClick={() => document.getElementById("file-upload-input").click()} style={{width:'100%',height:'100px'}}>
                                            <CloudUpload /><br /> Upload Photo of the part
                                        </Button>
                                }
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="formDaySelection" >
                            <Form.Label>Choose a Day</Form.Label>
                            <Form.Control style={{ backgroundColor: 'var(--secondary-color)' }} as="select" value={formData?.selectedDay} onChange={(e) => setFormData({ ...formData, selectedDay: e.target.value })} >
                                <option value="">Select Day</option>
                                {getWeekDays()?.map((day, index) => (<option key={index} value={`${day.dayName} ${day.date}`}> {day.dayName} ({day.date}) </option>))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formSlotSelection">
                            <Form.Label>Choose a Time Slot</Form.Label>
                            <Form.Control style={{ backgroundColor: 'var(--secondary-color)' }} as="select" value={formData?.selectedSlot} onChange={(e) => setFormData({ ...formData, selectedSlot: e.target.value })} >
                                <option value="">Select Slot</option>
                                {getSlotsForDay()?.map((slot, index) => (<option key={index} value={slot.id}>{slot.start_time} - {slot.end_time} </option>))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formSlotSelection">
                            <Form.Label>Give the duration in hours</Form.Label>
                            <Form.Control style={{ backgroundColor: 'var(--secondary-color)' }} as="select" value={formData?.duration} onChange={(e) =>{ setFormData({ ...formData, duration: e.target.value,total:e.target.value*worker?.salary }), console.log(e.target.value*worker?.salary)}} >
                                <option value="">Select Slot</option>
                                {getDurationsForSlot()?.map((duration, index) => (<option key={index} value={duration}>{`${duration} (hours)`}</option>))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formPreviousIssues">
                            <Form.Label>Work</Form.Label>
                            <Form.Control style={{ backgroundColor: 'var(--secondary-color)' }} type="text" value={formData?.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="What kind of work you need   ?" />
                        </Form.Group>
                        <Form.Group controlId="formPreviousIssues">
                            <Form.Label>Any Previous Issues</Form.Label>
                            <Form.Control style={{ backgroundColor: 'var(--secondary-color)' }} type="text" value={formData?.previousIssues} onChange={(e) => setFormData({ ...formData, previousIssues: e.target.value })} placeholder="Enter any previous issues" />
                        </Form.Group>
                        <Form.Group controlId="formDamagedParts">
                            <Form.Label>Damaged Parts (if any)</Form.Label>
                            <Form.Control style={{ backgroundColor: 'var(--secondary-color)' }} type="text" value={formData?.damagedParts} onChange={(e) => setFormData({ ...formData, damagedParts: e.target.value })} placeholder="Enter any damaged parts" />
                        </Form.Group>

                        <Form.Group controlId="formDescribeIssue">
                            <Form.Label>Describe the Issue</Form.Label>
                            <Form.Control style={{ backgroundColor: 'var(--secondary-color)' }} as="textarea" rows={3} value={formData?.issueDescription} onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })} placeholder="Describe the issue in detail" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: 'var(--secondary-color)' }}>
                    <Button variant="secondary" onClick={() => setShowBooking(false)} > Cancel </Button>
                    <Button variant="success" onClick={handleConfirmBooking} style={{background:'none', border:'3px solid var(--icon-color)', borderRadius:'8px'}}>Confirm Booking</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Worker_details



Worker_details.propTypes = {
    worker_id: PropTypes.string.isRequired,
};
