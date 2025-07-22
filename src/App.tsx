import React, {useRef} from 'react';
import './App.css';
import {Aside, Footer, Header} from "./components";



function App() {
    const videoRef = useRef<HTMLVideoElement>(null);
  return (
      <div className="App">
          <Header/>
          <main className="main">
              <Aside/>
              <div className="contents">
                  <video
                      ref={videoRef}
                      src="https://www.w3schools.com/html/mov_bbb.mp4"
                  />
              </div>
          </main>
          <Footer videoRef={videoRef}/>
      </div>
  );
}

export default App;
