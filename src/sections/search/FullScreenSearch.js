// FullScreenSearch.js

import styled from '@emotion/styled';
import { Button, Fab, Grid, Typography, useMediaQuery, Select, MenuItem, Container, ListSubheader, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { Favorite, MapsUgc, Shuffle } from '@mui/icons-material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import useSearchDetails from '../../hooks/useSearchDetails';
import { searchPropTypes } from './SearchPropTypes';
import HomePageBannerAd from '../../ads/HomePageBannerAd';
import useSearchDetailsV2 from '../../hooks/useSearchDetailsV2';
import AddCidPopup from '../../components/ipfs/add-cid-popup';
import FavoriteToggle from '../../components/FavoriteToggle';
import useLoadRandomFrame from '../../utils/loadRandomFrame';
import Logo from '../../logo/logo';
import FixedMobileBannerAd from '../../ads/FixedMobileBannerAd';

/* --------------------------------- GraphQL -------------------------------- */

// Define constants for colors and fonts
const PRIMARY_COLOR = '#4285F4';
const SECONDARY_COLOR = '#0F9D58';
const FONT_FAMILY = 'Roboto, sans-serif';

// Create a search form component
const StyledSearchForm = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 800px;
`;

const StyledSearchSelector = styled.select`
  font-family: ${FONT_FAMILY};
  font-size: 18px;
  color: #333;
  background-color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  height: 50px;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
  appearance: none;
  cursor: pointer;

  &:focus {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    outline: none;
  }
`;

// Create a search button component
const StyledSearchButton = styled(Button)`
  font-family: ${FONT_FAMILY};
  font-size: 18px;
  color: #fff;
  background-color: ${SECONDARY_COLOR};
  border-radius: 8px;
  padding: 10px 12px;
`;

// Create a label component
const StyledLabel = styled.label`
  margin-bottom: 8px;
  color: ${SECONDARY_COLOR};
  font-family: ${FONT_FAMILY};
  font-size: 14px;
`;

// Create a button component
const StyledButton = styled(LoadingButton)`
  font-family: ${FONT_FAMILY};
  font-size: 18px;
  color: #fff;
  background-color: ${SECONDARY_COLOR};
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${PRIMARY_COLOR};
  }
`;

const StyledSearchInput = styled.input`
  font-family: ${FONT_FAMILY};
  font-size: 18px;
  color: #333;
  background-color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
  height: 50px;
  &:focus {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    outline: none;
  }
`;

// Create a footer component
const StyledFooter = styled('footer')`
  bottom: 0;
  left: 0;
  line-height: 0;
  width: 100%;
  position: fixed;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  z-index: 1200;
`;

const StyledLeftFooter = styled('footer')`
  bottom: 0;
  left: 0;
  line-height: 0;
  position: fixed;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  z-index: 1300;
`;

const StyledRightFooter = styled('footer')`
  bottom: 0;
  right: 0;
  line-height: 0;
  position: fixed;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  z-index: 1300;
`;

FullScreenSearch.propTypes = searchPropTypes;

// Create a grid container component
const StyledGridContainer = styled(Grid)`
  min-height: 100vh;
`;

// Theme Defaults
const defaultTitleText = 'memeSRC';
const defaultBragText = 'Search 80 million+ templates';
const defaultFontColor = '#FFFFFF';
const defaultBackground = `linear-gradient(45deg,
  #5461c8 12.5% /* 1*12.5% */,
  #c724b1 0, #c724b1 25%   /* 2*12.5% */,
  #e4002b 0, #e4002b 37.5% /* 3*12.5% */,
  #ff6900 0, #ff6900 50%   /* 4*12.5% */,
  #f6be00 0, #f6be00 62.5% /* 5*12.5% */,
  #97d700 0, #97d700 75%   /* 6*12.5% */,
  #00ab84 0, #00ab84 87.5% /* 7*12.5% */,
  #00a3e0 0)`;

export default function FullScreenSearch({ searchTerm, setSearchTerm, seriesTitle, setSeriesTitle, searchFunction, metadata }) {
  const { savedCids, cid, setCid, setSearchQuery: setCidSearchQuery, setShowObj } = useSearchDetailsV2()
  const [loading, setLoading] = useState(true);
  const { show, setShow, setSearchQuery } = useSearchDetails();
  const isMd = useMediaQuery((theme) => theme.breakpoints.up('sm'));
  const [addNewCidOpen, setAddNewCidOpen] = useState(false);
  const { user, shows, defaultShow, handleUpdateDefaultShow } = useContext(UserContext);
  const { pathname } = useLocation();
  const { loadRandomFrame, loadingRandom, } = useLoadRandomFrame();

  const [showAd, setShowAd] = useState(false);

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  useEffect(() => {
    // Get the current number of homepage loads from localStorage
    let homepageLoads = parseInt(localStorage.getItem('homepageLoads') || '0', 10);

    // Increment the count
    homepageLoads += 1;

    // Save the updated count back to localStorage
    localStorage.setItem('homepageLoads', homepageLoads.toString());

    // Show the ad if the count is greater than 2
    setShowAd(homepageLoads > 2);
  }, []); // Empty dependency array ensures this runs only once on component mount

  // Scroll to top when arriving at this page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  // Theme States
  const theme = useTheme();
  const [currentThemeBragText, setCurrentThemeBragText] = useState(metadata?.frameCount ? `Search over ${metadata?.frameCount.toLocaleString('en-US')} meme templates from ${metadata?.title}` : defaultBragText);
  const [currentThemeTitleText, setCurrentThemeTitleText] = useState(metadata?.title || defaultTitleText);
  const [currentThemeFontFamily, setCurrentThemeFontFamily] = useState(metadata?.fontFamily || theme?.typography?.fontFamily);
  const [currentThemeFontColor, setCurrentThemeFontColor] = useState(metadata?.colorSecondary || defaultFontColor);
  const [currentThemeBackground, setCurrentThemeBackground] = useState(metadata?.colorMain ? { backgroundColor: `${metadata?.colorMain}` }
    :
    {
      backgroundImage: defaultBackground,
    }
  );

  const { seriesId } = useParams();

  const navigate = useNavigate();

  // The handleChangeSeries function now only handles theme updates
  const handleChangeSeries = useCallback((newSeriesTitle) => {
    const selectedSeriesProperties = shows.find((object) => object.id === newSeriesTitle) || savedCids.find((object) => object.id === newSeriesTitle);
    if (!selectedSeriesProperties) {
      navigate('/')
    }
  }, [shows, savedCids]);

  // This useEffect handles the data fetching
  useEffect(() => {
    async function getData() {
      setLoading(false);
    }
    getData();
  }, []);

  // This useEffect ensures the theme is applied based on the seriesId once the data is loaded
  useEffect(() => {
    // Check if shows have been loaded
    // console.log(defaultShow)
    if (shows.length > 0) {
      // Determine the series to use based on the URL or default to '_universal'
      const currentSeriesId = seriesId || (shows.some(show => show.isFavorite) ? defaultShow : '_universal');
      // console.log(seriesId || shows.some(show => show.isFavorite) ? defaultShow : '_universal')
      setShow(currentSeriesId)

      if (currentSeriesId !== seriesTitle) {
        setSeriesTitle(currentSeriesId); // Update the series title based on the URL parameter
        handleChangeSeries(currentSeriesId); // Update the theme

        // Navigation logic
        navigate((currentSeriesId === '_universal') ? '/' : `/${currentSeriesId}`);
      }
    }
  }, [seriesId, seriesTitle, shows, handleChangeSeries, navigate, defaultShow]);

  useEffect(() => {
    if (pathname === '/_favorites') {
      setCurrentThemeBragText(defaultBragText)
      setCurrentThemeTitleText(defaultTitleText)
      setCurrentThemeFontColor(defaultFontColor)
      setCurrentThemeFontFamily(theme?.typography?.fontFamily)
      setCurrentThemeBackground({
        backgroundImage: defaultBackground,
      })
    }
  }, [pathname])


  useEffect(() => {
    const handleScroll = () => {
      // Find the height of the entire document
      const { body } = document;
      const html = document.documentElement;
      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );

      // Calculate how far from bottom the scroll down button should start fading out
      const scrollBottom = height - window.innerHeight - window.scrollY - 300;

      window.requestAnimationFrame(() => {
        const scrollDownBtn = document.getElementById('scroll-down-btn');

        // Fade out scroll down button towards bottom of the screen
        const op = scrollBottom / 100;
        scrollDownBtn.style.opacity = `${Math.min(Math.max(op, 0.0), 1)}`;

        // Hide scroll down button container once it's reached the bottom of the screen
        if (scrollBottom <= 0) {
          scrollDownBtn.parentElement.style.display = 'none';
        } else {
          scrollDownBtn.parentElement.style.display = 'flex';
        }

        // Change the background color of the scroll down button
        const windowHeight = window.innerHeight / 2;
        const scrollAmount = 1 - window.scrollY / windowHeight;
        const scrollRGB = Math.round(scrollAmount * 255);
        if (scrollRGB >= 0 && scrollRGB <= 255) {
          scrollDownBtn.style.backgroundColor = `rgb(${scrollRGB}, ${scrollRGB}, ${scrollRGB}, 0.50)`;
        }

        // Handle the fade in and out of the bottom buttons
        const bottomButtons = document.querySelectorAll('.bottomBtn');
        bottomButtons.forEach((elm) => {
          if (scrollAmount < 0) {
            elm.style.display = 'none';
          } else {
            if (elm.style.display !== 'flex') {
              elm.style.display = 'flex';
            }
            elm.style.opacity = scrollAmount;
          }
        });
      });
    };

    // Add event listener
    document.addEventListener('scroll', handleScroll);

    // Return a cleanup function to remove the event listener
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const searchCid = (e) => {
    e.preventDefault()
    setCidSearchQuery(searchTerm)
    navigate(`/search/${cid}/${encodeURIComponent(searchTerm)}`)
    return false
  }

  useEffect(() => {

    setCid(seriesId || metadata?.id || (shows.some(show => show.isFavorite) ? defaultShow : '_universal'))

    return () => {
      if (pathname === '/') {
        setShowObj(null)
        setSearchQuery(null)
        setCidSearchQuery('')
      }
    }
  }, [pathname, defaultShow]);

  return (
    <>
      <StyledGridContainer container paddingX={3} sx={currentThemeBackground}>
        <Grid container marginY="auto" justifyContent="center" pb={isMd ? 0 : 8}>
          <Grid container justifyContent="center">
            <Grid item textAlign="center" marginBottom={2}>
              <Box onClick={() => handleChangeSeries(window.localStorage.getItem(`defaultsearch${user?.sub}`) || '_universal')}>
                <Box
                  component="img"
                  src={Logo({ color: currentThemeFontColor || 'white' })}
                  sx={{ objectFit: 'contain', cursor: 'pointer', display: 'block', width: '130px', height: 'auto', margin: '-10px auto 0px', color: 'yellow' }}
                />
              </Box>
              <Typography
                component="h1"
                variant="h1"
                fontSize={34}
                fontFamily={currentThemeFontFamily}
                sx={{ 
                  color: currentThemeFontColor, 
                  textShadow: '1px 1px 1px rgba(0, 0, 0, 0.20);', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                }}
              >
                {cid && cid !== '_universal' && cid !== '_favorites' && shows.length > 0 ? (
                  <Box sx={{ marginRight: 1 }}>
                    <FavoriteToggle
                      indexId={cid}
                      initialIsFavorite={shows.find(show => show.id === cid)?.isFavorite || false}
                    />
                  </Box>
                ) : (
                  <Box sx={{ marginX: 1, width: '36px' }} />
                )}
                {`${currentThemeTitleText} ${currentThemeTitleText === 'memeSRC' ? (user?.userDetails?.magicSubscription === 'true' ? 'Pro' : '') : ''}`}
                <Box sx={{ marginX: 1, width: '36px' }} /> {/* Invisible spacer on the right */}
              </Typography>
            </Grid>
          </Grid>
          <StyledSearchForm onSubmit={(e) => searchFunction(e)}>
            <Grid container justifyContent="center">
              <Grid item sm={3.5} xs={12} paddingX={0.25} paddingBottom={{ xs: 1, sm: 0 }}>
                <Select
                  value={cid || seriesTitle || (shows.some(show => show.isFavorite) ? defaultShow : '_universal')}
                  onChange={(e) => {
                    const selectedId = e.target.value;

                    if (selectedId === 'addNewCid') {
                      setAddNewCidOpen(true);
                    } else if (selectedId === 'editFavorites') {
                      navigate('/favorites'); // Navigate to the favorites editing page
                    } else {
                      const newSeriesTitle = e.target.value;
                      setCid(selectedId || '_universal');
                      setSeriesTitle(newSeriesTitle);
                      handleChangeSeries(newSeriesTitle);
                      if (newSeriesTitle === '_universal' || newSeriesTitle === '_favorites') {
                        handleUpdateDefaultShow(newSeriesTitle)
                      }
                      navigate((newSeriesTitle === '_universal') ? '/' : `/${newSeriesTitle}`);
                    }
                  }}
                  displayEmpty
                  inputProps={{ 'aria-label': 'series selection' }}
                  sx={{
                    fontFamily: FONT_FAMILY,
                    fontSize: '16px',
                    color: '#333',
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    height: '50px',
                    width: '100%',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'box-shadow 0.3s',
                    '&:focus': {
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      outline: 'none',
                    },
                  }}
                >
                  <MenuItem value="_universal">🌈 All Shows & Movies</MenuItem>

                  {shows.some(show => show.isFavorite) ? (
                    <MenuItem value="_favorites">⭐ All Favorites</MenuItem>
                  ) : null}

                  {/* Check if user is subscribed or has favorites and directly render each item */}
                  {shows.some(show => show.isFavorite) ? (
                    <ListSubheader key="favorites-subheader">Favorites</ListSubheader>
                  ) : null}

                  {shows.some(show => show.isFavorite) ? (
                    shows.filter(show => show.isFavorite).map(show => (
                      <MenuItem key={show.id} value={show.id}>
                        ⭐ {show.emoji} {show.title}
                      </MenuItem>
                    ))
                  ) : null}

                  {user?.userDetails?.subscriptionStatus === 'active' || shows.some(show => show.isFavorite) ? (
                    <MenuItem value="editFavorites" style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                      ⚙ Edit Favorites
                    </MenuItem>
                  ) : null}

                  {user?.userDetails?.subscriptionStatus === 'active' || shows.some(show => show.isFavorite) ? (
                    <ListSubheader key="other-subheader">Other</ListSubheader>
                  ) : null}

                  {shows.filter(show => !show.isFavorite).map(show => (
                    <MenuItem key={show.id} value={show.id}>
                      {show.emoji} {show.title}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item sm={7} xs={12} paddingX={0.25} paddingBottom={{ xs: 1, sm: 0 }}>
                <StyledLabel htmlFor="search-term">
                  <StyledSearchInput
                    type="text"
                    id="search-term"
                    value={searchTerm}
                    placeholder="What's the quote?"
                    onChange={(e) => {
                      let value = e.target.value;

                      // Replace curly single quotes with straight single quotes
                      value = value.replace(/[\u2018\u2019]/g, "'");

                      // Replace curly double quotes with straight double quotes
                      value = value.replace(/[\u201C\u201D]/g, '"');

                      // Replace en-dash and em-dash with hyphen
                      value = value.replace(/[\u2013\u2014]/g, '-');

                      setSearchTerm(value);
                    }}
                  />
                </StyledLabel>
              </Grid>
              <Grid item sm={1.5} xs={12} paddingX={0.25} paddingBottom={{ xs: 1, sm: 0 }}>
                <StyledSearchButton
                  type="submit"
                  style={{ backgroundColor: 'black' }}
                  fullWidth={window.innerWidth <= 600}
                >
                  Search
                </StyledSearchButton>
              </Grid>
            </Grid>
          </StyledSearchForm>
          <Grid item xs={12} textAlign="center" color={currentThemeFontColor} marginBottom={2} marginTop={1}>
            <Typography component="h4" variant="h4">
              {currentThemeBragText}
            </Typography>
          </Grid>
          {user?.userDetails?.subscriptionStatus !== 'active' && showAd &&
            <Grid item xs={12} mt={1}>
              <center>
                <Box >
                  {isMobile ? <FixedMobileBannerAd /> : <HomePageBannerAd />}
                  <Link to="/pro" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" textAlign="center" color="white" sx={{ marginTop: 1 }}>
                      ☝️ Remove ads with <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>memeSRC Pro</span>
                    </Typography>
                  </Link>
                </Box>
              </center>
            </Grid>
          }
        </Grid>
        <StyledLeftFooter className="bottomBtn">
          <a
            href="https://forms.gle/8CETtVbwYoUmxqbi7"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'white', textDecoration: 'none' }}
          >
            <Fab
              color="primary"
              aria-label="feedback"
              style={{ margin: '0 10px 0 0', backgroundColor: 'black', zIndex: '1300' }}
              size="medium"
            >
              <MapsUgc color="white" />
            </Fab>
          </a>
          <a
            href="https://memesrc.com/donate"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'white', textDecoration: 'none' }}
          >
            <Fab color="primary" aria-label="donate" style={{ backgroundColor: 'black', zIndex: '1300' }} size="medium">
              <Favorite />
            </Fab>
          </a>
        </StyledLeftFooter>
        <StyledRightFooter className="bottomBtn">
          <StyledButton
            onClick={() => { loadRandomFrame(show) }}
            loading={loadingRandom}
            startIcon={<Shuffle />}
            variant="contained"
            style={{ backgroundColor: 'black', marginLeft: 'auto', zIndex: '1300' }}
          >
            Random
          </StyledButton>
        </StyledRightFooter>
      </StyledGridContainer>
      <AddCidPopup open={addNewCidOpen} setOpen={setAddNewCidOpen} />
    </>
  );
}
