/* eslint-disable no-unused-vars */
import './Bookings.css'
import { useEffect, useState, useContext } from 'react'
import { CheckCircle, Ban, X, GeoAltFill, ChatLeftDots } from 'react-bootstrap-icons'
import { toast } from 'sonner';
import API from '../../../api'
import { Modal, Button, Form } from 'react-bootstrap';
import { PageContext } from '../../Worker';

const Bookings = () => {

  const [tb, setTB] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [status, setSatus] = useState("");
  const setPage = useContext(PageContext);


  const view_bookings = async () => {
    try {
      const res = await API.get('/worker/bookings_view/')
      setBookings(res?.data?.Bookings);
    } catch (err) {
       err?.response?.data?.message && toast.error(err?.response?.data?.message)
    }
  }

  const change_booking_status = async (status_f, booking_id) => {
    if (status_f === null) {
      status_f = status
    }
    try {
      const res = await API.patch(`/worker/bookings_view/${booking_id}`, { status: status_f })
      toast.success(res?.data?.message)
      handleClose()
      setTB(!tb)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong")
    }
  }

  const openBooking = async (booking, index) => {
    setCurrentBooking({ ...booking, 'index': index });
    setSatus(booking?.status)
    setShowModal(true);
  }

  useEffect(() => {
    view_bookings();
  }, [tb])

  const handleClose = () => {
    setShowModal(false)
  };

  const handleChatOpen = (userId) => {
    setPage(`Chats`); 
    localStorage.setItem('page', `Chats`);
    localStorage.setItem("chatReceiverId", userId); 
  };


  return (
    <div className='page_class'>
      <span className='page_name'>Bookings</span>
      <br />
      <div className="container-fluid">
        <div className="table-container " >
          {bookings?.length == 0 ?
            <h3 style={{ padding: "5% 5%", color: 'red' }}>{`You don't have at least one booking`}</h3>
            :
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Username</th>
                  <th scope="col">Booked To</th>
                  <th scope="col">Slot</th>
                  <th scope="col">Address</th>
                  <th scope="col" style={{ textAlign: 'center' }}>Action/Status</th>
                  <th scope="col">Chat</th>
                </tr>
              </thead>
              <tbody>
                {
                  bookings?.map((booking, index) => {
                    return (
                      <tr key={index}>
                        <td onClick={() => openBooking(booking, index)} >{booking?.user_profile?.username}</td>
                        <td onClick={() => openBooking(booking, index)} >{booking?.booked_date}{` (${booking?.slot_details?.day_of_week})`}</td>
                        <td onClick={() => openBooking(booking, index)} >{booking?.slot_details?.start_time} - {booking?.slot_details?.end_time}{` (${booking?.duration}hours)`}</td>
                        <td onClick={() => openBooking(booking, index)} >{booking?.address}</td>
                        <td style={{ textAlign: 'center' }}>
                          {
                            booking?.status == 'created' ? (
                              <>
                                <CheckCircle color='green' onClick={() => { change_booking_status('accepted', booking?.id) }} /> &nbsp;&nbsp;&nbsp;&nbsp;
                                <Ban color='red' onClick={() => { change_booking_status('rejected', booking?.id) }} />
                              </>
                            ) : booking?.status
                          }
                        </td>
                        {
                          booking?.status !== "rejected" && booking?.status !== "created" && booking?.status !== "canceled" && <td><ChatLeftDots onClick={()=>handleChatOpen(booking?.user_profile?.user_id)}/></td>
                        }

                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          }
          <br />
        </div>
      </div>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header >
          <Modal.Title>Inspect Booking</Modal.Title>
          <X style={{ fontSize: '40px', cursor: 'pointer' }} onClick={handleClose} />
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Form.Group controlId="formUsername" style={{ width: '47%' }}>
                <Form.Label>User</Form.Label>
                <Form.Control type="text" value={currentBooking?.user_profile?.username} disabled={true} required />
              </Form.Group>
              <Form.Group controlId="formUsername" style={{ width: '47%' }}>
                <Form.Label>Booked to</Form.Label>
                <Form.Control type="text" value={`${currentBooking?.booked_date} (${currentBooking?.slot_details?.day_of_week})`} disabled={true} required />
              </Form.Group>
            </Form.Group>
            <Form.Group style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Form.Group controlId="formUsername" style={{ width: '47%' }}>
                <Form.Label>Any previous issues</Form.Label>
                <Form.Control type="text" value={currentBooking?.any_previous_issues} disabled={true} required />
              </Form.Group>
              <Form.Group controlId="formUsername" style={{ width: '47%' }}>
                <Form.Label>Damaged parts</Form.Label>
                <Form.Control type="text" value={currentBooking?.damaged_parts} disabled={true} required />
              </Form.Group>
            </Form.Group>
            <Form.Group style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Form.Group controlId="formUsername" style={{ width: '30%' }}>
                <Form.Label>Total</Form.Label>
                <Form.Control type="text" value={`₹ ${currentBooking?.total}`} disabled={true} required />
              </Form.Group>
              <Form.Group controlId="formUsername" style={{ width: '45%' }}>
                <Form.Label>Slot</Form.Label>
                <Form.Control type="text" value={`${currentBooking?.slot_details?.start_time} - ${currentBooking?.slot_details?.end_time}`} disabled={true} required />
              </Form.Group>
              <Form.Group controlId="formUsername" style={{ width: '20%' }}>
                <Form.Label>Duration</Form.Label>
                <Form.Control type="text" value={currentBooking?.duration} disabled={true} required />
              </Form.Group>
            </Form.Group>
            {
              currentBooking?.status !== "rejected" && currentBooking?.status !== "created" && currentBooking?.status !== "canceled" &&
              <Form.Group controlId="formdeS" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Form.Group controlId="formUsername" style={{ width: '69%' }}>
                  <Form.Label>Address</Form.Label >
                  <Form.Control as="textarea" value={currentBooking?.address} rows={4} disabled={true} required style={{ height: '40px' }} />
                </Form.Group>
                <a className='gmap_dir' href={`https://www.google.com/maps/dir/?api=1&origin=${currentBooking?.worker_profile?.latitude},${currentBooking?.worker_profile?.longitude}&destination=${currentBooking?.latitude},${currentBooking?.longitude}`} target="_blank"><GeoAltFill /> Get Directions</a>
              </Form.Group>
            }
            <Form.Group style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Form.Group controlId="formdeS" style={{ width: '49%' }}>
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" value={currentBooking?.details} rows={4} disabled={true} required style={{ height: '150px' }} />
              </Form.Group>
              {
                currentBooking?.photo && (
                  <Form.Group controlId="formdeS" style={{ width: '49%' }}>
                    <Form.Label>Photo</Form.Label>
                    <img src={`${currentBooking?.photo}`} alt="" style={{ width: '100%' }} />
                  </Form.Group>
                )
              }
            </Form.Group>

            <Form.Group controlId="formUsername" style={{ width: '100%' }}>
              <Form.Label>Status</Form.Label>
              <Form.Control as="select" value={status} onChange={(e) => setSatus(e.target.value)} >
                {
                  currentBooking?.status === 'accepted' &&
                  <>
                    <option value={"accepted"}>Accepted</option>
                    <option value={"pending"} >Pending</option>
                    <option value={"visited"}>Visited</option>
                    <option value={"completed"}>Completed</option>
                  </>
                  || currentBooking?.status === 'visited' &&
                  <>
                    <option value={"visited"} >Visited</option>
                    <option value={"pending"} >Pending</option>
                    <option value={"completed"}  >Completed</option>
                  </>
                  || currentBooking?.status === 'pending' &&
                  <>
                    <option value={"pending"} >Pending</option>
                    <option value={"completed"}  >Completed</option>
                  </>
                  || currentBooking?.status === 'created' && <option value={"created"} selected={true}>Created</option>
                  || currentBooking?.status === 'rejected' && <option value={"rejected"} selected={true}>Rejected</option>
                  || currentBooking?.status === 'completed' && <option value={"completed"} selected={true}>Completed</option>
                }
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="success" onClick={() => { change_booking_status(null, currentBooking?.id) }}>Save</Button>
        </Modal.Footer>
      </Modal>

    </div>
  )
}

export default Bookings
