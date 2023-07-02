import React, { useContext, useEffect, useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress,
  Box,
  InputAdornment,
  TextField,
  Button,
  Badge,
  styled,
  Fab,
} from '@mui/material';
import { ArrowUpward, ArrowDownward, Search, Close, LockOpen, Lock } from '@mui/icons-material';
import FlipMove from 'react-flip-move';
import { useLocation, useNavigate } from 'react-router-dom';
import { listSeries } from '../graphql/queries';
import { UserContext } from '../UserContext';

const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    padding: '0 3px',
    backgroundColor: 'rgba(0, 0, 0, 1)',
    fontWeight: 'bold',
    fontSize: '7pt',
  },
}));

const StyledFab = styled(Fab)(() => ({
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 0
}));

export default function VotingPage() {
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [votingStatus, setVotingStatus] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [userVotesUp, setUserVotesUp] = useState({});
  const [userVotesDown, setUserVotesDown] = useState({});
  const [searchText, setSearchText] = useState('');
  const [upvotes, setUpvotes] = useState({});
  const [downvotes, setDownvotes] = useState({});

  const location = useLocation();

  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    fetchShowsAndVotes();
  }, [user]);

  const fetchShowsAndVotes = async () => {
    setLoading(true);
    try {
      // Recursive function to handle pagination
      const fetchSeries = async (nextToken = null) => {
        const result = await API.graphql({
          ...graphqlOperation(listSeries, { nextToken }), // Pass the nextToken to the listSeries operation
          authMode: 'API_KEY',
        });

        let items = result.data.listSeries.items;

        if (result.data.listSeries.nextToken) {
          items = items.concat(await fetchSeries(result.data.listSeries.nextToken)); // Call fetchSeries recursively if there's a nextToken
        }

        return items;
      };

      // Fetch all series data
      const seriesData = await fetchSeries();

      const voteData = await API.get('publicapi', '/vote/list');
      const sortedShows = seriesData
        .filter((show) => show.statusText === 'requested') // filtering shows based on statusText
        .sort((a, b) => (voteData.votes[b.id] || 0) - (voteData.votes[a.id] || 0));

      sortedShows.forEach((show, index) => {
        show.rank = index + 1; // add a rank to each show
      });

      setShows(sortedShows);
      setVotes(voteData.votes);
      setUserVotes(voteData.userVotes);
      setUserVotesUp(voteData.userVotesUp);
      setUserVotesDown(voteData.userVotesDown);
      setUpvotes(voteData.votesUp);
      setDownvotes(voteData.votesDown);
    } catch (error) {
      console.error('Error fetching series data:', error);
    }
    setLoading(false);
  };

  const handleVote = async (seriesId, boost) => {
    setVotingStatus((prevStatus) => ({ ...prevStatus, [seriesId]: boost }));

    try {
      const result = await API.post('publicapi', '/vote', {
        body: {
          seriesId,
          boost,
        },
      });

      setUserVotes((prevUserVotes) => ({ ...prevUserVotes, [seriesId]: boost }));

      setVotes((prevVotes) => {
        const newVotes = { ...prevVotes };
        newVotes[seriesId] = (newVotes[seriesId] || 0) + boost;

        const sortedShows = [...shows].sort((a, b) => (newVotes[b.id] || 0) - (newVotes[a.id] || 0));
        setShows(sortedShows);

        return newVotes;
      });

      if (boost === 1) {
        setUpvotes((prevUpvotes) => {
          const newUpvotes = { ...prevUpvotes };
          newUpvotes[seriesId] = (newUpvotes[seriesId] || 0) + 1;
          return newUpvotes;
        });
      } else if (boost === -1) {
        setDownvotes((prevDownvotes) => {
          const newDownvotes = { ...prevDownvotes };
          newDownvotes[seriesId] = (newDownvotes[seriesId] || 0) - 1; // subtract 1 for a downvote
          return newDownvotes;
        });
      }

      setVotingStatus((prevStatus) => ({ ...prevStatus, [seriesId]: false }));
    } catch (error) {
      setVotingStatus((prevStatus) => ({ ...prevStatus, [seriesId]: false }));
      console.error('Error on voting:', error);
      console.log(error.response);
    }
  };

  const handleUpvote = (seriesId) => {
    handleVote(seriesId, 1);
  };

  const handleDownvote = (seriesId) => {
    handleVote(seriesId, -1);
  };

  const showImageStyle = {
    maxWidth: '125px',
    maxHeight: '125px',
    objectFit: 'cover',
  };

  const descriptionStyle = {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const filteredShows = shows
    .filter((show) => show.statusText === 'requested')
    .filter((show) => show.name.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Vote for New Shows
        </Typography>
        <Typography variant="subtitle2">
          Help prioritize requests by voting on your favorite shows. Upvote the shows you want to see more, and downvote
          the shows you're not interested in.
        </Typography>
      </Box>
      <Box my={2}>
        <TextField
          fullWidth
          variant="outlined"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search requested shows..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton>
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={() => setSearchText('')} disabled={!searchText}>
                  <Close />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Grid container style={{ minWidth: '100%' }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <FlipMove style={{ minWidth: '100%' }}>
            {filteredShows.map((show, idx) => (
              <Grid item xs={12} key={show.id} style={{ marginBottom: 15 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Box flexGrow={1} marginRight={2}>
                        <Box display="flex" alignItems="center">
                          <Box mr={2}>
                            <Badge
                              badgeContent={`#${show.rank}`}
                              color="secondary"
                              anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                              }}
                            >
                              <img src={show.image} alt={show.name} style={showImageStyle} />
                            </Badge>
                          </Box>
                          <Box>
                            <Typography variant="h5">{show.name}</Typography>
                            <Box display="flex" alignItems="center">
                              <Typography
                                variant="subtitle2"
                                color="success.main"
                                sx={{ fontSize: '0.7rem', opacity: 0.6 }}
                              >
                                <ArrowUpward fontSize="small" sx={{ verticalAlign: 'middle' }} />
                                <b>{upvotes[show.id] || 0}</b>
                              </Typography>
                              <Typography
                                variant="subtitle2"
                                color="error.main"
                                ml={1}
                                sx={{ fontSize: '0.7rem', opacity: 0.6 }}
                              >
                                <ArrowDownward fontSize="small" sx={{ verticalAlign: 'middle' }} />
                                <b>{downvotes[show.id] || 0}</b>
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" mt={1} style={descriptionStyle}>
                              {show.description}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box mr={0}>
                        <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
                          {votingStatus[show.id] === 1 ? (
                            <CircularProgress size={25} sx={{ ml: 1.2, mb: 1.5 }} />
                          ) : (
                            <StyledBadge
                              anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                              }}
                              badgeContent={userVotesUp[show.id] ? `+${userVotesUp[show.id] || 0}` : null}
                              sx={{
                                color: userVotes[show.id] === 1 ? 'success.main' : 'inherit',
                              }}
                            >
                              <StyledFab
                                aria-label="upvote"
                                onClick={() =>
                                  user
                                    ? handleUpvote(show.id)
                                    : navigate(`/login?dest=${encodeURIComponent(location.pathname)}`)
                                }
                                disabled={userVotes[show.id] || votingStatus[show.id]}
                                size="small"
                              >
                                <ArrowUpward sx={{ color: userVotes[show.id] === 1 ? 'success.main' : 'inherit' }} />
                              </StyledFab>
                            </StyledBadge>
                          )}
                        </Box>
                        <Box alignItems="center" height="100%">
                          <Typography variant="h5" textAlign="center">
                            {votes[show.id] || 0}
                          </Typography>
                        </Box>
                        <Box>
                          <StyledBadge
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                            badgeContent={userVotesDown[show.id] || 0}
                            sx={{
                              color: userVotes[show.id] < 0 ? 'error.main' : 'inherit',
                            }}
                          >
                            {votingStatus[show.id] === -1 ? (
                              <CircularProgress size={25} sx={{ ml: 1.3, mt: 1.6 }} />
                            ) : (
                              <StyledFab
                                aria-label="downvote"
                                onClick={() =>
                                  user
                                    ? handleDownvote(show.id)
                                    : navigate(`/login?dest=${encodeURIComponent(location.pathname)}`)
                                }
                                disabled={userVotes[show.id] || votingStatus[show.id]}
                                size="small"
                              >
                                <ArrowDownward sx={{ color: userVotes[show.id] < 0 ? 'error.main' : 'inherit' }} />
                              </StyledFab>
                            )}
                          </StyledBadge>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            <Grid
              item
              xs={12}
              style={{
                marginTop: 75,
                marginBottom: 40,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0 20px',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Looking for one not in the list?
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.open('https://forms.gle/8CETtVbwYoUmxqbi7', '_blank')}
                style={{
                  marginTop: 10,
                  marginBottom: 15,
                }}
              >
                Make a request
              </Button>
            </Grid>
          </FlipMove>
        )}
      </Grid>
    </Container>
  );
}
