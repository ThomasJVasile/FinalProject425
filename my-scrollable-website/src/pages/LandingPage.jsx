



//this is not working if services from db are with no TITLE but u can still click on them

// import HomeNavbar from '../components/navbar_home';
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../firebase'; // Adjust the path as needed
// import '../styles/LandingPage.css'; 

// const LandingPage = () => {
//   const [services, setServices] = useState([]);
//   const categories = [
//     "Tech",
//     "Finance",
//     "Marketing",
//     "Design",
//     "Writing",
//     "Business",
//     "Lifestyle",
//     "Music",
//     "Data",
//     "Programming",
//   ];

//   const navigate = useNavigate();

//   // Fetch services from Firestore
//   useEffect(() => {
//     const fetchServices = async () => {
//       const servicesCollection = collection(db, 'services');
//       const servicesSnapshot = await getDocs(servicesCollection);
//       const servicesList = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setServices(servicesList);
//     };

//     fetchServices();
//   }, []);

//   const handleCategoryClick = (category) => {
//     navigate(`/results/${category.toLowerCase()}`);
//   };

//   const handleServiceClick = (serviceId) => {
//     navigate(`/service/${serviceId}`);
//   };

//   return (
//     <div className="landing-page">
//       <HomeNavbar />
//       <header className="header">
//         <div className="search-bar">
//           <input type="text" placeholder="Search services" />
//         </div>
//         <div className="auth-buttons">
//           <button className="sign-in" onClick={() => navigate('/sign-in')}>Sign In</button>
//           <button className="register" onClick={() => navigate('/register')}>Register</button>
//         </div>
//       </header>

//       <div className="spacer"></div> {/*this is just to make a gap in between header and maion */}
      
      
//       <main className="main-content">
//         <aside className="sidebar">
//           <ul className="category-list">
//             {categories.map((category, index) => (
//               <li key={index} className="category-item">
//                 <button 
//                   className="category-button" 
//                   onClick={() => handleCategoryClick(category)}
//                 >
//                   <span className="category-name">{category}</span>
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </aside>
//         <section className="content-section">
//           <div className="content-header">
//             <h1>Fiver Clone</h1>
//             <h2>by Team 18</h2>
//             <p>Welcome to our website. Please select from one of our categories or search for a service.</p>
//           </div>
//           <div className="content-items">
//             {services.map((service, index) => (
//               <div 
//                 key={index} 
//                 className="content-item" 
//                 onClick={() => handleServiceClick(service.id)}
//               >
//                 <div className="avatar">
//                   <img src={`https://via.placeholder.com/50?text=${service.title.charAt(0)}`} alt="Avatar" />
//                 </div>
//                 <div className="item-text">
//                   <p className="item-title">{service.title}</p>
//                   <p className="item-description">by {service.owner}</p>
//                   <p className="item-price">${service.price}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// };

// export default LandingPage;





import HomeNavbar from '../components/navbar_home';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path as needed
import '../styles/LandingPage.css'; 

const LandingPage = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const categories = [
    "Tech",
    "Finance",
    "Marketing",
    "Design",
    "Writing",
    "Business",
    "Lifestyle",
    "Music",
    "Data",
    "Programming",
  ];

  const navigate = useNavigate();

  // Fetch services from Firestore
  // useEffect(() => {
  //   const fetchServices = async () => {
  //     const servicesCollection = collection(db, 'services');
  //     const servicesSnapshot = await getDocs(servicesCollection);
  //     const servicesList = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //     setServices(servicesList);
  //     setFilteredServices(servicesList); // Initially show all services
  //   };

  //   fetchServices();
  // }, []);
  useEffect(() => {
    const fetchServices = async () => {
      const servicesCollection = collection(db, 'services');
      const servicesSnapshot = await getDocs(servicesCollection);
      const servicesList = servicesSnapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data(),
        title: doc.data().title || 'No title',              // Default title
        owner: doc.data().owner || 'Unknown',              // Default owner
        price: doc.data().price || 'N/A',                  // Default price
        description: doc.data().description || 'No description available' // Default description
      }));
      setServices(servicesList);
      setFilteredServices(servicesList); // To show all services initially
    };
  
    fetchServices();
  }, []);
  

  const handleCategoryClick = (category) => {
    const filtered = services.filter(service => service.category && service.category.includes(category));
    setFilteredServices(filtered);
  };

  const handleServiceClick = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  return (
    <div className="landing-page">
      <HomeNavbar />
      <header className="header">
        <div className="search-bar">
          <input type="text" placeholder="Search services" />
        </div>
        <div className="auth-buttons">
          <button className="sign-in" onClick={() => navigate('/signin')}>Sign In</button>
          <button className="register" onClick={() => navigate('/signup')}>Register</button>
        </div>
      </header>

      <div className="spacer"></div> {/*this is just to make a gap in between header and main */}
      
      <main className="main-content">
        <aside className="sidebar">
          <ul className="category-list">
            {categories.map((category, index) => (
              <li key={index} className="category-item">
                <button 
                  className="category-button" 
                  onClick={() => handleCategoryClick(category)}
                >
                  <span className="category-name">{category}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <section className="content-section">
          <div className="content-header">
            <h1>Fiver Clone</h1>
            <h2>by Team 18</h2>
            <p>Welcome to our website. Please select from one of our categories or search for a service.</p>
          </div>
          <div className="content-items">
            {filteredServices.map((service, index) => (
              <div 
                key={index} 
                className="content-item" 
                onClick={() => handleServiceClick(service.id)}
              >
                <div className="avatar">
                  <img src={`https://via.placeholder.com/50?text=${service.title ? service.title.charAt(0) : 'S'}`} alt="Avatar" />
                </div>
                <div className="item-text">
                  <p className="item-title">{service.title || 'No title available'}</p>
                  <p className="item-description">by {service.owner || 'Unknown'}</p>
                  <p className="item-price">${service.price || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;


