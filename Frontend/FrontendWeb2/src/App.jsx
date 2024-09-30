import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './Pages/Home/Home';
import Client from "./Pages/Client/Client"
import Freelancer from './Pages/Freelancer/Freelancer'
import Jobs from './Pages/Jobs/Jobs'
import PostJob from './Pages/Post/PostJob';
import Chatbot from './Pages/Jobs/Chatbot';
import DeliverOrder from "./Pages/DeliverOrder/DeliverOrder"
import Check from './Pages/Check/Check';
import AddReviews from "./Pages/AddReviews/AddReviews"


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/client' element={<Client />} />
        <Route path='/freelancer' element={<Freelancer />} />
        <Route path='/jobs' element={<Jobs />} />
        <Route path='/postJob' element={<PostJob />} />
        <Route path='/chatbot' element={<Chatbot />}/>
        <Route path='/deliverOrder' element={<DeliverOrder />} />
        <Route path='/check' element={<Check/>} />
        <Route path='/addReviews' element={<AddReviews/>} />
      </Routes>
    </Router>
  );
}

export default App;
