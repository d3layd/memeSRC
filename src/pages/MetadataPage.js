import { Helmet } from 'react-helmet-async';
// @mui
import { Button, Container, Grid, Stack, Typography, Modal, Card, CardContent, Box } from '@mui/material';
// components
import { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import Iconify from '../components/iconify';
import { createContentMetadata } from '../graphql/mutations';
import { listContentMetadata } from '../graphql/queries';

// ----------------------------------------------------------------------

async function fetchMetadata() {
  const result = await API.graphql(graphqlOperation(listContentMetadata, { filter: {}, limit: 10 }));
  return result.data.listContentMetadata.items;
}

// ----------------------------------------------------------------------

async function createNewContentMetadata(
  id,
  title,
  description,
  frameCount,
  colorMain,
  colorSecondary,
  emoji,
  status
) {
  const newGlobalMessage = {
    input: {
      id,
      title,
      description,
      frameCount,
      colorMain,
      colorSecondary,
      emoji,
      status
    }
  };

  const result = await API.graphql(graphqlOperation(createContentMetadata, newGlobalMessage));

  return result.data.createGlobalMessage;
}

// ----------------------------------------------------------------------

export default function MetadataPage() {
  const [metadata, setMetadata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frameCount, setFrameCount] = useState('');
  const [colorMain, setColorMain] = useState('');
  const [colorSecondary, setColorSecondary] = useState('');
  const [emoji, setEmoji] = useState('');
  const [status, setStatus] = useState('');

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    createNewContentMetadata(id, title, description, frameCount, colorMain, colorSecondary, emoji, status);
    setShowForm(false);
  };

  useEffect(() => {
    async function getData() {
      const data = await fetchMetadata();
      setMetadata(data);
      setLoading(false);
    }
    getData();
  }, []);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    backgroundColor: 'white',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <Helmet>
        <title> Metadata Settings - memeSRC Dashboard </title>
      </Helmet>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Metadata Settings
          </Typography>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={toggleForm}>
            New Content
          </Button>
        </Stack>
        <Container>
          <Grid container spacing={2}>
            {(loading) ? "Loading" : metadata.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h5">{item.title}</Typography>
                    <Typography>{item.description}</Typography>
                    <Typography>Frame Count: {item.frameCount}</Typography>
                    <Typography>Color Main: {item.colorMain}</Typography>
                    <Typography>Color Secondary: {item.colorSecondary}</Typography>
                    <Typography>Emoji: {item.emoji}</Typography>
                    <Typography>Status: {item.status}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Container>
      <Modal open={showForm}>
        <Box style={style}>
          <Stack>
            <Typography variant="h5">Create New Content Metadata</Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>ID:</Typography>
                  <input
                    type="text"
                    value={id}
                    onChange={(event) => setId(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography>Title:</Typography>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography>Description:</Typography>
                  <input
                    type="text"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography>Frame Count:</Typography>
                  <input
                    type="number"
                    value={frameCount}
                    onChange={(event) => setFrameCount(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography>Color Main:</Typography>
                  <input
                    type="text"
                    value={colorMain}
                    onChange={(event) => setColorMain(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography>Color Secondary:</Typography>
                  <input
                    type="text"
                    value={colorSecondary}
                    onChange={(event) => setColorSecondary(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography>Emoji:</Typography>
                  <input
                    type="text"
                    value={emoji} onChange={(event) => setEmoji(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography>Status:</Typography>
                  <input
                    type="number"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit">Submit</Button>
                </Grid>
              </Grid>
            </form>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}
