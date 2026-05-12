import './Banner.css';
import profetionals from '../../assets/profetionsls.png'
import right_top_arrow from '../../assets/right-top-arrow.png'
import { useContext } from 'react';
import { PageContext } from '../../Layout/Layout';

const Banner = ({ siteData = {servicesDelivered:50,registeredCustomers:50,verifiedWorkers:50} } = {}) => {

    const setPage = useContext(PageContext);
    
    

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 col-md-12 col-lg-7 left-b">
                    <span className='tagline'>{`"Where Works Meet Solution !"`}</span>
                    <br />
                    <h1 className='banner-heading'>Redefining Service <br />Connections with WorkLaza</h1>
                    <p>
                        Welcome to the Hub of Service Excellence. WorkLaza is your gateway to a world where skilled hands 
                        meet real-world needs, creating seamless solutions for everyday challenges. Step into a platform 
                        that redefines how services are delivered, connecting you with trusted professionals who bring 
                        expertise and efficiency to every task. Join us on this journey to revolutionize the way work gets 
                        done.
                    </p>
                    <div className="row left_b_under">
                        <div className="left-b-spetial">
                            <h4>{siteData?.servicesDelivered}<span>+</span></h4>
                            <span>Services Delivered</span>
                        </div>
                        <div className="left-b-spetial">
                            <h4>{siteData?.registeredCustomers}<span>+</span></h4>
                            <span>Registered Customers</span>
                        </div>
                        <div className="left-b-spetial  ">
                            <h4>{siteData?.verifiedWorkers}<span>+</span></h4>
                            <span>Verified Workers</span>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-12 col-lg-5 right-b">
                    <img src={profetionals} alt="" />
                    <h2>Connect with {siteData?.verifiedWorkers}+ Skilled Workers</h2>
                    <p>Discover trusted professionals for all your needs, from home<    br/>repairs to specialized services.</p>
                    <button onClick={()=>{setPage('Workers') ,localStorage.setItem('page','Workers')}}>Find Services Now <img src={right_top_arrow} alt="" /></button>
                    <br />
                </div> 
            </div>
            <div className="row fetuers">
                <div className="col-lg-4">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#AFDDE5"><path d="m123-240-43-43 292-291 167 167 241-241H653v-60h227v227h-59v-123L538-321 371-488 123-240Z"/></svg>                    <div className="contents">
                        <h5>Latest Work Trends & Updates</h5>
                        <span className="fetuer_dis">Stay Current</span>
                    </div>
                </div>
                <div className="col-lg-4 fetuers-mid">
                    <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#AFDDE5"><path d="M42-120v-92q0-34 16-56.5t45-36.5q54-26 115.5-43T358-365q78 0 139.5 17T613-305q29 14 45 36.5t16 56.5v92H42Zm60-60h512v-32q0-15-8.5-24.5T585-251q-43-19-96-36.5T358-305q-78 0-131 17.5T131-251q-12 5-20.5 14.5T102-212v32Zm256-245q-66 0-108-43t-42-107h-10q-8 0-14-6t-6-14q0-8 6-14t14-6h10q0-40 20-72t52-52v39q0 6 4.5 10.5T295-685q7 0 11-4.5t4-10.5v-52q8-2 22-3.5t27-1.5q13 0 27 1.5t22 3.5v52q0 6 4 10.5t11 4.5q6 0 10.5-4.5T438-700v-39q32 20 51 52t19 72h10q8 0 14 6t6 14q0 8-6 14t-14 6h-10q0 64-42 107t-108 43Zm0-60q42 0 66-25t24-65H268q0 40 24 65t66 25Zm302 124-2-29q-7-4-14.5-9T630-409l-26 14-22-32 26-19q-2-4-2-7.5v-15q0-3.5 2-7.5l-26-19 22-32 26 14 14-10q7-5 14-9l2-29h40l2 29q7 4 14 9l14 10 26-14 22 32-26 19q2 4 2 7.5v15q0 3.5-2 7.5l26 19-22 32-26-14q-6 5-13.5 10t-14.5 9l-2 29h-40Zm20-62q16 0 27-11t11-27q0-16-11-27t-27-11q-16 0-27 11t-11 27q0 16 11 27t27 11Zm88-155-9-35q-10-4-20.5-11T721-639l-44 16-20-35 35-28q-2-5-3.5-11t-1.5-12q0-6 1.5-12t3.5-11l-35-28 20-35 44 16q7-8 17.5-15.5T759-805l9-35h38l9 35q10 3 20.5 10.5T853-779l44-16 20 35-35 28q2 5 3.5 11t1.5 12q0 6-1.5 12t-3.5 11l35 28-20 35-44-16q-7 8-17.5 15T815-613l-9 35h-38Zm19-73q25 0 41.5-16.5T845-709q0-25-16.5-41.5T787-767q-25 0-41.5 16.5T729-709q0 25 16.5 41.5T787-651ZM358-180Z"/></svg>
                    <div className="contents">
                        <h5>Expert Workers</h5>
                        <span className="fetuer_dis">Verified Professionals You Can Trust</span>
                    </div>
                </div>
                <div className="col-lg-4">
                    <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#AFDDE5"><path d="M480.27-80q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Zm-.27-60q142.38 0 241.19-99.5T820-480v-13q-6 26-27.41 43.5Q771.19-432 742-432h-80q-33 0-56.5-23.5T582-512v-40H422v-80q0-33 23.5-56.5T502-712h40v-22q0-16 13.5-40t30.5-29q-25-8-51.36-12.5Q508.29-820 480-820q-141 0-240.5 98.81T140-480h150q66 0 113 47t47 113v40H330v105q34 17 71.7 26t78.3 9Z"/></svg>
                    <div className="contents">
                        <h5>Global Readership</h5>
                        <span className="fetuer_dis">Empowering Connections Worldwide </span>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Banner


