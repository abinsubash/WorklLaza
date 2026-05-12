/* eslint-disable no-unused-vars */
import './Schedule.css'
import { useEffect, useState } from 'react'
import { Trash3, PenFill, Ban,ArrowRepeat } from 'react-bootstrap-icons'
import { toast } from 'sonner';
import API from '../../../api'

const Schedule = () => {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [tb, setTB] = useState(false);
  const [slots, setSlots] = useState([]);

  const view_slots = async ()=>{
    try {
      const res = await API.get('/worker/slot_view/')

      const sortedSlots = res?.data?.slots.sort((a, b) => {

        const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayComparison = daysOrder.indexOf(a.day_of_week) - daysOrder.indexOf(b.day_of_week);

        if (dayComparison === 0) {
          return a.start_time.localeCompare(b.start_time);
        }
        
        return dayComparison;
      });
  
      setSlots(sortedSlots);
    } catch (err) {
      if (err?.response?.data?.message){
        toast.error(err?.response?.data?.message)
      }
    }
  }

  const add_slot = async ()=>{
    if (!selectedDay || !fromTime || !toTime){
      toast.warning('Please select Week, From and To')
      return
    }
    try {
      const res = await API.post('/worker/slot_view/',{'week':selectedDay,'from':fromTime,'to':toTime})
      toast.success(res?.data?.message)
      setTB(!tb)
    } catch (err) {
      if (err?.response?.data?.message){
        toast.error(err?.response?.data?.message )
      }
    }
  }

  const change_slot_status = async (slot_id)=>{
    try {
      const res = await API.patch('/worker/slot_view/',{'id':slot_id})
      toast.success(res?.data?.message)
      setTB(!tb)
    } catch (err) {
      if (err?.response?.data?.message){
        toast.error(err?.response?.data?.message)
      }
    }
  }

  const delete_slot = async (slot_id)=>{
    try {
      const res = await API.put('/worker/slot_view/',{'id':slot_id})
      toast.success(res?.data?.message)
      setTB(!tb)
    } catch (err) {
      if (err?.response?.data?.message){
        toast.error(err?.response?.data?.message)
      }
    }
  }

  useEffect(()=>{
    view_slots();
  },[tb])


  return (
    <div className='page_class'>
      <span className='page_name'>Schedule</span>
      <div className="container-fluid">
        <div className="schedule-container row col-12">
          <div className="flex items-center space-x-4">
            <div className='week-inp'>
              <label className="text-sm font-medium">Week</label>
              <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className='decorated'>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            <div className='time-inp'>
              <label className="text-sm font-medium">From</label>
              <input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} placeholder="From" className="border p-2 rounded-md" min="05:00" max="22:00"/>
            </div>
            <span>➜</span>
            <div className='time-inp'>
              <label className="text-sm font-medium">To</label>
              <input type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} className="border p-2 rounded-md" />
            </div>
            <button className='add_slot' onClick={add_slot}>Add slot</button>
          </div>
        </div>

        <div className="table-container " >
          { slots?.length == 0 ?
            <h3 style={{padding:"5% 5%", color:'red'}}>Please add at least one slot</h3>
            :
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Day </th>
                  <th scope="col">From </th>
                  <th scope="col">To </th>
                  <th scope="col">Action </th>
                </tr>
              </thead>
              <tbody>
                {
                  slots?.map((slot) => (
                  <tr key={slot?.id}>
                    <td>{slot?.day_of_week}</td>
                    <td>{slot?.start_time}</td>
                    <td>{slot?.end_time}</td>
                    <td>
                      <Trash3 color='red' onClick={()=>delete_slot(slot.id)}/> &nbsp;&nbsp;&nbsp;{slot?.is_active ? <Ban color='red' onClick={()=>change_slot_status(slot.id)}/>: <ArrowRepeat color='green' onClick={()=>change_slot_status(slot.id)}/>}
                    </td>
                  </tr>
                  ))
                }
              </tbody>
            </table>
          }
          <br /> 
        </div>
      </div>
    </div>
  )
}

export default Schedule
