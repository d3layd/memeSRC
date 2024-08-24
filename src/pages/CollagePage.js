import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Fab,
  useMediaQuery,
  Menu,
  MenuItem,
  Grid,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { styled } from "@mui/system";
import { Delete, Add, ArrowBack, ArrowForward, ExpandMore, Close, Edit, ArrowUpward, ArrowDownward, Save } from "@mui/icons-material";
import { useNavigate, useLocation } from 'react-router-dom'; 
import { LoadingButton } from "@mui/lab";
import BasePage from "./BasePage";
import { UserContext } from "../UserContext";
import { useSubscribeDialog } from "../contexts/useSubscribeDialog";

const CollageContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: "32px",
});

const CollageImage = styled("img")({
  maxWidth: "100%",
  height: "auto",
  marginBottom: "24px",
});

const ImageContainer = styled(Box)({
  position: "relative",
  marginBottom: "16px",
  "&:hover .delete-button, &:active .delete-button, &:hover .edit-button, &:active .edit-button, &:hover .move-up-button, &:active .move-up-button, &:hover .move-down-button, &:active .move-down-button": {
    display: "flex",
  },
});

const ImageWrapper = styled(Box)({
  position: "relative",
  width: "350px",
  margin: "auto",
});

const UploadButton = styled(Fab)({
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1,
});

const EditButton = styled(IconButton)({
  position: "absolute",
  top: "8px",
  right: "48px",
  zIndex: 1,
  backgroundColor: "white",
  color: "blue",
  border: "2px solid blue",
  padding: "4px",
  display: "none",
  '&:hover': {
    backgroundColor: "#e6e6ff",
  },
});

const DeleteButton = styled(IconButton)({
  position: "absolute",
  top: "8px",
  right: "8px",
  zIndex: 1,
  backgroundColor: "white",
  color: "red",
  border: "2px solid red",
  padding: "4px",
  display: "none",
  '&:hover': {
    backgroundColor: "#ffe6e6",
  },
});

const MoveUpButton = styled(IconButton)({
  position: "absolute",
  top: "48px",
  right: "48px",
  zIndex: 1,
  backgroundColor: "white",
  color: "green",
  border: "2px solid green",
  padding: "4px",
  display: "none",
  '&:hover': {
    backgroundColor: "#e6ffe6",
  },
});

const MoveDownButton = styled(IconButton)({
  position: "absolute",
  top: "48px",
  right: "8px",
  zIndex: 1,
  backgroundColor: "white",
  color: "orange",
  border: "2px solid orange",
  padding: "4px",
  display: "none",
  '&:hover': {
    backgroundColor: "#fff2e6",
  },
});

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "300px",
  border: `2px dashed #ccc`,
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center",
  marginBottom: "32px",
  cursor: "pointer",
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ResultContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const ResultOptionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
  marginBottom: theme.spacing(4),
}));

const OptionGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const ThumbnailContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const CollageThumbnail = styled('img')(({ theme }) => ({
  maxWidth: '300px',
  maxHeight: '300px',
  objectFit: 'contain',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const BorderThicknessControl = styled(FormControl)(({ theme }) => ({
  minWidth: 120,
  marginBottom: theme.spacing(2),
}));

const StepperContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(4),
}));

const StepButton = styled(Button)(({ theme }) => ({
  color: 'white',
  backgroundColor: theme.palette.grey[800],
  '&:hover': {
    backgroundColor: theme.palette.grey[700],
  },
}));

const StepContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  maxWidth: '800px',
  margin: '0 auto',
  padding: theme.spacing(3),
}));

export default function CollagePage() {
  const [images, setImages] = useState([]);
  const [borderThickness, setBorderThickness] = useState(15);
  const [collageBlob, setCollageBlob] = useState(null);
  const [editMode, setEditMode] = useState(true);
  const [accordionExpanded, setAccordionExpanded] = useState(false);
  const canvasRef = useRef(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuIndex, setMenuIndex] = useState(null);
  const imageRefs = useRef([]);
  const imagesOnly = true; // Set this to true to use images as default option

  const { user } = useContext(UserContext);
  const { openSubscriptionDialog } = useSubscribeDialog();

  const navigate = useNavigate();

  const authorized = (user?.userDetails?.magicSubscription === "true" || user?.['cognito:groups']?.includes('admins'));

  useEffect(() => {
    createCollage();
  }, [images, borderThickness]);

  const location = useLocation();

  useEffect(() => {
    const storedCollageState = localStorage.getItem('collageState');
    if (storedCollageState) {
      const parsedCollageState = JSON.parse(storedCollageState);
      setImages(parsedCollageState.images);
      setBorderThickness(parsedCollageState.borderThickness);
      setEditMode(parsedCollageState.editMode);
      setAccordionExpanded(parsedCollageState.accordionExpanded);
      localStorage.removeItem('collageState');
    }

    if (location.state?.updatedCollageState) {
      const { images, borderThickness, editMode, accordionExpanded } = location.state.updatedCollageState;
      setImages(images);
      setBorderThickness(borderThickness);
      setEditMode(editMode);
      setAccordionExpanded(accordionExpanded);
    }
  }, [location.state]);

  const handleImageUpload = (event, index) => {
    const uploadedImages = Array.from(event.target.files);
  
    const loadImage = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            resolve({
              id: Date.now().toString(),
              src: e.target.result,
              width: img.width,
              height: img.height,
            });
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    };
  
    Promise.all(uploadedImages.map(loadImage)).then((newImages) => {
      setImages((prevImages) => {
        const updatedImages = [...prevImages];
        updatedImages.splice(index, 0, ...newImages);
        return updatedImages;
      });
    });
  };

  const handleEditImage = (index) => {
    const collageState = {
      images,
      editingImageIndex: index,
      borderThickness,
      editMode,
      accordionExpanded,
    };
    localStorage.setItem('collageState', JSON.stringify(collageState));
    navigate(`/editor/project/new`, { state: { collageState } });
  };

  const addTextArea = (index) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const text = "My reaction to the collage editor";
    const fontSize = 24;
    const padding = 20;

    ctx.font = `${fontSize}px Arial`;
    const textWidth = ctx.measureText(text).width;

    canvas.width = textWidth + padding * 2;
    canvas.height = fontSize + padding * 2;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillText(text, padding, fontSize + padding);

    const newImage = {
      id: Date.now().toString(),
      src: canvas.toDataURL(),
      width: canvas.width,
      height: canvas.height,
    };

    setImages((prevImages) => {
      const newImages = [...prevImages];
      newImages.splice(index, 0, newImage);
      return newImages;
    });
  };

  const deleteImage = (index) => {
    setImages((prevImages) => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
  };
  
  const moveImage = (index, direction) => {
    setImages((prevImages) => {
      const newImages = [...prevImages];
      if (index + direction < 0 || index + direction >= newImages.length) {
        return newImages; // Return the original array if the move is out of bounds
      }
      const temp = newImages[index];
      newImages[index] = newImages[index + direction];
      newImages[index + direction] = temp;
      return newImages;
    });
  };

  const createCollage = () => {
    if (images.length === 0) return;
  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  
    const maxWidth = 1000; // Set a maximum width for the collage
    let totalHeight = 0;
  
    const resizedImages = images.map((image) => {
      const scaleFactor = maxWidth / image.width;
      const scaledHeight = image.height * scaleFactor;
      totalHeight += scaledHeight;
      return {
        src: image.src,
        width: maxWidth,
        height: scaledHeight,
      };
    });
  
    totalHeight += borderThickness * (resizedImages.length + 1);
    canvas.width = maxWidth + borderThickness * 2;
    canvas.height = totalHeight;
  
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    let currentHeight = borderThickness;
    resizedImages.forEach((image, index) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, borderThickness, currentHeight, image.width, image.height);
        currentHeight += image.height + borderThickness;
  
        if (index === resizedImages.length - 1) {
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            setCollageBlob(url);
          }, "image/png");
        }
      };
      img.src = image.src;
    });
  };

  const handleMenuClick = (event, index) => {
    if (imagesOnly) {
      document.getElementById(`file-input-${index}`).click();
    } else {
      setAnchorEl(event.currentTarget);
      setMenuIndex(index);
    }
  };

  const handleMenuClose = (action) => {
    setAnchorEl(null);
    if (action === "image") {
      document.getElementById(`file-input-${menuIndex}`).click();
    } else if (action === "text") {
      addTextArea(menuIndex);
    }
  };

  const calculateButtonPositions = useCallback(() => {
    const positions = [];
    imageRefs.current.forEach((ref, index) => {
      if (ref) {
        const { top, height } = ref.getBoundingClientRect();
        positions[index] = top + height / 2;
      }
    });
    return positions;
  }, [images]);

  const buttonPositions = calculateButtonPositions();

  const handleBorderChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setBorderThickness(value);
    setAccordionExpanded(false); // Collapse the accordion
  };

  const [openSaveDialog, setOpenSaveDialog] = useState(false);

  const handleOpenInEditor = () => {
    // Create the resulting image blob
    const resultImage = canvasRef.current.toDataURL({
      format: 'jpeg',
      quality: 0.8
    });

    fetch(resultImage)
      .then(res => res.blob())
      .then(blob => {
        const uploadedImage = URL.createObjectURL(blob);
        navigate('/editor/project/new', { 
          state: { 
            uploadedImage,
            fromCollage: true
          } 
        });
      });
  };

  const handleSave = () => {
    setOpenSaveDialog(true);
  };

  const handleCloseSaveDialog = () => {
    setOpenSaveDialog(false);
  };

  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Add Images', 'Adjust Collage', 'Save or Edit'];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    if (activeStep === 0) {
      createCollage();
      setEditMode(false);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    if (activeStep === 1) {
      setEditMode(true);
    }
  };

  return (
    <BasePage
      pageTitle="Create a collage"
      breadcrumbLinks={[
        { name: "Edit", path: "/edit" },
        { name: "Collage Tool" },
      ]}
    >
      <Helmet>
        <title>Collage Tool - Editor - memeSRC</title>
      </Helmet>

      {!authorized ? (
        <Grid container height="100%" justifyContent="center" alignItems="center" mt={6}>
          <Grid item>
            <Stack spacing={3} justifyContent="center">
              <img
                src="/assets/memeSRC-white.svg"
                alt="memeSRC logo"
                style={{ height: 48, marginBottom: -15 }}
              />
              <Typography variant="h3" textAlign="center">
                memeSRC&nbsp;Collage Tool
              </Typography>
              <Typography variant="body" textAlign="center">
                While in Early Access, the Collage Tool is only available for memeSRC&nbsp;Pro subscribers.
              </Typography>
            </Stack>
            <center>
                <LoadingButton
                  onClick={openSubscriptionDialog}
                  variant="contained"
                  size="large"
                  sx={{ mt: 5, fontSize: 17 }}
                >
                  Upgrade to Pro
                </LoadingButton>
              </center>
          </Grid>
        </Grid>
      ) : (
        <>
          <StepperContainer>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </StepperContainer>

          {activeStep === 0 && (
            <StepContainer>
              <Typography variant="h4" gutterBottom>
                Add Images to Your Collage
              </Typography>
              <Typography variant="body1" marginBottom={2} textAlign="center">
                Upload images or add text to create your collage. You can rearrange them later.
              </Typography>
              {images.length > 0 && (
                <StepButton
                  variant="contained"
                  startIcon={<ArrowForward />}
                  onClick={handleNext}
                  fullWidth
                  size="large"
                >
                  Continue to Adjust Collage
                </StepButton>
              )}
              {images.length === 0 ? (
                  <EmptyStateContainer onClick={(event) => handleMenuClick(event, 0)}>
                  <Typography variant="h6" gutterBottom>
                    No images added
                  </Typography>
                  <Typography variant="body1" marginBottom={2}>
                    Click anywhere to select your first image
                  </Typography>
                  <Fab
                    color="primary"
                    size="large"
                    component="label"
                  >
                    <Add />
                  </Fab>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => handleMenuClose(null)}
                  >
                    <MenuItem onClick={() => handleMenuClose("image")}>Add Image</MenuItem>
                    <MenuItem onClick={() => handleMenuClose("text")}>Add Text</MenuItem>
                  </Menu>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    id="file-input-0"
                    onChange={(event) => handleImageUpload(event, 0)}
                    multiple
                  />
                </EmptyStateContainer>
              ) : (
                <Box sx={{ position: "relative" }}>
                  <UploadButton
                    color="primary"
                    size="small"
                    component="label"
                    sx={{ marginTop: '16px', marginBottom: '16px' }}
                    onClick={(event) => handleMenuClick(event, 0)}
                  >
                    <Add />
                  </UploadButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => handleMenuClose(null)}
                  >
                    <MenuItem onClick={() => handleMenuClose("image")}>Add Image</MenuItem>
                    <MenuItem onClick={() => handleMenuClose("text")}>Add Text</MenuItem>
                  </Menu>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    id="file-input-0"
                    onChange={(event) => handleImageUpload(event, 0)}
                    multiple
                  />
        
                  {images.map((image, index) => (
                    <>
                      <ImageContainer ref={(el) => { imageRefs.current[index] = el; }}>
                        <ImageWrapper>
                          <img src={image.src} alt={`layer ${index + 1}`} style={{ width: "100%" }} />
                          <DeleteButton className="delete-button" onClick={() => deleteImage(index)}>
                            <Close />
                          </DeleteButton>
                          <EditButton className="edit-button" onClick={() => handleEditImage(index)}>
                            <Edit />
                          </EditButton>
                          <MoveUpButton className="move-up-button" onClick={() => moveImage(index, -1)}>
                            <ArrowUpward />
                          </MoveUpButton>
                          <MoveDownButton className="move-down-button" onClick={() => moveImage(index, 1)}>
                            <ArrowDownward />
                          </MoveDownButton>
                        </ImageWrapper>
                      </ImageContainer>
                      {index < images.length - 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px', marginBottom: '16px' }}>
                          <Fab
                            color="primary"
                            size="small"
                            component="label"
                            onClick={(event) => handleMenuClick(event, index + 1)}
                          >
                            <Add />
                          </Fab>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => handleMenuClose(null)}
                          >
                            <MenuItem onClick={() => handleMenuClose("image", index + 1)}>Add Image</MenuItem>
                            <MenuItem onClick={() => handleMenuClose("text", index + 1)}>Add Text</MenuItem>
                          </Menu>
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            id={`file-input-${index + 1}`}
                            onChange={(event) => handleImageUpload(event, index + 1)}
                            multiple
                          />
                        </Box>
                      )}
                    </>
                  ))}
        
                  <UploadButton
                    color="primary"
                    size="small"
                    component="label"
                    onClick={(event) => handleMenuClick(event, images.length)}
                  >
                    <Add />
                  </UploadButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => handleMenuClose(null)}
                  >
                    <MenuItem onClick={() => handleMenuClose("image", images.length)}>Add Image</MenuItem>
                    <MenuItem onClick={() => handleMenuClose("text", images.length)}>Add Text</MenuItem>
                  </Menu>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    id={`file-input-${images.length}`}
                    onChange={(event) => handleImageUpload(event, images.length)}
                    multiple
                  />
                </Box>
              )}
            </StepContainer>
          )}

          {activeStep === 1 && (
            <StepContainer>
              <Typography variant="h4" gutterBottom>
                Adjust Your Collage
              </Typography>
              <Typography variant="body1" gutterBottom textAlign="center">
                Fine-tune your collage by adjusting the border thickness.
              </Typography>
              
              <ThumbnailContainer>
                <CollageThumbnail src={collageBlob} alt="Collage Result" />
              </ThumbnailContainer>

              <BorderThicknessControl fullWidth>
                <InputLabel id="border-thickness-label">Border Thickness</InputLabel>
                <Select
                  labelId="border-thickness-label"
                  id="border-thickness-select"
                  value={borderThickness}
                  label="Border Thickness"
                  onChange={handleBorderChange}
                  fullWidth
                >
                  <MenuItem value={0}>No border</MenuItem>
                  <MenuItem value={5}>Thin</MenuItem>
                  <MenuItem value={15}>Medium</MenuItem>
                  <MenuItem value={30}>Thick</MenuItem>
                  <MenuItem value={65}>Extra Thick</MenuItem>
                </Select>
              </BorderThicknessControl>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 3 }}>
                <StepButton onClick={handleBack} startIcon={<ArrowBack />}>
                  Back
                </StepButton>
                <StepButton variant="contained" onClick={handleNext} endIcon={<ArrowForward />}>
                  Continue
                </StepButton>
              </Box>
            </StepContainer>
          )}

          {activeStep === 2 && (
            <StepContainer>
              <Typography variant="h4" gutterBottom>
                Your Collage is Ready!
              </Typography>
              <Typography variant="body1" gutterBottom textAlign="center">
                Save your collage or add captions to further customize it.
              </Typography>
              
              <ThumbnailContainer>
                <CollageThumbnail src={collageBlob} alt="Collage Result" />
              </ThumbnailContainer>

              <ResultOptionsContainer>
                <OptionGroup>
                  <StepButton
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={handleOpenInEditor}
                    fullWidth
                  >
                    Add Captions
                  </StepButton>
                  <StepButton
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    fullWidth
                  >
                    Save Collage
                  </StepButton>
                </OptionGroup>

                <StepButton
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  fullWidth
                >
                  Back
                </StepButton>
              </ResultOptionsContainer>
            </StepContainer>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </>
      )}

      <Dialog open={openSaveDialog} onClose={handleCloseSaveDialog}>
        <DialogTitle>Save Your Collage</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
            <CollageImage src={collageBlob} alt="Collage Result" sx={{ maxWidth: '100%', height: 'auto', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              To save your collage:
            </Typography>
            <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
              <li>{'ontouchstart' in window ? 'Tap and hold' : 'Right-click'} on the image above</li>
              <li>Select "Save image" from the menu</li>
              <li>Choose a location on your device to save the collage</li>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSaveDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </BasePage>
  );
 }