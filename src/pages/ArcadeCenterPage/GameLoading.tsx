import React, { useEffect, useState, CSSProperties } from 'react';
import { FC } from 'react';
import { ProgressBar } from 'react-loader-spinner'


const GameLoading = ({loadingProgression}:{loadingProgression : number}) => {
    const loadingText : string = "Be patient, the first time entering will take a little longer."
    const delayTimeShowLoadingLongTimeText : number = 12;
    const [isLongTime, setIsLongTime] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            setIsLongTime(true)
        }, delayTimeShowLoadingLongTimeText * 1000);
    }, [])
    return (
        <>
            {true && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#00000061', // màu sắc bạn muốn
                    color: 'white',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    zIndex: 9999,
                    paddingBottom: '20px'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <ProgressBar
                            visible={true}
                            height="80"
                            width="80"
                            // color="#4fa94d"
                            ariaLabel="progress-bar-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                        />
                        <h4>Loading {loadingProgression}%</h4>
                        {isLongTime && (

                            <h6 style={{ fontSize: "0.6em", textAlign: "center", padding: "0 20px", marginTop: 0, maxWidth: "80%" }}>
                                {loadingText}
                            </h6>

                        )}
                        {/* <h5>Check your internet connection or try again later</h5> */}
                    </div>
                </div>
            )}
        </>
    );


};

export default GameLoading;
