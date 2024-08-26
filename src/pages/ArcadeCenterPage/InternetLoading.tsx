import React, { useEffect, useState, CSSProperties } from 'react';
import { FC } from 'react';
import { RotatingLines } from 'react-loader-spinner'


const InternetLoading: FC = () => {
    const [isOnline, setIsOnline] = useState(window.navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup event listeners on component unmount
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div>
            {!isOnline && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#261a1ae6', // màu sắc bạn muốn
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <RotatingLines
                            visible={true}
                            // height="96"
                            width="80"
                            // color="grey"
                            strokeWidth="5"
                            animationDuration="0.75"
                            ariaLabel="rotating-lines-loading"
                        // wrapperStyle={{}}
                        // wrapperClass=""
                        />
                        <h4>No Internet Connection</h4>
                        {/* <h5>Check your internet connection or try again later</h5> */}
                    </div>
                </div >
            )}
        </div>
    );
};

export default InternetLoading;
