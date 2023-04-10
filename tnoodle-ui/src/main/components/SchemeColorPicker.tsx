import "./SchemeColorPicker.css";
import { ColorResult, SketchPicker } from 'react-color';
import { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

interface SchemeColorPickerProps {
    defaultColors: string[];
    colorKey: string;
    colorValue: string,
    onColorChange(hexColor: string): void;
}

const SchemeColorPicker = ({defaultColors, colorKey, colorValue, onColorChange}: SchemeColorPickerProps) => {
    const [color, setColor] = useState(colorValue)

    const handleColorChange = (color: ColorResult) => {
        setColor(color.hex)
        onColorChange(color.hex)
    }

    return (
        <OverlayTrigger
            trigger={"click"}
            rootClose
            placement={"bottom"}
            overlay={
                <Tooltip>
                    <SketchPicker
                        disableAlpha={true}
                        color={color}
                        presetColors={defaultColors}
                        onChangeComplete={handleColorChange}
                    />
                </Tooltip>
            }>
            <span
                className={"color-bubble"}
                style={{backgroundColor: color}}
            >
                {colorKey}
            </span>
        </OverlayTrigger>
    );
};

export default SchemeColorPicker;
