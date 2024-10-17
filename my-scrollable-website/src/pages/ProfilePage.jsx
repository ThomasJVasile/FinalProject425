import React, { useState, useEffect } from 'react';
import { Container, Avatar, Typography, Grid, Paper, Button, TextField } from '@mui/material';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams } from 'react-router-dom';
import Carousel from 'react-multi-carousel'; // Example carousel library import
import 'react-multi-carousel/lib/styles.css';

const ProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const responsive = {
    superLargeDesktop: {
      // This will be applied to screens with width greater than 3000px
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      // This will be applied to screens with width between 1024px and 3000px
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      // This will be applied to screens with width between 464px and 1024px
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      // This will be applied to screens with width between 0px and 464px
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };
  

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'profiles', userId));
      if (userDoc.exists()) {
        setUser(userDoc.data());
      } else {
        console.log('No such user!');
      }
    };

    const fetchUserServices = async () => {
      const servicesQuery = query(collection(db, 'services'), where('ownerId', '==', userId));
      const servicesSnapshot = await getDocs(servicesQuery);
      const servicesList = servicesSnapshot.docs.map(doc => doc.data());
      setServices(servicesList);
    };

    fetchUserData();
    fetchUserServices();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(false);

    // Update the Firestore document with the new data
    try {
      await updateDoc(doc(db, 'profiles', userId), {
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture || null,
      });
      console.log('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile: ', error);
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Paper elevation={3} style={{ padding: '2rem' }}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item>
            <Avatar
              alt={user.fullName}
              src={user.profilePicture || '/defaultProfilePic.jpg'}
              sx={{ width: 100, height: 100 }}
            />
          </Grid>
          <Grid item xs={12}>
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Name"
                  name="fullName"
                  value={user.fullName}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '1rem' }}
                >
                  Save Changes
                </Button>
              </form>
            ) : (
              <>
                <Typography variant="h5" component="h1" gutterBottom>
                  {user.fullName}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {user.email}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '1rem' }}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
