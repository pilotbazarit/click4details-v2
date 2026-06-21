import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function RangeSlider({budget, setBudget, step = 10000, maxValue = 500000000}) {

  return (
    <>
      <Slider
        range
        min={0}
        max={maxValue}
        step={step}
        value={budget}
        onChange={setBudget}
        allowCross={false}
        trackStyle={[{ backgroundColor: "#0469a3" }]}
        handleStyle={[
          { borderColor: "#0469a3", backgroundColor: "#fff" },
          { borderColor: "#0469a3", backgroundColor: "#fff" }
        ]}
        railStyle={{ backgroundColor: "rgb(4 105 163 / 30%)" }}
      />
    </>
  );
}
