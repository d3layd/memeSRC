import { forwardRef, memo, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import { css, styled } from '@mui/material/styles';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { TwitterPicker } from 'react-color';
import MuiAlert from '@mui/material/Alert';
import { Accordion, AccordionDetails, AccordionSummary, Backdrop, Button, Card, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Fab, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Popover, Slider, Snackbar, Stack, Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Add, AddCircleOutline, ArrowForward, ArrowForwardIos, AutoFixHigh, AutoFixHighRounded, CheckCircleOutline, Close, ContentCopy, Description, FormatAlignCenter, FormatAlignLeft, FormatAlignRight, FormatColorFill, GpsFixed, GpsNotFixed, HighlightOffRounded, History, HistoryToggleOffRounded, IosShare, Menu, More, PlusOne, Redo, Share, SupervisedUserCircle, Undo, Update, Verified, ZoomIn, ZoomOut } from '@mui/icons-material';
import { API, Storage } from 'aws-amplify';
import { Box } from '@mui/system';
import { Helmet } from 'react-helmet-async';
import { LoadingButton } from '@mui/lab';
import TextEditorControls from '../components/TextEditorControls';
import { SnackbarContext } from '../SnackbarContext';
import { UserContext } from '../UserContext';
import { MagicPopupContext } from '../MagicPopupContext';

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

const ParentContainer = styled('div')`
    height: 100%;
`;

const ColorPickerPopover = styled('div')({
})

const oImgBuild = path =>
  new Promise(resolve => {
    fabric.Image.fromURL(`https://memesrc.com${path}`, (oImg) => {
      resolve(oImg);
    }, { crossOrigin: "anonymous" });
  });

const loadImg = (paths, func) => Promise.all(paths.map(func));

const StyledCard = styled(Card)`
  
  border: 3px solid transparent;
  box-sizing: border-box;

  &:hover {
    border: 3px solid orange;
  }
`;

const StyledLayerControlCard = styled(Card)`
  width: 280px;
  border: 3px solid transparent;
  box-sizing: border-box;
  padding: 10px 15px;
`;

const StyledCardMedia = styled('img')`
  width: 100%;
  height: auto;
  background-color: black;
`;



const EditorPage = ({ setSeriesTitle, shows }) => {
  // Get everything ready
  const { fid } = useParams();
  const { user, setUser } = useContext(UserContext);
  const [defaultFrame, setDefaultFrame] = useState(null);
  const [pickingColor, setPickingColor] = useState(false);
  const [imageScale, setImageScale] = useState();
  const [generatedImageFilename, setGeneratedImageFilename] = useState();
  const [canvasSize, setCanvasSize] = useState({
    // width: 500,
    // height: 500
  });
  const [fineTuningFrames, setFineTuningFrames] = useState([]);
  const [canvasObjects, setCanvasObjects] = useState();
  const [surroundingFrames, setSurroundingFrames] = useState();
  const [selectedFid, setSelectedFid] = useState(fid);
  const [defaultSubtitle, setDefaultSubtitle] = useState(null);
  const [colorPickerShowing, setColorPickerShowing] = useState(false);
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
  const [colorPickerColor, setColorPickerColor] = useState({
    r: '0',
    g: '0',
    b: '0',
    a: '100'
  });
  const [fontSizePickerShowing, setFontSizePickerShowing] = useState(false);
  const [fontSizePickerAnchor, setFontSizePickerAnchor] = useState(null);
  const [selectedFontSize, setSelectedFontSize] = useState(100);

  const [editorAspectRatio, setEditorAspectRatio] = useState(1);

  const [loading, setLoading] = useState(true)

  const [fineTuningValue, setFineTuningValue] = useState(4);
  const [episodeDetails, setEpisodeDetails] = useState();
  const [openDialog, setOpenDialog] = useState(false);
  const [imageUploading, setImageUploading] = useState();
  const [imageBlob, setImageBlob] = useState();
  const [shareImageFile, setShareImageFile] = useState();
  const [snackbarOpen, setSnackBarOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [loadedSeriesTitle, setLoadedSeriesTitle] = useState('_universal');
  const [drawingMode, setDrawingMode] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState('Everyday scene as cinematic cinestill sample')  // , Empty, Nothing, Plain, Vacant, Desolate, Void, Barren, Uninhabited, Abandoned, Unoccupied, Untouched, Clear, Blank, Pristine, Unmarred
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadingInpaintingResult, setLoadingInpaintingResult] = useState(false);
  const { setSeverity, setMessage, setOpen } = useContext(SnackbarContext);
  const [editorTool, setEditorTool] = useState('');
  const [brushToolSize, setBrushToolSize] = useState(50);
  const [showBrushSize, setShowBrushSize] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [editorStates, setEditorStates] = useState([]);
  const [futureStates, setFutureStates] = useState([]);
  const [bgEditorStates, setBgEditorStates] = useState([]);
  const [bgFutureStates, setBgFutureStates] = useState([]);
  const [loadingFineTuningFrames, setLoadingFineTuningFrames] = useState(true);
  const [earlyAccessLoading, setEarlyAccessLoading] = useState(false);

  const [variationDisplayColumns, setVariationDisplayColumns] = useState(1);

  const [earlyAccessComplete, setEarlyAccessComplete] = useState(false);
  const [earlyAccessDisabled, setEarlyAccessDisabled] = useState(false);
  const [loadingSubscriptionUrl, setLoadingSubscriptionUrl] = useState(false);

  const [subtitlesExpanded, setSubtitlesExpanded] = useState(false);
  const [promptEnabled, setPromptEnabled] = useState('erase');
  const buttonRef = useRef(null);
  const { magicToolsPopoverAnchorEl, setMagicToolsPopoverAnchorEl } = useContext(MagicPopupContext)

  // Image selection stuff
  const [selectedImage, setSelectedImage] = useState(null);
  const [openSelectResult, setOpenSelectResult] = useState(false);
  // const images = Array(5).fill("https://placekitten.com/350/350");
  const isMd = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const [returnedImages, setReturnedImages] = useState([]);

  const handleSubtitlesExpand = () => {
    setSubtitlesExpanded(!subtitlesExpanded);
  };

  const handleSnackbarOpen = () => {
    setSnackBarOpen(true);
  }

  const handleSnackbarClose = () => {
    setSnackBarOpen(false);
  }

  useEffect(() => {
    if (shows.length > 0) {
      console.log(loadedSeriesTitle);
      setSeriesTitle(loadedSeriesTitle);
    }
  }, [shows, loadedSeriesTitle])

  const { selectedObjects, editor, onReady } = useFabricJSEditor()

  const StyledTwitterPicker = styled(TwitterPicker)`
    span div {
        border: 1px solid rgb(240, 240, 240);
    }`;

  const TwitterPickerWrapper = memo(StyledTwitterPicker);

  const navigate = useNavigate();
  const location = useLocation();

  const handleClickDialogOpen = () => {
    setOpenDialog(true);
    saveImage();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  // Canvas resizing
  const resizeCanvas = useCallback((width, height) => {
    if (editor) {
      console.log('Resized the canvas');
      editor.canvas.preserveObjectStacking = true;
      editor?.canvas.setWidth(width);
      editor?.canvas.setHeight(height);
      editor?.canvas.setBackgroundColor("white");
    }
  }, [editor])

  // Update the editor size
  const updateEditorSize = useCallback(() => {
    console.log()
    const [desiredHeight, desiredWidth] = calculateEditorSize(editorAspectRatio);
    // Calculate scale factor
    const scaleFactorX = desiredWidth / canvasSize.width;
    const scaleFactorY = desiredHeight / canvasSize.height;
    const scaleFactor = Math.min(scaleFactorX, scaleFactorY)
    // Scale the canvas
    editor?.canvas.setZoom(scaleFactor);
    // Resize the canvas
    resizeCanvas(desiredWidth, desiredHeight);
    setCanvasObjects([...editor?.canvas._objects])
    editor?.canvas.renderAll();
  }, [editor, canvasSize, editorAspectRatio, resizeCanvas]);

  // useEffect(() => {
  //     navigate(`/editor/${selectedFid}`)
  // }, [selectedFid, navigate])

  // Warm up the UUID function for faster save dialog response
  useEffect(() => {
    API.get('publicapi', '/uuid', { queryStringParameters: { warmup: true } })
  }, [])

  useEffect(() => {
    setSelectedFid(fid)
  }, [location, fid, editor])

  useEffect(() => {
    if (imageLoaded) {
      window.addEventListener('resize', updateEditorSize)
    }
    return () => {
      window.removeEventListener('resize', updateEditorSize)
    }
  }, [updateEditorSize, imageLoaded])

  const getSessionID = async () => {
    let sessionID;
    if ("sessionID" in sessionStorage) {
      sessionID = sessionStorage.getItem("sessionID");
      return Promise.resolve(sessionID);
    }
    return API.get('publicapi', '/uuid')
      .then(generatedSessionID => {
        sessionStorage.setItem("sessionID", generatedSessionID);
        return generatedSessionID;
      })
      .catch(err => {
        console.log(`UUID Gen Fetch Error:  ${err}`);
        throw err;
      });
  };

  const addText = useCallback((updatedText, append) => {
    const text = new fabric.Textbox(updatedText, {
      left: editor?.canvas.getWidth() * 0.05,
      top: editor?.canvas.getHeight() * (append ? 0.5 : 0.95),
      originY: 'bottom',
      width: editor?.canvas.getWidth() * 0.9,
      fontSize: editor?.canvas.getWidth() * 0.04,
      fontFamily: 'sans-serif',
      fontWeight: 900,
      fill: 'white',
      stroke: 'black',
      strokeLineJoin: 'round',
      strokeWidth: editor?.canvas.getWidth() * 0.0040,
      strokeUniform: false,
      textAlign: 'center',
      selectable: true,
      paintFirst: 'stroke'
    });
    if (editor) {
      if (append) {
        editor?.canvas.add(text);
        addToHistory();
        setCanvasObjects([...editor.canvas._objects]);
      } else {
        editor.canvas._objects = [];
        editor?.canvas.add(text);
        addToHistory();
        setCanvasObjects([...editor.canvas._objects]);
      }
    }
  }, [editor]);

  const loadEditorDefaults = useCallback(() => {
    getSessionID().then(sessionId => {
      setLoading(true)
      const queryStringParams = { queryStringParameters: { fid: selectedFid, sessionId } }
      API.get('publicapi', '/frame', queryStringParams).then(data => {
        console.log('test')
        console.log(data)
        setLoadedSeriesTitle(data.series_name);
        setSurroundingFrames(data.frames_surrounding);
        const episodeDetails = selectedFid.split('-');
        setEpisodeDetails(episodeDetails);
        // Pre load fine tuning frames
        loadImg(data.frames_fine_tuning, oImgBuild).then((images) => {
          setFineTuningFrames(images)
        });
        // Background image from the 
        fabric.Image.fromURL(`https://memesrc.com${data.frame_image}`, (oImg) => {
          console.log(oImg)
          setDefaultFrame(oImg);
          setDefaultSubtitle(data.subtitle);
          setLoading(false)
        }, { crossOrigin: "anonymous" });
      }).catch(err => console.log(err))
    }).catch(err => console.log(err))
  }, [resizeCanvas, selectedFid, editor, addText])

  // Look up data for the fid and set defaults
  useEffect(() => {
    // if (editor) { editor.canvas._objects = [] }
    loadEditorDefaults();
    // TODO: BUG - it appears our setup for loading the editor requires it to run twice. Look into fixing this.
  }, [selectedFid]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editor) {
      updateEditorSize();
    }
  }, [canvasSize])

  useEffect(() => {
    if (defaultFrame) {
      const oImg = defaultFrame
      const imageAspectRatio = oImg.width / oImg.height;
      setEditorAspectRatio(imageAspectRatio);
      const [desiredHeight, desiredWidth] = calculateEditorSize(imageAspectRatio);
      setCanvasSize({ height: desiredHeight, width: desiredWidth })  // TODO: rename this to something like "desiredSize"
      // Scale the image to fit the canvas
      oImg.scale(desiredWidth / oImg.width);
      // Center the image within the canvas
      oImg.set({ left: 0, top: 0 });
      const minWidth = 750;
      const x = (oImg.width > minWidth) ? oImg.width : minWidth;
      setImageScale(x / desiredWidth);
      resizeCanvas(desiredWidth, desiredHeight)
      editor?.canvas.setBackgroundImage(oImg);
      addText(defaultSubtitle, false);
      setImageLoaded(true)
    }
  }, [defaultFrame, defaultSubtitle])

  // Calculate the desired editor size
  const calculateEditorSize = (aspectRatio) => {
    const containerElement = document.getElementById('canvas-container');
    const availableWidth = containerElement.offsetWidth;
    const calculatedWidth = availableWidth;
    const calculatedHeight = availableWidth / aspectRatio;
    return [calculatedHeight, calculatedWidth]
  }

  // Handle events
  // const saveProject = () => {
  //     const canvasJson = editor.canvas.toJSON(['hoverCursor', 'selectable']);
  //     const key = selectedFid ? `project-${selectedFid}` : 'project-example';
  //     localStorage.setItem(key, JSON.stringify(canvasJson));
  // };

  // const loadProject = () => {
  //     const key = selectedFid ? `project-${selectedFid}` : 'project-example';
  //     const canvasJson = localStorage.getItem(key);
  //     editor.canvas.loadFromJSON(canvasJson, () => {
  //         editor.canvas.backgroundImage.scaleToHeight(canvasSize.height);
  //         editor.canvas.backgroundImage.scaleToWidth(canvasSize.width);
  //         editor.canvas.renderAll();
  //     });
  //     updateEditorSize();
  // };

  // const addImage = () => {
  //     fabric.Image.fromURL('/assets/illustrations/illustration_avatar.png', (oImg) => {
  //         editor?.canvas.add(oImg);
  //     })
  // }

  const saveImage = () => {
    setImageUploading(true);
    const resultImage = editor.canvas.toDataURL({
      format: 'jpeg',
      quality: 0.6,
      multiplier: imageScale
    });

    fetch(resultImage)
      .then(res => res.blob())
      .then(blob => {
        setImageBlob(blob);
        API.get('publicapi', '/uuid').then(uuid => {
          console.log(`GOT THIS UUID: ${JSON.stringify(uuid)}`)
          const filename = `${uuid}.jpg`
          setGeneratedImageFilename(filename)
          Storage.put(`${uuid}.jpg`, blob, {
            resumable: true,
            contentType: "image/jpeg",
            completeCallback: (event) => {
              Storage.get(event.key).then(() => {
                // setGeneratedImage(image);
                const file = new File([blob], filename, { type: 'image/jpeg' });
                setShareImageFile(file);
                setImageUploading(false);
              })
            },
            progressCallback: (progress) => {
              console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
            },
            errorCallback: (err) => {
              console.error('Unexpected error while uploading', err);
            }
          })
        }).catch(err => console.log(`UUID Gen Fetch Error:  ${err}`));
      })
  }

  const showColorPicker = (event, index) => {
    setPickingColor(index);
    setColorPickerShowing(index);
    setColorPickerAnchor(event.target);
  }

  const showFontSizePicker = (event, index) => {
    const defaultFontSize = editor.canvas.getWidth() * 0.04;
    const currentFontSize = Math.round(100 * editor.canvas.item(index).fontSize / defaultFontSize);
    setSelectedFontSize(currentFontSize);
    setFontSizePickerShowing(index);
    setFontSizePickerAnchor(event.target);
  }

  const changeColor = (color, index) => {
    setColorPickerColor(color);
    editor.canvas.item(index).set('fill', color.hex);
    console.log(`Length of object:  + ${selectedObjects.length}`)
    setCanvasObjects([...editor.canvas._objects])
    console.log(editor.canvas.item(index));
    editor?.canvas.renderAll();
    setColorPickerShowing(false);
  }

  const handleEdit = (event, index) => {
    console.log(event)
    console.log(index)
    editor.canvas.item(index).set('text', event.target.value);
    console.log(`Length of object:  + ${selectedObjects.length}`)
    setCanvasObjects([...editor.canvas._objects])
    console.log(editor.canvas.item(index));
    editor?.canvas.renderAll();
  }

  const handleFocus = (index) => {
    editor.canvas.setActiveObject(editor.canvas.item(index));
    editor?.canvas.renderAll();
  }

  const handleFontSize = (event, index) => {
    const defaultFontSize = editor.canvas.getWidth() * 0.04;
    editor.canvas.item(index).fontSize = defaultFontSize * (event.target.value / 100);
    setCanvasObjects([...editor.canvas._objects])
    console.log(editor.canvas.item(index));
    editor?.canvas.renderAll();
  }

  const handleFineTuning = (event) => {
    console.log(fineTuningFrames[event.target.value]);
    const oImg = fineTuningFrames[event.target.value];
    oImg.scaleToHeight(editor.canvas.getHeight());
    oImg.scaleToWidth(editor.canvas.getWidth());
    editor?.canvas?.setBackgroundImage(oImg);
    editor?.canvas.renderAll();
    const serializedCanvas = JSON.stringify(editor.canvas);
    setFutureStates([]);
    setBgFutureStates([]);

    setEditorStates(prevHistory => [...prevHistory, serializedCanvas]);
    setBgEditorStates(prevHistory => [...prevHistory, oImg]);
  }

  const handleStyle = (index, customStyles) => {
    // Select the item
    const item = editor.canvas.item(index);
    // Update the style
    item.fontWeight = customStyles.includes('bold') ? 900 : 400
    item.fontStyle = customStyles.includes('italic') ? 'italic' : 'normal'
    item.underline = customStyles.includes('underlined')
    // Update the canvas
    editor.canvas.item(index).dirty = true;
    setCanvasObjects([...editor.canvas._objects]);
    console.log(editor.canvas.item(index));
    editor?.canvas.renderAll();
  }


  const deleteLayer = (index) => {
    editor.canvas.remove(editor.canvas.item(index));
    setCanvasObjects([...editor.canvas._objects]);
    editor?.canvas.renderAll();
    addToHistory();
  }

  // ------------------------------------------------------------------------

  const toggleDrawingMode = (tool) => {
    if (editor) {
      if (user && user?.userDetails?.credits > 0) {
        editor.canvas.isDrawingMode = (tool === 'magicEraser');
        editor.canvas.freeDrawingBrush.width = brushToolSize;
        editor.canvas.freeDrawingBrush.color = 'red';
        if (tool !== 'magicEraser') {
          editor.canvas.getObjects().forEach((obj) => {
            if (obj instanceof fabric.Path) {
              editor.canvas.remove(obj)
            }
          });
        }
      }
    }
    setDrawingMode((tool === 'magicEraser'))
  }

  const downloadDataURL = (dataURL, fileName) => {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = fileName;
    // Simulate a click to start the download
    link.click();
  };

  const exportDrawing = async () => {
    setLoadingInpaintingResult(true)
    const originalCanvas = editor.canvas;

    // let fabricImage = null;

    const tempCanvasDrawing = new fabric.Canvas();
    tempCanvasDrawing.setWidth(1024);
    tempCanvasDrawing.setHeight(1024);

    // const solidRect = new fabric.Rect({
    //     left: 0,
    //     top: 0,
    //     width: tempCanvasDrawing.getWidth(),
    //     height: tempCanvasDrawing.getHeight(),
    //     fill: 'black',
    //     selectable: false,
    //     evented: false,
    // });

    tempCanvasDrawing.backgroundColor = 'black'

    // tempCanvasDrawing.add(solidRect);

    const originalHeight = editor.canvas.height
    const originalWidth = editor.canvas.width

    const scale = Math.min(1024 / originalWidth, 1024 / originalHeight);
    const offsetX = (1024 - originalWidth * scale) / 2;
    const offsetY = (1024 - originalHeight * scale) / 2;

    originalCanvas.getObjects().forEach((obj) => {
      if (obj instanceof fabric.Path) {
        const path = obj.toObject();
        const newPath = new fabric.Path(path.path, { ...path, fill: 'transparent', globalCompositeOperation: 'destination-out' });
        newPath.scale(scale);
        newPath.set({ left: newPath.left * scale + offsetX, top: newPath.top * scale + offsetY });
        tempCanvasDrawing.add(newPath);
      }

      // if (obj instanceof fabric.Image) {
      //     fabricImage = obj;
      // }


    });

    const dataURLDrawing = tempCanvasDrawing.toDataURL({
      format: 'png',
      left: 0,
      top: 0,
      width: tempCanvasDrawing.getWidth(),
      height: tempCanvasDrawing.getHeight(),
    });
    const backgroundImage = { ...editor.canvas.backgroundImage };

    const newBackgroundImage = new fabric.Image(editor.canvas.backgroundImage.getElement())

    console.log(newBackgroundImage)
    const imageWidth = backgroundImage.width
    const imageHeight = backgroundImage.height
    const imageScale = Math.min(1024 / imageWidth, 1024 / imageHeight);
    const imageOffsetX = (1024 - imageWidth * imageScale) / 2;
    const imageOffsetY = (1024 - imageHeight * imageScale) / 2;

    tempCanvasDrawing.clear();

    tempCanvasDrawing.backgroundColor = 'black'

    newBackgroundImage.scale(imageScale)
    newBackgroundImage.set({ left: imageOffsetX, top: imageOffsetY });
    tempCanvasDrawing.add(newBackgroundImage)
    const dataURLBgImage = tempCanvasDrawing.toDataURL('image/png');


    // Delay the downloads using setTimeout
    // setTimeout(() => {
    //     downloadDataURL(dataURLBgImage, 'background_image.png');
    // }, 500);

    // setTimeout(() => {
    //     downloadDataURL(dataURLDrawing, 'drawing.png');
    // }, 1000);

    if (dataURLBgImage && dataURLDrawing) {
      //   const dataURLBgImage = fabricImage.toDataURL('image/png');

      const data = {
        image: dataURLBgImage,
        mask: dataURLDrawing,
        prompt: magicPrompt,
      };

      // Delay the downloads using setTimeout
      //   setTimeout(() => {
      //     downloadDataURL(dataURLBgImage, 'background_image.png');
      //   }, 500);

      //   setTimeout(() => {
      //     downloadDataURL(dataURLDrawing, 'drawing.png');
      //   }, 1000);

      try {
        const response = await API.post('publicapi', '/inpaint', {
          body: data
        });

        // Assume the backend sends an imageURL property in the response.
        const imageUrls = response.imageUrls;
        setReturnedImages([...returnedImages, ...imageUrls])
        setLoadingInpaintingResult(false)
        setOpenSelectResult(true)
        const newCreditAmount = user?.userDetails.credits - 1
        setUser({ ...user, userDetails: { ...user?.userDetails, credits: newCreditAmount } })

        console.log(`response: ${response}`)
        console.log(response)
        console.log(`imageUrl: ${imageUrls}`)
      } catch (error) {
        setLoadingInpaintingResult(false)
        if (error.response?.data?.error?.name === "InsufficientCredits") {
          setSeverity('error')
          setMessage('Insufficient Credits')
          setOpen(true)
          originalCanvas.getObjects().forEach((obj) => {
            if (obj instanceof fabric.Path) {
              editor.canvas.remove(obj)
            }
          });
        }
        console.log(error.response.data);
      }
    }
  };

  const handleAddCanvasBackground = async (imgUrl) => {
    setOpenSelectResult(false)
    // Fetch the image as a blob from the given URL.
    const imageResponse = await fetch(imgUrl);
    const imageBlob = await imageResponse.blob();
    setSelectedImage()
    setReturnedImages([])

    // Convert the blob to a data URL so fabric can use it.
    const reader = new FileReader();
    reader.readAsDataURL(imageBlob);
    reader.onloadend = () => {
      const base64data = reader.result;
      console.log(base64data)
      fabric.Image.fromURL(base64data, (returnedImage) => {
        const originalHeight = editor.canvas.height
        const originalWidth = editor.canvas.width

        const scale = Math.min(1024 / originalWidth, 1024 / originalHeight);
        returnedImage.scale(1 / scale)
        editor.canvas.setBackgroundImage(returnedImage)
        setBgEditorStates(prevHistory => [...prevHistory, returnedImage]);
        editor.canvas.backgroundImage.center()
        editor.canvas.renderAll();
      }, { crossOrigin: "anonymous" });

      // setTimeout(() => {
      //   setSeverity('success')
      //   setMessage(`Image Generation Successful! Remaining credits: ${newCreditAmount}`)
      //   setOpen(true)
      //   setEditorTool();
      //   setMagicPrompt('Everyday scene as cinestill sample, Empty, Nothing, Plain, Vacant, Desolate, Void, Barren, Uninhabited, Abandoned, Unoccupied, Untouched, Clear, Blank, Pristine, Unmarred')
      //   setPromptEnabled('erase')
      // }, 500);
      setEditorTool();
      setMagicPrompt('Everyday scene as cinestill sample, Empty, Nothing, Plain, Vacant, Desolate, Void, Barren, Uninhabited, Abandoned, Unoccupied, Untouched, Clear, Blank, Pristine, Unmarred')
      setPromptEnabled('erase')
      // setImageSrc(response.imageData);
    }
  }

  const handleSelectResultCancel = () => {
    setSelectedImage()
    setReturnedImages([])
    setOpenSelectResult(false)
  }

  const handleBrushToolSize = (size) => {
    if (editor) {
      setBrushToolSize(size);
      editor.canvas.freeDrawingBrush.width = size;
    }
  }

  // function ValueLabelComponent(props) {
  //   const { children, open, value } = props;

  //   return (
  //     <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
  //     <Box 
  //       sx={{ 
  //         width: value, 
  //         height: value, 
  //         borderRadius: '50%', 
  //         backgroundColor: 'red',
  //         display: 'flex'
  //       }}
  //     >
  //       {value}
  //     </Box>
  //     </Tooltip>
  //   );
  // }

  const addToHistory = () => {
    console.log('there was a change')

    const serializedCanvas = JSON.stringify(editor.canvas);
    const backgroundImage = editor.canvas.backgroundImage;

    // Clear future states as the path has now changed due to new action
    setFutureStates([]);
    setBgFutureStates([]);

    setEditorStates(prevHistory => [...prevHistory, serializedCanvas]);
    setBgEditorStates(prevHistory => [...prevHistory, backgroundImage]);
  }

  const undo = () => {
    if (editorStates.length <= 1) return; // Ensure there's at least one state to go back to

    // Move the latest action to futureStates before going back
    setFutureStates(prevFuture => [editorStates[editorStates.length - 1], ...prevFuture]);
    setBgFutureStates(prevFuture => [bgEditorStates[bgEditorStates.length - 1], ...prevFuture]);

    // Go back in history
    setEditorStates(prevHistory => prevHistory.slice(0, prevHistory.length - 1));
    setBgEditorStates(prevHistory => prevHistory.slice(0, prevHistory.length - 1));

    // Load the previous state into the canvas
    editor.canvas.loadFromJSON(editorStates[editorStates.length - 2], () => {
      // After loading the state, set the background image
      editor.canvas.setBackgroundImage(bgEditorStates[bgEditorStates.length - 2], () => {
        editor.canvas.renderAll.bind(editor.canvas)()
        setCanvasObjects([...editor.canvas._objects]);
      });
    });
  }

  const redo = () => {
    if (futureStates.length === 0) return; // Ensure there's at least one state to go forward to

    // Move the first future state back to editorStates
    setEditorStates(prevHistory => [...prevHistory, futureStates[0]]);
    setBgEditorStates(prevHistory => [...prevHistory, bgFutureStates[0]]);

    // Remove the state we've just moved from futureStates
    setFutureStates(prevFuture => prevFuture.slice(1));
    setBgFutureStates(prevFuture => prevFuture.slice(1));

    // Load the restored state into the canvas
    editor.canvas.loadFromJSON(futureStates[0], () => {
      // After loading the state, set the background image
      editor.canvas.setBackgroundImage(bgFutureStates[0], () => {
        editor.canvas.renderAll.bind(editor.canvas)()
        setCanvasObjects([...editor.canvas._objects]);
      });
    });
  }

  useEffect(() => {
    console.log('there was a change to Canvas')
    if (editor && !editorLoaded) {
      setEditorLoaded(true)
      editor.canvas.on('object:modified', () => {
        addToHistory()
      })
      setBgEditorStates(prevHistory => [...prevHistory, editor.canvas.backgroundImage]);
    }
    console.log('there was a change to Canvas')
    if (editor && !editorLoaded) {
      setEditorLoaded(true)
      editor.canvas.on('path:created', () => {
        addToHistory()
      })
      setBgEditorStates(prevHistory => [...prevHistory, editor.canvas.backgroundImage]);
    }
  }, [editor])

  useEffect(() => {
    console.log(editorStates)
  }, [editorStates])

  const loadFineTuningFrames = () => {
    if (loadingFineTuningFrames) {
      setTimeout(() => {
        setLoadingFineTuningFrames(false)
      }, [1000])
    }
  }

  // This is going to handle toggling our default prompt and no prompt when the user switches between erase and fill.
  useEffect(() => {
    if (promptEnabled === "fill") {
      setMagicPrompt('')
    } else {
      setMagicPrompt('Everyday scene as cinestill sample, Empty, Nothing, Plain, Vacant, Desolate, Void, Barren, Uninhabited, Abandoned, Unoccupied, Untouched, Clear, Blank, Pristine, Unmarred')
    }
  }, [promptEnabled])

  useEffect(() => {
    setPromptEnabled('erase')
    setMagicPrompt('Everyday scene as cinestill sample, Empty, Nothing, Plain, Vacant, Desolate, Void, Barren, Uninhabited, Abandoned, Unoccupied, Untouched, Clear, Blank, Pristine, Unmarred')
  }, [editorTool])

  // ------------------------------------------------------------------------


  // Outputs
  return (
    <>
      <Helmet>
        <title>Edit • memeSRC</title>
      </Helmet>
      <ParentContainer sx={{ padding: { xs: 1.5, md: 2 } }} id="parent-container">
        <Grid container justifyContent="center">
          <Grid
            container
            item
            xs={12}
            md={8}
            minWidth={{ xs: {}, md: '98vw', lg: '1200px' }}
            justifyContent="center"
            marginBottom={8.3}
          >
            <Card sx={{ padding: { xs: 1.5, md: 2 } }}>
              <Grid container item spacing={2} justifyContent="center">
                <Grid item xs={12} md={7} lg={7} order="1">
                  <Grid container item mb={1.5}>
                    <Grid item xs={12}>
                      <Stack direction='row' width='100%' justifyContent='space-between'>
                        <IconButton size='small' disabled={(editorStates.length <= 1)} onClick={undo}>
                          <History />
                        </IconButton>
                        <IconButton size='small' disabled={(futureStates.length === 0)} onClick={redo}>
                          <Update />
                        </IconButton>
                      </Stack>
                    </Grid>
                  </Grid>
                  <div style={{ width: '100%', padding: 0, margin: 0, boxSizing: 'border-box', position: 'relative' }} id="canvas-container">
                    <FabricJSCanvas onReady={onReady} />
                    {showBrushSize &&
                      <div style={{
                        width: brushToolSize,
                        height: brushToolSize,
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        background: 'red',
                        borderColor: 'black',
                        borderStyle: 'solid',
                        borderWidth: '1px',
                        boxShadow: '0 7px 10px rgba(0, 0, 0, 0.75)'
                      }} />
                    }
                  </div>
                </Grid>
                <Grid item xs={12} md={5} lg={5} minWidth={{ xs: {}, md: '350px' }} order={{ xs: 3, md: 2 }}>
                  {/* {user && user.userDetails?.credits > 0 && (
                    <Grid item xs={12} marginBottom={2}>
                      <Grid container direction="column" spacing={2}>
                        {drawingMode ? (
                          <>
                            <Grid item>
                              <TextField
                                fullWidth
                                id="prompt"
                                label="Prompt"
                                variant="outlined"
                                value={magicPrompt}
                                onChange={(event) => setMagicPrompt(event.target.value)}
                              />
                            </Grid>
                            <Grid item>
                              <Button
                                variant="contained"
                                onClick={() => {
                                  exportDrawing();
                                  toggleDrawingMode();
                                }}
                                fullWidth
                                sx={{ zIndex: '50' }}
                                startIcon={<AutoFixHighRounded />}
                              >
                                Magic Brush (apply)
                              </Button>
                            </Grid>
                          </>
                        ) : (
                          <Grid item>
                            <Button
                              variant="contained"
                              onClick={toggleDrawingMode}
                              fullWidth
                              sx={{ zIndex: '50' }}
                              startIcon={<AutoFixHighRounded />}
                            >
                              Magic Brush (select)
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  )} */}
                  <Grid item xs={12} marginBottom={2}>
                    <Button
                      variant="contained"
                      onClick={handleClickDialogOpen}
                      fullWidth
                      sx={{ zIndex: '50' }}
                      startIcon={<Share />}
                    >
                      Save/Copy/Share
                    </Button>
                  </Grid>
                  <Grid item xs={12} marginBottom={2}>
                    <Button
                      variant="contained"
                      onClick={() => addText('text', true)}
                      fullWidth
                      sx={{ zIndex: '50' }}
                      startIcon={<AddCircleOutline />}
                    >
                      Add Layer
                    </Button>
                  </Grid>

                  <Grid
                    container
                    item
                    xs={12}
                    maxHeight={{ xs: {}, md: `${canvasSize.height - 104}px` }}
                    paddingX={{ xs: 0, md: 2 }}
                    sx={{ overflowY: 'scroll', overflow: 'auto' }}
                    flexDirection="col-reverse"
                  >
                    {canvasObjects &&
                      canvasObjects.map(
                        (object, index) =>
                          'text' in object && (
                            <Grid item xs={12} order={`-${index}`} key={`grid${index}`}>
                              <Card sx={{ marginBottom: '20px', padding: '10px' }} key={`card${index}`}>
                                <div style={{ display: 'inline', position: 'relative' }} key={`div${index}`}>
                                  {/* <button type='button' key={`button${index}`} onClick={(event) => showColorPicker(event, index)}>Change Color</button> */}
                                  <TextEditorControls
                                    showColorPicker={(event) => showColorPicker(event, index)}
                                    colorPickerShowing={colorPickerShowing}
                                    index={index}
                                    showFontSizePicker={(event) => showFontSizePicker(event, index)}
                                    fontSizePickerShowing={fontSizePickerShowing}
                                    key={`togglebuttons${index}`}
                                    handleStyle={handleStyle}
                                  />
                                </div>
                                <Fab
                                  size="small"
                                  aria-label="add"
                                  sx={{
                                    position: 'absolute',
                                    backgroundColor: theme.palette.background.paper,
                                    boxShadow: 'none',
                                    top: '11px',
                                    right: '9px',
                                  }}
                                  onClick={() => deleteLayer(index)}
                                  key={`fab${index}`}
                                >
                                  <HighlightOffRounded color="error" />
                                </Fab>
                                <TextField
                                  size="small"
                                  key={`textfield${index}`}
                                  multiline
                                  type="text"
                                  value={canvasObjects[index].text}
                                  fullWidth
                                  onFocus={() => handleFocus(index)}
                                  onBlur={addToHistory}
                                  onChange={(event) => handleEdit(event, index)}
                                />
                                {/* <Typography gutterBottom >
                                                        Font Size
                                                    </Typography>
                                                    <Slider
                                                        size="small"
                                                        defaultValue={100}
                                                        min={1}
                                                        max={200}
                                                        aria-label="Small"
                                                        valueLabelDisplay="auto"
                                                        onChange={(event) => handleFontSize(event, index)}
                                                        onFocus={() => handleFocus(index)}
                                                        key={`slider${index}`}
                                                    /> */}
                              </Card>
                            </Grid>
                          )
                      )}
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={7}
                  lg={7}
                  marginRight={{ xs: '', md: 'auto' }}
                  marginTop={{ xs: -2.5, md: -1.5 }}
                  order={{ xs: 4, md: 4 }}
                >
                  <Card>
                    <Accordion expanded={subtitlesExpanded} disableGutters>
                      <AccordionSummary sx={{ paddingX: 1.55 }} onClick={handleSubtitlesExpand} textAlign="center">
                        <Typography marginRight="auto" fontWeight="bold" color="#CACACA" fontSize={14.8}>
                          {subtitlesExpanded ? (
                            <Close style={{ verticalAlign: 'middle', marginTop: '-3px', marginRight: '10px' }} />
                          ) : (
                            <Menu style={{ verticalAlign: 'middle', marginTop: '-3px', marginRight: '10px' }} />
                          )}
                          {subtitlesExpanded ? 'Hide' : 'View'} Nearby Subtitles
                        </Typography>
                        {/* <Chip size="small" label="New!" color="success" /> */}
                      </AccordionSummary>
                      <AccordionDetails sx={{ paddingY: 0, paddingX: 0 }}>
                        <List sx={{ padding: '.5em 0' }}>
                          {surroundingFrames &&
                            surroundingFrames
                              .filter(
                                (result, index, array) =>
                                  result?.subtitle &&
                                  (index === 0 ||
                                    result?.subtitle.replace(/\n/g, ' ') !==
                                    array[index - 1].subtitle.replace(/\n/g, ' '))
                              )
                              .map((result) => (
                                <ListItem key={result?.id} disablePadding sx={{ padding: '0 0 .6em 0' }}>
                                  <ListItemIcon sx={{ paddingLeft: '0' }}>
                                    <Fab
                                      size="small"
                                      sx={{
                                        backgroundColor: theme.palette.background.paper,
                                        boxShadow: 'none',
                                        marginLeft: '5px',
                                        '&:hover': {
                                          xs: { backgroundColor: 'inherit' },
                                          md: {
                                            backgroundColor:
                                              result?.subtitle.replace(/\n/g, ' ') ===
                                                defaultSubtitle?.replace(/\n/g, ' ')
                                                ? 'rgba(0, 0, 0, 0)'
                                                : 'ButtonHighlight',
                                          },
                                        },
                                      }}
                                      onClick={() => navigate(`/editor/${result?.fid}`)}
                                    >
                                      {loading ? (
                                        <CircularProgress size={20} sx={{ color: '#565656' }} />
                                      ) : result?.subtitle.replace(/\n/g, ' ') ===
                                        defaultSubtitle.replace(/\n/g, ' ') ? (
                                        <GpsFixed
                                          sx={{
                                            color:
                                              result?.subtitle.replace(/\n/g, ' ') ===
                                                defaultSubtitle?.replace(/\n/g, ' ')
                                                ? 'rgb(202, 202, 202)'
                                                : 'rgb(89, 89, 89)',
                                            cursor: 'pointer',
                                          }}
                                        />
                                      ) : (
                                        <GpsNotFixed sx={{ color: 'rgb(89, 89, 89)', cursor: 'pointer' }} />
                                      )}
                                    </Fab>
                                  </ListItemIcon>
                                  <ListItemText sx={{ color: 'rgb(173, 173, 173)', fontSize: '4em' }}>
                                    <Typography
                                      component="p"
                                      variant="body2"
                                      color={
                                        result?.subtitle.replace(/\n/g, ' ') === defaultSubtitle?.replace(/\n/g, ' ')
                                          ? 'rgb(202, 202, 202)'
                                          : ''
                                      }
                                      fontWeight={
                                        result?.subtitle.replace(/\n/g, ' ') === defaultSubtitle?.replace(/\n/g, ' ')
                                          ? 700
                                          : 400
                                      }
                                    >
                                      {result?.subtitle.replace(/\n/g, ' ')}
                                    </Typography>
                                  </ListItemText>
                                  <ListItemIcon sx={{ paddingRight: '0', marginLeft: 'auto' }}>
                                    <Fab
                                      size="small"
                                      sx={{
                                        backgroundColor: theme.palette.background.paper,
                                        boxShadow: 'none',
                                        marginRight: '2px',
                                        '&:hover': {
                                          xs: { backgroundColor: 'inherit' },
                                          md: { backgroundColor: 'ButtonHighlight' },
                                        },
                                      }}
                                      onClick={() => {
                                        navigator.clipboard.writeText(result?.subtitle.replace(/\n/g, ' '));
                                        handleSnackbarOpen();
                                      }}
                                    >
                                      <ContentCopy sx={{ color: 'rgb(89, 89, 89)' }} />
                                    </Fab>
                                    <Fab
                                      size="small"
                                      sx={{
                                        backgroundColor: theme.palette.background.paper,
                                        boxShadow: 'none',
                                        marginLeft: 'auto',
                                        '&:hover': {
                                          xs: { backgroundColor: 'inherit' },
                                          md: { backgroundColor: 'ButtonHighlight' },
                                        },
                                      }}
                                      onClick={() => addText(result?.subtitle.replace(/\n/g, ' '), true)}
                                    >
                                      <Add sx={{ color: 'rgb(89, 89, 89)', cursor: 'pointer' }} />
                                    </Fab>
                                    {/* <Fab
                                                                            size="small"
                                                                            sx={{
                                                                                backgroundColor: theme.palette.background.paper,
                                                                                boxShadow: "none",
                                                                                marginLeft: '5px',
                                                                                '&:hover': {xs: {backgroundColor: 'inherit'}, md: {backgroundColor: (result?.subtitle.replace(/\n/g, " ") === defaultSubtitle?.replace(/\n/g, " ")) ? 'rgba(0, 0, 0, 0)' : 'ButtonHighlight'}}
                                                                            }}
                                                                            onClick={() => navigate(`/editor/${result?.fid}`)}
                                                                        >
                                                                        {loading ? (
                                                                            <CircularProgress size={20} sx={{ color: "#565656"}} />
                                                                        ) : (
                                                                            (result?.subtitle.replace(/\n/g, " ") === defaultSubtitle.replace(/\n/g, " ")) ? <GpsFixed sx={{ color: (result?.subtitle.replace(/\n/g, " ") === defaultSubtitle?.replace(/\n/g, " ")) ? 'rgb(50, 50, 50)' : 'rgb(89, 89, 89)', cursor: "pointer"}} /> : <ArrowForward sx={{ color: "rgb(89, 89, 89)", cursor: "pointer"}} /> 
                                                                        )}
                                                                        </Fab> */}
                                  </ListItemIcon>
                                </ListItem>
                              ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  </Card>
                </Grid>
                <Grid item xs={12} md={7} lg={7} marginRight={{ xs: '', md: 'auto' }} order={{ xs: 2, md: 3 }}>
                  {/* Fine Tuning Code */}
                  {/* <Stack spacing={2} direction="row" alignItems={'center'}>
                      <Tooltip title="Fine Tuning">
                        <IconButton>
                          <HistoryToggleOffRounded alt="Fine Tuning" />
                        </IconButton>
                      </Tooltip>
                      <Slider
                        size="small"
                        defaultValue={4}
                        min={0}
                        max={8}
                        value={fineTuningValue}
                        aria-label="Small"
                        valueLabelDisplay="auto"
                        onChange={(event) => {
                          handleFineTuning(event);
                          setFineTuningValue(event.target.value);
                        }}
                        valueLabelFormat={(value) => `Fine Tuning: ${((value - 4) / 10).toFixed(1)}s`}
                        marks
                        track={false}
                      />
                    </Stack> */}

                  <Card sx={{ width: '100%', px: 1, py: 1 }}>
                    <Stack width='100%' display='flex'>
                      <ToggleButtonGroup
                        value={editorTool}
                        exclusive
                        onChange={(event, value) => {
                          setEditorTool(value)
                          toggleDrawingMode(value)
                        }}
                        aria-label="text alignment"
                        size='small'
                        sx={{ mx: { xs: 'auto' } }}
                      >
                        <ToggleButton size='small' onClick={loadFineTuningFrames} value="fineTuning" aria-label="centered">
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <HistoryToggleOffRounded alt="Fine Tuning" fontSize='small' />
                            <Typography variant='body2'>
                              Fine Tuning
                            </Typography>
                          </Stack>
                        </ToggleButton>
                        <ToggleButton size='small' onClick={(event) => { if (!user || user?.userDetails?.credits <= 0) { setMagicToolsPopoverAnchorEl(event.currentTarget); setEditorTool('') } }} value={(user && user?.userDetails?.credits > 0) ? "magicEraser" : "none"} aria-label="right aligned">
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <AutoFixHighRounded alt="Magic Eraser" fontSize='small' />
                            <Typography variant='body2'>
                              Magic Tools
                            </Typography>
                          </Stack>
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Stack>
                    {editorTool === 'fineTuning' &&
                      <>
                        {loadingFineTuningFrames ?
                          <Stack direction='row' justifyContent='center' alignItems='center' spacing={2} sx={{ mt: 2 }}>
                            <CircularProgress size={30} />
                            <Typography variant='body1'>
                              Loading frames...
                            </Typography>
                          </Stack>
                          :
                          <Slider
                            size="small"
                            defaultValue={4}
                            min={0}
                            max={8}
                            value={fineTuningValue}
                            aria-label="Small"
                            valueLabelDisplay="auto"
                            onChange={(event) => {
                              handleFineTuning(event);
                              setFineTuningValue(event.target.value);
                            }}
                            valueLabelFormat={(value) => `Fine Tuning: ${((value - 4) / 10).toFixed(1)}s`}
                            marks
                            track={false}
                            sx={{ mt: 2 }}
                          />
                        }
                      </>
                    }
                    {editorTool === 'magicEraser' &&
                      <>
                        <Tabs
                          value={promptEnabled}
                          onChange={(event, value) => { setPromptEnabled(value) }}
                          centered
                          TabIndicatorProps={{
                            style: {
                              backgroundColor: 'limegreen',
                              top: '60px',  // Adjusts the position of the indicator
                              height: '3px' // Adjusts the thickness of the indicator
                            }
                          }}
                        >
                          <Tab value="erase" label="Eraser" icon={<AutoFixHigh fontSize='small' />} iconPosition='start' style={{ color: promptEnabled === 'erase' ? 'limegreen' : undefined }} />
                          <Tab value="fill" label="Fill" icon={<FormatColorFill fontSize='small' />} iconPosition='start' style={{ color: promptEnabled === 'fill' ? 'limegreen' : undefined }} />
                        </Tabs>


                        <Stack direction='row' alignItems='center' spacing={2} sx={{ mt: 2 }}>
                          <Slider
                            size="small"
                            min={1}
                            max={100}
                            value={brushToolSize}
                            aria-label="Small"
                            valueLabelDisplay='auto'
                            sx={{
                              marginRight: 0.5
                            }}
                            onChange={(event) => {
                              setShowBrushSize(true)
                              handleBrushToolSize(event.target.value);
                            }}
                            onChangeCommitted={() => {
                              setShowBrushSize(false)
                            }}
                            // valueLabelFormat={(value) => `Fine Tuning: ${((value - 4) / 10).toFixed(1)}s`}
                            // marks
                            track={false}
                          />
                          <Button variant='contained' onClick={() => {
                            setEditorTool()
                            toggleDrawingMode('fineTuning')
                          }}>
                            Cancel
                          </Button>
                          <Button 
                              variant='contained' 
                              style={{ backgroundColor: 'limegreen', color: 'white' }} // green background with white text
                              onClick={
                                  () => {
                                    exportDrawing();
                                    toggleDrawingMode('fineTuning');
                                  }
                              }>
                              Apply
                          </Button>
                        </Stack>
                        {promptEnabled === "fill" &&
                          <TextField
                            value={magicPrompt}
                            onChange={(event) => {
                              setMagicPrompt(event.target.value);
                            }}
                            fullWidth
                            sx={{
                              mt: 3,
                              '& .MuiInputLabel-root.Mui-focused': { // targets label when focused
                                color: 'limegreen',
                              },
                              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { // targets border when focused
                                borderColor: 'limegreen',
                              },
                            }}
                            label='Magic Fill Prompt'
                          />

                        }
                      </>

                    }
                  </Card>

                  {/* <button type='button' onClick={addImage}>Add Image</button>
                                    <button type='button' onClick={saveProject}>Save Project</button>
                                    <button type='button' onClick={loadProject}>Load Project</button>
                                    <button type='button' onClick={handleClickDialogOpen}>Save Image</button> */}
                </Grid>
                <Grid container item spacing={1} order="5">
                  {surroundingFrames &&
                    surroundingFrames.map((result) => (
                      <Grid item xs={4} sm={4} md={12 / 9} key={result?.fid}>
                        <a style={{ textDecoration: 'none' }}>
                          <StyledCard style={{ border: fid === result?.fid ? '3px solid orange' : '' }}>
                            {/* {console.log(`${fid} = ${result?.fid}`)} */}
                            <StyledCardMedia
                              component="img"
                              src={`https://memesrc.com${result?.frame_image}`}
                              alt={result?.subtitle}
                              title={result?.subtitle}
                              onClick={() => {
                                editor.canvas._objects = [];
                                setSelectedFid(result?.fid);
                                navigate(`/editor/${result?.fid}`);
                                setFineTuningValue(4);
                              }}
                            />
                          </StyledCard>
                        </a>
                      </Grid>
                    ))}
                  <Grid item xs={12}>
                    {episodeDetails && (
                      <Button
                        variant="contained"
                        fullWidth
                        href={`/episode/${episodeDetails[0]}/${episodeDetails[1]}/${episodeDetails[2]}/${episodeDetails[3]}`}
                      >
                        View Episode
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>

        <Popover
          open={colorPickerShowing !== false}
          anchorEl={colorPickerAnchor}
          onClose={() => setColorPickerShowing(false)}
          id="colorPicker"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <ColorPickerPopover>
            <TwitterPickerWrapper
              onChangeComplete={(color) => changeColor(color, pickingColor)}
              color={colorPickerColor}
              colors={[
                '#FFFFFF',
                'yellow',
                'black',
                'orange',
                '#8ED1FC',
                '#0693E3',
                '#ABB8C3',
                '#EB144C',
                '#F78DA7',
                '#9900EF',
              ]}
              width="280px"
            // TODO: Fix background color to match other cards
            />
          </ColorPickerPopover>
        </Popover>

        <Popover
          open={fontSizePickerShowing !== false}
          anchorEl={fontSizePickerAnchor}
          onClose={() => setFontSizePickerShowing(false)}
          id="colorPicker"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <StyledLayerControlCard>
            <Typography variant="body1">Font Size</Typography>
            <Slider
              size="small"
              defaultValue={selectedFontSize}
              min={1}
              max={400}
              aria-label="Small"
              valueLabelDisplay="auto"
              onChange={(event) => handleFontSize(event, fontSizePickerShowing)}
              onFocus={() => handleFocus(fontSizePickerShowing)}
            />
          </StyledLayerControlCard>
        </Popover>

        <Dialog
          open={openDialog}
          onClose={handleDialogClose}
          aria-labelledby="responsive-dialog-title"
          fullWidth
          PaperProps={{ sx: { xs: { minWidth: '85vw' }, sm: { minWidth: '85vw' }, md: { minWidth: '85vw' } } }}
          BackdropProps={{ style: { backgroundColor: 'rgb(33, 33, 33, 0.9)' } }}
        >
          <DialogTitle id="responsive-dialog-title">Save Image</DialogTitle>
          <DialogContent
            sx={{
              flex: 'none',
              marginTop: 'auto',
              overflow: 'hidden',
              overflowY: 'hidden',
              paddingBottom: 2,
              paddingLeft: '12px',
              paddingRight: '12px',
            }}
          >
            <DialogContentText sx={{ marginTop: 'auto', marginBottom: 'auto' }}>
              {!imageUploading && (
                <img
                  src={`https://i${process.env.REACT_APP_USER_BRANCH === 'prod' ? 'prod' : `-${process.env.REACT_APP_USER_BRANCH}`
                    }.memesrc.com/${generatedImageFilename}`}
                  alt="generated meme"
                />
              )}
              {imageUploading && (
                <center>
                  <CircularProgress sx={{ margin: '30%' }} />
                </center>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogContentText sx={{ paddingX: 4, marginTop: 'auto', paddingBottom: 2 }}>
            <center>
              <p>
                ☝️ <b>{'ontouchstart' in window ? 'Tap and hold' : 'Right click'} the image to save</b>, or use a
                quick action:
              </p>
            </center>
          </DialogContentText>
          <DialogActions sx={{ marginBottom: 'auto', display: 'inline-flex', padding: '0 23px' }}>
            <Box display="grid" width="100%">
              {navigator.canShare && (
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ marginBottom: 2, padding: '12px 16px' }}
                  disabled={imageUploading}
                  onClick={() => {
                    navigator.share({
                      title: 'memeSRC.com',
                      text: 'Check out this meme I made on memeSRC.com',
                      files: [shareImageFile],
                    });
                  }}
                  startIcon={<IosShare />}
                >
                  Share
                </Button>
              )}
              <Button
                variant="contained"
                fullWidth
                sx={{ marginBottom: 2, padding: '12px 16px' }}
                disabled={imageUploading}
                autoFocus
                onClick={() => {
                  const { ClipboardItem } = window;
                  navigator.clipboard.write([new ClipboardItem({ 'image/png': imageBlob })]);
                  handleSnackbarOpen();
                }}
                startIcon={<ContentCopy />}
              >
                Copy
              </Button>
              <Button
                variant="contained"
                color="error"
                fullWidth
                sx={{ marginBottom: 2, padding: '12px 16px' }}
                autoFocus
                onClick={handleDialogClose}
                startIcon={<Close />}
              >
                Close
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      </ParentContainer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        severity="success"
        onClose={handleSnackbarClose}
        message="Copied to clipboard!"
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Copied to clipboard!
        </Alert>
      </Snackbar>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, width: '100vw', height: '100vh' }}
        open={loadingInpaintingResult}
      >
        <Stack alignItems="center" direction="column" spacing={2}>
          <CircularProgress color="inherit" />
          <Typography variant="h5">Generating images...</Typography>
        </Stack>
      </Backdrop>

      <Dialog
      open={openSelectResult}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth='md'
      PaperProps={{ style: { margin: '8px', padding: '10px' } }}
    >
      <DialogTitle id="alert-dialog-title">
        {"Magic Results"}
        <div style={{ fontSize: '0.8em', marginTop: '5px' }}>Pick the best variation:</div>
      </DialogTitle>
      <DialogContent style={{ padding: 0 }}>  {/* Reduced padding */}
        <Grid container>
          {returnedImages?.map((image, index) => (
            <Grid 
              item xs={variationDisplayColumns === 2 ? 6 : 12} 
              key={image} 
              onClick={() => setSelectedImage(image)} 
              style={{ padding: '5px' }}
            >
              <div style={{ 
                position: 'relative', 
                border: selectedImage === image ? '2px solid green' : '2px solid lightgray', 
                borderRadius: '4px' 
              }}>
                <img
                  src={image}
                  alt="placeholder"
                  style={{ 
                    width: '100%', 
                    aspectRatio: `${editorAspectRatio}/1`, 
                    objectFit: 'cover', 
                    objectPosition: 'center',
                    filter: selectedImage && selectedImage !== image ? 'brightness(50%)' : 'none'
                  }}
                />
                {selectedImage === image && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                    }}
                  >
                    <CheckCircleOutline
                      style={{ color: 'green', fontSize: 40 }}
                    />
                  </div>
                )}
              </div>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions style={{ padding: '8px 16px' }}>
        <Button 
          variant='contained' 
          onClick={() => {
            setEditorTool()
            toggleDrawingMode('fineTuning')
            handleSelectResultCancel()
          }}
        >
          Cancel
        </Button>
        <Button 
          disabled={!selectedImage}
          onClick={() => { handleAddCanvasBackground(selectedImage) }}
          variant='contained'
          style={{
            backgroundColor: 'limegreen',
            color: 'white',
            opacity: selectedImage ? 1 : 0.5, // Adjust opacity based on selectedImage
            cursor: selectedImage ? 'pointer' : 'not-allowed', // Change cursor style
          }}
        >
          Apply
        </Button>
      </DialogActions>

      <Fab 
          size="small"  // Makes the FAB smaller
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: '#333', // Dark background color
            color: '#fff', // White text color
            boxShadow: 'none', // Remove box shadow (if any)
        }}
          onClick={() => setVariationDisplayColumns(prev => (prev === 2 ? 1 : 2))}
      >
          {variationDisplayColumns === 2 ? <ZoomIn /> : <ZoomOut />}
      </Fab>
    </Dialog>
    </>
  );
}

export default EditorPage
