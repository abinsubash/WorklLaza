import { useEffect, useState, useContext, useRef } from 'react';
import './Home.css';
import { CardChecklist, BoxFill, PersonCheckFill, Wallet2, Calendar, Calendar2, Calendar3 } from 'react-bootstrap-icons';
import secureRequest from '../../../Compenets/ProtectedRoute/secureRequest';
import API from '../../../api';
import { toast } from 'sonner';
import { PageContext } from '../../Worker';
import Chart from 'chart.js/auto';

const Home = () => {

  const [worker, setWorker] = useState();
  const [bookingData, setBookingData] = useState();
  const setPage = useContext(PageContext);
  const [period, setPeriod] = useState('week');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const worker_view = async (selectedPeriod = 'week') => {
    try {
      await secureRequest(async () => {
        const res = await API.get(`/worker/details_view?period=${selectedPeriod}`)
        console.log(res?.data)
        setWorker({ ...res?.data?.worker, new_bookings: res?.data?.new_bookings, reviews_count: res?.data?.reviews_count, today_tasks_count: res?.data?.today_tasks_count })
        setBookingData({ booking_data: res?.data?.booking_data || [], period: res?.data?.period || 'week' });
      });
    } catch (err) {
      if (err?.response?.data?.message){
        toast.error(err?.response?.data?.message)
      }
    }
  }


  const createChart = () => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!chartRef.current || !bookingData.booking_data) return;

    const ctx = chartRef.current.getContext('2d');

    const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
    gradientFill.addColorStop(0, 'rgba(71, 135, 250, 0.5)');
    gradientFill.addColorStop(1, 'rgba(71, 135, 250, 0.1)');

    const labels = bookingData.booking_data.map(item => item.label);
    const data = bookingData.booking_data.map(item => item.count);

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Bookings',
          data: data,
          borderColor: '#4787FA',
          backgroundColor: gradientFill,
          tension: 0.4,
          borderWidth: 3,
          fill: true,
          pointBackgroundColor: '#4787FA',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 10,
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#4787FA',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              title: function (context) {
                return context[0].label;
              },
              label: function (context) {
                return `Bookings: ${context.raw}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(200, 200, 200, 0.1)',
              drawBorder: false,
            },
            ticks: {
              color: '#8A8A8A',
              font: {
                size: 11
              },
              padding: 10
            }
          },
          x: {
            grid: {
              display: false,
              drawBorder: false
            },
            ticks: {
              color: '#8A8A8A',
              font: {
                size: 11
              },
              padding: 10
            }
          }
        }
      }
    });
  }

  const changePeriod = (newPeriod) => {
    setPeriod(newPeriod);
    worker_view(newPeriod);
  }

  useEffect(() => {
    // Check if this is a redirect from successful payment
    const refreshFlag = sessionStorage.getItem('forceRefreshHome');
    
    if (refreshFlag) {
      // Remove the flag to prevent infinite refetches
      sessionStorage.removeItem('forceRefreshHome');
      
      // Always fetch fresh data when Home mounts
      worker_view();
    } else {
      // Normal mount - fetch data
      worker_view();
    }
  }, [])

  useEffect(() => {
    if (bookingData) {
      createChart();
    }
  }, [bookingData])

  return (
    <div className='main_worker_home'>
      <span>Home</span>
      <br />
      <br />
      <div className="top_row">
        <div className="new_task">
          <BoxFill />
          <span>New tasks</span>
          <h4 className="count" style={{ color: 'green' }}>{worker?.new_bookings}</h4>
        </div>
        <div className="new_task">
          <CardChecklist />
          <span>Tasks pending</span>
          <h4 className="count" style={{ color: 'yellow' }}>{worker?.today_tasks_count}</h4>
        </div>
        <div className="new_task">
          <PersonCheckFill />
          <span>reviews</span>
          <h4 className="count" style={{ color: 'blue' }}>{worker?.reviews_count}</h4>
        </div>
        <div className="new_task" onClick={() => { setPage('Payments'), localStorage.setItem('page', 'Payments') }}>
          <Wallet2 />
          <span>Platform fee</span>
          <h4 className="count" style={{ color: 'red' }}>{worker?.pending_fee}</h4>
        </div>
      </div>

      <div className="booking-graph-section">
        <div className="booking-graph-card">
          <div className="booking-graph-header">
            <h2>Booking Trends</h2>
            <div className="period-selector">
              <button className={`period-btn ${period === 'day' ? 'active' : ''}`} onClick={() => changePeriod('day')}>
                <Calendar size={16} /> &nbsp; Daily
              </button>
              <button className={`period-btn ${period === 'week' ? 'active' : ''}`} onClick={() => changePeriod('week')}>
                <Calendar2 size={16} /> &nbsp; Weekly
              </button>
              <button className={`period-btn ${period === 'month' ? 'active' : ''}`} onClick={() => changePeriod('month')}>
                <Calendar3 size={16} /> &nbsp; Monthly
              </button>
              <button className={`period-btn ${period === 'year' ? 'active' : ''}`} onClick={() => changePeriod('year')}>
                <Calendar3 size={16} /> &nbsp; Yearly
              </button>
            </div>
          </div>
          <div className="booking-graph-container">
            <canvas ref={chartRef} height="300"></canvas>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
