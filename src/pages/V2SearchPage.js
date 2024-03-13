import React, { useState, useEffect, useRef } from 'react';
import { Grid, CircularProgress, Card, Chip, Typography, Button, Collapse, IconButton, FormControlLabel, Switch } from '@mui/material';
import styled from '@emotion/styled';
import { API } from 'aws-amplify';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import JSZip from 'jszip';
import { ReportProblem, Settings } from '@mui/icons-material';
import InfiniteScroll from 'react-infinite-scroll-component';
import useSearchDetails from '../hooks/useSearchDetails';
import IpfsSearchBar from '../sections/search/ipfs-search-bar';
import useSearchDetailsV2 from '../hooks/useSearchDetailsV2';
import getV2Metadata from '../utils/getV2Metadata';

const StyledCard = styled(Card)`
  border: 3px solid transparent;
  box-sizing: border-box;
  position: relative;

  &:hover {
    border: 3px solid orange;
  }
`;

const StyledCardVideoContainer = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  overflow: hidden;
  position: relative;
  background-color: black;
`;

const StyledCardImageContainer = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  overflow: hidden;
  position: relative;
  background-color: black;
`;

const StyledCardImage = styled.img`
  width: 100%;
  height: 100%;
  position: absolute;
  object-fit: contain;
`;

const StyledCardMedia = styled.video`
  width: 100%;
  height: 100%;
  position: absolute;
  object-fit: contain;
`;

const BottomCardCaption = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  ${props => props.theme.breakpoints.up("xs")} {
    font-size: clamp(1em, 1.5vw, 1.5em);
    }
  ${props => props.theme.breakpoints.up("md")} {
  font-size: clamp(1em, 1.5vw, 1.5em);
  }
  font-weight: 800;
  padding: 18px 10px;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
`;

const BottomCardLabel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${props => props.theme.palette.common.white};
  text-align: left;
`;

const UpgradedIndexBanner = styled.div`
  background-image: url('https://api-prod-minimal-v510.vercel.app/assets/images/cover/cover_3.jpg');
  background-size: cover;
  background-position: center;
  padding: ${props => props.show ? '40px 20px' : '10px'};
  text-align: center;
  position: relative;
  border-radius: 8px;
  margin: 0 20px 20px 20px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${props => props.show ? '200px' : '50px'};
  transition: all 0.3s ease-in-out;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
  }
`;

const UpgradedIndexText = styled(Typography)`
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #fff;
  position: relative;
  z-index: 1;
`;

const UpgradedIndexSubtext = styled(Typography)`
  font-size: 16px;
  font-weight: 600;
  color: #E2e2e3;
  position: relative;
  z-index: 1;
  margin-bottom: 10px;
  margin-left: 10px;
  margin-right: 10px;

  a {
    color: #f0f0f0;
    text-decoration: underline;

    &:hover {
      color: #fff;
    }
  }
`;

const MinimizedBanner = styled.div`
  background-image: url('https://api-prod-minimal-v510.vercel.app/assets/images/cover/cover_3.jpg');
  background-size: cover;
  background-position: center;
  padding: 10px;
  text-align: center;
  position: relative;
  border-radius: 8px;
  margin: 0 20px 20px 20px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50px;
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
  }
`;

const MinimizedBannerText = styled(Typography)`
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  position: relative;
  z-index: 1;
`;

export default function SearchPage() {
  const params = useParams();

  const RESULTS_PER_PAGE = 8;

  const [loadingCsv, setLoadingCsv] = useState(false);

  // ===== Upgraded Index Banner States ===== 
  const [isBannerMinimized, setIsBannerMinimized] = useState(
    localStorage.getItem(`dismissedBanner`) === 'true' || false
  );

  const [animationsEnabled, setAnimationsEnabled] = useState(
    localStorage.getItem('animationsEnabled') === 'true' || false
  );
  // ===== ===== ===== ===== ===== ===== ===== 
  
  const [isLoading, setIsLoading] = useState(false);
  const [displayedResults, setDisplayedResults] = useState(RESULTS_PER_PAGE / 2);
  const [newResults, setNewResults] = useState();
  const { showObj, setShowObj, cid } = useSearchDetailsV2();
  const [loadingResults, setLoadingResults] = useState(true);
  const [videoUrls, setVideoUrls] = useState({});
  const [showBanner, setShowBanner] = useState(!isBannerMinimized);

  const [autoplay, setAutoplay] = useState(true);

  const videoRefs = useRef([]);

  const addVideoRef = (element) => {
    if (element && !videoRefs.current.includes(element)) {
      videoRefs.current.push(element);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (autoplay) {
              entry.target.play();
            }
          } else {
            entry.target.pause();
          }
        });
      },
      {
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    videoRefs.current.forEach(video => observer.observe(video));

    return () => {
      videoRefs.current.forEach(video => observer.unobserve(video));
    };
  }, [newResults, autoplay]);

  const checkBannerDismissed = () => {
    const dismissedBanner = localStorage.getItem(`dismissedBanner`);
    if (dismissedBanner === 'true') {
      setIsBannerMinimized(true);
      setShowBanner(false);
    } else {
      setIsBannerMinimized(false);
      setShowBanner(true);
    }
  };

  useEffect(() => {

    async function initialize(cid = null) {
      const selectedCid = cid;
      if (!selectedCid) {
        alert("Please enter a valid CID.");
        return;
      }
        setLoadingCsv(false);
        setShowObj([]);

        checkBannerDismissed(selectedCid);
    }

    getV2Metadata(params.cid).then(metadata => {
      initialize(metadata.id);
    }).catch(error => {
      alert(error)
    })
  }, []);

  useEffect(() => {
    if (cid) {
      checkBannerDismissed(cid);
    }
  }, [cid]);

  useEffect(() => {
    if (newResults) {
      newResults.forEach((result) => loadVideoUrl(result, cid));
    }
  }, [animationsEnabled, newResults, cid]);

  const loadVideoUrl = async (result, metadataCid) => {
    const thumbnailUrl = animationsEnabled
      ? `https://v2.memesrc.com/thumbnail/${metadataCid}/${result.season}/${result.episode}/${result.subtitle_index}`
      : `https://v2.memesrc.com/frame/${metadataCid}/${result.season}/${result.episode}/${Math.round((parseInt(result.start_frame, 10) + parseInt(result.end_frame, 10)) / 2)}`;
    const resultId = `${result.season}-${result.episode}-${result.subtitle_index}`;
    setVideoUrls((prevVideoUrls) => ({ ...prevVideoUrls, [resultId]: thumbnailUrl }));
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const resultIndex = entry.target.getAttribute("data-result-index");
            const result = newResults[resultIndex];
            const resultId = `${result.season}-${result.episode}-${result.subtitle_index}`;
            if (resultIndex && !videoUrls[resultId]) {
              loadVideoUrl(result, cid);
            }
          }
        });
      },
      {
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    const resultElements = document.querySelectorAll(".result-item");
    resultElements.forEach((element) => observer.observe(element));

    return () => {
      resultElements.forEach((element) => observer.unobserve(element));
    };
  }, [newResults, videoUrls, cid]);

  useEffect(() => {
    async function searchText() {
      setNewResults(null);
      setLoadingResults(true);
      setDisplayedResults(RESULTS_PER_PAGE / 2);
      const searchTerm = params?.searchTerms.trim().toLowerCase();
      if (searchTerm === "") {
        console.log("Search term is empty.");
        return;
      }
  
      try {
        const response = await fetch(`https://v2.memesrc.com/search/${cid}/${searchTerm}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const results = await response.json();
        setNewResults(results);
        setLoadingResults(false);
        results.forEach((result) => loadVideoUrl(result, cid));
      } catch (error) {
        console.error("Error searching:", error);
        setLoadingResults(false);
      }
    }
  
    if (!loadingCsv && showObj) {
      if (params?.searchTerms) {
        searchText();
      } else {
        setLoadingResults(false);
        setNewResults([]);
      }
    }
  }, [loadingCsv, showObj, params?.searchTerms, cid]);

  useEffect(() => {
    console.log(newResults);
  }, [newResults]);

  const ReportProblemButton = styled(IconButton)`
    top: 10px;
    right: 10px;
    color: #fff;
    z-index: 1;
  `;

  return (
    <>
      <Collapse in={showBanner}>
        <UpgradedIndexBanner show={showBanner}>
          {showBanner && (
            <>
              <UpgradedIndexText>Upgraded!</UpgradedIndexText>
              <UpgradedIndexSubtext>
                You're testing '{cid}' on the new data model.{' '}
                <a href="https://forms.gle/8CETtVbwYoUmxqbi7" target="_blank" rel="noopener noreferrer">
                  Report&nbsp;a&nbsp;problem
                </a>
                .
              </UpgradedIndexSubtext>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    const newAnimationsEnabled = !animationsEnabled;
                    setAnimationsEnabled(newAnimationsEnabled);
                    localStorage.setItem('animationsEnabled', newAnimationsEnabled.toString());
                  }}
                  style={{
                    marginTop: '15px',
                    borderRadius: '20px',
                    padding: '6px 16px',
                    backgroundColor: '#fff',
                    color: '#000',
                    position: 'relative',
                    zIndex: 1,
                    '&:hover': {
                      backgroundColor: '#eee',
                    },
                  }}
                >
                  {animationsEnabled ? 'Disable Animations' : 'Enable Animations'}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setIsBannerMinimized(true);
                    setShowBanner(false);
                    localStorage.setItem(`dismissedBanner`, 'true');
                  }}
                  style={{
                    marginTop: '15px',
                    borderRadius: '20px',
                    padding: '6px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    color: '#000',
                    position: 'relative',
                    zIndex: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    },
                  }}
                >
                  Minimize
                </Button>
              </div>
            </>
          )}
        </UpgradedIndexBanner>
      </Collapse>
      {!showBanner && (
        <MinimizedBanner
          onClick={() => {
            setShowBanner(true);
            setIsBannerMinimized(false);
            localStorage.removeItem(`dismissedBanner`);
          }}
        >
          <MinimizedBannerText style={{ fontWeight: 'bold' }}>You're testing the V2 data model!</MinimizedBannerText>
          <MinimizedBannerText
            style={{
              textDecoration: 'underline',
              fontWeight: 'normal',
              marginLeft: '10px',
            }}
          >
            Settings
          </MinimizedBannerText>
        </MinimizedBanner>
      )}
      {newResults && newResults.length > 0 ? (
        <InfiniteScroll
          dataLength={displayedResults}
          next={() => {
            if (!isLoading) {
              setIsLoading(true);
              setTimeout(() => {
                setDisplayedResults((prevDisplayedResults) =>
                  Math.min(prevDisplayedResults + RESULTS_PER_PAGE, newResults.length)
                );
                setIsLoading(false);
              }, 1000);
            }
          }}
          hasMore={displayedResults < newResults.length}
          loader={
            <Grid item xs={12} textAlign="center" mt={4}>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  padding: '10px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  maxWidth: { xs: '90%', sm: '40%', md: '25%' },
                  margin: '0 auto',
                  px: 3,
                  py: 1.5,
                  mt: 10,
                  mb: 10,
                }}
                onClick={() => setDisplayedResults(displayedResults + RESULTS_PER_PAGE * 2)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={24} style={{ marginRight: '8px' }} />
                    Loading More
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </Grid>
          }
          scrollThreshold={0.95}
        >
          <Grid container spacing={2} alignItems="stretch" paddingX={{ xs: 2, md: 6 }}>
            {newResults.slice(0, displayedResults).map((result, index) => (
              <Grid item xs={12} sm={6} md={3} key={index} className="result-item" data-result-index={index}>
                <Link
                  to={`/v2/frame/${cid}/${result.season}/${result.episode}/${Math.round(
                    (parseInt(result.start_frame, 10) + parseInt(result.end_frame, 10)) / 2
                  )}`}
                  style={{ textDecoration: 'none' }}
                >
                  <StyledCard>
                    {animationsEnabled ? (
                      <StyledCardVideoContainer>
                        {videoUrls[`${result.season}-${result.episode}-${result.subtitle_index}`] && (
                          <StyledCardMedia
                            ref={addVideoRef}
                            src={videoUrls[`${result.season}-${result.episode}-${result.subtitle_index}`]}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                            onError={(e) => console.error('Error loading video:', JSON.stringify(result))}
                            key={`${result.season}-${result.episode}-${result.subtitle_index}-video`}
                          />
                        )}
                      </StyledCardVideoContainer>
                    ) : (
                      <StyledCardImageContainer>
                        {videoUrls[`${result.season}-${result.episode}-${result.subtitle_index}`] && (
                          <StyledCardImage
                            src={videoUrls[`${result.season}-${result.episode}-${result.subtitle_index}`]}
                            alt={`Frame from S${result.season} E${result.episode}`}
                            key={`${result.season}-${result.episode}-${result.subtitle_index}-image`}
                          />
                        )}
                      </StyledCardImageContainer>
                    )}
                    <BottomCardCaption>{result.subtitle_text}</BottomCardCaption>
                    <BottomCardLabel>
                      <Chip
                        size="small"
                        label={`S${result.season} E${result.episode}`}
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', color: 'white', fontWeight: 'bold' }}
                      />
                    </BottomCardLabel>
                  </StyledCard>
                </Link>
              </Grid>
            ))}
          </Grid>
        </InfiniteScroll>
      ) : (
        <>
          {newResults?.length <= 0 && !loadingResults && (
            <Typography textAlign="center" fontSize={30} fontWeight={700} my={8}>
              No Results
            </Typography>
          )}
        </>
      )}
    </>
  );
}
