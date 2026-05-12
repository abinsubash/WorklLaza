import { useEffect, useState, useContext } from 'react'
import './Payments.css'
import secureRequest from '../../../Compenets/ProtectedRoute/secureRequest';
import { toast } from 'sonner';
import API from '../../../api';
import { LoadingContext } from '../../../App';
import { useSearchParams } from 'react-router-dom';


const Payments = ({ setPage }) => {

    const [workerData, setWrokerData] = useState();
    const [walletData, setWalletData] = useState();
    const setIsLoading = useContext(LoadingContext);
    const [searchParams] = useSearchParams();

    const fetchData = async () => {
        try {
            await secureRequest(async () => {
                const res = await API.get('/worker/payments_view')
                setWrokerData(res?.data?.worker)
                setWalletData(res?.data?.wallet_rows)
            });
        } catch (err) {
            if (err?.response?.data?.message){
                toast.error(err?.response?.data?.message)
            }
        }
    }

    // Check if payment was successful and verify it
    const verifyPaymentAfterRedirect = async () => {
        // Retrieve session_id from sessionStorage (stored before Stripe redirect)
        const sessionId = sessionStorage.getItem('stripe_session_id');
        
        if (!sessionId) {
            return;
        }
        
        // Check if we already tried verification
        const previouslyCleared = sessionStorage.getItem('stripe_session_id_cleared');
        if (previouslyCleared) {
            return;
        }
        
        // Mark as processing
        sessionStorage.setItem('stripe_session_id_cleared', 'true');
        sessionStorage.removeItem('stripe_session_id');
        
        // Give Stripe a moment to fully process
        setTimeout(async () => {
            try {
                const res = await secureRequest(async () => {
                    return await API.post('/worker/payment_verify/', {
                        session_id: sessionId
                    });
                });
                
                if (res?.data?.message?.includes('successfully')) {
                    toast.success('✅ Payment verified and recorded!');
                    
                    // Clear URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                    // Refresh data immediately and wait for it to complete
                    await fetchData();
                    
                    // Set refresh flag for Home component to force refetch
                    sessionStorage.setItem('forceRefreshHome', Date.now().toString());
                    
                    // Wait a bit more to ensure all data is synced
                    setTimeout(() => {
                        if (setPage) {
                            setPage('Home');
                            localStorage.setItem('page', 'Home');
                        }
                    }, 1500);
                } else {
                    toast.info(res?.data?.message || 'Payment processing...');
                    fetchData();
                }
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Payment verification failed. Refreshing...');
                fetchData();
            }
        }, 500);
    };

    useEffect(() => {
        // Check if session ID exists from Stripe redirect
        const sessionIdInStorage = sessionStorage.getItem('stripe_session_id');
        
        if (sessionIdInStorage) {
            // Run verification for user just returned from Stripe
            setTimeout(() => verifyPaymentAfterRedirect(), 500);
            return;
        }
        
    }, []) // Empty dependency to run only on mount
    
    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [])
    
    // Also check on search params change
    useEffect(() => {
        if (searchParams.get('payment') === 'success') {
            console.log('🔄 Search params changed - verifying payment');
            verifyPaymentAfterRedirect();
        }
    }, [searchParams])

    const handlePayment = async () => {
        setIsLoading(true)
        try {
            // Clear old verification flags so new payment can be verified
            sessionStorage.removeItem('stripe_session_id_cleared');
            
            const res = await secureRequest(async () => {
                return await API.post("/worker/payments_view/");
            });
            
            // Store session_id directly from response
            const { session_id, checkout_url, amount } = res.data;
            
            if (session_id) {
                sessionStorage.setItem('stripe_session_id', session_id);
            } else {
                toast.error('Failed to create payment session');
                return;
            }
            
            // Redirect to Stripe checkout
            window.location.href = checkout_url;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Payment failed");
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <div className='payments_div'>
            <span>Payments</span>
            <br /><br />
            <div className="top_row">
                <h2>Pending Payment Total : <span>₹ {workerData?.pending_fee}</span></h2>
                <button onClick={handlePayment} >Complete pending payment now</button>
            </div>
            <br /> <hr /> <br />

            <h1>Transaction history</h1>

            <div className="table-container " >
                <table className="table">
                    {walletData?.length == 0 ?
                        <h3 style={{ padding: "5% 5%", color: 'red' }}>Please Complete at least one payment</h3>
                        :
                        <>
                            <thead>
                                <tr>
                                    <th scope="col">Amount</th>
                                    <th scope="col">Payment Id</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    walletData?.map((row,index) => (
                                        <tr key={index}>
                                            <td>₹ {row?.amount/100}</td>
                                            <td>{row?.pyment_id}</td>
                                            <td>{row?.status}</td>
                                            <td>{row?.type === "credit" ? "credit" : "debit"}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </>
                    }
                </table>
                <br />
            </div>
        </div>
    )
}

export default Payments


