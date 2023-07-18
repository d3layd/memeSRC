import { Helmet } from 'react-helmet-async';
// @mui
import { Dialog, DialogTitle, DialogContent, FormControl, InputLabel, Select, MenuItem, DialogActions, TextField, List, CardHeader, Avatar, ListItem, ListItemText, Button, Container, Grid, Stack, Typography, Card, CardContent, CircularProgress, IconButton, Collapse, Autocomplete, LinearProgress, Tabs, Tab, Box, Menu, Backdrop } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Popover from '@mui/material/Popover';
import { grey } from '@mui/material/colors';
import CardActions from '@mui/material/CardActions';
import { styled } from '@mui/material/styles';
// components
import { useState, useEffect, Fragment, useContext } from 'react';
import { API, Auth, graphqlOperation, Storage } from 'aws-amplify';
import { faker } from '@faker-js/faker';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { ArrowDropDown, CheckCircle, Pending, Poll, RequestPage, StorageOutlined } from '@mui/icons-material';
import { migrateSeriesData, updateSeriesData } from '../utils/migrateSeriesData';
import Iconify from '../components/iconify';
import { createSeries, updateSeries, deleteSeries } from '../graphql/mutations';
import { listSeries } from '../graphql/queries';
import { onUpdateSeries } from '../graphql/subscriptions';
import SeriesCard from '../sections/@dashboard/series/SeriesCard';
import { SnackbarContext } from '../SnackbarContext';

// ----------------------------------------------------------------------

const listSeriesAndSeasons = /* GraphQL */ `
  query ListSeries(
    $filter: ModelSeriesFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSeries(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        tvdbid
        slug
        name
        year
        image
        description
        statusText
        seasons {
          items {
            id
            tvdbid
            createdAt
            updatedAt
          }
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const FormMode = {
  CREATE: 'create',
  EDIT: 'edit',
};

const ExpandMore = styled((props) => {
  const { ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

async function fetchMetadata(items = [], nextToken = null) {
  const result = await API.graphql(
    graphqlOperation(listSeriesAndSeasons, {
      filter: {},
      limit: 10,
      nextToken
    })
  );
  const sortedMetadata = result.data.listSeries.items.sort((a, b) => {
    if (a?.name < b?.name) return -1;
    if (a?.name > b?.name) return 1;
    return 0;
  });
  const allItems = [...items, ...sortedMetadata];
  const newNextToken = result.data.listSeries.nextToken;
  if (newNextToken) {
    return fetchMetadata(allItems, newNextToken);
  }
  return allItems;
}

let sub;


export default function DashboardSeriesPage() {
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState([]);
  const [filteredMetadata, setFilteredMetadata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState(null);
  const [tvdbid, setTvdbid] = useState('');
  const [seriesDescription, setSeriesDescription] = useState('');
  const [mode, setMode] = useState(FormMode.CREATE);
  const [seriesSlug, setSlug] = useState('');
  const [seriesName, setSeriesName] = useState('');
  const [seriesYear, setSeriesYear] = useState('');
  const [seriesImage, setSeriesImage] = useState('');
  const [seriesSeasons, setSeriesSeasons] = useState([]);
  const [metadataLoaded, setMetadataLoaded] = useState(false);
  const [dialogButtonText, setDialogButtonText] = useState('Next');
  const [dialogButtonLoading, setDialogButtonLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [tvdbSearchopen, setTvdbSearchOpen] = useState(false);
  const [tvdbResults, setTvdbResults] = useState([]);
  const [tvdbResultsLoading, setTvdbResultsLoading] = useState(false);
  const [tvdbSearchQuery, setTvdbSearchQuery] = useState('');
  const [statusText, setStatusText] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileLocation, setFileLocation] = useState('');
  const [sortMethod, setSortMethod] = useState('live');
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [migrationLoading, setMigrationLoading] = useState(false);
  const { setMessage, setSeverity, setOpen } = useContext(SnackbarContext);

  // Options Menu
  const [optionsMenuAnchor, setOptionsMenuAnchor] = useState(null);
  const isOptionsMenuOpen = Boolean(optionsMenuAnchor);
  const handleOptionsMenuClick = (event) => {
    setOptionsMenuAnchor(event.currentTarget);
  };
  const handleOptionsMenuClose = () => {
    setOptionsMenuAnchor(null);
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleMoreVertClick = (event, itemIndex) => {
    setSelectedIndex(itemIndex);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setSelectedIndex(null);
    setAnchorEl(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    clearForm();
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? 'simple-popover' : undefined;

  const clearForm = () => {
    setId('');
    setTvdbid('');
    setSeriesDescription('');
    setSlug('');
    setSeriesName('');
    setSeriesYear('');
    setSeriesImage('');
    setSeriesSeasons('');
    setMetadataLoaded(false);
    setTvdbResults([]);
    if (sub) { sub.unsubscribe(); }
    setStatusText('');
    setFileLocation('');
  };

  // ----------------------------------------------------------------------

  async function createNewSeries(seriesData) {
    console.log(seriesData);
    API.graphql(graphqlOperation(createSeries, { input: seriesData }))
      .then((result) => {
        console.log(result)

        setMetadata([...metadata, result.data.createSeries])

        clearForm();

        return result.data.createSeries;
      })
      .catch((error) => console.log(error));


  }

  async function updateExistingSeries(seriesData) {


    console.log(seriesData);
    try {
      const result = await API.graphql(graphqlOperation(updateSeries, { input: seriesData }));
      console.log(result);
      const updatedMetadata = result.data.updateSeries;
      setMetadata((prevMetadata) =>
        prevMetadata.map((item) => (item.id === id ? updatedMetadata : item))
      );
      return Promise.resolve(updatedMetadata);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }


  async function deleteExistingSeries(id) {
    const deletedMetadataItem = {
      input: {
        id
      }
    };

    try {
      const result = await API.graphql(graphqlOperation(deleteSeries, deletedMetadataItem));
      console.log(result);

      // Update the metadata state by filtering out the deleted item
      setMetadata(metadata.filter((item) => item.id !== id));

      return Promise.resolve(result.data.deleteSeries);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }




  // ----------------------------------------------------------------------

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleSubmit = (event) => {
    const seriesData = {
      tvdbid,
      description: seriesDescription,
      slug: seriesSlug,
      name: seriesName,
      year: parseInt(seriesYear, 10),
      image: seriesImage,
      statusText
    }
    event.preventDefault();
    if (mode === FormMode.CREATE) {
      createNewSeries(seriesData);
    } else {
      updateExistingSeries({ ...seriesData, id });
    }
    clearForm();
    setShowForm(false);
    handleClose();
  };

  const handleGetMetadata = () => {
    setDialogButtonLoading(true);
    setTimeout(() => {
      const seriesData = {
        name: 'placeholder',
        tvdbid
      }
      // Set the form fields to the values of the item being edited
      setId(seriesData.id);
      setTvdbid(seriesData.tvdbid);
      setSeriesDescription(seriesData.description);
      setSlug(seriesData.slug);
      setSeriesName(seriesData.name);
      setSeriesYear(seriesData.year);
      setSeriesImage(seriesData.cover);
      setStatusText(seriesData.statusText);
      setDialogButtonLoading(false);
      setDialogButtonText('Submit');
      setMetadataLoaded(true);
    }, 1000)
  }

  const handleEdit = (seriesData) => {
    // Set the form fields to the values of the item being edited
    setId(seriesData.id);
    setTvdbid(seriesData.tvdbid);
    setSeriesDescription(seriesData.description);
    setSlug(seriesData.slug);
    setSeriesName(seriesData.name);
    setSeriesYear(seriesData.year);
    setSeriesImage(seriesData.cover);
    setStatusText(seriesData.statusText);
    setMetadataLoaded(true);

    // Set the form to edit mode
    setMode(FormMode.EDIT);
    sub = API.graphql(
      graphqlOperation(onUpdateSeries, {
        filter: { id: { eq: seriesData.id } }
      })
    ).subscribe({
      next: (element) => {
        console.log(element)
        setStatusText(element.value.data.onUpdateSeries.statusText)
      },
      error: (error) => console.warn(error)
    });
    // Show the form
    setShowForm(true);
  };

  const handleDelete = (id) => {
    deleteExistingSeries(id)
    handleClose();
  }

  useEffect(() => {
    async function getData() {
      const data = await fetchMetadata();
      setMetadata(data);
      setFilteredMetadata(data.filter(obj => !obj.statusText));
      setLoading(false);
    }
    getData();
  }, []);

  const searchTvdb = async () => {
    setTvdbResultsLoading(true);
    await API.get('publicapi', '/tvdb/search', {
      'queryStringParameters': {
        'query': tvdbSearchQuery
      }
    }).then(results => {
      console.log(results)
      if (typeof results === 'object') {
        setTvdbResults(results);
        setTvdbResultsLoading(false);
      } else {
        setTvdbResults([]);
        setTvdbResultsLoading(false);
      }
      results.forEach(element => {
        console.log(element)
      });
    }).catch(error => console.log(error))
  }

  const getTvdbSeasons = async () => {
    await API.get('publicapi', `/tvdb/series/${tvdbid}/extended`)
      .then(results => {
        setSeriesSeasons(results.seasons);
        console.log(results.seasons)
      })
      .catch(error => console.log(error))
  }

  const handleUpload = (files) => {
    setUploading(true);
    Storage.put(files[0].name, files[0], {
      resumable: true,
      level: "protected",
      completeCallback: (event) => {
        setUploading(false);
        console.log('Upload Complete!');
        Auth.currentUserCredentials().then((creds) => {
          setUploading(false);
          console.log(`protected/${creds.identityId}/${event.key}`);
          setFileLocation(`protected/${creds.identityId}/${event.key}`);
        });
      },
      progressCallback: (progress) => {
        setUploadProgress(progress.loaded / progress.total * 100);
        console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
      },
      errorCallback: (err) => {
        console.error('Unexpected error while uploading', err);
      }
    })
  }

  useEffect(() => {
    const timeOutId = setTimeout(() => searchTvdb(), 100);
    return () => clearTimeout(timeOutId);
  }, [tvdbSearchQuery]);

  useEffect(() => {
    if (tvdbid !== '') {
      getTvdbSeasons();
    }
  }, [tvdbid]);

  const filterResults = (event, value) => {
    setSortMethod(value)
    switch (value) {
      case 'live':
        setFilteredMetadata(metadata.filter(obj => !obj.statusText));
        break;
      case 'vote':
        setFilteredMetadata(metadata.filter(obj => obj.statusText === "requested"));
        break;
      case 'requested':
        setFilteredMetadata(metadata.filter(obj => obj.statusText === "submittedRequest"));
        break;
      default:
        setFilteredMetadata(metadata);
    }
  }

  const tvdbIdMigration = () => {
    setMigrationLoading(true)
    migrateSeriesData().then(results => {
      console.log(results);
      updateSeriesData(results).then(() => {
        console.log('COMPLETE!')
        setMigrationLoading(false)
        setMessage('Migration Complete!')
        setSeverity('success')
        setOpen(true);
      }).catch(error => {
        console.log(error)
        setMigrationLoading(false)
        setMessage('Error during migration.')
        setSeverity('error')
        setOpen(true);
      })
    }).catch(error => {
      console.log(error)
      setMigrationLoading(false)
      setMessage('Error loading series data')
      setSeverity('error')
      setOpen(true);
    })
  }



  return (
    <>
      <Helmet>
        <title> TV Shows - memeSRC </title>
      </Helmet>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            TV Shows {loading ? <CircularProgress size={25} /> : `(${filteredMetadata.length})`}
          </Typography>
          <Button
            aria-controls="options-menu"
            aria-haspopup="true"
            onClick={handleOptionsMenuClick}
            variant='contained'
            startIcon={<ArrowDropDown />}
          >
            Options
          </Button>
          <Menu
            id="options-menu"
            anchorEl={optionsMenuAnchor}
            keepMounted
            open={isOptionsMenuOpen}
            onClose={handleOptionsMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => {
              navigate('/dashboard/addseries');
              handleOptionsMenuClose();
            }}
            >
              <Button fullWidth variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
                Add Show
              </Button>
            </MenuItem>
            <MenuItem onClick={handleOptionsMenuClose}>
              <Button fullWidth variant="contained" startIcon={<StorageOutlined />} onClick={tvdbIdMigration}>
                Migrate Data
              </Button>
            </MenuItem>
          </Menu>
        </Stack>
        <Container sx={{ paddingX: 0 }}>
          <Tabs value={sortMethod} onChange={filterResults} indicatorColor="secondary" textColor="inherit" sx={{ mb: 3 }}>
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  Live
                </Box>
              }
              value="live"
            />
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <Poll color="warning" sx={{ mr: 1 }} />
                  Votable
                </Box>
              }
              value="vote"
            />
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <Pending color='action' sx={{ mr: 1 }} />
                  Requested
                </Box>
              }
              value="requested"
            />
          </Tabs>
          <Grid container spacing={2}>
            {(loading) ? "Loading" : filteredMetadata.map((seriesItem, index) => (
              <SeriesCard
                key={index}
                post={{
                  id: seriesItem.id,
                  cover: seriesItem.image,
                  name: seriesItem.name,
                  createdAt: seriesItem.createdAt,
                  tvdbid: seriesItem.tvdbid,
                  slug: seriesItem.slug,
                  year: seriesItem.year,
                  statusText: seriesItem.statusText,
                  description: seriesItem.description,
                  view: faker.datatype.number(),
                  comment: faker.datatype.number(),
                  share: faker.datatype.number(),
                  favorite: faker.datatype.number(),
                  author: {
                    name: seriesItem.name,
                    avatarUrl: '🍌',
                  }
                }}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            ))}


            {/* (loading) ? "Loading" : metadata.map((metadataItem, index) => (
              <Grid item xs={12} sm={6} md={4} key={metadataItem.id}>
                <Card sx={{ maxWidth: 345 }}>
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: grey[200] }} aria-label="recipe">
                        {metadataItem.emoji}
                      </Avatar>
                    }
                    action={
                      <>
                        <IconButton aria-label="settings" onClick={(event) => handleMoreVertClick(event, index)}>
                          <MoreVertIcon />
                        </IconButton>
                      </>
                    }
                    style={{ height: "100px", top: "0" }}
                    title={metadataItem.title}
                    subheader={`${metadataItem.frameCount.toLocaleString('en-US')} frames`}
                  />
                  <Popover
                    id={popoverId}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <List>
                      <ListItem button onClick={handleEdit}>
                        <ListItemText primary="Edit" />
                      </ListItem>
                      <ListItem button onClick={handleDelete}>
                        <ListItemText primary="Delete" />
                      </ListItem>
                    </List>
                  </Popover>
                  
                  <CardActions disableSpacing>
                    <IconButton aria-label="add to favorites">
                      <FavoriteIcon />
                    </IconButton>
                    <IconButton aria-label="share">
                      <ShareIcon />
                    </IconButton>
                    <ExpandMore
                      expand={expanded}
                      onClick={handleExpandClick}
                      aria-expanded={expanded}
                      aria-label="show more"
                    >
                      <ExpandMoreIcon />
                    </ExpandMore>
                  </CardActions>
                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                      <Typography>{metadataItem.description}</Typography>
                      <Typography>Frame Count: {metadataItem.frameCount}</Typography>
                      <Typography>Color Main: {metadataItem.colorMain}</Typography>
                      <Typography>Color Secondary: {metadataItem.colorSecondary}</Typography>
                      <Typography>Emoji: {metadataItem.emoji}</Typography>
                      <Typography>Status: {metadataItem.status}</Typography>
                    </CardContent>
                  </Collapse>
                </Card>
              </Grid>
                  )) */}


          </Grid>
        </Container>
      </Container>
      {/* <button type="button" onClick={() => handleEdit(item)}>Edit</button>
                  <button type="button" onClick={() => deleteExistingSeries(item.id)}>Delete</button> */}
      <Dialog open={showForm} onClose={handleClose}>
        <DialogTitle>Create New Content Metadata</DialogTitle>
        <DialogContent>
          <form>
            <Grid container spacing={2} paddingTop={2}>
              {/* <Grid item xs={12}>
                <TextField
                  label="ID"
                  fullWidth
                  value={id}
                  onChange={(event) => setId(event.target.value)}
                />
              </Grid> */}

              <Grid item xs={12}>
                <TextField
                  label="ID"
                  fullWidth
                  value={id}
                  onChange={(event) => setId(event.target.value)}
                />
                {/* <Autocomplete
                  id="series-search"
                  sx={{ width: '100%' }}
                  open={tvdbSearchopen}
                  onOpen={() => {
                    setTvdbSearchOpen(true);
                  }}
                  onClose={() => {
                    setTvdbSearchOpen(false);
                  }}
                  isOptionEqualToValue={(tvdbResults, value) => tvdbResults.name === value.name}
                  getOptionLabel={(tvdbResults) => tvdbResults.name}
                  noOptionsText="No Results Found"
                  autoHighlight
                  options={tvdbResults}
                  loading={tvdbResultsLoading}
                  loadingText="Searching..."
                  value={tvdbid}
                  onChange={(event, selected) => {
                    if (typeof selected === 'object') {
                      setTvdbid(selected.tvdb_id);
                      setSeriesDescription(selected.overview);
                      setSlug(selected.slug);
                      setSeriesName(selected.name);
                      setSeriesYear(selected.year);
                      setSeriesImage(selected.image_url);
                      setMetadataLoaded(true);
                      console.log(selected.tvdb_id);
                      setDialogButtonText('Submit');
                    } else {
                      setTvdbid('');
                      setSeriesDescription('');
                      setSlug('');
                      setSeriesName('');
                      setSeriesYear('');
                      setSeriesImage('');
                    }
                  }}
                  filterOptions={(x) => x}
                  renderInput={(params) => (
                    <TextField
                      value={tvdbSearchQuery}
                      onChange={(event) => {
                        setTvdbSearchQuery(event.target.value);
                        // if (event.target.value !== seriesName) {
                        //   setTvdbid('');
                        //   setSeriesDescription('');
                        //   setSlug('');
                        //   setSeriesName('');
                        //   setSeriesYear('');
                        //   setSeriesImage('');
                        // }
                      }}
                      {...params}
                      label="Search TVDB"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {tvdbResultsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                /> */}
              </Grid>
              {metadataLoaded &&
                <>
                  {/* <Grid item xs={12}>
                    <TextField
                      label="TVDB ID"
                      fullWidth
                      value={tvdbid}
                      onChange={(event) => setTvdbid(event.target.value)}
                    />
                  </Grid> */}
                  <Grid item xs={12}>
                    <TextField
                      label="Slug"
                      fullWidth
                      value={seriesSlug}
                      onChange={(event) => setSlug(event.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Name"
                      fullWidth
                      value={seriesName}
                      onChange={(event) => setSeriesName(event.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Year"
                      type='number'
                      fullWidth
                      value={seriesYear}
                      onChange={(event) => setSeriesYear(event.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Image"
                      fullWidth
                      value={seriesImage}
                      onChange={(event) => setSeriesImage(event.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      fullWidth
                      value={seriesDescription}
                      onChange={(event) => setSeriesDescription(event.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="status-select-label">Status</InputLabel>
                      <Select
                        labelId="status-select-label"
                        id="status-select"
                        value={statusText}
                        label="Status"
                        onChange={(event) => {
                          setStatusText(event.target.value)
                        }}
                      >
                        <MenuItem value='active'>Active</MenuItem>
                        <MenuItem value='inactive'>Inactive</MenuItem>
                        <MenuItem value='requested'>Requested</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {/* <Grid item xs={12}>
                    <Button variant="contained" fullWidth component="label">
                      Upload
                      <input
                        hidden
                        accept="*"
                        type="file"
                        onChange={(event) => handleUpload(event.target.files)}
                      />
                    </Button>
                    <Typography component='p' variant='body1'>
                      {fileLocation}
                    </Typography>
                  </Grid> */}

                  {uploading &&
                    <>
                      <Grid item xs={12}>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Status"
                          fullWidth
                          value={statusText}
                          disabled
                          onChange={(event) => setStatusText(event.target.value)} />
                      </Grid>
                    </>
                  }
                  {seriesSeasons && seriesSeasons.map((season) =>
                    (season.type.id === 1) ?
                      <Grid item xs={6} md={4}>
                        <img src={season.image} alt='season artwork' style={{ width: '100%', height: 'auto' }} />
                        <Typography component='h6' variant='h6'>
                          Season {season.number}
                        </Typography>
                      </Grid>
                      : null

                  )}
                </>
              }
            </Grid>
          </form>
          {/* <Button variant='contained' onClick={searchTvdb} >Search</Button> */}
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={handleCloseForm}>Cancel</Button>
          {metadataLoaded && <LoadingButton variant='contained' type='submit' onClick={metadataLoaded ? handleSubmit : handleGetMetadata} loading={dialogButtonLoading}>{dialogButtonText}</LoadingButton>}
        </DialogActions>
      </Dialog>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={migrationLoading}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress color="inherit" />
          <Typography variant='h5' sx={{ mt: 2 }}>
            Migrating TVDB ID's...
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
}
