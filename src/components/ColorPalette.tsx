import { useState } from 'react';
import './ColorPalette.css';

interface ColorSwatch {
  color: string;
  hex: string;
}

interface ColorPaletteProps {
  colors: ColorSwatch[];
  onColorsChange?: (colors: ColorSwatch[]) => void;
  maxColors?: number;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors,
  onColorsChange,
  maxColors = 8
}) => {
  const [newColor, setNewColor] = useState('#000000');

  const handleAddColor = () => {
    if (colors.length < maxColors) {
      const newColorSwatch: ColorSwatch = {
        color: newColor,
        hex: newColor
      };
      onColorsChange?.([...colors, newColorSwatch]);
    }
  };

  const handleRemoveColor = (indexToRemove: number) => {
    const updatedColors = colors.filter((_, index) => index !== indexToRemove);
    onColorsChange?.(updatedColors);
  };

  const handleColorChange = (index: number, newColorValue: string) => {
    const updatedColors = colors.map((color, i) =>
      i === index
        ? { ...color, color: newColorValue, hex: newColorValue }
        : color
    );
    onColorsChange?.(updatedColors);
  };

  return (
    <div className="color-palette">
      <div className="color-swatches">
        {colors.map((colorSwatch, index) => (
          <div key={index} className="color-swatch">
            <div
              className="color-preview"
              style={{ backgroundColor: colorSwatch.color }}
              onClick={() => {
                // Allow clicking to edit color
                const input = document.createElement('input');
                input.type = 'color';
                input.value = colorSwatch.color;
                input.onchange = (e) => {
                  handleColorChange(index, (e.target as HTMLInputElement).value);
                };
                input.click();
              }}
            />
            <div className="color-hex">{colorSwatch.hex}</div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default ColorPalette;