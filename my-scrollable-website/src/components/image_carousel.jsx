import React from 'react';
import Carousel from 'react-material-ui-carousel';
import { Paper } from '@mui/material';

const items = [
  {
    url: "/test.jpg"
  },
  {
    url: "/test2.jpg"
  },
  {
    url: "/test3.jpg"
  }
];

function Images() {
  return (
    <Carousel 
      animation="slide"
    >
      {items.map((item, i) => (
        <Item key={i} item={item} />
      ))}
    </Carousel>
  );
}

function Item({ item }) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%', // or a specific height like '80vh'
        width: '100%'
      }}>
      <Paper elevation={5} style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        marginTop: '20px',
        width: '80%',
        backgroundColor: '#fff',
      }}>
        <img
          src={item.url}
          alt={`carousel-img-${item.url}`}
          style={{
            padding: "10px",
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            width: 'auto',
            height: 'auto',
          }}
        />
      </Paper>
      </div>
    );
  }

export default Images;
