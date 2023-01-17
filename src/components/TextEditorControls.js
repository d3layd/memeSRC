import * as React from 'react';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function TextEditorControls(props) {
    const [formats, setFormats] = React.useState(() => ['bold']);

    const handleFormat = (event, newFormats) => {
        setFormats(newFormats);
        props.handleStyle(props.index, newFormats);
    };

    return (
        <ToggleButtonGroup
            value={formats}
            onChange={handleFormat}
            aria-label="text formatting"
            size='small'
        >
            <ToggleButton value="bold" aria-label="bold">
                <FormatBoldIcon />
            </ToggleButton>
            <ToggleButton value="italic" aria-label="italic">
                <FormatItalicIcon />
            </ToggleButton>
            <ToggleButton value="underlined" aria-label="underlined">
                <FormatUnderlinedIcon />
            </ToggleButton>
            <ToggleButton value="color" aria-label="color" selected={(props.colorPickerShowing === props.index)} onClick={props.showColorPicker}>
                <FormatColorFillIcon />
                <ArrowDropDownIcon />
            </ToggleButton>
        </ToggleButtonGroup>
    );
}