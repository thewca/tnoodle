import "./SchemeColorPicker.css";
import { ColorResult, SketchPicker } from "react-color";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useSelector } from "react-redux";
import RootState from "../model/RootState";

interface SchemeColorPickerProps {
    defaultColors: string[];
    colorKey: string;
    colorValue: string;
    onColorChange(hexColor: string): void;
}

const SchemeColorPicker = ({
    defaultColors,
    colorKey,
    colorValue,
    onColorChange,
}: SchemeColorPickerProps) => {
    const generatingScrambles = useSelector(
        (state: RootState) => state.scramblingSlice.generatingScrambles
    );

    const handleColorChange = (color: ColorResult) => {
        onColorChange(color.hex);
    };

    return (
        <OverlayTrigger
            trigger={"click"}
            rootClose
            placement={"bottom"}
            overlay={
                <Tooltip className={"bg-transparent"}>
                    <SketchPicker
                        disableAlpha={true}
                        color={colorValue}
                        presetColors={defaultColors}
                        onChangeComplete={handleColorChange}
                    />
                </Tooltip>
            }
        >
            <span
                className={"color-bubble"}
                style={{ backgroundColor: colorValue, pointerEvents: generatingScrambles ? 'none' : 'inherit' }}
            >
                {colorKey}
            </span>
        </OverlayTrigger>
    );
};

export default SchemeColorPicker;
