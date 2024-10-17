import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Box from '@mui/material/Box';
import { Button, Container, Divider, Typography } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import '../styles/ServicePage.css';
import Images from '../components/image_carousel';

const ServicePage = () => {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      if (serviceId) {
        const serviceRef = doc(db, 'services', serviceId);
        const serviceSnap = await getDoc(serviceRef);
        if (serviceSnap.exists()) {
          setService(serviceSnap.data());
        } else {
          console.log('No such service!');
        }
      }
    };

    fetchService();
  }, [serviceId]);

  if (!service) {
    return <p>Loading...</p>;
  }

  const formattedPrice = parseFloat(service.price).toFixed(2);


  return (
    <Container className='service-page'>
      <div className='service-page-wrapper'>
        <div className='service-section'>
          <Images />
          <section>
            <h2>{service.title}</h2>
            <h1>${formattedPrice}</h1>
            <Button className='buy-button' variant='contained' startIcon={<AddShoppingCartIcon />}>
              Buy
            </Button>
          </section>
        </div>
        <Divider />
        <Box className='about-section'>
          <h4>About Service</h4>
          <p>{service.description}</p>
        </Box>
      </div>
    </Container>
  );
};

export default ServicePage;
