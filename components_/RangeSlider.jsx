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
        trackStyle={[{ backgroundColor: "#fb923c" }]}
        handleStyle={[
          { borderColor: "#fb923c", backgroundColor: "#fff" },
          { borderColor: "#fb923c", backgroundColor: "#fff" }
        ]}
        railStyle={{ backgroundColor: "rgb(251 146 60 / 64%)" }}
      />
    </>
  );
}
